import { useState, useEffect, type FormEvent } from "react";
import Modal from "@organisms/Modal/Modal";
import Button from "@atoms/Button";
import Select from "@atoms/Select";
import FormField from "@molecules/FormField/FormField";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@utils/constants";

/* ── Types ── */

export interface TransactionFormData {
  type: "income" | "expense";
  amount: string;
  category: string;
  description: string;
  date: string;
}

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  /** If provided, form is in edit mode */
  initial?: TransactionFormData;
  /** Lock the type (used when opened from Income or Expenses page) */
  lockedType?: "income" | "expense";
}

const EMPTY_FORM: TransactionFormData = {
  type: "income",
  amount: "",
  category: "",
  description: "",
  date: new Date().toISOString().split("T")[0]!,
};

/* ── Component ── */

export default function TransactionForm({
  open,
  onClose,
  onSubmit,
  initial,
  lockedType,
}: TransactionFormProps) {
  const [form, setForm] = useState<TransactionFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof TransactionFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const isEdit = !!initial;

  // Populate form when editing or when type is locked
  useEffect(() => {
    if (open) {
      if (initial) {
        setForm(initial);
      } else {
        setForm({
          ...EMPTY_FORM,
          type: lockedType || "income",
        });
      }
      setErrors({});
    }
  }, [open, initial, lockedType]);

  const categories =
    form.type === "income"
      ? INCOME_CATEGORIES.map((c) => ({ value: c, label: c }))
      : EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }));

  function updateField<K extends keyof TransactionFormData>(
    key: K,
    value: TransactionFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (!form.amount || parseFloat(form.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!form.category) {
      newErrors.category = "Category is required";
    }
    if (!form.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Transaction" : "New Transaction"}
      subtitle={isEdit ? "Update the transaction details" : "Record a new transaction"}
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={loading}
            onClick={handleSubmit}
          >
            {isEdit ? "Update" : "Create"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Type toggle — hidden if locked */}
        {!lockedType && (
          <FormField label="Type">
            <div className="flex gap-2">
              {(["income", "expense"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    updateField("type", t);
                    updateField("category", "");
                  }}
                  className={`
                    flex-1 h-10 rounded text-sm font-medium transition-colors
                    ${form.type === t
                      ? t === "income"
                        ? "bg-success-50 text-success-700 border border-success-500"
                        : "bg-danger-50 text-danger-700 border border-danger-500"
                      : "bg-surface-50 text-surface-500 border border-surface-200 hover:bg-surface-100"
                    }
                  `}
                >
                  {t === "income" ? "Income" : "Expense"}
                </button>
              ))}
            </div>
          </FormField>
        )}

        {/* Amount */}
        <FormField
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => updateField("amount", e.target.value)}
          error={errors.amount}
          required
        />

        {/* Category */}
        <FormField label="Category" error={errors.category} required>
          <Select
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            options={categories}
            placeholder="Select category..."
            error={!!errors.category}
          />
        </FormField>

        {/* Date */}
        <FormField
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => updateField("date", e.target.value)}
          error={errors.date}
          required
        />

        {/* Description */}
        <FormField
          label="Description"
          placeholder="Optional note about this transaction"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          hint="Max 300 characters"
          maxLength={300}
        />
      </form>
    </Modal>
  );
}
