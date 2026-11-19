import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { pool } from "./db.mjs";

const migrationDirectory = new URL("../migrations/", import.meta.url);
const client = await pool.connect();

try {
  await client.query("BEGIN");

  await client.query(
    "SELECT pg_advisory_xact_lock($1)",
    [317215]
  );

  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      name TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const files = (await readdir(migrationDirectory))
    .filter((file) => /^\d+_.*\.sql$/.test(file))
    .sort();

  for (const file of files) {
    const sql = await readFile(
      new URL(file, migrationDirectory),
      "utf8"
    );

    const checksum = createHash("sha256")
      .update(sql)
      .digest("hex");

    const result = await client.query(
      "SELECT checksum FROM public.schema_migrations WHERE name = $1",
      [file]
    );

    if (result.rows.length > 0) {
      if (result.rows[0].checksum !== checksum) {
        throw new Error(
          `Migration changed after application: ${file}`
        );
      }

      console.log(`Already applied: ${file}`);
      continue;
    }

    await client.query(sql);

    await client.query(
      `INSERT INTO public.schema_migrations (name, checksum)
       VALUES ($1, $2)`,
      [file, checksum]
    );

    console.log(`Applied migration: ${file}`);
  }

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
