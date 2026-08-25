import React, { useEffect, useState } from "react";
import {
  Download,
  RefreshCw,
  Search,
  Users,
  Wallet,
  UserCog,
  CalendarClock,
  Percent,
  CheckCircle2,
  Building2,
  TrendingUp,
  Clock3,
  Eye,
  X,
  BarChart3,
  PieChart,
  CircleDollarSign,
  ArrowUpRight,
  CalendarDays,
  Landmark,
  BadgeCheck,
  AlertCircle,
  Timer,
  Activity,
} from "lucide-react";

import "../../Styles/SuperAdmin/Reports.css";

import {
  getSuperAdminReportFilters,
  getSuperAdminReportInvestments,
  getSuperAdminReportInvestmentDetails,
  getSuperAdminReportAdmins,
  getSuperAdminReportInvestors,
  getSuperAdminReportMaturity,
  getSuperAdminReportInterest,
  getSuperAdminReportBranches,
  getSuperAdminReportMonthly,
  getSuperAdminReportSettlement,
  getSuperAdminReportExtensions,
  exportReportCSV,
} from "../../services/superadmin/superadminReportsService";

const TABS = [
  {
    id: "overview",
    label: "Overview",
    icon: TrendingUp,
  },
  {
    id: "investments",
    label: "Investments",
    icon: Wallet,
  },
  {
    id: "investors",
    label: "Investors",
    icon: Users,
  },
  {
    id: "admins",
    label: "Admins",
    icon: UserCog,
  },
  {
    id: "maturity",
    label: "Maturity",
    icon: CalendarClock,
  },
  {
    id: "interest",
    label: "Interest",
    icon: Percent,
  },
  {
    id: "settlement",
    label: "Settlement",
    icon: CheckCircle2,
  },
  {
    id: "branches",
    label: "Branches",
    icon: Building2,
  },
  {
    id: "monthly",
    label: "Monthly",
    icon: TrendingUp,
  },
  {
    id: "extensions",
    label: "Extensions",
    icon: Clock3,
  },
];

