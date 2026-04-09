import { db } from "@/db";
import { eq, and, sql, gte, lte, desc, asc } from "drizzle-orm";
import { vouchers, voucherEntries } from "@/db/schema/voucher";
import { ledgers, ledgerGroups } from "@/db/schema/ledger";

// Helper to get all group IDs and their descendants for a company
async function getGroupHierarchy(companyId: string) {
  const allGroups = await db.query.ledgerGroups.findMany({
    where: eq(ledgerGroups.companyId, companyId),
  });
  return allGroups;
}

function getDescendantIds(
  allGroups: { id: string; parentId: string | null }[],
  rootId: string
): string[] {
  const ids: string[] = [];
  const queue = [rootId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    ids.push(id);
    for (const g of allGroups) {
      if (g.parentId === id) queue.push(g.id);
    }
  }
  return ids;
}

/**
 * Trial Balance: For each ledger, opening + debits - credits.
 * Grouped by ledger group with subtotals.
 */
export async function getTrialBalance(
  companyId: string,
  financialYearId: string
) {
  // Get all ledgers with groups
  const allLedgers = await db.query.ledgers.findMany({
    where: eq(ledgers.companyId, companyId),
    with: { group: true },
    orderBy: (l, { asc }) => [asc(l.name)],
  });

  // Get debits and credits per ledger
  const entries = await db
    .select({
      ledgerId: voucherEntries.ledgerId,
      entryType: voucherEntries.entryType,
      total: sql<string>`COALESCE(SUM(${voucherEntries.amount}), 0)`,
    })
    .from(voucherEntries)
    .innerJoin(vouchers, eq(voucherEntries.voucherId, vouchers.id))
    .where(
      and(
        eq(vouchers.companyId, companyId),
        eq(vouchers.financialYearId, financialYearId),
        eq(vouchers.isCancelled, false)
      )
    )
    .groupBy(voucherEntries.ledgerId, voucherEntries.entryType);

  // Build ledger totals map
  const ledgerTotals = new Map<
    string,
    { debits: number; credits: number }
  >();
  for (const e of entries) {
    const existing = ledgerTotals.get(e.ledgerId) ?? { debits: 0, credits: 0 };
    if (e.entryType === "debit") {
      existing.debits = Number(e.total);
    } else {
      existing.credits = Number(e.total);
    }
    ledgerTotals.set(e.ledgerId, existing);
  }

  // Group ledgers by group
  const groupedData = new Map<
    string,
    {
      group: typeof allLedgers[0]["group"];
      ledgers: Array<{
        id: string;
        name: string;
        openingDr: number;
        openingCr: number;
        debits: number;
        credits: number;
        closingDr: number;
        closingCr: number;
      }>;
    }
  >();

  let totalDr = 0;
  let totalCr = 0;

  for (const ledger of allLedgers) {
    const totals = ledgerTotals.get(ledger.id) ?? { debits: 0, credits: 0 };
    const openingBal = Number(ledger.openingBalance ?? 0);
    const openingDr = ledger.openingBalanceType === "debit" ? openingBal : 0;
    const openingCr = ledger.openingBalanceType === "credit" ? openingBal : 0;

    const netBalance =
      openingDr - openingCr + totals.debits - totals.credits;
    const closingDr = netBalance > 0 ? netBalance : 0;
    const closingCr = netBalance < 0 ? -netBalance : 0;

    // Skip ledgers with zero activity
    if (
      openingBal === 0 &&
      totals.debits === 0 &&
      totals.credits === 0
    ) {
      continue;
    }

    totalDr += closingDr;
    totalCr += closingCr;

    const groupId = ledger.group.id;
    if (!groupedData.has(groupId)) {
      groupedData.set(groupId, { group: ledger.group, ledgers: [] });
    }
    groupedData.get(groupId)!.ledgers.push({
      id: ledger.id,
      name: ledger.name,
      openingDr,
      openingCr,
      debits: totals.debits,
      credits: totals.credits,
      closingDr,
      closingCr,
    });
  }

  return {
    groups: Array.from(groupedData.values()).map((g) => ({
      group: g.group,
      ledgers: g.ledgers,
      subtotalDr: g.ledgers.reduce((sum, l) => sum + l.closingDr, 0),
      subtotalCr: g.ledgers.reduce((sum, l) => sum + l.closingCr, 0),
    })),
    totalDr,
    totalCr,
  };
}

