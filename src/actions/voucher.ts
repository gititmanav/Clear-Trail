"use server";

import { db } from "@/db";
import { headers, cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  vouchers,
  voucherEntries,
  voucherSequences,
  billAllocations,
} from "@/db/schema/voucher";
import { financialYears } from "@/db/schema/company";
import { companyMembers } from "@/db/schema/company";
import { eq, and, sql } from "drizzle-orm";
import {
  createVoucherSchema,
  type CreateVoucherInput,
  type BillAllocationInput,
} from "@/lib/validators/voucher";
import { getFinancialYearLabel } from "@/lib/utils";

async function getSessionAndCompany() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const cookieStore = await cookies();
  const companyId = cookieStore.get("activeCompanyId")?.value;

  if (!companyId) {
    throw new Error("No active company selected");
  }

  // Verify membership
  const member = await db.query.companyMembers.findFirst({
    where: and(
      eq(companyMembers.companyId, companyId),
      eq(companyMembers.userId, session.user.id)
    ),
  });

  if (!member) {
    throw new Error("You are not a member of this company");
  }

  // Get active financial year
  const fy = await db.query.financialYears.findFirst({
    where: and(
      eq(financialYears.companyId, companyId),
      eq(financialYears.isCurrent, true)
    ),
  });

  if (!fy) {
    throw new Error("No active financial year found");
  }

  return { session, companyId, financialYear: fy };
}

export async function createVoucher(
  data: CreateVoucherInput & {
    billAllocations?: Array<{
      entryIndex: number;
      allocations: BillAllocationInput[];
    }>;
  }
) {
  const { session, companyId, financialYear } = await getSessionAndCompany();

  // Validate with schema
  const parsed = createVoucherSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const input = parsed.data;

  const result = await db.transaction(async (tx) => {
    // 1. Get or create sequence and atomically increment
    let sequence = await tx.query.voucherSequences.findFirst({
      where: and(
        eq(voucherSequences.companyId, companyId),
        eq(voucherSequences.financialYearId, financialYear.id),
        sql`${voucherSequences.voucherType} = ${input.voucherType}`
      ),
    });

    let nextNumber: number;
    let prefix: string;

    if (sequence) {
      // Atomic increment using SQL to prevent race conditions
      const [updated] = await tx
        .update(voucherSequences)
        .set({
          lastNumber: sql`${voucherSequences.lastNumber} + 1`,
        })
        .where(eq(voucherSequences.id, sequence.id))
        .returning();
      nextNumber = updated.lastNumber!;
      prefix = sequence.prefix || input.voucherType.toUpperCase().slice(0, 3);
    } else {
      // Create new sequence
      const [created] = await tx
        .insert(voucherSequences)
        .values({
          companyId,
          financialYearId: financialYear.id,
          voucherType: input.voucherType,
          prefix: input.voucherType.toUpperCase().slice(0, 3),
          lastNumber: 1,
        })
        .returning();
      nextNumber = 1;
      prefix =
        created.prefix || input.voucherType.toUpperCase().slice(0, 3);
    }

    const fyLabel = getFinancialYearLabel(
      financialYear.startDate,
      financialYear.endDate
    );
    const paddedNumber = String(nextNumber).padStart(3, "0");
    const voucherNumber = `${prefix}/${fyLabel}/${paddedNumber}`;

    // 2. Calculate total amount (sum of debits)
    const totalAmount = input.entries
      .filter((e) => e.entryType === "debit")
      .reduce((sum, e) => sum + Number(e.amount), 0);

    // 3. Insert voucher
    const [voucher] = await tx
      .insert(vouchers)
      .values({
        companyId,
        financialYearId: financialYear.id,
        voucherType: input.voucherType,
        voucherNumber,
        date: input.date,
        referenceNumber: input.referenceNumber || null,
        narration: input.narration || null,
        totalAmount: String(totalAmount),
        createdBy: session.user.id,
      })
      .returning();

    // 4. Insert all entries
    const insertedEntries = [];
    for (let i = 0; i < input.entries.length; i++) {
      const entry = input.entries[i];
      const [inserted] = await tx
        .insert(voucherEntries)
        .values({
          voucherId: voucher.id,
          ledgerId: entry.ledgerId,
          entryType: entry.entryType,
          amount: entry.amount,
          sortOrder: i,
        })
        .returning();
      insertedEntries.push(inserted);
    }

    // 5. Insert bill allocations if any
    if (data.billAllocations) {
      for (const ba of data.billAllocations) {
        const entryId = insertedEntries[ba.entryIndex]?.id;
        if (!entryId) continue;

        for (const alloc of ba.allocations) {
          await tx.insert(billAllocations).values({
            voucherEntryId: entryId,
            billType: alloc.billType,
            billName: alloc.billName || null,
            amount: alloc.amount,
            dueDate: alloc.dueDate || null,
          });
        }
      }
    }

    return { ...voucher, voucherNumber };
  });

  revalidatePath("/vouchers");
  return { data: result };
}

export async function deleteVoucher(voucherId: string) {
  const { companyId } = await getSessionAndCompany();

  // Verify voucher belongs to company
  const existing = await db.query.vouchers.findFirst({
    where: and(
      eq(vouchers.id, voucherId),
      eq(vouchers.companyId, companyId)
    ),
  });

  if (!existing) {
    return { error: "Voucher not found" };
  }

  if (existing.isCancelled) {
    return { error: "Voucher is already cancelled" };
  }

  // Soft delete
  await db
    .update(vouchers)
    .set({ isCancelled: true, updatedAt: new Date() })
    .where(eq(vouchers.id, voucherId));

  revalidatePath("/vouchers");
  return { success: true };
}
