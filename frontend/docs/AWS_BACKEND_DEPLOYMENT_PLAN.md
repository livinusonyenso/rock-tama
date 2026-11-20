# AWS backend deployment plan (proposed, not executed)

_Prepared 2026-11-20 after C3B (`7b64dd7`). Nothing in this document has been created in AWS. Each stage needs the owner's approval before it runs._

**Goal:** a public HTTPS URL for the Express API (`/health`, `/api/v1/auth/*`) backed by PostgreSQL, so registration, login, `/me` and logout can be tested before the frontend and a custom domain exist.

**Labels:** [VERIFIED] = checked in this repository or locally. [ESTIMATE] = an approximate price; confirm it in the AWS Pricing Calculator before creating anything. [ASSUMPTION] = must be confirmed during the stage.

---

## 1. Recommendation

**One small EC2 instance running Docker Compose:**

- **Instance:** `t4g.small` (Graviton arm64, 2 vCPU burstable, 2 GiB RAM) running Ubuntu 24.04 LTS.
- **Address and access:** an Elastic IP. Only ports 80 and 443 are open; there is no SSH, and you connect through AWS Systems Manager Session Manager.
- **Containers:** Caddy (automatic HTTPS) → `api` → `db` (PostgreSQL 18 on an encrypted EBS volume). `db-bootstrap` and `migrate` run once on each start, exactly as on your Mac.
- **Secrets:** generated fresh and stored in SSM Parameter Store (SecureString). They are never copied from your Mac.
- **HTTPS without a domain:** use the hostname `<elastic-ip-with-dashes>.sslip.io` with a Let's Encrypt certificate obtained by Caddy. CloudFront's default domain is the fallback.

**Why not ECS yet:**
- ECS needs an Application Load Balancer, RDS, Secrets Manager and, for a certificate on the load balancer, a domain you own.
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

**New files proposed for stage 1** (not written yet; approval needed):

- **`deploy/compose.prod.yml`:** the production Compose file.
  - Images come from ECR by tag, with no `build:` sections.
  - `db` and `api` publish **no** ports.
  - Caddy publishes 80 and 443 and has a fixed address (for example `172.30.0.10`) on a fixed subnet, so the API can set `TRUST_PROXY=172.30.0.10`.
  - `restart: unless-stopped`, and log rotation (`json-file`, `max-size: 10m`, `max-file: 3`).
- **`deploy/Caddyfile`:** `{$API_HOST} { reverse_proxy api:4000 }`, plus HSTS and `encode`. Caddy replaces any client-supplied `X-Forwarded-For` with the real client address, because it trusts no upstream proxies by default. [ASSUMPTION: confirm against Caddy's `trusted_proxies` documentation for the pinned version.]
- **`backend/db/Dockerfile`:** the existing inline bootstrap Dockerfile as a file, so it can be built and pushed as ECR `rocktama/db-bootstrap` (a second repository).
- **`deploy/fetch-env.sh`:** reads `/rocktama/prod/*` from Parameter Store into `/opt/rocktama/.env` with mode 600.

**Local rehearsal before AWS:** run `deploy/compose.prod.yml` on the Mac with Caddy's `tls internal`. This exercises the whole production stack, including HTTPS and the trusted-proxy address, at no cost.

## 3. Cost comparison, eu-north-1 [ESTIMATE, on-demand, about 730 hours per month]

| Item | EC2 + Compose (recommended) | ECS Fargate + ALB + RDS |
|---|---|---|
| Compute | t4g.small ≈ $12 (t4g.micro ≈ $6, but 1 GiB RAM is tight with Postgres) | Fargate arm64, 0.25 vCPU / 0.5 GB ≈ $7 |
| Load balancer | none (Caddy) | ALB ≈ $18–20 plus LCUs |
| Database | Postgres in Compose on a gp3 20 GiB EBS volume ≈ $2 | RDS db.t4g.micro ≈ $13 plus 20 GB storage ≈ $3 |
| Public IPv4 ($0.005/h each) | 1 Elastic IP ≈ $3.65 | ALB in 2 AZs ≈ $7.30, plus a task IP ≈ $3.65 unless you pay for a NAT gateway (≈ $35) |
| Secrets | Parameter Store standard: free | Secrets Manager, 3 × $0.40 |
| Backups | EBS snapshots (7 daily, incremental) ≈ $1 | RDS automated backups, free up to the database size |
| Logs | Docker log rotation on disk | CloudWatch ≈ $1 |
| Domain needed for HTTPS | No (sslip.io or CloudFront) | Yes (ACM on the ALB) |
| **Monthly total** | **≈ $17–19** | **≈ $50–55** |

The first 100 GB per month of data out to the internet is free. ECR storage is a few cents. The AWS free tier that used to cover t4g.small ended in 2025, and any credits on your Organization account are unknown, so plan on paying the totals above.

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

1. **sslip.io (recommended):** `13-48-1-2.sslip.io` resolves to `13.48.1.2`, with no account needed. Caddy obtains a Let's Encrypt certificate for that exact name. [ASSUMPTION: Let's Encrypt rate limits for the shared `sslip.io` domain allow issuance at deploy time. If issuance fails, use option 2.]
2. **CloudFront default domain** (`https://dxxxx.cloudfront.net`):
   - HTTPS with an AWS certificate, inside the CloudFront free tier.
   - Caching disabled; forward all headers, cookies and query strings.
   - Restrict the origin security group to CloudFront's managed prefix list.
   - The hop from CloudFront to EC2 is HTTP unless the origin also serves TLS.
   - Client IPs then arrive in `CloudFront-Viewer-Address`, which needs a later code change.
