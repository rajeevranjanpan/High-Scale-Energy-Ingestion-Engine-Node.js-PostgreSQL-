const { Router } = require("express");
const { TelemetryController } = require("../controllers/telemetry.controller");

const telemetryRouter = Router();

// POST /v1/telemetry
telemetryRouter.post("/telemetry", TelemetryController.ingest);

module.exports = { telemetryRouter };
