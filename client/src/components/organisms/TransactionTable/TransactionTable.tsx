import { useState, useEffect, useCallback } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@atoms/Button";
import Spinner from "@atoms/Spinner";
import SearchBar from "@molecules/SearchBar/SearchBar";
import DropdownFilter from "@molecules/DropdownFilter/DropdownFilter";
import TransactionRow from "@molecules/TransactionRow/TransactionRow";
import EmptyState from "@molecules/EmptyState/EmptyState";
import ConfirmDialog from "@molecules/ConfirmDialog/ConfirmDialog";
import { transactionApi, type Transaction, type TransactionFilters } from "@api/transactionApi";
import { useDebounce } from "@hooks/useDebounce";
import { formatCurrency } from "@utils/formatCurrency";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, DEFAULT_PAGE_SIZE } from "@utils/constants";

/* ── Types ── */

interface TransactionTableProps {
  /** Filters to only income or expense */
  type: "income" | "expense";
  /** Callback to open the create/edit form */
  onAdd: () => void;
  onEdit: (transaction: Transaction) => void;
  /** Incremented externally to trigger a refetch */
  refreshKey?: number;
}

/* ── Component ── */

export default function TransactionTable({
  type,
  onAdd,
  onEdit,
  refreshKey = 0,
}: TransactionTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categories =
    type === "income"
      ? INCOME_CATEGORIES.map((c) => ({ value: c, label: c }))
      : EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }));

  // Fetch transactions
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: TransactionFilters = {
        type,
        page,
        limit: DEFAULT_PAGE_SIZE,
        sortBy: "date",
        sortOrder: "desc",
      };
      if (debouncedSearch) filters.search = debouncedSearch;
      if (category) filters.category = category;

      const data = await transactionApi.getAll(filters);
      setTransactions(data.transactions);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch {
      // Error handled by axios interceptor
    } finally {
      setLoading(false);
    }
  }, [type, page, debouncedSearch, category, refreshKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  // Delete handler
  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await transactionApi.delete(deleteId);
      setDeleteId(null);
      fetchData();
    } finally {
      setDeleting(false);
    }
  }

  // Calculate running total for current page
  const pageTotal = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-white rounded-lg shadow-card">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-surface-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={`Search ${type}...`}
            className="flex-1 max-w-xs"
          />

          <DropdownFilter
            label="Category"
            value={category}
            options={categories}
            onChange={setCategory}
          />

          <div className="sm:ml-auto">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={16} />}
              onClick={onAdd}
            >
              Add {type === "income" ? "Income" : "Expense"}
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner centered />
      ) : transactions.length === 0 ? (
        <EmptyState
          title={`No ${type} transactions found`}
          description={
            search || category
              ? "Try adjusting your search or filters"
              : `Start by adding your first ${type} transaction`
          }
          actionLabel={!search && !category ? `Add ${type}` : undefined}
          onAction={!search && !category ? onAdd : undefined}
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50">
                  <th className="cell-padding text-label text-left">Date</th>
                  <th className="cell-padding text-label text-left">Type</th>
                  <th className="cell-padding text-label text-left">Category</th>
                  <th className="cell-padding text-label text-left">Description</th>
                  <th className="cell-padding text-label text-left">User</th>
                  <th className="cell-padding text-label text-right">Amount</th>
                  <th className="cell-padding text-label text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <TransactionRow
                    key={t._id}
                    {...t}
                    user={t.userId as unknown as { name: string; email: string }}
                    onEdit={() => onEdit(t)}
                    onDelete={(id) => setDeleteId(id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer: totals + pagination */}
          <div className="px-5 py-3 border-t border-surface-100 flex-between">
            <div className="flex-row-gap text-xs text-surface-500">
              <span>{total} record{total !== 1 ? "s" : ""}</span>
              <span className="divider-vertical h-3" />
              <span className="font-medium text-surface-700">
                Page total: {formatCurrency(pageTotal)}
              </span>
            </div>

            <div className="flex-row-gap" style={{ gap: "0.5rem" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded text-surface-500 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-surface-600 min-w-[60px] text-center">
                {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded text-surface-500 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Transaction"
        message="This action cannot be undone. Are you sure you want to delete this transaction?"
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
