"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EntryRow, type EntryRowData } from "./entry-row";
import { VoucherTotals } from "./voucher-totals";
import { createVoucher } from "@/actions/voucher";
import { VOUCHER_TYPE_CONFIG } from "@/lib/constants/voucher-types";
import type { LedgerOption } from "@/components/shared/ledger-select";

// ── Types ──────────────────────────────────────────────────────────

interface VoucherFormState {
  date: string;
  referenceNumber: string;
  narration: string;
  entries: EntryRowData[];
}

type VoucherFormAction =
  | { type: "ADD_ENTRY" }
  | { type: "REMOVE_ENTRY"; id: string }
  | {
      type: "UPDATE_ENTRY";
      id: string;
      field: keyof EntryRowData;
      value: string;
    }
  | { type: "SET_DATE"; date: string }
  | { type: "SET_FIELD"; field: "referenceNumber" | "narration"; value: string }
  | { type: "RESET" };

interface VoucherFormProps {
  voucherType: string;
  ledgers: LedgerOption[];
  onSuccess?: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function createEmptyEntry(entryType: "debit" | "credit" = "debit"): EntryRowData {
  return {
    id: generateId(),
    ledgerId: "",
    ledgerName: "",
    entryType,
    amount: "",
  };
}

function getDefaultDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getInitialState(): VoucherFormState {
  return {
    date: getDefaultDate(),
    referenceNumber: "",
    narration: "",
    entries: [createEmptyEntry("debit"), createEmptyEntry("credit")],
  };
}

// ── Reducer ────────────────────────────────────────────────────────

function reducer(
  state: VoucherFormState,
  action: VoucherFormAction
): VoucherFormState {
  switch (action.type) {
    case "ADD_ENTRY": {
      // Determine the entry type: if last entry was debit, add credit and vice versa
      const lastEntry = state.entries[state.entries.length - 1];
      const nextType = lastEntry?.entryType === "debit" ? "credit" : "debit";
      return {
        ...state,
        entries: [...state.entries, createEmptyEntry(nextType)],
      };
    }
    case "REMOVE_ENTRY":
      return {
        ...state,
        entries: state.entries.filter((e) => e.id !== action.id),
      };
    case "UPDATE_ENTRY":
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.id ? { ...e, [action.field]: action.value } : e
        ),
      };
    case "SET_DATE":
      return { ...state, date: action.date };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return getInitialState();
    default:
      return state;
  }
}

// ── Component ──────────────────────────────────────────────────────

