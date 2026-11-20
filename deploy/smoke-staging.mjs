// Smoke test for a deployed stack, run from your Mac (D-136). No secrets; creates one pending test account.
//   node deploy/smoke-staging.mjs --shop shop.13-48-1-2.sslip.io --api api.13-48-1-2.sslip.io --ip 13.48.1.2
// Rehearse against D1:
//   node deploy/smoke-staging.mjs --shop shop.rocktama.localhost --api api.rocktama.localhost \
//     --connect 127.0.0.1 --port 8443 --ca .d1/ca.pem
// With --ip it also checks that only 80 and 443 accept connections and that HTTP redirects to HTTPS.
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { connect } from "node:net";
import { parseArgs } from "node:util";

const { values: opt } = parseArgs({ options: {
  shop: { type: "string" }, api: { type: "string" }, ip: { type: "string" },
  connect: { type: "string" }, port: { type: "string", default: "443" }, ca: { type: "string" },
} });
if (!opt.shop || !opt.api) throw new Error("--shop and --api are required");
const port = Number(opt.port);
const ca = opt.ca ? readFileSync(opt.ca) : undefined; // undefined = the system's public trust store
const origin = (host) => `https://${host}${port === 443 ? "" : `:${port}`}`;

function call(host, path, { method = "GET", headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? undefined : JSON.stringify(body);
    const req = httpsRequest({
      hostname: opt.connect ?? host, servername: host, port, path, method, ca, signal: AbortSignal.timeout(15_000),
      headers: { host: `${host}${port === 443 ? "" : `:${port}`}`, ...(data && { "content-type": "application/json" }), ...headers },
    }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, text: Buffer.concat(chunks).toString() }));
    });
    req.on("error", reject);
    req.end(data);
  });
}

const reachable = (host, tcpPort) => new Promise((resolve) => {
  const socket = connect({ host, port: tcpPort, timeout: 4000 }, () => { socket.destroy(); resolve(true); });
  socket.on("timeout", () => { socket.destroy(); resolve(false); });
  socket.on("error", () => resolve(false));
});

const pass = (message) => console.log(`PASS ${message}`);

// 1. TLS and health. A failed certificate check throws here.
assert.equal((await call(opt.api, "/health")).status, 200);
assert.equal(JSON.parse((await call(opt.api, "/health/ready")).text).database, "ready");
for (const path of ["/", "/account/login", "/account/register"]) assert.equal((await call(opt.shop, path)).status, 200, path);
pass("certificate trusted for both hosts; API ready; storefront pages 200");

// 2. Network exposure and HTTP redirect (only against a real public IP).
if (opt.ip) {
  for (const closed of [22, 3000, 4000, 5432]) assert.equal(await reachable(opt.ip, closed), false, `port ${closed} must be closed`);
  for (const open of [80, 443]) assert.equal(await reachable(opt.ip, open), true, `port ${open} must be open`);
  const redirect = await new Promise((resolve, reject) => {
    httpRequest({ hostname: opt.ip, port: 80, path: "/account/login", headers: { host: opt.shop } }, (res) => { res.resume(); resolve(res); })
      .on("error", reject).end();
  });
  assert.ok([301, 308].includes(redirect.statusCode) && redirect.headers.location === `https://${opt.shop}/account/login`);
  pass("only 80 and 443 reachable; HTTP redirects to HTTPS");
}

// 3. Auth directly on the API host and through the storefront gateway.
async function lifecycle(host) {
  const user = { email: `rocktama-smoke-${randomUUID()}@example.test`, password: randomBytes(24).toString("hex"),
    name: "Smoke Test", company: "Smoke Test Supplies", phone: "+234 803 123 4567", location: "Enugu, Enugu State", consent: true };
  const headers = { origin: origin(host) };
  assert.equal((await call(host, "/api/v1/auth/register", { method: "POST", headers, body: user })).status, 202);
  assert.equal((await call(host, "/api/v1/auth/login", { method: "POST", headers: { origin: "https://attacker.example" },
    body: { email: user.email, password: user.password } })).status, 403);
  const login = await call(host, "/api/v1/auth/login", { method: "POST", headers, body: { email: user.email, password: user.password } });
  assert.equal(login.status, 200);
  const [setCookie] = login.headers["set-cookie"] ?? [];
  const attributes = (setCookie ?? "").split(/; */);
  assert.ok(attributes[0].startsWith("__Host-rocktama_session="), "cookie name");
  for (const attribute of ["HttpOnly", "Secure", "SameSite=Lax", "Path=/"]) assert.ok(attributes.includes(attribute), attribute);
  assert.ok(!attributes.some((attribute) => /^domain=/i.test(attribute)), "no Domain attribute");
  const cookie = attributes[0];
  const me = await call(host, "/api/v1/auth/me", { headers: { cookie } });
  assert.equal(me.status, 200);
  assert.equal(JSON.parse(me.text).user.status, "pending");
  assert.equal((await call(host, "/api/v1/auth/logout", { method: "POST", headers: { cookie } })).status, 403, "logout without Origin");
  assert.equal((await call(host, "/api/v1/auth/logout", { method: "POST", headers: { ...headers, cookie } })).status, 204);
  assert.equal((await call(host, "/api/v1/auth/me", { headers: { cookie } })).status, 401);
  return user.email;
}
const accounts = [await lifecycle(opt.api), await lifecycle(opt.shop)];
pass("register 202, foreign Origin 403, login with __Host- Secure HttpOnly Lax cookie, /me pending, logout revokes (API and gateway)");
console.log(`Created pending test accounts: ${accounts.join(", ")}`);
