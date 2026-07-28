import React from "react";
import { useNavigate } from "react-router-dom";
import {DollarSign, TrendingUp, Award, Activity, BarChart3, Calendar,Eye, Download, Plus, BookOpen, UserCog,} from "lucide-react";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,PieChart, Pie, Cell,} from "recharts";
import { useInvestorData, StatusBadge, formatINR } from "./InvestorDataContext";
import "../../Styles/Investor/Dashboard.css";

const growthData = [
  { month: "Jan", value: 18 }, { month: "Feb", value: 24 }, { month: "Mar", value: 30 },
  { month: "Apr", value: 38 }, { month: "May", value: 46 }, { month: "Jun", value: 54 }, { month: "Jul", value: 60 },
];

const portfolioSplit = [
  { name: "Fixed Deposit", value: 45, color: "#1e3a8a" },
  { name: "Recurring", value: 28, color: "#2f5cf0" },
  { name: "Short Term", value: 17, color: "#16a34a" },
  { name: "Long Term", value: 10, color: "#f59e0b" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { investments, notifications, stats } = useInvestorData();
  const recentInvestments = investments.slice(0, 5);
  const recentNotifications = notifications.slice(0, 3);

  return (
    <div className="investor-page">
      <div className="dash-header">
        <div>
          <p className="dash-greeting">Good morning, Arjun! 👋</p>
          <p className="investor-page-subtitle">Here's your investment portfolio overview for today</p>
        </div>
        <div className="dash-header-actions">
          <button className="investor-btn investor-btn--outline" onClick={() => navigate("/investor/my-investments")}>
            <Eye size={14} /> My Investments
          </button>
          <button className="investor-btn investor-btn--primary" onClick={() => navigate("/investor/invest-now")}>
            <Plus size={14} /> Invest Now
          </button>
        </div>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-card__top">
            <span className="dash-stat-card__label">Total Invested</span>
            <span className="dash-stat-card__icon dash-stat-card__icon--blue"><DollarSign size={15} /></span>
          </div>
          <p className="dash-stat-card__value">{formatINR(stats.totalInvested)}</p>
          <p className="dash-stat-card__trend dash-stat-card__trend--up">↑ live total</p>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-card__top">
            <span className="dash-stat-card__label">Interest Earned</span>
            <span className="dash-stat-card__icon dash-stat-card__icon--green"><TrendingUp size={15} /></span>
          </div>
          <p className="dash-stat-card__value">{formatINR(stats.totalEarned)}</p>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-card__top">
            <span className="dash-stat-card__label">Active Bonds</span>
            <span className="dash-stat-card__icon dash-stat-card__icon--purple"><Award size={15} /></span>
          </div>
          <p className="dash-stat-card__value">{stats.activeCount}</p>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-card__top">
            <span className="dash-stat-card__label">Monthly Payout</span>
            <span className="dash-stat-card__icon dash-stat-card__icon--green"><Activity size={15} /></span>
          </div>
          <p className="dash-stat-card__value">{formatINR(stats.monthlyPayout)}</p>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-card__top">
            <span className="dash-stat-card__label">Portfolio Value</span>
            <span className="dash-stat-card__icon dash-stat-card__icon--blue"><BarChart3 size={15} /></span>
          </div>
          <p className="dash-stat-card__value">{formatINR(stats.portfolioValue)}</p>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-card__top">
            <span className="dash-stat-card__label">Next Maturity</span>
            <span className="dash-stat-card__icon dash-stat-card__icon--amber"><Calendar size={15} /></span>
          </div>
          <p className="dash-stat-card__value">
            {stats.nextMaturity ? `${stats.daysToMaturity} Days` : "—"}
          </p>
          <p className="dash-stat-card__trend">
            {stats.nextMaturity ? `${stats.nextMaturity.matures} · ${stats.nextMaturity.bond}` : "No active bonds"}
          </p>
        </div>
      </div>

      <div className="dash-charts-row">
        <div className="dash-chart-card">
          <p className="investor-section__title">Investment Growth</p>
          <p className="investor-page-subtitle">Portfolio value over time</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}.0L`} />
              <Tooltip formatter={(v) => `₹${v}L`} />
              <Line type="monotone" dataKey="value" stroke="#2f5cf0" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card dash-chart-card--donut">
          <p className="investor-section__title">Portfolio Distribution</p>
          <div className="dash-donut-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={portfolioSplit} dataKey="value" nameKey="name" innerRadius={62} outerRadius={90} paddingAngle={2}>
                  {portfolioSplit.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <ul className="dash-donut-legend">
              {portfolioSplit.map((entry) => (
                <li key={entry.name}>
                  <span className="dash-donut-dot" style={{ background: entry.color }} />
                  <span className="dash-donut-name">{entry.name}</span>
                  <span className="dash-donut-value">{entry.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="dash-bottom-row">
        <div className="dash-recent-card">
          <div className="dash-recent-card__header">
            <p className="investor-section__title">Recent Investments</p>
            <button className="investor-btn investor-btn--outline investor-btn--pill" onClick={() => navigate("/investor/my-investments")}>
              View All &gt;
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Bond Number</th><th>Amount</th><th>Rate</th><th>Invested On</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentInvestments.map((inv) => (
                <tr key={inv.id}>
                  <td className="mono link">{inv.bond}</td>
                  <td className="mono">{formatINR(inv.amount)}</td>
                  <td><span className="rate-pill">{inv.rate}</span></td>
                  <td>{inv.invested}</td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td className="admin-table-actions">
                    <button title="View"><Eye size={14} /></button>
                    <button title="Bond" className="admin-icon-btn--primary"><Download size={14} /> Bond</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dash-side-col">
          <div className="dash-quick-actions">
            <p className="investor-section__title">Quick Actions</p>
            <button className="investor-btn investor-btn--primary investor-btn--block" onClick={() => navigate("/investor/invest-now")}>
              <Plus size={14} /> Invest Now
            </button>
            <button className="investor-btn investor-btn--outline investor-btn--block" onClick={() => navigate("/investor/my-bonds")}>
              <Award size={14} /> My Bonds
            </button>
            <button className="investor-btn investor-btn--outline investor-btn--block">
              <Download size={14} /> Download Bond Certificate
            </button>
            <button className="investor-btn investor-btn--outline investor-btn--block" onClick={() => navigate("/investor/profile")}>
              <UserCog size={14} /> Update Profile
            </button>
          </div>

          <div className="dash-notif-card">
            <div className="dash-recent-card__header">
              <p className="investor-section__title">Recent Notifications</p>
              <button className="investor-btn investor-btn--link" onClick={() => navigate("/investor/notifications")}>
                All
              </button>
            </div>
            <div className="dash-notif-list">
              {recentNotifications.map((n) => (
                <div key={n.id} className="dash-notif-row">
                  <span className="dash-notif-icon"><BookOpen size={14} /></span>
                  <div>
                    <p className="dash-notif-title">{n.title}</p>
                    <p className="dash-notif-body">{n.body}</p>
                    <p className="dash-notif-time">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}