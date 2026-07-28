import React, { useState } from "react";
import { Download, Plus, Search, Eye, Pencil, Trash2, X } from "lucide-react";
import "../../Styles/Admin/InvestorManagement.css";

const initialInvestors = [
  { id: "INV001", name: "Arjun Sharma", email: "arjun@email.com", mobile: "9876543210", branch: "Mumbai HQ", registered: "12 Jan 2025", kyc: "Approved", status: "Active", investment: "₹5,00,000" },
  { id: "INV002", name: "Priya Patel", email: "priya@email.com", mobile: "9876543211", branch: "Delhi North", registered: "14 Jan 2025", kyc: "Pending", status: "Pending", investment: "₹2,50,000" },
  { id: "INV003", name: "Rahul Kumar", email: "rahul@email.com", mobile: "9876543212", branch: "Bangalore", registered: "16 Jan 2025", kyc: "Approved", status: "Active", investment: "₹8,75,000" },
  { id: "INV004", name: "Sunita Verma", email: "sunita@email.com", mobile: "9876543213", branch: "Chennai", registered: "18 Jan 2025", kyc: "Rejected", status: "Suspended", investment: "₹1,50,000" },
  { id: "INV005", name: "Vikram Singh", email: "vikram@email.com", mobile: "9876543214", branch: "Pune", registered: "20 Jan 2025", kyc: "Pending", status: "Pending", investment: "₹3,25,000" },
  { id: "INV006", name: "Neha Gupta", email: "neha@email.com", mobile: "9876543215", branch: "Mumbai HQ", registered: "22 Jan 2025", kyc: "Approved", status: "Active", investment: "₹6,00,000" },
];

const BRANCHES = ["Mumbai HQ", "Delhi North", "Bangalore", "Chennai", "Pune"];
const KYC_OPTIONS = ["Approved", "Pending", "Rejected"];
const STATUS_OPTIONS = ["Active", "Pending", "Suspended"];

const emptyForm = {
  name: "",
  email: "",
  mobile: "",
  branch: BRANCHES[0],
  kyc: "Pending",
  status: "Pending",
  investment: "",
};

function initials(name) {
  return name.charAt(0);
}

function nextInvestorId(list) {
  const max = list.reduce((acc, inv) => {
    const num = parseInt(inv.id.replace("INV", ""), 10);
    return Number.isNaN(num) ? acc : Math.max(acc, num);
  }, 0);
  return `INV${String(max + 1).padStart(3, "0")}`;
}

function formatInvestment(value) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "₹0";
  return `₹${Number(digits).toLocaleString("en-IN")}`;
}

