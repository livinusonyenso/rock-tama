FROM node:26-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV PORT=4000

USER node

EXPOSE 4000

CMD ["node", "src/server.mjs"]

COPY --chown=node:node migrations ./migrations
