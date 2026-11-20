#!/bin/bash
# Write the staging secrets from SSM Parameter Store into /opt/rocktama/secrets (D-136). Never prints values.
# Parameters (SecureString): /rocktama/staging/{bootstrap,migrator,api}-password. The instance role may read only
# /rocktama/staging/*. Files are 0444 inside a root-only 0700 directory; Compose mounts each file read-only.
set -euo pipefail
umask 077
dir=/opt/rocktama/secrets
stage=$(mktemp -d /opt/rocktama/.secrets.XXXXXX)
trap 'rm -rf "$stage"' EXIT
for role in bootstrap migrator api; do
  aws ssm get-parameter --name "/rocktama/staging/$role-password" --with-decryption \
    --query Parameter.Value --output text > "$stage/$role-password"
  test -s "$stage/$role-password" || { echo "Empty parameter: $role-password" >&2; exit 1; }
done
for role in migrator api; do
  printf 'postgresql://rocktama_%s:%s@db:5432/rocktama\n' "$role" "$(cat "$stage/$role-password")" > "$stage/$role-url"
done
chmod 0444 "$stage"/*
install -d -m 0700 "$dir"
for file in "$stage"/*; do mv -f "$file" "$dir/"; done
echo "Secrets written to $dir: $(ls "$dir" | tr '\n' ' ')"
