import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User, type IUser } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  userId: string;
}

/**
 * Verifies the JWT from the cookie and attaches `req.user`.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.token as string | undefined;

    if (!token) {
      throw ApiError.unauthorized("No token provided");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw ApiError.unauthorized("User no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized("Invalid or expired token"));
    }
  }
}

/**
 * Restricts access to specific roles.
 * Usage: authorize("owner", "admin")
 */
export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission for this action"));
    }

    next();
  };
}
