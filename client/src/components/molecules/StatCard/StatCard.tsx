import type { ReactNode } from "react";

/* ── Types ── */

type StatTrend = "up" | "down" | "neutral";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  /** Optional trend indicator */
  trend?: {
    direction: StatTrend;
    text: string;
  };
  className?: string;
}

const trendStyles: Record<StatTrend, string> = {
  up: "text-success-500",
  down: "text-danger-500",
  neutral: "text-surface-500",
};

const trendArrows: Record<StatTrend, string> = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

/* ── Component ── */

export default function StatCard({
  label,
  value,
  icon,
  trend,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-card card-padding
        flex items-start justify-between
        transition-shadow hover:shadow-dropdown
        ${className}
      `}
    >
      <div className="flex-stack" style={{ gap: "0.25rem" }}>
        <p className="text-label text-surface-500">{label}</p>
        <p className="text-2xl font-semibold text-surface-900 text-currency">
          {value}
        </p>
        {trend && (
          <p className={`text-xs font-medium ${trendStyles[trend.direction]}`}>
            {trendArrows[trend.direction]} {trend.text}
          </p>
        )}
      </div>

      <div className="p-2 rounded-lg bg-brand-50 text-brand-500 flex-shrink-0">
        {icon}
      </div>
    </div>
  );
}
