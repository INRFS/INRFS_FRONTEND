import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Search,
  ChevronDown,
  Eye,
  Download,
  Ticket,
  TrendingUp,
  Clock3,
  CheckCircle2,
  XCircle,
  IndianRupee,
} from "lucide-react";
import "../../Styles/SuperAdmin/InvestmentManagement.css";
import Modal from "./Modal";

const MOCK_INVESTMENTS = [
  {
    bond: "BND-2025-001",
    investor: "Arjun Sharma",
    branch: "Hyderabad",
    amount: 500000,
    rate: "3% p.m.",
    investedOn: "2025-01-15",
    maturesOn: "2026-01-15",
    monthlyInterest: 15000,
    status: "Active",
  },
  {
    bond: "BND-2025-002",
    investor: "Rahul Kumar",
    branch: "Bangalore",
    amount: 875000,
    rate: "3% p.m.",
    investedOn: "2025-01-18",
    maturesOn: "2025-07-18",
    monthlyInterest: 26250,
    status: "Matured",
  },
  {
    bond: "BND-2025-003",
    investor: "Neha Gupta",
    branch: "Chennai",
    amount: 600000,
    rate: "3% p.m.",
    investedOn: "2025-01-22",
    maturesOn: "2026-01-22",
    monthlyInterest: 18000,
    status: "Active",
  },
  {
    bond: "BND-2025-004",
    investor: "Priya Patel",
    branch: "Vijayawada",
    amount: 250000,
    rate: "3% p.m.",
    investedOn: "2025-07-22",
    maturesOn: null,
    monthlyInterest: 7500,
    status: "Pending",
  },
  {
    bond: null,
    investor: "Vikram Singh",
    branch: "Hyderabad",
    amount: 325000,
    rate: "3% p.m.",
    investedOn: "2025-07-21",
    maturesOn: null,
    monthlyInterest: 9750,
    status: "Pending",
  },
];

const PAGE_SIZE = 10;

