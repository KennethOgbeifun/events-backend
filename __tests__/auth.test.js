const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test/index");

beforeAll(() => seed(data));
afterAll(() => db.end());

describe("POST /api/auth/register", () => {
  test("201: creates a user and returns token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "newuser@example.com", name: "New User", password: "pass1234" });

    expect([201]).toContain(res.status);
    expect(res.body).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({ email: "newuser@example.com" })
      })
    );
  });

  test("409: duplicate email", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@example.com", name: "Dup", password: "x" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@example.com", name: "Dup", password: "x" });

    expect([409]).toContain(res.status);
  });
});

describe("POST /api/auth/login", () => {
  test("200: valid credentials -> token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "staff@community.org", password: "staffpass" })
      .expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({ email: "staff@community.org", is_staff: true })
      })
    );
  });

  test("401: invalid credentials", async () => {
    await request(app)
      .post("/api/auth/login")
      .send({ email: "staff@community.org", password: "wrong" })
      .expect(401);
  });
});
