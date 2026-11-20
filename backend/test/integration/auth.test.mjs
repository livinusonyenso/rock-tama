import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import test from "node:test";
import pg from "pg";
import { createApp } from "../../src/app.mjs";
import { createSessionToken, hashPassword, hashValue, verifyPassword } from "../../src/auth/security.mjs";

const apiUrl = process.env.API_DATABASE_URL;
const migratorUrl = process.env.MIGRATOR_DATABASE_URL;
const skip = apiUrl && migratorUrl ? false : "set API_DATABASE_URL and MIGRATOR_DATABASE_URL";
const origin = "http://127.0.0.1:4000";
const password = "C2 disposable integration password";

function registration() {
  return { email: `${randomUUID()}@example.test`, password, name: "Ada Okafor", company: "Example Supplies" };
}

async function connection(t, connectionString) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  t.after(() => client.end());
  return client;
}

async function withTestApi(t, db, run) {
  const server = createApp({ db, authOrigin: origin }).listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}/api/v1/auth`;
  try {
    return await run(async (endpoint, { body, method = "POST", headers = { origin }, raw } = {}) => {
      const requestHeaders = new Headers(headers);
      if (body !== undefined) requestHeaders.set("content-type", "application/json");
      const response = await fetch(`${base}/${endpoint}`, {
        method, headers: requestHeaders, body: raw ?? JSON.stringify(body),
      });
      return { status: response.status, headers: response.headers, body: response.status === 204 ? null : await response.json() };
    });
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

async function inRuntimeTransaction(t, run) {
  const db = await connection(t, apiUrl);
  await db.query("BEGIN");
  try {
    // The fixture server uses 127.0.0.1 as its source address. Any local bucket is restored at rollback.
    await db.query("DELETE FROM auth.rate_limits WHERE scope IN ('register_ip', 'login_ip') AND key_hash = $1", [hashValue("127.0.0.1")]);
    return await withTestApi(t, db, (request) => run(request, db));
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
      assert.equal(result.status, 201);
      assert.equal(result.headers.get("set-cookie"), null);
      user = result.body.user;
      assert.deepEqual(user, { id: user.id, email, name: fields.name, company: fields.company,
        role: "distributor", status: "pending", canAccessDistributorFeatures: false });
      const { rows } = await db.query("SELECT password_hash FROM auth.users WHERE id = $1", [user.id]);
      assert.match(rows[0].password_hash, /^\$argon2id\$/);
      assert.equal(await verifyPassword(rows[0].password_hash, password), true);
      assert.equal((await db.query("SELECT 1 FROM auth.sessions WHERE user_id = $1", [user.id])).rowCount, 0);
    });

    await t.test("duplicate, invalid input and privilege injection return safe errors", async () => {
      assertError(await request("register", { body: fields }), 409, "registration_conflict");
      assertError(await request("register", { body: { ...fields, email: "invalid" } }), 400, "invalid_input");
      assertError(await request("register", { body: { ...fields, role: "admin", status: "approved" } }), 400, "invalid_input");
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
      for (const attribute of ["HttpOnly", "SameSite=Strict", "Path=/", "Max-Age=28800"]) assert.ok(setCookie.includes(attribute));
      cookie = setCookie.split(";", 1)[0];
      cookieHash = hashValue(cookie.slice("rocktama_session=".length));
      const { rows } = await db.query("SELECT token_hash, expires_at > created_at AS valid_expiry FROM auth.sessions WHERE user_id = $1", [user.id]);
      assert.equal(rows.length, 1);
      assert.ok(rows[0].token_hash.equals(cookieHash));
      assert.equal(rows[0].valid_expiry, true);
    });

    await t.test("session identifies only its owner and pending access stays restricted", async () => {
      const result = await request("me", { method: "GET", headers: { cookie } });
      assert.equal(result.status, 200);
      assert.equal(result.headers.get("cache-control"), "no-store");
      assert.deepEqual(result.body.user, user);
      assert.equal(result.body.user.canAccessDistributorFeatures, false);
      const fake = `rocktama_session=${createSessionToken()}`;
      assertError(await request("me", { method: "GET", headers: { cookie: fake } }), 401, "authentication_required");
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

test("PostgreSQL enforces registration and login limits by IP and login email", { skip, timeout: 20_000 }, async (t) => {
  await inRuntimeTransaction(t, async (request) => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      assertError(await request("register", { body: {} }), 400, "invalid_input");
    }
    const registrationBlocked = await request("register", { body: registration() });
    assertError(registrationBlocked, 429, "rate_limited");
    assert.equal(registrationBlocked.headers.get("retry-after"), "3600");

    const { email } = registration();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      assertError(await request("login", { body: { email, password } }), 401, "invalid_credentials");
    }
    const accountBlocked = await request("login", { body: { email: email.toUpperCase(), password } });
    assertError(accountBlocked, 429, "rate_limited");
    assert.equal(accountBlocked.headers.get("retry-after"), "900");

    for (let attempt = 6; attempt < 30; attempt += 1) {
      assertError(await request("login", { body: {} }), 400, "invalid_input");
    }
    assertError(await request("login", { body: { email: registration().email, password }, headers: { origin, "x-forwarded-for": "198.51.100.42" } }), 429, "rate_limited");
  });
});

test("an expired session with a matching hash cannot authenticate or log out", { skip, timeout: 20_000 }, async (t) => {
  const db = await connection(t, apiUrl);
  const migrator = await connection(t, migratorUrl);
  const fixture = registration();
  const { rows: [user] } = await migrator.query(
    "INSERT INTO auth.users (email, name, company, password_hash) VALUES ($1,$2,$3,$4) RETURNING id",
    [fixture.email, fixture.name, fixture.company, await hashPassword(password)],
  );
  try {
    const token = createSessionToken();
    await migrator.query(`INSERT INTO auth.sessions (user_id, token_hash, created_at, expires_at)
      VALUES ($1, $2, now() - INTERVAL '9 hours', now() - INTERVAL '1 hour')`, [user.id, hashValue(token)]);
    const cookie = `rocktama_session=${token}`;
    await withTestApi(t, db, async (request) => {
      assertError(await request("me", { method: "GET", headers: { cookie } }), 401, "authentication_required");
      assertError(await request("logout", { headers: { origin, cookie } }), 401, "authentication_required");
    });
  } finally {
    await migrator.query("DELETE FROM auth.users WHERE id = $1", [user.id]);
  }
});

test("distributor access follows the stored status on every request", { skip, timeout: 20_000 }, async (t) => {
  const db = await connection(t, apiUrl);
  const migrator = await connection(t, migratorUrl);
  const fixture = registration();
  // Only the migrator can approve. Customer registration and the API role cannot.
  const { rows: [user] } = await migrator.query(
    "INSERT INTO auth.users (email, name, company, password_hash, status) VALUES ($1,$2,$3,$4,'approved') RETURNING id",
    [fixture.email, fixture.name, fixture.company, await hashPassword(password)],
  );
  try {
    const token = createSessionToken();
    await migrator.query("INSERT INTO auth.sessions (user_id, token_hash) VALUES ($1, $2)", [user.id, hashValue(token)]);
    const cookie = `rocktama_session=${token}`;
    await withTestApi(t, db, async (request) => {
      const approved = await request("me", { method: "GET", headers: { cookie } });
      assert.equal(approved.body.user.status, "approved");
      assert.equal(approved.body.user.canAccessDistributorFeatures, true);
      await migrator.query("UPDATE auth.users SET status = 'pending' WHERE id = $1", [user.id]);
      const pending = await request("me", { method: "GET", headers: { cookie } });
      assert.equal(pending.body.user.status, "pending");
      assert.equal(pending.body.user.canAccessDistributorFeatures, false);
      // Other state-changing methods are also bound to the configured origin.
      assertError(await request("logout", { method: "DELETE", headers: { cookie } }), 403, "origin_forbidden");
    });
  } finally {
    await migrator.query("DELETE FROM auth.users WHERE id = $1", [user.id]);
  }
});

test("the migrator owns C2 objects and only it can change privileges or schema", { skip }, async (t) => {
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
    "DELETE FROM auth.users WHERE false",
    "UPDATE auth.sessions SET expires_at = now() WHERE false",
    "ALTER TABLE auth.users ADD COLUMN c2_must_not_exist integer",
    "CREATE TABLE auth.c2_must_not_exist (id integer)",
  ]) {
    await db.query("BEGIN");
    try {
      await assert.rejects(db.query(sql), { code: "42501" });
    } finally {
      await db.query("ROLLBACK");
    }
  }
  const migration = await readFile(new URL("../../migrations/002_auth.sql", import.meta.url));
  const { rows: checksums } = await db.query("SELECT checksum FROM public.schema_migrations WHERE name = $1", ["002_auth.sql"]);
  assert.deepEqual(checksums, [{ checksum: createHash("sha256").update(migration).digest("hex") }]);
});
