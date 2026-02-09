const { Router } = require("express");
const { AnalyticsController } = require("../controllers/analytics.controller");

const analyticsRouter = Router();

analyticsRouter.get("/analytics/performance/:vehicleId", AnalyticsController.performance);

module.exports = { analyticsRouter };
