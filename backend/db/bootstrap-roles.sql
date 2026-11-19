-- ROCK-TAMA database roles (Phase C1, D-131).
--
-- Runs as the bootstrap superuser (POSTGRES_USER) from the one-shot `db-bootstrap` service in
-- compose.migrate.yml, before migrations, on EVERY `docker compose up`. It is idempotent and
-- non-destructive: it creates missing roles, re-asserts their attributes and privileges, and hands
-- existing tables to the migrator. It never drops, truncates or rewrites data.
--
-- Why not /docker-entrypoint-initdb.d? The postgres image runs init scripts only when the data
-- directory is empty. The existing rocktama_pg_data volume would never run them, so a script there
-- would silently do nothing for this database. A service that runs every time works for both
-- existing and brand-new volumes.
--
-- psql variables (passed with -v): dbname, migrator_password, api_password.

\set ON_ERROR_STOP on
-- Terse errors: never echo statement text (which contains passwords) into logs.
\set VERBOSITY terse

BEGIN;

-- 1. Roles. Created once; attributes and passwords re-asserted on every run.
SELECT 'CREATE ROLE rocktama_migrator'
 WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rocktama_migrator') \gexec
SELECT 'CREATE ROLE rocktama_api'
 WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rocktama_api') \gexec

ALTER ROLE rocktama_migrator WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS
  PASSWORD :'migrator_password';
ALTER ROLE rocktama_api WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS
  CONNECTION LIMIT 20 PASSWORD :'api_password';

-- 2. Database: only named roles may connect (PUBLIC gets CONNECT and TEMP by default).
--    CREATE lets the migrator add schemas and trusted extensions such as citext (planned for C2).
REVOKE ALL ON DATABASE :"dbname" FROM PUBLIC;
GRANT CONNECT, CREATE ON DATABASE :"dbname" TO rocktama_migrator;
GRANT CONNECT ON DATABASE :"dbname" TO rocktama_api;

-- 3. Schema public (owned by pg_database_owner since PostgreSQL 15).
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO rocktama_migrator;
GRANT USAGE ON SCHEMA public TO rocktama_api;

-- 4. Tables and sequences the migrator creates in future are usable (not alterable) by the API.
ALTER DEFAULT PRIVILEGES FOR ROLE rocktama_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO rocktama_api;
ALTER DEFAULT PRIVILEGES FOR ROLE rocktama_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO rocktama_api;

-- 5. Migration history table. Same definition as backend/src/migrate.mjs (whose CREATE TABLE IF NOT
--    EXISTS then becomes a no-op). Creating it here means step 7 can lock it down even on a brand-new
--    volume, before the first migration runs. The integration tests check the two definitions match.
SET ROLE rocktama_migrator;
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  name TEXT PRIMARY KEY,
  checksum TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
RESET ROLE;

-- 6. Hand tables created earlier by the superuser (001_initial.sql ran as rocktama_app) to the
--    migrator. Ownership changes only; rows, indexes and constraints are untouched.
SELECT format('ALTER TABLE %I.%I OWNER TO rocktama_migrator', schemaname, tablename)
  FROM pg_tables
 WHERE schemaname = 'public' AND tableowner <> 'rocktama_migrator' \gexec

-- 7. Runtime privileges on existing objects. The API may read and write application tables, but may
--    only read the migration history.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rocktama_api;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rocktama_api;
REVOKE ALL ON public.schema_migrations FROM rocktama_api;
GRANT SELECT ON public.schema_migrations TO rocktama_api;

COMMIT;

\echo 'db-bootstrap: roles rocktama_migrator and rocktama_api are up to date'
