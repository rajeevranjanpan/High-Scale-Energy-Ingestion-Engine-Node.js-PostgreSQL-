const { pool } = require("../config/db");

/**
 * LinksService
 * ------------
 * Manages the mapping between:
 *   vehicle_id <-> meter_id
 *
 * This mapping is required for analytics correlation.
 */
class LinksService {
  /**
   * Create or Update (UPSERT) mapping
   * - If vehicleId already exists, update its meterId.
   * - If not, insert new row.
   */
  static async upsertLink(vehicleId, meterId) {
    console.log("[LinksService] upsertLink called:", { vehicleId, meterId });

    const result = await pool.query(
      `
      INSERT INTO fleet_links(vehicle_id, meter_id)
      VALUES ($1, $2)
      ON CONFLICT (vehicle_id)
      DO UPDATE SET meter_id = EXCLUDED.meter_id
      RETURNING vehicle_id, meter_id
      `,
      [vehicleId, meterId]
    );

    console.log("[LinksService] upsertLink saved:", result.rows[0]);

    return result.rows[0];
  }

  /**
   * Fetch mapping by vehicleId
   */
  static async getLink(vehicleId) {
    console.log("[LinksService] getLink called:", { vehicleId });

    const result = await pool.query(
      `
      SELECT vehicle_id, meter_id
      FROM fleet_links
      WHERE vehicle_id = $1
      `,
      [vehicleId]
    );

    if (result.rowCount === 0) {
      console.log("[LinksService] getLink not found for:", vehicleId);
      return null;
    }

    console.log("[LinksService] getLink found:", result.rows[0]);

    return result.rows[0];
  }

  /**
   * List all mappings
   * Useful for debugging and demo purposes.
   */
  static async listLinks() {
    console.log("[LinksService] listLinks called");

    const result = await pool.query(
      `
      SELECT vehicle_id, meter_id
      FROM fleet_links
      ORDER BY vehicle_id ASC
      `
    );

    console.log("[LinksService] listLinks rows:", result.rowCount);

    return result.rows;
  }
}

module.exports = { LinksService };
