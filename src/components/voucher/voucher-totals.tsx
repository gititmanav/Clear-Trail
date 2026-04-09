"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface VoucherTotalsProps {
  totalDebit: number;
  totalCredit: number;
}

export function VoucherTotals({ totalDebit, totalCredit }: VoucherTotalsProps) {
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.01;

  return (
    <div className="flex items-center justify-end gap-6 rounded-lg border border-surface-200 bg-surface-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-surface-500 uppercase tracking-wide">
          Total Debit
        </span>
        <span className="text-sm font-bold font-mono tabular-nums text-surface-900">
          {formatCurrency(totalDebit)}
        </span>
      </div>
      <div className="h-5 w-px bg-surface-200" />
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-surface-500 uppercase tracking-wide">
          Total Credit
        </span>
        <span className="text-sm font-bold font-mono tabular-nums text-surface-900">
          {formatCurrency(totalCredit)}
        </span>
      </div>
      <div className="h-5 w-px bg-surface-200" />
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-surface-500 uppercase tracking-wide">
          Difference
        </span>
        <span
          className={cn(
            "text-sm font-bold font-mono tabular-nums transition-colors",
            isBalanced ? "text-success-600" : "text-danger-600"
          )}
        >
          {isBalanced ? formatCurrency(0) : formatCurrency(difference)}
        </span>
        {isBalanced && (
          <span className="text-xs font-medium text-success-600 bg-success-50 px-1.5 py-0.5 rounded">
            Balanced
          </span>
        )}
      </div>
    </div>
  );
}
