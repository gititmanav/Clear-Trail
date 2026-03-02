import Select, { type SelectOption } from "@atoms/Select";

/* ── Types ── */

interface DropdownFilterProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** Include an "All" option at the top */
  allOption?: boolean;
  allLabel?: string;
  size?: "sm" | "md";
  className?: string;
}

/* ── Component ── */

export default function DropdownFilter({
  label,
  value,
  options,
  onChange,
  allOption = true,
  allLabel = "All",
  size = "sm",
  className = "",
}: DropdownFilterProps) {
  const fullOptions: SelectOption[] = allOption
    ? [{ value: "", label: allLabel }, ...options]
    : options;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-xs font-medium text-surface-500 whitespace-nowrap">
        {label}
      </label>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={fullOptions}
        selectSize={size}
        placeholder=""
        className="w-auto min-w-[120px]"
      />
    </div>
  );
}
