/**
 * Graceful shutdown (D-131) for SIGTERM (docker stop, ECS task stop) and SIGINT (Ctrl+C).
 *
 * Node.js running as PID 1 in a container has no default SIGTERM handler, so without this the
 * platform waits for its timeout and then kills the process mid-request. Here we:
 *   1. stop accepting new connections and let in-flight requests finish (server.close),
 *   2. close the PostgreSQL pool so connections end cleanly,
 *   3. let the process exit with code 0, or 1 if closing failed.
 * A fallback timer forces exit if something hangs. It is shorter than Docker's default 10 s stop
 * timeout, so we exit with our own message before Docker sends SIGKILL.
 */
export function createShutdown({
  server,
  pool,
  timeoutMs = 8000,
  log = console,
  setExitCode = (code) => {
    process.exitCode = code;
  },
  forceExit = (code) => process.exit(code),
}) {
  let closing = null;

  return function shutdown(signal) {
    if (closing) return closing;

    log.info(`${signal} received: closing HTTP server and database pool`);

    // Unref'd: it never keeps the process alive by itself. It only fires if something else does.
    const timer = setTimeout(() => {
      log.error(`Shutdown did not finish within ${timeoutMs} ms; forcing exit`);
      forceExit(1);
    }, timeoutMs);
    timer.unref?.();

    closing = new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    })
      .then(() => pool.end())
      .then(() => {
        log.info("Shutdown complete");
        setExitCode(0);
      })
      .catch((error) => {
        log.error(`Shutdown failed: ${error.message}`);
        setExitCode(1);
        return pool.end().catch(() => {});
      });

    return closing;
  };
}
