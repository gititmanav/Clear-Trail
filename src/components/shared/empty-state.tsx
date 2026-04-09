import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-surface-300 bg-surface-50/50 px-6 py-16 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-100">
        <Icon className="h-6 w-6 text-surface-400" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-surface-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-surface-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
