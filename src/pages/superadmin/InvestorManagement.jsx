
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Eye, Download } from "lucide-react";
import "../../Styles/SuperAdmin/InvestorManagement.css";
import Modal from "./Modal";

const MOCK_INVESTORS = [
  { id: "INV001", name: "Arjun Sharma", mobile: "9876543210", branch: "Mumbai HQ", registered: "2025-01-12", kyc: "Approved", status: "Active", aum: 500000 },
  { id: "INV002", name: "Priya Patel", mobile: "9876543211", branch: "Delhi North", registered: "2025-01-14", kyc: "Pending", status: "Pending", aum: 250000 },
  { id: "INV003", name: "Rahul Kumar", mobile: "9876543212", branch: "Bangalore", registered: "2025-01-16", kyc: "Approved", status: "Active", aum: 875000 },
  { id: "INV004", name: "Sunita Verma", mobile: "9876543213", branch: "Chennai", registered: "2025-01-18", kyc: "Rejected", status: "Suspended", aum: 150000 },
  { id: "INV005", name: "Vikram Singh", mobile: "9876543214", branch: "Pune", registered: "2025-01-20", kyc: "Pending", status: "Pending", aum: 325000 },
  { id: "INV006", name: "Neha Gupta", mobile: "9876543215", branch: "Mumbai HQ", registered: "2025-01-22", kyc: "Approved", status: "Active", aum: 600000 },
];

const PAGE_SIZE = 10;

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatAUM(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function badgeClass(value) {
  const v = value.toLowerCase();
  if (v === "approved" || v === "active") return "ivm-badge ivm-badge-green";
  if (v === "pending") return "ivm-badge ivm-badge-orange";
  if (v === "rejected" || v === "suspended") return "ivm-badge ivm-badge-red";
  return "ivm-badge";
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
    <div className={"ivm-dropdown" + (open ? " ivm-dropdown-open" : "")} ref={ref}>
      <button type="button" className="ivm-dropdown-btn" onClick={() => setOpen((o) => !o)}>
        <span>{value || label}</span>
        <ChevronDown size={15} />
      </button>
      {open && (
        <div className="ivm-dropdown-menu">
          <button
            type="button"
            className={"ivm-dropdown-item" + (!value ? " ivm-dropdown-item-active" : "")}
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
              className={"ivm-dropdown-item" + (value === opt ? " ivm-dropdown-item-active" : "")}
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

export default function InvestorManagement() {
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [viewInvestor, setViewInvestor] = useState(null);

  const branches = useMemo(
    () => Array.from(new Set(MOCK_INVESTORS.map((i) => i.branch))),
    []
  );
  const statuses = useMemo(
    () => Array.from(new Set(MOCK_INVESTORS.map((i) => i.status))),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_INVESTORS.filter((inv) => {
      const matchesSearch =
        !q ||
        inv.name.toLowerCase().includes(q) ||
        inv.mobile.includes(q) ||
        inv.id.toLowerCase().includes(q);
      const matchesBranch = !branchFilter || inv.branch === branchFilter;
      const matchesStatus = !statusFilter || inv.status === statusFilter;
      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [search, branchFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, branchFilter, statusFilter]);

  function handleExport() {
    const headers = ["Investor ID", "Name", "Mobile", "Branch", "Registered", "KYC", "Status", "AUM"];
    const rows = filtered.map((inv) => [
      inv.id,
      inv.name,
      inv.mobile,
      inv.branch,
      formatDate(inv.registered),
      inv.kyc,
      inv.status,
      inv.aum,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "investors.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="ivm-page">
      <div className="ivm-page-head">
        <div>
          <h1>Investor Management</h1>
          <p>All investors across all branches — {filtered.length} records</p>
        </div>
        <button type="button" className="ivm-export-btn" onClick={handleExport}>
          <Download size={15} />
          <span>Export</span>
        </button>
      </div>

      <div className="ivm-card">
        <div className="ivm-toolbar">
          <div className="ivm-search">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search investors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dropdown label="All Branches" options={branches} value={branchFilter} onChange={setBranchFilter} />
          <Dropdown label="All Status" options={statuses} value={statusFilter} onChange={setStatusFilter} />
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
                  <td colSpan={9} className="ivm-empty">
                    No investors found.
                  </td>
                </tr>
              ) : (
                paginated.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <button type="button" className="ivm-id-link" onClick={() => setViewInvestor(inv)}>
                        {inv.id}
                      </button>
                    </td>
                    <td className="ivm-name">{inv.name}</td>
                    <td>{inv.mobile}</td>
                    <td>{inv.branch}</td>
                    <td className="ivm-muted">{formatDate(inv.registered)}</td>
                    <td>
                      <span className={badgeClass(inv.kyc)}>{inv.kyc}</span>
                    </td>
                    <td>
                      <span className={badgeClass(inv.status)}>{inv.status}</span>
                    </td>
                    <td className="ivm-aum">{formatAUM(inv.aum)}</td>
                    <td>
                      <button
                        type="button"
                        className="ivm-view-btn"
                        onClick={() => setViewInvestor(inv)}
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
            Showing {filtered.length === 0 ? 0 : (pageSafe - 1) * PAGE_SIZE + 1}–
            {Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length} records
          </span>
          <div className="ivm-pagination">
            <button
              type="button"
              className="ivm-page-btn"
              disabled={pageSafe === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            <span className="ivm-page-current">{pageSafe}</span>
            <button
              type="button"
              className="ivm-page-btn"
              disabled={pageSafe === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {viewInvestor && (
        <Modal title={viewInvestor.name} onClose={() => setViewInvestor(null)}>
          <div className="ivm-modal-grid">
            <div>
              <span className="ivm-modal-label">Investor ID</span>
              <span className="ivm-modal-value">{viewInvestor.id}</span>
            </div>
            <div>
              <span className="ivm-modal-label">Mobile</span>
              <span className="ivm-modal-value">{viewInvestor.mobile}</span>
            </div>
            <div>
              <span className="ivm-modal-label">Branch</span>
              <span className="ivm-modal-value">{viewInvestor.branch}</span>
            </div>
            <div>
              <span className="ivm-modal-label">Registered</span>
              <span className="ivm-modal-value">{formatDate(viewInvestor.registered)}</span>
            </div>
            <div>
              <span className="ivm-modal-label">KYC</span>
              <span className={badgeClass(viewInvestor.kyc)}>{viewInvestor.kyc}</span>
            </div>
            <div>
              <span className="ivm-modal-label">Status</span>
              <span className={badgeClass(viewInvestor.status)}>{viewInvestor.status}</span>
            </div>
            <div>
              <span className="ivm-modal-label">AUM</span>
              <span className="ivm-modal-value">{formatAUM(viewInvestor.aum)}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}