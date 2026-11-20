# AWS backend deployment plan (proposed, not executed)

_Prepared 2026-11-20 after C3B (`7b64dd7`). Nothing in this document has been created in AWS. Each stage needs the owner's approval before it runs._

**Goal:** a public HTTPS URL for the Express API (`/health`, `/api/v1/auth/*`) backed by PostgreSQL, so registration, login, `/me` and logout can be tested before the frontend and a custom domain exist.

**Labels:** [VERIFIED] = checked in this repository or locally. [ESTIMATE] = an approximate price; confirm it in the AWS Pricing Calculator before creating anything. [ASSUMPTION] = must be confirmed during the stage.

---

## Read-only readiness audit — 2026-11-20

_This audit was written by an earlier session. D1 below reproduced the local items marked [VERIFIED in D1]. The RDS `CREATEROLE` rehearsal and the regional and pricing readbacks were not reproduced._

The backend is ready for a **local production-topology rehearsal**. Approve the production files and rehearsal before publishing images or provisioning AWS resources. The `rocktama-dev` session had expired. Current ECR settings, IAM permissions, regional offerings and account credits need readback after the owner signs in.

**Verified locally on both `linux/arm64` and `linux/amd64`.** Built both images and ran them with `docker run`, outside the Compose service lifecycle, against the isolated test database. Bootstrap and the migrator job exited successfully on both architectures. The migrator rechecked all four stored checksums. The API ran Node.js 26.13.1 as UID 1000 with a read-only root filesystem, capabilities dropped, and no host ports published. Each architecture passed readiness, real registration and Argon2id login, pending `/me`, HTTPS cookie header assertions, logout, revoked-cookie rejection and clean SIGTERM shutdown. This exercised API behavior for an HTTPS origin. The actual reverse-proxy TLS handshake and browser cookie persistence remain rehearsal checks.

| Area | Finding and approval gate |
|---|---|
| API image | Builds from `backend/Dockerfile` and takes a separate runtime database URL. Keep Node `26.13.1-bookworm-slim` pinned by digest. The `rocktama_api` connection has no PostgreSQL administrative attributes. |
| Bootstrap image | Build the Compose inline Dockerfile as a separate image. Its inherited command is `postgres`, so the image needs the bootstrap command override or a standalone entry point. Read passwords with psql `\getenv` or equivalent secret-file handling. The current local command passes them as `psql -v` arguments. Pin the base image digest before release. |
| Persistence and credentials | The local `rocktama_pg_data` mounts at `/var/lib/postgresql`. On EC2, mount that PostgreSQL 18 directory on encrypted EBS and make stack startup depend on that mount. Preserve Caddy’s certificate data. Rehearse restoring a separate off-instance logical backup. Generate distinct bootstrap, migrator and runtime credentials. An initialization password change does not rotate an existing database administrator. Coordinate runtime password rotation with bootstrap and an API restart. |
| HTTPS and cookies | HTTPS-only `AUTH_ORIGIN` produces `__Host-rocktama_session` with `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/` and no `Domain`. Rehearse with a trusted local CA and confirm a mismatched or missing POST `Origin` gets `403`. If CloudFront is added, require TLS on both hops. |
| Network bindings and proxy | Express binds `0.0.0.0:4000` in the container. Local Docker publishes `127.0.0.1:4000` and `127.0.0.1:15432`. Production publishes Caddy’s 80/443 only. Keep the proxy and database on separate networks. Caddy at the public edge ignores client-supplied forwarded headers by default. Allow only the trusted direct hop in Express `TRUST_PROXY` and rehearse the exact pinned proxy version and configuration. [Caddy reverse proxy defaults](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy) |
| Next.js upstream | Browsers call `/api/v1/auth/*` on Next.js. `API_URL` is a server-only upstream setting. Same-host Next.js can use the private API service address. Verify that Caddy sanitizes forwarding headers and Express trusts only Next.js’s address for that path. Remote Next.js requires certificate-verified HTTPS and a way to identify and authenticate the upstream gateway before accepting its visitor IP. Keep `AUTH_CLIENT_IP_SOURCE` unset until that chain is verified. This means shared egress IPs share rate-limit buckets in the interim. |
| RDS alternative | Require `rds.force_ssl=1`, the AWS CA bundle and `verify-full` for bootstrap, migrations and runtime. Verify the session in `pg_stat_ssl`. RDS has `rds_superuser` privileges. A rolled-back local rehearsal as a role with `CREATEROLE` showed the bootstrap fails at `ALTER ROLE … NOSUPERUSER`. An RDS-specific bootstrap and role-switching rehearsal are prerequisites. [RDS PostgreSQL TLS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/PostgreSQL.Concepts.General.SSL.html) · [RDS administrator privileges](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Appendix.PostgreSQL.CommonDBATasks.Roles.rds_superuser.html) |
| ECR | Use distinct API and bootstrap repositories, immutable Git-SHA tags and digest-pinned deployments. Publish Linux `arm64` for Graviton or a verified multi-architecture index. Verify registry scanning configuration and both repositories’ scan findings. Separate publisher and EC2 pull permissions. [ECR multi-architecture image publishing](https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-multi-architecture-image.html) |

