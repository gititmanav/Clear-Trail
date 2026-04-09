"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCompany } from "@/components/providers/company-provider";
import { VOUCHER_TYPE_CONFIG } from "@/lib/constants/voucher-types";
import { getLedgersForVoucher } from "@/queries/ledger";
import { VoucherForm } from "@/components/voucher/voucher-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { LedgerOption } from "@/components/shared/ledger-select";

interface NewVoucherWrapperProps {
  voucherType: string;
}

export function NewVoucherWrapper({ voucherType }: NewVoucherWrapperProps) {
  const { activeCompanyId } = useCompany();
  const [debitLedgers, setDebitLedgers] = React.useState<LedgerOption[]>([]);
  const [creditLedgers, setCreditLedgers] = React.useState<LedgerOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const config = VOUCHER_TYPE_CONFIG[voucherType];

  React.useEffect(() => {
    if (!activeCompanyId) return;

    async function loadLedgers() {
      setIsLoading(true);
      try {
        // We need to fetch ledgers for both sides
        // Since getLedgersForVoucher is a server-only query, we'll use an API approach
        // For now, use the action-based approach by fetching all ledgers
        const response = await fetch(
          `/api/ledgers?companyId=${activeCompanyId}&voucherType=${voucherType}`
        );
        if (response.ok) {
          const data = await response.json();
          setDebitLedgers(data.debit ?? []);
          setCreditLedgers(data.credit ?? []);
        }
      } catch {
        // Fallback: empty ledgers, user can still type
      } finally {
        setIsLoading(false);
      }
    }

    loadLedgers();
  }, [activeCompanyId, voucherType]);

  // Combine both sides for the form, removing duplicates
  const allLedgers = React.useMemo(() => {
    const map = new Map<string, LedgerOption>();
    for (const l of debitLedgers) map.set(l.id, l);
    for (const l of creditLedgers) map.set(l.id, l);
    return Array.from(map.values());
  }, [debitLedgers, creditLedgers]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vouchers">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h2 className="font-display text-2xl font-bold text-surface-900">
            New {config?.label ?? voucherType} Voucher
          </h2>
          <p className="mt-0.5 text-sm text-surface-500">
            {config?.description ?? "Create a new voucher entry"}
            {config?.shortcut && (
              <span className="ml-2 text-surface-400">
                (
                <kbd className="rounded border border-surface-200 bg-surface-50 px-1 py-0.5 font-mono text-[10px]">
                  {config.shortcut}
                </kbd>
                )
              </span>
            )}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <VoucherForm voucherType={voucherType} ledgers={allLedgers} />
      )}
    </div>
  );
}
