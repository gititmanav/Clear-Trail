import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { getProfitAndLoss } from "@/queries/reports";
import { getCompanyWithDetails } from "@/queries/company";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PnLStatement } from "@/components/reports/pnl-statement";

export default async function ProfitLossPage() {
  const cookieStore = await cookies();
  const companyId = cookieStore.get("activeCompanyId")?.value;

  if (!companyId) {
    redirect("/company");
  }

  const company = await getCompanyWithDetails(companyId);
  if (!company || !company.currentFinancialYear) {
    redirect("/company");
  }

  const data = await getProfitAndLoss(companyId, company.currentFinancialYear.id);

  const hasData =
    data.tradingAccount.expenses.length > 0 ||
    data.tradingAccount.incomes.length > 0 ||
    data.profitAndLoss.expenses.length > 0 ||
    data.profitAndLoss.incomes.length > 0;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Profit & Loss Statement"
        description={`For the period ${new Date(company.currentFinancialYear.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} to ${new Date(company.currentFinancialYear.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`}
        breadcrumbs={[
          { label: "Reports", href: "/reports" },
          { label: "Profit & Loss" },
        ]}
      />

      {!hasData ? (
        <EmptyState
          icon={TrendingUp}
          title="No income or expense data"
          description="Record sales and purchase vouchers to see the Profit & Loss statement."
        />
      ) : (
        <PnLStatement data={data} />
      )}
    </div>
  );
}
