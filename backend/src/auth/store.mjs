const publicUserColumns = "id, email, name, company, phone, location, role, status";

// consented_at is the database time of this request; the request body only carries the explicit consent flag.
export async function insertPendingUser(db, { email, name, company, phone, location }, passwordHash) {
  const { rows } = await db.query(
    `INSERT INTO auth.users (email, name, company, phone, location, consented_at, password_hash)
     VALUES ($1, $2, $3, $4, $5, statement_timestamp(), $6)
     ON CONFLICT (email) DO NOTHING
     RETURNING ${publicUserColumns}`,
    [email, name, company, phone, location, passwordHash],
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
    `SELECT u.id, u.email, u.name, u.company, u.phone, u.location, u.role, u.status
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

/**
 * Failure-based limits (D-133). Each entry is { scope, keyHash, limit, seconds }. Returns the first entry
 * whose unexpired counter has reached its limit, with the seconds until it resets, or null.
 */
export async function findBlockingLimit(db, entries) {
  const { rows } = await db.query(
    `SELECT scope, attempts, GREATEST(1, ceil(extract(epoch FROM expires_at - statement_timestamp())))::integer AS retry_after
     FROM auth.rate_limits
     WHERE expires_at > statement_timestamp()
       AND (scope, key_hash) IN (SELECT * FROM unnest($1::text[], $2::bytea[]))`,
    [entries.map((entry) => entry.scope), entries.map((entry) => entry.keyHash)],
  );
  for (const entry of entries) {
    const row = rows.find((candidate) => candidate.scope === entry.scope);
    if (row && row.attempts >= entry.limit) return { scope: entry.scope, retryAfter: row.retry_after };
  }
  return null;
}

/** Count one failed login in every bucket. A bucket restarts its window once it has expired. */
export async function recordFailures(db, entries) {
  await db.query(
    `INSERT INTO auth.rate_limits AS r (scope, key_hash, attempts, expires_at)
     SELECT scope, key_hash, 1, statement_timestamp() + seconds * INTERVAL '1 second'
     FROM unnest($1::text[], $2::bytea[], $3::integer[]) AS f (scope, key_hash, seconds)
     ON CONFLICT (scope, key_hash) DO UPDATE SET
       attempts = CASE WHEN r.expires_at <= statement_timestamp() THEN 1 ELSE r.attempts + 1 END,
       expires_at = CASE WHEN r.expires_at <= statement_timestamp() THEN EXCLUDED.expires_at ELSE r.expires_at END`,
    [entries.map((entry) => entry.scope), entries.map((entry) => entry.keyHash), entries.map((entry) => entry.seconds)],
  );
}

export async function clearLimit(db, scope, keyHash) {
  await db.query("DELETE FROM auth.rate_limits WHERE scope = $1 AND key_hash = $2", [scope, keyHash]);
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
