import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const env = { PATH: process.env.PATH };
for (const [name, role, passwordVariable] of [
  ["API_DATABASE_URL", "rocktama_api", "API_DB_PASSWORD"],
  ["MIGRATOR_DATABASE_URL", "rocktama_migrator", "MIGRATOR_PASSWORD"],
]) {
  const file = process.env[`${name}_FILE`];
  if (file) {
    env[name] = readFileSync(file, "utf8").trim();
    if (!env[name]) throw new Error(`${name}_FILE is empty`);
    continue;
  }
  const database = process.env.POSTGRES_DB;
  const password = process.env[passwordVariable];
  if (!database || !password) throw new Error(`Set POSTGRES_DB and ${passwordVariable} in .env.docker`);
  const url = new URL(`postgresql://${role}@127.0.0.1:15432/${encodeURIComponent(database)}`);
  url.password = password;
  env[name] = url.href;
}

const result = spawnSync(process.execPath, ["--test", "test/integration/*.test.mjs"], { env, stdio: "inherit" });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
