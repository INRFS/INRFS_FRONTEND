import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
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
  Eye,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  getAdminDashboardData,
} from "../../services/admin/adminDashboardService";
import "../../Styles/Admin/Dashboard.css";

const getValue = (obj, keys, fallback = 0) => {
  if (!obj) return fallback;

  for (const key of keys) {
    if (
      obj[key] !== undefined &&
      obj[key] !== null &&
      obj[key] !== ""
    ) {
      return obj[key];
    }
  }

  return fallback;
};

const getArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  if (Array.isArray(value?.results)) {
    return value.results;
  }

  if (Array.isArray(value?.rows)) {
    return value.rows;
  }

  return [];
};

const formatNumber = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-IN").format(
    number
  );
};

const formatCurrency = (value) => {
  const number = Number(value || 0);

  return `₹${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(number)}`;
};

const formatCompactCurrency = (value) => {
  const number = Number(value || 0);

  if (Math.abs(number) >= 10000000) {
    return `₹${(number / 10000000).toFixed(1)}Cr`;
  }

  if (Math.abs(number) >= 100000) {
    return `₹${(number / 100000).toFixed(1)}L`;
  }

  if (Math.abs(number) >= 1000) {
    return `₹${(number / 1000).toFixed(1)}K`;
  }

  return `₹${Math.round(number)}`;
};

