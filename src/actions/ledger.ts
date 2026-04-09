"use server";

import { db } from "@/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { ledgers } from "@/db/schema/ledger";
import { voucherEntries } from "@/db/schema/voucher";
import { companyMembers } from "@/db/schema/company";
import { eq, and, count } from "drizzle-orm";
import {
  createLedgerSchema,
  updateLedgerSchema,
  type CreateLedgerInput,
  type UpdateLedgerInput,
} from "@/lib/validators/ledger";

async function verifyMembership(companyId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const member = await db.query.companyMembers.findFirst({
    where: and(
      eq(companyMembers.companyId, companyId),
      eq(companyMembers.userId, session.user.id)
    ),
  });

  if (!member) {
    throw new Error("You are not a member of this company");
  }

  return session.user;
}

export async function createLedger(
  companyId: string,
  data: CreateLedgerInput
) {
  await verifyMembership(companyId);

  const parsed = createLedgerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const input = parsed.data;

  const [ledger] = await db
    .insert(ledgers)
    .values({
      companyId,
      groupId: input.groupId,
      name: input.name,
      openingBalance: input.openingBalance
        ? String(input.openingBalance)
        : "0",
      openingBalanceType: input.openingBalanceType ?? "debit",
      address: input.address || null,
      gstin: input.gstin || null,
      pan: input.pan || null,
      phone: input.phone || null,
      email: input.email || null,
      state: input.state || null,
      pincode: input.pincode || null,
      creditPeriodDays: input.creditPeriodDays ?? null,
      creditLimit: input.creditLimit ? String(input.creditLimit) : null,
      bankName: input.bankName || null,
      accountNumber: input.accountNumber || null,
      ifscCode: input.ifscCode || null,
      branchName: input.branchName || null,
      taxType: input.taxType || null,
      taxRate: input.taxRate != null ? String(input.taxRate) : null,
      isBillwise: input.isBillwise ?? false,
    })
    .returning();

  revalidatePath("/ledgers");
  return { data: ledger };
}

export async function updateLedger(
  ledgerId: string,
  companyId: string,
  data: UpdateLedgerInput
) {
  await verifyMembership(companyId);

  const parsed = updateLedgerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const input = parsed.data;

  // Verify ledger belongs to company
  const existing = await db.query.ledgers.findFirst({
    where: and(eq(ledgers.id, ledgerId), eq(ledgers.companyId, companyId)),
  });

  if (!existing) {
    return { error: { _form: ["Ledger not found"] } };
  }

  const updateData: Record<string, unknown> = {
    name: input.name,
    updatedAt: new Date(),
  };

  if (input.groupId !== undefined) updateData.groupId = input.groupId;
  if (input.openingBalance !== undefined)
    updateData.openingBalance = String(input.openingBalance);
  if (input.openingBalanceType !== undefined)
    updateData.openingBalanceType = input.openingBalanceType;
  if (input.address !== undefined) updateData.address = input.address || null;
  if (input.gstin !== undefined) updateData.gstin = input.gstin || null;
  if (input.pan !== undefined) updateData.pan = input.pan || null;
  if (input.phone !== undefined) updateData.phone = input.phone || null;
  if (input.email !== undefined) updateData.email = input.email || null;
  if (input.state !== undefined) updateData.state = input.state || null;
  if (input.pincode !== undefined) updateData.pincode = input.pincode || null;
  if (input.creditPeriodDays !== undefined)
    updateData.creditPeriodDays = input.creditPeriodDays;
  if (input.creditLimit !== undefined)
    updateData.creditLimit = input.creditLimit
      ? String(input.creditLimit)
      : null;
  if (input.bankName !== undefined)
    updateData.bankName = input.bankName || null;
  if (input.accountNumber !== undefined)
    updateData.accountNumber = input.accountNumber || null;
  if (input.ifscCode !== undefined)
    updateData.ifscCode = input.ifscCode || null;
  if (input.branchName !== undefined)
    updateData.branchName = input.branchName || null;
  if (input.taxType !== undefined) updateData.taxType = input.taxType || null;
  if (input.taxRate !== undefined)
    updateData.taxRate = input.taxRate != null ? String(input.taxRate) : null;
  if (input.isBillwise !== undefined) updateData.isBillwise = input.isBillwise;

  const [updated] = await db
    .update(ledgers)
    .set(updateData)
    .where(eq(ledgers.id, ledgerId))
    .returning();

  revalidatePath("/ledgers");
  return { data: updated };
}

export async function deleteLedger(ledgerId: string, companyId: string) {
  await verifyMembership(companyId);

  // Verify ledger belongs to company
  const existing = await db.query.ledgers.findFirst({
    where: and(eq(ledgers.id, ledgerId), eq(ledgers.companyId, companyId)),
  });

  if (!existing) {
    return { error: "Ledger not found" };
  }

  // Check if any voucher entries reference this ledger
  const [usageCount] = await db
    .select({ count: count() })
    .from(voucherEntries)
    .where(eq(voucherEntries.ledgerId, ledgerId));

  if (usageCount.count > 0) {
    return {
      error: `Cannot delete ledger "${existing.name}" because it is used in ${usageCount.count} voucher ${usageCount.count === 1 ? "entry" : "entries"}. Remove those vouchers first.`,
    };
  }

  await db.delete(ledgers).where(eq(ledgers.id, ledgerId));

  revalidatePath("/ledgers");
  return { success: true };
}
