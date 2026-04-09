"use client";

import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface BSItem {
  ledgerId: string;
  ledgerName: string;
  groupName: string;
  amount: number;
}

interface BalanceSheetData {
  liabilities: BSItem[];
  assets: BSItem[];
  netProfit: number;
  totalLiabilities: number;
  totalAssets: number;
}

export function BalanceSheetView({ data }: { data: BalanceSheetData }) {
  const isBalanced = Math.abs(data.totalLiabilities - data.totalAssets) < 0.01;

  // Group items by groupName
  const liabilitiesByGroup = groupItems(data.liabilities);
  const assetsByGroup = groupItems(data.assets);

  return (
    <div className="space-y-4">
      {/* Balance verification */}
      <div className="flex items-center justify-end">
        {isBalanced ? (
          <div className="flex items-center gap-2 rounded-full bg-success-50 px-3 py-1.5 text-xs font-medium text-success-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Balance Sheet is balanced
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full bg-danger-50 px-3 py-1.5 text-xs font-medium text-danger-700">
            <XCircle className="h-3.5 w-3.5" />
            Difference: {formatCurrency(Math.abs(data.totalLiabilities - data.totalAssets))}
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-200">
            {/* Liabilities */}
            <div>
              <div className="border-b border-surface-200 bg-purple-50/50 px-6 py-3">
                <h3 className="font-display text-sm font-semibold text-purple-700 uppercase tracking-wide">
                  Liabilities
                </h3>
              </div>
              <div className="divide-y divide-surface-100">
                {Object.entries(liabilitiesByGroup).map(([groupName, items]) => (
                  <BSGroupSection
                    key={groupName}
                    groupName={groupName}
                    items={items}
                  />
                ))}

                {/* Net Profit row */}
                {data.netProfit > 0 && (
                  <div className="px-6 py-2.5 bg-success-50/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-success-700">
                        Net Profit (from P&L)
                      </span>
                      <span className="font-mono tabular-nums text-sm font-medium text-success-700">
                        {formatCurrency(data.netProfit)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t-2 border-surface-300 bg-surface-900 px-6 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    Total Liabilities
                  </span>
                  <span className="font-mono tabular-nums text-sm font-bold text-white">
                    {formatCurrency(data.totalLiabilities)}
                  </span>
                </div>
              </div>
            </div>

            {/* Assets */}
            <div>
              <div className="border-b border-surface-200 bg-blue-50/50 px-6 py-3">
                <h3 className="font-display text-sm font-semibold text-blue-700 uppercase tracking-wide">
                  Assets
                </h3>
              </div>
              <div className="divide-y divide-surface-100">
                {Object.entries(assetsByGroup).map(([groupName, items]) => (
                  <BSGroupSection
                    key={groupName}
                    groupName={groupName}
                    items={items}
                  />
                ))}

                {/* Net Loss row */}
                {data.netProfit < 0 && (
                  <div className="px-6 py-2.5 bg-danger-50/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-danger-700">
                        Net Loss (from P&L)
                      </span>
                      <span className="font-mono tabular-nums text-sm font-medium text-danger-700">
                        {formatCurrency(Math.abs(data.netProfit))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t-2 border-surface-300 bg-surface-900 px-6 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    Total Assets
                  </span>
                  <span className="font-mono tabular-nums text-sm font-bold text-white">
                    {formatCurrency(data.totalAssets)}
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

function BSGroupSection({
  groupName,
  items,
}: {
  groupName: string;
  items: BSItem[];
}) {
  const groupTotal = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div>
      <div className="bg-surface-50 px-6 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
          {groupName}
        </span>
      </div>
      {items.map((item) => (
        <div
          key={item.ledgerId}
          className="flex items-center justify-between px-6 py-2 hover:bg-surface-50/50 transition-colors"
        >
          <Link
            href={`/reports/ledger/${item.ledgerId}`}
            className="text-sm text-brand-600 hover:text-brand-700 hover:underline transition-colors"
          >
            {item.ledgerName}
          </Link>
          <span className="font-mono tabular-nums text-sm text-surface-900 shrink-0 ml-4">
            {formatCurrency(item.amount)}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between px-6 py-1.5 bg-surface-50/50 border-t border-surface-100">
        <span className="text-xs font-medium text-surface-500 italic">
          {groupName} Total
        </span>
        <span className="font-mono tabular-nums text-xs font-medium text-surface-600">
          {formatCurrency(groupTotal)}
        </span>
      </div>
    </div>
  );
}

function groupItems(items: BSItem[]): Record<string, BSItem[]> {
  const grouped: Record<string, BSItem[]> = {};
  for (const item of items) {
    if (!grouped[item.groupName]) {
      grouped[item.groupName] = [];
    }
    grouped[item.groupName].push(item);
  }
  return grouped;
}
