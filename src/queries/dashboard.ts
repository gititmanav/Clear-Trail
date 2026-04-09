import { db } from "@/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { vouchers, voucherEntries } from "@/db/schema/voucher";
import { ledgers, ledgerGroups } from "@/db/schema/ledger";

/**
 * Get dashboard statistics: income, expenses, receivables, payables
 */
export async function getDashboardStats(
  companyId: string,
  financialYearId: string
) {
  // Get all groups for the company to resolve hierarchy
  const allGroups = await db.query.ledgerGroups.findMany({
    where: eq(ledgerGroups.companyId, companyId),
  });
  const groupByName = new Map(allGroups.map((g) => [g.name, g]));

  // Helper: get all group IDs that are descendants of a named group (including itself)
  function getGroupAndDescendantIds(groupName: string): string[] {
    const root = groupByName.get(groupName);
    if (!root) return [];
    const ids: string[] = [];
    const queue = [root.id];
    while (queue.length > 0) {
      const id = queue.shift()!;
      ids.push(id);
      for (const g of allGroups) {
        if (g.parentId === id) queue.push(g.id);
      }
    }
    return ids;
  }

  const salesGroupIds = [
    ...getGroupAndDescendantIds("Sales Accounts"),
    ...getGroupAndDescendantIds("Direct Incomes"),
    ...getGroupAndDescendantIds("Indirect Incomes"),
  ];
  const expenseGroupIds = [
    ...getGroupAndDescendantIds("Purchase Accounts"),
    ...getGroupAndDescendantIds("Direct Expenses"),
    ...getGroupAndDescendantIds("Indirect Expenses"),
  ];
  const debtorGroupIds = getGroupAndDescendantIds("Sundry Debtors");
  const creditorGroupIds = getGroupAndDescendantIds("Sundry Creditors");

  // Helper to compute sum of entries for given group IDs, entry type, and FY
  async function sumEntries(
    groupIds: string[],
    entryType: "debit" | "credit"
  ): Promise<number> {
    if (groupIds.length === 0) return 0;
    const result = await db
      .select({
        total: sql<string>`COALESCE(SUM(${voucherEntries.amount}), 0)`,
      })
      .from(voucherEntries)
      .innerJoin(vouchers, eq(voucherEntries.voucherId, vouchers.id))
      .innerJoin(ledgers, eq(voucherEntries.ledgerId, ledgers.id))
      .where(
        and(
          eq(vouchers.companyId, companyId),
          eq(vouchers.financialYearId, financialYearId),
          eq(vouchers.isCancelled, false),
          sql`${voucherEntries.entryType} = ${entryType}`,
          sql`${ledgers.groupId} IN (${sql.join(
            groupIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        )
      );
    return Number(result[0]?.total ?? 0);
  }

  // Net balance helper for balance sheet items (debits - credits)
  async function netBalance(groupIds: string[]): Promise<number> {
    if (groupIds.length === 0) return 0;
    const debits = await sumEntries(groupIds, "debit");
    const credits = await sumEntries(groupIds, "credit");
    return debits - credits;
  }

  const [income, expenses, receivables, payables] = await Promise.all([
    sumEntries(salesGroupIds, "credit"),
    sumEntries(expenseGroupIds, "debit"),
    netBalance(debtorGroupIds),
    // Payables: net credit balance (credits - debits)
    netBalance(creditorGroupIds).then((val) => -val),
  ]);

  return { income, expenses, receivables, payables };
}

/**
 * Monthly income and expense totals for charts
 */
export async function getMonthlyTrends(
  companyId: string,
  financialYearId: string
) {
  const allGroups = await db.query.ledgerGroups.findMany({
    where: eq(ledgerGroups.companyId, companyId),
  });
  const groupByName = new Map(allGroups.map((g) => [g.name, g]));

  function getGroupAndDescendantIds(groupName: string): string[] {
    const root = groupByName.get(groupName);
    if (!root) return [];
    const ids: string[] = [];
    const queue = [root.id];
    while (queue.length > 0) {
      const id = queue.shift()!;
      ids.push(id);
      for (const g of allGroups) {
        if (g.parentId === id) queue.push(g.id);
      }
    }
    return ids;
  }

  const incomeGroupIds = [
    ...getGroupAndDescendantIds("Sales Accounts"),
    ...getGroupAndDescendantIds("Direct Incomes"),
    ...getGroupAndDescendantIds("Indirect Incomes"),
  ];
  const expenseGroupIds = [
    ...getGroupAndDescendantIds("Purchase Accounts"),
    ...getGroupAndDescendantIds("Direct Expenses"),
    ...getGroupAndDescendantIds("Indirect Expenses"),
  ];

  async function monthlySum(
    groupIds: string[],
    entryType: "debit" | "credit"
  ) {
    if (groupIds.length === 0) return [];
    const result = await db
      .select({
        month: sql<string>`TO_CHAR(${vouchers.date}::date, 'YYYY-MM')`,
        total: sql<string>`COALESCE(SUM(${voucherEntries.amount}), 0)`,
      })
      .from(voucherEntries)
      .innerJoin(vouchers, eq(voucherEntries.voucherId, vouchers.id))
      .innerJoin(ledgers, eq(voucherEntries.ledgerId, ledgers.id))
      .where(
        and(
          eq(vouchers.companyId, companyId),
          eq(vouchers.financialYearId, financialYearId),
          eq(vouchers.isCancelled, false),
          sql`${voucherEntries.entryType} = ${entryType}`,
          sql`${ledgers.groupId} IN (${sql.join(
            groupIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        )
      )
      .groupBy(sql`TO_CHAR(${vouchers.date}::date, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${vouchers.date}::date, 'YYYY-MM')`);

    return result.map((r) => ({ month: r.month, total: Number(r.total) }));
  }

  const [incomeData, expenseData] = await Promise.all([
    monthlySum(incomeGroupIds, "credit"),
    monthlySum(expenseGroupIds, "debit"),
  ]);

  // Merge into a single array
  const monthsSet = new Set([
    ...incomeData.map((d) => d.month),
    ...expenseData.map((d) => d.month),
  ]);
  const months = Array.from(monthsSet).sort();

  const incomeMap = new Map(incomeData.map((d) => [d.month, d.total]));
  const expenseMap = new Map(expenseData.map((d) => [d.month, d.total]));

  return months.map((month) => ({
    month,
    income: incomeMap.get(month) ?? 0,
    expenses: expenseMap.get(month) ?? 0,
  }));
}

/**
 * Get recent vouchers with basic info
 */
export async function getRecentVouchers(companyId: string, limit = 10) {
  const result = await db.query.vouchers.findMany({
    where: and(eq(vouchers.companyId, companyId), eq(vouchers.isCancelled, false)),
    with: {
      entries: {
        with: {
          ledger: {
            columns: { id: true, name: true },
          },
        },
        orderBy: (e, { asc }) => [asc(e.sortOrder)],
      },
    },
    orderBy: [desc(vouchers.date), desc(vouchers.createdAt)],
    limit,
  });

  return result;
}
