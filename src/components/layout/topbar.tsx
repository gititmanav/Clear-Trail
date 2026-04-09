"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Sun,
  Moon,
  Plus,
  ChevronRight,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Receipt,
  ShoppingCart,
} from "lucide-react";

const pathTitleMap: Record<string, string> = {
  "/": "Dashboard",
  "/vouchers/contra": "Contra Vouchers",
  "/vouchers/payment": "Payment Vouchers",
  "/vouchers/receipt": "Receipt Vouchers",
  "/vouchers/journal": "Journal Vouchers",
  "/vouchers/sales": "Sales Vouchers",
  "/vouchers/purchase": "Purchase Vouchers",
  "/ledgers": "Ledgers",
  "/groups": "Groups",
  "/reports/trial-balance": "Trial Balance",
  "/reports/profit-loss": "Profit & Loss",
  "/reports/balance-sheet": "Balance Sheet",
  "/reports/day-book": "Day Book",
  "/users": "Users",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (pathTitleMap[pathname]) return pathTitleMap[pathname];
  // Check for prefix match (e.g. /vouchers/sales/new)
  const parts = pathname.split("/").filter(Boolean);
  while (parts.length > 0) {
    const path = "/" + parts.join("/");
    if (pathTitleMap[path]) return pathTitleMap[path];
    parts.pop();
  }
  return "Dashboard";
}

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  if (pathname === "/") return [];
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let current = "";
  for (const part of parts) {
    current += "/" + part;
    const title =
      pathTitleMap[current] ||
      part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
    crumbs.push({ label: title, href: current });
  }
  return crumbs;
}

const voucherShortcuts = [
  { label: "Contra", href: "/vouchers/contra/new", icon: RefreshCw, key: "F4" },
  { label: "Payment", href: "/vouchers/payment/new", icon: ArrowUpRight, key: "F5" },
  { label: "Receipt", href: "/vouchers/receipt/new", icon: ArrowDownLeft, key: "F6" },
  { label: "Journal", href: "/vouchers/journal/new", icon: FileText, key: "F7" },
  { label: "Sales", href: "/vouchers/sales/new", icon: Receipt, key: "F8" },
  { label: "Purchase", href: "/vouchers/purchase/new", icon: ShoppingCart, key: "F9" },
];

export function Topbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const pageTitle = getPageTitle(pathname);
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-surface-200 bg-white px-6">
      {/* Left: Title + breadcrumbs */}
      <div className="flex flex-col justify-center">
        <h1 className="font-display text-lg font-semibold text-surface-900">
          {pageTitle}
        </h1>
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-surface-400">
            <Link href="/" className="transition-colors hover:text-surface-600">
              Home
            </Link>
            {breadcrumbs.map((crumb) => (
              <span key={crumb.href} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                <Link
                  href={crumb.href}
                  className={cn(
                    "transition-colors hover:text-surface-600",
                    crumb.href === pathname && "text-surface-700 font-medium"
                  )}
                >
                  {crumb.label}
                </Link>
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 text-surface-400 sm:flex"
          onClick={() => {
            // Dispatch Ctrl+K to trigger command palette
            window.dispatchEvent(
              new KeyboardEvent("keydown", {
                key: "k",
                ctrlKey: true,
                bubbles: true,
              })
            );
          }}
        >
          <Search className="h-4 w-4" />
          <span className="text-xs">Search...</span>
          <kbd className="ml-2 rounded border border-surface-200 bg-surface-100 px-1.5 py-0.5 font-mono text-[10px] text-surface-500">
            Ctrl+K
          </kbd>
        </Button>

        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-surface-500"
        >
          <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* New Voucher dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Voucher
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {voucherShortcuts.map((item, i) => (
              <span key={item.href}>
                <DropdownMenuItem asChild>
                  <Link href={item.href} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-surface-500" />
                      {item.label}
                    </span>
                    <kbd className="rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-[10px] text-surface-400">
                      {item.key}
                    </kbd>
                  </Link>
                </DropdownMenuItem>
                {i === 2 && <DropdownMenuSeparator />}
              </span>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
