import { Types } from "mongoose";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import type { CreateUserInput, UpdateUserInput } from "../validators/userSchema.js";

export const userService = {
  async getAll(companyId: string) {
    const users = await User.find({ companyId: new Types.ObjectId(companyId) })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return { users };
  },

  async getById(id: string, companyId: string) {
    const user = await User.findOne({
      _id: id,
      companyId: new Types.ObjectId(companyId),
    }).select("-password");

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return user;
  },

  async create(input: CreateUserInput, companyId: string) {
    // Check duplicate email
    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw ApiError.conflict("A user with this email already exists");
    }

    const user = await User.create({
      ...input,
      companyId: new Types.ObjectId(companyId),
    });

    // Return without password
    const { password: _, ...sanitized } = user.toObject();
    return sanitized;
  },

  async update(id: string, input: UpdateUserInput, companyId: string) {
    // If email is being changed, check for duplicates
    if (input.email) {
      const existing = await User.findOne({
        email: input.email,
        _id: { $ne: id },
      });
      if (existing) {
        throw ApiError.conflict("A user with this email already exists");
      }
    }

    const user = await User.findOneAndUpdate(
      { _id: id, companyId: new Types.ObjectId(companyId) },
      input,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return user;
  },

  async delete(id: string, companyId: string, requestingUserId: string) {
    // Can't delete yourself
    if (id === requestingUserId) {
      throw ApiError.badRequest("You cannot delete your own account");
    }

    const user = await User.findOne({
      _id: id,
      companyId: new Types.ObjectId(companyId),
    });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Can't delete the owner
    if (user.role === "owner") {
      throw ApiError.forbidden("The company owner cannot be deleted");
    }

    await User.deleteOne({ _id: id });

    return { message: "User deleted" };
  },
};
