// Database integration tests (D-131). They run against the Compose database from your Mac
// (127.0.0.1:15432) and are skipped unless both connection strings are set:
//
//   API_DATABASE_URL       postgresql://rocktama_api:<API_DB_PASSWORD>@127.0.0.1:15432/rocktama
//   MIGRATOR_DATABASE_URL  postgresql://rocktama_migrator:<MIGRATOR_PASSWORD>@127.0.0.1:15432/rocktama
//
// Every write attempt runs inside a transaction that is rolled back, so the tests never change data.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import pg from "pg";

const API = process.env.API_DATABASE_URL;
const MIGRATOR = process.env.MIGRATOR_DATABASE_URL;
const skip = API && MIGRATOR ? false : "set API_DATABASE_URL and MIGRATOR_DATABASE_URL to run database tests";

async function withClient(connectionString, fn) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

async function rejectsInRollback(client, sql, code) {
  await client.query("BEGIN");
  try {
    await assert.rejects(client.query(sql), { code });
  } finally {
    await client.query("ROLLBACK");
  }
}

const ROLE_ATTRIBUTES = `SELECT current_user AS name, rolsuper, rolcreaterole, rolcreatedb, rolreplication, rolbypassrls
                           FROM pg_roles WHERE rolname = current_user`;

test("the API connects as rocktama_api, a role with no administrative attributes", { skip }, async () => {
  await withClient(API, async (client) => {
    const { rows } = await client.query(ROLE_ATTRIBUTES);
    assert.deepEqual(rows[0], { name: "rocktama_api", rolsuper: false, rolcreaterole: false, rolcreatedb: false, rolreplication: false, rolbypassrls: false });
  });
});

test("rocktama_api cannot create, alter or drop tables", { skip }, async () => {
  await withClient(API, async (client) => {
    await rejectsInRollback(client, "CREATE TABLE public.c1_must_not_exist (id integer)", "42501");
    await rejectsInRollback(client, "ALTER TABLE public.app_metadata ADD COLUMN c1_must_not_exist text", "42501");
    await rejectsInRollback(client, "DROP TABLE public.app_metadata", "42501");
  });
});

test("rocktama_api can read and write application data", { skip }, async () => {
  await withClient(API, async (client) => {
    const { rows } = await client.query("SELECT value FROM public.app_metadata WHERE key = 'schema_version'");
    assert.deepEqual(rows, [{ value: "1" }]);

    await client.query("BEGIN");
    try {
      const update = await client.query("UPDATE public.app_metadata SET value = value WHERE key = 'schema_version'");
      assert.equal(update.rowCount, 1);
    } finally {
      await client.query("ROLLBACK");
    }
  });
});

test("rocktama_api can read but not change migration history", { skip }, async () => {
  await withClient(API, async (client) => {
    const { rows } = await client.query("SELECT name FROM public.schema_migrations ORDER BY name");
    assert.ok(rows.some((row) => row.name === "001_initial.sql"));

    await rejectsInRollback(client, "INSERT INTO public.schema_migrations (name, checksum) VALUES ('999_test.sql', 'x')", "42501");
    await rejectsInRollback(client, "UPDATE public.schema_migrations SET checksum = checksum", "42501");
    await rejectsInRollback(client, "DELETE FROM public.schema_migrations", "42501");
  });
});

test("rocktama_migrator owns every public table and is not a superuser", { skip }, async () => {
  await withClient(MIGRATOR, async (client) => {
    const role = await client.query(ROLE_ATTRIBUTES);
    assert.deepEqual(role.rows[0], { name: "rocktama_migrator", rolsuper: false, rolcreaterole: false, rolcreatedb: false, rolreplication: false, rolbypassrls: false });

    const owners = await client.query("SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
    assert.ok(owners.rows.length >= 2);
    for (const row of owners.rows) assert.equal(row.tableowner, "rocktama_migrator", `${row.tablename} owner`);
  });
});

test("migration history matches the files on disk and the runner's table definition", { skip }, async () => {
  await withClient(MIGRATOR, async (client) => {
    const sql = await readFile(new URL("../../migrations/001_initial.sql", import.meta.url), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const { rows } = await client.query("SELECT checksum FROM public.schema_migrations WHERE name = '001_initial.sql'");
    assert.deepEqual(rows, [{ checksum }]);

    // backend/db/bootstrap-roles.sql pre-creates this table; it must match src/migrate.mjs.
    const columns = await client.query(
      `SELECT column_name, data_type, is_nullable FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'schema_migrations' ORDER BY ordinal_position`,
    );
    assert.deepEqual(columns.rows, [
      { column_name: "name", data_type: "text", is_nullable: "NO" },
      { column_name: "checksum", data_type: "text", is_nullable: "NO" },
      { column_name: "applied_at", data_type: "timestamp with time zone", is_nullable: "NO" },
    ]);
  });
});

test("roles that are not granted access cannot connect to the database", { skip }, async () => {
  await withClient(MIGRATOR, async (client) => {
    const { rows } = await client.query("SELECT has_database_privilege('public', current_database(), 'CONNECT') AS public_connect");
    assert.equal(rows[0].public_connect, false);
  });
});
