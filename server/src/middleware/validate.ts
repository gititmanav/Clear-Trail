import type { Request, Response, NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/apiError.js";

/**
 * Validates request body against a Zod schema.
 *
 * Usage:
 *   router.post("/", validate(createUserSchema), controller.create);
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        next(ApiError.badRequest(message));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validates query parameters against a Zod schema.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        next(ApiError.badRequest(message));
      } else {
        next(error);
      }
    }
  };
}
