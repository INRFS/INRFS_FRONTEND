import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  Eye,
  Download,
  Ticket,
  TrendingUp,
  Clock3,
  CheckCircle2,
  IndianRupee,
  RefreshCw,
} from "lucide-react";
import "../../Styles/SuperAdmin/InvestmentManagement.css";
import Modal from "./Modal";
import {
  getSuperAdminInvestments,
} from "../../services/superadmin/investmentManagementService";

const PAGE_SIZE = 10;

const pick = (row, keys, fallback = "") => {
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

const normalizeInvestment = (row, index) => {
  const amount = Number(
    pick(row, [
      "amount",
      "investment_amount",
      "principal_amount",
      "invested_amount",
      "total_amount",
    ], 0)
  ) || 0;

  const monthlyInterest = Number(
    pick(row, [
      "monthly_interest",
      "monthly_interest_amount",
      "interest_amount",
    ], 0)
  ) || 0;

  return {
    raw: row,
    key:
      pick(row, [
        "id",
        "investment_id",
        "investment_code",
        "bond_number",
        "bond_no",
      ]) || `investment-${index}`,
    bond: pick(row, [
      "bond",
      "bond_number",
      "bond_no",
      "bond_code",
      "investment_code",
    ]),
    investor: pick(row, [
      "investor",
      "investor_name",
      "name",
      "full_name",
      "investor_full_name",
    ], "—"),
    branch: pick(row, [
      "branch",
      "branch_name",
      "service_location",
    ], "—"),
    branchId: pick(row, [
      "branch_id",
      "branchid",
    ]),
    amount,
    rate: pick(row, [
      "rate",
      "interest_rate",
      "interest_rate_display",
      "roi",
    ], "—"),
    investedOn: pick(row, [
      "invested_on",
      "investment_date",
      "invested_date",
      "start_date",
      "created_at",
    ]),
    maturesOn: pick(row, [
      "matures_on",
      "maturity_date",
      "matures_date",
      "end_date",
    ]),
    monthlyInterest,
    status: pick(row, [
      "status",
      "status_name",
      "investment_status",
    ], "—"),
  };
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
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

  if (value.includes("active") || value.includes("approved")) {
    return "ivt-badge ivt-badge-green";
  }
  if (value.includes("mature")) {
    return "ivt-badge ivt-badge-blue";
  }
  if (value.includes("pending")) {
    return "ivt-badge ivt-badge-orange";
  }
  if (
    value.includes("reject") ||
    value.includes("cancel") ||
    value.includes("failed")
  ) {
    return "ivt-badge ivt-badge-red";
  }

  return "ivt-badge";
}

function Dropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = (event) => {
      if (!event.target.closest(".ivt-dropdown")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className={`ivt-dropdown ${open ? "ivt-dropdown-open" : ""}`}>
      <button
        type="button"
        className="ivt-dropdown-btn"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{value || label}</span>
        <ChevronDown size={15} />
      </button>

      {open && (
        <div className="ivt-dropdown-menu">
          <button
            type="button"
            className={`ivt-dropdown-item ${!value ? "ivt-dropdown-item-active" : ""}`}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            {label}
          </button>

          {options.map((option) => (
            <button
              key={String(option)}
              type="button"
              className={`ivt-dropdown-item ${
                value === option ? "ivt-dropdown-item-active" : ""
              }`}
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

function StatCard({ label, value, subtitle, icon: Icon, tone }) {
  return (
    <div className={`ivt-stat-card ivt-stat-card-${tone}`}>
      <div className="ivt-stat-top">
        <span className="ivt-stat-label">{label}</span>
        <span className="ivt-stat-icon">
          <Icon size={17} />
        </span>
      </div>
      <strong className="ivt-stat-value">{value}</strong>
      <span className="ivt-stat-subtitle">{subtitle}</span>
    </div>
  );
}

export default function InvestmentManagement() {
  const [investments, setInvestments] = useState([]);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [viewInvestment, setViewInvestment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInvestments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getSuperAdminInvestments({
        search: "",
        branchId: "",
        statusId: "",
        limit: 100,
        offset: 0,
      });

      const rows = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      setInvestments(
        rows.map((row, index) => normalizeInvestment(row, index))
      );
    } catch (err) {
      setError(err?.message || "Unable to load investments.");
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  const branches = useMemo(() => {
    return Array.from(
      new Set(
        investments
          .map((item) => item.branch)
          .filter((value) => value && value !== "—")
      )
    ).sort();
  }, [investments]);

  const statuses = useMemo(() => {
    return Array.from(
      new Set(
        investments
          .map((item) => item.status)
          .filter((value) => value && value !== "—")
      )
    ).sort();
  }, [investments]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return investments.filter((investment) => {
      const matchesSearch =
        !query ||
        String(investment.investor).toLowerCase().includes(query) ||
        String(investment.bond).toLowerCase().includes(query) ||
        String(investment.branch).toLowerCase().includes(query);

      const matchesBranch =
        !branchFilter || investment.branch === branchFilter;

      const matchesStatus =
        !statusFilter || investment.status === statusFilter;

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [investments, search, branchFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = investments.length;

    const active = investments.filter((item) =>
      String(item.status).toLowerCase().includes("active") ||
      String(item.status).toLowerCase().includes("approved")
    ).length;

    const pending = investments.filter((item) =>
      String(item.status).toLowerCase().includes("pending")
    ).length;

    const matured = investments.filter((item) =>
      String(item.status).toLowerCase().includes("mature")
    ).length;

    const totalInvested = investments.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const monthlyInterest = investments.reduce(
      (sum, item) => sum + item.monthlyInterest,
      0
    );

    return {
      total,
      active,
      pending,
      matured,
      totalInvested,
      monthlyInterest,
    };
  }, [investments]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const pageSafe = Math.min(page, totalPages);

  const paginated = filtered.slice(
    (pageSafe - 1) * PAGE_SIZE,
    pageSafe * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [search, branchFilter, statusFilter]);

  const handleExport = () => {
    if (!filtered.length) return;

    const headers = [
      // "Bond Number",
      "Investor",
      "Branch",
      "Amount",
      "Rate",
      "Invested On",
      "Matures On",
      "Monthly Interest",
      "Status",
    ];

    const rows = filtered.map((item) => [
      item.bond || "-",
      item.investor,
      item.branch,
      item.amount,
      item.rate,
      formatDate(item.investedOn),
      formatDate(item.maturesOn),
      item.monthlyInterest,
      item.status,
    ]);

    const escape = (value) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) => row.map(escape).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "investments.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="ivt-page">
      <div className="ivt-page-head">


        <div className="ivt-page-actions">
      

       
        </div>
      </div>

      {error && (
        <div className="ivt-error">
          {error}
        </div>
      )}

      <div className="ivt-stat-grid">
        <StatCard
          label="TOTAL INVESTMENTS"
          value={stats.total}
          subtitle="All investment records"
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
          value={formatAmount(stats.totalInvested)}
          subtitle="Combined principal"
          icon={IndianRupee}
          tone="teal"
        />
      </div>

      <div className="ivt-card">
        {/* <div className="ivt-filter-head">
          <div>
            <h2>Investment Directory</h2>
            <span>
              {filtered.length} matching records
            </span>
          </div>

          <div className="ivt-filter-status">
            {statusFilter
              ? `Status: ${statusFilter}`
              : "All Status"}
          </div>
        </div> */}

        <div className="ivt-toolbar">
          <div className="ivt-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search investor, bond or branch..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
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

          {(search || branchFilter || statusFilter) && (
            <button
              type="button"
              className="ivt-clear-btn"
              onClick={() => {
                setSearch("");
                setBranchFilter("");
                setStatusFilter("");
              }}
            >
              Clear
            </button>
          )}

              <button
            type="button"
            className="ivt-export-btn"
            onClick={handleExport}
            disabled={!filtered.length}
          >
            <Download size={15} />
            Export
          </button>
        </div>

        <div className="ivt-table-wrap">
          <table className="ivt-table">
            <thead>
              <tr>
                {/* <th>Bond Number</th> */}
                <th>Investor</th>
                <th>Branch</th>
                <th>Amount</th>
                <th>Rate</th>
                <th>Invested On</th>
                <th>Matures On</th>
                <th>Monthly Int.</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="ivt-empty">
                    Loading investments...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="ivt-empty">
                    <div className="ivt-empty-box">
                      <Search size={22} />
                      <strong>No investments found</strong>
                      <span>
                        Try changing your search or filters.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((investment) => (
                  <tr key={investment.key}>
                    {/* <td>
                      {investment.bond ? (
                        <span className="ivt-bond-number">
                          {investment.bond}
                        </span>
                      ) : (
                        <span className="ivt-muted">—</span>
                      )}
                    </td> */}

                    <td className="ivt-name">
                      {investment.investor}
                    </td>

                    <td>
                      <span className="ivt-branch-text">
                        {investment.branch}
                      </span>
                    </td>

                    <td className="ivt-amount">
                      {formatAmount(investment.amount)}
                    </td>

                    <td>
                      <span className="ivt-rate-badge">
                        {investment.rate}
                      </span>
                    </td>

                    <td className="ivt-muted">
                      {formatDate(investment.investedOn)}
                    </td>

                    <td className="ivt-muted">
                      {formatDate(investment.maturesOn)}
                    </td>

                    <td className="ivt-interest">
                      {formatAmount(investment.monthlyInterest)}
                    </td>

                    <td>
                      <span
                        className={statusBadgeClass(
                          investment.status
                        )}
                      >
                        {investment.status}
                      </span>
                    </td>

                    <td>
                      <div className="ivt-actions">
                        <button
                          type="button"
                          className="ivt-view-btn"
                          onClick={() =>
                            setViewInvestment(investment)
                          }
                          aria-label="View investment"
                        >
                          <Eye size={15} />
                        </button>

                        {investment.bond && (
                          <button
                            type="button"
                            className="ivt-bond-btn"
                            onClick={() =>
                              setViewInvestment(investment)
                            }
                          >
                            <Ticket size={13} />
                            <span>Bond</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="ivt-footer">
          <span className="ivt-footer-text">
            Showing{" "}
            {filtered.length === 0
              ? 0
              : (pageSafe - 1) * PAGE_SIZE + 1}
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
              disabled={pageSafe === 1}
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
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
              disabled={pageSafe === totalPages}
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {viewInvestment && (
        <Modal
          title={
            viewInvestment.bond ||
            viewInvestment.investor
          }
          onClose={() => setViewInvestment(null)}
        >
          <div className="ivt-modal-grid">
            <div>
              <span className="ivt-modal-label">Bond</span>
              <span className="ivt-modal-value">
                {viewInvestment.bond || "Not issued"}
              </span>
            </div>

            <div>
              <span className="ivt-modal-label">Investor</span>
              <span className="ivt-modal-value">
                {viewInvestment.investor}
              </span>
            </div>

            <div>
              <span className="ivt-modal-label">Branch</span>
              <span className="ivt-modal-value">
                {viewInvestment.branch}
              </span>
            </div>

            <div>
              <span className="ivt-modal-label">Amount</span>
              <span className="ivt-modal-value">
                {formatAmount(viewInvestment.amount)}
              </span>
            </div>

            <div>
              <span className="ivt-modal-label">Rate</span>
              <span className="ivt-modal-value">
                {viewInvestment.rate}
              </span>
            </div>

            <div>
              <span className="ivt-modal-label">Invested On</span>
              <span className="ivt-modal-value">
                {formatDate(viewInvestment.investedOn)}
              </span>
            </div>

            <div>
              <span className="ivt-modal-label">Matures On</span>
              <span className="ivt-modal-value">
                {formatDate(viewInvestment.maturesOn)}
              </span>
            </div>

            <div>
              <span className="ivt-modal-label">
                Monthly Interest
              </span>
              <span className="ivt-modal-value">
                {formatAmount(
                  viewInvestment.monthlyInterest
                )}
              </span>
            </div>

            <div>
              <span className="ivt-modal-label">Status</span>
              <span
                className={statusBadgeClass(
                  viewInvestment.status
                )}
              >
                {viewInvestment.status}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}