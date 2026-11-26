import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const directStart = ["DATABASE_URL", "DATABASE_URL_FILE"].some(key => Object.hasOwn(process.env, key))
  || process.env.NODE_ENV === "production"
  || process.env.DEPLOY_MODE === "production";

if (directStart) {
  await import("./server.mjs");
} else {
  await startLocalStack();
}

async function startLocalStack() {
  const root = new URL("../../", import.meta.url);
  if (!existsSync(new URL(".env.docker", root))) {
    console.error("Set up the local database first. Copy .env.docker.example to .env.docker and fill in the passwords as described in README.md.");
    process.exitCode = 1;
    return;
  }

  const cwd = fileURLToPath(root);
  const composeArgs = ["compose", "--env-file", ".env.docker", "-f", "compose.yml", "-f", "compose.db.yml", "-f", "compose.migrate.yml"];
  const running = spawnSync("docker", [...composeArgs, "ps", "--status", "running", "--quiet", "api"], {
    cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"],
  });
  if (running.status !== 0) {
    if (running.error) console.error("Start Docker Desktop and make sure the Docker CLI is available.");
    process.exitCode = running.status ?? 1;
    return;
  }

  const url = "http://127.0.0.1:4000/health/ready";
  if (running.stdout.trim() && await ready(url)) {
    console.log(`ROCK-TAMA API is already ready at ${url}`);
    return;
  }

  const start = spawnSync("docker", [...composeArgs, "up", "--build", "-d", "--wait"], { cwd, stdio: "inherit" });
  if (start.status !== 0) {
    process.exitCode = start.status ?? 1;
    return;
  }
  if (!await ready(url)) {
    console.error(`The local stack started, but ${url} did not report database readiness.`);
    process.exitCode = 1;
    return;
  }
  console.log(`ROCK-TAMA API is ready at ${url}`);
}

async function ready(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return false;
    const health = await response.json();
    return health.status === "ok" && health.database === "ready";
  } catch {
    return false;
  }
}
