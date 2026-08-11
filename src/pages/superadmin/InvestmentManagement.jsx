import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Eye, Download, Ticket } from "lucide-react";
import "../../Styles/SuperAdmin/InvestmentManagement.css";
import Modal from "./Modal";

const MOCK_INVESTMENTS = [
  {
    bond: "BND-2025-001",
    investor: "Arjun Sharma",
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
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatAmount(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function statusBadgeClass(status) {
  const v = status.toLowerCase();
  if (v === "active") return "ivt-badge ivt-badge-green";
  if (v === "matured") return "ivt-badge ivt-badge-blue";
  if (v === "pending") return "ivt-badge ivt-badge-orange";
  return "ivt-badge";
}

function Dropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={"ivt-dropdown" + (open ? " ivt-dropdown-open" : "")} ref={ref}>
      <button type="button" className="ivt-dropdown-btn" onClick={() => setOpen((o) => !o)}>
        <span>{value || label}</span>
        <ChevronDown size={15} />
      </button>
      {open && (
        <div className="ivt-dropdown-menu">
          <button
            type="button"
            className={"ivt-dropdown-item" + (!value ? " ivt-dropdown-item-active" : "")}
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
          >
            {label}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={"ivt-dropdown-item" + (value === opt ? " ivt-dropdown-item-active" : "")}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InvestmentManagement() {
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [viewBond, setViewBond] = useState(null);

  const branches = ["Hyderabad", "Vijayawada", "Chennai", "Bangalore"];
  const statuses = useMemo(
    () => Array.from(new Set(MOCK_INVESTMENTS.map((i) => i.status))),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_INVESTMENTS.filter((inv) => {
      const matchesSearch =
        !q ||
        inv.investor.toLowerCase().includes(q) ||
        (inv.bond && inv.bond.toLowerCase().includes(q));
      const matchesStatus = !statusFilter || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, branchFilter, statusFilter]);

  function handleExport() {
    const headers = ["Bond", "Investor", "Amount", "Rate", "Invested On", "Matures On", "Monthly Interest", "Status"];
    const rows = filtered.map((inv) => [
      inv.bond || "-",
      inv.investor,
      inv.amount,
      inv.rate,
      formatDate(inv.investedOn),
      formatDate(inv.maturesOn),
      inv.monthlyInterest,
      inv.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "investments.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="ivt-page">
      <div className="ivt-page-head">
        <div>
          <h1>Investment Management</h1>
          <p>All investments across all branches — {filtered.length} records</p>
        </div>
        <button type="button" className="ivt-export-btn" onClick={handleExport}>
          <Download size={15} />
          <span>Export</span>
        </button>
      </div>

      <div className="ivt-card">
        <div className="ivt-toolbar">
          <div className="ivt-search">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search bonds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dropdown label="All Branches" options={branches} value={branchFilter} onChange={setBranchFilter} />
          <Dropdown label="All Status" options={statuses} value={statusFilter} onChange={setStatusFilter} />
        </div>

        <div className="ivt-table-wrap">
          <table className="ivt-table">
            <thead>
              <tr>
                <th>Bond</th>
                <th>Investor</th>
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
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="ivt-empty">
                    No investments found.
                  </td>
                </tr>
              ) : (
                paginated.map((inv, idx) => (
                  <tr key={inv.bond || `pending-${idx}`}>
                    <td>
                      {inv.bond ? (
                        <button type="button" className="ivt-id-link" onClick={() => setViewBond(inv)}>
                          {inv.bond}
                        </button>
                      ) : (
                        <span className="ivt-muted">—</span>
                      )}
                    </td>
                    <td className="ivt-name">{inv.investor}</td>
                    <td className="ivt-amount">{formatAmount(inv.amount)}</td>
                    <td>
                      <span className="ivt-rate-badge">{inv.rate}</span>
                    </td>
                    <td className="ivt-muted">{formatDate(inv.investedOn)}</td>
                    <td className="ivt-muted">{formatDate(inv.maturesOn)}</td>
                    <td className="ivt-interest">{formatAmount(inv.monthlyInterest)}</td>
                    <td>
                      <span className={statusBadgeClass(inv.status)}>{inv.status}</span>
                    </td>
                    <td>
                      <div className="ivt-actions">
                        <button
                          type="button"
                          className="ivt-view-btn"
                          onClick={() => setViewBond(inv)}
                          aria-label="View investment"
                        >
                          <Eye size={15} />
                        </button>
                        {inv.status === "Active" && (
                          <button type="button" className="ivt-bond-btn">
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
            Showing {filtered.length === 0 ? 0 : (pageSafe - 1) * PAGE_SIZE + 1}–
            {Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length} records
          </span>
          <div className="ivt-pagination">
            <button
              type="button"
              className="ivt-page-btn"
              disabled={pageSafe === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            <span className="ivt-page-current">{pageSafe}</span>
            <button
              type="button"
              className="ivt-page-btn"
              disabled={pageSafe === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {viewBond && (
        <Modal title={viewBond.bond || viewBond.investor} onClose={() => setViewBond(null)}>
          <div className="ivt-modal-grid">
            <div>
              <span className="ivt-modal-label">Bond</span>
              <span className="ivt-modal-value">{viewBond.bond || "Not issued yet"}</span>
            </div>
            <div>
              <span className="ivt-modal-label">Investor</span>
              <span className="ivt-modal-value">{viewBond.investor}</span>
            </div>
            <div>
              <span className="ivt-modal-label">Amount</span>
              <span className="ivt-modal-value">{formatAmount(viewBond.amount)}</span>
            </div>
            <div>
              <span className="ivt-modal-label">Rate</span>
              <span className="ivt-modal-value">{viewBond.rate}</span>
            </div>
            <div>
              <span className="ivt-modal-label">Invested On</span>
              <span className="ivt-modal-value">{formatDate(viewBond.investedOn)}</span>
            </div>
            <div>
              <span className="ivt-modal-label">Matures On</span>
              <span className="ivt-modal-value">{formatDate(viewBond.maturesOn)}</span>
            </div>
            <div>
              <span className="ivt-modal-label">Monthly Interest</span>
              <span className="ivt-modal-value">{formatAmount(viewBond.monthlyInterest)}</span>
            </div>
            <div>
              <span className="ivt-modal-label">Status</span>
              <span className={statusBadgeClass(viewBond.status)}>{viewBond.status}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}