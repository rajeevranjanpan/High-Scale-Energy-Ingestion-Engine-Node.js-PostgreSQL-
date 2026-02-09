const request = require("supertest");
const { app } = require("../src/app");
const { pool } = require("../src/config/db");

describe("Links API", () => {
  beforeAll(async () => {
    // Clean mapping table before tests
    await pool.query("DELETE FROM fleet_links");
  });

  test("POST /v1/links should create a mapping", async () => {
    const res = await request(app).post("/v1/links").send({
      vehicleId: "v-900",
      meterId: "m-101",
    });

    expect(res.status).toBe(201);
    expect(res.body.vehicleId).toBe("v-900");
    expect(res.body.meterId).toBe("m-101");
  });

  test("GET /v1/links/v-900 should return mapping", async () => {
    const res = await request(app).get("/v1/links/v-900");

    expect(res.status).toBe(200);
    expect(res.body.vehicleId).toBe("v-900");
    expect(res.body.meterId).toBe("m-101");
  });

  test("GET /v1/links should return all mappings", async () => {
    const res = await request(app).get("/v1/links");

    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
    expect(Array.isArray(res.body.links)).toBe(true);
  });

  test("POST /v1/links should reject invalid payload", async () => {
    const res = await request(app).post("/v1/links").send({
      hello: "world",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid payload");
  });

  test("GET /v1/links/v-unknown should return 404", async () => {
    const res = await request(app).get("/v1/links/v-unknown");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Link not found");
  });
});
