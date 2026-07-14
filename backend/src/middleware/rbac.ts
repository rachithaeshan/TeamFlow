import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

/**
 * Restricts a route to one or more roles. Must run after requireAuth.
 * Usage: router.post("/projects", requireAuth, requireRole("ADMIN", "PROJECT_MANAGER"), handler)
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`This action requires one of these roles: ${roles.join(", ")}`));
    }
    next();
  };
}
