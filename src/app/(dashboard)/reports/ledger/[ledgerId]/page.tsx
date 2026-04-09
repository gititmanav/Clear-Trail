import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { getLedgerReport } from "@/queries/reports";
import { getCompanyWithDetails } from "@/queries/company";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LedgerReportClient } from "@/components/reports/ledger-report-client";

interface LedgerReportPageProps {
  params: Promise<{ ledgerId: string }>;
}

export default async function LedgerReportPage({
  params,
}: LedgerReportPageProps) {
  const { ledgerId } = await params;
  const cookieStore = await cookies();
  const companyId = cookieStore.get("activeCompanyId")?.value;

  if (!companyId) {
    redirect("/company");
  }

  const company = await getCompanyWithDetails(companyId);
  if (!company || !company.currentFinancialYear) {
    redirect("/company");
  }

  const data = await getLedgerReport(
    ledgerId,
    companyId,
    company.currentFinancialYear.startDate,
    company.currentFinancialYear.endDate
  );

  if (!data) {
    notFound();
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={data.ledger.name}
        description={`Ledger Report | Group: ${data.ledger.group.name}`}
        breadcrumbs={[
          { label: "Reports", href: "/reports" },
          { label: "Ledger Report" },
          { label: data.ledger.name },
        ]}
      />

      <LedgerReportClient data={data} />
    </div>
  );
}
