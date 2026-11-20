#!/bin/sh
set -eu

root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
cd "$root"
umask 077

compose() {
  docker compose --project-name rocktama-d1 --env-file /dev/null --file deploy/compose.rehearsal.yml "$@"
}

case "${1:-}" in
  init)
    if [ ! -e .d1 ]; then
      stage=$(mktemp -d "$root/.d1.init.XXXXXX")
      trap 'rm -f "$stage"/*; rmdir "$stage"' EXIT
      for role in bootstrap migrator api; do
        openssl rand -hex 24 > "$stage/$role-password"
      done
      for role in migrator api; do
        printf 'postgresql://rocktama_%s:%s@db:5432/rocktama_d1\n' "$role" \
          "$(cat "$stage/$role-password")" > "$stage/$role-url"
      done
      # Compose mounts these individual files read-only. The 0700 parent protects them on the host.
      chmod 0444 "$stage"/*
      mv "$stage" .d1
      trap - EXIT
    fi
    for file in bootstrap-password migrator-password api-password migrator-url api-url; do
      test -s ".d1/$file" || { printf 'Missing D1 credential file: %s\n' "$file" >&2; exit 1; }
    done
    printf '%s\n' 'D1 credentials are ready in .d1/'
    ;;
  ca)
    compose exec -T caddy cat /data/caddy/pki/authorities/local/root.crt > .d1/ca.pem.tmp
    openssl x509 -in .d1/ca.pem.tmp -noout -subject
    mv .d1/ca.pem.tmp .d1/ca.pem
    ;;
  *)
    compose "$@"
    ;;
esac
