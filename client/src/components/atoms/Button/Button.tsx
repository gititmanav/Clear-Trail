import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

/* ── Variant Maps ── */

const variantStyles = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 focus-visible:ring-brand-200",
  secondary:
    "bg-surface-100 text-surface-800 hover:bg-surface-200 active:bg-surface-300 focus-visible:ring-surface-200",
  danger:
    "bg-danger-500 text-white hover:bg-danger-700 active:bg-danger-700 focus-visible:ring-danger-50",
  ghost:
    "bg-transparent text-surface-600 hover:bg-surface-100 hover:text-surface-900 focus-visible:ring-surface-200",
  outline:
    "bg-transparent text-surface-800 border border-surface-300 hover:bg-surface-50 hover:border-surface-400 focus-visible:ring-surface-200",
  success:
    "bg-success-500 text-white hover:bg-success-700 active:bg-success-700 focus-visible:ring-success-50",
} as const;

const sizeStyles = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-sm",
  md: "h-10 px-4 text-sm gap-2 rounded",
  lg: "h-12 px-6 text-base gap-2.5 rounded-md",
} as const;

/* ── Types ── */

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

/* ── Component ── */

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2
          size={size === "sm" ? 14 : size === "lg" ? 20 : 16}
          className="animate-spin"
        />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
