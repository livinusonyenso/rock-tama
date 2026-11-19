import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";
import { createApp } from "../src/app.mjs";

async function startApp(t, db) {
  const app = createApp({ db });
  const server = createServer(app);

  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  }));

  return `http://127.0.0.1:${server.address().port}`;
}

test("readiness returns 200 when database works", async (t) => {
  const db = {
    query: async () => ({ rows: [{ ready: 1 }] }),
  };

  const url = await startApp(t, db);
  const response = await fetch(`${url}/health/ready`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ok",
    database: "ready",
  });
});

test("readiness returns 503 when database fails", async (t) => {
  const db = {
    query: async () => {
      throw new Error("Database unavailable");
    },
  };

  const url = await startApp(t, db);
  const response = await fetch(`${url}/health/ready`);

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    status: "not_ready",
  });
});
