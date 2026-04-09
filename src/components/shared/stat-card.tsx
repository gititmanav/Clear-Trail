import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    direction: "up" | "down";
    percentage: number;
  };
  variant?: "default" | "success" | "danger" | "warning" | "brand";
  className?: string;
}

const variantStyles: Record<string, { iconBg: string; iconColor: string }> = {
  default: {
    iconBg: "bg-surface-100",
    iconColor: "text-surface-500",
  },
  success: {
    iconBg: "bg-success-50",
    iconColor: "text-success-600",
  },
  danger: {
    iconBg: "bg-danger-50",
    iconColor: "text-danger-600",
  },
  warning: {
    iconBg: "bg-warning-50",
    iconColor: "text-warning-600",
  },
  brand: {
    iconBg: "bg-brand-50",
    iconColor: "text-brand-600",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-surface-500">{title}</p>
          <p className="text-2xl font-bold text-surface-900 font-mono tabular-nums">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            styles.iconBg
          )}
        >
          <Icon className={cn("h-5 w-5", styles.iconColor)} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          {trend.direction === "up" ? (
            <TrendingUp className="h-3.5 w-3.5 text-success-600" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-danger-600" />
          )}
          <span
            className={cn(
              "font-medium",
              trend.direction === "up"
                ? "text-success-600"
                : "text-danger-600"
            )}
          >
            {trend.percentage}%
          </span>
          <span className="text-surface-400">vs last period</span>
        </div>
      )}
    </Card>
  );
}
