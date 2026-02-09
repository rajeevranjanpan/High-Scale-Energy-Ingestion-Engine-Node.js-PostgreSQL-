const { pool } = require("../config/db");

class TelemetryService {
  static async ingestMeter(data) {
    console.log("[TelemetryService] ingestMeter called:", data);

    const ts = new Date(data.timestamp);

    // COLD (history insert)
    await pool.query(
      `
      INSERT INTO meter_telemetry (meter_id, kwh_consumed_ac, voltage, ts)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (meter_id, ts) DO NOTHING
      `,
      [data.meterId, data.kwhConsumedAc, data.voltage, ts]
    );

    // HOT (live upsert)
    await pool.query(
      `
      INSERT INTO meter_live_status (meter_id, kwh_consumed_ac, voltage, last_seen)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (meter_id)
      DO UPDATE SET
        kwh_consumed_ac = EXCLUDED.kwh_consumed_ac,
        voltage = EXCLUDED.voltage,
        last_seen = EXCLUDED.last_seen
      `,
      [data.meterId, data.kwhConsumedAc, data.voltage, ts]
    );

    console.log("[TelemetryService] ingestMeter DONE:", data.meterId);
  }

  static async ingestVehicle(data) {
    console.log("[TelemetryService] ingestVehicle called:", data);

    const ts = new Date(data.timestamp);

    // COLD (history insert)
    await pool.query(
      `
      INSERT INTO vehicle_telemetry (vehicle_id, soc, kwh_delivered_dc, battery_temp, ts)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (vehicle_id, ts) DO NOTHING
      `,
      [data.vehicleId, data.soc, data.kwhDeliveredDc, data.batteryTemp, ts]
    );

    // HOT (live upsert)
    await pool.query(
      `
      INSERT INTO vehicle_live_status (vehicle_id, soc, kwh_delivered_dc, battery_temp, last_seen)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (vehicle_id)
      DO UPDATE SET
        soc = EXCLUDED.soc,
        kwh_delivered_dc = EXCLUDED.kwh_delivered_dc,
        battery_temp = EXCLUDED.battery_temp,
        last_seen = EXCLUDED.last_seen
      `,
      [data.vehicleId, data.soc, data.kwhDeliveredDc, data.batteryTemp, ts]
    );

    console.log("[TelemetryService] ingestVehicle DONE:", data.vehicleId);
  }
}

module.exports = { TelemetryService };
