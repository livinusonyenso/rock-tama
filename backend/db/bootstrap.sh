#!/bin/sh
set -eu

: "${PGHOST:?PGHOST is required}" "${PGUSER:?PGUSER is required}" "${PGDATABASE:?PGDATABASE is required}"
PGPASSWORD=$(cat "${PGPASSWORD_FILE:?PGPASSWORD_FILE is required}")
MIGRATOR_PASSWORD=$(cat "${MIGRATOR_PASSWORD_FILE:?MIGRATOR_PASSWORD_FILE is required}")
API_DB_PASSWORD=$(cat "${API_DB_PASSWORD_FILE:?API_DB_PASSWORD_FILE is required}")
: "${PGPASSWORD:?empty bootstrap password}" "${MIGRATOR_PASSWORD:?empty migrator password}" "${API_DB_PASSWORD:?empty API password}"
export PGPASSWORD MIGRATOR_PASSWORD API_DB_PASSWORD

# psql copies these process variables into SQL variables without passing their values on the command line.
exec psql -X -q -v ON_ERROR_STOP=1 \
  -c '\getenv dbname PGDATABASE' \
  -c '\getenv migrator_password MIGRATOR_PASSWORD' \
  -c '\getenv api_password API_DB_PASSWORD' \
  -f /bootstrap/roles.sql
