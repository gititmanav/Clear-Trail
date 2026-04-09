import { db } from "@/db";
import { eq, and, gte, lte, ilike, sql, desc } from "drizzle-orm";
import { vouchers, voucherEntries, voucherSequences, billAllocations } from "@/db/schema/voucher";
import { ledgers } from "@/db/schema/ledger";
import { financialYears } from "@/db/schema/company";
import { getFinancialYearLabel } from "@/lib/utils";

interface VoucherFilters {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getVouchersForCompany(
  companyId: string,
  filters?: VoucherFilters
) {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 25;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(vouchers.companyId, companyId)];

  if (filters?.type) {
    conditions.push(
      sql`${vouchers.voucherType} = ${filters.type}` as ReturnType<typeof eq>
    );
  }
  if (filters?.dateFrom) {
    conditions.push(gte(vouchers.date, filters.dateFrom));
  }
  if (filters?.dateTo) {
    conditions.push(lte(vouchers.date, filters.dateTo));
  }
  if (filters?.search) {
    conditions.push(ilike(vouchers.narration, `%${filters.search}%`));
  }

  const [voucherList, countResult] = await Promise.all([
    db.query.vouchers.findMany({
      where: and(...conditions),
      with: {
        entries: {
          with: {
            ledger: {
              columns: { id: true, name: true },
            },
          },
        },
      },
      orderBy: [desc(vouchers.date), desc(vouchers.createdAt)],
      limit: pageSize,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(vouchers)
      .where(and(...conditions)),
  ]);

  return {
    data: voucherList,
    pagination: {
      page,
      pageSize,
      total: countResult[0]?.count ?? 0,
      totalPages: Math.ceil((countResult[0]?.count ?? 0) / pageSize),
    },
  };
}

export async function getVoucherById(voucherId: string) {
  const result = await db.query.vouchers.findFirst({
    where: eq(vouchers.id, voucherId),
    with: {
      entries: {
        with: {
          ledger: {
            columns: { id: true, name: true },
          },
          billAllocations: true,
        },
        orderBy: (e, { asc }) => [asc(e.sortOrder)],
      },
      financialYear: true,
    },
  });

  return result ?? null;
}

export async function getNextVoucherNumber(
  companyId: string,
  financialYearId: string,
  voucherType: string
) {
  // Get financial year for label
  const fy = await db.query.financialYears.findFirst({
    where: eq(financialYears.id, financialYearId),
  });

  if (!fy) throw new Error("Financial year not found");

  // Get or create sequence
  let sequence = await db.query.voucherSequences.findFirst({
    where: and(
      eq(voucherSequences.companyId, companyId),
      eq(voucherSequences.financialYearId, financialYearId),
      sql`${voucherSequences.voucherType} = ${voucherType}`
    ),
  });

  const nextNumber = (sequence?.lastNumber ?? 0) + 1;

  // Update the sequence
  if (sequence) {
    await db
      .update(voucherSequences)
      .set({ lastNumber: nextNumber })
      .where(eq(voucherSequences.id, sequence.id));
  }

  const prefix = sequence?.prefix || voucherType.toUpperCase().slice(0, 3);
  const fyLabel = getFinancialYearLabel(fy.startDate, fy.endDate);
  const paddedNumber = String(nextNumber).padStart(3, "0");

  return `${prefix}/${fyLabel}/${paddedNumber}`;
}
