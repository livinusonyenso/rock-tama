# AWS staging runbook — one EC2 instance (D2)

_Prepared 2026-11-20 (D2 preflight, D-136). **Nothing here has been created in AWS.** Every step marked 💲 creates a resource or a charge and needs the owner's approval first._

**Existing host procedure (2026-11-21):** the deployment now targets the already running x86-64 Amazon Linux instance `i-0ad28bbea578fa416`. Use the [existing host instructions](#existing-host-instructions--2026-11-21) below. The Graviton provisioning steps are retained as the earlier plan.

Architecture (owner decision, D-136): **one `t4g.small` instance in eu-north-1** running Docker Compose: Caddy (HTTPS) → Next.js and Express → PostgreSQL. Secrets come from SSM Parameter Store, data lives on an encrypted EBS data volume, images come from ECR, and there's no SSH.

---

## 1. Readiness report

| Area | Status | Evidence (2026-11-20) |
|---|---|---|
| CLI identity | ✅ | Profile `rocktama-dev`, account `638486126885`, role `managed/AccountFullAccessRole`, region `eu-north-1`, CLI 2.41.0 |
| Account plan | ⚠️ **Free plan** | `freetier get-account-plan-state`: plan FREE, ACTIVE, **$100.00 credits**, **expires 2027-05-18** |
| ECR | ✅ exists, needs settings | `rocktama/api`: IMMUTABLE tags, **scan on push off**, AES256, **no lifecycle policy**, 0 images. Registry scanning is BASIC. `web`, `db-bootstrap` and `edge` repositories don't exist yet. |
| VPC | ✅ default VPC only | `172.31.0.0/16`; public subnets in eu-north-1a/b/c (auto-assign public IP on); 1 internet gateway |
| Existing resources | ✅ nothing billable | 0 instances, 0 Elastic IPs, 0 EBS volumes, 0 NAT gateways; only the default security group; 0 SSM parameters, 0 DLM policies, no budgets |
| Instance types | ✅ | `t4g.small` and `t4g.medium` are offered in all three AZs |
| AMI | ✅ | Ubuntu 24.04 arm64 `ami-09aa4a5ab990926c8` (2026-11-20), from `/aws/service/canonical/ubuntu/server/24.04/stable/current/arm64/hvm/ebs-gp3/ami-id` |
| Permissions | ✅ for everything D2 needs | See §2. The one denial (`iam:ListOpenIDConnectProviders`) matters only for future GitHub OIDC. |
| Release images | ✅ built locally, **not pushed** | 4 × linux/arm64 for `c0bc972…`, audited (§4) |
| Stack configuration | ✅ | `compose.staging.yml` validated with `docker compose config`; `Caddyfile.staging` validated with `caddy validate`; the instance policy passes IAM Access Analyzer |
| Memory | ✅ measured | §3 |
| Smoke test | ✅ rehearsed | `deploy/smoke-staging.mjs` passes against D1 and fails closed without a trusted certificate |
| Not verified | — | A real EC2 boot, `user-data.sh` on Ubuntu, a public certificate for sslip.io, and Session Manager on the instance. These need resources (§6). |

## 2. Verified AWS permissions

**How they were checked:**
- EC2: real `--dry-run` calls, which evaluate IAM and Organization policies without creating anything.
- Everything else: `iam simulate-principal-policy` with `aws:RequestedRegion=eu-north-1` and concrete resource ARNs.
- Without the region context the simulator reports Organization denials. Those are an artefact: the real dry-runs in eu-north-1 are allowed.

| Action | Result |
|---|---|
| `ec2:RunInstances` (t4g.small, IMDSv2, encrypted gp3), `CreateSecurityGroup`, `AllocateAddress`, `CreateVolume` | ✅ DryRunOperation (allowed) |
| `ec2:AssociateIamInstanceProfile`, `ssm:PutParameter`, `ssm:StartSession`, `dlm:CreateLifecyclePolicy`, `budgets:ModifyBudget` | ✅ allowed |
| `iam:CreateRole`, `PutRolePolicy`, `CreateInstanceProfile`, `AddRoleToInstanceProfile`, `PassRole` | ✅ allowed |
| `ecr:CreateRepository`, `PutImage`, the layer uploads, `PutLifecyclePolicy`, `PutImageScanningConfiguration`, `GetAuthorizationToken` and the pull actions | ✅ allowed (Organizations: allowed) |
| `iam:ListOpenIDConnectProviders` | ❌ explicit deny (GitHub OIDC only, not needed for D2) |

## 3. Memory and instance size

**Measured** on the arm64 D1 stack, using cgroup v2 `memory.peak` (the kernel's high-water mark) and 1-second `docker stats` samples. The run covered a cold start, the full D1 verification (restart, Postgres replacement, backup and restore), 20 concurrent logins, and 60 s idle.

| Container | Peak | Idle | Limit in `compose.staging.yml` |
|---|---|---|---|
| api (Express, Argon2id, 4-hash cap) | 129.5 MiB | ~106 MiB | 384 MiB |
| web (Next.js standalone) | 118.5 MiB | ~77 MiB | 512 MiB |
| db (PostgreSQL 18) | 75.4 MiB | ~56 MiB | 512 MiB |
| caddy | 32.7 MiB | ~26 MiB | 128 MiB |
| migrate / db-bootstrap (one-off, before the API starts) | 18.8 / 7.4 MiB | — | 128 MiB each |
| **Application total** | **≈ 357 MiB** | **≈ 265 MiB** | |

In the burst of 20 concurrent logins, 6 returned 200 and 14 returned 503 "busy". The per-process cap of 4 concurrent password hashes keeps Argon2 memory bounded.

**Recommendation: `t4g.small` (2 GiB).**
- Ubuntu with Docker and the SSM agent typically uses about 350–450 MiB [ESTIMATE; measure after boot with `free -m`].
- That puts the whole instance at about 0.8 GiB, leaving more than 1 GiB for the page cache, image pulls and growth, plus the 1 GiB swap file from `user-data.sh`.
- `t4g.micro` (1 GiB) would leave about 250 MiB, too little for image pulls and Next.js spikes.
- `t4g.medium` (4 GiB) doubles the cost for headroom the measurements don't call for, **and it isn't launchable on the Free plan** (§5).

## 4. Release images (built locally, not pushed)

`deploy/build-release.sh <registry>` refuses a dirty Git tree. It builds linux/arm64 only, tags each image `rocktama/<name>:<full git sha>`, and adds the OCI `revision`, `created` and `title` labels. Build `c0bc9724723557f6f60ea5c8e61ca18cfebbffcd`:

| Image | Built from | Runs as | Compressed |
|---|---|---|---|
| `rocktama/api` | `backend/Dockerfile` (target `production`) | `node` (uid 1000), `node src/server.mjs` | ≈ 81 MB |
| `rocktama/web` | `frontend/Dockerfile` (Next.js standalone, `DEPLOY_MODE=staging`) | `node`, `node server.js` | ≈ 153 MB |
| `rocktama/db-bootstrap` | `backend/db/Dockerfile` | `postgres`, entry point `/bootstrap/bootstrap.sh` | ≈ 111 MB |
| `rocktama/edge` | `deploy/Caddy.staging.Dockerfile` (pinned Caddy, Caddyfile, release bundle) | Caddy default | ≈ 22 MB |

**Audit:**
- **Secrets:** each flattened image filesystem was searched for every real value of 12 or more characters from `.d1/`, `.env.docker` and `frontend/.env.local`. There were **0 secret matches**. The one match was the non-secret role name `rocktama_app` (`POSTGRES_USER`) inside `bootstrap-roles.sql`.
- **Files:** no `.env*`, `.d1`, keys, `.npmrc`, `.git` or test files.
- **Environment variable names only:** `NODE_ENV`, `PORT`, `HOSTNAME` and base-image variables.
- **Dependencies:**
  - API: production dependencies only (Express, pg, Argon2 and their dependencies).
  - Web: none of the development tools (TypeScript, ESLint, Tailwind, `@types/*`).
- **Source mounts:** none. Compose mounts only the secret files and the data directories.
- **Republish:** the published release is rebuilt from the approved commit at publish time (step D2-3). Tags never move.

## 5. Costs (eu-north-1, AWS Price List API, 2026-11-20)

| Item | Rate | Staging amount | Per month |
|---|---|---|---|
| `t4g.small` | $0.0172/h | 730 h | **$12.56**, but $0 until 31 Dec 2026 under the T4g free trial (750 h per month) |
| `t4g.medium` (comparison) | $0.0344/h | 730 h | $25.11, not covered by the trial and **not launchable on the Free plan** |
| EBS gp3 (root 16 GiB + data 10 GiB, baseline speed included) | $0.0836/GB-mo | 26 GiB | $2.17 |
| Public IPv4 (Elastic IP, in use) | $0.005/h | 730 h | $3.65 |
| EBS snapshots (7 daily, incremental, data volume < 1 GiB used) | $0.0475/GB-mo | ~1–2 GB | ≈ $0.05–0.10 |
| ECR storage (≈ 0.37 GB per release before layer sharing; keep 10) | $0.10/GB-mo | ~0.5–1 GB | ≈ $0.05–0.10 |
| Data out to the internet | first 100 GB per month free, then $0.09/GB | low | $0 |
| DNS | sslip.io | — | $0 (Route 53 later: $0.50 per zone per month, plus the domain, about $13–15 a year for `.com`) |
| Budgets, Parameter Store standard, Session Manager, ECR basic scanning, DLM | — | — | $0 |

| Plan | Monthly | Notes |
|---|---|---|
| **t4g.small, until 31 Dec 2026** | **≈ $6.0** | instance hours covered by the T4g trial |
| **t4g.small, from 1 Jan 2027** | **≈ $18.6** | |
| t4g.medium (comparison) | ≈ $31.1 | not available on the Free plan |

**Credits and Free-plan limits:**
- From now to 18 May 2027: about 1.4 months × $6.0 plus 4.6 months × $18.6, roughly **$92.5** of the **$100** credits. That leaves very little margin.
- On the Free plan, using up the credits or reaching the expiry date **suspends the account**: the site goes offline, and AWS deletes the account after 90 days unless it's upgraded.
- Upgrading to a paid plan keeps the remaining credits. Upgrade **before** real users or the custom domain depend on this site.
- Sources: [Choosing a plan](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html) · [Free Tier FAQs](https://aws.amazon.com/free/free-tier-faqs/) · [EC2 Free Tier](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-free-tier-usage.html) · [T4g](https://aws.amazon.com/ec2/instance-types/t4/)

**Burstable CPU:** launch with `CpuCredits=standard`. The default for T4g is "unlimited", which bills extra CPU time if usage stays above baseline. Standard mode throttles instead.

## 6. Publishing plan (D2), step by step

`REG=638486126885.dkr.ecr.eu-north-1.amazonaws.com`, `export AWS_PROFILE=rocktama-dev AWS_REGION=eu-north-1`. Each step: WHAT → WHY → HOW → VERIFY.

### D2-1 Budget alert (free)
- **What:** a $10 monthly cost budget with email alerts at 50, 80 and 100%.
- **Why:** this account runs on limited credits.
- **How:** Billing console → Budgets → Cost budget → $10, or `aws budgets create-budget` with a JSON file reviewed with you.
- **Verify:** `aws budgets describe-budgets --account-id 638486126885 --region us-east-1`.

### D2-2 ECR repositories and settings (free until images are stored)
- **What:** create `rocktama/web`, `rocktama/db-bootstrap` and `rocktama/edge` (immutable, scan on push, AES256). Turn on scan on push for `rocktama/api`. Apply `deploy/aws/ecr-lifecycle-policy.json` to all four.
- **Why:** one repository per image, immutable tags, and bounded storage.
- **How:**
  ```bash
  for r in web db-bootstrap edge; do aws ecr create-repository --repository-name rocktama/$r --image-tag-mutability IMMUTABLE --image-scanning-configuration scanOnPush=true --encryption-configuration encryptionType=AES256; done
  aws ecr put-image-scanning-configuration --repository-name rocktama/api --image-scanning-configuration scanOnPush=true
  for r in api web db-bootstrap edge; do aws ecr put-lifecycle-policy --repository-name rocktama/$r --lifecycle-policy-text file://deploy/aws/ecr-lifecycle-policy.json; done
  ```
- **Verify:** `aws ecr describe-repositories --query 'repositories[].[repositoryName,imageTagMutability,imageScanningConfiguration.scanOnPush]' --output table`.

### D2-3 💲 Publish one release (cents per month)
- **What:** rebuild from the approved commit and push four images.
- **How:**
  ```bash
  git status --porcelain   # must print nothing
  deploy/build-release.sh "$REG"
  aws ecr get-login-password | docker login --username AWS --password-stdin "$REG"
  SHA=$(git rev-parse HEAD); for n in api web db-bootstrap edge; do docker push "$REG/rocktama/$n:$SHA"; done
  ```
- **Verify:**
  - `aws ecr describe-images --repository-name rocktama/api --query 'imageDetails[].[imageTags[0],imageDigest,imageSizeInBytes]'` for each repository.
  - `aws ecr describe-image-scan-findings --repository-name rocktama/<n> --image-id imageTag=$SHA --query imageScanFindings.findingSeverityCounts` must show no CRITICAL.
- **Rollback:** `aws ecr batch-delete-image --repository-name rocktama/<n> --image-ids imageTag=$SHA`.

### D2-4 Secrets in Parameter Store (free)
- **What:** three new random passwords. They're never printed, and none are reused from your Mac.
- **How:**
  ```bash
  for r in bootstrap migrator api; do aws ssm put-parameter --name /rocktama/staging/$r-password --type SecureString --value "$(openssl rand -hex 24)"; done
  ```
- **Verify:** `aws ssm get-parameters-by-path --path /rocktama/staging --query 'Parameters[].Name'` lists names only.
- **Rollback:** `aws ssm delete-parameters --names …`.

### D2-5 IAM role and instance profile (free)
- **What:** `rocktama-staging-ec2`, with the trust policy `deploy/aws/ec2-trust-policy.json`, the managed `AmazonSSMManagedInstanceCore`, and the inline `deploy/aws/ec2-instance-policy.json`. That inline policy allows ECR pulls from `rocktama/*`, reading the three parameters, and `kms:Decrypt` only through SSM.
- **How:** `aws iam create-role`, then `attach-role-policy`, `put-role-policy`, `create-instance-profile` and `add-role-to-instance-profile`.
- **Verify:** `aws iam simulate-principal-policy --policy-source-arn <role-arn> --action-names ecr:BatchGetImage ssm:GetParameter ecr:PutImage`. Pull and read must be allowed, and `PutImage` must be **denied**.

### D2-6 Security group (free)
- **What:** `rocktama-staging-web` in the default VPC.
- **Inbound:** TCP 80 and 443 from `0.0.0.0/0` only. Port 80 serves the certificate challenge and the redirect to HTTPS.
- **Not open:** 22, 3000, 4000 and 5432.
- **Outbound:** the default, for apt, ECR, SSM and certificate issuance.

### D2-7 💲 Launch the instance (≈ $0.08 per day for EBS and IPv4 now; plus $0.41 per day for the instance from 1 Jan 2027)
- **What:** `t4g.small`, AMI from §1, subnet in eu-north-1a, `rocktama-staging-web`, `rocktama-staging-ec2`.
  - `--metadata-options HttpTokens=required,HttpPutResponseHopLimit=2`, `--credit-specification CpuCredits=standard`.
  - Root: 16 GiB gp3, encrypted, deleted with the instance.
  - Data: `/dev/sdf`, 10 GiB gp3, encrypted, **kept** when the instance is terminated (`DeleteOnTermination=false`).
  - `--user-data file://deploy/ec2/user-data.sh`.
  - Tags `Project=rocktama`, `Env=staging`, and `Backup=rocktama-staging` on the data volume.
- **Verify:**
  - `aws ec2 describe-instances` shows `running`.
  - `aws ssm describe-instance-information` shows `Online`.
  - In a session: `cloud-init status --wait` prints `done`, `findmnt /srv/rocktama` shows the data volume, `free -m` gives the real OS memory, and `docker version` works.

### D2-8 💲 Elastic IP and hostnames ($3.65 per month)
- **What:** `aws ec2 allocate-address`, then `associate-address`.
- **Hostnames:** `SHOP_HOST=shop.<a-b-c-d>.sslip.io` and `API_HOST=api.<a-b-c-d>.sslip.io`. Both resolve to the Elastic IP; I checked `dig +short shop.13-48-1-2.sslip.io` → `13.48.1.2`.
- **TLS:** Caddy obtains a publicly trusted certificate from Let's Encrypt, or from ZeroSSL, its built-in fallback. No domain purchase is needed.
- **Fallback:** if both CAs refuse because of shared rate limits on `sslip.io`, use a CloudFront default domain, with HTTPS to an origin that has a trusted certificate (see the deployment plan §5).
- **Verify:** `dig +short $SHOP_HOST` returns the Elastic IP.

### D2-9 First deploy (through Session Manager; no SSH)
```bash
aws ssm start-session --target <instance-id>
sudo -i
REG=638486126885.dkr.ecr.eu-north-1.amazonaws.com SHA=<full sha>
mkdir -p /opt/rocktama/releases/$SHA
docker run --rm --entrypoint tar $REG/rocktama/edge:$SHA -C /deploy -cf - . | tar -C /opt/rocktama/releases/$SHA -xf -
printf 'REGISTRY=%s\nSHOP_HOST=%s\nAPI_HOST=%s\n' $REG shop.<a-b-c-d>.sslip.io api.<a-b-c-d>.sslip.io > /opt/rocktama/site.env
/opt/rocktama/releases/$SHA/ec2/fetch-secrets.sh
/opt/rocktama/releases/$SHA/ec2/deploy.sh $SHA
```
- **Expected:** `db`, `api`, `web` and `caddy` healthy; `db-bootstrap` and `migrate` `Exited (0)`; migrate logs `Applied migration: 001…004`.
- **Verify, from your Mac:**
  ```bash
  node deploy/smoke-staging.mjs --shop shop.<a-b-c-d>.sslip.io --api api.<a-b-c-d>.sslip.io --ip <a.b.c.d>
  ```
  It checks:
  - a publicly trusted certificate and health
  - that only 80 and 443 are open (22, 3000, 4000 and 5432 closed)
  - the HTTP→HTTPS redirect
  - the full auth lifecycle with `__Host-` `Secure` `HttpOnly` `Lax` cookies, both on the API host and through the storefront

  Then open `https://shop.<a-b-c-d>.sslip.io/account/register` in a browser.

### D2-10 Backups (snapshots ≈ $0.10 per month)
- **Per deploy:** `deploy.sh` writes a `pg_dump` to `/srv/rocktama/backups` before every change, keeping 14.
- **Nightly:** cron writes `daily-<weekday>.dump`, keeping 7.
- **Volume:** a DLM policy takes a daily snapshot of the volume tagged `Backup=rocktama-staging`, keeping 7. `aws dlm create-default-role` creates the AWS-managed DLM role; that's an IAM change needing approval.
- **Off-account copies** (recommended because of the Free-plan suspension risk): download a dump periodically, or approve a small S3 bucket later.

## 7. Restore, rollback and updates

**Update after a new commit:**
1. Commit and run the local checks.
2. Run `deploy/build-release.sh "$REG"` and push the four images (D2-3).
3. In a session, run `/opt/rocktama/releases/<current>/ec2/deploy.sh <new-sha>`. The script takes the new bundle from the new edge image, pulls all images first (so a missing image changes nothing), takes a backup, and starts in the order db → bootstrap → migrate → api → web → caddy. Each step waits on a health check or a successful exit.
4. Run the smoke test.

**Rollback:**
- Run `deploy.sh rollback`. It redeploys the previous SHA; its images stay in ECR until the lifecycle policy keeps more than 10 newer ones.
- Migrations are forward-only and checksummed. A migration that's already applied stays in place, so write migrations that the previous release can still run against (add columns rather than renaming or dropping them in the same release).

**Restore data from a dump:**
```bash
docker compose -p rocktama stop web api
docker exec -i rocktama-db-1 pg_restore --clean --if-exists -U rocktama_bootstrap -d rocktama < /srv/rocktama/backups/<file>.dump
docker compose -p rocktama start api web
```
D1 rehearsed a dump restore into a separate database. Restore into a scratch database first, check it, then restore over the live one.

**Restore after losing the instance or the volume:**
1. Create a volume from the latest snapshot in the same AZ.
2. Launch a new instance (D2-7) with that volume attached as `/dev/sdf`. `user-data.sh` finds the existing filesystem and does **not** format it.
3. Run D2-9. The existing data and Caddy's certificates are reused.

**Stop all costs:**
- Terminate the instance.
- Release the Elastic IP; an unattached one still costs $3.65 per month.
- Delete the data volume and its snapshots.
- Delete the DLM policy, the ECR images, the parameters, the security group, the role and the instance profile.

## Existing host instructions — 2026-11-21

Use AWS Systems Manager on the existing `t3.small`. Namecheap already points the apex and `api` to `13.51.251.222`, with `www` as a CNAME to the apex. The current address is auto-assigned. Check it after starting a stopped instance and update the two A records if it changes. The approved 8 GiB root EBS volume is persistent and unencrypted. Keep only disposable staging data there. The host has no existing Docker containers or database volumes in the pre-deployment inventory.

**Verified deployment:** release `ae9f78966be654cfbfc60af03625d00e88fd2b31` runs on `i-0ad28bbea578fa416`. PostgreSQL, API, Next.js and Caddy reported healthy. Bootstrap and migrations exited successfully, with `001`–`004` recorded. The storefront and product pages returned 200, `www` returned a 308 to the apex, and the API readiness probe returned `{"status":"ok","database":"ready"}` over publicly trusted TLS. HTTP and Chrome checks passed for registration, login, pending distributor access and logout with synthetic accounts. Staging is `noindex` with no Paystack key. Ports 3000, 4000 and 5432 are closed to the public. The existing SSH rule remains in place.

**Update 2026-11-21:** release `df7a8505404c3df10712a7ced05e267eed5c64f6` (franchise page, header/layout overflow fixes) replaced `ae9f789…` as `current-release`. Only web, db-bootstrap and edge were rebuilt for amd64; the API and migration jobs kept the digest pinned above. `deploy.sh` took a pre-update backup at `/opt/rocktama/data/backups/rocktama-before-df7a8505404c.*`. All services reported healthy, `smoke-staging.mjs` passed all three groups, and `/franchise` returns 200 and is linked from the header.

On first deployment, create `/opt/rocktama/data/postgres` on the approved disk. The PostgreSQL image's `postgres` user must own this mount directory so it can create `18/docker`. A root-owned mode `0700` mount prevented initialization on this host. Determine UID and GID with `id` in the exact database image and set ownership on the mount directory only. Keep the host parent directory root-only. The bootstrap job uses the secrets generated on the host by `fetch-secrets.sh --local-init` and reuses those files on future runs.

**Release and publish after approval.** Build the three missing images for `linux/amd64`. The existing API tag `03ededb34f11` resolves to the AMD64 index below. Pin it by digest for both Express and migration; use the full, clean Git SHA for the three new images.

```bash
export AWS_PROFILE=rocktama-dev AWS_REGION=eu-north-1
REG=638486126885.dkr.ecr.eu-north-1.amazonaws.com
SHA=$(git rev-parse HEAD)
RELEASE_PLATFORM=linux/amd64 deploy/build-release.sh "$REG" web db-bootstrap edge
aws ecr get-login-password | docker login --username AWS --password-stdin "$REG"
for image in web db-bootstrap edge; do docker push "$REG/rocktama/$image:$SHA"; done
```

**Operate the existing stack.** In an SSM shell, run `sudo -i`. The release bundle supplies Compose and the deployment scripts. The current release file is the source of truth for status and logs.

```bash
cd /opt/rocktama
SHA=$(cat current-release)
stack() { docker compose --project-name rocktama --env-file "releases/$SHA/release.env" -f "releases/$SHA/compose.staging.yml" "$@"; }
stack ps -a
stack logs --tail=100 api web caddy
stack restart api web caddy
stack stop caddy web api db
```

`stack stop` preserves PostgreSQL and Caddy files under `/opt/rocktama/data`, and the EC2 instance keeps running. To stop the EC2 instance itself from your terminal, run `aws ec2 stop-instances --instance-ids i-0ad28bbea578fa416 --profile rocktama-dev --region eu-north-1` when you intend to take staging offline. EBS storage and ECR images persist and can continue to incur charges. Check the address after starting the instance again.

For an update, publish the approved AMD64 release, authenticate the host Docker client to ECR using its instance role, and invoke `releases/$SHA/ec2/deploy.sh NEW_SHA`. Publish the API under the new full SHA when API code changes. If the API remains unchanged, pass the reviewed digest as the script’s second argument. Existing database data is backed up before an update. Backups are retained for review on this host, so check available disk space before updating.

```text
638486126885.dkr.ecr.eu-north-1.amazonaws.com/rocktama/api@sha256:a8a0f1379440db43071b02f8d61e103ec6e3ce58f4f6ffddfacc990fa4b3459d
```

**Verify public HTTPS and auth** from the repository root. These checks create disposable `example.test` accounts and never use payment credentials. The optional flag acknowledges the host’s pre-existing SSH rule. Omit it after SSH ingress is removed through a separately approved change.

```bash
node deploy/smoke-staging.mjs --shop rocktamanaturalsprings.com \
  --www www.rocktamanaturalsprings.com --api api.rocktamanaturalsprings.com \
  --ip 13.51.251.222 --allow-existing-ssh
node deploy/verify-d1-browser.mjs --shop https://rocktamanaturalsprings.com \
  --api https://api.rocktamanaturalsprings.com
```

## Automatic staging deployment from GitHub

Pushes to `refactor/frontend-backend-structure` trigger `Deploy ROCK-TAMA staging`. This is the branch that contains the EC2 deployment stack. The workflow runs backend unit tests and frontend lint, builds the AMD64 images for the full Git SHA, publishes missing tags to ECR, and calls the existing EC2 deployment script through Systems Manager. The host takes its normal database backup before switching releases. GitHub then checks the public storefront and API readiness over HTTPS. A rerun reuses any images already published for that SHA. GitHub serializes deployments to the instance.

### One-time connection

Run from the repository root with an AWS administrator authorized to configure IAM. Confirm the account prints `638486126885`.

```bash
export AWS_PROFILE=rocktama-dev AWS_REGION=eu-north-1
aws login --profile "$AWS_PROFILE"
aws sts get-caller-identity --query Account --output text
aws iam get-open-id-connect-provider \
  --open-id-connect-provider-arn arn:aws:iam::638486126885:oidc-provider/token.actions.githubusercontent.com \
  --query ClientIDList
```

If the provider is absent, create it once. If it already exists, confirm its audience list includes `sts.amazonaws.com` before proceeding.

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com --client-id-list sts.amazonaws.com
```

Review the included trust and permissions policies, then create a dedicated deployment role if it does not exist. The trust policy uses this repository's immutable GitHub subject and matches only the deployment branch. The role can publish to the four existing ECR repositories and send a shell command to the staging instance. Give deployment-branch write access to people trusted to operate that host. [GitHub OIDC subject reference](https://docs.github.com/en/actions/reference/security/oidc)

```bash
aws iam create-role --role-name rocktama-github-deploy \
  --assume-role-policy-document file://deploy/aws/github-deploy-trust-policy.json
aws iam put-role-policy --role-name rocktama-github-deploy --policy-name PublishAndDeployStaging \
  --policy-document file://deploy/aws/github-deploy-policy.json
gh variable set ROCKTAMA_AWS_DEPLOY_ROLE_ARN --repo livinusonyenso/rock-tama \
  --body arn:aws:iam::638486126885:role/rocktama-github-deploy
```

The ARN is a repository variable. GitHub obtains temporary AWS credentials through OIDC. The existing EC2 instance role pulls images and the existing server-side secret files supply application credentials.

### First release and verification

Review and commit the release, then push to the deployment branch when ready to publish. Every new deployment can add ECR image storage. Check EC2 free disk space periodically because the deployment script retains its local database backups. [Amazon ECR pricing](https://aws.amazon.com/ecr/pricing/)

```bash
git push origin HEAD:refactor/frontend-backend-structure
```

Open **Actions → Deploy ROCK-TAMA staging** in the GitHub repository. A successful deployment shows the same full Git SHA in the EC2 release output and finishes both HTTPS checks.

```bash
curl -fsS -o /dev/null -w '%{http_code}\n' https://rocktamanaturalsprings.com/
curl -fsS https://api.rocktamanaturalsprings.com/health/ready
```

If the workflow fails, check its test output and the SSM command result in the deployment step. Rerun the failed job to retry the same release. Use the existing rollback procedure if a deployed release must be rolled back. [Restore, rollback and updates](#7-restore-rollback-and-updates)
