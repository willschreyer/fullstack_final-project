const express = require("express");
const cors = require("cors");

function buildApp(io) {
  const app = express();
  app.set("io", io);
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_req, res) => res.json({ data: { ok: true } }));
  app.use("/api/threads", require("./routes/threads"));

  app.use((_req, res) => res.status(404).json({ error: { code: "NOT_FOUND", message: "route not found" } }));
  app.use((err, _req, res, _next) => {
    console.error(err);
    const status = err.name === "ValidationError" ? 400 : 500;
    res.status(status).json({ error: { code: status === 400 ? "VALIDATION" : "SERVER", message: err.message } });
  });
  return app;
}

module.exports = buildApp;
