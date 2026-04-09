"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LedgerSelect,
  type LedgerOption,
} from "@/components/shared/ledger-select";

export interface EntryRowData {
  id: string;
  ledgerId: string;
  ledgerName: string;
  entryType: "debit" | "credit";
  amount: string;
}

interface EntryRowProps {
  index: number;
  entry: EntryRowData;
  ledgers: LedgerOption[];
  canDelete: boolean;
  onUpdate: (field: keyof EntryRowData, value: string) => void;
  onDelete: () => void;
  onAmountKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCreateNewLedger?: () => void;
}

export function EntryRow({
  index,
  entry,
  ledgers,
  canDelete,
  onUpdate,
  onDelete,
  onAmountKeyDown,
  onCreateNewLedger,
}: EntryRowProps) {
  const hasDebit = entry.entryType === "debit" && entry.amount !== "";
  const hasCredit = entry.entryType === "credit" && entry.amount !== "";

  return (
    <tr className="group border-b border-surface-100 last:border-0">
      {/* Row index */}
      <td className="w-10 py-2 pl-3 pr-1 text-xs text-surface-400 tabular-nums">
        {index + 1}.
      </td>

      {/* Particulars (Ledger Select) */}
      <td className="py-2 px-2">
        <LedgerSelect
          ledgers={ledgers}
          value={entry.ledgerId}
          onChange={(id, name) => {
            onUpdate("ledgerId", id);
            onUpdate("ledgerName", name);
          }}
          placeholder="Select ledger..."
          onCreateNew={onCreateNewLedger}
          className="h-9 border-transparent bg-transparent hover:border-surface-300 focus-within:border-brand-500 shadow-none"
        />
      </td>

      {/* Debit amount */}
      <td className="w-40 py-2 px-2">
        <Input
          type="text"
          inputMode="decimal"
          placeholder={hasCredit ? "-" : "0.00"}
          value={entry.entryType === "debit" ? entry.amount : ""}
          disabled={hasCredit}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9.]/g, "");
            if (val === "") {
              onUpdate("amount", "");
              return;
            }
            onUpdate("entryType", "debit");
            onUpdate("amount", val);
          }}
          onKeyDown={onAmountKeyDown}
          className="h-9 text-right font-mono tabular-nums border-transparent bg-transparent hover:border-surface-300 focus:border-brand-500 shadow-none disabled:opacity-30"
        />
      </td>

      {/* Credit amount */}
      <td className="w-40 py-2 px-2">
        <Input
          type="text"
          inputMode="decimal"
          placeholder={hasDebit ? "-" : "0.00"}
          value={entry.entryType === "credit" ? entry.amount : ""}
          disabled={hasDebit}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9.]/g, "");
            if (val === "") {
              onUpdate("amount", "");
              return;
            }
            onUpdate("entryType", "credit");
            onUpdate("amount", val);
          }}
          onKeyDown={onAmountKeyDown}
          className="h-9 text-right font-mono tabular-nums border-transparent bg-transparent hover:border-surface-300 focus:border-brand-500 shadow-none disabled:opacity-30"
        />
      </td>

      {/* Delete button */}
      <td className="w-10 py-2 pr-3 pl-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!canDelete}
          onClick={onDelete}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-surface-400 hover:text-danger-600"
          tabIndex={-1}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  );
}
