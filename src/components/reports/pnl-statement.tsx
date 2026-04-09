"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PnLItem {
  ledgerId: string;
  ledgerName: string;
  groupName: string;
  amount: number;
}

interface PnLData {
  tradingAccount: {
    expenses: PnLItem[];
    incomes: PnLItem[];
    totalExpenses: number;
    totalIncomes: number;
    grossProfit: number;
  };
  profitAndLoss: {
    expenses: PnLItem[];
    incomes: PnLItem[];
    totalExpenses: number;
    totalIncomes: number;
    netProfit: number;
  };
}

export function PnLStatement({ data }: { data: PnLData }) {
  const { tradingAccount, profitAndLoss } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Gross Profit"
          amount={tradingAccount.grossProfit}
          variant={tradingAccount.grossProfit >= 0 ? "success" : "danger"}
        />
        <SummaryCard
          label="Net Profit"
          amount={profitAndLoss.netProfit}
          variant={profitAndLoss.netProfit >= 0 ? "success" : "danger"}
        />
        <SummaryCard
          label="Total Revenue"
          amount={tradingAccount.totalIncomes + profitAndLoss.totalIncomes}
          variant="brand"
        />
      </div>

      {/* Trading Account */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-surface-200 bg-surface-50 px-6 py-3">
            <h3 className="font-display text-sm font-semibold text-surface-700 uppercase tracking-wide">
              Trading Account
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-200">
            {/* Expenses side */}
            <div className="p-0">
              <div className="border-b border-surface-100 bg-danger-50/50 px-6 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-danger-600">
                  Expenditure
                </span>
              </div>
              <div className="divide-y divide-surface-100">
                {tradingAccount.expenses.map((item) => (
                  <PnLRow
                    key={item.ledgerId}
                    item={item}
                    variant="expense"
                  />
                ))}
                {tradingAccount.grossProfit > 0 && (
                  <div className="flex items-center justify-between px-6 py-2.5 bg-success-50/50">
                    <span className="text-sm font-semibold text-success-700">
                      Gross Profit c/d
                    </span>
                    <span className="font-mono tabular-nums text-sm font-semibold text-success-700">
                      {formatCurrency(tradingAccount.grossProfit)}
                    </span>
                  </div>
                )}
              </div>
              <div className="border-t-2 border-surface-300 bg-surface-50 px-6 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-surface-900">
                    Total
                  </span>
                  <span className="font-mono tabular-nums text-sm font-bold text-surface-900">
                    {formatCurrency(
                      tradingAccount.totalExpenses +
                        Math.max(tradingAccount.grossProfit, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Income side */}
            <div className="p-0">
              <div className="border-b border-surface-100 bg-success-50/50 px-6 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-success-600">
                  Income
                </span>
              </div>
              <div className="divide-y divide-surface-100">
                {tradingAccount.incomes.map((item) => (
                  <PnLRow
                    key={item.ledgerId}
                    item={item}
                    variant="income"
                  />
                ))}
                {tradingAccount.grossProfit < 0 && (
                  <div className="flex items-center justify-between px-6 py-2.5 bg-danger-50/50">
                    <span className="text-sm font-semibold text-danger-700">
                      Gross Loss c/d
                    </span>
                    <span className="font-mono tabular-nums text-sm font-semibold text-danger-700">
                      {formatCurrency(Math.abs(tradingAccount.grossProfit))}
                    </span>
                  </div>
                )}
              </div>
              <div className="border-t-2 border-surface-300 bg-surface-50 px-6 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-surface-900">
                    Total
                  </span>
                  <span className="font-mono tabular-nums text-sm font-bold text-surface-900">
                    {formatCurrency(
                      tradingAccount.totalIncomes +
                        Math.max(-tradingAccount.grossProfit, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profit & Loss Account */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-surface-200 bg-surface-50 px-6 py-3">
            <h3 className="font-display text-sm font-semibold text-surface-700 uppercase tracking-wide">
              Profit & Loss Account
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-200">
            {/* Expenses side */}
            <div className="p-0">
              <div className="border-b border-surface-100 bg-danger-50/50 px-6 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-danger-600">
                  Expenditure
                </span>
              </div>
              <div className="divide-y divide-surface-100">
                {tradingAccount.grossProfit < 0 && (
                  <div className="flex items-center justify-between px-6 py-2.5 bg-danger-50/30">
                    <span className="text-sm font-medium text-danger-600">
                      Gross Loss b/d
                    </span>
                    <span className="font-mono tabular-nums text-sm font-medium text-danger-600">
                      {formatCurrency(Math.abs(tradingAccount.grossProfit))}
                    </span>
                  </div>
                )}
                {profitAndLoss.expenses.map((item) => (
                  <PnLRow
                    key={item.ledgerId}
                    item={item}
                    variant="expense"
                  />
                ))}
                {profitAndLoss.netProfit > 0 && (
                  <div className="flex items-center justify-between px-6 py-2.5 bg-success-50/50">
                    <span className="text-sm font-semibold text-success-700">
                      Net Profit
                    </span>
                    <span className="font-mono tabular-nums text-sm font-semibold text-success-700">
                      {formatCurrency(profitAndLoss.netProfit)}
                    </span>
                  </div>
                )}
              </div>
              <div className="border-t-2 border-surface-300 bg-surface-50 px-6 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-surface-900">
                    Total
                  </span>
                  <span className="font-mono tabular-nums text-sm font-bold text-surface-900">
                    {formatCurrency(
                      profitAndLoss.totalExpenses +
                        Math.max(-tradingAccount.grossProfit, 0) +
                        Math.max(profitAndLoss.netProfit, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Income side */}
            <div className="p-0">
              <div className="border-b border-surface-100 bg-success-50/50 px-6 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-success-600">
                  Income
                </span>
              </div>
              <div className="divide-y divide-surface-100">
                {tradingAccount.grossProfit > 0 && (
                  <div className="flex items-center justify-between px-6 py-2.5 bg-success-50/30">
                    <span className="text-sm font-medium text-success-600">
                      Gross Profit b/d
                    </span>
                    <span className="font-mono tabular-nums text-sm font-medium text-success-600">
                      {formatCurrency(tradingAccount.grossProfit)}
                    </span>
                  </div>
                )}
                {profitAndLoss.incomes.map((item) => (
                  <PnLRow
                    key={item.ledgerId}
                    item={item}
                    variant="income"
                  />
                ))}
                {profitAndLoss.netProfit < 0 && (
                  <div className="flex items-center justify-between px-6 py-2.5 bg-danger-50/50">
                    <span className="text-sm font-semibold text-danger-700">
                      Net Loss
                    </span>
                    <span className="font-mono tabular-nums text-sm font-semibold text-danger-700">
                      {formatCurrency(Math.abs(profitAndLoss.netProfit))}
                    </span>
                  </div>
                )}
              </div>
              <div className="border-t-2 border-surface-300 bg-surface-50 px-6 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-surface-900">
                    Total
                  </span>
                  <span className="font-mono tabular-nums text-sm font-bold text-surface-900">
                    {formatCurrency(
                      profitAndLoss.totalIncomes +
                        Math.max(tradingAccount.grossProfit, 0) +
                        Math.max(-profitAndLoss.netProfit, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PnLRow({
  item,
  variant,
}: {
  item: PnLItem;
  variant: "expense" | "income";
}) {
  return (
    <div className="flex items-center justify-between px-6 py-2.5 hover:bg-surface-50 transition-colors">
      <div className="min-w-0">
        <Link
          href={`/reports/ledger/${item.ledgerId}`}
          className={`text-sm hover:underline transition-colors ${
            variant === "expense"
              ? "text-danger-600 hover:text-danger-700"
              : "text-success-600 hover:text-success-700"
          }`}
        >
          {item.ledgerName}
        </Link>
        <p className="text-xs text-surface-400 mt-0.5">{item.groupName}</p>
      </div>
      <span className="font-mono tabular-nums text-sm text-surface-900 shrink-0 ml-4">
        {formatCurrency(item.amount)}
      </span>
    </div>
  );
}

function SummaryCard({
  label,
  amount,
  variant,
}: {
  label: string;
  amount: number;
  variant: "success" | "danger" | "brand";
}) {
  const colorMap = {
    success: {
      bg: "bg-success-50",
      text: "text-success-700",
      label: "text-success-600",
    },
    danger: {
      bg: "bg-danger-50",
      text: "text-danger-700",
      label: "text-danger-600",
    },
    brand: {
      bg: "bg-brand-50",
      text: "text-brand-700",
      label: "text-brand-600",
    },
  };

  const colors = colorMap[variant];

  return (
    <Card className={colors.bg}>
      <CardContent className="p-5">
        <p className={`text-xs font-medium uppercase tracking-wide ${colors.label}`}>
          {label}
        </p>
        <p className={`mt-1 font-display text-2xl font-bold font-mono tabular-nums ${colors.text}`}>
          {formatCurrency(Math.abs(amount))}
        </p>
        {amount < 0 && (
          <p className="mt-0.5 text-xs text-danger-500">
            ({label.includes("Profit") ? "Loss" : "Deficit"})
          </p>
        )}
      </CardContent>
    </Card>
  );
}
