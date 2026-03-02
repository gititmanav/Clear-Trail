import { z } from "zod";
import { ROLES } from "../utils/constants.js";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  role: z.enum(ROLES as unknown as [string, ...string[]]).optional().default("member"),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  email: z.string().email().optional(),
  role: z.enum(ROLES as unknown as [string, ...string[]]).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
