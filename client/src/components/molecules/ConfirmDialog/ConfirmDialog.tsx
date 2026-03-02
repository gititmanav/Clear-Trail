import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@atoms/Button";

/* ── Types ── */

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const iconStyles = {
  danger: "bg-danger-50 text-danger-500",
  warning: "bg-warning-50 text-warning-500",
} as const;

/* ── Component ── */

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="overlay animate-fade-in" onClick={onCancel} />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex-center p-4">
        <div
          className="bg-white rounded-lg shadow-modal w-full max-w-sm p-6 animate-slide-up"
          role="alertdialog"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-message"
        >
          {/* Icon */}
          <div className={`w-10 h-10 rounded-full flex-center mb-4 ${iconStyles[variant]}`}>
            <AlertTriangle size={20} />
          </div>

          {/* Content */}
          <h3
            id="confirm-title"
            className="text-lg font-semibold text-surface-900 mb-1"
          >
            {title}
          </h3>
          <p
            id="confirm-message"
            className="text-sm text-surface-500 mb-6"
          >
            {message}
          </p>

          {/* Actions */}
          <div className="flex-row-gap justify-end">
            <Button
              variant="secondary"
              autoFocus
              size="sm"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={variant === "danger" ? "danger" : "primary"}
              size="sm"
              onClick={onConfirm}
              loading={loading}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
