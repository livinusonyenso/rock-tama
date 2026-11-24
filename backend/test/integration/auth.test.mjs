import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import test from "node:test";
import express from "express";
import pg from "pg";
import { createApp } from "../../src/app.mjs";
import { createSessionGuards } from "../../src/auth/access.mjs";
import { authCookieConfig, createSessionToken, hashPassword, hashValue, verifyPassword } from "../../src/auth/security.mjs";

const apiUrl = process.env.API_DATABASE_URL;
const migratorUrl = process.env.MIGRATOR_DATABASE_URL;
const skip = apiUrl && migratorUrl ? false : "set API_DATABASE_URL and MIGRATOR_DATABASE_URL";
const origin = "http://127.0.0.1:4000";
const password = "C2 disposable integration password";
const received = { registration: { status: "received" } };

function registration() {
  return {
    email: `${randomUUID()}@example.test`, password, name: "Ada Okafor", company: "Example Supplies",
    phone: "+234 803 123 4567", location: "Enugu, Enugu State", consent: true,
  };
}

// Cleanups run last-in, first-out, so fixtures are removed before their connection closes.
const cleanupStacks = new WeakMap();
function onCleanup(t, cleanup) {
  if (!cleanupStacks.has(t)) {
    const stack = [];
    cleanupStacks.set(t, stack);
    t.after(async () => { while (stack.length) await stack.pop()(); });
  }
  cleanupStacks.get(t).push(cleanup);
}

async function connection(t, connectionString) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  onCleanup(t, () => client.end());
  return client;
}