## 1. Recommendation

**One small EC2 instance running Docker Compose:**

- **Instance:** `t4g.small` (Graviton arm64, 2 vCPU burstable, 2 GiB RAM) running Ubuntu 24.04 LTS.
- **Address and access:** an Elastic IP. Only ports 80 and 443 are open; there is no SSH, and you connect through AWS Systems Manager Session Manager.
- **Containers:** Caddy (automatic HTTPS) → `api` → `db` (PostgreSQL 18 on an encrypted EBS volume). `db-bootstrap` and `migrate` run once on each start, exactly as on your Mac.
- **Secrets:** generated fresh and stored in SSM Parameter Store (SecureString). They are never copied from your Mac.
- **HTTPS without a purchased domain:** evaluate `<elastic-ip-with-dashes>.sslip.io` and a publicly trusted certificate for a disposable smoke environment. Confirm certificate issuance before sending credentials. Choose a stable, controlled hostname for production.

**Why not ECS yet:**
- The ECS option priced here uses an Application Load Balancer, RDS and Secrets Manager. It also needs an HTTPS hostname and a certificate accepted by clients.
- That's roughly three times the monthly cost (see §3) and many more moving parts.
- ECS remains the documented target once the product has real traffic. The same images and roles carry over.

## 2. How the existing files take part

| File | Role on AWS | Change needed |
|---|---|---|
| `backend/Dockerfile` | Builds the API image, then pushed to ECR `rocktama/api` and tagged with the Git SHA. Pinned `node:26.13.1-bookworm-slim` (amd64 and arm64), runs as uid 1000, CMD `node src/server.mjs`. [VERIFIED] It builds and runs as linux/arm64 and linux/amd64, with Argon2 hashing, a read-only root filesystem, `--cap-drop ALL`, `no-new-privileges` and a real database. | None. Build with `--platform linux/arm64` for Graviton. |
| `backend/src/server.mjs` | Entry point. It requires `AUTH_ORIGIN` and refuses an unsafe `TRUST_PROXY`, so a misconfigured server fails fast. It handles SIGTERM, so `docker compose stop` and reboots shut it down cleanly. | None. |
| `backend/src/app.mjs` | `/health` (liveness, no database) for Caddy and monitoring; `/health/ready` (runs `SELECT 1`) for deployment checks; mounts `/api/v1/auth`. | None. |
| `backend/src/db.mjs` | Connection pool from `DATABASE_URL` (as `rocktama_api`). Inside Compose it connects to `db:5432` without TLS, which never leaves the private Docker network. | None for EC2. With RDS later, add TLS using the RDS CA bundle. |
| `compose.yml` | Local base file. It builds from source and publishes ports on `127.0.0.1`. | Not used on the server. |
| `compose.db.yml` | Local API settings (`DATABASE_URL`, loopback `AUTH_ORIGIN`). | Replaced by the production file. |
| `compose.migrate.yml` | Local `db-bootstrap` → `migrate` → `api` ordering. Its `dockerfile_inline` build cannot run on a server that only pulls images. | The production file keeps the same ordering, using images. |
| `.env.docker` | Local secrets file, git-ignored. | **Never copied to AWS.** Production generates new values in Parameter Store. |
| `frontend/next.config.ts` | Not involved in the backend deployment. Its build guards apply to the later frontend phase (`DEMO_AUTH`, `DEPLOY_MODE`). | None now. |
| `frontend/lib/server/api.ts` | Later: the frontend's server-only `API_URL` will point at the HTTPS API. The browser never learns that address. | Frontend phase only. |

**D1 files and the next production adaptation**

- **`deploy/compose.rehearsal.yml`:** the isolated D1 baseline. A future `deploy/compose.prod.yml` adapts its topology for EC2.
  - Images come from ECR by tag, with no `build:` sections.
  - `db` and `api` publish **no** ports.
  - Caddy publishes 80 and 443 and has a fixed address (for example `172.30.0.10`) on a fixed subnet, so the API can set `TRUST_PROXY=172.30.0.10`.
  - `restart: unless-stopped`, and log rotation (`json-file`, `max-size: 10m`, `max-file: 3`).
