import { type ChangeEvent } from "react";
import { Search, X } from "lucide-react";

/* ── Types ── */

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: "sm" | "md";
  className?: string;
}

const sizeStyles = {
  sm: "h-8 text-xs pl-8 pr-8",
  md: "h-10 text-sm pl-10 pr-10",
} as const;

const iconSizeMap = {
  sm: 14,
  md: 16,
} as const;

const iconLeftPosition = {
  sm: "left-2.5",
  md: "left-3",
} as const;

const iconRightPosition = {
  sm: "right-2",
  md: "right-3",
} as const;

/* ── Component ── */

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  size = "md",
  className = "",
}: SearchBarProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
  }

  function handleClear() {
    onChange("");
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search icon */}
      <Search
        size={iconSizeMap[size]}
        className={`absolute ${iconLeftPosition[size]} top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none`}
      />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`
          w-full rounded border border-surface-300 bg-white
          text-surface-900 placeholder:text-surface-400
          transition-colors duration-200
          focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10
          hover:border-surface-400
          ${sizeStyles[size]}
        `}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={handleClear}
          className={`absolute ${iconRightPosition[size]} top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors`}
          aria-label="Clear search"
          type="button"
        >
          <X size={iconSizeMap[size]} />
        </button>
      )}
    </div>
  );
}
