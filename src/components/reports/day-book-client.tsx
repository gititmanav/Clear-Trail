"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CalendarDays, Filter } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { VOUCHER_TYPE_CONFIG } from "@/lib/constants/voucher-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
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

interface DayBookVoucher {
  id: string;
  voucherNumber: string;
  voucherType: string;
  date: string;
  narration: string | null;
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

const PAGE_SIZE = 20;

export function DayBookClient({ vouchers }: { vouchers: DayBookVoucher[] }) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (typeFilter === "all") return vouchers;
    return vouchers.filter((v) => v.voucherType === typeFilter);
  }, [vouchers, typeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const totals = useMemo(() => {
    let debit = 0;
    let credit = 0;
    for (const v of filtered) {
      for (const e of v.entries) {
        if (e.entryType === "debit") debit += Number(e.amount);
        else credit += Number(e.amount);
      }
    }
    return { debit, credit };
  }, [filtered]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-surface-400" />
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Voucher Types</SelectItem>
              {Object.entries(VOUCHER_TYPE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto text-sm text-surface-500">
          {filtered.length} voucher{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-50">
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead className="w-[130px]">Voucher No.</TableHead>
                <TableHead className="w-[110px]">Type</TableHead>
                <TableHead>Particulars</TableHead>
                <TableHead className="w-[140px] text-right">
                  Debit ({"\u20B9"})
                </TableHead>
                <TableHead className="w-[140px] text-right">
                  Credit ({"\u20B9"})
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-surface-400"
                  >
                    No vouchers found for the selected filters
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((voucher, idx) => {
                  const config = VOUCHER_TYPE_CONFIG[voucher.voucherType];
                  const debitEntries = voucher.entries.filter(
                    (e) => e.entryType === "debit"
                  );
                  const creditEntries = voucher.entries.filter(
                    (e) => e.entryType === "credit"
                  );
                  const voucherDebit = debitEntries.reduce(
                    (sum, e) => sum + Number(e.amount),
                    0
                  );
                  const voucherCredit = creditEntries.reduce(
                    (sum, e) => sum + Number(e.amount),
                    0
                  );

                  const particulars = [
                    ...debitEntries.map((e) => e.ledger.name),
                    ...creditEntries.map((e) => e.ledger.name),
                  ];

                  return (
                    <TableRow
                      key={voucher.id}
                      className={`cursor-pointer hover:bg-brand-50/30 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-surface-50/30"
                      }`}
                    >
                      <TableCell className="text-sm text-surface-600">
                        {formatDate(voucher.date)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/vouchers/${voucher.id}`}
                          className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          {voucher.voucherNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${typeColorMap[voucher.voucherType] ?? ""}`}
                        >
                          {config?.label ?? voucher.voucherType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-surface-700 max-w-[250px] truncate">
                        {particulars.join(", ")}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-sm">
                        {voucherDebit > 0 ? formatCurrency(voucherDebit) : ""}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-sm">
                        {voucherCredit > 0 ? formatCurrency(voucherCredit) : ""}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            {filtered.length > 0 && (
              <TableFooter>
                <TableRow className="bg-surface-100">
                  <TableCell colSpan={4} className="font-semibold text-sm">
                    Total ({filtered.length} vouchers)
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-sm font-semibold">
                    {formatCurrency(totals.debit)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-sm font-semibold">
                    {formatCurrency(totals.credit)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
