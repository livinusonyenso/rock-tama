import express from "express";

export function createApp({ db } = {}) {
  const app = express();

  app.disable("x-powered-by");

  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  app.get("/health/ready", async (_request, response) => {
    if (!db) {
      return response.status(503).json({
        status: "not_ready",
      });
    }

    try {
      await db.query("SELECT 1 AS ready");

      return response.status(200).json({
        status: "ok",
        database: "ready",
      });
    } catch {
      return response.status(503).json({
        status: "not_ready",
      });
    }
  });

  return app;
}

export default createApp();
