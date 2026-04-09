"use client";

import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { VOUCHER_TYPE_CONFIG } from "@/lib/constants/voucher-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface LedgerEntry {
  entryId: string;
  voucherId: string;
  voucherNumber: string;
  voucherType: string;
  date: string;
  narration: string | null;
  entryType: string;
  amount: number;
  counterpartLedgers: string[];
  runningBalance: number;
  balanceType: "Dr" | "Cr";
}

interface LedgerReportData {
  ledger: {
    id: string;
    name: string;
    group: {
      id: string;
      name: string;
      nature: string;
    };
  };
  openingBalance: number;
  openingBalanceType: string;
  entries: LedgerEntry[];
  closingBalance: number;
  closingBalanceType: string;
}

const typeColorMap: Record<string, string> = {
  purchase: "bg-orange-50 text-orange-700 border-orange-200",
  sales: "bg-green-50 text-green-700 border-green-200",
  payment: "bg-red-50 text-red-700 border-red-200",
  receipt: "bg-blue-50 text-blue-700 border-blue-200",
  contra: "bg-purple-50 text-purple-700 border-purple-200",
  journal: "bg-gray-50 text-gray-700 border-gray-200",
  credit_note: "bg-amber-50 text-amber-700 border-amber-200",
  debit_note: "bg-teal-50 text-teal-700 border-teal-200",
};

export function LedgerReportClient({ data }: { data: LedgerReportData }) {
  const totalDebits = data.entries
    .filter((e) => e.entryType === "debit")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalCredits = data.entries
    .filter((e) => e.entryType === "credit")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <MiniStat
          label="Opening Balance"
          value={formatCurrency(Math.abs(data.openingBalance))}
          suffix={data.openingBalance >= 0 ? "Dr" : "Cr"}
        />
        <MiniStat
          label="Total Debits"
          value={formatCurrency(totalDebits)}
          variant="debit"
        />
        <MiniStat
          label="Total Credits"
          value={formatCurrency(totalCredits)}
          variant="credit"
        />
        <MiniStat
          label="Closing Balance"
          value={formatCurrency(Math.abs(data.closingBalance))}
          suffix={data.closingBalanceType}
          highlight
        />
      </div>

      {/* Transactions table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-50">
                <TableHead className="w-[90px]">Date</TableHead>
                <TableHead className="w-[170px]">Voucher</TableHead>
                <TableHead>Particulars</TableHead>
                <TableHead className="w-[130px] text-right">
                  Debit ({"\u20B9"})
                </TableHead>
                <TableHead className="w-[130px] text-right">
                  Credit ({"\u20B9"})
                </TableHead>
                <TableHead className="w-[150px] text-right">
                  Balance ({"\u20B9"})
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Opening balance row */}
              <TableRow className="bg-brand-50/30 hover:bg-brand-50/50">
                <TableCell colSpan={3} className="text-sm font-medium text-surface-700">
                  Opening Balance
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-sm">
                  {data.openingBalance > 0
                    ? formatCurrency(data.openingBalance)
                    : ""}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-sm">
                  {data.openingBalance < 0
                    ? formatCurrency(Math.abs(data.openingBalance))
                    : ""}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-sm font-medium">
                  {formatCurrency(Math.abs(data.openingBalance))}{" "}
                  <span className="text-xs text-surface-500">
                    {data.openingBalance >= 0 ? "Dr" : "Cr"}
                  </span>
                </TableCell>
              </TableRow>

              {data.entries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-surface-400"
                  >
                    No transactions found for this period
                  </TableCell>
                </TableRow>
              ) : (
                data.entries.map((entry, idx) => {
                  const config = VOUCHER_TYPE_CONFIG[entry.voucherType];
                  return (
                    <TableRow
                      key={entry.entryId}
                      className={idx % 2 === 0 ? "bg-white" : "bg-surface-50/30"}
                    >
                      <TableCell className="text-sm text-surface-600">
                        {formatDate(entry.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${typeColorMap[entry.voucherType] ?? ""}`}
                          >
                            {config?.label ?? entry.voucherType}
                          </Badge>
                          <Link
                            href={`/vouchers/${entry.voucherId}`}
                            className="text-sm text-brand-600 hover:text-brand-700 hover:underline"
                          >
                            {entry.voucherNumber}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-surface-700">
                        {entry.counterpartLedgers.length > 0
                          ? entry.counterpartLedgers.join(", ")
                          : entry.narration ?? "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-sm">
                        {entry.entryType === "debit"
                          ? formatCurrency(entry.amount)
                          : ""}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-sm">
                        {entry.entryType === "credit"
                          ? formatCurrency(entry.amount)
                          : ""}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-sm">
                        {formatCurrency(Math.abs(entry.runningBalance))}{" "}
                        <span className="text-xs text-surface-500">
                          {entry.balanceType}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            <TableFooter>
              {/* Closing balance */}
              <TableRow className="bg-surface-900 text-white hover:bg-surface-900">
                <TableCell
                  colSpan={3}
                  className="font-bold text-sm text-white"
                >
                  Closing Balance
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-sm font-bold text-white">
                  {totalDebits > 0 ? formatCurrency(totalDebits) : ""}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-sm font-bold text-white">
                  {totalCredits > 0 ? formatCurrency(totalCredits) : ""}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-sm font-bold text-white">
                  {formatCurrency(Math.abs(data.closingBalance))}{" "}
                  <span className="text-xs opacity-75">
                    {data.closingBalanceType}
                  </span>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({
  label,
  value,
  suffix,
  variant,
  highlight,
}: {
  label: string;
  value: string;
  suffix?: string;
  variant?: "debit" | "credit";
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-brand-200 bg-brand-50/30" : ""}>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="mt-1 font-mono tabular-nums text-lg font-bold text-surface-900">
          {value}
          {suffix && (
            <span className="ml-1 text-xs font-medium text-surface-500">
              {suffix}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
