const {
  detectTelemetryType,
  validateMeterTelemetry,
  validateVehicleTelemetry,
} = require("../validators/telemetry.validator");

const { TelemetryService } = require("../services/telemetry.service");

class TelemetryController {
  static async ingest(req, res) {
    try {
      console.log("\n[TelemetryController] Incoming telemetry:", req.body);

      const type = detectTelemetryType(req.body);
      console.log("[TelemetryController] Detected type:", type);

      if (type === "meter") {
        const data = validateMeterTelemetry(req.body);
        console.log("[TelemetryController] Valid meter telemetry:", data);

        await TelemetryService.ingestMeter(data);

        return res.status(202).json({
          status: "accepted",
          type: "meter",
        });
      }

      if (type === "vehicle") {
        const data = validateVehicleTelemetry(req.body);
        console.log("[TelemetryController] Valid vehicle telemetry:", data);

        await TelemetryService.ingestVehicle(data);

        return res.status(202).json({
          status: "accepted",
          type: "vehicle",
        });
      }

      return res.status(400).json({
        error: "Invalid payload",
        message: "Unknown telemetry type",
      });
    } catch (err) {
      console.error("[TelemetryController] ERROR:", err);

      return res.status(err.statusCode || 400).json({
        error: "Invalid payload",
        message: err.message || "Bad Request",
      });
    }
  }
}

module.exports = { TelemetryController };
