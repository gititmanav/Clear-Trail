import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  MapPin,
  Phone,
  Mail,
  Building2,
  CreditCard,
  FileText,
} from "lucide-react";
import { getLedgerById } from "@/queries/ledger";
import { getLedgerReport } from "@/queries/reports";
import { getCompanyWithDetails } from "@/queries/company";
import { formatCurrency, formatDate } from "@/lib/utils";
import { VOUCHER_TYPE_CONFIG } from "@/lib/constants/voucher-types";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface LedgerDetailPageProps {
  params: Promise<{ ledgerId: string }>;
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

const natureColors: Record<string, string> = {
  assets: "bg-blue-50 text-blue-700 border-blue-200",
  liabilities: "bg-purple-50 text-purple-700 border-purple-200",
  income: "bg-green-50 text-green-700 border-green-200",
  expenses: "bg-orange-50 text-orange-700 border-orange-200",
};

export default async function LedgerDetailPage({
  params,
}: LedgerDetailPageProps) {
  const { ledgerId } = await params;
  const cookieStore = await cookies();
  const companyId = cookieStore.get("activeCompanyId")?.value;

  if (!companyId) {
    redirect("/company");
  }

  const company = await getCompanyWithDetails(companyId);
  if (!company || !company.currentFinancialYear) {
    redirect("/company");
  }

  const ledger = await getLedgerById(ledgerId);
  if (!ledger) {
    notFound();
  }

  const report = await getLedgerReport(
    ledgerId,
    companyId,
    company.currentFinancialYear.startDate,
    company.currentFinancialYear.endDate
  );

  const openingBal = Number(ledger.openingBalance ?? 0);
  const totalDebits = report?.entries
    .filter((e) => e.entryType === "debit")
    .reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const totalCredits = report?.entries
    .filter((e) => e.entryType === "credit")
    .reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const closingBalance = report?.closingBalance ?? 0;
  const closingType = report?.closingBalanceType ?? "Dr";

  // Party/Bank detail fields
  const hasPartyDetails = ledger.gstin || ledger.pan || ledger.address || ledger.phone || ledger.email;
  const hasBankDetails = ledger.bankName || ledger.accountNumber || ledger.ifscCode;
  const hasTaxDetails = ledger.taxType || ledger.taxRate;

  const recentEntries = report?.entries.slice(-5).reverse() ?? [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={ledger.name}
        breadcrumbs={[
          { label: "Ledgers", href: "/ledgers" },
          { label: ledger.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/reports/ledger/${ledger.id}`}>
                <FileText className="mr-2 h-4 w-4" />
                Full Report
              </Link>
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" disabled className="text-danger-600 border-danger-200 hover:bg-danger-50">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Header info */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className={natureColors[ledger.group?.nature ?? "assets"]}
          >
            {ledger.group?.name ?? "Unknown Group"}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {ledger.group?.nature ?? "assets"}
          </Badge>
          {!ledger.isActive && (
            <Badge variant="outline" className="bg-surface-100 text-surface-500">
              Inactive
            </Badge>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                Opening Balance
              </p>
              <p className="mt-1 font-mono tabular-nums text-lg font-bold text-surface-900">
                {formatCurrency(openingBal)}
                <span className="ml-1 text-xs font-medium text-surface-500">
                  {ledger.openingBalanceType === "credit" ? "Cr" : "Dr"}
                </span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success-500" />
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                  Total Debits
                </p>
              </div>
              <p className="mt-1 font-mono tabular-nums text-lg font-bold text-surface-900">
                {formatCurrency(totalDebits)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-danger-500" />
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                  Total Credits
                </p>
              </div>
              <p className="mt-1 font-mono tabular-nums text-lg font-bold text-surface-900">
                {formatCurrency(totalCredits)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-brand-200 bg-brand-50/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-brand-500" />
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                  Current Balance
                </p>
              </div>
              <p className="mt-1 font-mono tabular-nums text-lg font-bold text-brand-700">
                {formatCurrency(Math.abs(closingBalance))}
                <span className="ml-1 text-xs font-medium text-surface-500">
                  {closingType}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Party Details */}
          {hasPartyDetails && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-surface-400" />
                  Party Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  {ledger.address && (
                    <DetailRow
                      icon={MapPin}
                      label="Address"
                      value={`${ledger.address}${ledger.state ? `, ${ledger.state}` : ""}${ledger.pincode ? ` - ${ledger.pincode}` : ""}`}
                    />
                  )}
                  {ledger.phone && (
                    <DetailRow icon={Phone} label="Phone" value={ledger.phone} />
                  )}
                  {ledger.email && (
                    <DetailRow icon={Mail} label="Email" value={ledger.email} />
                  )}
                  {ledger.gstin && (
                    <DetailRow
                      label="GSTIN"
                      value={ledger.gstin}
                      mono
                    />
                  )}
                  {ledger.pan && (
                    <DetailRow label="PAN" value={ledger.pan} mono />
                  )}
                  {ledger.creditPeriodDays != null && (
                    <DetailRow
                      label="Credit Period"
                      value={`${ledger.creditPeriodDays} days`}
                    />
                  )}
                  {ledger.creditLimit && (
                    <DetailRow
                      label="Credit Limit"
                      value={formatCurrency(Number(ledger.creditLimit))}
                      mono
                    />
                  )}
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Bank Details */}
          {hasBankDetails && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-surface-400" />
                  Bank Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  {ledger.bankName && (
                    <DetailRow label="Bank Name" value={ledger.bankName} />
                  )}
                  {ledger.accountNumber && (
                    <DetailRow
                      label="Account Number"
                      value={ledger.accountNumber}
                      mono
                    />
                  )}
                  {ledger.ifscCode && (
                    <DetailRow
                      label="IFSC Code"
                      value={ledger.ifscCode}
                      mono
                    />
                  )}
                  {ledger.branchName && (
                    <DetailRow label="Branch" value={ledger.branchName} />
                  )}
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Tax Details */}
          {hasTaxDetails && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Tax Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  {ledger.taxType && (
                    <DetailRow label="Tax Type" value={ledger.taxType} />
                  )}
                  {ledger.taxRate && (
                    <DetailRow label="Tax Rate" value={`${ledger.taxRate}%`} mono />
                  )}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm">Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" className="text-brand-500" asChild>
              <Link href={`/reports/ledger/${ledger.id}`}>
                View Full Report
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentEntries.length === 0 ? (
              <div className="py-10 text-center text-sm text-surface-400">
                No transactions recorded yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-50">
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Voucher</TableHead>
                    <TableHead className="text-xs">Particulars</TableHead>
                    <TableHead className="text-xs text-right">Debit</TableHead>
                    <TableHead className="text-xs text-right">Credit</TableHead>
                    <TableHead className="text-xs text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEntries.map((entry) => {
                    const config = VOUCHER_TYPE_CONFIG[entry.voucherType];
                    return (
                      <TableRow key={entry.entryId}>
                        <TableCell className="text-xs text-surface-600">
                          {formatDate(entry.date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1 py-0 ${typeColorMap[entry.voucherType] ?? ""}`}
                            >
                              {config?.label ?? entry.voucherType}
                            </Badge>
                            <Link
                              href={`/vouchers/${entry.voucherId}`}
                              className="text-xs text-brand-600 hover:underline"
                            >
                              {entry.voucherNumber}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-surface-600 max-w-[200px] truncate">
                          {entry.counterpartLedgers.join(", ") || "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-xs">
                          {entry.entryType === "debit"
                            ? formatCurrency(entry.amount)
                            : ""}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-xs">
                          {entry.entryType === "credit"
                            ? formatCurrency(entry.amount)
                            : ""}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-xs">
                          {formatCurrency(Math.abs(entry.runningBalance))}{" "}
                          <span className="text-[10px] text-surface-400">
                            {entry.balanceType}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon?: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="h-4 w-4 text-surface-400 mt-0.5 shrink-0" />}
      <div className={!Icon ? "pl-7" : ""}>
        <dt className="text-xs text-surface-500">{label}</dt>
        <dd className={`text-sm text-surface-900 ${mono ? "font-mono" : ""}`}>
          {value}
        </dd>
      </div>
    </div>
  );
}
