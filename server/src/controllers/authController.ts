import type { Request, Response } from "express";
import { authService } from "../services/authService.js";
import { env } from "../config/env.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: env.COOKIE_MAX_AGE,
};

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);

    res.cookie("token", result.token, COOKIE_OPTIONS);
    res.status(201).json({ user: result.user });
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);

    res.cookie("token", result.token, COOKIE_OPTIONS);
    res.json({ user: result.user });
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  },

  async me(req: Request, res: Response) {
    const result = await authService.getMe(req.user!._id.toString());
    res.json(result);
  },
};
