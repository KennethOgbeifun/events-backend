const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test/index");

beforeAll(() => seed(data));
afterAll(() => db.end());

describe("GET /api/events", () => {
  test("200: returns an array of events", async () => {
    const { body } = await request(app).get("/api/events").expect(200);
    expect(Array.isArray(body.events)).toBe(true);
  });

  test("200: filters by category", async () => {
    const { body } = await request(app)
      .get("/api/events")
      .query({ category: "music" })
      .expect(200);

    expect(body.events.every((e) => e.category === "MUSIC")).toBe(true);
  });

  test("200: filters by location", async () => {
    const { body } = await request(app)
      .get("/api/events")
      .query({ location: "London" })
      .expect(200);

    expect(body.events.every((e) => e.location.toLowerCase().includes("london"))).toBe(true);
  });

  test("200: q= text search", async () => {
    const { body } = await request(app)
      .get("/api/events")
      .query({ q: "park" })
      .expect(200);

    expect(Array.isArray(body.events)).toBe(true);
  });
});