- **`deploy/Caddyfile`:** D1 uses `tls internal` for the two localhost names. D2 needs its own HTTPS hostname, a publicly trusted issuer, and host exposure on 80/443. Caddy replaces untrusted forwarding headers at the edge. [Caddy reverse proxy defaults](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)
- **`backend/db/Dockerfile`:** packages the bootstrap command, SQL and psql client into an independent image. Its entry point reads secret files and runs the SQL without a Compose command override.
- **Future EC2 secret loader:** reads `/rocktama/prod/*` and writes individual files into a root-controlled directory with access for the intended container user, based on the D1 `_FILE` interface.

**Local rehearsal before AWS:** use the D1 commands below. The rehearsal models TLS, role and network separation, migration ordering, persistence, and rollback before provisioning.

## Phase D1 local rehearsal

### WHAT and WHY

`backend/Dockerfile` already packages Node, Express, pg and Argon2id in a non-root image, and `server.mjs` already binds to the container interface, enforces explicit proxy settings and drains on SIGTERM. `app.mjs` distinguishes liveness from database readiness. The auth modules already enforce exact `Origin`, hash session tokens in PostgreSQL and select a secure cookie for HTTPS origins. The existing development Compose files and PostgreSQL volume remain a separate topology. D1 adds a self-running bootstrap image, secret-file support, a TLS proxy, private PostgreSQL and an optional standalone storefront.

### HOW the files work together

| File | What it does and why | How to verify and where it maps on AWS |
|---|---|---|
| `backend/Dockerfile`, `backend/src/db.mjs`, `backend/test/run-compose-integration.mjs` | Build the runtime and a separate test target. `DATABASE_URL_FILE` supplies a role-specific connection URI to the same pg pool. The test runner can consume the two private URLs. | Inspect `.d1` file names only, run the test image on the private network, and verify `/health/ready`. The runtime becomes ECR `rocktama/api`, and Parameter Store supplies fresh URL files to the EC2 instance. |
| `backend/db/Dockerfile`, `backend/db/bootstrap.sh`, existing `bootstrap-roles.sql` | Package the PostgreSQL client and a default entry point. A fresh database sets up distinct bootstrap, migrator and runtime roles. psql reads secrets from the process environment derived from files, without placing their values in its arguments. | Run the bootstrap container with its default entry point. D2 tags this image separately as `rocktama/db-bootstrap`. |
| `deploy/compose.rehearsal.yml`, `deploy/Caddyfile`, `deploy/Caddy.Dockerfile`, `deploy/.dockerignore` | Run loopback TLS on `8443`, then forward to containers over Docker DNS. Only data-network members can reach PostgreSQL. The DB and CA have their own named volumes. The proxy image contains its config, and each long-lived service has health, restart and rotating-log settings. | Check the port list, authenticated readiness and restart behavior. On EC2, a production Compose file uses ECR digests, a public certificate, and encrypted EBS-backed storage. |
| `deploy/d1.sh` and `.gitignore` | Generate same-project credentials once, use the explicit `rocktama-d1` project, and extract just Caddy’s public root certificate. `.d1/` holds the local-only credentials and backup files. | Validate `deploy/d1.sh config --quiet` and check `.d1/` is ignored. A production secret loader replaces local credential generation. |
| `frontend/Dockerfile`, `frontend/.dockerignore`, `frontend/next.config.ts` | Package the existing Next.js app as standalone Node output, exclude credentials and local data, and read `API_URL` at runtime. The optional profile uses `DEPLOY_MODE=staging`. | Open the shop login through Caddy and run the browser check. The same Node standalone image can run on EC2, with the gateway forwarding through private Docker networking. |
| `deploy/verify-d1.mjs`, `deploy/verify-d1-browser.mjs` | Exercise HTTPS, auth, forwarded client IP, data persistence, backup and restore, an intentionally failing image and rollback, and actual browser cookie behavior. | Run the exact commands below with the optional storefront up. Reuse the health, TLS, auth and database checks against D2 after approval. |

The API path is `backend/Dockerfile` → API image → Compose `api` → Docker `data` network → `db:5432`. Caddy receives HTTPS on the `edge` network and calls `api:4000`. On the shop host it calls `frontend:3000` first. The same-origin Next.js gateway forwards auth to the private Express service, which stores users and session hashes in PostgreSQL. In AWS, ECR stores the two backend images, EC2 runs these service roles, the security group admits only proxy traffic, encrypted EBS stores PostgreSQL, and SSM supplies credentials and host access.