function formatDate(iso) {
  if (!iso) return "—";

  const date = new Date(iso);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function statusBadgeClass(status) {
  const value = String(status || "").toLowerCase();

  if (value === "active") {
    return "ivt-badge ivt-badge-green";
  }

  if (value === "matured") {
    return "ivt-badge ivt-badge-blue";
  }

  if (value === "pending") {
    return "ivt-badge ivt-badge-orange";
  }

  if (value === "rejected") {
    return "ivt-badge ivt-badge-red";
  }

  return "ivt-badge";
}

function Dropdown({
  label,
  options,
  value,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        ref.current &&
        !ref.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div
      className={
        "ivt-dropdown" +
        (open
          ? " ivt-dropdown-open"
          : "")
      }
      ref={ref}
    >
      <button
        type="button"
        className="ivt-dropdown-btn"
        onClick={() =>
          setOpen((current) => !current)
        }
      >
        <span>
          {value || label}
        </span>

        <ChevronDown size={15} />
      </button>

      {open && (
        <div className="ivt-dropdown-menu">
          <button
            type="button"
            className={
              "ivt-dropdown-item" +
              (!value
                ? " ivt-dropdown-item-active"
                : "")
            }
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
          >
            {label}
          </button>

          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={
                "ivt-dropdown-item" +
                (value === option
                  ? " ivt-dropdown-item-active"
                  : "")
              }
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  tone,
}) {
  return (
    <div
      className={`ivt-stat-card ivt-stat-card-${tone}`}
    >
      <div className="ivt-stat-top">
        <span className="ivt-stat-label">
          {label}
        </span>

        <span className="ivt-stat-icon">
          <Icon size={17} />
        </span>
      </div>

      <strong className="ivt-stat-value">
        {value}
      </strong>

      <span className="ivt-stat-subtitle">
        {subtitle}
      </span>
    </div>
  );
}

export default function InvestmentManagement() {
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] =
    useState(null);
  const [statusFilter, setStatusFilter] =
    useState(null);
  const [page, setPage] = useState(1);
  const [viewBond, setViewBond] =
    useState(null);

  const branches = useMemo(
    () =>
      Array.from(
        new Set(
          MOCK_INVESTMENTS.map(
            (investment) =>
              investment.branch
          )
        )
      ),
    []
  );

  const statuses = useMemo(
    () =>
      Array.from(
        new Set(
          MOCK_INVESTMENTS.map(
            (investment) =>
              investment.status
          )
        )
      ),
    []
  );

  const stats = useMemo(() => {
    const total = MOCK_INVESTMENTS.length;

    const active =
      MOCK_INVESTMENTS.filter(
        (investment) =>
          investment.status === "Active"
      ).length;

    const pending =
      MOCK_INVESTMENTS.filter(
        (investment) =>
          investment.status === "Pending"
      ).length;

    const matured =
      MOCK_INVESTMENTS.filter(
        (investment) =>
          investment.status === "Matured"
      ).length;

    const rejected =
      MOCK_INVESTMENTS.filter(
        (investment) =>
          investment.status === "Rejected"
      ).length;

    const totalInvested =
      MOCK_INVESTMENTS.reduce(
        (sum, investment) =>
          sum +
          Number(
            investment.amount || 0
          ),
        0
      );

    const monthlyInterest =
      MOCK_INVESTMENTS.reduce(
        (sum, investment) =>
          sum +
          Number(
            investment.monthlyInterest ||
              0
          ),
        0
      );

    return {
      total,
      active,
      pending,
      matured,
      rejected,
      totalInvested,
      monthlyInterest,
    };
  }, []);

  const filtered = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return MOCK_INVESTMENTS.filter(
      (investment) => {
        const matchesSearch =
          !query ||
          investment.investor
            .toLowerCase()
            .includes(query) ||
          String(
            investment.bond || ""
          )
            .toLowerCase()
            .includes(query);

        const matchesBranch =
          !branchFilter ||
          investment.branch ===
            branchFilter;

        const matchesStatus =
          !statusFilter ||
          investment.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesBranch &&
          matchesStatus
        );
      }
    );
  }, [
    search,
    branchFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length / PAGE_SIZE
    )
  );

  const pageSafe = Math.min(
    page,
    totalPages
  );

  const paginated = filtered.slice(
    (pageSafe - 1) *
      PAGE_SIZE,
    pageSafe * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [
    search,
    branchFilter,
    statusFilter,
  ]);

  function handleExport() {
    const headers = [
      "Bond",
      "Investor",
      "Branch",
      "Amount",
      "Rate",
      "Invested On",
      "Matures On",
      "Monthly Interest",
      "Status",
    ];

    const rows = filtered.map(
      (investment) => [
        investment.bond || "-",
        investment.investor,
        investment.branch,
        investment.amount,
        investment.rate,
        formatDate(
          investment.investedOn
        ),
        formatDate(
          investment.maturesOn
        ),
        investment.monthlyInterest,
        investment.status,
      ]
    );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replaceAll(
              '"',
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download =
      "investments.csv";

    document.body.appendChild(
      anchor
    );

    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="ivt-page">
      <div className="ivt-page-head">
        <div>
          <h1>Investment Management</h1>

          <p>
            Manage investments,
            bonds, branches and
            investment status
          </p>
        </div>

        <div className="ivt-page-actions">
          <button
            type="button"
            className="ivt-export-btn"
            onClick={handleExport}
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      <div className="ivt-stat-grid">
        <StatCard
          label="TOTAL INVESTMENTS"
          value={stats.total}
          subtitle="All investment requests"
          icon={TrendingUp}
          tone="blue"
        />

        <StatCard
          label="ACTIVE INVESTMENTS"
          value={stats.active}
          subtitle="Approved and active"
          icon={CheckCircle2}
          tone="green"
        />

        <StatCard
          label="PENDING APPROVAL"
          value={stats.pending}
          subtitle="Waiting for approval"
          icon={Clock3}
          tone="orange"
        />

        <StatCard
          label="MATURED"
          value={stats.matured}
          subtitle="Completed investments"
          icon={CheckCircle2}
          tone="purple"
        />

        <StatCard
          label="TOTAL INVESTED"
          value={formatAmount(
            stats.totalInvested
          )}
          subtitle="Combined principal"
          icon={IndianRupee}
          tone="teal"
        />
      </div>

      <div className="ivt-card">
        <div className="ivt-filter-head">
          <div>
            <h2>
              Investment Directory
            </h2>

            <span>
              {filtered.length} matching
              records
            </span>
          </div>

          <div className="ivt-filter-status">
            {statusFilter
              ? `Status: ${statusFilter}`
              : "All Status"}
          </div>
        </div>

        <div className="ivt-toolbar">
          <div className="ivt-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search investor or bond..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>

          <Dropdown
            label="All Branches"
            options={branches}
            value={branchFilter}
            onChange={setBranchFilter}
          />

          <Dropdown
            label="All Status"
            options={statuses}
            value={statusFilter}
            onChange={setStatusFilter}
          />

          {(search ||
            branchFilter ||
            statusFilter) && (
            <button
              type="button"
              className="ivt-clear-btn"
              onClick={() => {
                setSearch("");
                setBranchFilter(null);
                setStatusFilter(null);
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="ivt-table-wrap">
          <table className="ivt-table">
            <thead>
              <tr>
                <th>
                  Bond Number
                </th>

                <th>Investor</th>

                <th>Branch</th>

                <th>Amount</th>

                <th>Rate</th>

                <th>Invested On</th>

                <th>Matures On</th>

                <th>
                  Monthly Int.
                </th>

                <th>Status</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="ivt-empty"
                  >
                    <div className="ivt-empty-box">
                      <Search size={22} />

                      <strong>
                        No investments
                        found
                      </strong>

                      <span>
                        Try changing your
                        search or filters.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map(
                  (
                    investment,
                    index
                  ) => (
                    <tr
                      key={
                        investment.bond ||
                        `pending-${index}`
                      }
                    >
                      <td>
                        {investment.bond ? (
                          <span className="ivt-bond-number">
                            {investment.bond}
                          </span>
                        ) : (
                          <span className="ivt-muted">
                            —
                          </span>
                        )}
                      </td>

                      <td className="ivt-name">
                        {
                          investment.investor
                        }
                      </td>

                      <td>
                        <span className="ivt-branch-text">
                          {
                            investment.branch
                          }
                        </span>
                      </td>

                      <td className="ivt-amount">
                        {formatAmount(
                          investment.amount
                        )}
                      </td>

                      <td>
                        <span className="ivt-rate-badge">
                          {
                            investment.rate
                          }
                        </span>
                      </td>

                      <td className="ivt-muted">
                        {formatDate(
                          investment.investedOn
                        )}
                      </td>

                      <td className="ivt-muted">
                        {formatDate(
                          investment.maturesOn
                        )}
                      </td>

                      <td className="ivt-interest">
                        {formatAmount(
                          investment.monthlyInterest
                        )}
                      </td>

                      <td>
                        <span
                          className={statusBadgeClass(
                            investment.status
                          )}
                        >
                          {
                            investment.status
                          }
                        </span>
                      </td>

                      <td>
                        <div className="ivt-actions">
                          <button
                            type="button"
                            className="ivt-view-btn"
                            onClick={() =>
                              setViewBond(
                                investment
                              )
                            }
                            aria-label="View investment"
                          >
                            <Eye
                              size={15}
                            />
                          </button>

                          {investment.status ===
                            "Active" && (
                            <button
                              type="button"
                              className="ivt-bond-btn"
                              onClick={() =>
                                setViewBond(
                                  investment
                                )
                              }
                              aria-label="View bond"
                            >
                              <Ticket
                                size={13}
                              />

                              <span>
                                Bond
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="ivt-footer">
          <span className="ivt-footer-text">
            Showing{" "}
            {filtered.length === 0
              ? 0
              : (pageSafe - 1) *
                  PAGE_SIZE +
                1}
            –
            {Math.min(
              pageSafe * PAGE_SIZE,
              filtered.length
            )}{" "}
            of {filtered.length} records
          </span>

          <div className="ivt-pagination">
            <button
              type="button"
              className="ivt-page-btn"
              disabled={
                pageSafe === 1
              }
              onClick={() =>
                setPage((current) =>
                  Math.max(
                    1,
                    current - 1
                  )
                )
              }
            >
              ‹
            </button>

            <span className="ivt-page-current">
              {pageSafe}
            </span>

            <button
              type="button"
              className="ivt-page-btn"
              disabled={
                pageSafe === totalPages
              }
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    totalPages,
                    current + 1
                  )
                )
              }
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {viewBond && (
        <Modal
          title={
            viewBond.bond ||
            viewBond.investor
          }
          onClose={() =>
            setViewBond(null)
          }
        >
          <div className="ivt-modal-grid">
            <div>
              <span className="ivt-modal-label">
                Bond
              </span>

              <span className="ivt-modal-value">
                {viewBond.bond ||
                  "Not issued yet"}
              </span>
            </div>

            <div>
              <span className="ivt-modal-label">
                Investor
              </span>

              <span className="ivt-modal-value">
                {viewBond.investor}
              </span>
            </div>

            <div>
              <span className="ivt-modal-label">
                Branch
              </span>

              <span className="ivt-modal-value">
                {viewBond.branch}
              </span>
            </div>

            <div>
              <span className="ivt-modal-label">
                Amount
              </span>

              <span className="ivt-modal-value">
                {formatAmount(
                  viewBond.amount
                )}
              </span>
            </div>

            <div>
              <span className="ivt-modal-label">
                Rate
              </span>

              <span className="ivt-modal-value">
                {viewBond.rate}
              </span>
            </div>

            <div>
              <span className="ivt-modal-label">
                Invested On
              </span>

              <span className="ivt-modal-value">
                {formatDate(
                  viewBond.investedOn
                )}
              </span>
            </div>

            <div>
              <span className="ivt-modal-label">
                Matures On
              </span>

              <span className="ivt-modal-value">
                {formatDate(
                  viewBond.maturesOn
                )}
              </span>
            </div>

            <div>
              <span className="ivt-modal-label">
                Monthly Interest
              </span>

              <span className="ivt-modal-value">
                {formatAmount(
                  viewBond.monthlyInterest
                )}
              </span>
            </div>

            <div>
              <span className="ivt-modal-label">
                Status
              </span>

              <span
                className={statusBadgeClass(
                  viewBond.status
                )}
              >
                {viewBond.status}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}