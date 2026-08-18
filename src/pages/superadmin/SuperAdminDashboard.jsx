import React from "react";
import {
  Activity,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileCheck2,
  Shield,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import "../../Styles/SuperAdmin/dashboard.css";

const stats = [
  {
    label: "TOTAL BRANCHES",
    value: "14",
    icon: Building2,
    tint: "sa-tint-blue",
    note: "+2 this year",
  },
  {
    label: "TOTAL ADMINS",
    value: "28",
    icon: Shield,
    tint: "sa-tint-purple",
    note: "26 active",
  },
  {
    label: "TOTAL INVESTORS",
    value: "1,247",
    icon: Users,
    tint: "sa-tint-green",
    note: "+8.4% growth",
  },
  {
    label: "SYSTEM AUM",
    value: "₹58.4Cr",
    icon: DollarSign,
    tint: "sa-tint-green",
    note: "+6.2% this month",
  },
  {
    label: "ACTIVE SESSIONS",
    value: "42",
    icon: Activity,
    tint: "sa-tint-orange",
    note: "Stable",
  },
  {
    label: "SYSTEM HEALTH",
    value: "99.9%",
    icon: CheckCircle2,
    tint: "sa-tint-green",
    note: "All systems operational",
  },
];

const investmentTrend = [
  {
    month: "Jan",
    investments: 72,
    amount: 7.8,
    interest: 0.8,
  },
  {
    month: "Feb",
    investments: 89,
    amount: 9.6,
    interest: 1.1,
  },
  {
    month: "Mar",
    investments: 96,
    amount: 10.8,
    interest: 1.3,
  },
  {
    month: "Apr",
    investments: 112,
    amount: 12.4,
    interest: 1.6,
  },
  {
    month: "May",
    investments: 128,
    amount: 14.2,
    interest: 1.9,
  },
  {
    month: "Jun",
    investments: 141,
    amount: 16.1,
    interest: 2.2,
  },
  {
    month: "Jul",
    investments: 156,
    amount: 18.4,
    interest: 2.5,
  },
];

const investorGrowth = [
  {
    month: "Jan",
    investors: 820,
  },
  {
    month: "Feb",
    investors: 872,
  },
  {
    month: "Mar",
    investors: 934,
  },
  {
    month: "Apr",
    investors: 1001,
  },
  {
    month: "May",
    investors: 1088,
  },
  {
    month: "Jun",
    investors: 1169,
  },
  {
    month: "Jul",
    investors: 1247,
  },
];

const investmentStatus = [
  {
    name: "Active",
    value: 62,
  },
  {
    name: "Pending",
    value: 16,
  },
  {
    name: "Closed",
    value: 14,
  },
  {
    name: "Rejected",
    value: 8,
  },
];

const branchPerformance = [
  {
    branch: "Hyderabad",
    investors: 318,
  },
  {
    branch: "Bengaluru",
    investors: 274,
  },
  {
    branch: "Chennai",
    investors: 231,
  },
  {
    branch: "Vijayawada",
    investors: 198,
  },
  {
    branch: "Pune",
    investors: 154,
  },
];

const adminActivities = [
  {
    name: "Ravi Mehta",
    action: "Approved investment",
    branch: "Hyderabad Branch",
    reference: "INV000008",
    time: "12 min ago",
    type: "approved",
  },
  {
    name: "Anita Rao",
    action: "Registered new investor",
    branch: "Vijayawada Branch",
    reference: "INV000021",
    time: "28 min ago",
    type: "investor",
  },
  {
    name: "Mohan Das",
    action: "Updated investor profile",
    branch: "Hyderabad Branch",
    reference: "INV000014",
    time: "45 min ago",
    type: "profile",
  },
  {
    name: "Priya Sharma",
    action: "Rejected investment",
    branch: "Visakhapatnam Branch",
    reference: "INV000019",
    time: "1 hr ago",
    type: "rejected",
  },
  {
    name: "Kiran Kumar",
    action: "Logged into system",
    branch: "Guntur Branch",
    reference: "Admin Portal",
    time: "2 hrs ago",
    type: "login",
  },
];

const investorActivities = [
  {
    name: "maddi rajasekhar",
    investmentId: "INV000008",
    action: "New investment created",
    amount: "₹1,00,000",
    status: "Active",
    date: "14 Aug 2026",
  },
  {
    name: "nakirakanti rakesh",
    investmentId: "INV000005",
    action: "Investment awaiting approval",
    amount: "₹3,45,000",
    status: "Pending",
    date: "13 Aug 2026",
  },
  {
    name: "Test Investor",
    investmentId: "INV000004",
    action: "Investment rejected",
    amount: "₹2,30,000",
    status: "Rejected",
    date: "13 Aug 2026",
  },
  {
    name: "Test Investor 2",
    investmentId: "INV000003",
    action: "Profile updated",
    amount: "₹2,00,000",
    status: "Active",
    date: "12 Aug 2026",
  },
];

const pieColors = [
  "#3b5bfe",
  "#f59e0b",
  "#16a34a",
  "#dc2626",
];

const StatCard = ({
  label,
  value,
  icon: Icon,
  tint,
  note,
}) => (
  <div className="sa-stat-card">
    <div className="sa-stat-card-top">
      <span className="sa-stat-label">
        {label}
      </span>

      <span className={`sa-stat-icon ${tint}`}>
        <Icon size={16} />
      </span>
    </div>

    <div className="sa-stat-value">
      {value}
    </div>

    <div className="sa-stat-note">
      {note}
    </div>
  </div>
);

const ChartTooltip = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="sa-chart-tooltip">
      <strong>{label}</strong>

      {payload.map((item) => (
        <div key={item.dataKey}>
          <span>{item.name}</span>
          <b>
            {item.dataKey === "amount" ||
            item.dataKey === "interest"
              ? `₹${item.value}Cr`
              : item.value}
          </b>
        </div>
      ))}
    </div>
  );
};

