import { type ButtonHTMLAttributes, type ReactNode } from "react";

/* ── Variant Maps ── */

const variantStyles = {
  default:
    "text-surface-500 hover:bg-surface-100 hover:text-surface-700",
  danger:
    "text-surface-500 hover:bg-danger-50 hover:text-danger-500",
  brand:
    "text-surface-500 hover:bg-brand-50 hover:text-brand-600",
  ghost:
    "text-surface-400 hover:text-surface-600",
} as const;

const sizeStyles = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-11 h-11",
} as const;

/* ── Types ── */

export type IconButtonVariant = keyof typeof variantStyles;
export type IconButtonSize = keyof typeof sizeStyles;

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Required for accessibility */
  "aria-label": string;
}

/* ── Component ── */

export default function IconButton({
  icon,
  variant = "default",
  size = "md",
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-md
        transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
}
