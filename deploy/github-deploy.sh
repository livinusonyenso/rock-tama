#!/usr/bin/env bash
# Publish a GitHub release and run the existing deployment command over SSM.
set -euo pipefail

release=${GITHUB_SHA:?}
registry=${ROCKTAMA_REGISTRY:?}
instance=${ROCKTAMA_INSTANCE:?}
region=${AWS_REGION:?}
if [[ ! "$release" =~ ^[0-9a-f]{40}$ || "$(git rev-parse HEAD)" != "$release" ]]; then
  echo 'The checked-out commit does not match the GitHub release SHA' >&2
  exit 1
fi
if [[ "$(aws sts get-caller-identity --query Account --output text)" != "${ROCKTAMA_ACCOUNT:?}" ]]; then
  echo 'AWS credentials do not match the ROCK-TAMA staging account' >&2
  exit 1
fi

missing=()
for image in api web db-bootstrap edge; do
  result=$(aws ecr batch-get-image --repository-name "rocktama/$image" --image-ids "imageTag=$release" --output json)
  if jq -e '.images | length == 1' <<<"$result" >/dev/null; then
    printf 'Reusing existing immutable image rocktama/%s:%s\n' "$image" "$release"
  elif jq -e '.failures | length == 1 and .[0].failureCode == "ImageNotFound"' <<<"$result" >/dev/null; then
    missing+=("$image")
  else
    printf 'Unable to check rocktama/%s in ECR\n' "$image" >&2
    jq '.failures' <<<"$result" >&2
    exit 1
  fi
done

if (( ${#missing[@]} )); then
  export RELEASE_PLATFORM=linux/amd64
  deploy/build-release.sh "$registry" "${missing[@]}"
  aws ecr get-login-password | docker login --username AWS --password-stdin "$registry"
  trap 'docker logout "$registry" >/dev/null 2>&1 || true' EXIT
  for image in "${missing[@]}"; do
    docker push "$registry/rocktama/$image:$release"
  done
fi

# The host uses its existing instance role for the pull. Runner credentials stay on GitHub.
commands=$(printf 'release=%q\nregistry=%q\nregion=%q\n' "$release" "$registry" "$region"
cat <<'HOST'
set -eu
cd /opt/rocktama
current=$(cat current-release)
if ! printf '%s\n' "$current" | grep -Eq '^[0-9a-f]{40}$'; then
  echo 'Invalid current EC2 release' >&2
  exit 1
fi
if [ "$current" = "$release" ]; then
  printf 'Release %s is already current\n' "$release"
  exit 0
fi
DOCKER_CONFIG=$(mktemp -d /run/rocktama-ecr.XXXXXX)
export DOCKER_CONFIG
trap 'rm -f "$DOCKER_CONFIG/config.json"; rmdir "$DOCKER_CONFIG"' EXIT
aws ecr get-login-password --region "$region" | docker login --username AWS --password-stdin "$registry" >/dev/null
"releases/$current/ec2/deploy.sh" "$release"
HOST
)
parameters=$(jq -cn --arg script "$commands" '{commands: [$script], executionTimeout: ["1200"]}')
command_id=$(aws ssm send-command --instance-ids "$instance" --document-name AWS-RunShellScript \
  --comment "Deploy ROCK-TAMA $release" --parameters "$parameters" --query Command.CommandId --output text)
printf 'SSM command %s\n' "$command_id"

# The standard CLI waiter times out after about 100 seconds, which can be shorter than a deployment.
for ((attempt = 0; attempt < 135; attempt++)); do
  if ! invocation=$(aws ssm get-command-invocation --command-id "$command_id" --instance-id "$instance" --output json 2>&1); then
    if [[ "$invocation" != *InvocationDoesNotExist* ]]; then
      printf '%s\n' "$invocation" >&2
      exit 1
    fi
  else
    state=$(jq -r .Status <<<"$invocation")
    case "$state" in
      Pending|InProgress|Delayed|Cancelling) ;;
      *)
        jq -r '.StandardOutputContent, .StandardErrorContent' <<<"$invocation"
        printf 'SSM deployment status %s\n' "$state"
        if [[ "$state" == Success ]]; then exit 0; fi
        exit 1
        ;;
    esac
  fi
  sleep 10
done
printf 'Timed out waiting for SSM command %s\n' "$command_id" >&2
exit 1