/**
 * P&L: Trading account (groups with affectsGrossProfit) + P&L (indirect income/expenses).
 */
export async function getProfitAndLoss(
  companyId: string,
  financialYearId: string
) {
  const allGroups = await getGroupHierarchy(companyId);
  const groupMap = new Map(allGroups.map((g) => [g.id, g]));

  // Get all ledger balances
  const allLedgers = await db.query.ledgers.findMany({
    where: eq(ledgers.companyId, companyId),
    with: { group: true },
  });

  const entries = await db
    .select({
      ledgerId: voucherEntries.ledgerId,
      entryType: voucherEntries.entryType,
      total: sql<string>`COALESCE(SUM(${voucherEntries.amount}), 0)`,
    })
    .from(voucherEntries)
    .innerJoin(vouchers, eq(voucherEntries.voucherId, vouchers.id))
    .where(
      and(
        eq(vouchers.companyId, companyId),
        eq(vouchers.financialYearId, financialYearId),
        eq(vouchers.isCancelled, false)
      )
    )
    .groupBy(voucherEntries.ledgerId, voucherEntries.entryType);

  const ledgerTotals = new Map<string, { debits: number; credits: number }>();
  for (const e of entries) {
    const existing = ledgerTotals.get(e.ledgerId) ?? { debits: 0, credits: 0 };
    if (e.entryType === "debit") existing.debits = Number(e.total);
    else existing.credits = Number(e.total);
    ledgerTotals.set(e.ledgerId, existing);
  }

  interface PnLItem {
    ledgerId: string;
    ledgerName: string;
    groupName: string;
    amount: number;
  }

  const tradingExpenses: PnLItem[] = [];
  const tradingIncomes: PnLItem[] = [];
  const indirectExpenses: PnLItem[] = [];
  const indirectIncomes: PnLItem[] = [];

  for (const ledger of allLedgers) {
    const totals = ledgerTotals.get(ledger.id) ?? { debits: 0, credits: 0 };
    const openingBal = Number(ledger.openingBalance ?? 0);
    const openingDr = ledger.openingBalanceType === "debit" ? openingBal : 0;
    const openingCr = ledger.openingBalanceType === "credit" ? openingBal : 0;
    const net = openingDr - openingCr + totals.debits - totals.credits;

    if (net === 0 && openingBal === 0) continue;

    const group = ledger.group;
    const nature = group.nature;
    const affectsGP = group.affectsGrossProfit;

    const item: PnLItem = {
      ledgerId: ledger.id,
      ledgerName: ledger.name,
      groupName: group.name,
      amount: Math.abs(net),
    };

    if (nature === "expenses" && affectsGP) {
      tradingExpenses.push(item);
    } else if (nature === "income" && affectsGP) {
      tradingIncomes.push(item);
    } else if (nature === "expenses" && !affectsGP) {
      indirectExpenses.push(item);
    } else if (nature === "income" && !affectsGP) {
      indirectIncomes.push(item);
    }
  }

  const totalTradingExpenses = tradingExpenses.reduce(
    (sum, i) => sum + i.amount,
    0
  );
  const totalTradingIncomes = tradingIncomes.reduce(
    (sum, i) => sum + i.amount,
    0
  );
  const grossProfit = totalTradingIncomes - totalTradingExpenses;

  const totalIndirectExpenses = indirectExpenses.reduce(
    (sum, i) => sum + i.amount,
    0
  );
  const totalIndirectIncomes = indirectIncomes.reduce(
    (sum, i) => sum + i.amount,
    0
  );
  const netProfit =
    grossProfit + totalIndirectIncomes - totalIndirectExpenses;

  return {
    tradingAccount: {
      expenses: tradingExpenses,
      incomes: tradingIncomes,
      totalExpenses: totalTradingExpenses,
      totalIncomes: totalTradingIncomes,
      grossProfit,
    },
    profitAndLoss: {
      expenses: indirectExpenses,
      incomes: indirectIncomes,
      totalExpenses: totalIndirectExpenses,
      totalIncomes: totalIndirectIncomes,
      netProfit,
    },
  };
}