const InvestmentStatusTooltip = ({
  active,
  payload,
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];

  return (
    <div className="sa-chart-tooltip">
      <strong>{item.name}</strong>

      <div>
        <span>Portfolio</span>
        <b>{item.value}%</b>
      </div>
    </div>
  );
};

const InvestorGrowthTooltip = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="sa-chart-tooltip">
      <strong>{label}</strong>

      <div>
        <span>Investors</span>
        <b>{payload[0].value}</b>
      </div>
    </div>
  );
};

const BranchTooltip = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="sa-chart-tooltip">
      <strong>{label}</strong>

      <div>
        <span>Investors</span>
        <b>{payload[0].value}</b>
      </div>
    </div>
  );
};

const ActivityIcon = ({ type }) => {
  if (type === "approved") {
    return <FileCheck2 size={15} />;
  }

  if (type === "investor") {
    return <UserPlus size={15} />;
  }

  if (type === "profile") {
    return <Users size={15} />;
  }

  if (type === "rejected") {
    return <XCircle size={15} />;
  }

  return <Clock3 size={15} />;
};

export default function SuperAdminDashboard() {
  return (
    <div className="sa-dashboard">

      <div className="sa-stat-grid">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            {...stat}
          />
        ))}
      </div>

      <div className="sa-dashboard-grid">

        <section className="sa-activity-card">

          <div className="sa-section-head">
            <div>
              <span className="sa-section-kicker">
                ADMIN MANAGEMENT
              </span>

              <h3>
                Recent Admin Activity
              </h3>

              <p>
                Latest actions performed by branch admins
              </p>
            </div>

            <span className="sa-section-icon sa-tint-purple">
              <Shield size={17} />
            </span>
          </div>

          <div className="sa-activity-list">
            {adminActivities.map(
              (activity, index) => (
                <div
                  className="sa-activity-row"
                  key={`${activity.name}-${index}`}
                >
                  <div
                    className={`sa-activity-icon sa-activity-${activity.type}`}
                  >
                    <ActivityIcon
                      type={activity.type}
                    />
                  </div>

                  <div className="sa-activity-main">
                    <div className="sa-activity-title">
                      <strong>
                        {activity.name}
                      </strong>

                      <span>
                        {activity.action}
                      </span>
                    </div>

                    <div className="sa-activity-meta">
                      <span>
                        {activity.branch}
                      </span>

                      <span>
                        {activity.reference}
                      </span>
                    </div>
                  </div>

                  <span className="sa-activity-time">
                    {activity.time}
                  </span>
                </div>
              )
            )}
          </div>

          <div className="sa-activity-footer">
            <div className="sa-admin-summary">
              <div>
                <strong>28</strong>
                <span>Total Admins</span>
              </div>

              <div>
                <strong>26</strong>
                <span>Active</span>
              </div>

              <div>
                <strong>2</strong>
                <span>Inactive</span>
              </div>
            </div>

            <button
              type="button"
              className="sa-report-link"
            >
              View Admin Report
              <ArrowUpRight size={14} />
            </button>
          </div>
        </section>

        <section className="sa-investor-card">

          <div className="sa-section-head">
            <div>
              <span className="sa-section-kicker">
                INVESTOR MANAGEMENT
              </span>

              <h3>
                Recent Investor Activity
              </h3>

              <p>
                Latest investor and investment activity
              </p>
            </div>

            <span className="sa-section-icon sa-tint-green">
              <Users size={17} />
            </span>
          </div>

          <div className="sa-investor-summary">
            <div>
              <span>Total Investors</span>

              <strong>1,247</strong>
            </div>

            <span className="sa-growth-badge">
              <TrendingUp size={12} />
              +8.4%
            </span>
          </div>

          <div className="sa-investor-list">
            {investorActivities.map(
              (investor, index) => (
                <div
                  className="sa-investor-row"
                  key={`${investor.investmentId}-${index}`}
                >
                  <div className="sa-investor-avatar">
                    {investor.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="sa-investor-main">
                    <strong>
                      {investor.name}
                    </strong>

                    <span>
                      {investor.action}
                    </span>

                    <small>
                      {investor.investmentId}
                    </small>
                  </div>

                  <div className="sa-investor-right">
                    <strong>
                      {investor.amount}
                    </strong>

                    <span
                      className={`sa-investor-status sa-status-${investor.status.toLowerCase()}`}
                    >
                      {investor.status}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="sa-investor-footer">
            <span>
              Latest update: 14 Aug 2026
            </span>

            <button
              type="button"
              className="sa-report-link"
            >
              View Investors
              <ArrowUpRight size={14} />
            </button>
          </div>
        </section>

      </div>

      <div className="sa-chart-grid">

        <section className="sa-chart-card sa-chart-card--wide">

          <div className="sa-chart-head">
            <div>
              <h3>
                Investment Performance
              </h3>

              <p>
                Monthly investment activity and portfolio value
              </p>
            </div>

            <span className="sa-chart-head-icon sa-tint-blue">
              <TrendingUp size={17} />
            </span>
          </div>

          <div className="sa-chart-box">
            <ResponsiveContainer
              width="100%"
              height={290}
            >
              <AreaChart
                data={investmentTrend}
                margin={{
                  top: 10,
                  right: 8,
                  left: -12,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="investmentArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#3b5bfe"
                      stopOpacity={0.25}
                    />

                    <stop
                      offset="100%"
                      stopColor="#3b5bfe"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#edf1f7"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#8b93ad",
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 9,
                    fill: "#8b93ad",
                  }}
                />

                <Tooltip
                  content={<ChartTooltip />}
                />

                <Area
                  type="monotone"
                  dataKey="amount"
                  name="AUM"
                  stroke="#3b5bfe"
                  strokeWidth={2.5}
                  fill="url(#investmentArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="sa-chart-footer-stats">
            <div>
              <span>Total AUM</span>
              <strong>₹58.4Cr</strong>
            </div>

            <div>
              <span>Monthly Growth</span>
              <strong className="sa-positive">
                +6.2%
              </strong>
            </div>

            <div>
              <span>Investments</span>
              <strong>156</strong>
            </div>
          </div>
        </section>

        <section className="sa-chart-card">

          <div className="sa-chart-head">
            <div>
              <h3>
                Investment Status
              </h3>

              <p>
                Current portfolio distribution
              </p>
            </div>

            <span className="sa-chart-head-icon sa-tint-purple">
              <Wallet size={17} />
            </span>
          </div>

          <div className="sa-status-chart">
            <ResponsiveContainer
              width="100%"
              height={225}
            >
              <PieChart>
                <Pie
                  data={investmentStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {investmentStatus.map(
                    (item, index) => (
                      <Cell
                        key={item.name}
                        fill={
                          pieColors[index]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip
                  content={
                    <InvestmentStatusTooltip />
                  }
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="sa-status-total">
              <strong>100%</strong>
              <span>Portfolio</span>
            </div>
          </div>

          <div className="sa-status-list">
            {investmentStatus.map(
              (item, index) => (
                <div
                  className="sa-status-row"
                  key={item.name}
                >
                  <div>
                    <i
                      style={{
                        background:
                          pieColors[index],
                      }}
                    />

                    <span>
                      {item.name}
                    </span>
                  </div>

                  <strong>
                    {item.value}%
                  </strong>
                </div>
              )
            )}
          </div>
        </section>

        <section className="sa-chart-card">

          <div className="sa-chart-head">
            <div>
              <h3>
                Investor Growth
              </h3>

              <p>
                Registered investors over time
              </p>
            </div>

            <span className="sa-chart-head-icon sa-tint-green">
              <Users size={17} />
            </span>
          </div>

          <div className="sa-chart-box">
            <ResponsiveContainer
              width="100%"
              height={270}
            >
              <AreaChart
                data={investorGrowth}
                margin={{
                  top: 10,
                  right: 8,
                  left: -12,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="investorGrowthArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#16a34a"
                      stopOpacity={0.2}
                    />

                    <stop
                      offset="100%"
                      stopColor="#16a34a"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#edf1f7"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#8b93ad",
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 9,
                    fill: "#8b93ad",
                  }}
                />

                <Tooltip
                  content={
                    <InvestorGrowthTooltip />
                  }
                />

                <Area
                  type="monotone"
                  dataKey="investors"
                  name="Investors"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  fill="url(#investorGrowthArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="sa-mini-highlight">
            <div>
              <span>Current Investors</span>
              <strong>1,247</strong>
            </div>

            <div className="sa-mini-growth">
              <TrendingUp size={13} />
              <span>8.4% growth</span>
            </div>
          </div>
        </section>

        <section className="sa-chart-card sa-chart-card--wide">

          <div className="sa-chart-head">
            <div>
              <h3>
                Branch Performance
              </h3>

              <p>
                Investor distribution across branches
              </p>
            </div>

            <span className="sa-chart-head-icon sa-tint-orange">
              <Building2 size={17} />
            </span>
          </div>

          <div className="sa-chart-box">
            <ResponsiveContainer
              width="100%"
              height={270}
            >
              <BarChart
                data={branchPerformance}
                barSize={28}
                margin={{
                  top: 10,
                  right: 8,
                  left: -12,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  stroke="#edf1f7"
                  vertical={false}
                />

                <XAxis
                  dataKey="branch"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 9,
                    fill: "#8b93ad",
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 9,
                    fill: "#8b93ad",
                  }}
                />

                <Tooltip
                  content={<BranchTooltip />}
                />

                <Bar
                  dataKey="investors"
                  name="Investors"
                  fill="#f59e0b"
                  radius={[
                    5,
                    5,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

      </div>

    </div>
  );
}