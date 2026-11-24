-- Account roles (D-137): customers, drivers and distributors register publicly; admins never do.
-- Additive only. Existing distributor accounts keep their role, status, company and profile.
ALTER TABLE auth.users DROP CONSTRAINT users_role_check;
ALTER TABLE auth.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('customer', 'driver', 'distributor', 'admin'));

-- Company is a distributor detail; other roles may leave it empty.
ALTER TABLE auth.users ALTER COLUMN company DROP NOT NULL;
ALTER TABLE auth.users ADD CONSTRAINT users_company_required CHECK (role <> 'distributor' OR company IS NOT NULL);

-- Drivers state their vehicle; nobody else has one.
ALTER TABLE auth.users
  ADD COLUMN vehicle_type TEXT CHECK (vehicle_type IN ('motorcycle', 'tricycle', 'van', 'truck')),
  ADD CONSTRAINT users_vehicle_matches_role CHECK ((role = 'driver') = (vehicle_type IS NOT NULL));

-- The runtime role may now choose a role at registration. The trigger below, not the API, decides which
-- roles are allowed and which status each one starts with, so a compromised API cannot create an admin
-- or approve itself. Only the table owner (rocktama_migrator, used by the operator script) and the
-- bootstrap superuser can insert admins or choose a status.
CREATE FUNCTION auth.enforce_registration_role() RETURNS trigger
  LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  IF pg_has_role(current_user, 'rocktama_migrator', 'MEMBER') THEN
    RETURN NEW;
  END IF;
  IF NEW.role NOT IN ('customer', 'driver', 'distributor') THEN
    RAISE EXCEPTION 'role % cannot be self-registered', NEW.role USING ERRCODE = 'insufficient_privilege';
  END IF;
  -- Customers can use their account immediately; drivers and distributors wait for review.
  NEW.status := CASE NEW.role WHEN 'customer' THEN 'approved' ELSE 'pending' END;
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_enforce_registration_role
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auth.enforce_registration_role();

GRANT INSERT (role, vehicle_type) ON auth.users TO rocktama_api;
