import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import IconButton from "@atoms/IconButton";

/* ── Types ── */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Modal width */
  size?: "sm" | "md" | "lg";
  /** Footer with action buttons */
  footer?: ReactNode;
  children: ReactNode;
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

/* ── Component ── */

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  footer,
  children,
}: ModalProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="overlay animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex-center p-4 pointer-events-none">
        <div
          className={`
            bg-white rounded-lg shadow-modal w-full pointer-events-auto
            animate-slide-up flex flex-col max-h-[85vh]
            ${sizeStyles[size]}
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex-between px-6 py-4 border-b border-surface-200 flex-shrink-0">
            <div>
              <h2
                id="modal-title"
                className="text-lg font-semibold text-surface-900"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-surface-500 mt-0.5">{subtitle}</p>
              )}
            </div>
            <IconButton
              icon={<X size={18} />}
              variant="default"
              size="sm"
              aria-label="Close modal"
              onClick={onClose}
            />
          </div>

          {/* Body */}
          <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-surface-200 flex-row-gap justify-end flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
