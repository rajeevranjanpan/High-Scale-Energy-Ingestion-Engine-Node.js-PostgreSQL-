/**
 * telemetry.validator.js
 * ----------------------
 * validation for polymorphic telemetry payloads.
 * No external libraries used.
 */

/**
 * Detect payload type
 */
function detectTelemetryType(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object");
  }

  if (body.meterId) return "meter";
  if (body.vehicleId) return "vehicle";

  throw new Error("Unknown telemetry type. Must include meterId or vehicleId");
}

/**
 * Validate ISO timestamp
 */
function isValidISODateString(value) {
  if (typeof value !== "string") return false;

  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Validate Meter Telemetry Payload
 * Expected:
 * {
 *   meterId: string,
 *   kwhConsumedAc: number,
 *   voltage: number,
 *   timestamp: string (ISO)
 * }
 */
function validateMeterTelemetry(body) {
  const errors = [];

  if (!body || typeof body !== "object") {
    errors.push("Body must be a JSON object");
  }

  if (typeof body.meterId !== "string" || body.meterId.trim() === "") {
    errors.push("meterId must be a non-empty string");
  }

  if (typeof body.kwhConsumedAc !== "number" || body.kwhConsumedAc < 0) {
    errors.push("kwhConsumedAc must be a non-negative number");
  }

  if (typeof body.voltage !== "number" || body.voltage <= 0) {
    errors.push("voltage must be a positive number");
  }

  if (!isValidISODateString(body.timestamp)) {
    errors.push("timestamp must be a valid ISO datetime string");
  }

  if (errors.length > 0) {
    const err = new Error(errors.join(", "));
    err.statusCode = 400;
    throw err;
  }

  // Return cleaned payload (safe to use)
  return {
    meterId: body.meterId.trim(),
    kwhConsumedAc: body.kwhConsumedAc,
    voltage: body.voltage,
    timestamp: body.timestamp,
  };
}

/**
 * Validate Vehicle Telemetry Payload
 * Expected:
 * {
 *   vehicleId: string,
 *   soc: number (0-100),
 *   kwhDeliveredDc: number,
 *   batteryTemp: number,
 *   timestamp: string (ISO)
 * }
 */
function validateVehicleTelemetry(body) {
  const errors = [];

  if (!body || typeof body !== "object") {
    errors.push("Body must be a JSON object");
  }

  if (typeof body.vehicleId !== "string" || body.vehicleId.trim() === "") {
    errors.push("vehicleId must be a non-empty string");
  }

  if (
    typeof body.soc !== "number" ||
    !Number.isInteger(body.soc) ||
    body.soc < 0 ||
    body.soc > 100
  ) {
    errors.push("soc must be an integer between 0 and 100");
  }

  if (typeof body.kwhDeliveredDc !== "number" || body.kwhDeliveredDc < 0) {
    errors.push("kwhDeliveredDc must be a non-negative number");
  }

  if (typeof body.batteryTemp !== "number") {
    errors.push("batteryTemp must be a number");
  }

  if (!isValidISODateString(body.timestamp)) {
    errors.push("timestamp must be a valid ISO datetime string");
  }

  if (errors.length > 0) {
    const err = new Error(errors.join(", "));
    err.statusCode = 400;
    throw err;
  }

  // Return cleaned payload (safe to use)
  return {
    vehicleId: body.vehicleId.trim(),
    soc: body.soc,
    kwhDeliveredDc: body.kwhDeliveredDc,
    batteryTemp: body.batteryTemp,
    timestamp: body.timestamp,
  };
}

module.exports = {
  detectTelemetryType,
  validateMeterTelemetry,
  validateVehicleTelemetry,
};
