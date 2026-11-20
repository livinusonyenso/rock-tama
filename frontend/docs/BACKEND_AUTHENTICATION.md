# Phase C2 distributor authentication

## Follow a request through the stack

1. **Next.js form.** When the account forms are connected, `frontend/components/account/DistributorAuthForm.tsx` will send the registration or login fields as JSON to `/api/v1/auth` on the storefront origin. The browser will supply `Origin` on the POST and handle the HttpOnly cookie. The existing form and demo flow are still in place. Use the terminal examples below for the implemented C2 paths.
2. **Express route.** `backend/src/server.mjs` reads `AUTH_ORIGIN` and passes it with the connection pool from `backend/src/db.mjs` into `backend/src/app.mjs`. The app mounts `backend/src/auth/router.mjs`. It checks `Origin` before parsing JSON or using a session. Registration and login require uncompressed JSON up to 8 KiB.
3. **Validation and throttling.** `backend/src/auth/validation.mjs` checks exact fields, normalizes email, and validates name, company and password. `backend/src/auth/store.mjs` uses atomic PostgreSQL counters for registration by IP and login by IP and normalized email. This shares the limits between API processes.
4. **Password hashing.** `backend/src/auth/security.mjs` uses Argon2id with a random salt and 19 MiB of memory, two iterations, and one lane. Registration hashes the password. Login verifies the supplied password against the stored hash. An unknown email goes through a dummy Argon2id verification and gets the same error as a wrong password.
5. **PostgreSQL.** `backend/migrations/002_auth.sql`, owned by `rocktama_migrator`, creates `auth.users`, `auth.sessions`, and `auth.rate_limits`. `store.mjs` uses parameterized SQL as `rocktama_api`. A unique index on the normalized email handles simultaneous registrations. Database defaults assign `distributor` and `pending`, and the API role cannot insert or update those columns. Registration returns the pending user and creates no session.
6. **Session and cookie.** Successful login creates 32 random bytes, encodes them as a base64url token, and stores a SHA-256 hash in PostgreSQL with an eight-hour expiry. If login included a previous session cookie, the same database statement revokes it and inserts the new session. Express sets the raw token in a host-only `HttpOnly; SameSite=Strict; Path=/` cookie. HTTPS uses `Secure` and the `__Host-rocktama_session` name. Explicit HTTP loopback configuration uses `rocktama_session` for local testing.
7. **API response.** Login returns the public user object with `Cache-Control: no-store`. `GET /me` hashes the cookie, checks expiry in PostgreSQL, and returns only its owner. The server computes distributor access using the current database role and status. Logout deletes the active session and expires the cookie. A pending account can use `/me` and `/logout`. Approved-distributor operations will need their own server-side approval checks when introduced.

## HTTP contracts

Base URL for local Compose is `http://127.0.0.1:4000/api/v1/auth`. Every request other than `GET`, `HEAD` or `OPTIONS` requires an `Origin` header exactly matching `AUTH_ORIGIN`; local Compose defaults to `http://127.0.0.1:4000`. Registration and login use `Content-Type: application/json`. Logout uses an empty body and the session cookie. `GET /me` uses the session cookie. Use the same host consistently so the browser sends the host-only cookie.

| Method and path | Request | Success |
|---|---|---|
| `POST /register` | `email`, `password`, `name`, `company` | `201` with `{ "user": … }`. The account starts pending and registration sets no cookie. |
| `POST /login` | `email`, `password` | `200` with `{ "user": … }` and a session cookie. |
| `POST /logout` | Current session cookie | `204` with an empty body and a clearing cookie. |
| `GET /me` | Current session cookie | `200` with `{ "user": … }`. |

Example registration body

```json
{
  "email": "ada@example.test",
  "password": "example passphrase for documentation",
  "name": "Ada Okafor",
  "company": "Example Supplies"
}
```

Registration requires a 15–128 character password, a name of 1–100 characters, and a company of 1–150 characters. Email is trimmed, lowercased and limited to 254 characters. Name and company are trimmed. Passwords are preserved exactly. The four listed fields are the C2 registration contract. Phone, location, confirmation and consent handling belong to the later form integration.

Example successful response for a pending account

```json
{
  "user": {
    "id": "20fb3c9f-c984-46ae-8f56-f8b51c2af3e1",
    "email": "ada@example.test",
    "name": "Ada Okafor",
    "company": "Example Supplies",
    "role": "distributor",
    "status": "pending",
    "canAccessDistributorFeatures": false
  }
}
```

