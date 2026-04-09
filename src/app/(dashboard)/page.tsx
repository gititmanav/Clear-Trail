import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDashboardStats, getMonthlyTrends, getRecentVouchers } from "@/queries/dashboard";
import { getCompanyWithDetails } from "@/queries/company";
import { getFinancialYearLabel } from "@/lib/utils";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const companyId = cookieStore.get("activeCompanyId")?.value;

  if (!companyId) {
    redirect("/company");
  }

  const company = await getCompanyWithDetails(companyId);
  if (!company || !company.currentFinancialYear) {
    redirect("/company");
  }

  const fyId = company.currentFinancialYear.id;

  const [stats, monthlyTrends, recentVouchersRaw] = await Promise.all([
    getDashboardStats(companyId, fyId),
    getMonthlyTrends(companyId, fyId),
    getRecentVouchers(companyId, 10),
  ]);

  const recentVouchers = recentVouchersRaw.map((v) => ({
    id: v.id,
    voucherNumber: v.voucherNumber,
    voucherType: v.voucherType,
    date: v.date,
    totalAmount: v.totalAmount,
    entries: v.entries.map((e) => ({
      id: e.id,
      entryType: e.entryType,
      amount: String(e.amount),
      ledger: { id: e.ledger.id, name: e.ledger.name },
    })),
  }));

  const fyLabel = getFinancialYearLabel(
    company.currentFinancialYear.startDate,
    company.currentFinancialYear.endDate
  );

  return (
    <DashboardClient
      stats={stats}
      monthlyTrends={monthlyTrends}
      recentVouchers={recentVouchers}
      companyName={company.name}
      fyLabel={fyLabel}
    />
  );
}
