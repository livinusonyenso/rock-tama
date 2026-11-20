# Distributor authentication (C2, hardened in C3A)

## Follow a request through the stack

1. **Next.js form.** When the account forms are connected, `frontend/components/account/DistributorAuthForm.tsx` will send the registration or login fields as JSON to `/api/v1/auth` on the storefront origin. The browser will supply `Origin` on the POST and handle the HttpOnly cookie. The existing form and demo flow are still in place. Use the terminal examples below for the implemented C2 paths.
2. **Express route.** `backend/src/server.mjs` reads `AUTH_ORIGIN` and passes it with the connection pool from `backend/src/db.mjs` into `backend/src/app.mjs`. The app mounts `backend/src/auth/router.mjs`. It checks `Origin` before parsing JSON or using a session. Registration and login require uncompressed JSON up to 8 KiB.
3. **Validation and throttling.** `backend/src/auth/validation.mjs` checks exact fields, normalizes email, and validates name, company and password. `backend/src/auth/store.mjs` keeps the counters in PostgreSQL, so every API process shares them. Registration counts every attempt per IP. Login counts **failed** attempts only, in three buckets (see [Rate limits](#rate-limits)), and checks them before any password work.
4. **Password hashing.** `backend/src/auth/security.mjs` uses Argon2id with a random salt and 19 MiB of memory, two iterations, and one lane. Registration hashes the password. Login verifies the supplied password against the stored hash. An unknown email goes through a dummy Argon2id verification and gets the same error as a wrong password.
5. **PostgreSQL.** `backend/migrations/002_auth.sql`, owned by `rocktama_migrator`, creates `auth.users`, `auth.sessions`, and `auth.rate_limits`. `store.mjs` uses parameterized SQL as `rocktama_api`. A unique index on the normalized email handles simultaneous registrations. Database defaults assign `distributor` and `pending`, and the API role cannot insert or update those columns. `INSERT … ON CONFLICT DO NOTHING` never changes an existing account. Registration returns the same `202` whether or not the email already existed, and creates no session.
6. **Session and cookie.** Successful login creates 32 random bytes, encodes them as a base64url token, and stores a SHA-256 hash in PostgreSQL with an eight-hour expiry. If login included a previous session cookie, the same database statement revokes it and inserts the new session. Express sets the raw token in a host-only `HttpOnly; SameSite=Strict; Path=/` cookie. HTTPS uses `Secure` and the `__Host-rocktama_session` name. Explicit HTTP loopback configuration uses `rocktama_session` for local testing.
7. **API response.** Login returns the public user object with `Cache-Control: no-store`. `GET /me` hashes the cookie, checks expiry in PostgreSQL, and returns only its owner. The server computes distributor access using the current database role and status. Logout deletes the active session and expires the cookie. A pending account can use `/me` and `/logout`. Every approved-distributor route must use `requireSession` then `requireApprovedDistributor` from `backend/src/auth/access.mjs`. Both re-read PostgreSQL on every request, and a pending account gets `403 distributor_approval_required`.

## HTTP contracts

Base URL for local Compose is `http://127.0.0.1:4000/api/v1/auth`. Every request other than `GET`, `HEAD` or `OPTIONS` requires an `Origin` header exactly matching `AUTH_ORIGIN`; local Compose defaults to `http://127.0.0.1:4000`. Registration and login use `Content-Type: application/json`. Logout uses an empty body and the session cookie. `GET /me` uses the session cookie. Use the same host consistently so the browser sends the host-only cookie.

| Method and path | Request | Success |
|---|---|---|
| `POST /register` | `email`, `password`, `name`, `company` | `202` with `{ "registration": { "status": "received" } }`, identical for new and existing emails. A new account starts pending; registration sets no cookie. |
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

Example `GET /me` or login response for a pending account

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
| Next.js forwards `/api/v1/auth` to Express in the same Compose network or VPC (planned C3B) | The Next.js server's address, plus the browser's IP in `X-Forwarded-For` | The Next.js container's address or subnet, for example `TRUST_PROXY=172.18.0.0/16` |
| AWS ALB → ECS | The ALB's private address | The VPC CIDR, for example `TRUST_PROXY=10.0.0.0/16`, with the task security group admitting only the ALB |
| Next.js on Vercel → public API | Vercel's changing egress addresses | Not trustable by address. Decide in C3B: co-locate Next.js and the API, or have the BFF send the client IP in an authenticated header. |

`backend/src/trust-proxy.mjs` accepts IP addresses, CIDR ranges (not `/0`) and the names `loopback`, `linklocal` and `uniquelocal`. `true`, `*` and hop counts are refused at start-up, so the API does not run with an unsafe setting.

## CSRF

1. **Exact `Origin`.** The router rejects any request other than GET, HEAD or OPTIONS whose `Origin` is not exactly `AUTH_ORIGIN`, before reading the body or the session.
2. **SameSite=Strict cookie.** Browsers do not attach it to cross-site requests.
3. **JSON only.** Register and login require `application/json`, which a plain cross-site HTML form cannot send.

Through a same-origin Next.js rewrite, the browser's own `Origin` (the storefront) is forwarded unchanged, so `AUTH_ORIGIN` must be the storefront's public origin. If a Server Action calls Express server-to-server instead, Next.js has already checked that action's `Origin` against `Host`. Express then trusts the `Origin` the BFF sends, which is safe because a forged server-to-server request does not carry a victim's cookie. The check does not use `Host`, so a proxy rewriting `Host` does not affect it.

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

Before public rollout, verify email ownership and define account recovery, approval and revocation workflows. Email verification would let registration tell the real owner "you already have an account" by email, without revealing it over HTTP. In C3B, validate cookies and same-origin routing through the real TLS proxy, set `TRUST_PROXY` for that topology, and confirm that client IPs reach the limiter. Sessions have an absolute 8-hour lifetime with no idle timeout and no "log out everywhere". SameSite=Strict means a visitor arriving from an email link appears logged out on that first page load; reconsider `Lax` with the C3B design. Expired rows are cleaned in bounded batches during auth traffic. Review retention and monitoring once traffic patterns are known.

## Architecture Explorer

The [Architecture Explorer artifact](https://claude.ai/artifact/DYcaeT9pZKX3radGjcTn3t) (version 2, 20 Nov 2026) shows the C1 start-up sequence, database roles and graceful shutdown. It also shows the four C2 routes as verified request flows, with code excerpts copied from these files. Frontend wiring (C3), CI and AWS remain marked as proposed or not started.
