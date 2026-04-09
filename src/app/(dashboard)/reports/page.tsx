import Link from "next/link";
import {
  Scale,
  TrendingUp,
  Building2,
  BookOpen,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const reports = [
  {
    title: "Trial Balance",
    description: "View all ledger balances with debit and credit totals",
    href: "/reports/trial-balance",
    icon: Scale,
    color: "text-brand-600",
    bg: "bg-brand-50",
  },
  {
    title: "Profit & Loss",
    description: "Trading and profit & loss account statement",
    href: "/reports/profit-loss",
    icon: TrendingUp,
    color: "text-success-600",
    bg: "bg-success-50",
  },
  {
    title: "Balance Sheet",
    description: "Statement of assets, liabilities, and capital",
    href: "/reports/balance-sheet",
    icon: Building2,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Day Book",
    description: "Chronological record of all transactions",
    href: "/reports/day-book",
    icon: BookOpen,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    title: "Ledger Report",
    description: "Detailed transaction history for any ledger account",
    href: "/reports/ledger",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
];

export default function ReportsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports"
        description="Financial reports and statements for your business"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, i) => {
          const Icon = report.icon;
          return (
            <Link key={report.href} href={report.href}>
              <Card
                className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-surface-300 hover:-translate-y-0.5 cursor-pointer h-full"
                style={{
                  animationDelay: `${i * 60}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${report.bg} transition-transform duration-200 group-hover:scale-110`}
                    >
                      <Icon className={`h-6 w-6 ${report.color}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">
                        {report.title}
                      </h3>
                      <p className="mt-1 text-sm text-surface-500 leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
