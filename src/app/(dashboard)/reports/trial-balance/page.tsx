import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Scale } from "lucide-react";
import { getTrialBalance } from "@/queries/reports";
import { getCompanyWithDetails } from "@/queries/company";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TrialBalanceTable } from "@/components/reports/trial-balance-table";

export default async function TrialBalancePage() {
  const cookieStore = await cookies();
  const companyId = cookieStore.get("activeCompanyId")?.value;

  if (!companyId) {
    redirect("/company");
  }

  const company = await getCompanyWithDetails(companyId);
  if (!company || !company.currentFinancialYear) {
    redirect("/company");
  }

  const data = await getTrialBalance(companyId, company.currentFinancialYear.id);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Trial Balance"
        description={`As on ${new Date(company.currentFinancialYear.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`}
        breadcrumbs={[
          { label: "Reports", href: "/reports" },
          { label: "Trial Balance" },
        ]}
      />

      {data.groups.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No data available"
          description="There are no transactions recorded yet. Create vouchers to see the trial balance."
        />
      ) : (
        <TrialBalanceTable data={data} />
      )}
    </div>
  );
}
