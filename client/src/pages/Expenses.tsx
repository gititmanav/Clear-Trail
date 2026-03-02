import { useState } from "react";
import toast from "react-hot-toast";
import TransactionTable from "@organisms/TransactionTable/TransactionTable";
import TransactionForm, { type TransactionFormData } from "@organisms/TransactionForm/TransactionForm";
import { transactionApi, type Transaction } from "@api/transactionApi";

export default function Expenses() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(transaction: Transaction) {
    setEditing(transaction);
    setFormOpen(true);
  }

  async function handleSubmit(data: TransactionFormData) {
    const payload = {
      type: data.type as "income" | "expense",
      amount: parseFloat(data.amount),
      category: data.category,
      description: data.description,
      date: data.date,
    };

    if (editing) {
      await transactionApi.update(editing._id, payload);
      toast.success("Transaction updated");
    } else {
      await transactionApi.create({ ...payload, userId: "" });
      toast.success("Transaction created");
    }

    setRefreshKey((k) => k + 1);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="text-page-title">Expenses</h1>
        <p className="text-page-subtitle">Track all outgoing payments</p>
      </div>

      <TransactionTable
        type="expense"
        onAdd={handleAdd}
        onEdit={handleEdit}
        refreshKey={refreshKey}
      />

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        lockedType="expense"
        initial={
          editing
            ? {
                type: editing.type,
                amount: String(editing.amount),
                category: editing.category,
                description: editing.description,
                date: editing.date.split("T")[0]!,
              }
            : undefined
        }
      />
    </div>
  );
}
