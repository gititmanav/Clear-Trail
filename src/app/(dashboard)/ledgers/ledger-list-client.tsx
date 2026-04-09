"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Pencil, Trash2, List, Grid3X3 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { deleteLedger } from "@/actions/ledger";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface LedgerItem {
  id: string;
  name: string;
  groupName: string;
  groupNature: string;
  openingBalance: number;
  openingBalanceType: "debit" | "credit";
  isActive: boolean;
}

interface LedgerListClientProps {
  ledgers: LedgerItem[];
  companyId: string;
}

const natureColors: Record<string, string> = {
  assets: "bg-blue-50 text-blue-700",
  liabilities: "bg-purple-50 text-purple-700",
  income: "bg-green-50 text-green-700",
  expenses: "bg-orange-50 text-orange-700",
};

export function LedgerListClient({ ledgers, companyId }: LedgerListClientProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [groupFilter, setGroupFilter] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"flat" | "grouped">("flat");
  const [deleteTarget, setDeleteTarget] = React.useState<LedgerItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const filtered = React.useMemo(() => {
    return ledgers.filter((l) => {
      const matchesSearch =
        !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.groupName.toLowerCase().includes(search.toLowerCase());
      const matchesGroup =
        !groupFilter ||
        l.groupName.toLowerCase().includes(groupFilter.toLowerCase());
      return matchesSearch && matchesGroup;
    });
  }, [ledgers, search, groupFilter]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, LedgerItem[]>();
    for (const l of filtered) {
      if (!map.has(l.groupName)) {
        map.set(l.groupName, []);
      }
      map.get(l.groupName)!.push(l);
    }
    return map;
  }, [filtered]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteLedger(deleteTarget.id, companyId);
      if ("error" in result && result.error) {
        toast.error(String(result.error));
      } else {
        toast.success(`Ledger "${deleteTarget.name}" deleted`);
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete ledger");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }

  function renderTable(items: LedgerItem[], showGroup = true) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            {showGroup && <TableHead>Group</TableHead>}
            <TableHead className="text-right">Opening Balance</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((ledger) => (
            <TableRow key={ledger.id}>
              <TableCell>
                <Link
                  href={`/ledgers/${ledger.id}`}
                  className="font-medium text-surface-900 hover:text-brand-600 transition-colors"
                >
                  {ledger.name}
                </Link>
              </TableCell>
              {showGroup && (
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      natureColors[ledger.groupNature] || ""
                    )}
                  >
                    {ledger.groupName}
                  </Badge>
                </TableCell>
              )}
              <TableCell className="text-right font-mono tabular-nums text-sm">
                {ledger.openingBalance > 0 ? (
                  <span>
                    {formatCurrency(ledger.openingBalance)}{" "}
                    <span className="text-xs text-surface-400">
                      {ledger.openingBalanceType === "debit" ? "Dr" : "Cr"}
                    </span>
                  </span>
                ) : (
                  <span className="text-surface-300">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    asChild
                  >
                    <Link href={`/ledgers/${ledger.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-surface-400 hover:text-danger-600"
                    onClick={() => setDeleteTarget(ledger)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <Input
            placeholder="Search ledgers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-surface-200 p-0.5">
          <Button
            variant={viewMode === "flat" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode("flat")}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewMode === "grouped" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode("grouped")}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-surface-200 bg-white overflow-hidden">
        {viewMode === "flat" ? (
          renderTable(filtered)
        ) : (
          <div className="divide-y divide-surface-200">
            {Array.from(grouped.entries()).map(([groupName, items]) => (
              <div key={groupName}>
                <div className="bg-surface-50 px-4 py-2 text-xs font-semibold text-surface-600 uppercase tracking-wide">
                  {groupName}
                  <span className="ml-2 font-normal text-surface-400">
                    ({items.length})
                  </span>
                </div>
                {renderTable(items, false)}
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-surface-500">
            No ledgers found matching your search.
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ledger</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
              This action cannot be undone. If this ledger is used in any
              vouchers, deletion will be blocked.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
