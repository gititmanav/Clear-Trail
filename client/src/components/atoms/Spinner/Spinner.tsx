import { Loader2 } from "lucide-react";

/* ── Types ── */

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  /** Centers the spinner in its parent container */
  centered?: boolean;
  /** Optional label for accessibility */
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 36,
} as const;

/* ── Component ── */

export default function Spinner({
  size = "md",
  centered = false,
  label = "Loading",
  className = "",
}: SpinnerProps) {
  const spinner = (
    <Loader2
      size={sizeMap[size]}
      className={`animate-spin text-brand-500 ${className}`}
      aria-label={label}
    />
  );

  if (centered) {
    return (
      <div className="flex-center w-full py-12" role="status">
        {spinner}
      </div>
    );
  }

  return <span role="status">{spinner}</span>;
}
