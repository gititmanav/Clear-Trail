import { Schema, model, type Document, type Types } from "mongoose";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../utils/constants.js";

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: Date;
  userId: Types.ObjectId;
  companyId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Transaction type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ALL_CATEGORIES,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes for common queries ──
transactionSchema.index({ companyId: 1, type: 1, date: -1 });
transactionSchema.index({ companyId: 1, category: 1 });
transactionSchema.index({ userId: 1 });

export const Transaction = model<ITransaction>("Transaction", transactionSchema);
