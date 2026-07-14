import request from "supertest";
import { createApp } from "../src/app";

describe("GET /health", () => {
  it("responds with status ok", async () => {
    const app = createApp();
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.timestamp).toBe("string");
  });
});

describe("Unknown routes", () => {
  it("returns a 404 with a helpful message", async () => {
    const app = createApp();
    const res = await request(app).get("/api/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/no route matches/i);
  });
});
