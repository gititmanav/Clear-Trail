import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { getVouchersForCompany } from "@/queries/voucher";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { VoucherListClient } from "./voucher-list-client";

interface VouchersPageProps {
  searchParams: Promise<{
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function VouchersPage({ searchParams }: VouchersPageProps) {
  const cookieStore = await cookies();
  const companyId = cookieStore.get("activeCompanyId")?.value;

  if (!companyId) {
    redirect("/company");
  }

  const params = await searchParams;

  const result = await getVouchersForCompany(companyId, {
    type: params.type || undefined,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    search: params.search,
    page: params.page ? parseInt(params.page) : 1,
  });

  return (
    <div>
      <PageHeader
        title="Day Book"
        description="All voucher entries in one place"
        actions={
          <NewVoucherDropdown />
        }
      />

      {result.data.length === 0 && !params.type && !params.search ? (
        <EmptyState
          icon={BookOpen}
          title="No vouchers yet"
          description="Create your first voucher to start recording transactions."
          action={
            <NewVoucherDropdown />
          }
        />
      ) : (
        <VoucherListClient
          vouchers={result.data.map((v) => ({
            id: v.id,
            voucherNumber: v.voucherNumber,
            voucherType: v.voucherType,
            date: v.date,
            narration: v.narration ?? "",
            totalAmount: Number(v.totalAmount ?? 0),
            isCancelled: v.isCancelled ?? false,
            debitLedgers: v.entries
              .filter((e) => e.entryType === "debit")
              .map((e) => e.ledger?.name ?? "Unknown"),
            creditLedgers: v.entries
              .filter((e) => e.entryType === "credit")
              .map((e) => e.ledger?.name ?? "Unknown"),
          }))}
          pagination={result.pagination}
          currentType={params.type}
          currentSearch={params.search}
        />
      )}
    </div>
  );
}

function NewVoucherDropdown() {
  const types = [
    { label: "Purchase", href: "/vouchers/purchase/new", shortcut: "F9" },
    { label: "Sales", href: "/vouchers/sales/new", shortcut: "F8" },
    { label: "Payment", href: "/vouchers/payment/new", shortcut: "F5" },
    { label: "Receipt", href: "/vouchers/receipt/new", shortcut: "F6" },
    { label: "Contra", href: "/vouchers/contra/new", shortcut: "F4" },
    { label: "Journal", href: "/vouchers/journal/new", shortcut: "F7" },
    { label: "Credit Note", href: "/vouchers/credit-note/new", shortcut: "Ctrl+F8" },
    { label: "Debit Note", href: "/vouchers/debit-note/new", shortcut: "Ctrl+F9" },
  ];

  return (
    <div className="flex items-center gap-2">
      <Button asChild>
        <Link href="/vouchers/purchase/new">
          <Plus className="mr-2 h-4 w-4" />
          New Voucher
        </Link>
      </Button>
    </div>
  );
}
