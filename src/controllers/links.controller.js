const { validateLinkPayload } = require("../validators/links.validator");
const { LinksService } = require("../services/links.service");

/**
 * LinksController
 * ---------------
 * API to create and read vehicle <-> meter mapping
 */
class LinksController {
  /**
   * POST /v1/links
   * Body:
   * {
   *   "vehicleId": "v-900",
   *   "meterId": "m-101"
   * }
   */
  static async create(req, res) {
    try {
      console.log("\n[LinksController] Incoming link payload:", req.body);

      // Manual validation (no Zod)
      const data = validateLinkPayload(req.body);

      const saved = await LinksService.upsertLink(data.vehicleId, data.meterId);

      return res.status(201).json({
        message: "Link saved",
        vehicleId: saved.vehicle_id,
        meterId: saved.meter_id,
      });
    } catch (err) {
      console.error("[LinksController] ERROR:", err);

      return res.status(err.statusCode || 400).json({
        error: "Invalid payload",
        message: err.message || "Bad Request",
      });
    }
  }

  /**
   * GET /v1/links/:vehicleId
   */
  static async get(req, res) {
    const { vehicleId } = req.params;

    console.log("\n[LinksController] get link for vehicleId:", vehicleId);

    const link = await LinksService.getLink(vehicleId);

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    return res.json({
      vehicleId: link.vehicle_id,
      meterId: link.meter_id,
    });
  }

  /**
   * GET /v1/links
   * Returns list of all mappings
   */
  static async list(req, res) {
    console.log("\n[LinksController] list all links");

    const links = await LinksService.listLinks();

    return res.json({
      count: links.length,
      links: links.map((row) => ({
        vehicleId: row.vehicle_id,
        meterId: row.meter_id,
      })),
    });
  }
}

module.exports = { LinksController };
