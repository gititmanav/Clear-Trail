import { Outlet } from "react-router-dom";
import Sidebar from "@organisms/Sidebar/Sidebar";
import TopBar from "@organisms/TopBar/TopBar";

/**
 * DashboardLayout
 *
 * Template for all authenticated pages.
 * Renders the sidebar, top bar, and page content area.
 * Pages render inside <Outlet />.
 */
export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
