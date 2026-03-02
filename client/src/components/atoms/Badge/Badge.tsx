import type { ReactNode } from "react";

/* ── Variant Maps ── */

const variantStyles = {
  default: "bg-surface-100 text-surface-700",
  brand: "bg-brand-50 text-brand-700",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  danger: "bg-danger-50 text-danger-700",
  income: "bg-success-50 text-success-700",
  expense: "bg-danger-50 text-danger-700",
} as const;

const sizeStyles = {
  sm: "text-2xs px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
  lg: "text-sm px-2.5 py-1",
} as const;

/* ── Types ── */

export type BadgeVariant = keyof typeof variantStyles;
export type BadgeSize = keyof typeof sizeStyles;

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Optional dot indicator before text */
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

/* ── Component ── */

export default function Badge({
  variant = "default",
  size = "md",
  dot = false,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-full whitespace-nowrap
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      )}
      {children}
    </span>
  );
}
