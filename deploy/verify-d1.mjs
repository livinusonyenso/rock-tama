import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { closeSync, openSync, readFileSync } from "node:fs";
import { request as httpsRequest } from "node:https";
import { setTimeout as delay } from "node:timers/promises";

const compose = (...args) => execFileSync("./deploy/d1.sh", args, { encoding: "utf8" }).trim();
const docker = (...args) => execFileSync("docker", args, { encoding: "utf8" }).trim();
const db = "rocktama_d1";
const admin = "rocktama_bootstrap";
const api = "api.rocktama.localhost";
const shop = "shop.rocktama.localhost";
const auth = "/api/v1/auth";
const origin = (host) => `https://${host}:8443`;
const ca = readFileSync(".d1/ca.pem", "utf8");

function request(host, path, { method = "GET", headers = {}, body, certificate = ca } = {}) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? undefined : JSON.stringify(body);
    const req = httpsRequest({
      hostname: "127.0.0.1", servername: host, port: 8443, path, method, ca: certificate,
      signal: AbortSignal.timeout(10_000),
      headers: { host: `${host}:8443`, ...(data && { "content-type": "application/json" }), ...headers },
    }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("error", reject);
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, text: Buffer.concat(chunks).toString() }));
    });
    req.on("error", reject);
    req.end(data);
  });
}

function psql(sql, database = db) {
  return compose("exec", "-T", "db", "psql", "-XAt", "-v", "ON_ERROR_STOP=1", "-U", admin, "-d", database, "-c", sql);
}

async function ready() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      if ((await request(api, "/health/ready")).status === 200) return;
    } catch (error) {
      if (/CERT|VERIFY/.test(error.code ?? "")) throw error;
    }
    await delay(500);
  }
  throw new Error("D1 API did not regain readiness");
}

const fingerprint = (value) => createHash("sha256").update(value).digest("hex");
const migrationHistory = "SELECT name, checksum, applied_at FROM public.schema_migrations ORDER BY name";
const volumeName = () => docker("inspect", "--format", '{{range .Mounts}}{{if eq .Destination "/var/lib/postgresql"}}{{.Name}}{{end}}{{end}}', compose("ps", "-q", "db"));

async function login(host) {
  const user = {
    email: `d1-${randomUUID()}@example.test`, password: randomBytes(24).toString("hex"),
    name: "D1 Rehearsal", company: "Fixture Supplies", phone: "+234 803 123 4567", location: "Enugu, Enugu State", consent: true,
  };
  const headers = { origin: origin(host) };
  assert.equal((await request(host, `${auth}/register`, { method: "POST", headers, body: user })).status, 202);
  const result = await request(host, `${auth}/login`, { method: "POST", headers, body: { email: user.email, password: user.password } });
  assert.equal(result.status, 200);
  assert.equal(result.headers["cache-control"], "no-store");
  const [cookie] = result.headers["set-cookie"] ?? [];
  assert.ok(cookie?.startsWith("__Host-rocktama_session="));
  const attributes = cookie.split(/; */).slice(1);
  for (const attr of ["HttpOnly", "Secure", "SameSite=Lax", "Path=/"]) assert.ok(attributes.includes(attr), `Expected ${attr}`);
  assert.ok(!attributes.some((attr) => /^domain=/i.test(attr)));
  return { email: user.email, cookie: cookie.split(";", 1)[0] };
}

async function checkSession(host, session, status = 200) {
  const result = await request(host, `${auth}/me`, { headers: { cookie: session.cookie } });
  assert.equal(result.status, status);
  if (status === 200) {
    const { user } = JSON.parse(result.text);
    assert.equal(user.email, session.email);
    assert.equal(user.status, "pending");
    assert.equal(user.canAccessDistributorFeatures, false);
  }
}

async function logout(host, session) {
  const endpoint = `${auth}/logout`;
  for (const unexpectedOrigin of [undefined, "https://unrelated.example.test"]) {
    const headers = { cookie: session.cookie, ...(unexpectedOrigin && { origin: unexpectedOrigin }) };
    assert.equal((await request(host, endpoint, { method: "POST", headers })).status, 403);
  }
  await checkSession(host, session);
  const headers = { cookie: session.cookie, origin: origin(host) };
  assert.equal((await request(host, endpoint, { method: "POST", headers })).status, 204);
  await checkSession(host, session, 401);
}

function proxyCheck(host, clientIp) {
  const spoofed = "203.0.113.211";
  const attempts = (ip) => Number(psql(`SELECT attempts FROM auth.rate_limits WHERE scope='login_ip' AND key_hash=decode('${fingerprint(ip)}','hex')`));
  const before = attempts(clientIp);
  const forgedBefore = attempts(spoofed);
  const probe = `
    import assert from 'node:assert/strict';
    import {request} from 'node:https';
    const payload = JSON.stringify({email: ${JSON.stringify(`proxy-${randomUUID()}@example.test`)}, password: 'wrong for D1 probe'});
    const req = request({hostname:'caddy', servername:${JSON.stringify(host)}, port:443,
      path:'/api/v1/auth/login', method:'POST', ca:${JSON.stringify(ca)},
      headers:{host:${JSON.stringify(`${host}:8443`)}, origin:${JSON.stringify(origin(host))},
        'content-type':'application/json','x-forwarded-for':${JSON.stringify(spoofed)}}},
      (res)=>{res.resume(); assert.equal(res.statusCode, 401);});
    req.on('error',(error)=>{throw error}); req.end(payload);
  `;
  execFileSync("docker", ["run", "--rm", "-i", "--network", "rocktama-d1_edge", "--ip", clientIp,
    "rocktama-d1-api:local", "node", "--input-type=module", "-"], { input: probe, timeout: 15_000 });
  assert.equal(attempts(clientIp), before + 1);
  assert.equal(attempts(spoofed), forgedBefore);
}

