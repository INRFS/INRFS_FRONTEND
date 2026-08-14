import React from "react";
import {
  Building2,
  Shield,
  Users,
  DollarSign,
  Activity,
  CheckCircle2,
  TrendingUp,
  PieChart as PieChartIcon,
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
  { month: "Jan", investments: 72, amount: 7.8 },
  { month: "Feb", investments: 89, amount: 9.6 },
  { month: "Mar", investments: 96, amount: 10.8 },
  { month: "Apr", investments: 112, amount: 12.4 },
  { month: "May", investments: 128, amount: 14.2 },
  { month: "Jun", investments: 141, amount: 16.1 },
  { month: "Jul", investments: 156, amount: 18.4 },
];

const investorGrowth = [
  { month: "Jan", investors: 820 },
  { month: "Feb", investors: 872 },
  { month: "Mar", investors: 934 },
  { month: "Apr", investors: 1001 },
  { month: "May", investors: 1088 },
  { month: "Jun", investors: 1169 },
  { month: "Jul", investors: 1247 },
];

const statusData = [
  { name: "Active", value: 62 },
  { name: "Pending", value: 16 },
  { name: "Closed", value: 14 },
  { name: "Rejected", value: 8 },
];

const branchPerformance = [
  { branch: "Hyderabad", investors: 318 },
  { branch: "Bengaluru", investors: 274 },
  { branch: "Chennai", investors: 231 },
  { branch: "Vijayawada", investors: 198 },
  { branch: "Pune", investors: 154 },
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
      <span className="sa-stat-label">{label}</span>

      <span className={`sa-stat-icon ${tint}`}>
        <Icon size={16} />
      </span>
    </div>

    <div className="sa-stat-value">{value}</div>

    <div className="sa-stat-note">{note}</div>
  </div>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="sa-chart-tooltip">
      <strong>{label}</strong>

      {payload.map((item) => (
        <div key={item.dataKey}>
          <span>{item.name}</span>
          <b>{item.value}</b>
        </div>
      ))}
    </div>
  );
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

      <div className="sa-chart-grid">
        <section className="sa-chart-card sa-chart-card--wide">
          <div className="sa-chart-head">
            <div>
              <h3>Investment Performance</h3>
              <p>
                Monthly investment activity and value
              </p>
            </div>

            <span className="sa-chart-head-icon sa-tint-blue">
              <TrendingUp size={17} />
            </span>
          </div>

          <div className="sa-chart-box">
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={investmentTrend}>
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

                <Tooltip content={<ChartTooltip />} />

                <Area
                  type="monotone"
                  dataKey="amount"
                  name="AUM (Cr)"
                  stroke="#3b5bfe"
                  strokeWidth={2.5}
                  fill="url(#investmentArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="sa-chart-card">
          <div className="sa-chart-head">
            <div>
              <h3>Investment Status</h3>
              <p>Current portfolio distribution</p>
            </div>

            <span className="sa-chart-head-icon sa-tint-purple">
              <PieChartIcon size={17} />
            </span>
          </div>

          <div className="sa-status-chart">
            <ResponsiveContainer width="100%" height={225}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {statusData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={pieColors[index]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => `${value}%`}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="sa-status-total">
              <strong>100%</strong>
              <span>Portfolio</span>
            </div>
          </div>

          <div className="sa-status-list">
            {statusData.map((item, index) => (
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
                  <span>{item.name}</span>
                </div>

                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="sa-chart-card">
          <div className="sa-chart-head">
            <div>
              <h3>Investor Growth</h3>
              <p>
                Registered investors over time
              </p>
            </div>

            <span className="sa-chart-head-icon sa-tint-green">
              <Users size={17} />
            </span>
          </div>

          <div className="sa-chart-box">
            <ResponsiveContainer width="100%" height={270}>
              <AreaChart data={investorGrowth}>
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

                <Tooltip />

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
        </section>

        <section className="sa-chart-card sa-chart-card--wide">
          <div className="sa-chart-head">
            <div>
              <h3>Branch Performance</h3>
              <p>
                Investor distribution across major branches
              </p>
            </div>

            <span className="sa-chart-head-icon sa-tint-orange">
              <Building2 size={17} />
            </span>
          </div>

          <div className="sa-chart-box">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart
                data={branchPerformance}
                barSize={26}
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

                <Tooltip />

                <Bar
                  dataKey="investors"
                  name="Investors"
                  fill="#f59e0b"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}