Errors use `{ "error": { "code": "…", "message": "…" } }`. For example, an expired session receives `401` with `{"error":{"code":"authentication_required","message":"An active session is required."}}`.

| Status | Code | Meaning |
|---|---|---|
| `400` | `invalid_input` | Invalid fields or malformed JSON. |
| `401` | `invalid_credentials` or `authentication_required` | Incorrect login, missing session, or an invalid, expired or revoked session. |
| `403` | `origin_forbidden` | A POST had a missing or unexpected origin. |
| `404` | `not_found` | Unknown auth route. |
| `409` | `registration_conflict` | The normalized email is already registered. |
| `413` | `request_too_large` | JSON body exceeds the size limit. |
| `415` | `unsupported_media_type` | Wrong content type, encoding or charset. |
| `429` | `rate_limited` | Registration allows 10 attempts per IP per hour. Login allows 30 per IP and 5 per normalized email per 15 minutes. The headers include `Retry-After`. |
| `500` | `internal_error` | An unexpected backend failure. |
| `503` | `try_again` | Four password jobs are already running in this API process. Retry after one second. |

## Run the tests from the repository root

Use Node.js `26.13.1` or a newer 26.x LTS patch, Docker Desktop and the project’s `.env.docker`. If the file is missing, copy `.env.docker.example` and generate three distinct local passwords with `openssl rand -hex 24`. Preserve the current `.env.docker` when using an existing volume.

```bash
npm --prefix backend ci
npm --prefix backend test

docker compose --env-file .env.docker \
  -f compose.yml -f compose.db.yml -f compose.migrate.yml \
  up --build -d --wait

npm --prefix backend run test:compose
```

`test:compose` reads credentials without echoing them and connects to `127.0.0.1:15432` as the two restricted roles. The tests roll back their writes. The expired-session test removes only its uniquely generated fixture through the migrator. This command fails when the database is unavailable or the migration is missing. On a re-run of Compose, `migrate` checks the stored checksums and reports that already applied files were skipped.

## Try the API from a VS Code terminal

The example uses the default local origin, creates one uniquely named pending test account, and logs it out. The pending account remains in the local database. The generated password and cookie stay out of terminal output. Use `test:compose` for the rollback-based checks.

```bash
(
  set -eu
  umask 077
  auth_origin=http://127.0.0.1:4000
  auth_base="$auth_origin/api/v1/auth"
  auth_email="rocktama-c2-$(openssl rand -hex 8)@example.test"
  auth_password=$(openssl rand -hex 24)
  auth_jar=$(mktemp)
  trap 'rm -f "$auth_jar"' EXIT

  printf '{"email":"%s","password":"%s","name":"Local test","company":"Example Supplies"}' \
    "$auth_email" "$auth_password" | curl -fsS "$auth_base/register" \
      -H "Origin: $auth_origin" -H 'Content-Type: application/json' --data-binary @-
  printf '\n'

  printf '{"email":"%s","password":"%s"}' "$auth_email" "$auth_password" | \
    curl -fsS "$auth_base/login" -c "$auth_jar" \
      -H "Origin: $auth_origin" -H 'Content-Type: application/json' --data-binary @-
  printf '\n'

  curl -fsS "$auth_base/me" -b "$auth_jar"
  printf '\n'
  curl -fsS -X POST "$auth_base/logout" -b "$auth_jar" -c "$auth_jar" \
    -H "Origin: $auth_origin" -w 'logout HTTP %{http_code}\n'
)
```

## Remaining security and integration work

Before public rollout, verify email ownership and define account recovery, approval and revocation workflows. The current duplicate-registration `409` reveals whether an email is registered. A per-email login limit can temporarily throttle a targeted account. Revisit both behaviors with the email verification and abuse controls. Validate cookies and same-origin routing through the intended TLS proxy, set trusted proxy handling for that topology, and verify that client IPs reach the limiter without trusting arbitrary forwarded headers. Expired rows are cleaned in bounded batches during auth traffic. Review retention and monitoring once traffic patterns are known.

## Architecture Explorer

The [Architecture Explorer artifact](https://claude.ai/artifact/DYcaeT9pZKX3radGjcTn3t) (version 2, 20 Nov 2026) shows the C1 start-up sequence, database roles and graceful shutdown. It also shows the four C2 routes as verified request flows, with code excerpts copied from these files. Frontend wiring (C3), CI and AWS remain marked as proposed or not started.
