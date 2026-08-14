import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  Eye,
  Download,
  Plus,
  Users,
  UserCheck,
  UserX,
  Clock3,
  IndianRupee,
} from "lucide-react";
import "../../Styles/SuperAdmin/InvestorManagement.css";
import Modal from "./Modal";

const MOCK_INVESTORS = [
  {
    id: "INV001",
    name: "Arjun Sharma",
    mobile: "9876543210",
    branch: "Mumbai HQ",
    registered: "2025-01-12",
    kyc: "Approved",
    status: "Active",
    aum: 500000,
  },
  {
    id: "INV002",
    name: "Priya Patel",
    mobile: "9876543211",
    branch: "Delhi North",
    registered: "2025-01-14",
    kyc: "Pending",
    status: "Pending",
    aum: 250000,
  },
  {
    id: "INV003",
    name: "Rahul Kumar",
    mobile: "9876543212",
    branch: "Bangalore",
    registered: "2025-01-16",
    kyc: "Approved",
    status: "Active",
    aum: 875000,
  },
  {
    id: "INV004",
    name: "Sunita Verma",
    mobile: "9876543213",
    branch: "Chennai",
    registered: "2025-01-18",
    kyc: "Rejected",
    status: "Suspended",
    aum: 150000,
  },
  {
    id: "INV005",
    name: "Vikram Singh",
    mobile: "9876543214",
    branch: "Pune",
    registered: "2025-01-20",
    kyc: "Pending",
    status: "Pending",
    aum: 325000,
  },
  {
    id: "INV006",
    name: "Neha Gupta",
    mobile: "9876543215",
    branch: "Mumbai HQ",
    registered: "2025-01-22",
    kyc: "Approved",
    status: "Active",
    aum: 600000,
  },
];

const PAGE_SIZE = 10;

