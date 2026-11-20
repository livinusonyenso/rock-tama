# Distributor authentication (C2, hardened in C3A, connected to Next.js in C3B)

## Follow a request through the stack

1. **Next.js form.** `frontend/components/account/DistributorAuthForm.tsx` (a client component) checks the obvious mistakes first: the password length and confirmation, the phone format and consent. It then sends JSON with `fetch("/api/v1/auth/register" | "/api/v1/auth/login")` to the storefront's own origin. The browser adds `Origin` and the HttpOnly cookie itself; no script can read the token. The demo dashboard (development and staging only) is a separate "Open demo dashboard" button.
1a. **Next.js gateway.** `frontend/app/api/v1/auth/[action]/route.ts` delegates to `frontend/lib/server/auth-gateway.ts`. It forwards only `register`, `login`, `logout` (POST) and `me` (GET) to `API_URL`, a server-only variable. Requests carry only `Content-Type`, the browser's `Origin`, the session cookie and, if configured, one client address. Responses carry only `Content-Type`, `Retry-After`, `Cache-Control: no-store` and the session `Set-Cookie`. An unreachable API returns `503 service_unavailable`.
2. **Express route.** `backend/src/server.mjs` reads `AUTH_ORIGIN` and passes it with the connection pool from `backend/src/db.mjs` into `backend/src/app.mjs`. The app mounts `backend/src/auth/router.mjs`. It checks `Origin` before parsing JSON or using a session. Registration and login require uncompressed JSON up to 8 KiB.
3. **Validation and throttling.** `backend/src/auth/validation.mjs` checks exact fields, normalizes email, and validates name, company, phone, location, explicit consent and password. `backend/src/auth/store.mjs` keeps the counters in PostgreSQL, so every API process shares them. Registration counts every attempt per IP. Login counts **failed** attempts only, in three buckets (see [Rate limits](#rate-limits)), and checks them before any password work.
4. **Password hashing.** `backend/src/auth/security.mjs` uses Argon2id with a random salt and 19 MiB of memory, two iterations, and one lane. Registration hashes the password. Login verifies the supplied password against the stored hash. An unknown email goes through a dummy Argon2id verification and gets the same error as a wrong password.
5. **PostgreSQL.** `backend/migrations/002_auth.sql`, owned by `rocktama_migrator`, creates `auth.users`, `auth.sessions`, and `auth.rate_limits`. `store.mjs` uses parameterized SQL as `rocktama_api`. A unique index on the normalized email handles simultaneous registrations. Database defaults assign `distributor` and `pending`, and the API role cannot insert or update those columns. `INSERT … ON CONFLICT DO NOTHING` never changes an existing account. Registration returns the same `202` whether or not the email already existed, and creates no session.
6. **Session and cookie.** Successful login creates 32 random bytes, encodes them as a base64url token, and stores a SHA-256 hash in PostgreSQL with an eight-hour expiry. If login included a previous session cookie, the same database statement revokes it and inserts the new session. Express sets the raw token in a host-only `HttpOnly; SameSite=Lax; Path=/` cookie. Through the gateway the browser receives it from the storefront's origin, so it belongs to the storefront domain. HTTPS uses `Secure` and the `__Host-rocktama_session` name. Explicit HTTP loopback configuration uses `rocktama_session` for local testing.
7. **API response.** Login returns the public user object with `Cache-Control: no-store`. `GET /me` hashes the cookie, checks expiry in PostgreSQL, and returns only its owner. The server computes distributor access using the current database role and status. Logout deletes the active session and expires the cookie. A pending account can use `/me` and `/logout`. In Next.js, `frontend/lib/server/api.ts` (`currentAccount()`) forwards only the session cookie to `GET /me` from Server Components. `/account/dashboard` shows the real account (pending review or approved), falls back to the demo cookie only where demo sign-ins are enabled, shows an "unavailable" page if the API cannot answer, and otherwise redirects to `/account/login`. Every approved-distributor route must use `requireSession` then `requireApprovedDistributor` from `backend/src/auth/access.mjs`. Both re-read PostgreSQL on every request, and a pending account gets `403 distributor_approval_required`.

## HTTP contracts

Browsers use the storefront's `/api/v1/auth/*` (the gateway). The API itself is at `http://127.0.0.1:4000/api/v1/auth` for local checks. Every request other than `GET`, `HEAD` or `OPTIONS` requires an `Origin` header matching one of the `AUTH_ORIGIN` entries; local Compose allows `http://localhost:3000`, `http://127.0.0.1:3000`, `http://127.0.0.1:3100` and `http://127.0.0.1:4000`. Registration and login use `Content-Type: application/json`. Logout uses an empty body and the session cookie. `GET /me` uses the session cookie. Use the same host consistently so the browser sends the host-only cookie.

| Method and path | Request | Success |
|---|---|---|
| `POST /register` | `email`, `password`, `name`, `company`, `phone`, `location`, `consent: true` | `202` with `{ "registration": { "status": "received" } }`, identical for new and existing emails. A new account starts pending; registration sets no cookie. |
| `POST /login` | `email`, `password` | `200` with `{ "user": … }` and a session cookie. |
| `POST /logout` | Current session cookie | `204` with an empty body and a clearing cookie. |
| `GET /me` | Current session cookie | `200` with `{ "user": … }`. |

Example registration body

```json
{
  "email": "ada@example.test",
  "password": "example passphrase for documentation",
  "name": "Ada Okafor",
  "company": "Example Supplies",
  "phone": "+234 803 123 4567",
  "location": "Enugu, Enugu State",
  "consent": true
}
```

Registration requires exactly these seven fields: a 15–128 character password, a name of 1–100 characters, a company of 1–150 characters, a phone number matching checkout's rule (`+`, digits, spaces, brackets and hyphens, 7–20 characters, whitespace collapsed), a city and state of 2–80 characters, and `consent: true`. Email is trimmed, lowercased and limited to 254 characters. Passwords are preserved exactly. `consented_at` is recorded as the database time; `confirmPassword` is checked in the browser only and never sent.

Example `GET /me` or login response for a pending account

```json
{
  "user": {
    "id": "20fb3c9f-c984-46ae-8f56-f8b51c2af3e1",
    "email": "ada@example.test",
    "name": "Ada Okafor",
    "company": "Example Supplies",
    "phone": "+234 803 123 4567",
    "location": "Enugu, Enugu State",
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
| `403` | `origin_forbidden` | A non-GET/HEAD/OPTIONS request had a missing or unexpected `Origin`. |
| `403` | `distributor_approval_required` | Returned by `requireApprovedDistributor` to signed-in accounts that are not approved distributors. No C3A route uses it yet. |
| `404` | `not_found` | Unknown auth route. |
| `413` | `request_too_large` | JSON body exceeds the size limit. |
| `415` | `unsupported_media_type` | Wrong content type, encoding or charset. |
| `429` | `rate_limited` | See [Rate limits](#rate-limits). `Retry-After` gives the seconds until the blocking counter resets. |
| `500` | `internal_error` | An unexpected backend failure. |
| `503` | `try_again` | Four password jobs are already running in this API process. Retry after one second. |

## Rate limits

| Bucket | Counts | Limit | Window | Why |
|---|---|---|---|---|
| `register_ip` | every registration attempt | 10 | 1 hour | Slows account spam and Argon2 load from one address. |
| `login_ip` | failed logins from one IP, any email | 30 | 15 min | Stops one address spraying many accounts. |
| `login_email_ip` | failed logins for one email from one IP | 5 | 15 min | The main brute-force brake. Cleared when that email and IP log in successfully. |
| `login_email` | failed logins for one email from all IPs | 100 | 1 hour | Backstop against distributed guessing across many IPs. |

Successful logins never add to a login counter. A blocked request is answered before any password work and is not counted. Unknown emails get the same counters as real ones, so the limits reveal nothing about which accounts exist.

An attacker can still lock a known email out for up to an hour, but only by producing 100 failures, which needs at least five separate IPs (each email-and-IP pair stops at 5 failures per 15 minutes). The owner's own email-and-IP bucket stays usable until the account-wide limit is reached. With 15+ character passwords and Argon2id, 100 guesses per hour gives an attacker no realistic chance. Concurrent requests can overshoot a limit by up to the four password jobs each process allows, because the check and the count are separate statements.

## Client IP addresses and `TRUST_PROXY`

The rate limits key on `request.ip`. With `TRUST_PROXY` unset (the default), Express uses the TCP peer address and **ignores** `X-Forwarded-For`, so a client cannot choose its own bucket.

| Topology | What Express sees | Setting |
|---|---|---|
| Local Compose (now) | Every request from your Mac arrives from the Compose gateway (`172.18.0.1`, observed on 20 Nov). All local clients share one bucket. | Leave `TRUST_PROXY` empty: there is no proxy to trust. |
| Next.js gateway, default (C3B, now) | The Next.js server's address. The gateway forwards **no** client address. | Leave both empty. All gateway traffic shares one bucket: coarse, but no client can spoof it. |
| Next.js gateway behind a proxy that overwrites or appends `X-Forwarded-For` (Vercel, an AWS ALB) | The gateway's address, plus the right-most `X-Forwarded-For` entry | Next.js: `AUTH_CLIENT_IP_SOURCE=x-forwarded-for`. API: `TRUST_PROXY` set to the Next.js server's address or subnet only. |
| AWS ALB → ECS | The ALB's private address | The VPC CIDR, for example `TRUST_PROXY=10.0.0.0/16`, with the task security group admitting only the ALB |
| Next.js on Vercel → public API | Vercel's changing egress addresses | Not trustable by address. Co-locate Next.js and the API in one private network, or add an authenticated header in a later phase. |

**Measured on `next start` (C3B):** Next.js fills in `X-Forwarded-For` only when a request has none, and passes a client-written value through unchanged. That is why the gateway forwards a client address only with `AUTH_CLIENT_IP_SOURCE=x-forwarded-for`, and only where a front proxy writes that header.

`backend/src/trust-proxy.mjs` accepts IP addresses, CIDR ranges (not `/0`) and the names `loopback`, `linklocal` and `uniquelocal`. `true`, `*` and hop counts are refused at start-up, so the API does not run with an unsafe setting.

## CSRF

1. **Exact `Origin`.** The router rejects any request other than GET, HEAD or OPTIONS whose `Origin` is not one of the `AUTH_ORIGIN` entries, before reading the body or the session. Entries are exact origins, all HTTPS or all HTTP loopback.
2. **SameSite=Lax cookie.** Browsers attach it to top-level navigations from other sites (so a visitor arriving from an email link stays signed in) but not to cross-site POST, fetch or iframe requests. The exact Origin check is the primary defence; Lax is the second layer. No auth endpoint changes state on GET.
3. **JSON only.** Register and login require `application/json`, which a plain cross-site HTML form cannot send.

The gateway forwards the browser's own `Origin` (the storefront) unchanged, so `AUTH_ORIGIN` must list the storefront's public origin. Express sends no CORS headers, so other sites cannot read API responses, and calling Express directly is subject to the same checks. `currentAccount()` sends only `GET /me`, which changes nothing. The check does not use `Host`, so a proxy rewriting `Host` does not affect it.

## Run the storefront against the API (C3B)

```bash
# 1. API and database (repository root)
docker compose --env-file .env.docker -f compose.yml -f compose.db.yml -f compose.migrate.yml up --build -d --wait

# 2. Tell Next.js where the API is (server-only; never NEXT_PUBLIC_). Add once to frontend/.env.local:
#    API_URL=http://127.0.0.1:4000
cd frontend && npm run dev        # open http://localhost:3000/account/register
```

Without `API_URL`, login and registration answer `503` ("Account services are unavailable"): the gateway fails closed. The Compose `AUTH_ORIGIN` already allows `http://localhost:3000`. If you open the dev server as `http://127.0.0.1:3000` instead, that origin is allowed too.

Browser verification against the running API (the harness starts its own production server on port 3100):

```bash
cd frontend
npm run verify:visual -- --section auth-register,auth-register-duplicate,auth-login-invalid,auth-pending-dashboard,auth-account-route,auth-logout,auth-expired-session,auth-unauthenticated,auth-rate-limit,auth-gateway-security
```

Each run creates three `rocktama-c3b-…@example.test` accounts and records about eleven failed logins against the shared local address (limits: 10 registrations per hour, 30 failures per 15 minutes). Remove the test accounts afterwards:

```bash
docker compose --env-file .env.docker -f compose.yml -f compose.db.yml exec -T db sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DELETE FROM auth.users WHERE email LIKE '"'"'rocktama-c3b-%@example.test'"'"'"'
```

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

`test:compose` reads credentials without echoing them and connects to `127.0.0.1:15432` as the two restricted roles. Most tests roll back their writes. Tests that need an approved or expired session insert a uniquely named fixture through the migrator, and remove it before closing their connection. This command fails when the database is unavailable or the migration is missing. On a re-run of Compose, `migrate` checks the stored checksums and reports that already applied files were skipped.

## Try the API from a VS Code terminal

The example uses the default local origin, creates one uniquely named pending test account, and logs it out. Registration now prints only `{"registration":{"status":"received"}}`. The pending account remains in the local database. The generated password and cookie stay out of terminal output. Use `test:compose` for the rollback-based checks.

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

  printf '{"email":"%s","password":"%s","name":"Local test","company":"Example Supplies","phone":"+234 803 123 4567","location":"Enugu, Enugu State","consent":true}' \
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

Before public rollout, verify email ownership and define account recovery, approval and revocation workflows. Email verification would let registration tell the real owner "you already have an account" by email, without revealing it over HTTP. Validate the cookie and gateway behind the real TLS proxy, and set `AUTH_CLIENT_IP_SOURCE` and `TRUST_PROXY` for that topology. Until then, all gateway users share one rate-limit address. Sessions have an absolute 8-hour lifetime with no idle timeout and no "log out everywhere". Checkout prefill still follows the demo session only; moving it to `/me` needs separate approval. Expired rows are cleaned in bounded batches during auth traffic. Review retention and monitoring once traffic patterns are known.

## Architecture Explorer

The earlier C3B handoff records version 4 of the [Architecture Explorer artifact](https://claude.ai/artifact/DYcaeT9pZKX3radGjcTn3t) as showing C1, C2, C3A and the C3B gateway. The editable artifact was unavailable during final C3B verification, so the work in this pass is recorded here and in [Progress](PROGRESS.md).
