"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import { VOUCHER_TYPE_CONFIG } from "@/lib/constants/voucher-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface VoucherItem {
  id: string;
  voucherNumber: string;
  voucherType: string;
  date: string;
  narration: string;
  totalAmount: number;
  isCancelled: boolean;
  debitLedgers: string[];
  creditLedgers: string[];
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface VoucherListClientProps {
  vouchers: VoucherItem[];
  pagination: Pagination;
  currentType?: string;
  currentSearch?: string;
}

const voucherTypes = [
  { value: "", label: "All" },
  { value: "purchase", label: "Purchase" },
  { value: "sales", label: "Sales" },
  { value: "payment", label: "Payment" },
  { value: "receipt", label: "Receipt" },
  { value: "contra", label: "Contra" },
  { value: "journal", label: "Journal" },
  { value: "credit_note", label: "Cr Note" },
  { value: "debit_note", label: "Dr Note" },
];

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

export function VoucherListClient({
  vouchers,
  pagination,
  currentType = "",
  currentSearch = "",
}: VoucherListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(currentSearch ?? "");

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page when changing filters
    if (key !== "page") {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams("search", search);
  }

  return (
    <div className="space-y-4">
      {/* Voucher type tabs */}
      <Tabs
        value={currentType ?? ""}
        onValueChange={(v) => updateParams("type", v)}
      >
        <TabsList className="h-auto flex-wrap">
          {voucherTypes.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <Input
            placeholder="Search by narration..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </form>

      {/* Table */}
      <div className="rounded-lg border border-surface-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Date</TableHead>
              <TableHead className="w-32">Number</TableHead>
              <TableHead className="w-24">Type</TableHead>
              <TableHead>Debit</TableHead>
              <TableHead>Credit</TableHead>
              <TableHead className="text-right w-32">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vouchers.map((v) => (
              <TableRow
                key={v.id}
                className={cn(
                  "cursor-pointer",
                  v.isCancelled && "opacity-50 line-through"
                )}
                onClick={() => router.push(`/vouchers/${v.id}`)}
              >
                <TableCell className="text-sm text-surface-600">
                  {formatDate(v.date)}
                </TableCell>
                <TableCell className="font-mono text-xs text-surface-500">
                  {v.voucherNumber}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      typeColorMap[v.voucherType]
                    )}
                  >
                    {VOUCHER_TYPE_CONFIG[v.voucherType]?.label ?? v.voucherType}
                  </Badge>
                  {v.isCancelled && (
                    <Badge variant="destructive" className="ml-1 text-[10px]">
                      Cancelled
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {v.debitLedgers.join(", ") || "-"}
                </TableCell>
                <TableCell className="text-sm">
                  {v.creditLedgers.join(", ") || "-"}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-sm">
                  {formatCurrency(v.totalAmount)}
                </TableCell>
              </TableRow>
            ))}
            {vouchers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-surface-500">
                  No vouchers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-500">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)}{" "}
            of {pagination.total} vouchers
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                updateParams("page", String(pagination.page - 1))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-surface-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                updateParams("page", String(pagination.page + 1))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
