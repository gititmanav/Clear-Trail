"use client";

import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Building2,
  ShoppingCart,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  RefreshCw,
  BookOpen,
  ReceiptText,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/utils";
import { VOUCHER_TYPE_CONFIG } from "@/lib/constants/voucher-types";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MonthlyChart } from "./monthly-chart";
import { RecentVouchers } from "./recent-vouchers";

interface DashboardStats {
  income: number;
  expenses: number;
  receivables: number;
  payables: number;
}

interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}

interface VoucherEntry {
  id: string;
  entryType: string;
  amount: string;
  ledger: { id: string; name: string };
}

interface RecentVoucher {
  id: string;
  voucherNumber: string;
  voucherType: string;
  date: string;
  totalAmount: string | null;
  entries: VoucherEntry[];
}

interface DashboardClientProps {
  stats: DashboardStats;
  monthlyTrends: MonthlyTrend[];
  recentVouchers: RecentVoucher[];
  companyName: string;
  fyLabel: string;
}

const iconMap: Record<string, React.ElementType> = {
  ShoppingCart,
  IndianRupee: Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight: RefreshCw,
  BookOpen,
  ReceiptText,
  FileText,
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const quickActions = [
  { type: "sales", label: "New Sale", href: "/vouchers/sales/new", shortcut: "F8" },
  { type: "purchase", label: "New Purchase", href: "/vouchers/purchase/new", shortcut: "F9" },
  { type: "payment", label: "New Payment", href: "/vouchers/payment/new", shortcut: "F5" },
  { type: "receipt", label: "New Receipt", href: "/vouchers/receipt/new", shortcut: "F6" },
  { type: "journal", label: "New Journal", href: "/vouchers/journal/new", shortcut: "F7" },
  { type: "contra", label: "New Contra", href: "/vouchers/contra/new", shortcut: "F4" },
  { type: "credit_note", label: "Credit Note", href: "/vouchers/credit_note/new", shortcut: "Ctrl+F8" },
  { type: "debit_note", label: "Debit Note", href: "/vouchers/debit_note/new", shortcut: "Ctrl+F9" },
];

export function DashboardClient({
  stats,
  monthlyTrends,
  recentVouchers,
  companyName,
  fyLabel,
}: DashboardClientProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "there";
  const netProfit = stats.income - stats.expenses;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting */}
      <div>
        <h2 className="font-display text-2xl font-bold text-surface-900">
          {getGreeting()}, {userName}
        </h2>
        <p className="mt-1 text-sm text-surface-500">
          {companyName} &middot; FY {fyLabel}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Income"
          value={formatCurrency(stats.income)}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(stats.expenses)}
          icon={TrendingDown}
          variant="danger"
        />
        <StatCard
          title={netProfit >= 0 ? "Net Profit" : "Net Loss"}
          value={formatCurrency(Math.abs(netProfit))}
          icon={Wallet}
          variant="brand"
        />
        <StatCard
          title="Receivables"
          value={formatCurrency(Math.max(stats.receivables, 0))}
          icon={Users}
          variant="warning"
        />
        <StatCard
          title="Payables"
          value={formatCurrency(Math.max(stats.payables, 0))}
          icon={Building2}
          variant="brand"
        />
      </div>

      {/* Chart + Recent Vouchers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyChart data={monthlyTrends} />
        </div>
        <div className="lg:col-span-1">
          <RecentVouchers vouchers={recentVouchers} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-4 font-display text-base font-semibold text-surface-900">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {quickActions.map((action) => {
            const config = VOUCHER_TYPE_CONFIG[action.type];
            const IconComp = config ? iconMap[config.icon] ?? FileText : FileText;
            return (
              <Button
                key={action.href}
                variant="outline"
                asChild
                className="h-auto flex-col gap-2 py-4 relative group"
              >
                <Link href={action.href}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 group-hover:bg-brand-100 transition-colors">
                    <IconComp className="h-[18px] w-[18px] text-brand-500" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                  <Badge
                    variant="outline"
                    className="absolute top-1.5 right-1.5 text-[9px] px-1 py-0 font-mono text-surface-400 border-surface-200"
                  >
                    {action.shortcut}
                  </Badge>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
