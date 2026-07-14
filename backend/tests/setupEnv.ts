process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/taskflow_test";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret-key";
process.env.NODE_ENV = "test";
