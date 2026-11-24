-- Per-type registration details (D-138). Additive only; existing accounts keep an empty profile.
-- Non-sensitive details (addresses, vehicle, business information) live in one validated JSON object that the
-- API writes at registration and returns from /me. The API validates every field (validation.mjs); the
-- database bounds the shape and size.
ALTER TABLE auth.users
  ADD COLUMN profile JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(profile) = 'object' AND pg_column_size(profile) <= 4096);
GRANT INSERT (profile) ON auth.users TO rocktama_api;

-- Driver identity numbers (driver's licence or NIN) are sensitive personal data. They are kept out of
-- auth.users, and the runtime role may INSERT them but never SELECT, UPDATE or DELETE them: a bug or a stolen
-- API credential cannot read them back. The profile keeps only the ID type and last four characters for display.
-- Reading full numbers (for verification by staff) needs a separate, later-approved role.
CREATE TABLE auth.driver_identities (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  id_type TEXT NOT NULL CHECK (id_type IN ('drivers_licence', 'nin')),
  id_number TEXT NOT NULL CHECK (
    (id_type = 'nin' AND id_number ~ '^[0-9]{11}$') OR
    (id_type = 'drivers_licence' AND id_number ~ '^[A-Z0-9]{8,15}$')
  ),
  licence_expiry DATE CHECK ((id_type = 'drivers_licence') = (licence_expiry IS NOT NULL)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);
GRANT INSERT (user_id, id_type, id_number, licence_expiry) ON auth.driver_identities TO rocktama_api;
