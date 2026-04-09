"use client";

import Link from "next/link";
import { Inbox } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { VOUCHER_TYPE_CONFIG } from "@/lib/constants/voucher-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface VoucherEntry {
  id: string;
  entryType: string;
  amount: string;
  ledger: {
    id: string;
    name: string;
  };
}

interface RecentVoucher {
  id: string;
  voucherNumber: string;
  voucherType: string;
  date: string;
  totalAmount: string | null;
  entries: VoucherEntry[];
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

export function RecentVouchers({ vouchers }: { vouchers: RecentVoucher[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-display">
          Recent Vouchers
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-brand-500" asChild>
          <Link href="/reports/day-book">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {vouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-100">
              <Inbox className="h-6 w-6 text-surface-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-surface-600">
              No vouchers yet
            </p>
            <p className="mt-1 text-xs text-surface-400 text-center">
              Create your first voucher to see it here
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-50">
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Number</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher) => {
                const config = VOUCHER_TYPE_CONFIG[voucher.voucherType];
                const amount = voucher.totalAmount
                  ? Number(voucher.totalAmount)
                  : voucher.entries
                      .filter((e) => e.entryType === "debit")
                      .reduce((sum, e) => sum + Number(e.amount), 0);

                return (
                  <TableRow
                    key={voucher.id}
                    className="cursor-pointer hover:bg-brand-50/20 transition-colors"
                  >
                    <TableCell className="text-xs text-surface-600">
                      {formatDate(voucher.date)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${typeColorMap[voucher.voucherType] ?? ""}`}
                      >
                        {config?.label ?? voucher.voucherType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/vouchers/${voucher.id}`}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        {voucher.voucherNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-xs font-medium">
                      {formatCurrency(amount)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
