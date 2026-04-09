import { db } from "@/db";
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import { companies, financialYears, companyMembers } from "@/db/schema/company";

export async function getActiveCompany() {
  const cookieStore = await cookies();
  const activeCompanyId = cookieStore.get("activeCompanyId")?.value;

  if (!activeCompanyId) {
    return null;
  }

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, activeCompanyId),
    with: {
      financialYears: true,
    },
  });

  return company ?? null;
}

export async function getCompanyWithDetails(companyId: string) {
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
    with: {
      financialYears: true,
      members: {
        with: {
          user: true,
        },
      },
    },
  });

  if (!company) return null;

  const currentFY = company.financialYears.find((fy) => fy.isCurrent) ?? null;

  return {
    ...company,
    currentFinancialYear: currentFY,
  };
}