export function VoucherForm({
  voucherType,
  ledgers,
  onSuccess,
}: VoucherFormProps) {
  const router = useRouter();
  const [state, dispatch] = React.useReducer(reducer, undefined, getInitialState);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [saveMode, setSaveMode] = React.useState<"save" | "saveNew">("save");

  const config = VOUCHER_TYPE_CONFIG[voucherType];

  // ── Computed values ──

  const totalDebit = state.entries.reduce(
    (sum, e) => (e.entryType === "debit" && e.amount ? sum + Number(e.amount) : sum),
    0
  );
  const totalCredit = state.entries.reduce(
    (sum, e) => (e.entryType === "credit" && e.amount ? sum + Number(e.amount) : sum),
    0
  );
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  // ── Auto-balance logic ──
  // If there's exactly one empty amount field and all others are filled, auto-calculate
  React.useEffect(() => {
    const filledEntries = state.entries.filter(
      (e) => e.ledgerId && e.amount && Number(e.amount) > 0
    );
    const emptyAmountEntries = state.entries.filter(
      (e) => e.ledgerId && !e.amount
    );

    if (emptyAmountEntries.length === 1 && filledEntries.length >= 1) {
      const emptyEntry = emptyAmountEntries[0];
      const debitSum = filledEntries
        .filter((e) => e.entryType === "debit")
        .reduce((s, e) => s + Number(e.amount), 0);
      const creditSum = filledEntries
        .filter((e) => e.entryType === "credit")
        .reduce((s, e) => s + Number(e.amount), 0);

      const diff = debitSum - creditSum;
      if (Math.abs(diff) > 0.001) {
        // Determine what the empty entry needs to be
        const neededType = diff > 0 ? "credit" : "debit";
        const neededAmount = Math.abs(diff).toFixed(2);

        dispatch({
          type: "UPDATE_ENTRY",
          id: emptyEntry.id,
          field: "entryType",
          value: neededType,
        });
        dispatch({
          type: "UPDATE_ENTRY",
          id: emptyEntry.id,
          field: "amount",
          value: neededAmount,
        });
      }
    }
  }, [state.entries]);

  // ── Keyboard shortcuts ──

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+Enter = Save
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit("save");
      }
      // Escape = Cancel
      if (e.key === "Escape") {
        e.preventDefault();
        router.back();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state, isSubmitting]);

  // ── Handlers ──

  function handleAmountKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      dispatch({ type: "ADD_ENTRY" });
      // Focus will naturally move to the new row
    }
  }

  async function handleSubmit(mode: "save" | "saveNew") {
    setSaveMode(mode);

    // Validation
    const validEntries = state.entries.filter(
      (e) => e.ledgerId && e.amount && Number(e.amount) > 0
    );

    if (validEntries.length < 2) {
      toast.error("At least 2 entries with ledger and amount are required");
      return;
    }

    if (!isBalanced) {
      toast.error("Total debits must equal total credits");
      return;
    }

    if (!state.date) {
      toast.error("Date is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createVoucher({
        voucherType: voucherType as "purchase" | "sales" | "payment" | "receipt" | "journal" | "contra" | "credit_note" | "debit_note",
        date: state.date,
        referenceNumber: state.referenceNumber || undefined,
        narration: state.narration || undefined,
        entries: validEntries.map((e) => ({
          ledgerId: e.ledgerId,
          entryType: e.entryType,
          amount: Number(e.amount).toFixed(2),
        })),
      });

      if ("error" in result && result.error) {
        const errors = result.error;
        const firstError =
          typeof errors === "object"
            ? Object.values(errors).flat()[0]
            : "Validation failed";
        toast.error(String(firstError));
        return;
      }

      if ("data" in result && result.data) {
        toast.success(
          `Voucher ${result.data.voucherNumber} created successfully`
        );

        if (mode === "saveNew") {
          dispatch({ type: "RESET" });
        } else {
          onSuccess?.();
          router.push("/vouchers");
        }
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create voucher"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top bar: Type badge, date, ref number */}
      <div className="flex items-center gap-4 rounded-lg border border-surface-200 bg-white p-4">
        <Badge
          className={cn("text-xs px-3 py-1", config?.color)}
          variant="secondary"
        >
          {config?.label || voucherType}
        </Badge>

        <div className="flex items-center gap-2">
          <Label htmlFor="voucher-date" className="text-xs text-surface-500">
            Date
          </Label>
          <Input
            id="voucher-date"
            type="date"
            value={state.date}
            onChange={(e) =>
              dispatch({ type: "SET_DATE", date: e.target.value })
            }
            className="h-9 w-40"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="ref-number" className="text-xs text-surface-500">
            Ref #
          </Label>
          <Input
            id="ref-number"
            value={state.referenceNumber}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "referenceNumber",
                value: e.target.value,
              })
            }
            placeholder="Optional"
            className="h-9 w-36"
          />
        </div>

        <div className="ml-auto text-xs text-surface-400">
          <kbd className="rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-[10px]">
            Ctrl+Enter
          </kbd>{" "}
          to save
        </div>
      </div>

      {/* Entry table */}
      <div className="rounded-lg border border-surface-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50">
              <th className="w-10 py-2.5 pl-3 pr-1 text-left text-xs font-medium text-surface-500">
                #
              </th>
              <th className="py-2.5 px-2 text-left text-xs font-medium text-surface-500">
                Particulars
              </th>
              <th className="w-40 py-2.5 px-2 text-right text-xs font-medium text-surface-500">
                Debit (&#8377;)
              </th>
              <th className="w-40 py-2.5 px-2 text-right text-xs font-medium text-surface-500">
                Credit (&#8377;)
              </th>
              <th className="w-10 py-2.5 pr-3 pl-1" />
            </tr>
          </thead>
          <tbody>
            {state.entries.map((entry, idx) => (
              <EntryRow
                key={entry.id}
                index={idx}
                entry={entry}
                ledgers={ledgers}
                canDelete={state.entries.length > 2}
                onUpdate={(field, value) =>
                  dispatch({
                    type: "UPDATE_ENTRY",
                    id: entry.id,
                    field,
                    value,
                  })
                }
                onDelete={() =>
                  dispatch({ type: "REMOVE_ENTRY", id: entry.id })
                }
                onAmountKeyDown={handleAmountKeyDown}
                onCreateNewLedger={() => router.push("/ledgers/new")}
              />
            ))}
          </tbody>
        </table>

        {/* Add row button */}
        <div className="border-t border-surface-100 p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: "ADD_ENTRY" })}
            className="text-xs text-surface-500 hover:text-surface-900"
          >
            + Add Entry
          </Button>
        </div>
      </div>

      {/* Totals bar */}
      <VoucherTotals totalDebit={totalDebit} totalCredit={totalCredit} />

      {/* Narration */}
      <div className="space-y-2">
        <Label htmlFor="narration" className="text-xs text-surface-500">
          Narration
        </Label>
        <textarea
          id="narration"
          value={state.narration}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "narration",
              value: e.target.value,
            })
          }
          placeholder="Add notes about this voucher..."
          rows={2}
          className="flex w-full rounded-md border border-surface-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 resize-none"
        />
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-end gap-3 rounded-lg border border-surface-200 bg-surface-50 p-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
          <kbd className="ml-2 text-[10px] text-surface-400">Esc</kbd>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSubmit("saveNew")}
          disabled={isSubmitting || !isBalanced}
        >
          {isSubmitting && saveMode === "saveNew" && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save & New
        </Button>
        <Button
          type="button"
          onClick={() => handleSubmit("save")}
          disabled={isSubmitting || !isBalanced}
        >
          {isSubmitting && saveMode === "save" && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Voucher
        </Button>
      </div>
    </div>
  );
}
