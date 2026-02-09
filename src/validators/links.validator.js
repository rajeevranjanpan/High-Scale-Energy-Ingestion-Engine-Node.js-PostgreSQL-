/**
 * links.validator.js
 * ------------------
 * Manual validation for vehicle <-> meter mapping payload.
 * No external libraries used.
 */

/**
 * Expected:
 * {
 *   vehicleId: string,
 *   meterId: string
 * }
 */
function validateLinkPayload(body) {
  const errors = [];

  if (!body || typeof body !== "object") {
    errors.push("Body must be a JSON object");
  }

  if (typeof body.vehicleId !== "string" || body.vehicleId.trim() === "") {
    errors.push("vehicleId must be a non-empty string");
  }

  if (typeof body.meterId !== "string" || body.meterId.trim() === "") {
    errors.push("meterId must be a non-empty string");
  }

  if (errors.length > 0) {
    const err = new Error(errors.join(", "));
    err.statusCode = 400;
    throw err;
  }

  return {
    vehicleId: body.vehicleId.trim(),
    meterId: body.meterId.trim(),
  };
}

module.exports = {
  validateLinkPayload,
};
