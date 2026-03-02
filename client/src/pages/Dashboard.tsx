import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react";
import Spinner from "@atoms/Spinner";
import StatCard from "@molecules/StatCard/StatCard";
import DashboardCharts from "@organisms/DashboardCharts/DashboardCharts";
import { transactionApi } from "@api/transactionApi";
import { userApi } from "@api/userApi";
import { formatCurrency } from "@utils/formatCurrency";

/* ── Types ── */

interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  userCount: number;
}

/* ── Component ── */

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const [summary, users] = await Promise.all([
          transactionApi.getSummary(),
          userApi.getAll(),
        ]);

        setData({
          totalIncome: summary.totalIncome,
          totalExpenses: summary.totalExpenses,
          netBalance: summary.netBalance,
          userCount: Array.isArray(users) ? users.length : users.users?.length ?? 0,
        });
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) return <Spinner centered />;

  return (
    <div>
      <div className="page-header">
        <h1 className="text-page-title">Dashboard</h1>
        <p className="text-page-subtitle">Financial overview at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 section-gap">
        <StatCard
          label="Total Income"
          value={formatCurrency(data?.totalIncome ?? 0)}
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(data?.totalExpenses ?? 0)}
          icon={<TrendingDown size={20} />}
        />
        <StatCard
          label="Net Balance"
          value={formatCurrency(data?.netBalance ?? 0)}
          icon={<DollarSign size={20} />}
        />
        <StatCard
          label="Total Users"
          value={String(data?.userCount ?? 0)}
          icon={<Users size={20} />}
        />
      </div>

      {/* Charts */}
      <DashboardCharts />
    </div>
  );
}
