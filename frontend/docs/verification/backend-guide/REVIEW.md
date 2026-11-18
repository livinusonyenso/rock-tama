# Backend/Docker learning guide validation — 2026-11-18

Deliverable: docs/NODE_EXPRESS_POSTGRES_DOCKER_GITHUB_ACTIONS_GUIDE.md. Documentation only: the live Next.js app, dependencies, database, Docker setup and GitHub workflow were not changed or installed.

Extracted18 complete file examples to /tmp/rocktama-backend-guide-check, outside the project. Validated:

- JavaScript source/test/environment-generator syntax with node --check.
- API package.json parsing.
- Next.js health-route TypeScript syntax transpilation (not runtime import resolution).
- PostgreSQL bootstrap shell syntax with bash -n.
- Compose and GitHub workflow YAML syntax with Ruby YAML.
- Base and merged development Compose configurations with installed Docker Compose v5.7.0, using synthetic generated environment values and an empty local env file.
- Parsed Compose models: exactly db/migrate/api/web; API waits on successful migration; PostgreSQL18 volume uses /var/lib/postgresql; development frontend selects its development image stage; base database has no published host port.

Dockerfile contents were reviewed but not built; SQL was reviewed but not executed. No API dependencies were installed, SQL applied, images built, containers started, migrations executed or GitHub Actions run. Node syntax and Compose model checks are not runtime tests. The workflow includes those later runtime checks for the user to run after implementing all steps and generating/committing the API lockfile.

Versions/patterns checked against official Node.js, Express, node-postgres, Docker, PostgreSQL-image, Next.js and GitHub Actions documentation; links appear next to the relevant guide sections. Existing app-specific constraints are recorded: standalone output must be added deliberately, Tailwind module rule preserved, secrets excluded from Docker context, real backend feature migration remains separate, and Vercel-conditioned launch checks need a Docker production review.

No push or deployment.
