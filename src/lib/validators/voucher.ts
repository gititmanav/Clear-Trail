import { z } from "zod";

export const voucherEntrySchema = z.object({
  ledgerId: z.string().uuid("Invalid ledger ID"),
  entryType: z.enum(["debit", "credit"]),
  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
});

export const billAllocationSchema = z.object({
  billType: z.enum(["new_ref", "against_ref", "advance"]),
  billName: z.string().optional(),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  dueDate: z.string().optional(),
});

export const createVoucherSchema = z
  .object({
    voucherType: z.enum([
      "purchase",
      "sales",
      "payment",
      "receipt",
      "journal",
      "contra",
      "credit_note",
      "debit_note",
    ]),
    date: z.string().min(1, "Date is required"),
    referenceNumber: z.string().optional(),
    narration: z.string().optional(),
    entries: z
      .array(voucherEntrySchema)
      .min(2, "At least 2 entries are required"),
  })
  .superRefine((data, ctx) => {
    const totalDebits = data.entries
      .filter((e) => e.entryType === "debit")
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const totalCredits = data.entries
      .filter((e) => e.entryType === "credit")
      .reduce((sum, e) => sum + Number(e.amount), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Total debits (${totalDebits.toFixed(2)}) must equal total credits (${totalCredits.toFixed(2)})`,
        path: ["entries"],
      });
    }
  });

export type VoucherEntryInput = z.infer<typeof voucherEntrySchema>;
export type BillAllocationInput = z.infer<typeof billAllocationSchema>;
export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;
