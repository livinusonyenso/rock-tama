#!/bin/bash
# Switch the EC2 staging stack to a release, or roll back (D-136).
#   deploy.sh <full-git-sha> [api-image-digest-ref]   deploy that release
#   deploy.sh rollback         redeploy the previous release
# Needs /opt/rocktama/site.env with REGISTRY, SHOP_HOST and API_HOST (no secrets). DATA_ROOT is optional.
set -euo pipefail
cd /opt/rocktama
. ./site.env
: "${REGISTRY:?}" "${SHOP_HOST:?}" "${API_HOST:?}"
data_root=${DATA_ROOT:-/srv/rocktama}
case "$data_root" in
  /srv/rocktama) mountpoint -q "$data_root" || { echo "Data volume is not mounted at $data_root" >&2; exit 1; } ;;
  /opt/rocktama/data) test -d "$data_root" && test ! -L "$data_root" || { echo "Expected an existing $data_root directory" >&2; exit 1; } ;;
  *) echo 'Unexpected DATA_ROOT' >&2; exit 1 ;;
esac
test -d "$data_root/postgres" && test ! -L "$data_root/postgres" || { echo 'Expected an existing PostgreSQL data directory' >&2; exit 1; }

target=${1:?usage: deploy.sh <git-sha>|rollback}
if [ "$target" = rollback ]; then target=$(cat previous-release); fi
[[ "$target" =~ ^[0-9a-f]{40}$ ]] || { echo "Release must be a full 40-character Git SHA" >&2; exit 1; }
api_image=${2-}

# 1. Take this release's compose file and scripts from its edge image (immutable tag in ECR).
release_dir=releases/$target
if [ ! -f "$release_dir/compose.staging.yml" ]; then
  mkdir -p "$release_dir"
  docker pull --quiet "$REGISTRY/rocktama/edge:$target" >/dev/null
  docker run --rm --entrypoint tar "$REGISTRY/rocktama/edge:$target" -C /deploy -cf - . | tar -C "$release_dir" -xf -
fi
if [[ -z "$api_image" && -f "$release_dir/release.env" ]]; then
  api_image=$(sed -n 's/^API_IMAGE=//p' "$release_dir/release.env")
fi
if [[ -n "$api_image" ]]; then
  digest=${api_image#"$REGISTRY/rocktama/api@sha256:"}
  [[ "$digest" != "$api_image" && "$digest" =~ ^[0-9a-f]{64}$ ]] || { echo 'API override must be an API digest from this ECR registry' >&2; exit 1; }
fi
printf 'REGISTRY=%s\nRELEASE=%s\nSHOP_HOST=%s\nAPI_HOST=%s\nDATA_ROOT=%s\nAPI_IMAGE=%s\n' \
  "$REGISTRY" "$target" "$SHOP_HOST" "$API_HOST" "$data_root" "$api_image" > "$release_dir/release.env"
compose() { docker compose --project-name rocktama --env-file "$release_dir/release.env" -f "$release_dir/compose.staging.yml" "$@"; }

# 2. Pull every image first, so a missing image fails before anything stops.
compose pull --quiet

# 3. Keep the existing database mount and take a backup before an update.
if docker container inspect rocktama-db-1 >/dev/null 2>&1; then
  current_mount=$(docker inspect --format '{{range .Mounts}}{{if eq .Destination "/var/lib/postgresql"}}{{.Source}}{{end}}{{end}}' rocktama-db-1)
  [[ "$current_mount" == "$data_root/postgres" ]] || { echo 'Existing database uses another data source. Review its mount before deployment.' >&2; exit 1; }
  [[ "$(docker inspect --format '{{.State.Running}}' rocktama-db-1)" == true ]] || { echo 'Existing database must be running to take a backup' >&2; exit 1; }
  umask 077
  backup=$(mktemp "$data_root/backups/rocktama-before-${target:0:12}.XXXXXX")
  docker exec rocktama-db-1 pg_dump -U rocktama_bootstrap -Fc rocktama > "$backup"
  echo "Backup: $backup ($(stat -c %s "$backup") bytes)"
fi

# 4. Start: db → db-bootstrap → migrate → api → web → caddy, each gated on health or success.
compose up -d --wait --wait-timeout 300
if [ -f current-release ] && [ "$(cat current-release)" != "$target" ]; then cp current-release previous-release; fi
echo "$target" > current-release
compose ps -a
echo "Deployed release $target"
