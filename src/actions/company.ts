"use server";

import { db } from "@/db";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createCompanySchema } from "@/lib/validators/company";
import {
  companies,
  financialYears,
  companyMembers,
} from "@/db/schema/company";
import { ledgerGroups, ledgers } from "@/db/schema/ledger";
import { voucherSequences } from "@/db/schema/voucher";
import { PRIMARY_LEDGER_GROUPS } from "@/lib/constants/ledger-groups";
import { VOUCHER_TYPE_CONFIG } from "@/lib/constants/voucher-types";
import { eq } from "drizzle-orm";

export async function createCompany(formData: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsed = createCompanySchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const input = parsed.data;

  const result = await db.transaction(async (tx) => {
    // 1. Insert company
    const [company] = await tx
      .insert(companies)
      .values({
        name: input.name,
        address: input.address || null,
        state: input.state || null,
        gstin: input.gstin || null,
        pan: input.pan || null,
        phone: input.phone || null,
        email: input.email || null,
      })
      .returning();

    // 2. Insert financial year
    const [fy] = await tx
      .insert(financialYears)
      .values({
        companyId: company.id,
        startDate: input.financialYearStart,
        endDate: input.financialYearEnd,
        isCurrent: true,
      })
      .returning();

    // 3. Insert company member (owner)
    await tx.insert(companyMembers).values({
      companyId: company.id,
      userId: session.user.id,
      role: "owner",
    });

    // 4. Seed primary ledger groups
    // First, insert root groups (those without a parent)
    const rootGroups = PRIMARY_LEDGER_GROUPS.filter((g) => !g.parentName);
    const groupNameToId: Record<string, string> = {};

    for (const group of rootGroups) {
      const [inserted] = await tx
        .insert(ledgerGroups)
        .values({
          companyId: company.id,
          name: group.name,
          parentId: null,
          nature: group.nature,
          isPrimary: true,
          affectsGrossProfit: group.affectsGrossProfit,
          sortOrder: group.sortOrder,
        })
        .returning();
      groupNameToId[group.name] = inserted.id;
    }

    // Then, insert child groups with parentId
    const childGroups = PRIMARY_LEDGER_GROUPS.filter((g) => g.parentName);
    for (const group of childGroups) {
      const parentId = groupNameToId[group.parentName!];
      const [inserted] = await tx
        .insert(ledgerGroups)
        .values({
          companyId: company.id,
          name: group.name,
          parentId,
          nature: group.nature,
          isPrimary: true,
          affectsGrossProfit: group.affectsGrossProfit,
          sortOrder: group.sortOrder,
        })
        .returning();
      groupNameToId[group.name] = inserted.id;
    }

    // 5. Create "Cash" ledger under Cash-in-Hand
    const cashGroupId = groupNameToId["Cash-in-Hand"];
    if (cashGroupId) {
      await tx.insert(ledgers).values({
        companyId: company.id,
        groupId: cashGroupId,
        name: "Cash",
        openingBalance: "0",
        openingBalanceType: "debit",
      });
    }

    // 6. Create "Profit & Loss A/c" ledger under Capital Account
    const capitalGroupId = groupNameToId["Capital Account"];
    if (capitalGroupId) {
      await tx.insert(ledgers).values({
        companyId: company.id,
        groupId: capitalGroupId,
        name: "Profit & Loss A/c",
        openingBalance: "0",
        openingBalanceType: "credit",
      });
    }

    // 7. Create voucher sequences for all 8 types
    const voucherTypeValues = [
      "purchase",
      "sales",
      "payment",
      "receipt",
      "journal",
      "contra",
      "credit_note",
      "debit_note",
    ] as const;
    const prefixMap: Record<string, string> = {
      purchase: "PUR",
      sales: "SAL",
      payment: "PAY",
      receipt: "RCT",
      journal: "JRN",
      contra: "CON",
      credit_note: "CRN",
      debit_note: "DRN",
    };

    for (const type of voucherTypeValues) {
      await tx.insert(voucherSequences).values({
        companyId: company.id,
        financialYearId: fy.id,
        voucherType: type,
        prefix: prefixMap[type] || type.toUpperCase().slice(0, 3),
        lastNumber: 0,
      });
    }

    return company;
  });

  revalidatePath("/company");
  return { data: result };
}

export async function getCompaniesForUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const members = await db.query.companyMembers.findMany({
    where: eq(companyMembers.userId, session.user.id),
    with: {
      company: {
        with: {
          financialYears: true,
        },
      },
    },
  });

  return members.map((m) => ({
    ...m.company,
    role: m.role,
    financialYears: m.company.financialYears,
  }));
}

export async function setActiveCompany(companyId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify user is a member
  const member = await db.query.companyMembers.findFirst({
    where: (cm, { and, eq }) =>
      and(eq(cm.companyId, companyId), eq(cm.userId, session.user.id)),
  });

  if (!member) {
    throw new Error("You are not a member of this company");
  }

  const cookieStore = await cookies();
  cookieStore.set("activeCompanyId", companyId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
  });

  revalidatePath("/");
}
