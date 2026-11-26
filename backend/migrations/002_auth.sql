-- Keep authentication grants separate from C1's default grants on public tables.
CREATE SCHEMA auth;
GRANT USAGE ON SCHEMA auth TO rocktama_api;

CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT COLLATE "C" NOT NULL UNIQUE
    CHECK (length(email) BETWEEN 3 AND 254 AND email = lower(email)),
  name TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 100),
  company TEXT NOT NULL CHECK (char_length(btrim(company)) BETWEEN 1 AND 150),
  password_hash TEXT NOT NULL CHECK (password_hash LIKE '$argon2id$%'),
  role TEXT NOT NULL DEFAULT 'distributor' CHECK (role = 'distributor'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

CREATE TABLE auth.sessions (
  token_hash BYTEA PRIMARY KEY CHECK (octet_length(token_hash) = 32),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (statement_timestamp() + INTERVAL '8 hours'),
  CHECK (expires_at > created_at)
);
CREATE INDEX sessions_user_id_idx ON auth.sessions (user_id);
CREATE INDEX sessions_expires_at_idx ON auth.sessions (expires_at);

CREATE TABLE auth.rate_limits (
  scope TEXT NOT NULL CHECK (scope IN ('register_ip', 'login_ip', 'login_email')),
  key_hash BYTEA NOT NULL CHECK (octet_length(key_hash) = 32),
  attempts INTEGER NOT NULL CHECK (attempts > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (scope, key_hash)
);
CREATE INDEX rate_limits_expires_at_idx ON auth.rate_limits (expires_at);

-- Defaults, rather than request bodies or API SQL, control role, status and expiry.
GRANT SELECT ON auth.users TO rocktama_api;
GRANT INSERT (email, name, company, password_hash) ON auth.users TO rocktama_api;
GRANT SELECT, DELETE ON auth.sessions TO rocktama_api;
GRANT INSERT (token_hash, user_id) ON auth.sessions TO rocktama_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.rate_limits TO rocktama_api;
