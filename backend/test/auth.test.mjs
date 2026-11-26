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

test("the pre-D-137 distributor form still registers a distributor (older clients)", () => {
  assert.deepEqual(validateRegistration(registration), {
    email: "owner+shop@example.test", name: "Ada Okafor", company: "Ada's Water Supply",
    phone: "+234 803 123 4567", location: "Enugu, Enugu State", password: registration.password,
    role: "distributor", vehicleType: null, profile: {}, identity: null,
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

// D-138 per-type forms. A fixed "today" keeps age and expiry checks deterministic.
const today = new Date(Date.UTC(2026, 10, 24));
const base = {
  email: "Chidi@Example.test", password: registration.password, name: "Chidi Eze", phone: "+234 803 765 4321",
  street: " 12 Zik Avenue ", city: "Awka", state: "Anambra", consent: true,
};
const customer = { ...base, accountType: "customer" };
const driver = {
  ...base, accountType: "driver", dateOfBirth: "1990-05-17", idType: "nin", idNumber: "123 4567 8901", licenceExpiry: "",
  vehicleType: "tricycle", plateNumber: "abc-123de", operatingArea: "Awka, Nnewi", availability: "full_time",
};
const distributor = {
  ...base, accountType: "distributor", position: "Managing Director", company: "Eze Water Supply", businessType: "wholesaler",
  cacNumber: "rc 123456", supplyAreas: "Awka and Onitsha", monthlyVolume: "50_200", hasStorage: true, hasVehicle: false,
};

test("customers give a delivery address; the account location is its city and state", () => {
  const result = validateRegistration(customer, today);
  assert.equal(result.role, "customer");
  assert.equal(result.location, "Awka, Anambra");
  assert.deepEqual(result.profile, { address: { street: "12 Zik Avenue", city: "Awka", state: "Anambra" } });
  assert.equal(result.identity, null);
  assert.equal(result.company, null);
});

test("drivers: ID number goes only to the identity record; the profile keeps its type and last four", () => {
  const result = validateRegistration(driver, today);
  assert.deepEqual(result.identity, { idType: "nin", idNumber: "12345678901", licenceExpiry: null });
  assert.equal(result.vehicleType, "tricycle");
  assert.deepEqual(result.profile, {
    address: { street: "12 Zik Avenue", city: "Awka", state: "Anambra" }, dateOfBirth: "1990-05-17", idType: "nin", idLast4: "8901",
    licenceExpiry: null, plateNumber: "ABC123DE", operatingArea: "Awka, Nnewi", availability: "full_time",
  });
  assert.ok(!JSON.stringify(result.profile).includes("12345678901"), "the full NIN never enters the profile");
  const licence = validateRegistration({ ...driver, idType: "drivers_licence", idNumber: "abc12345aa67", licenceExpiry: "2028-01-31" }, today);
  assert.deepEqual(licence.identity, { idType: "drivers_licence", idNumber: "ABC12345AA67", licenceExpiry: "2028-01-31" });
});

test("drivers must be 18 to 80, with a valid, unexpired ID and the right expiry rule", () => {
  for (const invalid of [
    { dateOfBirth: "2009-11-25" }, { dateOfBirth: "1940-01-01" }, { dateOfBirth: "1990-02-30" }, { dateOfBirth: "17/05/1990" },
    { idNumber: "1234567890" }, { idNumber: "1234567890A" }, { idType: "passport" },
    { idType: "drivers_licence", idNumber: "ABC12345AA67", licenceExpiry: "" },
    { idType: "drivers_licence", idNumber: "ABC12345AA67", licenceExpiry: "2026-11-23" },
    { idType: "drivers_licence", idNumber: "AB12", licenceExpiry: "2028-01-31" },
    { licenceExpiry: "2028-01-31" }, { plateNumber: "A1" }, { vehicleType: "helicopter" }, { availability: "sometimes" }, { operatingArea: "" },
  ]) assert.equal(validateRegistration({ ...driver, ...invalid }, today), null, JSON.stringify(invalid));
  assert.ok(validateRegistration({ ...driver, dateOfBirth: "2008-11-24" }, today), "18 today is allowed");
  assert.ok(validateRegistration({ ...driver, idType: "drivers_licence", idNumber: "ABC12345AA67", licenceExpiry: "2026-11-24" }, today), "expires today is still valid");
});

test("distributors: business details, optional CAC number and yes/no answers", () => {
  const result = validateRegistration(distributor, today);
  assert.equal(result.company, "Eze Water Supply");
  assert.deepEqual(result.profile, {
    address: { street: "12 Zik Avenue", city: "Awka", state: "Anambra" }, position: "Managing Director", businessType: "wholesaler",
    cacNumber: "RC123456", supplyAreas: "Awka and Onitsha", monthlyVolume: "50_200", hasStorage: true, hasVehicle: false,
  });
  assert.equal(validateRegistration({ ...distributor, cacNumber: "" }, today).profile.cacNumber, null);
  for (const invalid of [
    { cacNumber: "123456" }, { cacNumber: "XY123456" }, { businessType: "bank" }, { monthlyVolume: "lots" },
    { hasStorage: "yes" }, { hasVehicle: null }, { company: "" }, { position: "" }, { supplyAreas: "" },
  ]) assert.equal(validateRegistration({ ...distributor, ...invalid }, today), null, JSON.stringify(invalid));
});

test("account types reject admin, unknown types, missing fields and fields from another type", () => {
  for (const invalid of [
    { ...customer, accountType: "admin" }, { ...customer, accountType: "Customer" }, { ...customer, accountType: null },
    { ...customer, company: "x" }, { ...customer, vehicleType: "van" }, (({ street, ...rest }) => rest)(customer),
    { ...driver, company: "x" }, (({ idNumber, ...rest }) => rest)(driver), { ...distributor, idNumber: "12345678901" },
    { ...customer, role: "admin" }, { ...customer, status: "approved" }, { ...customer, city: "A" },
    { ...registration, accountType: "distributor" },
  ]) assert.equal(validateRegistration(invalid, today), null, JSON.stringify(Object.keys(invalid)));
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
