# ROCK-TAMA API image (D-130, D-131).
# Base image pinned by tag AND multi-arch index digest, reviewed 2026-11-19:
# Node.js 26.13.1 (Active LTS) on Debian bookworm-slim, with linux/amd64 (AWS Fargate) and
# linux/arm64 (Apple Silicon) variants. Update both the tag and the digest together, deliberately.
FROM node:26.13.1-bookworm-slim@sha256:5df79989ed685e09f0a98019db4cebfb22fb9df1a53c0161664a011f7ff6b0f1 AS runtime

ENV NODE_ENV=production
WORKDIR /app

# 1. Dependencies first: this layer stays cached until package.json or the lockfile changes.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 2. Application code and migrations. Owned by root, so the runtime user can read but not modify them.
COPY src ./src
COPY migrations ./migrations

ENV PORT=4000
EXPOSE 4000

# 3. Run as the unprivileged "node" user that ships with the official image.
USER node

# Exec form: node is PID 1 and receives SIGTERM directly; src/shutdown.mjs handles it.
CMD ["node", "src/server.mjs"]

# The test target runs inside the private database network. Deployments use the default target below.
FROM runtime AS tests
COPY test ./test

FROM runtime AS production
