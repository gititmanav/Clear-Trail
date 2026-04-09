"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "@/lib/auth-client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  FolderTree,
  Scale,
  TrendingUp,
  BarChart3,
  CalendarDays,
  Users,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Building2,
  ChevronDown,
  Banknote,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  ShoppingCart,
  Receipt,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    title: "Accounting",
    items: [
      { label: "Contra", href: "/vouchers/contra", icon: RefreshCw, badge: "F4" },
      { label: "Payment", href: "/vouchers/payment", icon: ArrowUpRight, badge: "F5" },
      { label: "Receipt", href: "/vouchers/receipt", icon: ArrowDownLeft, badge: "F6" },
      { label: "Journal", href: "/vouchers/journal", icon: FileText, badge: "F7" },
      { label: "Sales", href: "/vouchers/sales", icon: Receipt, badge: "F8" },
      { label: "Purchase", href: "/vouchers/purchase", icon: ShoppingCart, badge: "F9" },
      { label: "Ledgers", href: "/ledgers", icon: BookOpen },
      { label: "Groups", href: "/groups", icon: FolderTree },
    ],
  },
  {
    title: "Reports",
    items: [
      { label: "Trial Balance", href: "/reports/trial-balance", icon: Scale },
      { label: "Profit & Loss", href: "/reports/profit-loss", icon: TrendingUp },
      { label: "Balance Sheet", href: "/reports/balance-sheet", icon: BarChart3 },
      { label: "Day Book", href: "/reports/day-book", icon: CalendarDays },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Users", href: "/users", icon: Users },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex h-screen flex-col border-r border-surface-200 bg-white transition-all duration-200",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-surface-200 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500">
            <Banknote className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-bold text-surface-900 animate-fade-in">
              ClearTrail
            </span>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-6">
            {navigation.map((section) => (
              <div key={section.title}>
                {!collapsed && (
                  <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                    {section.title}
                  </p>
                )}
                {collapsed && (
                  <Separator className="mb-2" />
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    const linkContent = (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
                          active
                            ? "bg-brand-50 text-brand-600"
                            : "text-surface-600 hover:bg-surface-100 hover:text-surface-900",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0 transition-colors",
                            active
                              ? "text-brand-500"
                              : "text-surface-400 group-hover:text-surface-600"
                          )}
                        />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <Badge
                                variant="secondary"
                                className="h-5 min-w-[28px] justify-center px-1.5 text-[10px] font-mono"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                    );

                    if (collapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>
                            {linkContent}
                          </TooltipTrigger>
                          <TooltipContent side="right" className="flex items-center gap-2">
                            {item.label}
                            {item.badge && (
                              <span className="font-mono text-[10px] opacity-60">
                                {item.badge}
                              </span>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return linkContent;
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-surface-200 bg-white text-surface-400 shadow-sm transition-colors hover:bg-surface-50 hover:text-surface-600"
        >
          {collapsed ? (
            <ChevronsRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronsLeft className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Company switcher */}
        <div className="border-t border-surface-200 px-3 py-2">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex w-full items-center justify-center rounded-lg p-2 text-surface-600 transition-colors hover:bg-surface-100">
                  <Building2 className="h-[18px] w-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Switch Company</TooltipContent>
            </Tooltip>
          ) : (
            <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-surface-600 transition-colors hover:bg-surface-100">
              <Building2 className="h-[18px] w-[18px] shrink-0 text-surface-400" />
              <span className="flex-1 truncate text-left text-xs font-medium">
                Select Company
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-surface-400" />
            </button>
          )}
        </div>

        {/* User section */}
        <div className="border-t border-surface-200 px-3 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-surface-100",
                  collapsed && "justify-center"
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-brand-100 text-xs font-semibold text-brand-600">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <p className="truncate text-sm font-medium text-surface-900">
                      {user?.name || "User"}
                    </p>
                    <p className="truncate text-xs text-surface-400">
                      {user?.email || ""}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={collapsed ? "right" : "top"}
              align="start"
              className="w-56"
            >
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-surface-500">
                  {user?.email || ""}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-danger-500 focus:text-danger-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </TooltipProvider>
  );
}
