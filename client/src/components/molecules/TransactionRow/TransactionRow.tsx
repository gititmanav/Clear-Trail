import { Pencil, Trash2 } from "lucide-react";
import Badge from "@atoms/Badge";
import IconButton from "@atoms/IconButton";
import { formatCurrency } from "@utils/formatCurrency";
import { formatDate } from "@utils/formatDate";

/* ── Types ── */

interface TransactionRowProps {
  _id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  user?: { name: string; email: string };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

/* ── Component ── */

export default function TransactionRow({
  _id,
  type,
  amount,
  category,
  description,
  date,
  user,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  return (
    <tr className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
      {/* Date */}
      <td className="cell-padding text-sm text-surface-700 whitespace-nowrap">
        {formatDate(date)}
      </td>

      {/* Type */}
      <td className="cell-padding">
        <Badge variant={type} size="sm" dot>
          {type === "income" ? "Income" : "Expense"}
        </Badge>
      </td>

      {/* Category */}
      <td className="cell-padding text-sm text-surface-700">{category}</td>

      {/* Description */}
      <td className="cell-padding text-sm text-surface-600 text-truncate max-w-[200px]">
        {description || "—"}
      </td>

      {/* User */}
      <td className="cell-padding text-sm text-surface-600">
        {user?.name || "—"}
      </td>

      {/* Amount */}
      <td
        className={`cell-padding text-sm font-medium text-currency text-right whitespace-nowrap ${
          type === "income" ? "text-success-700" : "text-danger-700"
        }`}
      >
        {type === "income" ? "+" : "−"}{formatCurrency(amount)}
      </td>

      {/* Actions */}
      <td className="cell-padding">
        <div className="flex-row-gap justify-end" style={{ gap: "0.25rem" }}>
          <IconButton
            icon={<Pencil size={15} />}
            variant="brand"
            size="sm"
            aria-label={`Edit transaction: ${category}`}
            onClick={() => onEdit(_id)}
          />
          <IconButton
            icon={<Trash2 size={15} />}
            variant="danger"
            size="sm"
            aria-label={`Delete transaction: ${category}`}
            onClick={() => onDelete(_id)}
          />
        </div>
      </td>
    </tr>
  );
}
