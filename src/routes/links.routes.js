const { Router } = require("express");
const { LinksController } = require("../controllers/links.controller");

/**
 * Links Routes
 * ------------
 * Vehicle <-> Meter mapping endpoints
 */
const linksRouter = Router();

/**
 * GET /v1/links
 * List all mappings
 */
linksRouter.get("/links", LinksController.list);

/**
 * POST /v1/links
 * Create or update mapping
 */
linksRouter.post("/links", LinksController.create);

/**
 * GET /v1/links/:vehicleId
 * Get mapping for a single vehicle
 */
linksRouter.get("/links/:vehicleId", LinksController.get);

module.exports = { linksRouter };
