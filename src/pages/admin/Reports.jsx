import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Download,
  RefreshCw,
  Users,
  TrendingUp,
  Wallet,
  Percent,
  CheckCircle2,
  Clock3,
  XCircle,
  Building2,
  FileDown,
  Eye,
} from "lucide-react";

import "../../Styles/Admin/Reports.css";

import {
  getReportDashboard,
  exportReportCSV,
} from "../../services/admin/reportService";

const formatINR = (value) => {
  const number = Number(value || 0);

  if (number >= 10000000) {
    return `₹${(number / 10000000).toFixed(2)}Cr`;
  }

  if (number >= 100000) {
    return `₹${(number / 100000).toFixed(2)}L`;
  }

  if (number >= 1000) {
    return `₹${(number / 1000).toFixed(1)}K`;
  }

  return `₹${number.toLocaleString("en-IN")}`;
};

const formatINRFull = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const getValue = (object, keys, fallback = 0) => {
  for (const key of keys) {
    if (
      object?.[key] !== undefined &&
      object?.[key] !== null &&
      object?.[key] !== ""
    ) {
      return object[key];
    }
  }

  return fallback;
};

const getInvestorKey = (item, index) => {
  const investorId = getValue(
    item,
    [
      "investor_registration_id",
      "investor_id",
      "investorId",
      "registration_id",
      "login_id",
      "user_id",
    ],
    ""
  );

  const investorName = getValue(
    item,
    [
      "investor_name",
      "investor",
      "full_name",
      "name",
    ],
    "Unknown Investor"
  );

  return (
    String(investorId || "").trim() ||
    String(investorName).trim().toLowerCase() ||
    `investor-${index}`
  );
};

const getInvestorName = (item) =>
  getValue(
    item,
    [
      "investor_name",
      "investor",
      "full_name",
      "name",
    ],
    "Unknown Investor"
  );

const getInvestorId = (item) =>
  getValue(
    item,
    [
      "investor_registration_id",
      "investor_id",
      "investorId",
      "registration_id",
      "login_id",
    ],
    "—"
  );

const getInvestmentStatus = (item) => {
  const raw = getValue(
    item,
    [
      "status_name",
      "investment_status",
      "status",
    ],
    "Unknown"
  );

  return String(raw).trim();
};

const getInvestmentAmount = (item) =>
  Number(
    getValue(
      item,
      [
        "investment_amount",
        "amount",
        "total_amount",
      ],
      0
    ) || 0
  );

const getInvestmentInterest = (item) =>
  Number(
    getValue(
      item,
      [
        "earned",
        "earned_amount",
        "expected_interest_amount",
        "interest_amount",
      ],
      0
    ) || 0
  );

const getInvestmentDate = (item) =>
  getValue(
    item,
    [
      "investment_date",
      "created_at",
      "date",
    ],
    ""
  );

const Stat = ({
  label,
  value,
  icon: Icon,
  type,
  subtitle,
}) => (
  <div className="report-stat-card">
    <div className="report-stat-top">
      <span className="report-stat-label">
        {label}
      </span>

      <span
        className={`report-stat-icon report-stat-icon--${type}`}
      >
        <Icon size={18} />
      </span>
    </div>

    <div className="report-stat-value">
      {value}
    </div>

    <div className="report-stat-subtitle">
      {subtitle}
    </div>
  </div>
);

