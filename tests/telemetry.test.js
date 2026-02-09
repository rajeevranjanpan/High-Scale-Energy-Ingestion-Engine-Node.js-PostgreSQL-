const request = require("supertest");
const { app } = require("../src/app");
const { pool } = require("../src/config/db");

describe("Telemetry API", () => {
  beforeAll(async () => {
    // Clean tables before tests
    await pool.query("DELETE FROM meter_live_status");
    await pool.query("DELETE FROM vehicle_live_status");
    await pool.query("DELETE FROM meter_telemetry");
    await pool.query("DELETE FROM vehicle_telemetry");
  });


  test("POST /v1/telemetry should accept meter telemetry", async () => {
    const res = await request(app).post("/v1/telemetry").send({
      meterId: "m-101",
      kwhConsumedAc: 10.5,
      voltage: 229.2,
      timestamp: new Date().toISOString(),
    });

    expect(res.status).toBe(202);
    expect(res.body.type).toBe("meter");
  });

  test("POST /v1/telemetry should accept vehicle telemetry", async () => {
    const res = await request(app).post("/v1/telemetry").send({
      vehicleId: "v-900",
      soc: 55,
      kwhDeliveredDc: 8.9,
      batteryTemp: 35.2,
      timestamp: new Date().toISOString(),
    });

    expect(res.status).toBe(202);
    expect(res.body.type).toBe("vehicle");
  });

  test("POST /v1/telemetry should reject invalid telemetry payload", async () => {
    const res = await request(app).post("/v1/telemetry").send({
      hello: "world",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid payload");
  });

  test("POST /v1/telemetry should reject invalid meter telemetry", async () => {
    const res = await request(app).post("/v1/telemetry").send({
      meterId: "m-101",
      kwhConsumedAc: -1,
      voltage: 0,
      timestamp: "invalid-date",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid payload");
  });

  test("POST /v1/telemetry should reject invalid vehicle telemetry", async () => {
    const res = await request(app).post("/v1/telemetry").send({
      vehicleId: "v-900",
      soc: 150,
      kwhDeliveredDc: -2,
      batteryTemp: "hot",
      timestamp: "invalid-date",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid payload");
  });
});
