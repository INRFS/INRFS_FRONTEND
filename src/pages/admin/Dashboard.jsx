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
  Check,
  X,
  Eye,
  RefreshCw,
  AlertCircle,
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
        source?.recentInvestments
    ),

    kycPendingList: getArray(
      source?.kyc_pending_list ||
        source?.kycPendingList ||
        source?.pending_kyc_list ||
        source?.pendingKycList
    ),
  };
};

const normalizeInvestorGrowth = (response) => {
  const list = getArray(response);

  return list.map((item) => ({
    month:
      item?.month ||
      item?.month_name ||
      item?.monthName ||
      item?.label ||
      "",

    count: Number(
      getValue(
        item,
        [
          "count",
          "investor_count",
          "investors",
          "total_investors",
          "value",
        ],
        0
      )
    ),
  }));
};

const normalizeInvestmentTrend = (response) => {
  const list = getArray(response);

  return list.map((item) => ({
    month:
      item?.month ||
      item?.month_name ||
      item?.monthName ||
      item?.label ||
      "",

    amount: Number(
      getValue(
        item,
        [
          "amount",
          "investment_amount",
          "total_amount",
          "investment",
          "value",
        ],
        0
      )
    ),
  }));
};

const normalizeRecentActivity = (list) => {
  return list.map((item, index) => ({
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

        const summary =
          normalizeSummary(
            response.summary
          );

        const trend =
          normalizeInvestmentTrend(
            response.investmentTrend
          );

        const growth =
          normalizeInvestorGrowth(
            response.investorGrowth
          );

        setDashboard({
          ...summary,
          recentActivity:
            normalizeRecentActivity(
              summary.recentActivity
            ),
          kycPendingList:
            normalizeKycPending(
              summary.kycPendingList
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
        <div className="panel">
          <div className="panel-title">
            Monthly Investment Trend
          </div>

          <div className="panel-sub">
            Investment amount per month
          </div>

          <ResponsiveContainer
            width="100%"
            height={260}
          >
            <BarChart
              data={investmentTrend}
            >
              <CartesianGrid
                stroke="#eef0f6"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tick={{
                  fontSize: 11,
                  fill: "#9aa1b5",
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fontSize: 11,
                  fill: "#9aa1b5",
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  `₹${value}`
                }
              />

              <Tooltip
                content={
                  <CustomTooltip />
                }
                cursor={{
                  fill: "#f1f3fa",
                }}
              />

              <Bar
                dataKey="amount"
                fill="#2f5cf0"
                radius={[
                  4,
                  4,
                  0,
                  0,
                ]}
                maxBarSize={38}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="panel-title">
            Investor Growth
          </div>

          <div className="panel-sub">
            Investor count growth
          </div>

          <ResponsiveContainer
            width="100%"
            height={260}
          >
            <LineChart
              data={investorGrowth}
            >
              <CartesianGrid
                stroke="#eef0f6"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tick={{
                  fontSize: 11,
                  fill: "#9aa1b5",
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fontSize: 11,
                  fill: "#9aa1b5",
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="count"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={{
                  r: 4,
                  fill: "#16a34a",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="panel">
          <div className="panel-header-row">
            <div>
              <div className="panel-title">
                Recent Activity
              </div>

              <div className="panel-sub">
                Latest investor activity
              </div>
            </div>

            <button
              type="button"
              className="link-btn"
              onClick={() =>
                navigate(
                  "/admin/investors"
                )
              }
            >
              View All
            </button>
          </div>

          <div className="activity-table-wrapper">
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
                {dashboard.recentActivity
                  .length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign:
                          "center",
                        padding: "30px",
                      }}
                    >
                      No recent activity
                    </td>
                  </tr>
                ) : (
                  dashboard.recentActivity.map(
                    (row, index) => (
                      <tr
                        key={`${row.id}-${index}`}
                      >
                        <td>
                          <div className="investor-cell">
                            <span className="investor-avatar">
                              {getInitial(
                                row.name
                              )}
                            </span>

                            <div>
                              <div className="investor-name">
                                {row.name}
                              </div>

                              <div className="investor-id">
                                {row.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="branch-cell">
                          {row.branch}
                        </td>

                        <td>
                          <span
                            className={`badge badge-${String(
                              row.kyc
                            )
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}`}
                          >
                            {row.kyc}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`badge badge-${String(
                              row.status
                            )
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}`}
                          >
                            {row.status}
                          </span>
                        </td>

                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="icon-btn icon-btn-green"
                              title="Approve"
                            >
                              <Check
                                size={13}
                              />
                            </button>

                            <button
                              type="button"
                              className="icon-btn icon-btn-red"
                              title="Reject"
                            >
                              <X
                                size={13}
                              />
                            </button>

                            <button
                              type="button"
                              className="icon-btn icon-btn-neutral"
                              title="View"
                            >
                              <Eye
                                size={13}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
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
                <div
                  style={{
                    padding:
                      "20px 0",
                    textAlign:
                      "center",
                    color:
                      "#8a94a6",
                  }}
                >
                  No pending KYC
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
                        className="btn btn-primary btn-sm"
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