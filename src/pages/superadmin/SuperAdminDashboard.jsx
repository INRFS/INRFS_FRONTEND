import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  DollarSign,
  Shield,
  TrendingUp,
  Users,
  Wallet,
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

import {
  getSuperAdminDashboard,
  getRecentAdmins,
  getRecentInvestors,
} from "../../services/superadmin/superAdminDashboardService";

const pieColors = [
  "#3b5bfe",
  "#f59e0b",
  "#16a34a",
  "#dc2626",
  "#8b5cf6",
  "#06b6d4",
];

const numberFormat = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "0";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return number.toLocaleString("en-IN");
};

const currencyFormat = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "₹0";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  if (Math.abs(number) >= 10000000) {
    return `₹${(
      number / 10000000
    ).toFixed(2)}Cr`;
  }

  if (Math.abs(number) >= 100000) {
    return `₹${(
      number / 100000
    ).toFixed(2)}L`;
  }

  return `₹${number.toLocaleString(
    "en-IN"
  )}`;
};

const getValue = (
  object,
  keys,
  fallback = null
) => {
  if (!object) {
    return fallback;
  }

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ""
    ) {
      return object[key];
    }
  }

  return fallback;
};

const getRows = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const getFirstObject = (object) => {
  if (
    object &&
    typeof object === "object" &&
    !Array.isArray(object)
  ) {
    return object;
  }

  return {};
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const normalizeMonthlyData = (
  rows
) => {
  return rows.map((item) => ({
    month:
      getValue(
        item,
        [
          "month_name",
          "month",
          "label",
        ],
        ""
      ),
    investments: Number(
      getValue(
        item,
        [
          "investment_count",
          "investments",
          "count",
        ],
        0
      )
    ),
    amount: Number(
      getValue(
        item,
        [
          "investment_amount",
          "amount",
          "total_amount",
          "total_investment",
        ],
        0
      )
    ),
    interest: Number(
      getValue(
        item,
        [
          "interest_amount",
          "interest",
          "total_interest",
        ],
        0
      )
    ),
  }));
};

const normalizeInvestorGrowth = (
  rows
) => {
  return rows.map((item) => ({
    month:
      getValue(
        item,
        [
          "month_name",
          "month",
          "label",
        ],
        ""
      ),
    investors: Number(
      getValue(
        item,
        [
          "investor_count",
          "investors",
          "count",
          "total_investors",
        ],
        0
      )
    ),
  }));
};

const normalizeStatus = (rows) => {
  return rows.map((item) => ({
    name:
      getValue(
        item,
        [
          "status_name",
          "name",
          "label",
          "investment_status",
        ],
        "Unknown"
      ),
    value: Number(
      getValue(
        item,
        [
          "percentage",
          "percent",
          "value",
          "count",
        ],
        0
      )
    ),
  }));
};

const normalizeBranches = (rows) => {
  return rows.map((item) => ({
    branch:
      getValue(
        item,
        [
          "branch_name",
          "name",
          "branch",
        ],
        "Branch"
      ),
    investors: Number(
      getValue(
        item,
        [
          "investor_count",
          "investors",
          "total_investors",
          "count",
        ],
        0
      )
    ),
  }));
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  tint,
  note,
}) => {
  return (
    <div className="sa-stat-card">
      <div className="sa-stat-card-top">
        <span className="sa-stat-label">
          {label}
        </span>

        <span
          className={`sa-stat-icon ${tint}`}
        >
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
};

const ChartTooltip = ({
  active,
  payload,
  label,
}) => {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
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
              ? currencyFormat(
                  item.value
                )
              : numberFormat(
                  item.value
                )}
          </b>
        </div>
      ))}
    </div>
  );
};

const StatusTooltip = ({
  active,
  payload,
}) => {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }

  const item = payload[0];

  return (
    <div className="sa-chart-tooltip">
      <strong>
        {item.name}
      </strong>

      <div>
        <span>Value</span>
        <b>
          {item.value}
        </b>
      </div>
    </div>
  );
};

