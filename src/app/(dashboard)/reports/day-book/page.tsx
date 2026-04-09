import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { getDayBook } from "@/queries/reports";
import { getCompanyWithDetails } from "@/queries/company";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DayBookClient } from "@/components/reports/day-book-client";

export default async function DayBookPage() {
  const cookieStore = await cookies();
  const companyId = cookieStore.get("activeCompanyId")?.value;

  if (!companyId) {
    redirect("/company");
  }

  const company = await getCompanyWithDetails(companyId);
  if (!company || !company.currentFinancialYear) {
    redirect("/company");
  }

  const vouchers = await getDayBook(
    companyId,
    company.currentFinancialYear.startDate,
    company.currentFinancialYear.endDate
  );

  const serialized = vouchers.map((v) => ({
    id: v.id,
    voucherNumber: v.voucherNumber,
    voucherType: v.voucherType,
    date: v.date,
    narration: v.narration,
    totalAmount: v.totalAmount,
    entries: v.entries.map((e) => ({
      id: e.id,
      entryType: e.entryType,
      amount: String(e.amount),
      ledger: {
        id: e.ledger.id,
        name: e.ledger.name,
      },
    })),
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Day Book"
        description={`Transactions from ${new Date(company.currentFinancialYear.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} to ${new Date(company.currentFinancialYear.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`}
        breadcrumbs={[
          { label: "Reports", href: "/reports" },
          { label: "Day Book" },
        ]}
      />

      {vouchers.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No transactions yet"
          description="Start recording vouchers to see the Day Book with all your transactions."
        />
      ) : (
        <DayBookClient vouchers={serialized} />
      )}
    </div>
  );
}