### VERIFY in the VS Code terminal

Run from the repository root with Docker Desktop running and Node.js 26 LTS. Test accounts and restore drills belong to the D1 database. Starting the frontend profile adds the private standalone storefront.

```bash
./deploy/d1.sh init
./deploy/d1.sh --profile frontend build
./deploy/d1.sh --profile frontend up -d --wait --wait-timeout 120
./deploy/d1.sh ca
./deploy/d1.sh --profile frontend ps -a
curl --cacert .d1/ca.pem --resolve api.rocktama.localhost:8443:127.0.0.1 \
  --fail --silent --show-error https://api.rocktama.localhost:8443/health/ready
./deploy/d1.sh run --rm --build --no-deps backend-tests
node deploy/verify-d1.mjs
node deploy/verify-d1-browser.mjs
```

API URL is `https://api.rocktama.localhost:8443`. The optional storefront is `https://shop.rocktama.localhost:8443/account/login`. The database and API container ports have no host mapping. `./deploy/d1.sh --profile frontend stop` pauses D1 and preserves data and CA volumes. A later `up -d --wait` resumes it.

`curl --cacert` trusts the exported D1 public root only for that command, and still checks the certificate chain and hostname. The browser check first verifies both leaf certificates with that root, then pins the two verified keys in a disposable Chrome profile. Set `CHROME_PATH` if Chrome lives elsewhere. These commands leave the system trust store alone. Compose maps only each service’s required secret files. The host `.d1` directory is private and file mounts are read-only. The DB backup is a private local file. Docker administrators can still access mounted secrets, so protect host access and use fresh credentials and off-instance encrypted backups on EC2. [Docker Compose secrets](https://docs.docker.com/compose/how-tos/use-secrets/) · [Caddy local HTTPS](https://caddyserver.com/docs/automatic-https)

### D1 results — 2026-11-20 [VERIFIED in D1]

Run in this order on Docker Desktop (Compose v5.7.0) with the `rocktama-d1` project. The development project, the `rocktama_pg_data` volume and `some-postgress` were compared before and after: containers, volume, migration checksums and data are identical.

| Check | Result |
|---|---|
| Fresh first boot (throwaway project, empty volume) | bootstrap exit 0 with no log output, then `Applied migration` 001–004. `rocktama_api` and `rocktama_migrator` are not superusers and cannot create roles; all five tables are owned by the migrator. Only the internal `data` network was created. No password appears in the `db`, `db-bootstrap` or `migrate` logs. The throwaway project and its volume were removed. |
| Stack start | `db`, `api`, `frontend` and `caddy` healthy; `db-bootstrap` and `migrate` `Exited (0)`. Only Caddy publishes a host port (`127.0.0.1:8443`). `api`, `db` and `frontend` have no host bindings. |
| TLS | `curl --cacert .d1/ca.pem …/health/ready` returns `{"status":"ok","database":"ready"}`. Without the CA, curl exits 60 (untrusted). |
| Backend suites on the private network (`backend-tests`) | unit 17/17, integration 26/26 against the D1 database |
| `node deploy/verify-d1.mjs` | All five stages pass: HTTPS and binding; direct and gateway auth with `__Host-` cookie attributes, pending render and trusted client IP (spoofed `X-Forwarded-For` ignored); bootstrap and migrate rerun with unchanged history; API restart (`Shutdown complete`), PostgreSQL container replacement on the same volume, backup and isolated restore; failing-image health gate, rollback, Origin rejection and logout revocation. |
| `node deploy/verify-d1-browser.mjs` (Chrome) | Pass: HTTPS registration and login, a host-only `HttpOnly; Secure; SameSite=Lax` cookie on the shop host only, invisible to `document.cookie`, the pending dashboard. The cookie is withheld from a cross-site `<img>` (401) and sent on a top-level navigation (200). Logout, then login with the real form and logout with the dashboard button. |
| Storefront regression against the development API | 517/517 browser checks (auth, account, dashboard, admin, checkout, receipt); tsc, lint, deployment-config, gateway and admin-auth checks pass. |

**Fixed during D1:**
1. **Caddy could not start ("Address already in use").** The API joined `edge` without a fixed address and took `172.29.44.2`, Caddy's reserved address. `edge` now sets `ip_range: 172.29.44.128/25`, so automatic addresses come from the upper half. This is why Caddy had stayed in `Created` in the earlier run.
2. **The port check relied on `docker compose port` exiting 1** for an unpublished port. Compose v5.7.0 exits 0 and prints `:0`. The verifier now reads the actual host bindings with `docker inspect`, and also asserts that Caddy's only binding is `127.0.0.1:8443`.
3. **The browser SameSite check waited for `Network.responseReceived`.** Chrome's Opaque Response Blocking can suppress that event for a JSON response to `<img>`. The check now reads the network-level status and whether Chrome attached the session cookie (`requestWillBeSentExtraInfo`, `responseReceivedExtraInfo`). That tests the SameSite property directly.

**Pause, resume and clean up:** `./deploy/d1.sh --profile frontend stop` pauses D1, keeping its data and CA. `./deploy/d1.sh --profile frontend up -d --wait` resumes it. To delete D1 entirely (D1 data only; the development stack is a different project): `./deploy/d1.sh --profile frontend --profile tests down --volumes`, then `rm -rf .d1`.

### NEXT — Next.js hosting choice

| Option | Fit and auth path |
|---|---|
| **Standalone Next.js on EC2** | Recommended for this project. The repository uses Next.js `16.4.6`, App Router, Cache Components, streaming account pages, request-time cookies and a Node route handler. The browser posts to the shop origin. Caddy terminates TLS, Next calls `http://api:4000` inside the isolated network, and the returned `__Host-rocktama_session` belongs to the shop host. Keep the public browser path HTTPS and trust only the verified Caddy and Next direct hops. |
| **AWS Amplify Hosting** | The documented SSR runner supports Next.js 12–15 and excludes Next.js streaming. This app also uses a local Node 26 build while Amplify documents Node 20, 22 and 24. Revisit when the exact version and features are supported or a separately approved adapter proof passes. The browser would stay on the Amplify storefront origin, with its SSR gateway calling a certificate-verified public HTTPS API upstream and that origin allowed by Express. A private Docker name is unavailable to a remote SSR service. Verify trusted client identity, cookie forwarding and no caching before using this topology. |

The standalone image retains the repository’s staging mode and uses no live payment credentials. Future storefront launch still needs the separately tracked launch settings and security review. [Next.js standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) · [Amplify feature support](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html) · [Amplify SSR runtimes](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-supported-features.html)

## 3. Cost comparison, eu-north-1 [ESTIMATE, on-demand, about 730 hours per month]

| Item | EC2 + Compose (recommended) | ECS Fargate + ALB + RDS |
|---|---|---|
| Compute | t4g.small ≈ $12 (t4g.micro ≈ $6, but 1 GiB RAM is tight with Postgres) | Fargate arm64, 0.25 vCPU / 0.5 GB ≈ $7 |
| Load balancer | none (Caddy) | ALB ≈ $18–20 plus LCUs |
| Database and disks | Postgres on a 20 GiB gp3 EBS data volume plus small EC2 root volume ≈ $2–4 | RDS db.t4g.micro ≈ $13 plus 20 GB storage ≈ $3 |
| Public IPv4 ($0.005/h each) | 1 Elastic IP ≈ $3.65 | ALB in 2 AZs ≈ $7.30, plus a task IP ≈ $3.65 unless you pay for a NAT gateway (≈ $35) |
| Secrets | Parameter Store standard: free | Secrets Manager, 3 × $0.40 |
| Backups | EBS snapshots (7 daily, incremental) ≈ $1 | RDS automated backups, free up to the database size |
| Logs | Docker log rotation on disk | CloudWatch ≈ $1 |
| HTTPS hostname | Temporary staging hostname with a verified certificate | HTTPS hostname and matching certificate on the ALB |
| **Monthly total** | **≈ $18–22** | **≈ $50–60** (one API task with public IPv4, no NAT, low load) |

Budget assumptions are 730 hours per month, one instance, one public IPv4 at $0.005 per hour ($3.65 per month), 20 GiB gp3, low traffic and light snapshot churn. The Stockholm public price list showed $0.0356 per Arm Fargate vCPU-hour, $0.00392 per GB-hour and $0.02394 per ALB-hour before LCUs. NAT, multi-AZ RDS, extra replica tasks, domain registration, frontend hosting, taxes and credits are excluded. Confirm rates and account discounts before provisioning. [AWS Price List](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/finding-prices-in-service-price-list-files.html) · [EC2 pricing](https://aws.amazon.com/ec2/pricing/on-demand/) · [EBS pricing](https://aws.amazon.com/ebs/pricing/) · [Public IPv4 pricing](https://aws.amazon.com/vpc/pricing/) · [ECR pricing](https://aws.amazon.com/ecr/pricing/)

## 4. Security design

- **Network:**
  - The security group allows inbound 80 and 443 only, from `0.0.0.0/0` (and `::/0` if you enable IPv6).
  - **5432 (Postgres) and 4000 (API) are never published.** Compose binds no ports for `db` and `api`, and the security group would block them anyway.
  - No 22: shell access is through SSM Session Manager.
- **Instance:**
  - IMDSv2 required, with hop limit 2 so containers using the instance role still work.
  - Encrypted gp3 volume; Ubuntu unattended security upgrades (enabled by default).
  - Docker log rotation.
- **IAM instance role** (least privilege):
  - `AmazonSSMManagedInstanceCore` for Session Manager.
  - ECR pull on `rocktama/*` only: `ecr:GetAuthorizationToken`, `ecr:BatchGetImage`, `ecr:GetDownloadUrlForLayer`.
  - `ssm:GetParametersByPath` on `/rocktama/prod/`, plus `kms:Decrypt` for the `aws/ssm` key if your account requires it.
  - Your Organization's SCP already denied one IAM action during the audit. Creating roles may need the Organization administrator [ASSUMPTION: confirm in stage 0].
- **Secrets:** generated on AWS with `openssl rand -hex 24`, stored as SecureString under `/rocktama/prod/`, and written only to `/opt/rocktama/.env` (root-owned, mode 600). Never in Git, images, user data or logs.
- **Database roles:** unchanged from C1. `rocktama_app` is used only by bootstrap, `rocktama_migrator` only by migrate, and the API runs as `rocktama_api`.
- **Auth settings:**
  - `AUTH_ORIGIN=https://<host>` while testing with curl. Add the storefront origin later; all entries must be HTTPS.
  - The cookie becomes `__Host-rocktama_session` with `Secure` automatically.
  - `TRUST_PROXY` is set to Caddy's fixed address only.
- **Costs:** an AWS Budget with an email alert at $25 per month is created first (the first two budgets are free).

## 5. HTTPS and DNS before buying a domain

1. **sslip.io for staging.** Resolve the chosen hostname and verify certificate issuance and renewal. A shared DNS service and CA limits make it unsuitable as the sole production dependency.
2. **CloudFront default domain** (`https://dxxxx.cloudfront.net`):
   - Use HTTPS Only to an origin with a publicly trusted certificate matching its hostname. Disable auth caching and forward the auth headers and cookies required by the API. Restrict origin access and verify the client IP chain before enabling forwarding. [CloudFront HTTPS to custom origins](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-https-cloudfront-to-custom-origin.html)
3. **Custom domain later:**
   - Point an `A` record (`api.<domain>`) at the Elastic IP, change `API_HOST`, and Caddy issues a new certificate.
   - Add the storefront origin to `AUTH_ORIGIN`.

**Note for the frontend phase:** if Next.js runs on Vercel and calls this API over the internet, Caddy will see Vercel's addresses, not the visitor's. All visitors would then share rate-limit buckets until the gateway sends a client address Express can trust. Running the Next.js container on this same instance, behind the same Caddy, avoids that problem and keeps the API private. Decide this in the frontend phase.

## 6. Step-by-step checklist

Every stage below is **proposed**. Run nothing in stages 2–8 until the owner approves the stage and its cost.

### Stage 0 — Read-only prerequisites
- **What:** the owner refreshes credentials, then check permissions and available offerings. Budget configuration is part of the separately approved provisioning stage.
- **Why:** the earlier sessions expired, and the Organization SCP may block IAM or EC2 actions.
- **How:**
  ```bash
  aws login --profile rocktama-dev
  export AWS_PROFILE=rocktama-dev AWS_REGION=eu-north-1
  aws sts get-caller-identity --query Arn --output text
  aws ecr describe-repositories \
    --query 'repositories[?repositoryName==`rocktama/api` || repositoryName==`rocktama/db-bootstrap`].[repositoryName,imageTagMutability]' --output table
  aws ecr get-registry-scanning-configuration
  aws ec2 describe-instance-type-offerings --location-type region \
    --filters Name=instance-type,Values=t4g.small --query 'InstanceTypeOfferings[].InstanceType' --output text
  ```
- **Verify:**
  - The ARN names `AccountFullAccessRole`.
  - Confirm both repository names, immutable tags, and the applicable scanning rules. The expired session prevented a current readback.
  - `t4g.small` is listed.
  - After budget approval and configuration, check with `aws budgets describe-budgets --account-id <id>`.

### Stage 1 — Repository preparation (no cost; code change, needs approval)
- **What:** add the four `deploy/` files from §2, plus `backend/db/Dockerfile`.
- **Why:** the server should only pull and run pinned images; nothing is built there.
- **How:** a reviewed code task, then a local rehearsal:
  ```bash
  docker compose -f deploy/compose.prod.yml --env-file deploy/.env.rehearsal up -d --wait
  curl --cacert "$REHEARSAL_CA" --fail --silent --show-error https://localhost/health/ready
  ```
- **Verify:**
  - Health returns 200 over HTTPS, and `/health/ready` reports the database ready.
  - `docker compose port db 5432` shows no published port.
  - Rate limits see the curl client's address, not Caddy's.

### Stage 2 — Images to ECR (cents per month)
- **What:** build arm64 images tagged with the Git SHA and push them.
- **Why:** with immutable tags, every deploy points at an exact, traceable build.
- **How:**
  ```bash
  TAG=$(git rev-parse HEAD)
  ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
  REGISTRY="$ACCOUNT.dkr.ecr.eu-north-1.amazonaws.com"
  aws ecr get-login-password | docker login --username AWS --password-stdin "$REGISTRY"
  docker buildx build --platform linux/arm64 -t "$REGISTRY/rocktama/api:$TAG" --push backend
  ```
  This also creates `rocktama/db-bootstrap` and pushes it the same way; it's a new repository, so it needs approval. Add a lifecycle policy that keeps the last 10 images.
- **Verify:**
  - `aws ecr describe-images --repository-name rocktama/api --image-ids imageTag="$TAG" --query 'imageDetails[0].[imageDigest,imageManifestMediaType]'` returns the expected digest. Repeat for `rocktama/db-bootstrap`.
  - `aws ecr describe-image-scan-findings --repository-name rocktama/api --image-id imageTag="$TAG" --query 'imageScanFindings.findingSeverityCounts'` returns the severity counts for review. Repeat for bootstrap.
- **Rollback:** images cost cents; `aws ecr batch-delete-image` removes them.

### Stage 3 — Secrets in Parameter Store (free)
- **What:** generate `POSTGRES_PASSWORD`, `MIGRATOR_PASSWORD` and `API_DB_PASSWORD`, and set the non-secret settings (`POSTGRES_USER`, `POSTGRES_DB`, `API_HOST`, `AUTH_ORIGIN`, `TRUST_PROXY`).
- **How** (the value is generated inside the command and never printed):
  ```bash
  aws ssm put-parameter --name /rocktama/prod/POSTGRES_PASSWORD --type SecureString --value "$(openssl rand -hex 24)"
  ```
  Repeat for the other two passwords. Use `--type String` for the non-secret settings.
- **Verify:** `aws ssm get-parameters-by-path --path /rocktama/prod/ --query 'Parameters[].Name'` lists names only; never pass `--with-decryption` in a terminal you share.
- **Rollback:** `aws ssm delete-parameters --names …`.

### Stage 4 — IAM role, security group, instance (starts billing ≈ $0.5 per day)
- **What:** an instance profile with the §4 policy, and a security group allowing 80 and 443 only.
  - Ubuntu 24.04 arm64 AMI, from the SSM public parameter `/aws/service/canonical/ubuntu/server/24.04/stable/current/arm64/hvm/ebs-gp3/ami-id`.
  - `t4g.small`, a 20 GiB encrypted gp3 volume, IMDSv2 required.
- **How:** `aws iam create-role`, `aws iam put-role-policy`, `aws iam create-instance-profile`, `aws ec2 create-security-group`, `aws ec2 authorize-security-group-ingress` (80 and 443), then `aws ec2 run-instances` with `--metadata-options HttpTokens=required,HttpPutResponseHopLimit=2` and `--block-device-mappings` (Encrypted=true). The exact JSON will be written in stage 1 and reviewed with you.
  - User data installs Docker from Docker's apt repository (`docker-ce`, `docker-compose-plugin`) and `amazon-ecr-credential-helper`.
  - It contains **no secrets**.
- **Verify:**
  - `aws ec2 describe-instances --query 'Reservations[].Instances[].State.Name'` shows `running`.
  - `aws ssm describe-instance-information` lists the instance as `Online`.
- **Rollback:** `aws ec2 terminate-instances`, then delete the security group, instance profile and role.

### Stage 5 — Elastic IP and hostname (≈ $3.65 per month)
- **How:** `aws ec2 allocate-address`, then `aws ec2 associate-address`. Set `API_HOST=<a-b-c-d>.sslip.io` and `AUTH_ORIGIN=https://<a-b-c-d>.sslip.io` in Parameter Store.
- **Verify:** `dig +short <a-b-c-d>.sslip.io` returns the Elastic IP.
- **Rollback:** `aws ec2 disassociate-address`, then `aws ec2 release-address`. An unattached Elastic IP still costs money, so release it.

### Stage 6 — Start the stack (through Session Manager)
- **How:**
  ```bash
  aws ssm start-session --target <instance-id>
  sudo /opt/rocktama/fetch-env.sh            # writes /opt/rocktama/.env, mode 600
  cd /opt/rocktama && sudo docker compose -f compose.prod.yml --env-file .env pull
  sudo docker compose -f compose.prod.yml --env-file .env up -d --wait
  sudo docker compose -f compose.prod.yml ps -a
  ```
- **Expected:**
  - `db` healthy; `db-bootstrap` and `migrate` `Exited (0)`; `api` healthy; `caddy` running.
  - `docker logs` for `migrate` shows `Applied migration: 001…004` on the first run.

### Stage 7 — Verify from your Mac
```bash
H=https://api.example.test # Replace with the approved HTTPS staging origin
HOST=${H#https://}
curl -fsS -w ' %{http_code}\n' "$H/health"
curl -fsS "$H/health/ready"
openssl s_client -connect "$HOST:443" -servername "$HOST" -verify_hostname "$HOST" -verify_return_error </dev/null
curl -sS -o /dev/null -w '%{http_code}\n' -X POST \
  -H 'Origin: https://wrong-origin.example' "$H/api/v1/auth/logout" # expect 403
for port in 22 4000 5432; do
  if nc -z -w 3 "$HOST" "$port"; then printf 'Unexpected open port %s\n' "$port"; exit 1; fi
done
```
Then the BACKEND_AUTHENTICATION.md snippet with `auth_origin=$H` and `auth_base=$H/api/v1/auth`:
- register returns 202, login 200 with `Set-Cookie: __Host-rocktama_session=…; Secure; HttpOnly; SameSite=Lax`
- `/me` returns 200 (pending), logout 204, then `/me` returns 401
- a request with `Origin: https://attacker.example` gets 403

If RDS is selected, run these with the runtime role and the AWS CA bundle. Let `psql` prompt for the password. Repeat the TLS query using the migration and bootstrap connections. The first connection must report `ssl=t`. The second must be rejected.

```bash
psql -X -W "host=$RDS_HOST port=5432 dbname=$RDS_DB user=rocktama_api sslmode=verify-full sslrootcert=$RDS_CA" \
  -c 'SELECT current_user, ssl, version FROM pg_stat_ssl WHERE pid=pg_backend_pid();'
psql -X -W "host=$RDS_HOST port=5432 dbname=$RDS_DB user=rocktama_api sslmode=disable" -c 'SELECT 1;'
```

### Stage 8 — Backups and operations
- **Backups:**
  - A Data Lifecycle Manager policy for daily EBS snapshots, keeping 7.
  - Before every deploy, `docker compose exec db pg_dump` to a file, copied off the instance (S3 optional).
- **Updates:** push a new SHA tag, set `API_TAG` in Parameter Store, run `fetch-env.sh`, then `docker compose up -d --wait`.
  - `migrate` runs before the new API starts.
  - Migrations are forward-only and checksummed.
- **Logs:** `docker compose logs --since 1h api`.

## 7. Rollback procedures

| Situation | Action |
|---|---|
| A new API version misbehaves | Put the previous SHA back in `API_TAG`, then `docker compose up -d --wait api`. Earlier images remain in ECR. |
| A migration fails | `migrate` exits non-zero and the API is not started, because `service_completed_successfully` gates it. The transaction rolls back. Fix the migration as a new numbered file; never edit an applied one. |
| Data damage | Stop `api`, restore the latest `pg_dump` into a fresh database, or restore the EBS snapshot to a new volume. |
| The certificate fails (sslip.io limits) | Pause credential-bearing traffic until a trusted certificate and hostname are available. |
| Stop all costs | Terminate the instance, release the Elastic IP, delete the snapshots, the DLM policy, the security group, the role and instance profile, the parameters and, if wanted, the ECR images. |

## 8. Open decisions for the owner

1. Approve **EC2 + Compose (≈ $18–22/month)** for a limited staging rollout, or request a priced ECS + RDS design with its TLS and availability choices.
2. `t4g.small` (recommended) or `t4g.micro` (cheaper, tighter on memory).
3. Choose the staging hostname and confirm its certificate before sending credentials.
4. Approve stage 1, the repository code change. Stages 2–8 then each need approval as they create billable resources.
5. Authorize source pushes separately if needed. The image publishing stage can build from the reviewed local commit.
