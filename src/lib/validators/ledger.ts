import { z } from "zod";

export const createLedgerSchema = z.object({
  name: z.string().min(2, "Ledger name must be at least 2 characters"),
  groupId: z.string().uuid("Invalid group ID"),
  openingBalance: z.number().optional(),
  openingBalanceType: z.enum(["debit", "credit"]).optional(),
  address: z.string().optional(),
  gstin: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GSTIN format"
    )
    .optional()
    .or(z.literal("")),
  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  state: z.string().optional(),
  pincode: z.string().optional(),
  creditPeriodDays: z.number().int().nonnegative().optional(),
  creditLimit: z.number().nonnegative().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  branchName: z.string().optional(),
  taxType: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  isBillwise: z.boolean().optional(),
});

export const updateLedgerSchema = createLedgerSchema.partial().required({
  name: true,
});

export type CreateLedgerInput = z.infer<typeof createLedgerSchema>;
export type UpdateLedgerInput = z.infer<typeof updateLedgerSchema>;
