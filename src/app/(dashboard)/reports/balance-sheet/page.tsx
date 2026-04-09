import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { getBalanceSheet } from "@/queries/reports";
import { getCompanyWithDetails } from "@/queries/company";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { BalanceSheetView } from "@/components/reports/balance-sheet-view";

export default async function BalanceSheetPage() {
  const cookieStore = await cookies();
  const companyId = cookieStore.get("activeCompanyId")?.value;

  if (!companyId) {
    redirect("/company");
  }

  const company = await getCompanyWithDetails(companyId);
  if (!company || !company.currentFinancialYear) {
    redirect("/company");
  }

  const data = await getBalanceSheet(companyId, company.currentFinancialYear.id);

  const hasData = data.liabilities.length > 0 || data.assets.length > 0;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Balance Sheet"
        description={`As on ${new Date(company.currentFinancialYear.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`}
        breadcrumbs={[
          { label: "Reports", href: "/reports" },
          { label: "Balance Sheet" },
        ]}
      />

      {!hasData ? (
        <EmptyState
          icon={Building2}
          title="No balance sheet data"
          description="Record transactions to see the Balance Sheet with assets and liabilities."
        />
      ) : (
        <BalanceSheetView data={data} />
      )}
    </div>
  );
}
