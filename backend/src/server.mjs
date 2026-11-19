import { createApp } from "./app.mjs";
import { pool } from "./db.mjs";
import { createShutdown } from "./shutdown.mjs";

const host = "0.0.0.0";
const port = Number(process.env.PORT || "4000");

const app = createApp({ db: pool });

const server = app.listen(port, host);

server.once("listening", () => {
  console.log(
    `ROCK-TAMA API listening on ${host}:${server.address().port}`
  );
});

// once(): a second Ctrl+C or SIGTERM falls back to Node's default and stops immediately.
const shutdown = createShutdown({ server, pool });
process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
