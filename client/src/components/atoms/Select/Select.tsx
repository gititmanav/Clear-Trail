import { type SelectHTMLAttributes, forwardRef } from "react";

/* ── Types ── */

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
  selectSize?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "h-8 text-xs px-2.5",
  md: "h-10 text-sm px-3",
  lg: "h-12 text-base px-4",
} as const;

/* ── Component ── */

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      placeholder = "Select...",
      error = false,
      selectSize = "md",
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <select
        ref={ref}
        className={`
          w-full rounded border bg-white appearance-none
          text-surface-900
          transition-colors duration-200
          focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10
          disabled:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-70
          bg-[url("data:image/svg+xml,%3csvg_xmlns='http://www.w3.org/2000/svg'_fill='none'_viewBox='0_0_20_20'%3e%3cpath_stroke='%239E9E9E'_stroke-linecap='round'_stroke-linejoin='round'_stroke-width='1.5'_d='M6_8l4_4_4-4'/%3e%3c/svg%3e")]
          bg-[length:16px] bg-[right_10px_center] bg-no-repeat pr-9
          ${sizeStyles[selectSize]}
          ${error
            ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/10"
            : "border-surface-300 hover:border-surface-400"
          }
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = "Select";
export default Select;
export type { SelectProps };
