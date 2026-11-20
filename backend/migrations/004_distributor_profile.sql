-- C3B (D-134): business details the existing registration form collects for distributor review.
-- Nullable so earlier accounts stay valid; the API requires all three for every new registration.
ALTER TABLE auth.users
  ADD COLUMN phone TEXT CHECK (phone ~ '^\+?[0-9 ()-]{7,20}$'),
  ADD COLUMN location TEXT CHECK (char_length(btrim(location)) BETWEEN 2 AND 80),
  ADD COLUMN consented_at TIMESTAMPTZ;

-- The runtime role may record these at registration only; it still cannot update users.
GRANT INSERT (phone, location, consented_at) ON auth.users TO rocktama_api;
