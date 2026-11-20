import assert from "node:assert/strict";
import test from "node:test";
import {
  authCookieConfig, createSessionToken, hashPassword, hashValue, readSessionToken, verifyPassword,
} from "../src/auth/security.mjs";
import { validateLogin, validateRegistration } from "../src/auth/validation.mjs";

const registration = {
  email: " Owner+Shop@Example.test ",
  name: " Ada Okafor ",
  company: " Ada's Water Supply ",
  phone: " +234  803 123 4567 ",
  location: " Enugu, Enugu State ",
  consent: true,
  password: " a long unique password ",
};

test("registration normalizes identity fields and preserves the password", () => {
  assert.deepEqual(validateRegistration(registration), {
    email: "owner+shop@example.test", name: "Ada Okafor", company: "Ada's Water Supply",
    phone: "+234 803 123 4567", location: "Enugu, Enugu State", password: registration.password,
  });
  assert.equal(validateLogin({ email: registration.email, password: "wrong" }).email, "owner+shop@example.test");
});

test("validation rejects malformed fields, short passwords and privilege injection", () => {
  for (const invalid of [
    null, [], { ...registration, email: "a..b@example.test" }, { ...registration, email: "a@-bad.test" },
    { ...registration, name: " \u0000 " }, { ...registration, company: "a".repeat(151) },
    { ...registration, password: "short" }, { ...registration, password: "🐟".repeat(129) },
    { ...registration, role: "admin" }, { ...registration, status: "approved" },
    { ...registration, phone: "call me" }, { ...registration, phone: "12345" }, { ...registration, location: "E" },
    { ...registration, consent: "yes" }, { ...registration, consent: false }, (({ consent, ...rest }) => rest)(registration),
    { ...registration, confirmPassword: registration.password },
  ]) assert.equal(validateRegistration(invalid), null);
  assert.equal(validateLogin({ email: registration.email, password: "" }), null);
});

test("Argon2id produces uniquely salted, verifiable hashes with the configured cost", async () => {
  const first = await hashPassword(registration.password);
  const second = await hashPassword(registration.password);
  assert.match(first, /^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
  assert.notEqual(first, second);
  assert.equal(await verifyPassword(first, registration.password), true);
  assert.equal(await verifyPassword(first, registration.password.trim()), false);
});

test("session tokens are random, hashed to 32 bytes and accepted from only one named cookie", () => {
  const token = createSessionToken();
  const name = "rocktama_session";
  assert.match(token, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(token, createSessionToken());
  assert.equal(hashValue(token).length, 32);
  assert.equal(readSessionToken(`other=value; ${name}=${token}`, name), token);
  assert.equal(readSessionToken(`${name}=${token}; ${name}=${token}`, name), null);
  assert.equal(readSessionToken(`${name}=malformed`, name), null);
});

test("cookies require HTTPS except on configured loopback and reject non-origin URLs", () => {
  const https = authCookieConfig("https://shop.example.test");
  assert.equal(https.name, "__Host-rocktama_session");
  assert.deepEqual(https.options, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
  assert.equal(authCookieConfig("http://127.0.0.1:4000").options.secure, false);
  const local = authCookieConfig("http://localhost:3000, http://127.0.0.1:3100");
  assert.deepEqual([...local.origins], ["http://localhost:3000", "http://127.0.0.1:3100"]);
  assert.equal(local.name, "rocktama_session");
  assert.throws(() => authCookieConfig("https://shop.example.test,http://localhost:3000"), /all be HTTPS/);
  assert.throws(() => authCookieConfig(""), /at least one/);
  assert.throws(() => authCookieConfig("http://shop.example.test"), /AUTH_ORIGIN/);
  assert.throws(() => authCookieConfig("https://shop.example.test/path"), /AUTH_ORIGIN/);
});