async function listen(t, app, run) {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    return await run(base);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

async function withTestApi(t, db, run, { trustProxy = false } = {}) {
  return listen(t, createApp({ db, authOrigin: origin, trustProxy }), (base) =>
    run(async (endpoint, { body, method = "POST", headers = { origin }, raw } = {}) => {
      const requestHeaders = new Headers(headers);
      if (body !== undefined) requestHeaders.set("content-type", "application/json");
      const response = await fetch(`${base}/api/v1/auth/${endpoint}`, {
        method, headers: requestHeaders, body: raw ?? JSON.stringify(body),
      });
      return { status: response.status, headers: response.headers, body: response.status === 204 ? null : await response.json() };
    }));
}

async function inRuntimeTransaction(t, run, options) {
  const db = await connection(t, apiUrl);
  await db.query("BEGIN");
  try {
    // The fixture server sees 127.0.0.1. Any real local bucket is restored at rollback.
    await db.query("DELETE FROM auth.rate_limits WHERE scope IN ('register_ip', 'login_ip') AND key_hash = $1", [hashValue("127.0.0.1")]);
    return await withTestApi(t, db, (request) => run(request, db), options);
  } finally {
    await db.query("ROLLBACK");
  }
}

function assertError(result, status, code) {
  assert.equal(result.status, status);
  assert.equal(result.body.error.code, code);
  assert.equal(typeof result.body.error.message, "string");
  assert.equal(result.headers.get("cache-control"), "no-store");
}

/** Insert a user through the migrator (the only role that may set status), and remove it afterwards. */
async function fixtureUser(t, migrator, status = "pending") {
  const fields = registration();
  const { rows: [user] } = await migrator.query(
    `INSERT INTO auth.users (email, name, company, password_hash, status) VALUES ($1,$2,$3,$4,$5)
     RETURNING id, email, name, company, role, status`,
    [fields.email, fields.name, fields.company, await hashPassword(password), status],
  );
  onCleanup(t, () => migrator.query("DELETE FROM auth.users WHERE id = $1", [user.id]));
  return user;
}

async function fixtureSession(migrator, userId, { expired = false } = {}) {
  const token = createSessionToken();
  await migrator.query(
    expired
      ? `INSERT INTO auth.sessions (user_id, token_hash, created_at, expires_at)
         VALUES ($1, $2, now() - INTERVAL '9 hours', now() - INTERVAL '1 hour')`
      : "INSERT INTO auth.sessions (user_id, token_hash) VALUES ($1, $2)",
    [userId, hashValue(token)],
  );
  return `rocktama_session=${token}`;
}

test("real PostgreSQL registration, credential checks and session lifecycle", { skip, timeout: 20_000 }, async (t) => {
  await inRuntimeTransaction(t, async (request, db) => {
    const fields = registration();
    const { email } = fields;
    const credentials = { email, password };
    let user;
    let cookie;
    let cookieHash;

    await t.test("valid registration creates a pending distributor with only a salted password hash", async () => {
      const result = await request("register", { body: { ...fields, email: ` ${email.toUpperCase()} ` } });
      assert.equal(result.status, 202);
      assert.deepEqual(result.body, received);
      assert.equal(result.headers.get("set-cookie"), null);
      const { rows } = await db.query(
        `SELECT id, email, name, company, phone, location, role, status, password_hash,
                consented_at BETWEEN statement_timestamp() - INTERVAL '1 minute' AND statement_timestamp() AS consent_recorded
         FROM auth.users WHERE email = $1`, [email]);
      assert.equal(rows.length, 1);
      const { password_hash: passwordHash, consent_recorded: consentRecorded, ...stored } = rows[0];
      assert.deepEqual(stored, { id: stored.id, email, name: fields.name, company: fields.company,
        phone: fields.phone, location: fields.location, role: "distributor", status: "pending" });
      assert.equal(consentRecorded, true);
      assert.match(passwordHash, /^\$argon2id\$/);
      assert.equal(await verifyPassword(passwordHash, password), true);
      assert.equal((await db.query("SELECT 1 FROM auth.sessions WHERE user_id = $1", [stored.id])).rowCount, 0);
      user = { ...stored, vehicleType: null, canAccessDistributorFeatures: false };
    });

    await t.test("a duplicate email gets the same response and never changes the existing account", async () => {
      const { rows: [before] } = await db.query("SELECT password_hash FROM auth.users WHERE id = $1", [user.id]);
      const duplicate = await request("register", { body: { ...fields, password: "an attacker's replacement password", name: "Mallory" } });
      assert.equal(duplicate.status, 202);
      assert.deepEqual(duplicate.body, received);
      const { rows } = await db.query("SELECT name, password_hash FROM auth.users WHERE email = $1", [email]);
      assert.deepEqual(rows, [{ name: fields.name, password_hash: before.password_hash }]);
    });

    await t.test("invalid input and privilege injection return safe errors", async () => {
      assertError(await request("register", { body: { ...fields, email: "invalid" } }), 400, "invalid_input");
      assertError(await request("register", { body: { ...fields, role: "admin", status: "approved" } }), 400, "invalid_input");
      assertError(await request("register", { body: { ...fields, consent: false } }), 400, "invalid_input");
      assertError(await request("register", { body: { ...fields, phone: "not a phone" } }), 400, "invalid_input");
      assertError(await request("register", { headers: { origin, "content-type": "application/json" }, raw: "{" }), 400, "invalid_input");
      assertError(await request("register", { body: { ...fields, name: "x".repeat(9000) } }), 413, "request_too_large");
      assertError(await request("login", { headers: { origin }, raw: "email=invalid" }), 415, "unsupported_media_type");
    });

    await t.test("incorrect credentials and unknown email receive the same error", async () => {
      const wrong = await request("login", { body: { email, password: "incorrect" } });
      const missing = await request("login", { body: { email: registration().email, password } });
      assertError(wrong, 401, "invalid_credentials");
      assertError(missing, 401, "invalid_credentials");
      assert.deepEqual(wrong.body, missing.body);
      assert.equal(wrong.headers.get("set-cookie"), null);
    });

    await t.test("unauthenticated and missing-origin requests are rejected", async () => {
      assertError(await request("me", { method: "GET" }), 401, "authentication_required");
      assertError(await request("logout"), 401, "authentication_required");
      assertError(await request("login", { body: credentials, headers: {} }), 403, "origin_forbidden");
      assertError(await request("register", { body: fields, headers: { origin: "null" } }), 403, "origin_forbidden");
    });

    await t.test("correct login sets an HttpOnly cookie and persists only its hash", async () => {
      const result = await request("login", { body: credentials });
      assert.equal(result.status, 200);
      assert.deepEqual(result.body.user, user);
      const setCookie = result.headers.get("set-cookie");
      assert.match(setCookie, /^rocktama_session=[A-Za-z0-9_-]{43};/);
      for (const attribute of ["HttpOnly", "SameSite=Lax", "Path=/", "Max-Age=28800"]) assert.ok(setCookie.includes(attribute));
      cookie = setCookie.split(";", 1)[0];
      cookieHash = hashValue(cookie.slice("rocktama_session=".length));
      const { rows } = await db.query(
        "SELECT token_hash, extract(epoch FROM expires_at - created_at)::integer AS lifetime FROM auth.sessions WHERE user_id = $1", [user.id]);
      assert.equal(rows.length, 1);
      assert.ok(rows[0].token_hash.equals(cookieHash));
      assert.equal(rows[0].lifetime, 8 * 60 * 60);
    });

    await t.test("session identifies only its owner and pending access stays restricted", async () => {
      const result = await request("me", { method: "GET", headers: { cookie } });
      assert.equal(result.status, 200);
      assert.equal(result.headers.get("cache-control"), "no-store");
      assert.equal(result.headers.get("access-control-allow-origin"), null, "no CORS: browsers reach the API only through the same-origin gateway");
      assert.deepEqual(result.body.user, user);
      assert.equal(result.body.user.canAccessDistributorFeatures, false);
      const fake = await request("me", { method: "GET", headers: { cookie: `rocktama_session=${createSessionToken()}` } });
      assertError(fake, 401, "authentication_required");
      assert.match(fake.headers.get("set-cookie"), /^rocktama_session=;/);
    });

    await t.test("login rotates the session attached to the browser", async () => {
      const previousCookie = cookie;
      const result = await request("login", { body: credentials, headers: { origin, cookie } });
      assert.equal(result.status, 200);
      cookie = result.headers.get("set-cookie").split(";", 1)[0];
      cookieHash = hashValue(cookie.slice("rocktama_session=".length));
      assertError(await request("me", { method: "GET", headers: { cookie: previousCookie } }), 401, "authentication_required");
    });

    await t.test("cross-origin logout is rejected, while valid logout revokes the server session", async () => {
      assertError(await request("logout", { headers: { origin: "https://other.example.test", cookie } }), 403, "origin_forbidden");
      assert.equal((await request("me", { method: "GET", headers: { cookie } })).status, 200);
      const result = await request("logout", { headers: { origin, cookie } });
      assert.equal(result.status, 204);
      assert.match(result.headers.get("set-cookie"), /^rocktama_session=;/);
      assert.equal((await db.query("SELECT 1 FROM auth.sessions WHERE token_hash = $1", [cookieHash])).rowCount, 0);
      assertError(await request("me", { method: "GET", headers: { cookie } }), 401, "authentication_required");
    });
  });
});

test("registration is limited per IP, and spoofed X-Forwarded-For is ignored without a trusted proxy", { skip, timeout: 20_000 }, async (t) => {
  await inRuntimeTransaction(t, async (request) => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      assertError(await request("register", { body: {} }), 400, "invalid_input");
    }
    const blocked = await request("register", { body: registration() });
    assertError(blocked, 429, "rate_limited");
    assert.equal(blocked.headers.get("retry-after"), "3600");
    const spoofed = await request("register", { body: registration(), headers: { origin, "x-forwarded-for": "198.51.100.42" } });
    assertError(spoofed, 429, "rate_limited");
  });
});

