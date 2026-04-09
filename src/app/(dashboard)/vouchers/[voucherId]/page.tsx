import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getVoucherById } from "@/queries/voucher";
import { formatCurrency, formatDate } from "@/lib/utils";
import { VOUCHER_TYPE_CONFIG } from "@/lib/constants/voucher-types";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { VoucherDetailActions } from "./voucher-detail-actions";

interface VoucherDetailPageProps {
  params: Promise<{ voucherId: string }>;
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

export default async function VoucherDetailPage({
  params,
}: VoucherDetailPageProps) {
  const { voucherId } = await params;
  const voucher = await getVoucherById(voucherId);

  if (!voucher) {
    notFound();
  }

  const config = VOUCHER_TYPE_CONFIG[voucher.voucherType];

  const totalDebit = voucher.entries
    .filter((e) => e.entryType === "debit")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const totalCredit = voucher.entries
    .filter((e) => e.entryType === "credit")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vouchers">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold text-surface-900">
              {voucher.voucherNumber}
            </h2>
            <Badge
              variant="outline"
              className={typeColorMap[voucher.voucherType]}
            >
              {config?.label ?? voucher.voucherType}
            </Badge>
            {voucher.isCancelled && (
              <Badge variant="destructive">Cancelled</Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-surface-500">
            {formatDate(voucher.date)}
            {voucher.referenceNumber && (
              <span className="ml-3">
                Ref: <span className="font-mono">{voucher.referenceNumber}</span>
              </span>
            )}
          </p>
        </div>
        <VoucherDetailActions
          voucherId={voucher.id}
          isCancelled={voucher.isCancelled ?? false}
        />
      </div>

      {/* Entries table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Entries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Ledger</TableHead>
                <TableHead className="text-right w-40">Debit</TableHead>
                <TableHead className="text-right w-40">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {voucher.entries.map((entry, idx) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-xs text-surface-400">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.ledger?.name ?? "Unknown"}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {entry.entryType === "debit"
                      ? formatCurrency(Number(entry.amount))
                      : ""}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {entry.entryType === "credit"
                      ? formatCurrency(Number(entry.amount))
                      : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-semibold">
                  Total
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums font-semibold">
                  {formatCurrency(totalDebit)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums font-semibold">
                  {formatCurrency(totalCredit)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Narration */}
      {voucher.narration && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Narration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-surface-700 whitespace-pre-wrap">
              {voucher.narration}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-surface-500">Voucher Type</dt>
              <dd className="font-medium">{config?.label ?? voucher.voucherType}</dd>
            </div>
            <div>
              <dt className="text-surface-500">Total Amount</dt>
              <dd className="font-medium font-mono">
                {formatCurrency(Number(voucher.totalAmount ?? 0))}
              </dd>
            </div>
            <div>
              <dt className="text-surface-500">Created At</dt>
              <dd className="font-medium">
                {voucher.createdAt
                  ? new Date(voucher.createdAt).toLocaleString("en-IN")
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-surface-500">Financial Year</dt>
              <dd className="font-medium">
                {voucher.financialYear
                  ? `${formatDate(voucher.financialYear.startDate)} - ${formatDate(voucher.financialYear.endDate)}`
                  : "-"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
