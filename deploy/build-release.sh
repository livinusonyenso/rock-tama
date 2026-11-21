#!/bin/sh
# Build immutable release images for one Git commit. Local only: nothing is pushed.
# Usage: RELEASE_PLATFORM=linux/amd64 deploy/build-release.sh [registry] [api web db-bootstrap edge]
# The tag is the full commit SHA. ECR tags are immutable, so one tag always means one build.
set -eu
root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
cd "$root"

if [ -n "$(git status --porcelain)" ]; then
  echo "Refusing to build a release from uncommitted changes. Commit first." >&2
  exit 1
fi
release=$(git rev-parse HEAD)
created=$(git show -s --format=%cI HEAD)
prefix=${1:+$1/}
if [ "$#" -gt 0 ]; then shift; fi
if [ "$#" -eq 0 ]; then set -- api web db-bootstrap edge; fi
platform=${RELEASE_PLATFORM:-linux/arm64}
case "$platform" in linux/arm64|linux/amd64) ;; *) echo 'Unsupported release platform' >&2; exit 1 ;; esac
for image do
  case "$image" in api|web|db-bootstrap|edge) ;; *) printf 'Unknown release image: %s\n' "$image" >&2; exit 1 ;; esac
done

build() { # name context dockerfile [build args...]
  name=$1 context=$2 dockerfile=$3; shift 3
  docker buildx build --platform "$platform" --load --provenance=false \
    --label "org.opencontainers.image.revision=$release" \
    --label "org.opencontainers.image.created=$created" \
    --label "org.opencontainers.image.title=rocktama-$name" \
    --file "$dockerfile" --tag "${prefix}rocktama/$name:$release" "$@" "$context"
}

for image do
  case "$image" in
    api) build api backend backend/Dockerfile --target production ;;
    web) build web frontend frontend/Dockerfile ;;
    db-bootstrap) build db-bootstrap backend/db backend/db/Dockerfile ;;
    edge) build edge deploy deploy/Caddy.staging.Dockerfile ;;
  esac
done

printf '%s\n' "Built release $release:"
for name do
  docker image inspect --format "  ${prefix}rocktama/$name:$release  {{.Id}}  {{.Architecture}}" "${prefix}rocktama/$name:$release"
done