/**
 * Balance Sheet: Liabilities (nature=liabilities + net profit from P&L) and Assets (nature=assets).
 */
export async function getBalanceSheet(
  companyId: string,
  financialYearId: string
) {
  const allLedgers = await db.query.ledgers.findMany({
    where: eq(ledgers.companyId, companyId),
    with: { group: true },
  });

  const entries = await db
    .select({
      ledgerId: voucherEntries.ledgerId,
      entryType: voucherEntries.entryType,
      total: sql<string>`COALESCE(SUM(${voucherEntries.amount}), 0)`,
    })
    .from(voucherEntries)
    .innerJoin(vouchers, eq(voucherEntries.voucherId, vouchers.id))
    .where(
      and(
        eq(vouchers.companyId, companyId),
        eq(vouchers.financialYearId, financialYearId),
        eq(vouchers.isCancelled, false)
      )
    )
    .groupBy(voucherEntries.ledgerId, voucherEntries.entryType);

  const ledgerTotals = new Map<string, { debits: number; credits: number }>();
  for (const e of entries) {
    const existing = ledgerTotals.get(e.ledgerId) ?? { debits: 0, credits: 0 };
    if (e.entryType === "debit") existing.debits = Number(e.total);
    else existing.credits = Number(e.total);
    ledgerTotals.set(e.ledgerId, existing);
  }

  // Get net profit from P&L
  const pnl = await getProfitAndLoss(companyId, financialYearId);

  interface BSItem {
    ledgerId: string;
    ledgerName: string;
    groupName: string;
    amount: number;
  }

  const liabilities: BSItem[] = [];
  const assets: BSItem[] = [];

  for (const ledger of allLedgers) {
    const totals = ledgerTotals.get(ledger.id) ?? { debits: 0, credits: 0 };
    const openingBal = Number(ledger.openingBalance ?? 0);
    const openingDr = ledger.openingBalanceType === "debit" ? openingBal : 0;
    const openingCr = ledger.openingBalanceType === "credit" ? openingBal : 0;
    const net = openingDr - openingCr + totals.debits - totals.credits;

    const nature = ledger.group.nature;

    // Skip income/expense ledgers (they go into P&L)
    if (nature === "income" || nature === "expenses") continue;
    if (net === 0 && openingBal === 0) continue;

    const item: BSItem = {
      ledgerId: ledger.id,
      ledgerName: ledger.name,
      groupName: ledger.group.name,
      amount: Math.abs(net),
    };

    if (nature === "liabilities") {
      liabilities.push(item);
    } else if (nature === "assets") {
      assets.push(item);
    }
  }

  const totalLiabilities =
    liabilities.reduce((sum, i) => sum + i.amount, 0) +
    Math.max(pnl.profitAndLoss.netProfit, 0);
  const totalAssets =
    assets.reduce((sum, i) => sum + i.amount, 0) +
    Math.max(-pnl.profitAndLoss.netProfit, 0);

  return {
    liabilities,
    assets,
    netProfit: pnl.profitAndLoss.netProfit,
    totalLiabilities,
    totalAssets,
  };
}

/**
 * Day Book: All vouchers in a date range with entry details.
 */
