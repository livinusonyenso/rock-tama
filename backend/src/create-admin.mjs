// Create an administrator account (D-137). Admins can never self-register; only an operator can add one.
// Run with the MIGRATOR connection (the table owner), with the password on stdin so it never appears in
// shell history, process lists or logs:
//   printf '%s' "$ADMIN_PASSWORD" | docker compose ... run --rm -T migrate node src/create-admin.mjs \
//     --email admin@example.test --name "Site Admin"
// Locally: printf '%s' "$PW" | DATABASE_URL=postgresql://rocktama_migrator:...@127.0.0.1:15432/rocktama \
//   node src/create-admin.mjs --email ... --name ...
// An existing email is left unchanged and the script exits with an error.
import { text } from "node:stream/consumers";
import { parseArgs } from "node:util";
import { hashPassword } from "./auth/security.mjs";
import { validateLogin } from "./auth/validation.mjs";
import { pool } from "./db.mjs";

const { values } = parseArgs({ options: { email: { type: "string" }, name: { type: "string" } } });
const password = (await text(process.stdin)).replace(/\r?\n$/, "");
const credentials = validateLogin({ email: values.email ?? "", password });
const name = values.name?.trim();
if (!credentials || !name || name.length > 100) {
  console.error("Usage: pipe the password on stdin and pass --email and --name.");
  process.exit(1);
}
if ([...password].length < 15) {
  console.error("Admin passwords must be at least 15 characters.");
  process.exit(1);
}

try {
  const { rowCount } = await pool.query(
    `INSERT INTO auth.users (email, name, role, status, password_hash)
     VALUES ($1, $2, 'admin', 'approved', $3) ON CONFLICT (email) DO NOTHING`,
    [credentials.email, name, await hashPassword(password)],
  );
  if (rowCount !== 1) {
    console.error("An account with this email already exists; nothing was changed.");
    process.exitCode = 1;
  } else {
    console.log(`Created admin account ${credentials.email}`);
  }
} catch (error) {
  // Never print the statement or its parameters (they include the password hash).
  console.error("Could not create the admin account", { code: error.code ?? error.name });
  process.exitCode = 1;
} finally {
  await pool.end();
}