const formatCompactNumber = (value) => {
  const number = Number(value || 0);

  if (Math.abs(number) >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (Math.abs(number) >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }

  return `${Math.round(number)}`;
};

const formatAum = (value) => {
  const number = Number(value || 0);

  if (number >= 10000000) {
    return `₹${(number / 10000000).toFixed(2)}Cr`;
  }

  if (number >= 100000) {
    return `₹${(number / 100000).toFixed(2)}L`;
  }

  return formatCurrency(number);
};

const getInitial = (name) => {
  if (!name) return "?";

  return String(name)
    .trim()
    .charAt(0)
    .toUpperCase();
};

const normalizeSummary = (summary) => {
  const source =
    summary?.data ||
    summary?.summary ||
    summary ||
    {};

  return {
    totalInvestors: getValue(
      source,
      [
        "total_investors",
        "totalInvestors",
        "investor_count",
        "investors_count",
      ],
      0
    ),

    pendingKyc: getValue(
      source,
      [
        "pending_kyc",
        "pendingKyc",
        "kyc_pending",
        "pending_kyc_count",
      ],
      0
    ),

    activeInvestments: getValue(
      source,
      [
        "active_investments",
        "activeInvestments",
        "active_investment_count",
      ],
      0
    ),

    totalAum: getValue(
      source,
      [
        "total_aum",
        "totalAum",
        "aum",
        "total_investment_amount",
      ],
      0
    ),

    monthlyInterestDue: getValue(
      source,
      [
        "monthly_interest_due",
        "monthlyInterestDue",
        "interest_due",
        "monthly_interest",
      ],
      0
    ),

    pendingApprovals: getValue(
      source,
      [
        "pending_approvals",
        "pendingApprovals",
        "pending_investments",
        "pending_investment_count",
      ],
      0
    ),

    closedInvestments: getValue(
      source,
      [
        "closed_investments",
        "closedInvestments",
        "closed_investment_count",
      ],
      0
    ),

    branchCount: getValue(
      source,
      [
        "branch_count",
        "branchCount",
        "total_branches",
        "active_branches",
      ],
      0
    ),

    recentActivity: getArray(
      source?.recent_activity ||
        source?.recentActivity ||
        source?.recent_investments ||
        source?.recentInvestments ||
        source?.recent_activity_list ||
        source?.recentActivityList
    ),

    kycPendingList: getArray(
      source?.kyc_pending_list ||
        source?.kycPendingList ||
        source?.pending_kyc_list ||
        source?.pendingKycList ||
        source?.kyc_pending ||
        source?.kycPending
    ),
  };
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const monthIndex = (value) => {
  const text = String(value || "").trim().slice(0, 3).toLowerCase();
  return MONTHS.findIndex(
    (month) => month.toLowerCase() === text
  );
};

const normalizeMonthlyData = (response, valueKeys, outputKey) => {
  const list = getArray(response);
  const source = new Map();

  list.forEach((item) => {
    const index = monthIndex(
      item?.month ||
      item?.month_name ||
      item?.monthName ||
      item?.label
    );

    if (index < 0) return;

    source.set(
      index,
      Number(getValue(item, valueKeys, 0))
    );
  });

  const currentMonth = new Date().getMonth();

  return MONTHS
    .slice(0, currentMonth + 1)
    .map((month, index) => ({
      month,
      [outputKey]: source.get(index) || 0,
    }));
};

const normalizeInvestorGrowth = (response) =>
  normalizeMonthlyData(
    response,
    [
      "count",
      "investor_count",
      "investors",
      "total_investors",
      "value",
    ],
    "count"
  );

const normalizeInvestmentTrend = (response) =>
  normalizeMonthlyData(
    response,
    [
      "amount",
      "investment_amount",
      "total_amount",
      "investment",
      "value",
    ],
    "amount"
  );

const normalizeRecentActivity = (list) => {
  const ordered = [...list].sort((a, b) => {
    const aDate =
      a?.created_at ||
      a?.createdAt ||
      a?.registration_date ||
      a?.registrationDate ||
      a?.investment_date ||
      a?.investmentDate ||
      a?.date ||
      "";

    const bDate =
      b?.created_at ||
      b?.createdAt ||
      b?.registration_date ||
      b?.registrationDate ||
      b?.investment_date ||
      b?.investmentDate ||
      b?.date ||
      "";

    if (!aDate || !bDate) return 0;

    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  return ordered.map((item, index) => ({
    id:
      item?.investment_id ||
      item?.investor_registration_id ||
      item?.investor_id ||
      item?.id ||
      `INV${index + 1}`,

    name:
      item?.investor_name ||
      item?.full_name ||
      item?.name ||
      item?.investor ||
      "Unknown Investor",

    branch:
      item?.branch_name ||
      item?.branch ||
      item?.branchName ||
      "—",

    kyc:
      item?.kyc_status ||
      item?.kycStatus ||
      item?.kyc ||
      "Pending",

    status:
      item?.investment_status ||
      item?.investment_status_name ||
      item?.status_name ||
      item?.status ||
      "Pending",
  }));
};

const normalizeKycPending = (list) => {
  return list.map((item, index) => ({
    id:
      item?.investor_registration_id ||
      item?.investor_id ||
      item?.id ||
      index,

    name:
      item?.investor_name ||
      item?.full_name ||
      item?.name ||
      "Unknown Investor",

    tint:
      index % 2 === 0
        ? "amber"
        : "blue",
  }));
};

function CustomTooltip({
  active,
  payload,
  label,
}) {
  if (
    active &&
    payload &&
    payload.length
  ) {
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-label">
          {label}
        </div>

        <div className="chart-tooltip-value">
          Invested:{" "}
          {formatCurrency(payload[0].value)}
        </div>
      </div>
    );
  }

  return null;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState({
      totalInvestors: 0,
      pendingKyc: 0,
      activeInvestments: 0,
      totalAum: 0,
      monthlyInterestDue: 0,
      pendingApprovals: 0,
      closedInvestments: 0,
      branchCount: 0,
      recentActivity: [],
      kycPendingList: [],
    });

  const [investmentTrend, setInvestmentTrend] =
    useState([]);

  const [investorGrowth, setInvestorGrowth] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadDashboard =
    useCallback(async () => {
      try {
        setError("");

        const response =
          await getAdminDashboardData();

        const responseData =
          response?.data || response || {};

        const summary =
          normalizeSummary(
            response?.summary ||
              responseData?.summary ||
              responseData
          );

        const trend =
          normalizeInvestmentTrend(
            response?.investmentTrend ||
              responseData?.investmentTrend ||
              responseData?.investment_trend
          );

        const growth =
          normalizeInvestorGrowth(
            response?.investorGrowth ||
              responseData?.investorGrowth ||
              responseData?.investor_growth
          );

        const recentActivitySource =
          response?.recentActivity ||
          response?.recent_activity ||
          responseData?.recentActivity ||
          responseData?.recent_activity ||
          responseData?.recentInvestments ||
          responseData?.recent_investments ||
          summary.recentActivity;

        const kycPendingSource =
          response?.kycPendingList ||
          response?.kyc_pending_list ||
          responseData?.kycPendingList ||
          responseData?.kyc_pending_list ||
          responseData?.pendingKycList ||
          responseData?.pending_kyc_list ||
          summary.kycPendingList;

        setDashboard({
          ...summary,
          recentActivity:
            normalizeRecentActivity(
              getArray(recentActivitySource)
            ).slice(0, 4),
          kycPendingList:
            normalizeKycPending(
              getArray(kycPendingSource)
            ),
        });

        setInvestmentTrend(trend);
        setInvestorGrowth(growth);
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
  };

  const stats = [
    {
      label: "TOTAL INVESTORS",
      value: formatNumber(
        dashboard.totalInvestors
      ),
      icon: Users,
      tint: "blue",
    },
    {
      label: "PENDING KYC",
      value: formatNumber(
        dashboard.pendingKyc
      ),
      icon: FileText,
      tint: "amber",
    },
    {
      label: "ACTIVE INVESTMENTS",
      value: formatNumber(
        dashboard.activeInvestments
      ),
      icon: TrendingUp,
      tint: "green",
    },
    {
      label: "TOTAL AUM",
      value: formatAum(
        dashboard.totalAum
      ),
      icon: DollarSign,
      tint: "blue",
    },
    {
      label: "MONTHLY INTEREST DUE",
      value: formatCurrency(
        dashboard.monthlyInterestDue
      ),
      icon: Calendar,
      tint: "purple",
    },
    {
      label: "PENDING APPROVALS",
      value: formatNumber(
        dashboard.pendingApprovals
      ),
      icon: Clock,
      tint: "amber",
    },
    {
      label: "CLOSED INVESTMENTS",
      value: formatNumber(
        dashboard.closedInvestments
      ),
      icon: CheckCircle2,
      tint: "teal",
    },
    {
      label: "BRANCH COUNT",
      value: formatNumber(
        dashboard.branchCount
      ),
      icon: Building2,
      tint: "purple",
    },
  ];

  return (
    <>
      <div className="dash-header">
       

     

      <div className="stat-grid">
        {stats.map((s) => (
          <div
            className="stat-card"
            key={s.label}
          >
            <div className="stat-card-top">
              <span className="stat-label">
                {s.label}
              </span>

              <span
                className={`stat-icon stat-icon-${s.tint}`}
              >
                <s.icon size={15} />
              </span>
            </div>

            <div className="stat-value">
              {loading ? "—" : s.value}
            </div>

          
          </div>
        ))}
      </div>
         <div className="dash-header-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() =>
              navigate("/admin/reports")
            }
          >
            <BarChart3 size={15} />
            Reports
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              navigate(
                "/admin/investments"
              )
            }
          >
            <Plus size={15} />
            View Investments
          </button>

        
        </div>
      </div>

      {error && (
        <div className="dashboard-error">
          <AlertCircle size={17} />
          <span>{error}</span>

          <button
            type="button"
            onClick={handleRefresh}
          >
            Retry
          </button>
        </div>
      )}

      <div className="chart-grid">
        <div className="panel chart-panel">
          <div className="panel-title">Monthly Investment Trend</div>
          <div className="panel-sub">Investment amount per month</div>

          {investmentTrend.length === 0 ? (
            <div className="chart-empty">
              <BarChart3 size={22} />
              <strong>No investment trend data</strong>
              <span>Monthly investment data will appear here.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={285}>
              <AreaChart
                data={investmentTrend}
                margin={{ top: 10, right: 12, left: 4, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="investmentTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopOpacity={0.28} />
                    <stop offset="100%" stopOpacity={0.03} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#eef0f6"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 13,
                    fontWeight: 700,
                    fill: "#68758d",
                  }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />

                <YAxis
                  width={62}
                  tick={{
                    fontSize: 12,
                    fontWeight: 600,
                    fill: "#68758d",
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCompactCurrency}
                />

                <Tooltip
                  formatter={(value) => [
                    formatCurrency(value),
                    "Investment",
                  ]}
                  labelStyle={{
                    fontWeight: 800,
                    color: "#0b1220",
                  }}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #dfe5ef",
                    boxShadow: "0 12px 28px rgba(20,30,60,.12)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#2f5cf0"
                  strokeWidth={3}
                  fill="url(#investmentTrendFill)"
                  dot={{
                    r: 4,
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="panel chart-panel">
          <div className="panel-title">Investor Growth</div>
          <div className="panel-sub">Total investor count by month</div>

          {investorGrowth.length === 0 ? (
            <div className="chart-empty">
              <Users size={22} />
              <strong>No investor growth data</strong>
              <span>Monthly investor counts will appear here.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={275}>
              <AreaChart
                data={investorGrowth}
                margin={{ top: 14, right: 10, left: 0, bottom: 2 }}
              >
                <defs>
                  <linearGradient id="investorGrowthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22a05a" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#22a05a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#eef0f6"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 12,
                    fontWeight: 700,
                    fill: "#68758d",
                  }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />

                <YAxis
                  width={32}
                  allowDecimals={false}
                  tick={{
                    fontSize: 11,
                    fontWeight: 600,
                    fill: "#68758d",
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCompactNumber}
                />

                <Tooltip
                  formatter={(value) => [
                    formatNumber(value),
                    "Investors",
                  ]}
                  labelStyle={{
                    fontWeight: 800,
                    color: "#0b1220",
                  }}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #dfe5ef",
                    boxShadow: "0 12px 28px rgba(20,30,60,.12)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#16a34a"
                  strokeWidth={3}
                  fill="url(#investorGrowthFill)"
                  dot={{
                    r: 4,
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="bottom-grid">
        <div className="panel recent-investors-panel">
          <div className="panel-header-row recent-investors-header">
            <div>
              <div className="panel-title">Recent Investors</div>
              <div className="panel-sub">Latest 4 investor registrations</div>
            </div>

            <button
              type="button"
              className="link-btn"
              onClick={() => navigate("/admin/investors")}
            >
              View All
            </button>
          </div>

          <div className="recent-investors-list">
            {dashboard.recentActivity.length === 0 ? (
              <div className="dashboard-empty dashboard-empty-compact">
                <Clock size={20} />
                <strong>No recent investors</strong>
                <span>Latest investor registrations will appear here.</span>
              </div>
            ) : (
              dashboard.recentActivity.map((row, index) => (
                <div
                  className="recent-investor-row"
                  key={`${row.id}-${index}`}
                >
                  <div className="recent-investor-main">
                    <span className="investor-avatar">
                      {getInitial(row.name)}
                    </span>

                    <div className="recent-investor-info">
                      <div className="investor-name">{row.name}</div>
                      <div className="investor-id">{row.id}</div>
                    </div>
                  </div>

                  <div className="recent-investor-branch">
                    <span className="recent-label">Branch</span>
                    <span>{row.branch}</span>
                  </div>

                  <div className="recent-investor-status">
                    <span className="recent-label">Status</span>
                    <span
                      className={`badge badge-${String(row.status)
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {row.status}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="activity-view-btn"
                    onClick={() => navigate("/admin/investors")}
                  >
                    <Eye size={13} />
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="side-col">
          <div className="panel">
            <div className="panel-title">
              Quick Actions
            </div>

            <div className="quick-actions">
              <button
                type="button"
                className="quick-action"
                onClick={() =>
                  navigate(
                    "/admin/investors"
                  )
                }
              >
                <span>
                  <FileText size={14} />
                  KYC Approvals
                </span>

                <span className="qa-badge">
                  {dashboard.pendingKyc}
                </span>
              </button>

              <button
                type="button"
                className="quick-action"
                onClick={() =>
                  navigate(
                    "/admin/investments"
                  )
                }
              >
                <TrendingUp size={14} />
                Investment Management

                <span className="qa-badge">
                  {dashboard.pendingApprovals}
                </span>
              </button>

              <button
                type="button"
                className="quick-action"
                onClick={() =>
                  navigate(
                    "/admin/monthly-interest"
                  )
                }
              >
                <DollarSign size={14} />
                Monthly Interest
              </button>

              <button
                type="button"
                className="quick-action"
                onClick={() =>
                  navigate(
                    "/admin/reports"
                  )
                }
              >
                <BarChart3 size={14} />
                Generate Reports
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">
              KYC Pending
            </div>

            <div className="kyc-pending-list">
              {dashboard.kycPendingList
                .length === 0 ? (
                <div className="dashboard-empty dashboard-empty-compact">
                  <FileText size={20} />
                  <strong>No pending KYC</strong>
                  <span>Investors waiting for KYC review will appear here.</span>
                </div>
              ) : (
                dashboard.kycPendingList.map(
                  (item) => (
                    <div
                      className="kyc-pending-row"
                      key={item.id}
                    >
                      <div className="investor-cell">
                        <span
                          className={`investor-avatar investor-avatar-${item.tint}`}
                        >
                          {getInitial(
                            item.name
                          )}
                        </span>

                        <span className="investor-name">
                          {item.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm kyc-review-btn"
                        onClick={() =>
                          navigate(
                            "/admin/investors"
                          )
                        }
                      >
                        Review
                      </button>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}