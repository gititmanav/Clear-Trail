"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ShortcutMap {
  [key: string]: {
    handler: () => void;
    description: string;
  };
}

export function useKeyboardShortcuts({
  onToggleCommandPalette,
  onShowShortcuts,
}: {
  onToggleCommandPalette?: () => void;
  onShowShortcuts?: () => void;
} = {}) {
  const router = useRouter();

  useEffect(() => {
    const shortcuts: ShortcutMap = {
      F4: {
        handler: () => router.push("/vouchers/contra/new"),
        description: "New Contra Voucher",
      },
      F5: {
        handler: () => router.push("/vouchers/payment/new"),
        description: "New Payment Voucher",
      },
      F6: {
        handler: () => router.push("/vouchers/receipt/new"),
        description: "New Receipt Voucher",
      },
      F7: {
        handler: () => router.push("/vouchers/journal/new"),
        description: "New Journal Voucher",
      },
      F8: {
        handler: () => router.push("/vouchers/sales/new"),
        description: "New Sales Voucher",
      },
      F9: {
        handler: () => router.push("/vouchers/purchase/new"),
        description: "New Purchase Voucher",
      },
    };

    function handleKeyDown(event: KeyboardEvent) {
      // Skip if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        // Allow Ctrl+K even in inputs
        if (!(event.ctrlKey && event.key === "k")) {
          return;
        }
      }

      // Ctrl+K / Cmd+K -> Command palette
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        onToggleCommandPalette?.();
        return;
      }

      // ? -> Show shortcuts overlay
      if (event.key === "?" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onShowShortcuts?.();
        return;
      }

      // Function key shortcuts
      const shortcut = shortcuts[event.key];
      if (shortcut && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        shortcut.handler();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, onToggleCommandPalette, onShowShortcuts]);
}
