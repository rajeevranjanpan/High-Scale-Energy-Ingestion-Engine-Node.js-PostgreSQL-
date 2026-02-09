const { AnalyticsService } = require("../services/analytics.service");

class AnalyticsController {
  static async performance(req, res) {
    const { vehicleId } = req.params;

    const data = await AnalyticsService.getPerformance(vehicleId);

    if (!data) {
      return res.status(404).json({ error: "Vehicle not linked to a meter" });
    }

    return res.json({
      vehicleId: data.vehicle_id,
      meterId: data.meter_id,
      window: "24h",
      totalAcConsumed: Number(data.total_ac),
      totalDcDelivered: Number(data.total_dc),
      efficiencyRatio: Number(data.efficiency_ratio),
      avgBatteryTemp: Number(data.avg_temp),
    });
  }
}

module.exports = { AnalyticsController };
