import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

/**
 * Validates req.body / req.params / req.query against a Zod schema shaped like:
 * z.object({ body: z.object({...}), params: z.object({...}), query: z.object({...}) })
 * Unspecified parts are left untouched.
 */
export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.slice(1).join("."), // drop the leading "body"/"query"/"params" segment
          message: e.message,
        }));
        return next(ApiError.badRequest("Validation failed", details));
      }
      next(err);
    }
  };
}