test("login limits count failures only, per email and IP, per IP and per account", { skip, timeout: 60_000 }, async (t) => {
  // Trust the loopback test client as a proxy so X-Forwarded-For can stand in for different client IPs.
  await inRuntimeTransaction(t, async (request, db) => {
    const fields = registration();
    assert.equal((await request("register", { body: fields })).status, 202);
    const from = (ip) => ({ origin, "x-forwarded-for": ip });
    const login = (ip, pass = "incorrect", email = fields.email) => request("login", { body: { email, password: pass }, headers: from(ip) });

    await t.test("successful logins never count, and success clears the email-and-IP bucket", async () => {
      for (let attempt = 0; attempt < 4; attempt += 1) assertError(await login("198.51.100.1"), 401, "invalid_credentials");
      for (let attempt = 0; attempt < 6; attempt += 1) assert.equal((await login("198.51.100.1", password)).status, 200);
      for (let attempt = 0; attempt < 5; attempt += 1) assertError(await login("198.51.100.1"), 401, "invalid_credentials");
      const blocked = await login("198.51.100.1", password);
      assertError(blocked, 429, "rate_limited");
      const retryAfter = Number(blocked.headers.get("retry-after"));
      assert.ok(retryAfter > 0 && retryAfter <= 900, `Retry-After ${retryAfter}`);
    });

    await t.test("an attacker's failures from one IP do not lock the owner out from another IP", async () => {
      assert.equal((await login("198.51.100.2", password)).status, 200);
    });

    await t.test("one IP is limited to 30 failures across any emails", async () => {
      for (let attempt = 0; attempt < 30; attempt += 1) {
        assertError(await login("198.51.100.3", "incorrect", registration().email), 401, "invalid_credentials");
      }
      assertError(await login("198.51.100.3", password), 429, "rate_limited");
      assert.equal((await login("198.51.100.4", password)).status, 200);
    });

    await t.test("an account-wide counter stops distributed guessing at 100 failures per hour", async () => {
      const { rows } = await db.query("SELECT attempts FROM auth.rate_limits WHERE scope = 'login_email' AND key_hash = $1", [hashValue(fields.email)]);
      // 4 + 5 failures for this email from 198.51.100.1. Blocked (429) requests and successes are not counted.
      assert.equal(rows[0].attempts, 9);
      await db.query("UPDATE auth.rate_limits SET attempts = 100 WHERE scope = 'login_email' AND key_hash = $1", [hashValue(fields.email)]);
      assertError(await login("198.51.100.5", password), 429, "rate_limited");
    });
  }, { trustProxy: ["loopback"] });
});