export default function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedInvestor, setSelectedInvestor] = useState(null);

  const loadReports = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getReportDashboard();
      setDashboard(response);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load reports."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const summary = dashboard?.summary || {};
  const recentInvestments =
    dashboard?.recent_investments || [];

  const investorSummary = useMemo(() => {
    const map = new Map();

    recentInvestments.forEach(
      (item, index) => {
        const key = getInvestorKey(
          item,
          index
        );

        const current = map.get(key) || {
          investor_key: key,
          investor_id: getInvestorId(item),
          investor_name:
            getInvestorName(item),
          investments_count: 0,
          total_invested: 0,
          total_interest: 0,
          active_count: 0,
          pending_count: 0,
          rejected_count: 0,
          closed_count: 0,
          latest_date: "",
          investment_ids: [],
          investments: [],
        };

        const status =
          getInvestmentStatus(item)
            .toLowerCase();

        const investmentAmount =
          getInvestmentAmount(item);

        const interestAmount =
          getInvestmentInterest(item);

        const date =
          getInvestmentDate(item);

        current.investments_count += 1;
        current.total_invested +=
          investmentAmount;
        current.investments.push(item);
        current.total_interest +=
          interestAmount;

        if (
          status === "active" ||
          status === "approved"
        ) {
          current.active_count += 1;
        }

        if (
          status === "pending" ||
          status ===
            "pending approval"
        ) {
          current.pending_count += 1;
        }

        if (
          status === "rejected" ||
          status === "reject"
        ) {
          current.rejected_count += 1;
        }

        if (
          status === "closed" ||
          status === "settled"
        ) {
          current.closed_count += 1;
        }

        if (!current.latest_date && date) {
          current.latest_date = date;
        } else if (
          current.latest_date &&
          date
        ) {
          const currentTime =
            new Date(
              current.latest_date
            ).getTime();

          const newTime =
            new Date(date).getTime();

          if (
            Number.isFinite(newTime) &&
            (!Number.isFinite(
              currentTime
            ) ||
              newTime > currentTime)
          ) {
            current.latest_date = date;
          }
        }

        const investmentId =
          getValue(
            item,
            [
              "investment_id",
              "investmentId",
              "bond_id",
              "bond_number",
              "id",
            ],
            ""
          );

        if (investmentId) {
          current.investment_ids.push(
            String(investmentId)
          );
        }

        map.set(key, current);
      }
    );

    const query =
      search.trim().toLowerCase();

    return Array.from(map.values())
      .filter((item) => {
        if (!query) {
          return true;
        }

        return [
          item.investor_name,
          item.investor_id,
          item.investment_ids.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort(
        (a, b) =>
          b.total_invested -
          a.total_invested
      );
  }, [recentInvestments, search]);

  const totalGroupedInvestment =
    investorSummary.reduce(
      (sum, item) =>
        sum + item.total_invested,
      0
    );

  const totalGroupedInterest =
    investorSummary.reduce(
      (sum, item) =>
        sum + item.total_interest,
      0
    );

  const downloadInvestorReport = () => {
    const rows = investorSummary.map(
      (item) => ({
        Investor_ID:
          item.investor_id,
        Investor:
          item.investor_name,
        Investments:
          item.investments_count,
        Total_Invested:
          item.total_invested,
        Interest_Earned:
          item.total_interest,
        Active:
          item.active_count,
        Pending:
          item.pending_count,
        Rejected:
          item.rejected_count,
        Closed:
          item.closed_count,
        Investment_IDs:
          item.investment_ids.join(", "),
      })
    );

    exportReportCSV(
      rows,
      "investor-wise-investment-report.csv"
    );
  };

  const downloadInvestorRow = (item) => {
    exportReportCSV(
      [
        {
          Investor_ID:
            item.investor_id,
          Investor:
            item.investor_name,
          Investments:
            item.investments_count,
          Total_Invested:
            item.total_invested,
          Interest_Earned:
            item.total_interest,
          Active:
            item.active_count,
          Pending:
            item.pending_count,
          Rejected:
            item.rejected_count,
          Closed:
            item.closed_count,
          Investment_IDs:
            item.investment_ids.join(", "),
        },
      ],
      `${String(
        item.investor_name
      )
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "") || "investor"}-report.csv`
    );
  };


  const downloadSelectedInvestor = () => {
    if (!selectedInvestor) {
      return;
    }

    const rows = selectedInvestor.investments.map(
      (item, index) => ({
        Investment_ID:
          getValue(
            item,
            [
              "investment_id",
              "investmentId",
              "bond_id",
              "bond_number",
              "id",
            ],
            `INV-${index + 1}`
          ),
        Investor_ID:
          selectedInvestor.investor_id,
        Investor:
          selectedInvestor.investor_name,
        Amount:
          getInvestmentAmount(item),
        Interest_Rate:
          getValue(
            item,
            [
              "interest_rate",
              "rate",
            ],
            0
          ),
        Investment_Date:
          getInvestmentDate(item),
        Status:
          getInvestmentStatus(item),
        Interest_Earned:
          getInvestmentInterest(item),
      })
    );

    exportReportCSV(
      rows,
      `${String(
        selectedInvestor.investor_name
      )
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "") || "investor"}-investments.csv`
    );
  };

  const selectedInvestorInvestments =
    selectedInvestor?.investments || [];

  if (loading) {
    return (
      <div className="reports-loading">
        <RefreshCw
          size={24}
          className="reports-spinner"
        />
        <p>
          Loading investor reports...
        </p>
      </div>
    );
  }

  return (
    <div className="reports-page reports-page--investor-summary">
      <div className="report-stat-grid">
        <Stat
          label="TOTAL INVESTORS"
          value={formatNumber(
            summary.total_investors
          )}
          icon={Users}
          type="blue"
          subtitle="Registered investors"
        />

        <Stat
          label="TOTAL INVESTMENTS"
          value={formatNumber(
            summary.total_investments ??
              recentInvestments.length
          )}
          icon={TrendingUp}
          type="green"
          subtitle="Investment requests"
        />

        <Stat
          label="ACTIVE INVESTMENTS"
          value={formatNumber(
            summary.active_investments
          )}
          icon={CheckCircle2}
          type="teal"
          subtitle="Currently active"
        />

        <Stat
          label="PENDING APPROVALS"
          value={formatNumber(
            summary.pending_approvals
          )}
          icon={Clock3}
          type="amber"
          subtitle="Requires attention"
        />

        <Stat
          label="TOTAL PORTFOLIO"
          value={formatINR(
            summary.total_aum
          )}
          icon={Wallet}
          type="purple"
          subtitle="Assets under management"
        />

        <Stat
          label="MONTHLY INTEREST"
          value={formatINR(
            summary.monthly_interest_due
          )}
          icon={Percent}
          type="blue"
          subtitle="Current month"
        />
      </div>

      <div className="report-highlight">
        <div>
          <span>
            TOTAL PORTFOLIO VALUE
          </span>

          <strong>
            {formatINR(
              summary.total_aum
            )}
          </strong>

          <small>
            Combined value of investor
            portfolios
          </small>
        </div>

        <div className="report-highlight-side">
          <div>
            <span>
              INVESTORS
            </span>
            <strong>
              {formatNumber(
                summary.total_investors
              )}
            </strong>
          </div>

          <div>
            <span>
              GROUPED RECORDS
            </span>
            <strong>
              {formatNumber(
                investorSummary.length
              )}
            </strong>
          </div>
        </div>
      </div>

      <div className="investor-report-toolbar">
      

        <div className="investor-report-toolbar-actions">
          <div className="report-search report-search--investors">
            <span>
              Search investor...
            </span>

            <input
              type="text"
              placeholder="Name or investor ID"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </div>

          <button
            type="button"
            className="report-btn report-btn--outline"
            onClick={downloadInvestorReport}
          >
            <Download size={15} />
            Download All Investors
          </button>

          <button
            type="button"
            className="report-btn report-btn--primary"
            onClick={() =>
              loadReports(true)
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "reports-spinner"
                  : ""
              }
            />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="reports-error">
          <XCircle size={18} />
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              loadReports()
            }
          >
            Try Again
          </button>
        </div>
      )}

      <section className="report-card investor-report-card">
        <div className="investor-report-summary-row">
          <div>
            <span>
              INVESTORS SHOWN
            </span>
            <strong>
              {formatNumber(
                investorSummary.length
              )}
            </strong>
          </div>

          <div>
            <span>
              GROUPED INVESTMENT VALUE
            </span>
            <strong>
              {formatINR(
                totalGroupedInvestment
              )}
            </strong>
          </div>

          <div>
            <span>
              GROUPED INTEREST
            </span>
            <strong>
              {formatINR(
                totalGroupedInterest
              )}
            </strong>
          </div>
        </div>

        <div className="investor-report-table-wrapper">
          <table className="investor-report-table">
            <thead>
              <tr>
                <th>
                  INVESTOR
                </th>
                <th>
                  INVESTMENTS
                </th>
                <th>
                  TOTAL INVESTED
                </th>
                <th>
                  INTEREST EARNED
                </th>
                <th>
                  ACTIVE
                </th>
                <th>
                  PENDING
                </th>
                <th>
                  REJECTED
                </th>
                <th>
                  CLOSED
                </th>
                <th>
                  VIEW
                </th>
                <th>
                  DOWNLOAD
                </th>
              </tr>
            </thead>

            <tbody>
              {investorSummary.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="report-empty-row"
                  >
                    No investor investment
                    records found.
                  </td>
                </tr>
              ) : (
                investorSummary.map(
                  (item) => (
                    <tr
                      key={
                        item.investor_key
                      }
                    >
                      <td>
                        <div className="investor-report-person">
                          <span className="investor-report-avatar">
                            {String(
                              item.investor_name
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </span>

                          <div>
                            <strong>
                              {
                                item.investor_name
                              }
                            </strong>

                            <small>
                              ID:{" "}
                              {
                                item.investor_id
                              }
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="investor-count-badge">
                          {
                            item.investments_count
                          }
                        </span>
                      </td>

                      <td>
                        <strong className="investor-amount">
                          {formatINRFull(
                            item.total_invested
                          )}
                        </strong>
                      </td>

                      <td>
                        <strong className="investor-interest">
                          {formatINRFull(
                            item.total_interest
                          )}
                        </strong>
                      </td>

                      <td>
                        <span className="report-status report-status--active">
                          {
                            item.active_count
                          }
                        </span>
                      </td>

                      <td>
                        <span className="report-status report-status--pending">
                          {
                            item.pending_count
                          }
                        </span>
                      </td>

                      <td>
                        <span className="report-status report-status--rejected">
                          {
                            item.rejected_count
                          }
                        </span>
                      </td>

                      <td>
                        <span className="report-status report-status--closed">
                          {
                            item.closed_count
                          }
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="investor-view-row-btn"
                          onClick={() =>
                            setSelectedInvestor(
                              item
                            )
                          }
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="investor-download-row-btn"
                          onClick={() =>
                            downloadInvestorRow(
                              item
                            )
                          }
                          title="Download investor summary"
                        >
                          <FileDown
                            size={14}
                          />
                          Download
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="investor-report-footer">
          <span>
            One row represents one investor.
          </span>

          <span>
            Grouped from available
            investment report records.
          </span>
        </div>
      </section>

      {selectedInvestor && (
        <section className="report-card investor-detail-card">
          <div className="investor-detail-header">
            <div>
              <span className="investor-detail-eyebrow">
                INVESTOR DETAILS
              </span>
              <h2>
                {selectedInvestor.investor_name}
              </h2>
              <p>
                Investor ID:{" "}
                {selectedInvestor.investor_id}
                {" • "}
                {selectedInvestor.investments_count} investment(s)
              </p>
            </div>

            <div className="investor-detail-actions">
              <button
                type="button"
                className="report-btn report-btn--outline"
                onClick={downloadSelectedInvestor}
              >
                <Download size={15} />
                Download Investments
              </button>

              <button
                type="button"
                className="report-btn report-btn--outline"
                onClick={() =>
                  setSelectedInvestor(null)
                }
              >
                Close
              </button>
            </div>
          </div>

          <div className="investor-detail-summary">
            <div>
              <span>
                TOTAL INVESTED
              </span>
              <strong>
                {formatINRFull(
                  selectedInvestor.total_invested
                )}
              </strong>
            </div>

            <div>
              <span>
                INTEREST EARNED
              </span>
              <strong className="investor-interest">
                {formatINRFull(
                  selectedInvestor.total_interest
                )}
              </strong>
            </div>

            <div>
              <span>
                ACTIVE
              </span>
              <strong>
                {selectedInvestor.active_count}
              </strong>
            </div>

            <div>
              <span>
                PENDING
              </span>
              <strong>
                {selectedInvestor.pending_count}
              </strong>
            </div>
          </div>

          <div className="investor-detail-table-wrapper">
            <table className="investor-detail-table">
              <thead>
                <tr>
                  <th>
                    INVESTMENT ID
                  </th>
                  <th>
                    AMOUNT
                  </th>
                  <th>
                    RATE
                  </th>
                  <th>
                    INVESTMENT DATE
                  </th>
                  <th>
                    STATUS
                  </th>
                  <th>
                    INTEREST
                  </th>
                </tr>
              </thead>

              <tbody>
                {selectedInvestorInvestments.map(
                  (item, index) => {
                    const status =
                      getInvestmentStatus(item);

                    return (
                      <tr
                        key={`detail-${index}`}
                      >
                        <td>
                          <strong>
                            {getValue(
                              item,
                              [
                                "investment_id",
                                "investmentId",
                                "bond_id",
                                "bond_number",
                                "id",
                              ],
                              `INV-${index + 1}`
                            )}
                          </strong>
                        </td>

                        <td>
                          {formatINRFull(
                            getInvestmentAmount(
                              item
                            )
                          )}
                        </td>

                        <td>
                          {getValue(
                            item,
                            [
                              "interest_rate",
                              "rate",
                            ],
                            0
                          )}%
                        </td>

                        <td>
                          {getInvestmentDate(
                            item
                          ) || "—"}
                        </td>

                        <td>
                          <span
                            className={`report-status report-status--${String(
                              status
                            )
                              .toLowerCase()
                              .replace(
                                /\\s+/g,
                                "-"
                              )}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td>
                          <strong className="investor-interest">
                            {formatINRFull(
                              getInvestmentInterest(
                                item
                              )
                            )}
                          </strong>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}