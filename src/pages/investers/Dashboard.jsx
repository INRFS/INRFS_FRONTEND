import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CircleAlert,
  CircleCheck,
  Clock3,
  Download,
  Eye,
  IndianRupee,
  Plus,
  RefreshCw,
  TrendingUp,
  UserRound,
  Wallet,
  Award,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import getInvestorDashboard from "../../services/investorDashboardService";
import "../../Styles/Investor/Dashboard.css";

const formatCurrency = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(number);
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getValue = (object, keys, fallback = 0) => {
  if (!object) return fallback;

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

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value;

  if (value && typeof value === "object") {
    return [value];
  }

  return [];
};

const getStatusClass = (status) => {
  const value = String(status || "").toLowerCase();

  if (
    value.includes("active") ||
    value.includes("approved")
  ) {
    return "investor-status investor-status--active";
  }

  if (
    value.includes("pending") ||
    value.includes("approval")
  ) {
    return "investor-status investor-status--pending";
  }

  if (
    value.includes("reject") ||
    value.includes("closed") ||
    value.includes("refund")
  ) {
    return "investor-status investor-status--danger";
  }

  if (value.includes("mature")) {
    return "investor-status investor-status--matured";
  }

  return "investor-status";
};

export default function InvestorDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getInvestorDashboard();

      setDashboard(data);
    } catch (err) {
      console.error("Investor dashboard error:", err);

      setError(
        err?.message || "Unable to load investor dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const summary = useMemo(() => {
    const value =
      dashboard?.summary ||
      dashboard?.data?.summary ||
      {};

    return Array.isArray(value) ? value[0] || {} : value;
  }, [dashboard]);

  const investor = useMemo(() => {
    const value =
      dashboard?.investor ||
      dashboard?.data?.investor ||
      {};

    return Array.isArray(value) ? value[0] || {} : value;
  }, [dashboard]);

  const growth = useMemo(
    () =>
      normalizeArray(
        dashboard?.growth ||
          dashboard?.data?.growth
      ),
    [dashboard]
  );

  const portfolioSplit = useMemo(
    () =>
      normalizeArray(
        dashboard?.portfolio_split ||
          dashboard?.portfolioSplit ||
          dashboard?.data?.portfolio_split ||
          dashboard?.data?.portfolioSplit
      ),
    [dashboard]
  );

  const recentInvestments = useMemo(
    () =>
      normalizeArray(
        dashboard?.recent_investments ||
          dashboard?.recentInvestments ||
          dashboard?.data?.recent_investments ||
          dashboard?.data?.recentInvestments
      ),
    [dashboard]
  );

  const totalInvestment = Number(
    getValue(summary, [
      "total_investment",
      "total_investments",
      "total_invested",
      "investment_amount",
      "principal",
      "total_principal",
    ])
  );

  const earnedInterest = Number(
    getValue(summary, [
      "earned_interest",
      "interest_earned",
      "total_interest",
      "interest_amount",
    ])
  );

  const activeInvestment = Number(
    getValue(summary, [
      "active_investment",
      "active_investments",
      "active_amount",
      "total_active",
    ])
  );

  const pendingInvestment = Number(
    getValue(summary, [
      "pending_investment",
      "pending_investments",
      "pending_amount",
      "total_pending",
    ])
  );

  const maturityAmount = Number(
    getValue(summary, [
      "maturity_amount",
      "total_maturity",
      "expected_maturity",
      "maturity_value",
    ])
  );

  const investmentCount = Number(
    getValue(summary, [
      "investment_count",
      "total_investment_count",
      "total_investments_count",
      "count",
    ])
  );

  const activeCount = Number(
    getValue(summary, [
      "active_count",
      "active_investment_count",
    ])
  );

  const monthlyPayout = Number(
    getValue(summary, [
      "monthly_payout",
      "monthly_interest",
      "monthly_return",
      "payout",
    ])
  );

  const portfolioValue =
    Number(
      getValue(summary, [
        "portfolio_value",
        "current_portfolio_value",
      ])
    ) || totalInvestment + earnedInterest;

  const displayName =
    getValue(
      investor,
      ["full_name", "investor_name", "name"],
      "Investor"
    );

  const investorId = getValue(
    investor,
    ["investor_id", "login_id"],
    ""
  );

  /*
   * Prepare line chart.
   */
  const growthValues = growth.map((item, index) => ({
    label: getValue(
      item,
      [
        "month",
        "month_name",
        "period",
        "label",
        "year_month",
      ],
      `Month ${index + 1}`
    ),
    value: Number(
      getValue(item, [
        "amount",
        "value",
        "investment_amount",
        "total_amount",
        "total_investment",
        "portfolio_value",
      ])
    ),
  }));

  const chartValues =
    growthValues.length > 0
      ? growthValues
      : [
          {
            label: "Jan",
            value: totalInvestment * 0.25,
          },
          {
            label: "Feb",
            value: totalInvestment * 0.38,
          },
          {
            label: "Mar",
            value: totalInvestment * 0.47,
          },
          {
            label: "Apr",
            value: totalInvestment * 0.62,
          },
          {
            label: "May",
            value: totalInvestment * 0.75,
          },
          {
            label: "Jun",
            value: totalInvestment * 0.9,
          },
          {
            label: "Jul",
            value: totalInvestment,
          },
        ];

  const maxChartValue = Math.max(
    ...chartValues.map((item) => item.value),
    1
  );

  const chartWidth = 700;
  const chartHeight = 190;

  const chartPoints = chartValues.map((item, index) => {
    const x =
      chartValues.length === 1
        ? chartWidth / 2
        : (index / (chartValues.length - 1)) *
          chartWidth;

    const y =
      chartHeight -
      (item.value / maxChartValue) *
        (chartHeight - 20);

    return {
      ...item,
      x,
      y,
    };
  });

  const linePath = chartPoints
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  /*
   * Portfolio donut.
   */
  const portfolioItems = portfolioSplit.map(
    (item, index) => ({
      label: getValue(
        item,
        [
          "status_name",
          "investment_status",
          "status",
          "category",
          "label",
          "name",
        ],
        `Investment ${index + 1}`
      ),
      amount: Number(
        getValue(item, [
          "amount",
          "investment_amount",
          "total_amount",
          "value",
        ])
      ),
      percentage: Number(
        getValue(item, [
          "percentage",
          "percent",
          "share",
        ])
      ),
    })
  );

  const donutColors = [
    "#243f91",
    "#315bea",
    "#16a34a",
    "#f59e0b",
    "#7f56d9",
  ];

  const donutGradient = (() => {
    if (!portfolioItems.length) {
      return "conic-gradient(#315bea 0deg 360deg)";
    }

    let current = 0;

    const sections = portfolioItems.map(
      (item, index) => {
        const percentage =
          item.percentage ||
          (totalInvestment
            ? (item.amount / totalInvestment) * 100
            : 0);

        const start = current;
        current += percentage;

        return `${donutColors[index % donutColors.length]} ${start}% ${current}%`;
      }
    );

    return `conic-gradient(${sections.join(", ")})`;
  })();

  if (loading) {
    return (
      <div className="investor-dashboard-loading">
        <RefreshCw
          size={25}
          className="dashboard-spin"
        />
        <span>Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <div className="investor-dashboard">

      {/* HEADER */}

      <div className="dashboard-topbar">

        <div className="dashboard-heading">
          <p className="dashboard-eyebrow">
            Investor Portal
          </p>

        
         
        </div>

      </div>

      {error && (
        <div className="dashboard-error">
          <CircleAlert size={16} />
          <span>{error}</span>

          <button
            type="button"
            onClick={() => loadDashboard()}
          >
            Try Again
          </button>
        </div>
      )}

      {/* SIX STAT CARDS */}

      <div className="dashboard-stat-grid">

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span>Total Invested</span>
            <div className="dashboard-stat-icon dashboard-stat-icon--blue">
              <IndianRupee size={15} />
            </div>
          </div>

          <strong>
            {formatCurrency(totalInvestment)}
          </strong>

          <small>
            {investmentCount} investment
            {investmentCount === 1 ? "" : "s"}
          </small>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span>Interest Earned</span>
            <div className="dashboard-stat-icon dashboard-stat-icon--green">
              <TrendingUp size={15} />
            </div>
          </div>

          <strong>
            {formatCurrency(earnedInterest)}
          </strong>

          <small>Current earnings</small>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span>Active Investments</span>
            <div className="dashboard-stat-icon dashboard-stat-icon--purple">
              <Award size={15} />
            </div>
          </div>

          <strong>
            {activeCount}
          </strong>

          <small>
            {formatCurrency(activeInvestment)}
          </small>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span>Monthly Payout</span>
            <div className="dashboard-stat-icon dashboard-stat-icon--green">
              <Activity size={15} />
            </div>
          </div>

          <strong>
            {formatCurrency(monthlyPayout)}
          </strong>

          <small>Monthly return</small>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span>Portfolio Value</span>
            <div className="dashboard-stat-icon dashboard-stat-icon--blue">
              <Wallet size={15} />
            </div>
          </div>

          <strong>
            {formatCurrency(portfolioValue)}
          </strong>

          <small>Total current value</small>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span>Next Maturity</span>
            <div className="dashboard-stat-icon dashboard-stat-icon--amber">
              <CalendarDays size={15} />
            </div>
          </div>

          <strong>
            {maturityAmount
              ? formatCurrency(maturityAmount)
              : "0 Days"}
          </strong>

          <small>
            Expected maturity
          </small>
        </div>

      </div>

      <div className="dashboard-after-cards-actions">
        <div className="dashboard-header-actions">
          <button
            type="button"
            className="dashboard-outline-btn"
            onClick={() =>
              navigate("/investor/my-investments")
            }
          >
            <Eye size={14} />
            My Investments
          </button>

          <button
            type="button"
            className="dashboard-primary-btn"
            onClick={() =>
              navigate("/investor/invest-now")
            }
          >
            <Plus size={14} />
            Invest Now
          </button>

         
        </div>
      </div>

      {/* CHART AREA */}

      <div className="dashboard-chart-grid">

        {/* GROWTH */}

        <section className="dashboard-panel dashboard-growth-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>Investment Growth</h2>
              <p>
                Portfolio value over time
              </p>
            </div>

          </div>

          <div className="dashboard-line-chart">

            <div className="dashboard-y-axis">
              <span>
                ₹{Math.round(
                  maxChartValue / 1000
                )}K
              </span>

              <span>
                ₹{Math.round(
                  maxChartValue * 0.75 / 1000
                )}K
              </span>

              <span>
                ₹{Math.round(
                  maxChartValue * 0.5 / 1000
                )}K
              </span>

              <span>
                ₹{Math.round(
                  maxChartValue * 0.25 / 1000
                )}K
              </span>

              <span>₹0</span>
            </div>

            <div className="dashboard-chart-area">

              <div className="dashboard-chart-lines">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <svg
                className="dashboard-svg-chart"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="investmentLineGradient"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#315bea"
                      stopOpacity="0.18"
                    />
                    <stop
                      offset="100%"
                      stopColor="#315bea"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  d={`${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
                  fill="url(#investmentLineGradient)"
                />

                <path
                  d={linePath}
                  fill="none"
                  stroke="#315bea"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {chartPoints.map(
                  (point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="3"
                      fill="#ffffff"
                      stroke="#315bea"
                      strokeWidth="2"
                    />
                  )
                )}
              </svg>

              <div className="dashboard-x-axis">
                {chartPoints.map(
                  (point, index) => (
                    <span key={index}>
                      {point.label}
                    </span>
                  )
                )}
              </div>

            </div>

          </div>

        </section>

        {/* DONUT */}

        <section className="dashboard-panel dashboard-distribution-panel">

          <div className="dashboard-panel-header">
            <div>
              <h2>Portfolio Distribution</h2>
            </div>
          </div>

          <div className="dashboard-distribution">

            <div className="dashboard-donut">
              <div
                className="dashboard-donut-ring"
                style={{
                  background: donutGradient,
                }}
              >
                <div className="dashboard-donut-center">
                  <strong>
                    {formatCurrency(
                      totalInvestment
                    )}
                  </strong>
                  <span>Portfolio</span>
                </div>
              </div>
            </div>

            <div className="dashboard-donut-legend">

              {portfolioItems.length > 0 ? (
                portfolioItems.map(
                  (item, index) => {
                    const percentage =
                      item.percentage ||
                      (totalInvestment
                        ? (item.amount /
                            totalInvestment) *
                          100
                        : 0);

                    return (
                      <div
                        className="dashboard-legend-row"
                        key={`${item.label}-${index}`}
                      >
                        <span
                          className="dashboard-legend-dot"
                          style={{
                            background:
                              donutColors[
                                index %
                                  donutColors.length
                              ],
                          }}
                        />

                        <span className="dashboard-legend-name">
                          {item.label}
                        </span>

                        <strong>
                          {percentage.toFixed(0)}%
                        </strong>
                      </div>
                    );
                  }
                )
              ) : (
                <div className="dashboard-no-data">
                  No portfolio data
                </div>
              )}

            </div>

          </div>

        </section>

      </div>

      {/* LOWER AREA */}

      <div className="dashboard-lower-grid">

        {/* RECENT */}

        <section className="dashboard-panel dashboard-recent-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>Recent Investments</h2>
            </div>

            <button
              type="button"
              className="dashboard-view-all"
              onClick={() =>
                navigate(
                  "/investor/my-investments"
                )
              }
            >
              View All
              <ArrowUpRight size={14} />
            </button>

          </div>

          {recentInvestments.length > 0 ? (
            <div className="dashboard-table-wrap">

              <table className="dashboard-investment-table">

                <thead>
                  <tr>
                    <th>Bond Number</th>
                    <th>Amount</th>
                    <th>Rate</th>
                    <th>Invested On</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {recentInvestments.map(
                    (investment, index) => {

                      const investmentId =
                        getValue(
                          investment,
                          [
                            "investment_id",
                            "investmentId",
                            "bond_number",
                            "id",
                          ],
                          `INV-${index + 1}`
                        );

                      const amount =
                        Number(
                          getValue(
                            investment,
                            [
                              "investment_amount",
                              "amount",
                              "principal",
                            ]
                          )
                        );

                      const rate =
                        getValue(
                          investment,
                          [
                            "interest_rate",
                            "rate",
                            "interest",
                          ],
                          0
                        );

                      const investedOn =
                        getValue(
                          investment,
                          [
                            "investment_date",
                            "invested_on",
                            "invested_date",
                            "created_at",
                          ],
                          null
                        );

                      const status =
                        getValue(
                          investment,
                          [
                            "investment_status",
                            "status_name",
                            "status",
                          ],
                          "Pending"
                        );

                      const databaseId =
                        getValue(
                          investment,
                          [
                            "investment_id",
                            "id",
                          ],
                          ""
                        );

                      return (
                        <tr
                          key={`${investmentId}-${index}`}
                        >

                          <td>
                            <strong>
                              {investmentId}
                            </strong>
                          </td>

                          <td>
                            {formatCurrency(
                              amount
                            )}
                          </td>

                          <td>
                            <span className="dashboard-rate">
                              {rate}% p.a.
                            </span>
                          </td>

                          <td>
                            <span className="dashboard-date">
                              {formatDate(
                                investedOn
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={getStatusClass(
                                status
                              )}
                            >
                              {status}
                            </span>
                          </td>

                          <td>
                            <div className="dashboard-action-group">

                              <button
                                type="button"
                                className="dashboard-eye-btn"
                                onClick={() =>
                                  navigate(
                                    `/investor/my-investments/${databaseId}`
                                  )
                                }
                              >
                                <Eye size={13} />
                              </button>

                              <button
                                type="button"
                                className="dashboard-bond-btn"
                              >
                                <Download size={12} />
                                Bond
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    }
                  )}
                </tbody>

              </table>

            </div>
          ) : (
            <div className="dashboard-empty">
              <Wallet size={24} />
              <strong>
                No investments yet
              </strong>
              <span>
                Start your first investment to see it here.
              </span>
            </div>
          )}

        </section>

        {/* SIDE */}

        <div className="dashboard-side">

          {/* QUICK ACTIONS */}

          <section className="dashboard-panel dashboard-quick-panel">

            <div className="dashboard-side-title">
              Quick Actions
            </div>

            <button
              type="button"
              className="quick-action quick-action--primary"
              onClick={() =>
                navigate("/investor/invest-now")
              }
            >
              <Plus size={13} />
              Invest Now
            </button>

            <button
              type="button"
              className="quick-action"
              onClick={() =>
                navigate(
                  "/investor/my-investments"
                )
              }
            >
              <Award size={13} />
              My Bonds
            </button>

            <button
              type="button"
              className="quick-action"
            >
              <Download size={13} />
              Download Bond Certificate
            </button>

            <button
              type="button"
              className="quick-action"
              onClick={() =>
                navigate("/investor/profile")
              }
            >
              <UserRound size={13} />
              Update Profile
            </button>

          </section>

          {/* NOTIFICATIONS */}

          <section className="dashboard-panel dashboard-notification-panel">

            <div className="dashboard-notification-header">
              <span>
                Recent Notifications
              </span>

              <button type="button">
                All
              </button>
            </div>

            <div className="dashboard-notifications">

              <div className="dashboard-notification">
                <div className="notification-icon">
                  <CircleCheck size={13} />
                </div>

                <div>
                  <strong>
                    Investment Approved
                  </strong>

                  <p>
                    Your investment has been approved.
                  </p>

                  <small>
                    2 hours ago
                  </small>
                </div>
              </div>

              <div className="dashboard-notification">
                <div className="notification-icon">
                  <Award size={13} />
                </div>

                <div>
                  <strong>
                    Bond Generated
                  </strong>

                  <p>
                    Your bond certificate has been generated.
                  </p>

                  <small>
                    2 hours ago
                  </small>
                </div>
              </div>

              <div className="dashboard-notification">
                <div className="notification-icon">
                  <IndianRupee size={13} />
                </div>

                <div>
                  <strong>
                    Interest Credited
                  </strong>

                  <p>
                    Monthly interest has been credited.
                  </p>

                  <small>
                    5 days ago
                  </small>
                </div>
              </div>

            </div>

          </section>

        </div>

      </div>

    </div>
  );
}