function formatToday() {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function InvestorManagement() {
  const [investors, setInvestors] = useState(initialInvestors);
  const [selected, setSelected] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("All Branches");
  const [kycFilter, setKycFilter] = useState("All KYC Status");

  const filteredInvestors = investors.filter((inv) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      inv.name.toLowerCase().includes(q) ||
      inv.id.toLowerCase().includes(q) ||
      inv.mobile.includes(q) ||
      inv.email.toLowerCase().includes(q);
    const matchesBranch = branchFilter === "All Branches" || inv.branch === branchFilter;
    const matchesKyc = kycFilter === "All KYC Status" || inv.kyc === kycFilter;
    return matchesSearch && matchesBranch && matchesKyc;
  });

  const toggleAll = (e) => {
    setSelected(e.target.checked ? filteredInvestors.map((i) => i.id) : []);
  };

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setErrors({});
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.mobile.trim()) errs.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.mobile.trim())) errs.mobile = "Enter a 10-digit mobile number";
    if (!form.investment.trim()) errs.investment = "Investment amount is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newInvestor = {
      id: nextInvestorId(investors),
      name: form.name.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      branch: form.branch,
      registered: formatToday(),
      kyc: form.kyc,
      status: form.status,
      investment: formatInvestment(form.investment),
    };

    setInvestors((prev) => [newInvestor, ...prev]);
    setShowAddModal(false);
  };

  return (
    <>
      <div className="im-header">
        <div>
          <h1>Investor Management</h1>
          <p>Manage all registered investors, KYC status, and account access</p>
        </div>
        <div className="im-header-actions">
          <button className="btn btn-outline">
            <Download size={15} /> Export
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={15} /> Add Investor
          </button>
        </div>
      </div>

      <div className="im-toolbar">
        <div className="im-search">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by name, ID, mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="im-select"
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
        >
          <option>All Branches</option>
          {BRANCHES.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        <select
          className="im-select"
          value={kycFilter}
          onChange={(e) => setKycFilter(e.target.value)}
        >
          <option>All KYC Status</option>
          {KYC_OPTIONS.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <button className="btn btn-bulk">Bulk Approve</button>
      </div>

      <div className="im-table-wrap">
        <table className="im-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={toggleAll}
                  checked={
                    selected.length === filteredInvestors.length && filteredInvestors.length > 0
                  }
                />
              </th>
              <th>INVESTOR ID</th>
              <th>INVESTOR NAME</th>
              <th>MOBILE</th>
              <th>BRANCH</th>
              <th>REGISTERED</th>
              <th>KYC</th>
              <th>STATUS</th>
              <th>INVESTMENT</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvestors.length === 0 && (
              <tr>
                <td colSpan={10} className="im-no-results">
                  No investors match your search or filters.
                </td>
              </tr>
            )}
            {filteredInvestors.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(inv.id)}
                    onChange={() => toggleOne(inv.id)}
                  />
                </td>
                <td>
                  <span className="im-id">{inv.id}</span>
                </td>
                <td>
                  <div className="im-investor-cell">
                    <span className="im-avatar">{initials(inv.name)}</span>
                    <div>
                      <div className="im-name">{inv.name}</div>
                      <div className="im-email">{inv.email}</div>
                    </div>
                  </div>
                </td>
                <td>{inv.mobile}</td>
                <td className="im-branch">{inv.branch}</td>
                <td className="im-muted">{inv.registered}</td>
                <td>
                  <span className={`im-badge im-badge-${inv.kyc.toLowerCase()}`}>{inv.kyc}</span>
                </td>
                <td>
                  <span className={`im-badge im-badge-${inv.status.toLowerCase()}`}>{inv.status}</span>
                </td>
                <td className="im-investment">{inv.investment}</td>
                <td>
                  <div className="im-actions">
                    {inv.status === "Pending" && (
                      <>
                        <button className="im-btn im-btn-approve">Approve</button>
                        <button className="im-btn im-btn-reject">Reject</button>
                      </>
                    )}
                    <button className="im-icon-btn">
                      <Eye size={14} />
                    </button>
                    <button className="im-icon-btn">
                      <Pencil size={14} />
                  
                    </button>
                    <button className="im-icon-btn im-icon-btn-danger">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="im-pagination">
        <span>
          Showing {filteredInvestors.length === 0 ? 0 : 1}-{filteredInvestors.length} of{" "}
          {investors.length} records
        </span>
        <div className="im-pagination-controls">
          <button className="im-page-btn" disabled>‹</button>
          <button className="im-page-btn im-page-btn-active">1</button>
          <button className="im-page-btn" disabled>›</button>
        </div>
      </div>

      {showAddModal && (
        <div className="im-modal-overlay" onClick={closeAddModal}>
          <div className="im-modal" onClick={(e) => e.stopPropagation()}>
            <div className="im-modal-header">
              <h2>Add Investor</h2>
              <button className="im-icon-btn" onClick={closeAddModal}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="im-modal-form">
              <div className="im-form-row">
                <label>Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="e.g. Anjali Rao"
                />
                {errors.name && <span className="im-error">{errors.name}</span>}
              </div>

              <div className="im-form-row">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="e.g. anjali@email.com"
                />
                {errors.email && <span className="im-error">{errors.email}</span>}
              </div>

              <div className="im-form-row">
                <label>Mobile</label>
                <input
                  type="text"
                  value={form.mobile}
                  onChange={handleChange("mobile")}
                  placeholder="10-digit mobile number"
                />
                {errors.mobile && <span className="im-error">{errors.mobile}</span>}
              </div>

              <div className="im-form-row">
                <label>Branch</label>
                <select value={form.branch} onChange={handleChange("branch")}>
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="im-form-row-split">
                <div className="im-form-row">
                  <label>KYC Status</label>
                  <select value={form.kyc} onChange={handleChange("kyc")}>
                    {KYC_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="im-form-row">
                  <label>Account Status</label>
                  <select value={form.status} onChange={handleChange("status")}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="im-form-row">
                <label>Investment Amount (₹)</label>
                <input
                  type="text"
                  value={form.investment}
                  onChange={handleChange("investment")}
                  placeholder="e.g. 500000"
                />
                {errors.investment && <span className="im-error">{errors.investment}</span>}
              </div>

              <div className="im-modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeAddModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Investor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}