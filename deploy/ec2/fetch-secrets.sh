#!/bin/bash
# Write staging secrets into /opt/rocktama/secrets (D-136). --local-init is for a fresh, single-host staging DB.
# Parameters (SecureString): /rocktama/staging/{bootstrap,migrator,api}-password. The instance role may read only
# /rocktama/staging/*. Files are 0444 inside a root-only 0700 directory; Compose mounts each file read-only.
set -euo pipefail
umask 077
dir=/opt/rocktama/secrets
case "${1-}" in
  '') method=ssm ;;
  --local-init) method=local ;;
  *) echo 'Usage: fetch-secrets.sh [--local-init]' >&2; exit 1 ;;
esac
if [[ "$method" == local ]]; then
  if [[ -e "$dir" || -L "$dir" ]]; then
    [[ -d "$dir" && ! -L "$dir" && "$(stat -c '%a:%u' "$dir")" == 700:0 ]] || { echo 'Existing secret directory has unsafe ownership or permissions' >&2; exit 1; }
    for file in bootstrap-password migrator-password api-password migrator-url api-url; do
      [[ -s "$dir/$file" && ! -L "$dir/$file" ]] || { echo 'Existing staging secrets are incomplete; preserve them and investigate' >&2; exit 1; }
    done
    echo 'Existing staging secrets retained'
    exit 0
  fi
  for data in /srv/rocktama/postgres /opt/rocktama/data/postgres; do
    if [[ -d "$data" && -n "$(find "$data" -mindepth 1 -print -quit)" ]]; then
      echo 'Database data already exists; restore its credentials before deploying' >&2
      exit 1
    fi
  done
fi
stage=$(mktemp -d /opt/rocktama/.secrets.XXXXXX)
trap 'rm -rf "$stage"' EXIT
for role in bootstrap migrator api; do
  if [[ "$method" == local ]]; then
    openssl rand -hex 24 > "$stage/$role-password"
  else
    aws ssm get-parameter --name "/rocktama/staging/$role-password" --with-decryption \
      --query Parameter.Value --output text > "$stage/$role-password"
  fi
  test -s "$stage/$role-password" || { echo "Empty parameter: $role-password" >&2; exit 1; }
done
for role in migrator api; do
  printf 'postgresql://rocktama_%s:%s@db:5432/rocktama\n' "$role" "$(cat "$stage/$role-password")" > "$stage/$role-url"
done
chmod 0444 "$stage"/*
if [[ "$method" == local ]]; then
  mv -T "$stage" "$dir"
  echo 'Staging secrets initialized'
  exit 0
fi
install -d -m 0700 "$dir"
for file in "$stage"/*; do mv -f "$file" "$dir/"; done
echo "Secrets written to $dir: $(ls "$dir" | tr '\n' ' ')"
