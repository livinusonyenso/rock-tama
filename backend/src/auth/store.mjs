const publicUserColumns = "id, email, name, company, role, status";

export async function insertPendingUser(db, { email, name, company }, passwordHash) {
  const { rows } = await db.query(
    `INSERT INTO auth.users (email, name, company, password_hash)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING
     RETURNING ${publicUserColumns}`,
    [email, name, company, passwordHash],
  );
  return rows[0];
}

export async function findUserForLogin(db, email) {
  const { rows } = await db.query(
    `SELECT ${publicUserColumns}, password_hash FROM auth.users WHERE email = $1`,
    [email],
  );
  return rows[0];
}

export async function insertSession(db, userId, tokenHash, previousHash) {
  await db.query(
    `WITH replaced AS (DELETE FROM auth.sessions WHERE token_hash = $3)
     INSERT INTO auth.sessions (user_id, token_hash) VALUES ($1, $2)`,
    [userId, tokenHash, previousHash],
  );
}

export async function findSessionUser(db, tokenHash) {
  const { rows } = await db.query(
    `SELECT u.id, u.email, u.name, u.company, u.role, u.status
     FROM auth.sessions AS s JOIN auth.users AS u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > statement_timestamp()`,
    [tokenHash],
  );
  return rows[0];
}

export async function deleteActiveSession(db, tokenHash) {
  const { rowCount } = await db.query(
    "DELETE FROM auth.sessions WHERE token_hash = $1 AND expires_at > statement_timestamp()",
    [tokenHash],
  );
  return rowCount === 1;
}

export async function consumeAttempt(db, scope, keyHash, limit, seconds) {
  // The row lock taken by ON CONFLICT makes the check and increment atomic across API processes.
  const { rowCount } = await db.query(
    `INSERT INTO auth.rate_limits AS r (scope, key_hash, attempts, expires_at)
     VALUES ($1, $2, 1, statement_timestamp() + $3::integer * INTERVAL '1 second')
     ON CONFLICT (scope, key_hash) DO UPDATE SET
       attempts = CASE WHEN r.expires_at <= statement_timestamp() THEN 1 ELSE r.attempts + 1 END,
       expires_at = CASE WHEN r.expires_at <= statement_timestamp() THEN EXCLUDED.expires_at ELSE r.expires_at END
     WHERE r.expires_at <= statement_timestamp() OR r.attempts < $4`,
    [scope, keyHash, seconds, limit],
  );
  return rowCount === 1;
}

export async function pruneExpiredAuthRows(db) {
  // Bound each cleanup batch. Rate-limit rows can be renewed, so lock them before deleting.
  await db.query(`
    WITH expired_limits AS (
      SELECT scope, key_hash FROM auth.rate_limits
      WHERE expires_at <= statement_timestamp() ORDER BY expires_at LIMIT 100 FOR UPDATE SKIP LOCKED
    ), removed_limits AS (
      DELETE FROM auth.rate_limits AS r USING expired_limits AS e
      WHERE (r.scope, r.key_hash) = (e.scope, e.key_hash)
    ), expired_sessions AS (
      SELECT token_hash FROM auth.sessions
      WHERE expires_at <= statement_timestamp() ORDER BY expires_at LIMIT 100
    )
    DELETE FROM auth.sessions AS s USING expired_sessions AS e WHERE s.token_hash = e.token_hash
  `);
}
