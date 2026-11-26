import { parseArgs } from "node:util";
import pg from "pg";
import { hashPassword, verifyPassword } from "../src/auth/security.mjs";
import { findUserForLogin, insertRegisteredUser } from "../src/auth/store.mjs";
import { validateRegistration } from "../src/auth/validation.mjs";

const password = "RockTama-Local-Demo-Only!";
const common = {
  password,
  phone: "+234 000 000 0000",
  street: "1 Demo Test Street",
  city: "Enugu",
  state: "Enugu",
  consent: true,
};
const accounts = [
  { ...common, accountType: "customer", email: "customer.demo@example.test", name: "Demo Customer" },
  {
    ...common,
    accountType: "driver",
    email: "driver.demo@example.test",
    name: "Demo Driver",
    dateOfBirth: "1990-01-01",
    idType: "nin",
    idNumber: "00000000000",
    licenceExpiry: "",
    vehicleType: "van",
    plateNumber: "DEM0001",
    operatingArea: "Enugu",
    availability: "part_time",
  },
  {
    ...common,
    accountType: "distributor",
    email: "distributor.demo@example.test",
    name: "Demo Distributor",
    position: "Owner",
    company: "Demo Water Supply",
    businessType: "wholesaler",
    cacNumber: "",
    supplyAreas: "Enugu",
    monthlyVolume: "under_50",
    hasStorage: true,
    hasVehicle: false,
  },
];

async function seed(db) {
  const results = [];
  await db.query("BEGIN");
  try {
    for (const account of accounts) {
      const registration = validateRegistration(account);
      if (!registration) throw new Error(`Invalid local fixture for ${account.email}.`);

      let user = await findUserForLogin(db, account.email);
      let created = false;
      if (!user) {
        created = await insertRegisteredUser(db, registration, await hashPassword(password));
        user = await findUserForLogin(db, account.email);
      }
      if (!user || user.role !== account.accountType || !await verifyPassword(user.password_hash, password)) {
        throw new Error(`An account already uses ${account.email} with different credentials or role. Choose a fresh local database to load these fixtures.`);
      }
      results.push({ id: user.id, email: user.email, role: user.role, status: user.status, result: created ? "created" : "already available" });
    }
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
  return results;
}

const { values: { approve } } = parseArgs({ options: { approve: { type: "boolean" } } });
const { POSTGRES_DB, API_DB_PASSWORD, MIGRATOR_PASSWORD, DEPLOY_MODE } = process.env;

// These fixtures always target the loopback port published by the development Compose stack.
function localClient(user, password) {
  return new pg.Client({
    host: "127.0.0.1",
    port: 15432,
    database: POSTGRES_DB,
    user,
    password,
    connectionTimeoutMillis: 5000,
  });
}

async function approveDemoAccounts(accounts) {
  const pending = accounts.filter(account => account.status === "pending");
  if (!pending.length) return;

  // Keep approval under the database owner. The API role only registers users.
  const operator = localClient("rocktama_migrator", MIGRATOR_PASSWORD);
  try {
    await operator.connect();
    await operator.query("BEGIN");
    const { rows } = await operator.query(
      `UPDATE auth.users SET status = 'approved'
       WHERE status = 'pending' AND (id, email, role) IN (
         SELECT * FROM unnest($1::uuid[], $2::text[], $3::text[])
       )
       RETURNING id`,
      [pending.map(account => account.id), pending.map(account => account.email), pending.map(account => account.role)],
    );
    if (rows.length !== pending.length) throw new Error("The demo accounts changed during approval. Run the setup again to verify their status.");
    await operator.query("COMMIT");
    for (const account of pending) account.status = "approved";
  } finally {
    await operator.end();
  }
}

if (DEPLOY_MODE === "production" || !POSTGRES_DB || !API_DB_PASSWORD || (approve && !MIGRATOR_PASSWORD)) {
  console.error("Use the local Docker test database. Run this script from the repository root with --env-file=.env.docker.");
  process.exitCode = 1;
} else {
  const db = localClient("rocktama_api", API_DB_PASSWORD);
  try {
    await db.connect();
    const results = await seed(db);
    if (approve) await approveDemoAccounts(results);
    console.table(results, ["email", "role", "status", "result"]);
  } catch (error) {
    console.error(error.code ? `Local demo setup failed (${error.code}). Check that Docker Compose and migrations are ready.` : error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}
