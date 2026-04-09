"use server";

import { db } from "@/db";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ledgerGroups, ledgers } from "@/db/schema/ledger";
import { companyMembers } from "@/db/schema/company";
import { eq, and, sql, count } from "drizzle-orm";

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

export async function createSubGroup({
  companyId,
  parentId,
  name,
}: {
  companyId: string;
  parentId: string;
  name: string;
}) {
  await verifyMembership(companyId);

  if (!name || name.trim().length < 2) {
    return { error: "Group name must be at least 2 characters" };
  }

  // Validate parent exists and belongs to the same company
  const parent = await db.query.ledgerGroups.findFirst({
    where: and(
      eq(ledgerGroups.id, parentId),
      eq(ledgerGroups.companyId, companyId)
    ),
  });

  if (!parent) {
    return { error: "Parent group not found" };
  }

  const [newGroup] = await db
    .insert(ledgerGroups)
    .values({
      companyId,
      name: name.trim(),
      parentId,
      nature: parent.nature,
      isPrimary: false,
      affectsGrossProfit: parent.affectsGrossProfit,
      sortOrder: (parent.sortOrder ?? 0) + 1,
    })
    .returning();

  return { data: newGroup };
}

export async function getGroupsForCompany(companyId: string) {
  await verifyMembership(companyId);

  const groups = await db
    .select({
      id: ledgerGroups.id,
      companyId: ledgerGroups.companyId,
      name: ledgerGroups.name,
      parentId: ledgerGroups.parentId,
      nature: ledgerGroups.nature,
      isPrimary: ledgerGroups.isPrimary,
      affectsGrossProfit: ledgerGroups.affectsGrossProfit,
      sortOrder: ledgerGroups.sortOrder,
      createdAt: ledgerGroups.createdAt,
      ledgerCount: sql<number>`(
        SELECT COUNT(*)::int FROM ledgers
        WHERE ledgers.group_id = ${ledgerGroups.id}
      )`,
    })
    .from(ledgerGroups)
    .where(eq(ledgerGroups.companyId, companyId))
    .orderBy(ledgerGroups.sortOrder);

  // Fetch parent info separately for groups with parentId
  const groupMap = new Map(groups.map((g) => [g.id, g]));

  return groups.map((g) => ({
    ...g,
    parent: g.parentId ? groupMap.get(g.parentId) ?? null : null,
  }));
}
