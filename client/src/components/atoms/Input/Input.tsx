import { type InputHTMLAttributes, forwardRef } from "react";

/* ── Types ── */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Shows error styling */
  error?: boolean;
  /** Input size variant */
  inputSize?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "h-8 text-xs px-2.5",
  md: "h-10 text-sm px-3",
  lg: "h-12 text-base px-4",
} as const;

/* ── Component ── */

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, inputSize = "md", className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full rounded border bg-white
          text-surface-900 placeholder:text-surface-400
          transition-colors duration-200
          focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10
          disabled:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-70
          ${sizeStyles[inputSize]}
          ${error
            ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/10"
            : "border-surface-300 hover:border-surface-400"
          }
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export default Input;