test("expired sessions cannot authenticate or log out, and the stale cookie is cleared", { skip, timeout: 20_000 }, async (t) => {
  const db = await connection(t, apiUrl);
  const migrator = await connection(t, migratorUrl);
  const user = await fixtureUser(t, migrator);
  const cookie = await fixtureSession(migrator, user.id, { expired: true });
  await withTestApi(t, db, async (request) => {
    const me = await request("me", { method: "GET", headers: { cookie } });
    assertError(me, 401, "authentication_required");
    assert.match(me.headers.get("set-cookie"), /^rocktama_session=;/);
    assertError(await request("logout", { headers: { origin, cookie } }), 401, "authentication_required");
  });
});

test("approved-distributor routes reject pending accounts on every request", { skip, timeout: 20_000 }, async (t) => {
  const db = await connection(t, apiUrl);
  const migrator = await connection(t, migratorUrl);
  // Only the migrator can approve. Customer registration and the API role cannot.
  const user = await fixtureUser(t, migrator, "approved");
  const cookie = await fixtureSession(migrator, user.id);

  // The same guards any future approved-distributor router must use.
  const app = express();
  const { requireSession, requireApprovedDistributor } = createSessionGuards({ db, cookie: authCookieConfig(origin) });
  app.get("/distributor-only", requireSession, requireApprovedDistributor, (_request, response) => response.json({ ok: true }));
  const guarded = (base, headers = {}) => fetch(`${base}/distributor-only`, { headers }).then(async (r) => ({ status: r.status, body: await r.json() }));

  await listen(t, app, async (base) => {
    assert.deepEqual(await guarded(base, { cookie }), { status: 200, body: { ok: true } });
    await migrator.query("UPDATE auth.users SET status = 'pending' WHERE id = $1", [user.id]);
    assert.deepEqual(await guarded(base, { cookie }), { status: 403, body: { error: {
      code: "distributor_approval_required", message: "This feature is available after your distributor account is approved." } } });
    assert.equal((await guarded(base)).status, 401);
  });
  await withTestApi(t, db, async (request) => {
    const me = await request("me", { method: "GET", headers: { cookie } });
    assert.equal(me.body.user.status, "pending");
    assert.equal(me.body.user.canAccessDistributorFeatures, false);
    // Other state-changing methods are also bound to the configured origin.
    assertError(await request("logout", { method: "DELETE", headers: { cookie } }), 403, "origin_forbidden");
  });
});

test("the migrator owns auth objects and only it can change privileges or schema", { skip }, async (t) => {
  const db = await connection(t, apiUrl);
  const migrator = await connection(t, migratorUrl);
  const { rows } = await migrator.query(`SELECT tablename, tableowner FROM pg_tables
    WHERE schemaname = 'auth' ORDER BY tablename`);
  assert.deepEqual(rows, ["rate_limits", "sessions", "users"].map((tablename) => ({ tablename, tableowner: "rocktama_migrator" })));

  for (const sql of [
    "INSERT INTO auth.users (role) VALUES ('admin')",
    "INSERT INTO auth.users (status) VALUES ('approved')",
    "UPDATE auth.users SET status = 'approved' WHERE false",
    "UPDATE auth.users SET role = 'admin' WHERE false",
    "UPDATE auth.users SET password_hash = 'x' WHERE false",
    "UPDATE auth.users SET phone = 'x', location = 'x', consented_at = now() WHERE false",
    "DELETE FROM auth.users WHERE false",
    "UPDATE auth.sessions SET expires_at = now() WHERE false",
    "ALTER TABLE auth.users ADD COLUMN c2_must_not_exist integer",
    "ALTER TABLE auth.rate_limits DROP CONSTRAINT rate_limits_scope_check",
    "CREATE TABLE auth.c2_must_not_exist (id integer)",
  ]) {
    await db.query("BEGIN");
    try {
      await assert.rejects(db.query(sql), { code: "42501" });
    } finally {
      await db.query("ROLLBACK");
    }
  }
  for (const file of ["002_auth.sql", "003_auth_login_limits.sql", "004_distributor_profile.sql", "005_account_roles.sql"]) {
    const migration = await readFile(new URL(`../../migrations/${file}`, import.meta.url));
    const { rows: checksums } = await db.query("SELECT checksum FROM public.schema_migrations WHERE name = $1", [file]);
    assert.deepEqual(checksums, [{ checksum: createHash("sha256").update(migration).digest("hex") }], file);
  }
});