function backupAndRestore(session) {
  const snapshot = `.d1/${randomUUID()}.dump`;
  const restore = `rocktama_d1_restore_${randomBytes(6).toString("hex")}`;
  const backup = openSync(snapshot, "wx", 0o600);
  try {
    const result = spawnSync("./deploy/d1.sh", ["exec", "-T", "db", "pg_dump", "-U", admin, "-Fc", db], { stdio: ["ignore", backup, "inherit"] });
    assert.equal(result.status, 0, "pg_dump failed");
  } finally {
    closeSync(backup);
  }
  compose("exec", "-T", "db", "createdb", "-U", admin, restore);
  try {
    const archive = openSync(snapshot, "r");
    try {
      const result = spawnSync("./deploy/d1.sh", ["exec", "-T", "db", "pg_restore", "--exit-on-error", "-U", admin, "-d", restore], { stdio: [archive, "inherit", "inherit"] });
      assert.equal(result.status, 0, "pg_restore failed");
    } finally {
      closeSync(archive);
    }
    assert.equal(psql(migrationHistory, restore), psql(migrationHistory));
    const hash = fingerprint(session.cookie.split("=", 2)[1]);
    assert.equal(psql(`SELECT u.status FROM auth.users u JOIN auth.sessions s ON u.id=s.user_id WHERE s.token_hash=decode('${hash}','hex')`, restore), "pending");
    assert.equal(psql("SELECT has_table_privilege('rocktama_api','auth.users','UPDATE')", restore), "f");
  } finally {
    compose("exec", "-T", "db", "dropdb", "-U", admin, restore);
  }
}

await assert.rejects(request(api, "/health", { certificate: null }), { name: "Error" });
await ready();
assert.equal((await request(api, "/health")).status, 200);
assert.equal((await request(shop, "/account/login")).status, 200);
// Read the actual host bindings (`docker compose port` output differs between Compose versions).
const hostBindings = (service) => Object.values(JSON.parse(docker("inspect", "--format", "{{json .NetworkSettings.Ports}}", compose("ps", "-q", service))))
  .flatMap((bindings) => bindings ?? []).map(({ HostIp, HostPort }) => `${HostIp}:${HostPort}`);
for (const service of ["api", "db", "frontend"]) assert.deepEqual(hostBindings(service), [], `${service} has a published port`);
assert.deepEqual(hostBindings("caddy"), ["127.0.0.1:8443"], "Caddy must publish only loopback 8443");
console.log("PASS trusted HTTPS and Caddy-only host binding");

const direct = await login(api);
const storefront = await login(shop);
await checkSession(api, direct);
await checkSession(shop, storefront);
const dashboard = await request(shop, "/account/dashboard", { headers: { cookie: storefront.cookie } });
assert.equal(dashboard.status, 200);
assert.match(dashboard.text, /Application pending review/);
proxyCheck(api, "172.29.44.11");
proxyCheck(shop, "172.29.44.12");
console.log("PASS direct and Next.js gateway auth, pending rendering, cookie attributes and trusted client IP");

const history = psql(migrationHistory);
assert.equal(history.split("\n").length, 4);
compose("run", "--rm", "--no-deps", "db-bootstrap");
const repeated = compose("run", "--rm", "--no-deps", "migrate");
assert.equal((repeated.match(/Already applied:/g) ?? []).length, 4);
assert.equal(psql(migrationHistory), history);
assert.equal(psql("SELECT count(*) FROM pg_roles WHERE rolname IN ('rocktama_api','rocktama_migrator') AND NOT rolsuper AND NOT rolcreaterole AND NOT rolcreatedb"), "2");
console.log("PASS standalone bootstrap and migration rerun; role separation and original migration history");

compose("restart", "api");
await ready();
assert.match(compose("logs", "--no-color", "api"), /Shutdown complete/);
await checkSession(api, direct);
await checkSession(shop, storefront);
const volume = volumeName();
assert.equal(volume, "rocktama-d1_pg_data");
const oldDb = compose("ps", "-q", "db");
compose("up", "-d", "--no-deps", "--force-recreate", "--wait", "db");
assert.notEqual(compose("ps", "-q", "db"), oldDb);
assert.equal(volumeName(), volume);
await ready();
await checkSession(shop, storefront);
assert.equal(psql(migrationHistory), history);
backupAndRestore(storefront);
console.log("PASS session persistence through API and PostgreSQL replacement, backup and isolated restore");

const goodImage = docker("inspect", "--format", "{{.Config.Image}}", compose("ps", "-q", "api"));
const deploy = (image) => spawnSync("./deploy/d1.sh", ["up", "-d", "--no-deps", "--no-build", "--wait", "--wait-timeout", "15", "api"], {
  env: { ...process.env, D1_API_IMAGE: image }, encoding: "utf8",
});
try {
  const failed = deploy("rocktama-d1-bootstrap:local");
  assert.equal(failed.status, 1, "The intentionally incompatible image must fail the API health gate");
} finally {
  const rollback = deploy(goodImage);
  if (rollback.status !== 0) throw new Error(`D1 rollback failed: ${rollback.stderr}`);
}
await ready();
await checkSession(shop, storefront);
assert.equal(psql(migrationHistory), history);
await logout(api, direct);
await logout(shop, storefront);
console.log("PASS failed image health gate, image rollback, origin rejection and server-side logout revocation");
