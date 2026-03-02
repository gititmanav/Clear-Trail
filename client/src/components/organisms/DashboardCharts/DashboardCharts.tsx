import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import Spinner from "@atoms/Spinner";
import { transactionApi } from "@api/transactionApi";
import { chartColors } from "@styles/theme";

// Register Chart.js modules
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

/* ── Types ── */

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  monthlyTrend: Array<{
    _id: { year: number; month: number; type: string };
    total: number;
  }>;
}

interface DashboardChartsProps {
  refreshKey?: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ── Component ── */

export default function DashboardCharts({ refreshKey = 0 }: DashboardChartsProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const data = await transactionApi.getSummary();
        setSummary(data);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [refreshKey]);

  if (loading) return <Spinner centered />;
  if (!summary) return null;

  // ── Build monthly bar chart data ──
  const monthlyMap = new Map<string, { income: number; expense: number }>();

  // Initialize last 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    monthlyMap.set(key, { income: 0, expense: 0 });
  }

  // Fill with data
  for (const entry of summary.monthlyTrend) {
    const key = `${entry._id.year}-${entry._id.month}`;
    const existing = monthlyMap.get(key);
    if (existing) {
      if (entry._id.type === "income") existing.income = entry.total;
      if (entry._id.type === "expense") existing.expense = entry.total;
    }
  }

  const sortedKeys = Array.from(monthlyMap.keys());
  const barLabels = sortedKeys.map((k) => {
    const [, month] = k.split("-");
    return MONTHS[parseInt(month!) - 1]!;
  });
  const incomeData = sortedKeys.map((k) => monthlyMap.get(k)!.income);
  const expenseData = sortedKeys.map((k) => monthlyMap.get(k)!.expense);

  const barChartData = {
    labels: barLabels,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        backgroundColor: chartColors.income + "CC",
        borderRadius: 4,
        barPercentage: 0.6,
      },
      {
        label: "Expense",
        data: expenseData,
        backgroundColor: chartColors.expense + "CC",
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { usePointStyle: true, pointStyle: "circle", padding: 16, font: { size: 12 } },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: chartColors.grid },
        ticks: { font: { size: 11 }, color: chartColors.label },
      },
    },
  };

  // ── Doughnut chart ──
  const doughnutData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [summary.totalIncome, summary.totalExpenses],
        backgroundColor: [chartColors.income + "CC", chartColors.expense + "CC"],
        borderWidth: 0,
        spacing: 2,
      },
    ],
  };

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { usePointStyle: true, pointStyle: "circle", padding: 16, font: { size: 12 } },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Bar chart — 2/3 width */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-card card-padding">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">
          Income vs Expenses (6 months)
        </h3>
        <div className="h-64">
          <Bar data={barChartData} options={barOptions} />
        </div>
      </div>

      {/* Doughnut chart — 1/3 width */}
      <div className="bg-white rounded-lg shadow-card card-padding">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">
          Income / Expense Split
        </h3>
        <div className="h-64 flex-center">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
}