3. **Custom domain later:**
   - Point an `A` record (`api.<domain>`) at the Elastic IP, change `API_HOST`, and Caddy issues a new certificate.
   - Add the storefront origin to `AUTH_ORIGIN`.

**Note for the frontend phase:** if Next.js runs on Vercel and calls this API over the internet, Caddy will see Vercel's addresses, not the visitor's. All visitors would then share rate-limit buckets until the gateway sends a client address Express can trust. Running the Next.js container on this same instance, behind the same Caddy, avoids that problem and keeps the API private. Decide this in the frontend phase.

## 6. Step-by-step checklist

Every stage below is **proposed**. Run nothing in stages 2–8 until the owner approves the stage and its cost.

### Stage 0 — Prerequisites (no cost)
- **What:** refresh credentials, check permissions, add a budget alert.
- **Why:** the earlier sessions expired, and the Organization SCP may block IAM or EC2 actions.
- **How:**
  ```bash
  aws login --profile rocktama-dev
  export AWS_PROFILE=rocktama-dev AWS_REGION=eu-north-1
  aws sts get-caller-identity --query Arn --output text
  aws ecr describe-repositories --repository-names rocktama/api \
    --query 'repositories[0].[imageTagMutability,imageScanningConfiguration.scanOnPush]' --output text
  aws ec2 describe-instance-types --instance-types t4g.small --query 'InstanceTypes[0].InstanceType' --output text
  ```
- **Verify:**
  - The ARN names `AccountFullAccessRole`.
  - ECR prints `IMMUTABLE False`. The audit found immutable tags with scan-on-push off; recheck this.
  - `t4g.small` is listed.
  - Create the $25 budget alert in the Billing console, then check: `aws budgets describe-budgets --account-id <id>`.

### Stage 1 — Repository preparation (no cost; code change, needs approval)
- **What:** add the four `deploy/` files from §2, plus `backend/db/Dockerfile`.
- **Why:** the server should only pull and run pinned images; nothing is built there.
- **How:** a reviewed code task, then a local rehearsal:
  ```bash
  docker compose -f deploy/compose.prod.yml --env-file deploy/.env.rehearsal up -d --wait
  curl -k https://localhost/health
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
  TAG=$(git rev-parse --short HEAD); REGISTRY=<account>.dkr.ecr.eu-north-1.amazonaws.com
  aws ecr get-login-password | docker login --username AWS --password-stdin "$REGISTRY"
  docker buildx build --platform linux/arm64 -t "$REGISTRY/rocktama/api:$TAG" --push backend
  aws ecr put-image-scanning-configuration --repository-name rocktama/api --image-scanning-configuration scanOnPush=true
  ```
  This also creates `rocktama/db-bootstrap` and pushes it the same way; it's a new repository, so it needs approval. Add a lifecycle policy that keeps the last 10 images.
- **Verify:**
  - `aws ecr describe-images --repository-name rocktama/api --query 'imageDetails[].imageTags'` lists `$TAG`.
  - `aws ecr describe-image-scan-findings` shows no CRITICAL findings.
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
H=https://<a-b-c-d>.sslip.io
curl -s -w ' %{http_code}\n' $H/health                    # {"status":"ok"} 200
curl -s $H/health/ready                                   # {"status":"ok","database":"ready"}
curl -sv $H/health 2>&1 | grep -E 'subject:|issuer:'      # Let's Encrypt certificate for the sslip.io name
nc -vz -w 3 <elastic-ip> 5432; nc -vz -w 3 <elastic-ip> 4000; nc -vz -w 3 <elastic-ip> 22   # all must fail
```
Then the BACKEND_AUTHENTICATION.md snippet with `auth_origin=$H` and `auth_base=$H/api/v1/auth`:
- register returns 202, login 200 with `Set-Cookie: __Host-rocktama_session=…; Secure; HttpOnly; SameSite=Lax`
- `/me` returns 200 (pending), logout 204, then `/me` returns 401
- a request with `Origin: https://attacker.example` gets 403

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
| The certificate fails (sslip.io limits) | Switch to the CloudFront option in §5; the instance doesn't change. |
| Stop all costs | Terminate the instance, release the Elastic IP, delete the snapshots, the DLM policy, the security group, the role and instance profile, the parameters and, if wanted, the ECR images. |

## 8. Open decisions for the owner

1. Approve **EC2 + Compose (≈ $17–19 per month)** for now, or go straight to ECS + RDS (≈ $50–55 per month, and a domain is required).
2. `t4g.small` (recommended) or `t4g.micro` (cheaper, tighter on memory).
3. sslip.io first (recommended) or CloudFront first.
4. Approve stage 1, the repository code change. Stages 2–8 then each need approval as they create billable resources.
5. Five local commits are not on GitHub. Pushing is not needed for this plan, because images are built locally and pushed to ECR. Decide whether to push for backup.
