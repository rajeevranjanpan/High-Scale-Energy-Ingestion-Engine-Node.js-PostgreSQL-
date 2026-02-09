const express = require("express");

const { telemetryRouter } = require("./routes/telemetry.routes");
const { analyticsRouter } = require("./routes/analytics.routes");
const { linksRouter } = require("./routes/links.routes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Routes
app.use("/v1", telemetryRouter);
app.use("/v1", analyticsRouter);
app.use("/v1", linksRouter);

module.exports = { app };
