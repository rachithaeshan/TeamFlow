import { ApiError } from "../src/utils/ApiError";

describe("ApiError", () => {
  it("builds a 403 forbidden error with a default message", () => {
    const err = ApiError.forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.message).toMatch(/permission/i);
  });

  it("builds a 400 bad request error carrying validation details", () => {
    const details = [{ field: "email", message: "Invalid email" }];
    const err = ApiError.badRequest("Validation failed", details);
    expect(err.statusCode).toBe(400);
    expect(err.details).toEqual(details);
  });

  it("is an instance of Error so it works with try/catch and Express error handling", () => {
    const err = ApiError.notFound();
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });
});