export default function SuperAdminDashboard() {
  const [
    dashboard,
    setDashboard,
  ] = useState(null);

  const [
    recentAdmins,
    setRecentAdmins,
  ] = useState([]);

  const [
    recentInvestors,
    setRecentInvestors,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard =
      async () => {
        try {
          setLoading(true);
          setError("");

          const [
            dashboardResponse,
            adminsResponse,
            investorsResponse,
          ] = await Promise.all([
            getSuperAdminDashboard(),
            getRecentAdmins(5),
            getRecentInvestors(5),
          ]);

          if (!mounted) {
            return;
          }

          setDashboard(
            dashboardResponse?.data ||
              dashboardResponse ||
              {}
          );

          setRecentAdmins(
            getRows(
              adminsResponse
            )
          );

          setRecentInvestors(
            getRows(
              investorsResponse
            )
          );
        } catch (err) {
          if (!mounted) {
            return;
          }

          console.error(
            "SuperAdmin dashboard error:",
            err
          );

          setError(
            err?.message ||
              "Unable to load dashboard."
          );
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const summary =
    getFirstObject(
      dashboard?.summary
    );

  const investmentSummary =
    getFirstObject(
      dashboard?.investment_summary
    );

  const investorSummary =
    getFirstObject(
      dashboard?.investor_summary
    );

  const investmentPerformance =
    normalizeMonthlyData(
      getRows(
        dashboard?.investment_performance
      )
    );

  const investorGrowth =
    normalizeInvestorGrowth(
      getRows(
        dashboard?.investor_growth
      )
    );

  const investmentStatus =
    normalizeStatus(
      getRows(
        dashboard?.investment_status
      )
    );

  const branchPerformance =
    normalizeBranches(
      getRows(
        dashboard?.branch_performance
      )
    );

  const totalBranches =
    getValue(
      summary,
      [
        "total_branches",
        "branch_count",
        "branches",
      ],
      0
    );

  const totalAdmins =
    getValue(
      summary,
      [
        "total_admins",
        "admin_count",
        "admins",
      ],
      0
    );

  const activeAdmins =
    getValue(
      summary,
      [
        "active_admins",
        "active_admin_count",
      ],
      0
    );

  const totalInvestors =
    getValue(
      investorSummary,
      [
        "total_investors",
        "investor_count",
        "investors",
      ],
      0
    );

  const totalAum =
    getValue(
      investmentSummary,
      [
        "total_aum",
        "aum",
        "total_investment",
        "investment_amount",
      ],
      0
    );

  const activeSessions =
    getValue(
      summary,
      [
        "active_sessions",
        "active_session_count",
        "sessions",
      ],
      0
    );

  const systemHealth =
    getValue(
      summary,
      [
        "system_health",
        "health_percentage",
        "health",
      ],
      "100%"
    );

  const investorGrowthValue =
    getValue(
      investorSummary,
      [
        "growth_percentage",
        "growth",
        "growth_percent",
      ],
      null
    );

  const monthlyGrowth =
    getValue(
      investmentSummary,
      [
        "monthly_growth",
        "growth_percentage",
        "growth_percent",
      ],
      null
    );

  const totalInvestmentCount =
    getValue(
      investmentSummary,
      [
        "total_investments",
        "investment_count",
        "investments",
      ],
      0
    );

  const recentAdminCount =
    recentAdmins.length;

  const recentInvestorCount =
    recentInvestors.length;

  const adminActiveCount =
    useMemo(() => {
      return recentAdmins.filter(
        (item) => {
          const status = String(
            getValue(
              item,
              [
                "status_name",
                "status",
              ],
              ""
            )
          ).toLowerCase();

          return (
            !status ||
            status.includes(
              "active"
            )
          );
        }
      ).length;
    }, [recentAdmins]);

  if (loading) {
    return (
      <div className="sa-dashboard">
        <div className="sa-dashboard-loading">
          Loading SuperAdmin dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sa-dashboard">
        <div className="sa-dashboard-error">
          <strong>
            Unable to load dashboard
          </strong>

          <span>
            {error}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="sa-dashboard">

      <div className="sa-stat-grid">

        <StatCard
          label="TOTAL BRANCHES"
          value={numberFormat(
            totalBranches
          )}
          icon={Building2}
          tint="sa-tint-blue"
          note="Across the organization"
        />

        <StatCard
          label="TOTAL ADMINS"
          value={numberFormat(
            totalAdmins
          )}
          icon={Shield}
          tint="sa-tint-purple"
          note={`${numberFormat(
            activeAdmins
          )} active admins`}
        />

        <StatCard
          label="TOTAL INVESTORS"
          value={numberFormat(
            totalInvestors
          )}
          icon={Users}
          tint="sa-tint-green"
          note={
            investorGrowthValue !==
            null
              ? `${investorGrowthValue}% growth`
              : "Current investors"
          }
        />

        <StatCard
          label="SYSTEM AUM"
          value={currencyFormat(
            totalAum
          )}
          icon={DollarSign}
          tint="sa-tint-green"
          note={
            monthlyGrowth !==
            null
              ? `${monthlyGrowth}% monthly growth`
              : "Total managed investment"
          }
        />

        <StatCard
          label="ACTIVE SESSIONS"
          value={numberFormat(
            activeSessions
          )}
          icon={Activity}
          tint="sa-tint-orange"
          note="Current system activity"
        />

        <StatCard
          label="SYSTEM HEALTH"
          value={
            typeof systemHealth ===
            "number"
              ? `${systemHealth}%`
              : systemHealth
          }
          icon={CheckCircle2}
          tint="sa-tint-green"
          note="System status"
        />

      </div>

      <div className="sa-dashboard-grid">

        <section className="sa-activity-card">

          <div className="sa-section-head">

            <div>

              <span className="sa-section-kicker">
                ADMIN MANAGEMENT
              </span>

              <h3>
                Recent Admins
              </h3>

              <p>
                Latest administrators registered in the system
              </p>

            </div>

            <span className="sa-section-icon sa-tint-purple">
              <Shield size={17} />
            </span>

          </div>

          <div className="sa-activity-list">

            {recentAdmins.length ===
            0 ? (
              <div className="sa-activity-row">
                <div className="sa-activity-main">
                  <span>
                    No recent admins found.
                  </span>
                </div>
              </div>
            ) : (
              recentAdmins.map(
                (admin, index) => {

                  const name =
                    getValue(
                      admin,
                      [
                        "full_name",
                        "admin_name",
                        "name",
                      ],
                      "Admin"
                    );

                  const branch =
                    getValue(
                      admin,
                      [
                        "branch_name",
                        "branch",
                      ],
                      "Branch"
                    );

                  const email =
                    getValue(
                      admin,
                      ["email"],
                      ""
                    );

                  const status =
                    getValue(
                      admin,
                      [
                        "status_name",
                        "status",
                      ],
                      "Active"
                    );

                  const createdAt =
                    getValue(
                      admin,
                      [
                        "created_at",
                        "created_date",
                        "registered_at",
                      ],
                      ""
                    );

                  const id =
                    getValue(
                      admin,
                      [
                        "admin_id",
                        "id",
                        "user_id",
                      ],
                      index
                    );

                  return (
                    <div
                      className="sa-activity-row"
                      key={id}
                    >

                      <div className="sa-activity-icon sa-activity-profile">
                        <Shield
                          size={15}
                        />
                      </div>

                      <div className="sa-activity-main">

                        <div className="sa-activity-title">

                          <strong>
                            {name}
                          </strong>

                          <span>
                            {email ||
                              "Administrator"}
                          </span>

                        </div>

                        <div className="sa-activity-meta">

                          <span>
                            {branch}
                          </span>

                          <span>
                            {status}
                          </span>

                        </div>

                      </div>

                      <span className="sa-activity-time">
                        {formatDate(
                          createdAt
                        )}
                      </span>

                    </div>
                  );
                }
              )
            )}

          </div>

          <div className="sa-activity-footer">

            <div className="sa-admin-summary">

              <div>
                <strong>
                  {recentAdminCount}
                </strong>

                <span>
                  Recent
                </span>
              </div>

              <div>
                <strong>
                  {adminActiveCount}
                </strong>

                <span>
                  Active
                </span>
              </div>

              <div>
                <strong>
                  {numberFormat(
                    totalAdmins
                  )}
                </strong>

                <span>
                  Total
                </span>
              </div>

            </div>

            <button
              type="button"
              className="sa-report-link"
            >
              View Admins
              <ArrowUpRight
                size={14}
              />
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
                Recent Investors
              </h3>

              <p>
                Latest investors registered in the system
              </p>

            </div>

            <span className="sa-section-icon sa-tint-green">
              <Users size={17} />
            </span>

          </div>

          <div className="sa-investor-summary">

            <div>

              <span>
                Total Investors
              </span>

              <strong>
                {numberFormat(
                  totalInvestors
                )}
              </strong>

            </div>

            <span className="sa-growth-badge">
              <TrendingUp
                size={12}
              />

              {investorGrowthValue !==
              null
                ? `${investorGrowthValue}%`
                : "Live"}

            </span>

          </div>

          <div className="sa-investor-list">

            {recentInvestors.length ===
            0 ? (
              <div className="sa-investor-row">
                <div className="sa-investor-main">
                  <span>
                    No recent investors found.
                  </span>
                </div>
              </div>
            ) : (
              recentInvestors.map(
                (investor, index) => {

                  const name =
                    getValue(
                      investor,
                      [
                        "full_name",
                        "investor_name",
                        "name",
                      ],
                      "Investor"
                    );

                  const branch =
                    getValue(
                      investor,
                      [
                        "branch_name",
                        "branch",
                      ],
                      ""
                    );

                  const status =
                    getValue(
                      investor,
                      [
                        "status_name",
                        "status",
                      ],
                      "Active"
                    );

                  const createdAt =
                    getValue(
                      investor,
                      [
                        "created_at",
                        "created_date",
                        "registered_at",
                      ],
                      ""
                    );

                  const id =
                    getValue(
                      investor,
                      [
                        "investor_id",
                        "id",
                        "investor_registration_id",
                      ],
                      index
                    );

                  return (
                    <div
                      className="sa-investor-row"
                      key={id}
                    >

                      <div className="sa-investor-avatar">
                        {String(
                          name
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="sa-investor-main">

                        <strong>
                          {name}
                        </strong>

                        <span>
                          {branch ||
                            "Investor"}
                        </span>

                        <small>
                          {id}
                        </small>

                      </div>

                      <div className="sa-investor-right">

                        <strong>
                          {status}
                        </strong>

                        <span className="sa-investor-status">
                          {formatDate(
                            createdAt
                          )}
                        </span>

                      </div>

                    </div>
                  );
                }
              )
            )}

          </div>

          <div className="sa-investor-footer">

            <span>
              Showing latest{" "}
              {recentInvestorCount}{" "}
              investors
            </span>

            <button
              type="button"
              className="sa-report-link"
            >
              View Investors

              <ArrowUpRight
                size={14}
              />
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
                Real investment performance from the database
              </p>

            </div>

            <span className="sa-chart-head-icon sa-tint-blue">
              <TrendingUp
                size={17}
              />
            </span>

          </div>

          <div className="sa-chart-box">

            {investmentPerformance.length ===
            0 ? (
              <div className="sa-empty-chart">
                No investment performance data.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={290}
              >

                <AreaChart
                  data={
                    investmentPerformance
                  }
                  margin={{
                    top: 10,
                    right: 8,
                    left: -12,
                    bottom: 0,
                  }}
                >

                  <defs>

                    <linearGradient
                      id="investmentAreaDynamic"
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
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    content={
                      <ChartTooltip />
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="amount"
                    name="Investment"
                    stroke="#3b5bfe"
                    strokeWidth={2.5}
                    fill="url(#investmentAreaDynamic)"
                  />

                </AreaChart>

              </ResponsiveContainer>
            )}

          </div>

          <div className="sa-chart-footer-stats">

            <div>

              <span>
                Total AUM
              </span>

              <strong>
                {currencyFormat(
                  totalAum
                )}
              </strong>

            </div>

            <div>

              <span>
                Growth
              </span>

              <strong className="sa-positive">
                {monthlyGrowth !==
                null
                  ? `${monthlyGrowth}%`
                  : "-"}
              </strong>

            </div>

            <div>

              <span>
                Investments
              </span>

              <strong>
                {numberFormat(
                  totalInvestmentCount
                )}
              </strong>

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
                Current investment status distribution
              </p>

            </div>

            <span className="sa-chart-head-icon sa-tint-purple">
              <Wallet size={17} />
            </span>

          </div>

          <div className="sa-status-chart">

            {investmentStatus.length ===
            0 ? (
              <div className="sa-empty-chart">
                No status data.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={225}
              >

                <PieChart>

                  <Pie
                    data={
                      investmentStatus
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                  >

                    {investmentStatus.map(
                      (
                        item,
                        index
                      ) => (
                        <Cell
                          key={
                            item.name
                          }
                          fill={
                            pieColors[
                              index %
                                pieColors.length
                            ]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip
                    content={
                      <StatusTooltip />
                    }
                  />

                </PieChart>

              </ResponsiveContainer>
            )}

          </div>

          <div className="sa-status-list">

            {investmentStatus.map(
              (
                item,
                index
              ) => (
                <div
                  className="sa-status-row"
                  key={item.name}
                >

                  <div>

                    <i
                      style={{
                        background:
                          pieColors[
                            index %
                              pieColors.length
                          ],
                      }}
                    />

                    <span>
                      {item.name}
                    </span>

                  </div>

                  <strong>
                    {item.value}
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
                Investor registrations over time
              </p>

            </div>

            <span className="sa-chart-head-icon sa-tint-green">
              <Users size={17} />
            </span>

          </div>

          <div className="sa-chart-box">

            {investorGrowth.length ===
            0 ? (
              <div className="sa-empty-chart">
                No investor growth data.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={270}
              >

                <AreaChart
                  data={
                    investorGrowth
                  }
                  margin={{
                    top: 10,
                    right: 8,
                    left: -12,
                    bottom: 0,
                  }}
                >

                  <defs>

                    <linearGradient
                      id="investorGrowthDynamic"
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
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="investors"
                    name="Investors"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    fill="url(#investorGrowthDynamic)"
                  />

                </AreaChart>

              </ResponsiveContainer>
            )}

          </div>

          <div className="sa-mini-highlight">

            <div>

              <span>
                Current Investors
              </span>

              <strong>
                {numberFormat(
                  totalInvestors
                )}
              </strong>

            </div>

            <div className="sa-mini-growth">

              <TrendingUp
                size={13}
              />

              <span>
                {investorGrowthValue !==
                null
                  ? `${investorGrowthValue}% growth`
                  : "Live data"}
              </span>

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
              <Building2
                size={17}
              />
            </span>

          </div>

          <div className="sa-chart-box">

            {branchPerformance.length ===
            0 ? (
              <div className="sa-empty-chart">
                No branch performance data.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={270}
              >

                <BarChart
                  data={
                    branchPerformance
                  }
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
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

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
            )}

          </div>

        </section>

      </div>

    </div>
  );
}