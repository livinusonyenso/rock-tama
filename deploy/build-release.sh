#!/bin/sh
# Build the four linux/arm64 release images for one Git commit (D-136). Local only: nothing is pushed.
# Usage: deploy/build-release.sh [registry]   e.g. 638486126885.dkr.ecr.eu-north-1.amazonaws.com
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

build() { # name context dockerfile [build args...]
  name=$1 context=$2 dockerfile=$3; shift 3
  docker buildx build --platform linux/arm64 --load --provenance=false \
    --label "org.opencontainers.image.revision=$release" \
    --label "org.opencontainers.image.created=$created" \
    --label "org.opencontainers.image.title=rocktama-$name" \
    --file "$dockerfile" --tag "${prefix}rocktama/$name:$release" "$@" "$context"
}

build api backend backend/Dockerfile --target production
build web frontend frontend/Dockerfile
build db-bootstrap backend/db backend/db/Dockerfile
build edge deploy deploy/Caddy.staging.Dockerfile

printf '%s\n' "Built release $release:"
for name in api web db-bootstrap edge; do
  docker image inspect --format "  ${prefix}rocktama/$name:$release  {{.Id}}  {{.Architecture}}" "${prefix}rocktama/$name:$release"
done
