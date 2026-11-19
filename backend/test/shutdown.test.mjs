import assert from "node:assert/strict";
import test from "node:test";
import { createShutdown } from "../src/shutdown.mjs";

const silent = { info() {}, error() {} };

function fakes({ closeError = null, closeNever = false, endError = null } = {}) {
  const calls = [];
  const server = {
    close(callback) {
      calls.push("server.close");
      if (!closeNever) setImmediate(() => callback(closeError));
    },
  };
  const pool = {
    async end() {
      calls.push("pool.end");
      if (endError) throw endError;
    },
  };
  return { calls, server, pool };
}

test("closes the HTTP server before the database pool and exits with 0", async () => {
  const { calls, server, pool } = fakes();
  let exitCode;
  const shutdown = createShutdown({ server, pool, log: silent, setExitCode: (c) => (exitCode = c), forceExit: () => assert.fail("forced exit") });

  await shutdown("SIGTERM");

  assert.deepEqual(calls, ["server.close", "pool.end"]);
  assert.equal(exitCode, 0);
});

test("a repeated signal reuses the shutdown already in progress", async () => {
  const { calls, server, pool } = fakes();
  const shutdown = createShutdown({ server, pool, log: silent, setExitCode: () => {}, forceExit: () => {} });

  const first = shutdown("SIGTERM");
  const second = shutdown("SIGINT");

  assert.equal(first, second);
  await first;
  assert.deepEqual(calls, ["server.close", "pool.end"]);
});

test("still closes the pool and exits with 1 when the server fails to close", async () => {
  const { calls, server, pool } = fakes({ closeError: new Error("Server is not running") });
  let exitCode;
  const shutdown = createShutdown({ server, pool, log: silent, setExitCode: (c) => (exitCode = c), forceExit: () => {} });

  await shutdown("SIGTERM");

  assert.deepEqual(calls, ["server.close", "pool.end"]);
  assert.equal(exitCode, 1);
});

test("forces exit with 1 when closing hangs past the timeout", async () => {
  const { server, pool } = fakes({ closeNever: true });
  let forced;
  const shutdown = createShutdown({ server, pool, timeoutMs: 20, log: silent, setExitCode: () => {}, forceExit: (c) => (forced = c) });

  shutdown("SIGTERM");
  await new Promise((resolve) => setTimeout(resolve, 60));

  assert.equal(forced, 1);
});