function formatDate(iso) {
  const d = new Date(iso);

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAUM(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function badgeClass(value) {
  const normalized = String(value || "").toLowerCase();

  if (
    normalized === "approved" ||
    normalized === "active"
  ) {
    return "ivm-badge ivm-badge-green";
  }

  if (normalized === "pending") {
    return "ivm-badge ivm-badge-orange";
  }

  if (
    normalized === "rejected" ||
    normalized === "suspended"
  ) {
    return "ivm-badge ivm-badge-red";
  }

  return "ivm-badge";
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
    const handleClickOutside = (event) => {
      if (
        ref.current &&
        !ref.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

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
        "ivm-dropdown" +
        (open ? " ivm-dropdown-open" : "")
      }
      ref={ref}
    >
      <button
        type="button"
        className="ivm-dropdown-btn"
        onClick={() => setOpen((state) => !state)}
      >
        <span>
          {value || label}
        </span>

        <ChevronDown size={15} />
      </button>

      {open && (
        <div className="ivm-dropdown-menu">
          <button
            type="button"
            className={
              "ivm-dropdown-item" +
              (!value
                ? " ivm-dropdown-item-active"
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
                "ivm-dropdown-item" +
                (value === option
                  ? " ivm-dropdown-item-active"
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

const StatCard = ({
  label,
  value,
  subtitle,
  icon: Icon,
  tone,
}) => (
  <div
    className={`ivm-stat-card ivm-stat-card-${tone}`}
  >
    <div className="ivm-stat-top">
      <span className="ivm-stat-label">
        {label}
      </span>

      <span className="ivm-stat-icon">
        <Icon size={17} />
      </span>
    </div>

    <strong className="ivm-stat-value">
      {value}
    </strong>

    <span className="ivm-stat-subtitle">
      {subtitle}
    </span>
  </div>
);

export default function InvestorManagement() {
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] =
    useState(null);
  const [statusFilter, setStatusFilter] =
    useState(null);
  const [page, setPage] = useState(1);
  const [viewInvestor, setViewInvestor] =
    useState(null);

  const branches = useMemo(
    () =>
      Array.from(
        new Set(
          MOCK_INVESTORS.map(
            (investor) => investor.branch
          )
        )
      ),
    []
  );

  const statuses = useMemo(
    () =>
      Array.from(
        new Set(
          MOCK_INVESTORS.map(
            (investor) => investor.status
          )
        )
      ),
    []
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return MOCK_INVESTORS.filter((investor) => {
      const matchesSearch =
        !query ||
        investor.name
          .toLowerCase()
          .includes(query) ||
        investor.mobile.includes(query) ||
        investor.id
          .toLowerCase()
          .includes(query);

      const matchesBranch =
        !branchFilter ||
        investor.branch === branchFilter;

      const matchesStatus =
        !statusFilter ||
        investor.status === statusFilter;

      return (
        matchesSearch &&
        matchesBranch &&
        matchesStatus
      );
    });
  }, [
    search,
    branchFilter,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    const active = MOCK_INVESTORS.filter(
      (investor) =>
        investor.status === "Active"
    ).length;

    const pending = MOCK_INVESTORS.filter(
      (investor) =>
        investor.status === "Pending"
    ).length;

    const suspended = MOCK_INVESTORS.filter(
      (investor) =>
        investor.status === "Suspended"
    ).length;

    const totalAum = MOCK_INVESTORS.reduce(
      (sum, investor) =>
        sum + Number(investor.aum || 0),
      0
    );

    return {
      total: MOCK_INVESTORS.length,
      active,
      pending,
      suspended,
      totalAum,
    };
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const pageSafe = Math.min(
    page,
    totalPages
  );

  const paginated = filtered.slice(
    (pageSafe - 1) * PAGE_SIZE,
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
      "Investor ID",
      "Name",
      "Mobile",
      "Branch",
      "Registered",
      "KYC",
      "Status",
      "AUM",
    ];

    const rows = filtered.map((investor) => [
      investor.id,
      investor.name,
      investor.mobile,
      investor.branch,
      formatDate(investor.registered),
      investor.kyc,
      investor.status,
      investor.aum,
    ]);

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
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download =
      "investors.csv";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="ivm-page">
      <div className="ivm-page-head">
        <div>
          <h1>Investor Management</h1>

          <p>
            Manage investors, branches,
            KYC and account status
          </p>
        </div>

        <div className="ivm-page-actions">
          <button
            type="button"
            className="ivm-add-btn"
          >
            <Plus size={15} />
            Add Investor
          </button>

          <button
            type="button"
            className="ivm-export-btn"
            onClick={handleExport}
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      <div className="ivm-stat-grid">
        <StatCard
          label="TOTAL INVESTORS"
          value={stats.total}
          subtitle="All registered investors"
          icon={Users}
          tone="blue"
        />

        <StatCard
          label="ACTIVE INVESTORS"
          value={stats.active}
          subtitle="Active accounts"
          icon={UserCheck}
          tone="green"
        />

        <StatCard
          label="PENDING"
          value={stats.pending}
          subtitle="Awaiting verification"
          icon={Clock3}
          tone="orange"
        />

        <StatCard
          label="SUSPENDED"
          value={stats.suspended}
          subtitle="Suspended accounts"
          icon={UserX}
          tone="red"
        />

        <StatCard
          label="TOTAL INVESTMENT"
          value={formatAUM(
            stats.totalAum
          )}
          subtitle="Combined AUM"
          icon={IndianRupee}
          tone="purple"
        />
      </div>

      <div className="ivm-card">
        <div className="ivm-filter-head">
          <div>
            <h2>Investor Directory</h2>
            <span>
              {filtered.length} matching records
            </span>
          </div>

          <div className="ivm-filter-status">
            {statusFilter
              ? `Status: ${statusFilter}`
              : "All Status"}
          </div>
        </div>

        <div className="ivm-toolbar">
          <div className="ivm-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search by name, ID or mobile..."
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
              className="ivm-clear-btn"
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

        <div className="ivm-table-wrap">
          <table className="ivm-table">
            <thead>
              <tr>
                <th>Investor ID</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Branch</th>
                <th>Registered</th>
                <th>KYC</th>
                <th>Status</th>
                <th>AUM</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="ivm-empty"
                  >
                    <div className="ivm-empty-box">
                      <Search size={22} />
                      <strong>
                        No investors found
                      </strong>
                      <span>
                        Try changing your
                        search or filters.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((investor) => (
                  <tr key={investor.id}>
                    <td>
                      <button
                        type="button"
                        className="ivm-id-link"
                        onClick={() =>
                          setViewInvestor(
                            investor
                          )
                        }
                      >
                        {investor.id}
                      </button>
                    </td>

                    <td className="ivm-name">
                      {investor.name}
                    </td>

                    <td>
                      {investor.mobile}
                    </td>

                    <td>
                      <span className="ivm-branch-text">
                        {investor.branch}
                      </span>
                    </td>

                    <td className="ivm-muted">
                      {formatDate(
                        investor.registered
                      )}
                    </td>

                    <td>
                      <span
                        className={badgeClass(
                          investor.kyc
                        )}
                      >
                        {investor.kyc}
                      </span>
                    </td>

                    <td>
                      <span
                        className={badgeClass(
                          investor.status
                        )}
                      >
                        {investor.status}
                      </span>
                    </td>

                    <td className="ivm-aum">
                      {formatAUM(
                        investor.aum
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="ivm-view-btn"
                        onClick={() =>
                          setViewInvestor(
                            investor
                          )
                        }
                        aria-label="View investor"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="ivm-footer">
          <span className="ivm-footer-text">
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

          <div className="ivm-pagination">
            <button
              type="button"
              className="ivm-page-btn"
              disabled={pageSafe === 1}
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

            <span className="ivm-page-current">
              {pageSafe}
            </span>

            <button
              type="button"
              className="ivm-page-btn"
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

      {viewInvestor && (
        <Modal
          title={viewInvestor.name}
          onClose={() =>
            setViewInvestor(null)
          }
        >
          <div className="ivm-modal-grid">
            <div>
              <span className="ivm-modal-label">
                Investor ID
              </span>
              <span className="ivm-modal-value">
                {viewInvestor.id}
              </span>
            </div>

            <div>
              <span className="ivm-modal-label">
                Mobile
              </span>
              <span className="ivm-modal-value">
                {viewInvestor.mobile}
              </span>
            </div>

            <div>
              <span className="ivm-modal-label">
                Branch
              </span>
              <span className="ivm-modal-value">
                {viewInvestor.branch}
              </span>
            </div>

            <div>
              <span className="ivm-modal-label">
                Registered
              </span>
              <span className="ivm-modal-value">
                {formatDate(
                  viewInvestor.registered
                )}
              </span>
            </div>

            <div>
              <span className="ivm-modal-label">
                KYC
              </span>
              <span
                className={badgeClass(
                  viewInvestor.kyc
                )}
              >
                {viewInvestor.kyc}
              </span>
            </div>

            <div>
              <span className="ivm-modal-label">
                Status
              </span>
              <span
                className={badgeClass(
                  viewInvestor.status
                )}
              >
                {viewInvestor.status}
              </span>
            </div>

            <div>
              <span className="ivm-modal-label">
                AUM
              </span>
              <span className="ivm-modal-value">
                {formatAUM(
                  viewInvestor.aum
                )}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}