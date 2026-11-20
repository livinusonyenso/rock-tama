#!/bin/bash
# Switch the EC2 staging stack to a release, or roll back (D-136).
#   deploy.sh <full-git-sha>   deploy that release (images must already be in ECR)
#   deploy.sh rollback         redeploy the previous release
# Needs /opt/rocktama/site.env with REGISTRY, SHOP_HOST and API_HOST (no secrets).
set -euo pipefail
cd /opt/rocktama
. ./site.env
: "${REGISTRY:?}" "${SHOP_HOST:?}" "${API_HOST:?}"
mountpoint -q /srv/rocktama || { echo "Data volume is not mounted at /srv/rocktama" >&2; exit 1; }

target=${1:?usage: deploy.sh <git-sha>|rollback}
if [ "$target" = rollback ]; then target=$(cat previous-release); fi
[[ "$target" =~ ^[0-9a-f]{40}$ ]] || { echo "Release must be a full 40-character Git SHA" >&2; exit 1; }

# 1. Take this release's compose file and scripts from its edge image (immutable tag in ECR).
release_dir=releases/$target
if [ ! -f "$release_dir/compose.staging.yml" ]; then
  mkdir -p "$release_dir"
  docker pull --quiet "$REGISTRY/rocktama/edge:$target" >/dev/null
  docker run --rm --entrypoint tar "$REGISTRY/rocktama/edge:$target" -C /deploy -cf - . | tar -C "$release_dir" -xf -
fi
printf 'REGISTRY=%s\nRELEASE=%s\nSHOP_HOST=%s\nAPI_HOST=%s\n' "$REGISTRY" "$target" "$SHOP_HOST" "$API_HOST" > "$release_dir/release.env"
compose() { docker compose --project-name rocktama --env-file "$release_dir/release.env" -f "$release_dir/compose.staging.yml" "$@"; }

# 2. Pull every image first, so a missing image fails before anything stops.
compose pull --quiet

# 3. Logical backup before changing anything, if a database is already running.
if docker ps --format '{{.Names}}' | grep -qx rocktama-db-1; then
  backup=/srv/rocktama/backups/rocktama-$(date -u +%Y%m%dT%H%M%SZ)-before-${target:0:12}.dump
  docker exec rocktama-db-1 pg_dump -U rocktama_bootstrap -Fc rocktama > "$backup"
  chmod 0600 "$backup"
  echo "Backup: $backup ($(stat -c %s "$backup") bytes)"
  ls -1t /srv/rocktama/backups/*.dump | tail -n +15 | xargs -r rm -f   # keep the 14 newest
fi

# 4. Start: db → db-bootstrap → migrate → api → web → caddy, each gated on health or success.
compose up -d --remove-orphans --wait --wait-timeout 300
if [ -f current-release ] && [ "$(cat current-release)" != "$target" ]; then cp current-release previous-release; fi
echo "$target" > current-release
compose ps -a
echo "Deployed release $target"
