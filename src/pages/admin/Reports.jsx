import React from "react";
import { Download, FileDown } from "lucide-react";
import { StatCard } from "../../shared/Shared";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

const monthlyData = [
  { month: "Jan", Invested: 15, Interest: 1 },
  { month: "Feb", Invested: 20, Interest: 1.2 },
  { month: "Mar", Invested: 25, Interest: 1.5 },
  { month: "Apr", Invested: 30, Interest: 1.8 },
  { month: "May", Invested: 40, Interest: 2.2 },
  { month: "Jun", Invested: 50, Interest: 2.8 },
  { month: "Jul", Invested: 55, Interest: 0.3 },
];

export default function Reports() {
  return (
    <div className="admin-page">
      <div className="admin-page-actions admin-page-actions--end">
        <button className="admin-btn admin-btn--outline"><Download size={14} /> Export Excel</button>
        <button className="admin-btn admin-btn--primary"><FileDown size={14} /> Export PDF</button>
      </div>

      <div className="admin-stats-grid admin-stats-grid--3">
        <StatCard label="New Investments" value="₹4.8Cr" trend="+18% vs last month" trendUp />
        <StatCard label="Interest Paid" value="₹48.2L" trend="+12% vs last month" trendUp />
        <StatCard label="Settlements" value="₹8.4L" trend="-5% vs last month" trendUp={false} />
      </div>

      <div className="admin-chart-card">
        <p className="admin-section__title">Monthly Performance</p>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v}.0L`}
            />
            <Tooltip formatter={(v) => `₹${v}L`} />
            <Legend />
            <Bar dataKey="Invested" fill="#1e3a8a" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Interest" fill="#22c55e" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
