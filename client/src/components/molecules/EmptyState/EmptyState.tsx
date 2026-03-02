import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import Button from "@atoms/Button";

/* ── Types ── */

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/* ── Component ── */

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex-center py-16 ${className}`}>
      <div className="text-center max-w-xs">
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-surface-100 flex-center mx-auto mb-4 text-surface-400">
          {icon || <Inbox size={24} />}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-surface-900 mb-1">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-xs text-surface-500 mb-5 leading-relaxed">
            {description}
          </p>
        )}

        {/* CTA */}
        {actionLabel && onAction && (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
