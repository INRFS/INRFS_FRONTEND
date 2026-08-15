import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import "../../Styles/SuperAdmin/Reports.css";

const STATS = [
  { label: "NEW INVESTMENTS", value: "₹4.8Cr", trend: "+18% vs last month", up: true },
  { label: "INTEREST PAID", value: "₹48.2L", trend: "+12% vs last month", up: true },
  { label: "SETTLEMENTS", value: "₹8.4L", trend: "-5% vs last month", up: false },
];

const MONTHLY_DATA = [
  { month: "Jan", Invested: 12, Interest: 1 },
  { month: "Feb", Invested: 20, Interest: 1.5 },
  { month: "Mar", Invested: 25, Interest: 2 },
  { month: "Apr", Invested: 32, Interest: 2.5 },
  { month: "May", Invested: 42, Interest: 3 },
  { month: "Jun", Invested: 45, Interest: 3.5 },
  { month: "Jul", Invested: 55, Interest: 4 },
];

export default function SuperAdminReports() {
  const handleExportExcel = () => console.log("Export Excel");
  const handleExportPdf = () => console.log("Export PDF");

  return (
    <div className="reports-page">
      <div className="reports-page__header">
        <h1 className="reports-page__title">Super Admin Reports</h1>
        <div className="reports-page__actions">
          <button className="reports-btn reports-btn--outline" onClick={handleExportExcel}>
            ⬇ Export Excel
          </button>
          <button className="reports-btn reports-btn--primary" onClick={handleExportPdf}>
            ⬇ Export PDF
          </button>
        </div>
      </div>

      <div className="reports-stats">
        {STATS.map((stat) => (
          <div className="reports-stat-card" key={stat.label}>
            <div className="reports-stat-card__label">{stat.label}</div>
            <div className="reports-stat-card__value">{stat.value}</div>
            <div
              className={`reports-stat-card__trend ${
                stat.up ? "reports-stat-card__trend--up" : "reports-stat-card__trend--down"
              }`}
            >
              {stat.up ? "↑" : "↓"} {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="reports-chart-card">
        <h2 className="reports-chart-card__title">Monthly Performance</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f1f3" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => `₹${v}.0L`}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={(v) => `₹${v}L`} />
            <Legend
              verticalAlign="bottom"
              align="left"
              iconType="square"
              wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
            />
            <Bar dataKey="Interest" fill="#10b981" radius={[3, 3, 0, 0]} barSize={28} />
            <Bar dataKey="Invested" fill="#1e3a8a" radius={[3, 3, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}