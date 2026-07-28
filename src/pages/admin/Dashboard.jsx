import React from "react";
import {
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  Building2,
  BarChart3,
  Plus,
  Check,
  X,
  Eye,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "../../Styles/Admin/Dashboard.css";

const stats = [
  { label: "TOTAL INVESTORS", value: "1,247", delta: "+24", up: true, icon: Users, tint: "blue" },
  { label: "PENDING KYC", value: "18", delta: "-3", up: false, icon: FileText, tint: "amber" },
  { label: "ACTIVE INVESTMENTS", value: "896", delta: "+12", up: true, icon: TrendingUp, tint: "green" },
  { label: "TOTAL AUM", value: "₹58.4Cr", delta: "+₹2.1Cr", up: true, icon: DollarSign, tint: "blue" },
  { label: "MONTHLY INTEREST DUE", value: "₹48.2L", delta: "This Month", note: true, icon: Calendar, tint: "purple" },
  { label: "PENDING APPROVALS", value: "5", delta: "Urgent", note: true, icon: Clock, tint: "amber" },
  { label: "CLOSED INVESTMENTS", value: "342", delta: "+8", up: true, icon: CheckCircle2, tint: "teal" },
  { label: "BRANCH COUNT", value: "14", delta: "Active", note: true, icon: Building2, tint: "purple" },
];

const investmentTrend = [
  { month: "Jan", amount: 15 },
  { month: "Feb", amount: 20 },
  { month: "Mar", amount: 18 },
  { month: "Apr", amount: 32 },
  { month: "May", amount: 39 },
  { month: "Jun", amount: 48 },
  { month: "Jul", amount: 55 },
];

const investorGrowth = [
  { month: "Jan", count: 40 },
  { month: "Feb", count: 55 },
  { month: "Mar", count: 70 },
  { month: "Apr", count: 85 },
  { month: "May", count: 100 },
  { month: "Jun", count: 122 },
  { month: "Jul", count: 150 },
];

const recentActivity = [
  { id: "INV001", name: "Arjun Sharma", branch: "Mumbai HQ", kyc: "Approved", status: "Active" },
  { id: "INV002", name: "Priya Patel", branch: "Delhi North", kyc: "Pending", status: "Pending" },
  { id: "INV003", name: "Rahul Kumar", branch: "Bangalore", kyc: "Approved", status: "Active" },
  { id: "INV004", name: "Sunita Verma", branch: "Chennai", kyc: "Rejected", status: "Suspended" },
  { id: "INV005", name: "Vikram Singh", branch: "Pune", kyc: "Pending", status: "Pending" },
];

const kycPending = [
  { name: "Priya Patel", tint: "amber" },
  { name: "Vikram Singh", tint: "blue" },
];

function initials(name) {
  return name.charAt(0);
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-label">{label}</div>
        <div className="chart-tooltip-value">
          Invested : ₹{payload[0].value},00,000
        </div>
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  return (
    <>
      <div className="dash-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome back, Ravi. Here's today's overview.</p>
        </div>
        <div className="dash-header-actions">
          <button className="btn btn-outline">
            <BarChart3 size={15} /> Reports
          </button>
          <button className="btn btn-primary">
            <Plus size={15} /> Add Investment
          </button>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-top">
              <span className="stat-label">{s.label}</span>
              <span className={`stat-icon stat-icon-${s.tint}`}>
                <s.icon size={15} />
              </span>
            </div>
            <div className="stat-value">{s.value}</div>
            <div className={"stat-delta" + (s.note ? " stat-delta-note" : s.up ? " stat-delta-up" : " stat-delta-down")}>
              {!s.note && (s.up ? "↑ " : "↓ ")}
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="chart-grid">
        <div className="panel">
          <div className="panel-title">Monthly Investment Trend</div>
          <div className="panel-sub">New investments per month</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={investmentTrend}>
              <CartesianGrid stroke="#eef0f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9aa1b5" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#9aa1b5" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}L`}
                domain={[0, 60]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f3fa" }} />
              <Bar dataKey="amount" fill="#2f5cf0" radius={[4, 4, 0, 0]} maxBarSize={38} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="panel-title">Investor Growth</div>
          <div className="panel-sub">Cumulative investor count</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={investorGrowth}>
              <CartesianGrid stroke="#eef0f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9aa1b5" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9aa1b5" }} axisLine={false} tickLine={false} domain={[0, 160]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#16a34a" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="panel">
          <div className="panel-header-row">
            <div>
              <div className="panel-title">Recent Activity</div>
            </div>
            <button className="link-btn">View All</button>
          </div>

          <table className="activity-table">
            <thead>
              <tr>
                <th>INVESTOR</th>
                <th>BRANCH</th>
                <th>KYC</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="investor-cell">
                      <span className="investor-avatar">{initials(row.name)}</span>
                      <div>
                        <div className="investor-name">{row.name}</div>
                        <div className="investor-id">{row.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="branch-cell">{row.branch}</td>
                  <td>
                    <span className={`badge badge-${row.kyc.toLowerCase()}`}>{row.kyc}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${row.status.toLowerCase()}`}>{row.status}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn icon-btn-green">
                        <Check size={13} />
                      </button>
                      <button className="icon-btn icon-btn-red">
                        <X size={13} />
                      </button>
                      <button className="icon-btn icon-btn-neutral">
                        <Eye size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="side-col">
          <div className="panel">
            <div className="panel-title">Quick Actions</div>
            <div className="quick-actions">
              <button className="quick-action">
                <span>
                  <FileText size={14} /> KYC Approvals
                </span>
                <span className="qa-badge">5</span>
              </button>
              <button className="quick-action">
                <TrendingUp size={14} /> Investment Management
              </button>
              <button className="quick-action">
                <DollarSign size={14} /> Monthly Interest
              </button>
              <button className="quick-action">
                <BarChart3 size={14} /> Generate Reports
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">KYC Pending</div>
            <div className="kyc-pending-list">
              {kycPending.map((k) => (
                <div className="kyc-pending-row" key={k.name}>
                  <div className="investor-cell">
                    <span className={`investor-avatar investor-avatar-${k.tint}`}>
                      {initials(k.name)}
                    </span>
                    <span className="investor-name">{k.name}</span>
                  </div>
                  <button className="btn btn-primary btn-sm">Review</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
