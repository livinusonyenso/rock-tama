CREATE TABLE IF NOT EXISTS public.app_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO public.app_metadata (key, value)
VALUES ('schema_version', '1')
ON CONFLICT (key) DO NOTHING;
