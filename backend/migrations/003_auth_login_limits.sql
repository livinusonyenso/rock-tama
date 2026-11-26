-- C3A (D-133): failure-based login limits add a per email-and-IP bucket.
-- login_ip and login_email now count failed logins only. Counters are short-lived, so existing rows stay valid.
ALTER TABLE auth.rate_limits DROP CONSTRAINT rate_limits_scope_check;
ALTER TABLE auth.rate_limits ADD CONSTRAINT rate_limits_scope_check
  CHECK (scope IN ('register_ip', 'login_ip', 'login_email', 'login_email_ip'));
