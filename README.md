# ROCK-TAMA Natural Spring Water

The Next.js storefront runs from [`frontend/`](frontend/README.md) and includes the account, checkout, and payment routes. The Express service in `backend/` provides health checks and PostgreSQL-backed distributor authentication. Connecting the Next.js account forms is a later task.

```bash
cd frontend
npm ci
npm run dev
```

For local integration settings, copy the root `.env.example` to `frontend/.env.local` and fill in the values you need. Next.js reads local environment files from `frontend/`.

## Backend (Express + PostgreSQL in Docker)

Copy `.env.docker.example` to `.env.docker` and fill in the passwords (`openssl rand -hex 24`). Then start the database, role bootstrap, migrations and API in order:

```bash
docker compose --env-file .env.docker \
  -f compose.yml -f compose.db.yml -f compose.migrate.yml \
  up --build -d --wait

curl -s 127.0.0.1:4000/health/ready
```

Never run `docker compose down --volumes` unless you intend to delete the database. Role design: `frontend/docs/DECISIONS.md` (D-131).

See the [Phase C2 authentication guide](frontend/docs/BACKEND_AUTHENTICATION.md) for the API contracts and PostgreSQL tests, and the [backend setup guide](frontend/docs/NODE_EXPRESS_POSTGRES_DOCKER_GITHUB_ACTIONS_GUIDE.md) for the broader infrastructure plan.
