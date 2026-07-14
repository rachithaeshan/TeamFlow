import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "@prisma/client";

export interface JwtPayload {
  userId: string;
  role: Role;
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = {
    // env.jwtExpiresIn is a plain string from config (e.g. "1d", "7d"); the jsonwebtoken
    // types require its branded StringValue type, which is safe to assert here since the
    // value is validated/controlled via environment configuration, not user input.
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
