import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
import { getLedgersForCompany } from "@/queries/ledger";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const natureColors: Record<string, string> = {
  assets: "bg-blue-50 text-blue-700 border-blue-200",
  liabilities: "bg-purple-50 text-purple-700 border-purple-200",
  income: "bg-green-50 text-green-700 border-green-200",
  expenses: "bg-orange-50 text-orange-700 border-orange-200",
};

export default async function LedgerReportIndexPage() {
  const cookieStore = await cookies();
  const companyId = cookieStore.get("activeCompanyId")?.value;

  if (!companyId) {
    redirect("/company");
  }

  const ledgers = await getLedgersForCompany(companyId);

  // Group by ledger group
  const grouped = new Map<string, { groupName: string; nature: string; ledgers: typeof ledgers }>();
  for (const l of ledgers) {
    const gName = l.group?.name ?? "Unknown";
    const nature = l.group?.nature ?? "assets";
    if (!grouped.has(gName)) {
      grouped.set(gName, { groupName: gName, nature, ledgers: [] });
    }
    grouped.get(gName)!.ledgers.push(l);
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Ledger Report"
        description="Select a ledger to view its detailed transaction report"
        breadcrumbs={[
          { label: "Reports", href: "/reports" },
          { label: "Ledger Report" },
        ]}
      />

      {ledgers.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No ledgers found"
          description="Create ledger accounts first to view their reports."
        />
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([groupName, group]) => (
            <div key={groupName}>
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-sm font-semibold text-surface-700">
                  {groupName}
                </h3>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${natureColors[group.nature] ?? ""}`}
                >
                  {group.nature}
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {group.ledgers.map((ledger) => (
                  <Link
                    key={ledger.id}
                    href={`/reports/ledger/${ledger.id}`}
                  >
                    <Card className="group transition-all duration-150 hover:shadow-sm hover:border-brand-200 hover:bg-brand-50/20 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-100 group-hover:bg-brand-100 transition-colors">
                            <FileText className="h-4 w-4 text-surface-500 group-hover:text-brand-600 transition-colors" />
                          </div>
                          <span className="text-sm font-medium text-surface-700 group-hover:text-brand-700 transition-colors truncate">
                            {ledger.name}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
