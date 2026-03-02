/* ── Types ── */

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "w-7 h-7 text-2xs",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
} as const;

/**
 * Generates a consistent background color from a name string.
 * Same name always produces the same color.
 */
function getColorFromName(name: string): string {
  const colors = [
    "bg-brand-100 text-brand-700",
    "bg-success-50 text-success-700",
    "bg-warning-50 text-warning-700",
    "bg-danger-50 text-danger-700",
    "bg-purple-100 text-purple-700",
    "bg-teal-100 text-teal-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length]!;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ── Component ── */

export default function Avatar({
  name,
  src,
  size = "md",
  className = "",
}: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`
          rounded-full object-cover flex-shrink-0
          ${sizeStyles[size]}
          ${className}
        `}
      />
    );
  }

  return (
    <div
      className={`
        rounded-full flex-center font-semibold flex-shrink-0 select-none
        ${sizeStyles[size]}
        ${getColorFromName(name)}
        ${className}
      `}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
