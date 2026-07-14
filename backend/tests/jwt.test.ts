import { signToken, verifyToken } from "../src/utils/jwt";

describe("jwt utils", () => {
  it("signs a token and verifies it back to the same payload", () => {
    const token = signToken({ userId: "abc-123", role: "ADMIN" });
    const decoded = verifyToken(token);

    expect(decoded.userId).toBe("abc-123");
    expect(decoded.role).toBe("ADMIN");
  });

  it("throws when verifying a garbage token", () => {
    expect(() => verifyToken("not-a-real-token")).toThrow();
  });
});
