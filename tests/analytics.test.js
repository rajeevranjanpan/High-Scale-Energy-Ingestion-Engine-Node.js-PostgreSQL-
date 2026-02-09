const request = require("supertest");
const { app } = require("../src/app");
const { pool } = require("../src/config/db");

describe("Analytics API", () => {
  beforeAll(async () => {
    // Clean tables before tests
    await pool.query("DELETE FROM fleet_links");
    await pool.query("DELETE FROM meter_live_status");
    await pool.query("DELETE FROM vehicle_live_status");
    await pool.query("DELETE FROM meter_telemetry");
    await pool.query("DELETE FROM vehicle_telemetry");

    // Create mapping
    await request(app).post("/v1/links").send({
      vehicleId: "v-900",
      meterId: "m-101",
    });

    // Insert telemetry (2 minutes)
    const t1 = new Date(Date.now() - 60 * 1000).toISOString();
    const t2 = new Date().toISOString();

    // Meter readings
    await request(app).post("/v1/telemetry").send({
      meterId: "m-101",
      kwhConsumedAc: 10,
      voltage: 230,
      timestamp: t1,
    });

    await request(app).post("/v1/telemetry").send({
      meterId: "m-101",
      kwhConsumedAc: 5,
      voltage: 229,
      timestamp: t2,
    });

    // Vehicle readings
    await request(app).post("/v1/telemetry").send({
      vehicleId: "v-900",
      soc: 50,
      kwhDeliveredDc: 8,
      batteryTemp: 35,
      timestamp: t1,
    });

    await request(app).post("/v1/telemetry").send({
      vehicleId: "v-900",
      soc: 55,
      kwhDeliveredDc: 4,
      batteryTemp: 37,
      timestamp: t2,
    });
  });


  test("GET /v1/analytics/performance/v-900 should return analytics", async () => {
    const res = await request(app).get("/v1/analytics/performance/v-900");

    expect(res.status).toBe(200);

    expect(res.body.vehicleId).toBe("v-900");
    expect(res.body.meterId).toBe("m-101");

    // totals
    expect(res.body.totalAcConsumed).toBeGreaterThan(0);
    expect(res.body.totalDcDelivered).toBeGreaterThan(0);

    // ratio
    expect(res.body.efficiencyRatio).toBeGreaterThan(0);
    expect(res.body.efficiencyRatio).toBeLessThanOrEqual(1);

    // temp
    expect(res.body.avgBatteryTemp).toBeGreaterThan(0);
  });

  test("GET /v1/analytics/performance/v-unknown should return 404", async () => {
    const res = await request(app).get("/v1/analytics/performance/v-unknown");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Vehicle not linked to a meter");
  });
});
