const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test/index");

let token;
beforeAll(async () => {
  await seed(data);
  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: "alice@example.com", password: "alicepass" });
  token = login.body.token;
});
afterAll(() => db.end());

describe("POST /api/events/:id/signups", () => {
  test("401: requires auth", async () => {
    const res = await request(app).post("/api/events/1/signups").send({});
    expect([401, 403]).toContain(res.status);
  });

  test("201: creates or confirms signup", async () => {
    const res = await request(app)
      .post("/api/events/1/signups")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect([200, 201]).toContain(res.status);
    expect(res.body).toEqual(expect.any(Object));
  });
});