const pick = (
  row,
  keys,
  fallback = ""
) => {
  for (const key of keys) {
    if (
      row &&
      row[key] !== undefined &&
      row[key] !== null &&
      row[key] !== ""
    ) {
      return row[key];
    }
  }

  return fallback;
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString(
    "en-IN"
  )}`;

const formatDate = (value) => {
  if (!value) return "—";

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

const statusClass = (status) => {
  const value = String(
    status || ""
  ).toLowerCase();

  if (
    value.includes("active") ||
    value.includes("approv")
  ) {
    return "active";
  }

  if (value.includes("pending")) {
    return "pending";
  }

  if (value.includes("reject")) {
    return "rejected";
  }

  if (
    value.includes("paid") ||
    value.includes("sett") ||
    value.includes("closed")
  ) {
    return "closed";
  }

  return "neutral";
};

const normalizeInvestment = (
  row,
  index
) => ({
  raw: row,

  id:
    pick(
      row,
      [
        "investment_id",
        "investment_code",
        "id",
      ]
    ) ||
    `INV-${index + 1}`,

  investorId: pick(
    row,
    [
      "investor_id",
      "investor_registration_id",
    ],
    "—"
  ),

  investor: pick(
    row,
    [
      "investor_name",
      "investor",
      "full_name",
    ],
    "—"
  ),

  email: pick(
    row,
    [
      "investor_email",
      "email",
    ],
    "—"
  ),

  mobile: pick(
    row,
    [
      "investor_mobile",
      "mobile",
    ],
    "—"
  ),

  branchId: pick(
    row,
    ["branch_id"],
    ""
  ),

  branch: pick(
    row,
    [
      "branch_name",
      "branch",
    ],
    "—"
  ),

  adminId: pick(
    row,
    [
      "admin_id",
      "approved_by",
    ],
    ""
  ),

  admin: pick(
    row,
    [
      "admin_name",
      "admin",
    ],
    "—"
  ),

  superAdminId: pick(
    row,
    [
      "superadmin_id",
      "modified_by",
    ],
    ""
  ),

  superAdmin: pick(
    row,
    [
      "superadmin_name",
      "super_admin_name",
    ],
    "—"
  ),

  amount: Number(
    pick(
      row,
      [
        "investment_amount",
        "amount",
      ],
      0
    )
  ),

  rate: Number(
    pick(
      row,
      [
        "interest_rate",
        "rate",
      ],
      0
    )
  ),

  expectedInterest:
    Number(
      pick(
        row,
        [
          "expected_interest_amount",
          "expected_interest",
        ],
        0
      )
    ),

  maturityAmount:
    Number(
      pick(
        row,
        [
          "maturity_amount",
        ],
        0
      )
    ),

  statusId: pick(
    row,
    [
      "status_id",
      "investment_status_id",
    ],
    ""
  ),

  status: pick(
    row,
    [
      "status_name",
      "status",
      "investment_status",
    ],
    "Unknown"
  ),

  investmentDate: pick(
    row,
    [
      "investment_date",
    ],
    ""
  ),

  maturityDate: pick(
    row,
    [
      "maturity_date",
    ],
    ""
  ),

  tenureMonths: Number(
    pick(
      row,
      [
        "tenure_months",
      ],
      0
    )
  ),

  approvedDate: pick(
    row,
    [
      "approved_date",
    ],
    ""
  ),
});

const normalizeAdmin = (row) => ({
  id: pick(
    row,
    [
      "admin_id",
      "id",
    ]
  ),

  name: pick(
    row,
    [
      "admin_name",
      "full_name",
    ],
    "—"
  ),

  email: pick(
    row,
    [
      "admin_email",
      "email",
    ],
    "—"
  ),

  branch: pick(
    row,
    [
      "branch_name",
      "branch",
    ],
    "—"
  ),

  investors: Number(
    pick(
      row,
      [
        "investor_count",
        "investors",
      ],
      0
    )
  ),

  investments: Number(
    pick(
      row,
      [
        "investment_count",
        "investments",
      ],
      0
    )
  ),

  principal: Number(
    pick(
      row,
      [
        "principal_amount",
        "principal",
      ],
      0
    )
  ),

  interest: Number(
    pick(
      row,
      [
        "expected_interest",
        "interest",
      ],
      0
    )
  ),

  pending: Number(
    pick(
      row,
      [
        "pending_count",
      ],
      0
    )
  ),

  approved: Number(
    pick(
      row,
      [
        "approved_count",
        "active_count",
      ],
      0
    )
  ),

  rejected: Number(
    pick(
      row,
      [
        "rejected_count",
      ],
      0
    )
  ),

  settled: Number(
    pick(
      row,
      [
        "settled_count",
      ],
      0
    )
  ),
});

export default function SuperAdminReports() {
  const [
    activeTab,
    setActiveTab,
  ] = useState("overview");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    branchId,
    setBranchId,
  ] = useState("");

  const [
    adminId,
    setAdminId,
  ] = useState("");

  const [
    statusId,
    setStatusId,
  ] = useState("");

  const [
    fromDate,
    setFromDate,
  ] = useState("");

  const [
    toDate,
    setToDate,
  ] = useState("");

  const [
    branches,
    setBranches,
  ] = useState([]);

  const [
    statuses,
    setStatuses,
  ] = useState([]);

  const [
    admins,
    setAdmins,
  ] = useState([]);

  const [
    investments,
    setInvestments,
  ] = useState([]);

  const [
    adminRows,
    setAdminRows,
  ] = useState([]);

  const [
    investorRows,
    setInvestorRows,
  ] = useState([]);

  const [
    selectedInvestment,
    setSelectedInvestment,
  ] = useState(null);

  const [
    maturityRows,
    setMaturityRows,
  ] = useState([]);

  const [
    interestRows,
    setInterestRows,
  ] = useState([]);

  const [
    branchRows,
    setBranchRows,
  ] = useState([]);

  const [
    monthlyRows,
    setMonthlyRows,
  ] = useState([]);

  const [
    settlementRows,
    setSettlementRows,
  ] = useState([]);

  const [
    extensionRows,
    setExtensionRows,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const loadFilters =
    async () => {
      try {
        const response =
          await getSuperAdminReportFilters();

        setBranches(
          Array.isArray(
            response?.branches
          )
            ? response.branches
            : []
        );

        setStatuses(
          Array.isArray(
            response?.statuses
          )
            ? response.statuses
            : []
        );

        setAdmins(
          Array.isArray(
            response?.admins
          )
            ? response.admins
            : []
        );
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load filters."
        );
      }
    };

  const loadReports =
    async () => {
      try {
        setLoading(true);
        setError("");

        const filters = {
          search,
          branchId,
          adminId,
          statusId,
          fromDate,
          toDate,
        };

        const investmentResponse =
          await getSuperAdminReportInvestments({
            ...filters,
            limit: 500,
            offset: 0,
          });

        const investmentData =
          Array.isArray(
            investmentResponse?.data
          )
            ? investmentResponse.data
            : [];

        setInvestments(
          investmentData.map(
            normalizeInvestment
          )
        );

        if (activeTab === "admins") {
          const response =
            await getSuperAdminReportAdmins({
              ...filters,
              limit: 500,
              offset: 0,
            });

          setAdminRows(
            Array.isArray(
              response?.data
            )
              ? response.data.map(
                  normalizeAdmin
                )
              : []
          );
        }

        if (activeTab === "investors") {
          const response =
            await getSuperAdminReportInvestors({
              ...filters,
              limit: 500,
              offset: 0,
            });

          setInvestorRows(
            Array.isArray(
              response?.data
            )
              ? response.data
              : []
          );
        }

        if (activeTab === "maturity") {
          const response =
            await getSuperAdminReportMaturity(
              filters
            );

          setMaturityRows(
            Array.isArray(
              response?.data
            )
              ? response.data
              : []
          );
        }

        if (activeTab === "interest") {
          const response =
            await getSuperAdminReportInterest(
              filters
            );

          setInterestRows(
            Array.isArray(
              response?.data
            )
              ? response.data
              : []
          );
        }

        if (activeTab === "branches") {
          const response =
            await getSuperAdminReportBranches(
              filters
            );

          setBranchRows(
            Array.isArray(
              response?.data
            )
              ? response.data
              : []
          );
        }

        if (activeTab === "monthly") {
          const response =
            await getSuperAdminReportMonthly(
              filters
            );

          setMonthlyRows(
            Array.isArray(
              response?.data
            )
              ? response.data
              : []
          );
        }

        if (activeTab === "settlement") {
          const response =
            await getSuperAdminReportSettlement(
              filters
            );

          setSettlementRows(
            Array.isArray(
              response?.data
            )
              ? response.data
              : []
          );
        }

        if (activeTab === "extensions") {
          const response =
            await getSuperAdminReportExtensions(
              filters
            );

          setExtensionRows(
            Array.isArray(
              response?.data
            )
              ? response.data
              : []
          );
        }
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load Super Admin reports."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadReports();
  }, [
    activeTab,
    search,
    branchId,
    adminId,
    statusId,
    fromDate,
    toDate,
  ]);

  const resetFilters =
    () => {
      setSearch("");
      setBranchId("");
      setAdminId("");
      setStatusId("");
      setFromDate("");
      setToDate("");
    };

  const openInvestment =
    async (
      investment
    ) => {
      try {
        const response =
          await getSuperAdminReportInvestmentDetails(
            investment.id
          );

        setSelectedInvestment(
          response?.data ||
            investment
        );
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load investment details."
        );
      }
    };

  const download =
    () => {
      if (activeTab === "investments") {
        exportReportCSV(
          investments,
          "superadmin-investments.csv"
        );
        return;
      }

      if (activeTab === "admins") {
        exportReportCSV(
          adminRows,
          "superadmin-admins.csv"
        );
        return;
      }

      if (activeTab === "investors") {
        exportReportCSV(
          investorRows,
          "superadmin-investors.csv"
        );
        return;
      }

      if (activeTab === "maturity") {
        exportReportCSV(
          maturityRows,
          "superadmin-maturity.csv"
        );
        return;
      }

      if (activeTab === "interest") {
        exportReportCSV(
          interestRows,
          "superadmin-interest.csv"
        );
        return;
      }

      if (activeTab === "branches") {
        exportReportCSV(
          branchRows,
          "superadmin-branches.csv"
        );
        return;
      }

      if (activeTab === "monthly") {
        exportReportCSV(
          monthlyRows,
          "superadmin-monthly.csv"
        );
        return;
      }

      if (activeTab === "settlement") {
        exportReportCSV(
          settlementRows,
          "superadmin-settlement.csv"
        );
        return;
      }

      if (activeTab === "extensions") {
        exportReportCSV(
          extensionRows,
          "superadmin-extensions.csv"
        );
        return;
      }

      exportReportCSV(
        investments,
        "superadmin-report.csv"
      );
    };

  const totalPrincipal =
    investments.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.amount || 0
        ),
      0
    );

  const totalInterest =
    investments.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.expectedInterest ||
            0
        ),
      0
    );

  return (
    <div
      className="reports-page"
    >
      {/* <div className="reports-heading">
        <div>
          <span className="reports-eyebrow">
            SUPER ADMIN REPORTS
          </span>

          <h1>
            Reports
          </h1>

          <p>
            View complete investment,
            investor and admin
            reports.
          </p>
        </div>

        <button
          type="button"
          className="reports-refresh"
          onClick={
            loadReports
          }
        >
          <RefreshCw
            size={15}
          />
          Refresh
        </button>
      </div> */}

      <div className="reports-tabs">
        {TABS.map(
          ({
            id,
            label,
            icon: Icon,
          }) => (
            <button
              type="button"
              key={id}
              className={
                activeTab ===
                id
                  ? "reports-tab reports-tab--active"
                  : "reports-tab"
              }
              onClick={() =>
                setActiveTab(
                  id
                )
              }
            >
              <Icon
                size={14}
              />
              {label}
            </button>
          )
        )}
      </div>

      <div className="reports-filters">
        <div className="reports-search">
          <Search
            size={15}
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target
                  .value
              )
            }
            placeholder="Search investor, investment, admin..."
          />
        </div>

        <select
          value={branchId}
          onChange={(e) =>
            setBranchId(
              e.target
                .value
            )
          }
        >
          <option value="">
            All Branches
          </option>

          {branches.map(
            (
              branch
            ) => (
              <option
                key={
                  branch.id
                }
                value={
                  branch.id
                }
              >
                {
                  branch.branch_name
                }
              </option>
            )
          )}
        </select>

        <select
          value={adminId}
          onChange={(e) =>
            setAdminId(
              e.target
                .value
            )
          }
        >
          <option value="">
            All Admins
          </option>

          {admins.map(
            (
              admin
            ) => (
              <option
                key={
                  admin.id
                }
                value={
                  admin.id
                }
              >
                {
                  admin.full_name
                }
              </option>
            )
          )}
        </select>

        <select
          value={statusId}
          onChange={(e) =>
            setStatusId(
              e.target
                .value
            )
          }
        >
          <option value="">
            All Status
          </option>

          {statuses.map(
            (
              status
            ) => (
              <option
                key={
                  status.id
                }
                value={
                  status.id
                }
              >
                {
                  status.status_name
                }
              </option>
            )
          )}
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) =>
            setFromDate(
              e.target
                .value
            )
          }
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) =>
            setToDate(
              e.target
                .value
            )
          }
        />

        {/* <button
          type="button"
          className="reports-reset"
          onClick={
            resetFilters
          }
        >
          Reset
        </button> */}

        <button
          type="button"
          className="reports-download"
          onClick={
            download
          }
        >
          <Download
            size={15}
          />
          Download
        </button>
      </div>

      {error && (
        <div className="reports-error">
          {error}
        </div>
      )}

      {activeTab ===
        "overview" && (
        <section className="reports-panel">
          <div className="reports-panel-head">
            <div>
              <span>
                REPORT
              </span>

              <h2>
                Overview
              </h2>

              <p>
                Complete Super Admin
                portfolio overview.
              </p>
            </div>
          </div>

          <div className="reports-overview-content">
            <MetricTiles
              items={[
                {
                  label: "Investors",
                  value: new Set(
                    investments.map(
                      (item) =>
                        item.investorId
                    )
                  ).size,
                  helper: "Unique investors",
                  icon: Users,
                },
                {
                  label: "Investments",
                  value: investments.length,
                  helper: "Portfolio records",
                  icon: Wallet,
                },
                {
                  label: "Principal",
                  value: money(totalPrincipal),
                  helper: "Total invested",
                  icon: CircleDollarSign,
                },
                {
                  label: "Expected Interest",
                  value: money(totalInterest),
                  helper: "Projected earnings",
                  icon: Percent,
                },
              ]}
            />

            <div className="reports-viz-grid reports-viz-grid--overview">
              <VisualizationCard
                title="Portfolio by Branch"
                subtitle="PRINCIPAL DISTRIBUTION"
                icon={Landmark}
              >
                <HorizontalBars
                  items={groupSum(
                    investments,
                    ["branch", "branch_name"],
                    ["amount", "investment_amount"],
                    6
                  )}
                  moneyValues
                />
              </VisualizationCard>

              <VisualizationCard
                title="Investment Status"
                subtitle="PORTFOLIO HEALTH"
                icon={PieChart}
              >
                <DonutLegend
                  items={groupCount(
                    investments,
                    [
                      "status",
                      "status_name",
                    ],
                    6
                  )}
                />
              </VisualizationCard>
            </div>

            <VisualizationCard
              title="Top Investments"
              subtitle="HIGHEST PRINCIPAL"
              icon={BarChart3}
              className="reports-viz-card--wide"
            >
              <HorizontalBars
                items={investments
                  .slice()
                  .sort(
                    (a, b) =>
                      b.amount - a.amount
                  )
                  .slice(0, 6)
                  .map((item) => ({
                    label: `${item.id} · ${item.investor}`,
                    value: item.amount,
                  }))}
                moneyValues
              />
            </VisualizationCard>
          </div>
        </section>
      )}

      {activeTab ===
        "investments" && (
        <section className="reports-panel">
          <div className="reports-panel-head">
            <div>
              <span>
                REPORT
              </span>

              <h2>
                Investments Report
              </h2>

              <p>
                {
                  investments.length
                }{" "}
                investment
                records
              </p>
            </div>
          </div>

          <MetricTiles
            items={[
              {
                label: "Investments",
                value: investments.length,
                helper: "Filtered records",
                icon: Wallet,
              },
              {
                label: "Principal",
                value: money(totalPrincipal),
                helper: "Total invested",
                icon: CircleDollarSign,
              },
              {
                label: "Interest",
                value: money(totalInterest),
                helper: "Expected interest",
                icon: Percent,
              },
              {
                label: "Active",
                value: investments.filter(
                  (item) =>
                    statusClass(
                      item.status
                    ) === "active"
                ).length,
                helper: "Active / approved",
                icon: BadgeCheck,
              },
            ]}
          />

          <div className="reports-viz-grid">
            <VisualizationCard
              title="Principal by Branch"
              subtitle="PORTFOLIO DISTRIBUTION"
              icon={Landmark}
            >
              <HorizontalBars
                items={groupSum(
                  investments,
                  ["branch"],
                  ["amount"],
                  6
                )}
                moneyValues
              />
            </VisualizationCard>

            <VisualizationCard
              title="Investment Status"
              subtitle="CURRENT PORTFOLIO"
              icon={PieChart}
            >
              <DonutLegend
                items={groupCount(
                  investments,
                  ["status"],
                  6
                )}
              />
            </VisualizationCard>
          </div>

          <InvestmentTable
            rows={
              investments
            }
            onView={
              openInvestment
            }
          />
        </section>
      )}

      {activeTab ===
        "investors" && (
        <section className="reports-panel">
          <div className="reports-panel-head">
            <div>
              <span>
                REPORT
              </span>

              <h2>
                Investors Report
              </h2>
            </div>
          </div>

          <MetricTiles
            items={[
              {
                label: "Investors",
                value: investorRows.length,
                helper: "Filtered investors",
                icon: Users,
              },
              {
                label: "Investments",
                value: investorRows.reduce(
                  (sum, row) =>
                    sum +
                    numeric(
                      row.investment_count ||
                        row.investments
                    ),
                  0
                ),
                helper: "Total investments",
                icon: Wallet,
              },
              {
                label: "Principal",
                value: money(
                  investorRows.reduce(
                    (sum, row) =>
                      sum +
                      numeric(
                        row.principal_amount ||
                          row.principal
                      ),
                    0
                  )
                ),
                helper: "Invested principal",
                icon: CircleDollarSign,
              },
            ]}
          />

          <VisualizationCard
            title="Top Investors by Principal"
            subtitle="PORTFOLIO SHARE"
            icon={Users}
            className="reports-viz-card--wide"
          >
            <HorizontalBars
              items={groupSum(
                investorRows,
                ["investor_name", "investor"],
                [
                  "principal_amount",
                  "principal",
                ],
                8
              )}
              moneyValues
            />
          </VisualizationCard>

          <InvestorTable
            rows={
              investorRows
            }
          />
        </section>
      )}

      {activeTab ===
        "admins" && (
        <section className="reports-panel">
          <div className="reports-panel-head">
            <div>
              <span>
                REPORT
              </span>

              <h2>
                Admin Report
              </h2>

              <p>
                Admin-wise investors,
                investments and
                submitted amounts.
              </p>
            </div>
          </div>

          <MetricTiles
            items={[
              {
                label: "Admins",
                value: adminRows.length,
                helper: "Active admins in report",
                icon: UserCog,
              },
              {
                label: "Investors",
                value: adminRows.reduce(
                  (sum, row) =>
                    sum + numeric(row.investors),
                  0
                ),
                helper: "Managed investors",
                icon: Users,
              },
              {
                label: "Principal",
                value: money(
                  adminRows.reduce(
                    (sum, row) =>
                      sum + numeric(row.principal),
                    0
                  )
                ),
                helper: "Admin-wise principal",
                icon: CircleDollarSign,
              },
            ]}
          />

          <div className="reports-viz-grid">
            <VisualizationCard
              title="Admin Principal"
              subtitle="PERFORMANCE"
              icon={UserCog}
            >
              <HorizontalBars
                items={adminRows
                  .slice()
                  .sort(
                    (a, b) =>
                      b.principal -
                      a.principal
                  )
                  .slice(0, 6)
                  .map((row) => ({
                    label: row.name,
                    value: row.principal,
                  }))}
                moneyValues
              />
            </VisualizationCard>

            <VisualizationCard
              title="Admin Pipeline"
              subtitle="PENDING / APPROVED / REJECTED"
              icon={Activity}
            >
              <StatusPills
                items={[
                  {
                    label: "Pending",
                    value:
                      adminRows.reduce(
                        (sum, row) =>
                          sum +
                          numeric(row.pending),
                        0
                      ),
                  },
                  {
                    label: "Approved",
                    value:
                      adminRows.reduce(
                        (sum, row) =>
                          sum +
                          numeric(row.approved),
                        0
                      ),
                  },
                  {
                    label: "Rejected",
                    value:
                      adminRows.reduce(
                        (sum, row) =>
                          sum +
                          numeric(row.rejected),
                        0
                      ),
                  },
                  {
                    label: "Settled",
                    value:
                      adminRows.reduce(
                        (sum, row) =>
                          sum +
                          numeric(row.settled),
                        0
                      ),
                  },
                ]}
              />
            </VisualizationCard>
          </div>

          <AdminTable
            rows={
              adminRows
            }
          />
        </section>
      )}

      {activeTab === "maturity" && (
        <section className="reports-panel">
          <div className="reports-panel-head">
            <div>
              <span>REPORT</span>
              <h2>Maturity Report</h2>
              <p>
                Investment maturity schedule.
              </p>
            </div>
          </div>
          <div className="reports-viz-grid">
            <VisualizationCard
              title="Maturity Value"
              subtitle="MATURITY AMOUNT"
              icon={CalendarDays}
            >
              <HorizontalBars
                items={groupSum(
                  maturityRows,
                  ["investor_name", "investor"],
                  ["maturity_amount"],
                  6
                )}
                moneyValues
              />
            </VisualizationCard>

            <VisualizationCard
              title="Maturity Status"
              subtitle="STATUS MIX"
              icon={PieChart}
            >
              <DonutLegend
                items={groupCount(
                  maturityRows,
                  ["status_name", "status"],
                  6
                )}
              />
            </VisualizationCard>
          </div>
          <MaturityTable rows={maturityRows} />
        </section>
      )}

      {activeTab === "interest" && (
        <section className="reports-panel">
          <div className="reports-panel-head">
            <div>
              <span>REPORT</span>
              <h2>Interest Report</h2>
              <p>
                Expected interest by investment.
              </p>
            </div>
          </div>
          <div className="reports-viz-grid">
            <VisualizationCard
              title="Interest by Investor"
              subtitle="EXPECTED INTEREST"
              icon={Percent}
            >
              <HorizontalBars
                items={groupSum(
                  interestRows,
                  ["investor_name", "investor"],
                  [
                    "expected_interest_amount",
                    "expected_interest",
                  ],
                  6
                )}
                moneyValues
              />
            </VisualizationCard>

            <VisualizationCard
              title="Interest Rates"
              subtitle="RATE DISTRIBUTION"
              icon={TrendingUp}
            >
              <HorizontalBars
                items={groupSum(
                  interestRows,
                  ["interest_rate", "rate"],
                  ["expected_interest_amount"],
                  6
                ).map((item) => ({
                  ...item,
                  label: `${item.label}%`,
                }))}
                moneyValues
              />
            </VisualizationCard>
          </div>
          <InterestTable rows={interestRows} />
        </section>
      )}

      {activeTab === "settlement" && (
        <section className="reports-panel">
          <div className="reports-panel-head">
            <div>
              <span>REPORT</span>
              <h2>Settlement Report</h2>
              <p>
                Settlement records across the portfolio.
              </p>
            </div>
          </div>
          <MetricTiles
            items={[
              {
                label: "Settlements",
                value: settlementRows.length,
                helper: "Settlement records",
                icon: CheckCircle2,
              },
              {
                label: "Paid",
                value: groupCount(
                  settlementRows,
                  ["status_name", "status"]
                ).find(
                  (item) =>
                    item.label
                      .toLowerCase()
                      .includes("paid")
                )?.value || 0,
                helper: "Completed settlements",
                icon: BadgeCheck,
              },
              {
                label: "Pending",
                value: groupCount(
                  settlementRows,
                  ["status_name", "status"]
                ).find(
                  (item) =>
                    item.label
                      .toLowerCase()
                      .includes("pending")
                )?.value || 0,
                helper: "Awaiting completion",
                icon: Timer,
              },
            ]}
          />
          <div className="reports-viz-grid">
            <VisualizationCard
              title="Settlement Status"
              subtitle="STATUS DISTRIBUTION"
              icon={PieChart}
            >
              <DonutLegend
                items={groupCount(
                  settlementRows,
                  ["status_name", "status"],
                  6
                )}
              />
            </VisualizationCard>

            <VisualizationCard
              title="Settlement Value"
              subtitle="NET SETTLEMENT"
              icon={CircleDollarSign}
            >
              <HorizontalBars
                items={groupSum(
                  settlementRows,
                  [
                    "settlement_type_name",
                    "settlement_type",
                  ],
                  [
                    "settlement_amount",
                    "net_settlement_amount",
                  ],
                  6
                )}
                moneyValues
              />
            </VisualizationCard>
          </div>
          <SettlementTable rows={settlementRows} />
        </section>
      )}

      {activeTab === "branches" && (
        <section className="reports-panel">
          <div className="reports-panel-head">
            <div>
              <span>REPORT</span>
              <h2>Branches Report</h2>
              <p>
                Branch-wise investment performance.
              </p>
            </div>
          </div>
          <MetricTiles
            items={[
              {
                label: "Branches",
                value: branchRows.length,
                helper: "Active report branches",
                icon: Building2,
              },
              {
                label: "Investors",
                value: branchRows.reduce(
                  (sum, row) =>
                    sum +
                    numeric(
                      row.investor_count ||
                        row.investors
                    ),
                  0
                ),
                helper: "Across branches",
                icon: Users,
              },
              {
                label: "Investments",
                value: branchRows.reduce(
                  (sum, row) =>
                    sum +
                    numeric(
                      row.investment_count ||
                        row.investments
                    ),
                  0
                ),
                helper: "Across branches",
                icon: Wallet,
              },
            ]}
          />
          <VisualizationCard
            title="Branch Principal Performance"
            subtitle="BRANCH DISTRIBUTION"
            icon={Landmark}
            className="reports-viz-card--wide"
          >
            <HorizontalBars
              items={groupSum(
                branchRows,
                ["branch_name", "branch"],
                [
                  "principal_amount",
                  "principal",
                ],
                8
              )}
              moneyValues
            />
          </VisualizationCard>
          <BranchTable rows={branchRows} />
        </section>
      )}

      {activeTab === "monthly" && (
        <section className="reports-panel">
          <div className="reports-panel-head">
            <div>
              <span>REPORT</span>
              <h2>Monthly Report</h2>
              <p>
                Monthly investment summary.
              </p>
            </div>
          </div>
          <div className="reports-viz-grid">
            <VisualizationCard
              title="Monthly Principal Trend"
              subtitle="INVESTMENT FLOW"
              icon={TrendingUp}
            >
              <MonthlyBars rows={monthlyRows} />
            </VisualizationCard>

            <VisualizationCard
              title="Monthly Interest"
              subtitle="EXPECTED EARNINGS"
              icon={Percent}
            >
              <HorizontalBars
                items={groupSum(
                  monthlyRows,
                  ["month", "month_name"],
                  [
                    "expected_interest",
                    "interest",
                  ],
                  8
                )}
                moneyValues
              />
            </VisualizationCard>
          </div>
          <MonthlyTable rows={monthlyRows} />
        </section>
      )}

      {activeTab === "extensions" && (
        <section className="reports-panel">
          <div className="reports-panel-head">
            <div>
              <span>REPORT</span>
              <h2>Extensions Report</h2>
              <p>
                Tenure extension records.
              </p>
            </div>
          </div>
          <MetricTiles
            items={[
              {
                label: "Extensions",
                value: extensionRows.length,
                helper: "Tenure extension requests",
                icon: Clock3,
              },
              {
                label: "Approved",
                value: groupCount(
                  extensionRows,
                  ["status_name", "status", "request_status"]
                ).filter(
                  (item) =>
                    item.label
                      .toLowerCase()
                      .includes("approv")
                ).reduce(
                  (sum, item) =>
                    sum + item.value,
                  0
                ),
                helper: "Approved requests",
                icon: BadgeCheck,
              },
              {
                label: "Pending",
                value: groupCount(
                  extensionRows,
                  ["status_name", "status", "request_status"]
                ).filter(
                  (item) =>
                    item.label
                      .toLowerCase()
                      .includes("pending")
                ).reduce(
                  (sum, item) =>
                    sum + item.value,
                  0
                ),
                helper: "Awaiting action",
                icon: Timer,
              },
            ]}
          />
          <div className="reports-viz-grid">
            <VisualizationCard
              title="Extension Status"
              subtitle="REQUEST DISTRIBUTION"
              icon={PieChart}
            >
              <DonutLegend
                items={groupCount(
                  extensionRows,
                  [
                    "request_status",
                    "status_name",
                    "status",
                  ],
                  6
                )}
              />
            </VisualizationCard>

            <VisualizationCard
              title="Requested Extension"
              subtitle="TENURE DEMAND"
              icon={Clock3}
            >
              <HorizontalBars
                items={groupCount(
                  extensionRows,
                  [
                    "requested_extension",
                    "extension_period",
                    "extension_months",
                  ],
                  6
                )}
              />
            </VisualizationCard>
          </div>
          <ExtensionTable rows={extensionRows} />
        </section>
      )}

      {loading && (
        <div className="reports-loading">
          <RefreshCw
            size={20}
            className="reports-spinner"
          />
          Loading...
        </div>
      )}

      {selectedInvestment && (
        <div
          className="reports-modal-overlay"
          onClick={() =>
            setSelectedInvestment(
              null
            )
          }
        >
          <div
            className="reports-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="reports-modal-head">
              <div>
                <span>
                  INVESTMENT DETAILS
                </span>

                <h2>
                  {
                    selectedInvestment
                      .investment_id
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedInvestment(
                    null
                  )
                }
              >
                <X size={17} />
              </button>
            </div>

            <div className="reports-detail-grid">
              <div>
                <small>
                  Investor
                </small>
                <strong>
                  {
                    selectedInvestment
                      .investor_name
                  }
                </strong>
              </div>

              <div>
                <small>
                  Investor ID
                </small>
                <strong>
                  {
                    selectedInvestment
                      .investor_id
                  }
                </strong>
              </div>

              <div>
                <small>
                  Branch
                </small>
                <strong>
                  {
                    selectedInvestment
                      .branch_name
                  }
                </strong>
              </div>

              <div>
                <small>
                  Admin
                </small>
                <strong>
                  {
                    selectedInvestment
                      .admin_name
                  }
                </strong>
              </div>

              <div>
                <small>
                  Super Admin
                </small>
                <strong>
                  {
                    selectedInvestment
                      .superadmin_name
                  }
                </strong>
              </div>

              <div>
                <small>
                  Amount
                </small>
                <strong>
                  {money(
                    selectedInvestment
                      .investment_amount
                  )}
                </strong>
              </div>

              <div>
                <small>
                  Rate
                </small>
                <strong>
                  {
                    selectedInvestment
                      .interest_rate
                  }
                  %
                </strong>
              </div>

              <div>
                <small>
                  Status
                </small>
                <strong>
                  {
                    selectedInvestment
                      .status_name
                  }
                </strong>
              </div>

              <div>
                <small>
                  Investment Date
                </small>
                <strong>
                  {formatDate(
                    selectedInvestment
                      .investment_date
                  )}
                </strong>
              </div>

              <div>
                <small>
                  Maturity Date
                </small>
                <strong>
                  {formatDate(
                    selectedInvestment
                      .maturity_date
                  )}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



const chartColor = (index) => {
  const colors = [
    "#3159E8",
    "#14B87A",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#EF4444",
    "#64748B",
  ];
  return colors[index % colors.length];
};

const safeRows = (rows) =>
  Array.isArray(rows) ? rows : [];

const numeric = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const groupSum = (rows, labelKeys, valueKeys, limit = 6) => {
  const map = new Map();

  safeRows(rows).forEach((row) => {
    const label = String(
      pick(row, labelKeys, "Unknown")
    );
    const value = numeric(
      pick(row, valueKeys, 0)
    );

    map.set(
      label,
      (map.get(label) || 0) + value
    );
  });

  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({
      label,
      value,
    }));
};

const groupCount = (
  rows,
  labelKeys,
  limit = 6
) => {
  const map = new Map();

  safeRows(rows).forEach((row) => {
    const label = String(
      pick(row, labelKeys, "Unknown")
    );

    map.set(
      label,
      (map.get(label) || 0) + 1
    );
  });

  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({
      label,
      value,
    }));
};

function VisualizationCard({
  title,
  subtitle,
  icon: Icon = BarChart3,
  children,
  className = "",
}) {
  return (
    <div className={`reports-viz-card ${className}`}>
      <div className="reports-viz-head">
        <div>
          <span>{subtitle}</span>
          <h3>{title}</h3>
        </div>
        <div className="reports-viz-icon">
          <Icon size={17} />
        </div>
      </div>
      {children}
    </div>
  );
}

function MetricTiles({ items }) {
  return (
    <div className="reports-metric-tiles">
      {items.map((item, index) => {
        const Icon = item.icon || Activity;

        return (
          <div
            className={`reports-metric-tile reports-metric-tile--${index % 6}`}
            key={`${item.label}-${index}`}
          >
            <div className="reports-metric-icon">
              <Icon size={16} />
            </div>
            <div className="reports-metric-copy">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              {item.helper && (
                <small>{item.helper}</small>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBars({
  items,
  moneyValues = false,
  emptyText = "No data available.",
}) {
  const max = Math.max(
    ...safeRows(items).map((item) =>
      numeric(item.value)
    ),
    1
  );

  if (!items?.length) {
    return (
      <div className="reports-viz-empty">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="reports-horizontal-bars">
      {items.map((item, index) => (
        <div
          className="reports-bar-row"
          key={`${item.label}-${index}`}
        >
          <div className="reports-bar-label">
            <span>{item.label}</span>
            <strong>
              {moneyValues
                ? money(item.value)
                : item.value.toLocaleString("en-IN")}
            </strong>
          </div>
          <div className="reports-bar-track">
            <div
              className="reports-bar-fill"
              style={{
                width: `${Math.max(
                  4,
                  (numeric(item.value) / max) * 100
                )}%`,
                background: chartColor(index),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutLegend({
  items,
  emptyText = "No status data available.",
}) {
  const total = safeRows(items).reduce(
    (sum, item) =>
      sum + numeric(item.value),
    0
  );

  if (!items?.length || total === 0) {
    return (
      <div className="reports-viz-empty">
        {emptyText}
      </div>
    );
  }

  let cursor = 0;

  const gradient = items
    .map((item, index) => {
      const start = (cursor / total) * 100;
      cursor += numeric(item.value);
      const end = (cursor / total) * 100;
      return `${chartColor(index)} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="reports-donut-layout">
      <div
        className="reports-donut"
        style={{
          background: `conic-gradient(${gradient})`,
        }}
      >
        <div className="reports-donut-hole">
          <strong>{total}</strong>
          <span>Total</span>
        </div>
      </div>

      <div className="reports-donut-legend">
        {items.map((item, index) => (
          <div
            className="reports-legend-item"
            key={`${item.label}-${index}`}
          >
            <span
              className="reports-legend-dot"
              style={{
                background: chartColor(index),
              }}
            />
            <div>
              <span>{item.label}</span>
              <strong>
                {item.value}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyBars({ rows }) {
  const items = safeRows(rows)
    .map((row) => ({
      label: String(
        pick(
          row,
          ["month", "month_name"],
          "—"
        )
      ),
      value: numeric(
        pick(
          row,
          [
            "principal_amount",
            "principal",
            "investment_amount",
          ],
          0
        )
      ),
    }))
    .slice(-8);

  if (!items.length) {
    return (
      <div className="reports-viz-empty">
        No monthly data available.
      </div>
    );
  }

  const max = Math.max(
    ...items.map((item) => item.value),
    1
  );

  return (
    <div className="reports-monthly-chart">
      {items.map((item, index) => (
        <div
          className="reports-month-column"
          key={`${item.label}-${index}`}
        >
          <div className="reports-month-value">
            {money(item.value)}
          </div>
          <div className="reports-month-track">
            <div
              className="reports-month-fill"
              style={{
                height: `${Math.max(
                  8,
                  (item.value / max) * 100
                )}%`,
                background: chartColor(index),
              }}
            />
          </div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function StatusPills({ items }) {
  if (!items?.length) {
    return (
      <div className="reports-viz-empty">
        No status data available.
      </div>
    );
  }

  return (
    <div className="reports-status-pills">
      {items.map((item, index) => (
        <div
          className="reports-status-pill"
          key={`${item.label}-${index}`}
        >
          <span
            className="reports-status-pill-dot"
            style={{
              background: chartColor(index),
            }}
          />
          <div>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

function MaturityTable({ rows }) {
  return (
    <div className="reports-table-wrap">
      <table className="reports-table">
        <thead>
          <tr>
            <th>INVESTMENT</th>
            <th>INVESTOR</th>
            <th>BRANCH</th>
            <th>ADMIN</th>
            <th>PRINCIPAL</th>
            <th>MATURITY AMOUNT</th>
            <th>MATURITY DATE</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="reports-empty"
              >
                No maturity records found.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={`${row.investment_id || row.id}-${index}`}
              >
                <td>
                  <strong>
                    {row.investment_id || "—"}
                  </strong>
                </td>
                <td>
                  {row.investor_name || "—"}
                </td>
                <td>
                  {row.branch_name || "—"}
                </td>
                <td>
                  {row.admin_name || "—"}
                </td>
                <td>
                  {money(
                    row.investment_amount
                  )}
                </td>
                <td>
                  {money(
                    row.maturity_amount
                  )}
                </td>
                <td>
                  {formatDate(
                    row.maturity_date
                  )}
                </td>
                <td>
                  <span
                    className={`reports-status reports-status--${statusClass(
                      row.status_name
                    )}`}
                  >
                    {row.status_name || "Unknown"}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function InterestTable({ rows }) {
  return (
    <div className="reports-table-wrap">
      <table className="reports-table">
        <thead>
          <tr>
            <th>INVESTMENT</th>
            <th>INVESTOR</th>
            <th>BRANCH</th>
            <th>ADMIN</th>
            <th>PRINCIPAL</th>
            <th>RATE</th>
            <th>INTEREST</th>
            <th>MATURITY</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="reports-empty"
              >
                No interest records found.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={`${row.investment_id || row.id}-${index}`}
              >
                <td>
                  <strong>
                    {row.investment_id || "—"}
                  </strong>
                </td>
                <td>
                  {row.investor_name || "—"}
                </td>
                <td>
                  {row.branch_name || "—"}
                </td>
                <td>
                  {row.admin_name || "—"}
                </td>
                <td>
                  {money(
                    row.investment_amount
                  )}
                </td>
                <td>
                  {Number(
                    row.interest_rate || 0
                  )}%
                </td>
                <td className="reports-green">
                  {money(
                    row.expected_interest_amount
                  )}
                </td>
                <td>
                  {formatDate(
                    row.maturity_date
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function BranchTable({ rows }) {
  return (
    <div className="reports-table-wrap">
      <table className="reports-table">
        <thead>
          <tr>
            <th>BRANCH</th>
            <th>INVESTORS</th>
            <th>INVESTMENTS</th>
            <th>PRINCIPAL</th>
            <th>INTEREST</th>
            <th>MATURITY AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="reports-empty"
              >
                No branch records found.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={`${row.branch_id || row.branch_name}-${index}`}
              >
                <td>
                  <strong>
                    {row.branch_name || "Unknown Branch"}
                  </strong>
                </td>
                <td>
                  {row.investor_count || 0}
                </td>
                <td>
                  {row.investment_count || 0}
                </td>
                <td>
                  {money(
                    row.principal_amount
                  )}
                </td>
                <td className="reports-green">
                  {money(
                    row.expected_interest
                  )}
                </td>
                <td>
                  {money(
                    row.maturity_amount
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function MonthlyTable({ rows }) {
  return (
    <div className="reports-table-wrap">
      <table className="reports-table">
        <thead>
          <tr>
            <th>MONTH</th>
            <th>INVESTORS</th>
            <th>INVESTMENTS</th>
            <th>PRINCIPAL</th>
            <th>INTEREST</th>
            <th>MATURITY AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="reports-empty"
              >
                No monthly records found.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={`${row.month}-${index}`}
              >
                <td>
                  <strong>
                    {row.month || "—"}
                  </strong>
                </td>
                <td>
                  {row.investor_count || 0}
                </td>
                <td>
                  {row.investment_count || 0}
                </td>
                <td>
                  {money(
                    row.principal_amount
                  )}
                </td>
                <td className="reports-green">
                  {money(
                    row.expected_interest
                  )}
                </td>
                <td>
                  {money(
                    row.maturity_amount
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function SettlementTable({ rows }) {
  const safeRows = Array.isArray(rows)
    ? rows
    : [];

  if (safeRows.length === 0) {
    return (
      <div className="reports-simple-message">
        No settlement records found.
      </div>
    );
  }

  const columns = Object.keys(
    safeRows[0] || {}
  );

  return (
    <div className="reports-table-wrap">
      <table className="reports-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>
                {String(column)
                  .replaceAll("_", " ")
                  .toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeRows.map(
            (row, index) => (
              <tr key={index}>
                {columns.map(
                  (column) => (
                    <td key={column}>
                      {row[column] ===
                      null
                        ? "—"
                        : String(
                            row[column]
                          )}
                    </td>
                  )
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

function ExtensionTable({ rows }) {
  const safeRows = Array.isArray(rows)
    ? rows
    : [];

  if (safeRows.length === 0) {
    return (
      <div className="reports-simple-message">
        No extension records found.
      </div>
    );
  }

  const columns = Object.keys(
    safeRows[0] || {}
  );

  return (
    <div className="reports-table-wrap">
      <table className="reports-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>
                {String(column)
                  .replaceAll("_", " ")
                  .toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeRows.map(
            (row, index) => (
              <tr key={index}>
                {columns.map(
                  (column) => (
                    <td key={column}>
                      {row[column] ===
                      null
                        ? "—"
                        : String(
                            row[column]
                          )}
                    </td>
                  )
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

function InvestmentTable({
  rows,
  onView,
}) {
  return (
    <div className="reports-table-wrap">
      <table className="reports-table">
        <thead>
          <tr>
            <th>
              INVESTMENT
            </th>
            <th>
              INVESTOR
            </th>
            <th>
              BRANCH
            </th>
            <th>
              ADMIN
            </th>
            <th>
              SUPER ADMIN
            </th>
            <th>
              AMOUNT
            </th>
            <th>
              RATE
            </th>
            <th>
              INVESTED
            </th>
            <th>
              MATURITY
            </th>
            <th>
              INTEREST
            </th>
            <th>
              STATUS
            </th>
            <th>
              ACTION
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.length ===
          0 ? (
            <tr>
              <td
                colSpan={
                  12
                }
                className="reports-empty"
              >
                No investment
                records found.
              </td>
            </tr>
          ) : (
            rows.map(
              (
                row,
                index
              ) => (
                <tr
                  key={`${row.id}-${index}`}
                >
                  <td>
                    <strong>
                      {row.id}
                    </strong>
                  </td>

                  <td>
                    <div className="reports-person">
                      <span>
                        {String(
                          row.investor
                        )
                          .charAt(
                            0
                          )
                          .toUpperCase()}
                      </span>

                      <div>
                        <strong>
                          {
                            row.investor
                          }
                        </strong>

                        <small>
                          {
                            row.investorId
                          }
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>
                    {
                      row.branch
                    }
                  </td>

                  <td>
                    {
                      row.admin
                    }
                  </td>

                  <td>
                    {
                      row.superAdmin
                    }
                  </td>

                  <td>
                    <strong>
                      {money(
                        row.amount
                      )}
                    </strong>
                  </td>

                  <td>
                    {
                      row.rate
                    }
                    %
                  </td>

                  <td>
                    {formatDate(
                      row.investmentDate
                    )}
                  </td>

                  <td>
                    {formatDate(
                      row.maturityDate
                    )}
                  </td>

                  <td className="reports-green">
                    {money(
                      row.expectedInterest
                    )}
                  </td>

                  <td>
                    <span
                      className={`reports-status reports-status--${statusClass(
                        row.status
                      )}`}
                    >
                      {
                        row.status
                      }
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="reports-view"
                      onClick={() =>
                        onView(
                          row
                        )
                      }
                    >
                      <Eye
                        size={
                          13
                        }
                      />
                      View
                    </button>
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

function InvestorTable({
  rows,
}) {
  return (
    <div className="reports-table-wrap">
      <table className="reports-table">
        <thead>
          <tr>
            <th>
              INVESTOR
            </th>
            <th>
              EMAIL
            </th>
            <th>
              BRANCH
            </th>
            <th>
              INVESTMENTS
            </th>
            <th>
              PRINCIPAL
            </th>
            <th>
              INTEREST
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.length ===
          0 ? (
            <tr>
              <td
                colSpan={
                  6
                }
                className="reports-empty"
              >
                No investors
                found.
              </td>
            </tr>
          ) : (
            rows.map(
              (
                row,
                index
              ) => (
                <tr
                  key={`${row.investor_id}-${index}`}
                >
                  <td>
                    <strong>
                      {
                        row.investor_name
                      }
                    </strong>
                  </td>

                  <td>
                    {
                      row.investor_email
                    }
                  </td>

                  <td>
                    {
                      row.branch_name
                    }
                  </td>

                  <td>
                    {
                      row.investment_count
                    }
                  </td>

                  <td>
                    {money(
                      row.principal_amount
                    )}
                  </td>

                  <td className="reports-green">
                    {money(
                      row.expected_interest
                    )}
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

function AdminTable({
  rows,
}) {
  return (
    <div className="reports-table-wrap">
      <table className="reports-table">
        <thead>
          <tr>
            <th>
              ADMIN
            </th>
            <th>
              EMAIL
            </th>
            <th>
              BRANCH
            </th>
            <th>
              INVESTORS
            </th>
            <th>
              INVESTMENTS
            </th>
            <th>
              PRINCIPAL
            </th>
            <th>
              INTEREST
            </th>
            <th>
              PENDING
            </th>
            <th>
              APPROVED
            </th>
            <th>
              REJECTED
            </th>
            <th>
              SETTLED
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.length ===
          0 ? (
            <tr>
              <td
                colSpan={
                  11
                }
                className="reports-empty"
              >
                No admin
                records found.
              </td>
            </tr>
          ) : (
            rows.map(
              (
                row
              ) => (
                <tr
                  key={
                    row.id
                  }
                >
                  <td>
                    <strong>
                      {
                        row.name
                      }
                    </strong>
                  </td>

                  <td>
                    {
                      row.email
                    }
                  </td>

                  <td>
                    {
                      row.branch
                    }
                  </td>

                  <td>
                    {
                      row.investors
                    }
                  </td>

                  <td>
                    {
                      row.investments
                    }
                  </td>

                  <td>
                    {money(
                      row.principal
                    )}
                  </td>

                  <td className="reports-green">
                    {money(
                      row.interest
                    )}
                  </td>

                  <td>
                    {
                      row.pending
                    }
                  </td>

                  <td>
                    {
                      row.approved
                    }
                  </td>

                  <td>
                    {
                      row.rejected
                    }
                  </td>

                  <td>
                    {
                      row.settled
                    }
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
}