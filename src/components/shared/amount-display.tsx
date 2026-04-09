import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface AmountDisplayProps {
  amount: number;
  type?: "debit" | "credit";
  showSuffix?: boolean;
  className?: string;
}

export function AmountDisplay({
  amount,
  type,
  showSuffix = false,
  className,
}: AmountDisplayProps) {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = formatCurrency(absAmount);

  // Determine color: credit/income = success, debit/expense = default, negative = danger
  const colorClass = isNegative
    ? "text-danger-600"
    : type === "credit"
      ? "text-success-600"
      : "text-surface-900";

  const suffix =
    showSuffix && type ? (type === "debit" ? " Dr" : " Cr") : "";

  return (
    <span
      className={cn(
        "font-mono tabular-nums text-sm",
        colorClass,
        className
      )}
    >
      {formatted}
      {suffix && (
        <span className="ml-1 text-xs font-medium text-surface-500">
          {suffix.trim()}
        </span>
      )}
    </span>
  );
}
