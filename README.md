# ROCK-TAMA Natural Spring Water

The Next.js storefront runs from [`frontend/`](frontend/README.md) and includes the account, checkout, and payment routes. The Express service in `backend/` provides health checks and PostgreSQL-backed authentication for customers, drivers, and distributors.

```bash
cd frontend
npm ci
npm run dev
```

For local integration settings, copy the root `.env.example` to `frontend/.env.local` and fill in the values you need. Next.js reads local environment files from `frontend/`.

## Backend (Express + PostgreSQL in Docker)

Copy `.env.docker.example` to `.env.docker` and fill in the passwords (`openssl rand -hex 24`). From the repository root, start the local backend with:

```bash
npm --prefix backend start
```

This also works as the backend `npm: start` task in VS Code. It uses Docker Compose to start PostgreSQL, apply migrations and run Express. A healthy running stack is reused. Express startup with an explicit `DATABASE_URL` or `DATABASE_URL_FILE` also requires `AUTH_ORIGIN`.

To start or rebuild the stack directly with Compose:

```bash
docker compose --env-file .env.docker \
  -f compose.yml -f compose.db.yml -f compose.migrate.yml \
  up --build -d --wait

curl -s 127.0.0.1:4000/health/ready
```

Never run `docker compose down --volumes` unless you intend to delete the database. Role design: `frontend/docs/DECISIONS.md` (D-131).

## Local demo accounts

With the local Docker stack running, run these commands from the repository root using Node.js 26.13.1.

```bash
npm ci --prefix backend
node --env-file=.env.docker backend/scripts/seed-local-demo-accounts.mjs --approve
```

Open [local sign-in](http://localhost:3000/account/login) and use **Log in** with any of the following accounts.

**Password for all three local accounts** `RockTama-Local-Demo-Only!`

| Role | Email | Status after setup | Dashboard |
| --- | --- | --- | --- |
| Customer | `customer.demo@example.test` | Approved | [Customer overview](http://localhost:3000/account/dashboard/overview) |
| Driver | `driver.demo@example.test` | Approved | [Driver dashboard](http://localhost:3000/driver) |
| Distributor | `distributor.demo@example.test` | Approved | [Distributor dashboard](http://localhost:3000/account/dashboard) |

When the frontend runs with `npm run dev`, the approved demo driver sees sample delivery counts on Overview and fictional stops on My deliveries.

Set `API_URL=http://127.0.0.1:4000` in `frontend/.env.local` for the local storefront. The `--approve` flag uses the local database owner to approve only the verified demo accounts above. Omit it to seed the accounts with their regular registration statuses or check an existing setup.

See the [Phase C2 authentication guide](frontend/docs/BACKEND_AUTHENTICATION.md) for the API contracts and PostgreSQL tests, and the [backend setup guide](frontend/docs/NODE_EXPRESS_POSTGRES_DOCKER_GITHUB_ACTIONS_GUIDE.md) for the broader infrastructure plan.
