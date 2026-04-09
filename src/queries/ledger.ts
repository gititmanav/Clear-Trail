import { db } from "@/db";
import { eq, and, inArray } from "drizzle-orm";
import { ledgerGroups, ledgers } from "@/db/schema/ledger";
import { VOUCHER_TYPE_CONFIG } from "@/lib/constants/voucher-types";

export async function getLedgersForCompany(companyId: string) {
  const result = await db.query.ledgers.findMany({
    where: eq(ledgers.companyId, companyId),
    with: {
      group: true,
    },
    orderBy: (l, { asc }) => [asc(l.name)],
  });

  return result;
}

export async function getLedgerById(ledgerId: string) {
  const result = await db.query.ledgers.findFirst({
    where: eq(ledgers.id, ledgerId),
    with: {
      group: true,
    },
  });

  return result ?? null;
}

/**
 * Returns ledgers filtered by allowed groups for the given voucher type and side.
 * Resolves group hierarchy: if a parent group is allowed, all its descendants are too.
 */
export async function getLedgersForVoucher(
  companyId: string,
  voucherType: string,
  side: "debit" | "credit"
) {
  const config = VOUCHER_TYPE_CONFIG[voucherType];
  if (!config) return [];

  const allowedGroupNames =
    side === "debit" ? config.debitGroups : config.creditGroups;
  const excludeGroupNames =
    side === "debit" ? config.debitExcludeGroups : config.creditExcludeGroups;

  // Get all groups for the company
  const allGroups = await db.query.ledgerGroups.findMany({
    where: eq(ledgerGroups.companyId, companyId),
  });

  // Build a map for quick lookups
  const groupMap = new Map(allGroups.map((g) => [g.id, g]));
  const groupByName = new Map(allGroups.map((g) => [g.name, g]));

  // Resolve allowed group IDs (including all descendants)
  let allowedGroupIds: Set<string>;

  if (allowedGroupNames === null) {
    // null means all groups are allowed
    allowedGroupIds = new Set(allGroups.map((g) => g.id));
  } else {
    allowedGroupIds = new Set<string>();
    const rootIds = allowedGroupNames
      .map((name) => groupByName.get(name)?.id)
      .filter(Boolean) as string[];

    // BFS to find all descendants
    const queue = [...rootIds];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      allowedGroupIds.add(currentId);
      // Find children of this group
      for (const g of allGroups) {
        if (g.parentId === currentId && !allowedGroupIds.has(g.id)) {
          queue.push(g.id);
        }
      }
    }
  }

  // Remove excluded groups (and their descendants)
  if (excludeGroupNames) {
    const excludeIds = new Set<string>();
    const excludeRootIds = excludeGroupNames
      .map((name) => groupByName.get(name)?.id)
      .filter(Boolean) as string[];

    const queue = [...excludeRootIds];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      excludeIds.add(currentId);
      for (const g of allGroups) {
        if (g.parentId === currentId && !excludeIds.has(g.id)) {
          queue.push(g.id);
        }
      }
    }

    for (const id of excludeIds) {
      allowedGroupIds.delete(id);
    }
  }

  if (allowedGroupIds.size === 0) return [];

  // Fetch ledgers in those groups
  const result = await db.query.ledgers.findMany({
    where: and(
      eq(ledgers.companyId, companyId),
      inArray(ledgers.groupId, Array.from(allowedGroupIds))
    ),
    with: {
      group: true,
    },
    orderBy: (l, { asc }) => [asc(l.name)],
  });

  return result;
}
