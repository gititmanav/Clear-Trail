import { Outlet } from "react-router-dom";

/**
 * AuthLayout
 *
 * Template for public auth pages (login, register).
 * Centered card layout with ClearTrail branding.
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex-center bg-surface-100">
      <div className="w-full max-w-md mx-4">
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-surface-900 tracking-tight">
            ClearTrail
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Financial Operations Platform
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-white rounded-lg shadow-card p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
