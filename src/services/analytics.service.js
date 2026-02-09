const { pool } = require("../config/db");

class AnalyticsService {
  static async getPerformance(vehicleId) {
    // 1) Get mapped meter
    const link = await pool.query(
      `SELECT meter_id FROM fleet_links WHERE vehicle_id = $1`,
      [vehicleId]
    );

    if (link.rowCount === 0) return null;

    const meterId = link.rows[0].meter_id;

    // 2) Aggregate last 24h (uses indexes)
    const result = await pool.query(
      `
      WITH vehicle_agg AS (
        SELECT
          COALESCE(SUM(kwh_delivered_dc), 0) AS total_dc,
          COALESCE(AVG(battery_temp), 0) AS avg_temp
        FROM vehicle_telemetry
        WHERE vehicle_id = $1
          AND ts >= NOW() - INTERVAL '24 hours'
      ),
      meter_agg AS (
        SELECT
          COALESCE(SUM(kwh_consumed_ac), 0) AS total_ac
        FROM meter_telemetry
        WHERE meter_id = $2
          AND ts >= NOW() - INTERVAL '24 hours'
      )
      SELECT
        $1 AS vehicle_id,
        $2 AS meter_id,
        meter_agg.total_ac,
        vehicle_agg.total_dc,
        CASE
          WHEN meter_agg.total_ac = 0 THEN 0
          ELSE (vehicle_agg.total_dc / meter_agg.total_ac)
        END AS efficiency_ratio,
        vehicle_agg.avg_temp
      FROM vehicle_agg, meter_agg
      `,
      [vehicleId, meterId]
    );

    return result.rows[0];
  }
}

module.exports = { AnalyticsService };
