const request = require("supertest");
const { app } = require("../src/app");

describe("Health API", () => {
  test("GET /health should return ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
