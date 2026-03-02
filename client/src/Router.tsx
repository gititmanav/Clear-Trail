import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";

/* Templates */
import DashboardLayout from "@templates/DashboardLayout";
import AuthLayout from "@templates/AuthLayout";

/* Pages */
import Dashboard from "@pages/Dashboard";
import Income from "@pages/Income";
import Expenses from "@pages/Expenses";
import Users from "@pages/Users";
import Settings from "@pages/Settings";
import Login from "@pages/Login";
import Register from "@pages/Register";
import NotFound from "@pages/NotFound";

/** Protects routes that require authentication */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null; // or a Spinner
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

/** Redirects authenticated users away from auth pages */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* ── Auth Routes ── */}
      <Route
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      >
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ── Protected App Routes ── */}
      <Route
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/income" element={<Income />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* ── Catch-all ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
