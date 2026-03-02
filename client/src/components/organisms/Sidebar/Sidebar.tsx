import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Users,
  Settings,
} from "lucide-react";
import { ROUTES } from "@utils/constants";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: ROUTES.HOME },
  { label: "Income", icon: TrendingUp, path: ROUTES.INCOME },
  { label: "Expenses", icon: TrendingDown, path: ROUTES.EXPENSES },
  { label: "Users", icon: Users, path: ROUTES.USERS },
  { label: "Settings", icon: Settings, path: ROUTES.SETTINGS },
];

export default function Sidebar() {
  return (
    <aside className="w-sidebar h-screen bg-white border-r border-surface-200 flex-column">
      {/* Logo */}
      <div className="h-16 flex-center border-b border-surface-200 px-6">
        <h1 className="font-display text-xl font-bold text-surface-900 tracking-tight">
          ClearTrail
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 flex-stack">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-600"
                  : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
              }`
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-surface-200">
        <p className="text-2xs text-surface-400 text-center">
          ClearTrail v1.0.0
        </p>
      </div>
    </aside>
  );
}
