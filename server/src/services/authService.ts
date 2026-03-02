import jwt from "jsonwebtoken";
import { User, type IUser } from "../models/User.js";
import { Company } from "../models/Company.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import type { LoginInput, RegisterInput } from "../validators/authSchema.js";

function generateToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

function sanitizeUser(user: IUser) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
  };
}

export const authService = {
  async register(input: RegisterInput) {
    // Check if email already exists
    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw ApiError.conflict("Email already registered");
    }

    // Create company
    const company = await Company.create({ name: input.companyName });

    // Create user as owner of the company
    const user = await User.create({
      name: input.name,
      email: input.email,
      password: input.password,
      role: "owner",
      companyId: company._id,
    });

    const token = generateToken(user._id.toString());

    return { user: sanitizeUser(user), token };
  },

  async login(input: LoginInput) {
    // Find user and explicitly include password field
    const user = await User.findOne({ email: input.email }).select("+password");

    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const token = generateToken(user._id.toString());

    return { user: sanitizeUser(user), token };
  },

  async getMe(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return { user: sanitizeUser(user) };
  },
};
