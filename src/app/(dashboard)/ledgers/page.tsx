import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, BookOpen, Search } from "lucide-react";
import { getLedgersForCompany } from "@/queries/ledger";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { LedgerListClient } from "./ledger-list-client";

export default async function LedgersPage() {
  const cookieStore = await cookies();
  const companyId = cookieStore.get("activeCompanyId")?.value;

  if (!companyId) {
    redirect("/company");
  }

  const ledgers = await getLedgersForCompany(companyId);

  return (
    <div>
      <PageHeader
        title="Ledgers"
        description="Manage all your ledger accounts"
        actions={
          <Button asChild>
            <Link href="/ledgers/new">
              <Plus className="mr-2 h-4 w-4" />
              New Ledger
            </Link>
          </Button>
        }
      />

      {ledgers.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No ledgers yet"
          description="Create your first ledger to start recording transactions. Ledgers represent accounts like Cash, Bank, Suppliers, Customers, etc."
          action={
            <Button asChild>
              <Link href="/ledgers/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Ledger
              </Link>
            </Button>
          }
        />
      ) : (
        <LedgerListClient
          ledgers={ledgers.map((l) => ({
            id: l.id,
            name: l.name,
            groupName: l.group?.name ?? "Unknown",
            groupNature: l.group?.nature ?? "assets",
            openingBalance: Number(l.openingBalance ?? 0),
            openingBalanceType: (l.openingBalanceType ?? "debit") as "debit" | "credit",
            isActive: l.isActive ?? true,
          }))}
          companyId={companyId}
        />
      )}
    </div>
  );
}