test("account types: customers start approved, drivers and distributors pending, admins never self-register", { skip, timeout: 20_000 }, async (t) => {
  await inRuntimeTransaction(t, async (request, db) => {
    const { company: _company, ...personal } = registration();
    const stored = (email) => db.query("SELECT role, status, company, vehicle_type FROM auth.users WHERE email = $1", [email]).then((r) => r.rows);

    const customer = { ...personal, email: `${randomUUID()}@example.test`, accountType: "customer" };
    assert.equal((await request("register", { body: customer })).status, 202);
    assert.deepEqual(await stored(customer.email), [{ role: "customer", status: "approved", company: null, vehicle_type: null }]);

    const driver = { ...personal, email: `${randomUUID()}@example.test`, accountType: "driver", vehicleType: "van" };
    assert.equal((await request("register", { body: driver })).status, 202);
    assert.deepEqual(await stored(driver.email), [{ role: "driver", status: "pending", company: null, vehicle_type: "van" }]);

    const login = await request("login", { body: { email: driver.email, password } });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.role, "driver");
    assert.equal(login.body.user.vehicleType, "van");
    assert.equal(login.body.user.company, null);
    assert.equal(login.body.user.canAccessDistributorFeatures, false);
    const cookie = login.headers.get("set-cookie").split(";", 1)[0];
    assert.equal((await request("me", { method: "GET", headers: { cookie } })).body.user.status, "pending");

    for (const body of [
      { ...personal, accountType: "admin" },
      { ...personal, accountType: "driver" },
      { ...personal, accountType: "customer", vehicleType: "van" },
    ]) assertError(await request("register", { body }), 400, "invalid_input");

    // Even with direct SQL as the API role, the database refuses admins and chooses the status itself.
    const hash = await hashPassword(password);
    for (const role of ["admin", "superuser"]) {
      await db.query("SAVEPOINT attempt");
      await assert.rejects(db.query(
        "INSERT INTO auth.users (email, name, role, password_hash) VALUES ($1, 'x', $2, $3)",
        [`${randomUUID()}@example.test`, role, hash]), { code: "42501" });
      await db.query("ROLLBACK TO SAVEPOINT attempt");
    }
    const direct = `${randomUUID()}@example.test`;
    await db.query("INSERT INTO auth.users (email, name, role, vehicle_type, password_hash) VALUES ($1, 'x', 'driver', 'truck', $2)", [direct, hash]);
    assert.deepEqual(await stored(direct), [{ role: "driver", status: "pending", company: null, vehicle_type: "truck" }]);
    await db.query("SAVEPOINT attempt");
    await assert.rejects(db.query("INSERT INTO auth.users (email, name, role, password_hash) VALUES ($1, 'x', 'distributor', $2)",
      [`${randomUUID()}@example.test`, hash]), { code: "23514" }, "a distributor needs a company");
    await db.query("ROLLBACK TO SAVEPOINT attempt");
  });
});

test("only the operator script creates admins, and an admin signs in like any account", { skip, timeout: 30_000 }, async (t) => {
  const db = await connection(t, apiUrl);
  const migrator = await connection(t, migratorUrl);
  const email = `admin-${randomUUID()}@example.test`;
  onCleanup(t, () => migrator.query("DELETE FROM auth.users WHERE email = $1", [email]));
  const run = (input) => spawnSync(process.execPath, ["src/create-admin.mjs", "--email", email, "--name", "Fixture Admin"], {
    input, encoding: "utf8", env: { PATH: process.env.PATH, DATABASE_URL: migratorUrl },
    cwd: new URL("../..", import.meta.url),
  });
  assert.equal(run("too short").status, 1);
  const created = run(`${password}\n`);
  assert.equal(created.status, 0, created.stderr);
  assert.doesNotMatch(created.stdout + created.stderr, /argon2|C2 disposable/);
  assert.equal(run(password).status, 1, "an existing email is never changed");
  assert.deepEqual((await migrator.query("SELECT role, status FROM auth.users WHERE email = $1", [email])).rows, [{ role: "admin", status: "approved" }]);

  await withTestApi(t, db, async (request) => {
    const login = await request("login", { body: { email, password } });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.role, "admin");
    assert.equal(login.body.user.canAccessDistributorFeatures, false);
  });
});
