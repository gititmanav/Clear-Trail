import { LogOut, Bell } from "lucide-react";
import { useAuth } from "@hooks/useAuth";

export default function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex-between px-6">
      {/* Left — can add breadcrumbs later */}
      <div />

      {/* Right — user info + actions */}
      <div className="flex-row-gap">
        <button
          className="p-2 rounded-md text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <div className="divider-vertical h-6 mx-1" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-surface-900">
              {user?.name ?? "User"}
            </p>
            <p className="text-2xs text-surface-500 capitalize">
              {user?.role ?? "member"}
            </p>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-md text-surface-500 hover:bg-danger-50 hover:text-danger-500 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
