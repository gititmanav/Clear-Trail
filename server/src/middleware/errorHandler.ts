import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

/**
 * Global error handler.
 * Must be registered LAST in the middleware chain.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default to 500
  let statusCode = 500;
  let message = "Internal server error";
  let stack: string | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === "ValidationError") {
    // Mongoose validation error
    statusCode = 400;
    message = err.message;
  } else if (err.name === "CastError") {
    // Invalid ObjectId
    statusCode = 400;
    message = "Invalid ID format";
  } else if ((err as Record<string, unknown>).code === 11000) {
    // MongoDB duplicate key
    statusCode = 409;
    message = "Duplicate entry — this record already exists";
  }

  // Include stack trace in development
  if (env.NODE_ENV === "development") {
    stack = err.stack;
    console.error(`[${statusCode}] ${message}`, stack);
  }

  res.status(statusCode).json({
    error: message,
    ...(env.NODE_ENV === "development" && { stack }),
  });
}
