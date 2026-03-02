import { z } from "zod";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../utils/constants.js";

const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES] as const;

export const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be greater than 0"),
  category: z.enum(allCategories as unknown as [string, ...string[]]),
  description: z.string().max(300).optional().default(""),
  date: z.string().datetime().or(z.string().date()),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
