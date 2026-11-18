# ROCK-TAMA Natural Spring Water

The Next.js storefront runs from [`frontend/`](frontend/README.md). It currently includes the account, checkout, and payment routes. The `backend/` directory is reserved for the planned Express service.

```bash
cd frontend
npm ci
npm run dev
```

For local integration settings, copy the root `.env.example` to `frontend/.env.local` and fill in the values you need. Next.js reads local environment files from `frontend/`.

See the [backend setup guide](frontend/docs/NODE_EXPRESS_POSTGRES_DOCKER_GITHUB_ACTIONS_GUIDE.md) for the Express, PostgreSQL, Docker, and GitHub Actions plan.