export async function getDayBook(
  companyId: string,
  dateFrom?: string,
  dateTo?: string,
  voucherType?: string
) {
  const conditions = [
    eq(vouchers.companyId, companyId),
    eq(vouchers.isCancelled, false),
  ];
  if (dateFrom) conditions.push(gte(vouchers.date, dateFrom));
  if (dateTo) conditions.push(lte(vouchers.date, dateTo));
  if (voucherType) {
    conditions.push(
      sql`${vouchers.voucherType} = ${voucherType}` as ReturnType<typeof eq>
    );
  }

  const result = await db.query.vouchers.findMany({
    where: and(...conditions),
    with: {
      entries: {
        with: {
          ledger: {
            columns: { id: true, name: true },
          },
        },
        orderBy: (e, { asc: asc_ }) => [asc_(e.sortOrder)],
      },
    },
    orderBy: [asc(vouchers.date), asc(vouchers.createdAt)],
  });

  return result;
}

/**
 * Ledger Report: All entries for a specific ledger with running balance.
 */
export async function getLedgerReport(
  ledgerId: string,
  companyId: string,
  dateFrom?: string,
  dateTo?: string
) {
  const conditions = [
    eq(voucherEntries.ledgerId, ledgerId),
    eq(vouchers.companyId, companyId),
    eq(vouchers.isCancelled, false),
  ];
  if (dateFrom) conditions.push(gte(vouchers.date, dateFrom));
  if (dateTo) conditions.push(lte(vouchers.date, dateTo));

  // Get the ledger info for opening balance
  const ledger = await db.query.ledgers.findFirst({
    where: eq(ledgers.id, ledgerId),
    with: { group: true },
  });

  if (!ledger) return null;

  const entryRows = await db
    .select({
      entryId: voucherEntries.id,
      voucherId: vouchers.id,
      voucherNumber: vouchers.voucherNumber,
      voucherType: vouchers.voucherType,
      date: vouchers.date,
      narration: vouchers.narration,
      entryType: voucherEntries.entryType,
      amount: voucherEntries.amount,
    })
    .from(voucherEntries)
    .innerJoin(vouchers, eq(voucherEntries.voucherId, vouchers.id))
    .where(and(...conditions))
    .orderBy(asc(vouchers.date), asc(vouchers.createdAt));

  // Get counterpart ledger names for each voucher
  const voucherIds = [...new Set(entryRows.map((e) => e.voucherId))];
  let counterpartMap = new Map<string, string[]>();

  if (voucherIds.length > 0) {
    const counterparts = await db
      .select({
        voucherId: voucherEntries.voucherId,
        ledgerName: ledgers.name,
      })
      .from(voucherEntries)
      .innerJoin(ledgers, eq(voucherEntries.ledgerId, ledgers.id))
      .where(
        and(
          sql`${voucherEntries.voucherId} IN (${sql.join(
            voucherIds.map((id) => sql`${id}`),
            sql`, `
          )})`,
          sql`${voucherEntries.ledgerId} != ${ledgerId}`
        )
      );

    for (const cp of counterparts) {
      const existing = counterpartMap.get(cp.voucherId) ?? [];
      existing.push(cp.ledgerName);
      counterpartMap.set(cp.voucherId, existing);
    }
  }

  // Build running balance
  let openingBal = Number(ledger.openingBalance ?? 0);
  if (ledger.openingBalanceType === "credit") openingBal = -openingBal;

  let balance = openingBal;
  const rows = entryRows.map((entry) => {
    const amount = Number(entry.amount);
    if (entry.entryType === "debit") {
      balance += amount;
    } else {
      balance -= amount;
    }
    return {
      ...entry,
      amount,
      counterpartLedgers: counterpartMap.get(entry.voucherId) ?? [],
      runningBalance: balance,
      balanceType: (balance >= 0 ? "Dr" : "Cr") as "Dr" | "Cr",
    };
  });

  return {
    ledger: {
      id: ledger.id,
      name: ledger.name,
      group: ledger.group,
    },
    openingBalance: openingBal,
    openingBalanceType: openingBal >= 0 ? "Dr" : "Cr",
    entries: rows,
    closingBalance: balance,
    closingBalanceType: balance >= 0 ? "Dr" : "Cr",
  };
}
