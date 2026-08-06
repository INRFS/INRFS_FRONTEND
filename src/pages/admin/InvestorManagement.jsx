import React, { useState } from "react";
import { Download, Plus, Search, Eye, X, CheckCircle2, XCircle, Send } from "lucide-react";
import "../../Styles/Admin/InvestorManagement.css";

const BRANCHES = ["Vijayawada", "Hyderabad", "Bengaluru", "Chennai"];

const initialInvestors = [
  {
    email: "arjun@email.com",
    id: "INV001",
    name: "Arjun Sharma",
    mobile: "9876543210",
    branch: "Hyderabad",
    registered: "12 Jan 2025",
    kyc: "Approved",
    status: "Active",
    investment: "₹5,00,000",
    dob: "1990-04-12",
    aadhaar: "XXXX XXXX 4321",
    address: "204, Silver Oak Residency, Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    pin: "400058",
    bank: { accountHolder: "Arjun Sharma", accountNumber: "500123456789", ifsc: "HDFC0001234", bankName: "HDFC Bank" },
  },
  {
    email: "priya@email.com",
    id: null,
    name: "Priya Patel",
    mobile: "9876511111",
    branch: "Vijayawada",
    registered: "14 Jan 2025",
    kyc: "Pending",
    status: "Pending",
    investment: "₹2,50,000",
    dob: "1988-11-03",
    aadhaar: "XXXX XXXX 5566",
    address: "12, Rajouri Garden",
    city: "Delhi",
    state: "Delhi",
    pin: "110027",
    bank: { accountHolder: "Priya Patel", accountNumber: "500223456790", ifsc: "ICIC0002345", bankName: "ICICI Bank" },
  },
  {
    email: "rahul@email.com",
    id: "INV003",
    name: "Rahul Kumar",
    mobile: "9876543212",
    branch: "Bengaluru",
    registered: "16 Jan 2025",
    kyc: "Approved",
    status: "Active",
    investment: "₹8,75,000",
    dob: "1992-07-21",
    aadhaar: "XXXX XXXX 7788",
    address: "45, Whitefield Main Road",
    city: "Bangalore",
    state: "Karnataka",
    pin: "560066",
    bank: { accountHolder: "Rahul Kumar", accountNumber: "500323456791", ifsc: "SBIN0003456", bankName: "State Bank of India" },
  },
  {
    email: "sunita@email.com",
    id: null,
    name: "Sunita Verma",
    mobile: "9876543213",
    branch: "Chennai",
    registered: "18 Jan 2025",
    kyc: "Rejected",
    status: "Suspended",
    investment: "₹1,50,000",
    dob: "1985-02-14",
    aadhaar: "XXXX XXXX 9900",
    address: "78, Koregaon Park",
    city: "Pune",
    state: "Maharashtra",
    pin: "411001",
    bank: { accountHolder: "Sunita Verma", accountNumber: "500423456792", ifsc: "AXIS0004567", bankName: "Axis Bank" },
  },
  {
    email: "vikram@email.com",
    id: null,
    name: "Vikram Singh",
    mobile: "9876543214",
    branch: "Hyderabad",
    registered: "20 Jan 2025",
    kyc: "Pending",
    status: "Pending",
    investment: "₹3,25,000",
    dob: "1991-09-30",
    aadhaar: "XXXX XXXX 1122",
    address: "9, MG Road",
    city: "Bangalore",
    state: "Karnataka",
    pin: "560001",
    bank: { accountHolder: "Vikram Singh", accountNumber: "500523456793", ifsc: "PUNB0005678", bankName: "Punjab National Bank" },
  },
  {
    email: "neha@email.com",
    id: "INV006",
    name: "Neha Gupta",
    mobile: "9876543215",
    branch: "Bengaluru",
    registered: "22 Jan 2025",
    kyc: "Approved",
    status: "Active",
    investment: "₹6,00,000",
    dob: "1993-06-05",
    aadhaar: "XXXX XXXX 3344",
    address: "22, Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    pin: "400050",
    bank: { accountHolder: "Neha Gupta", accountNumber: "500623456794", ifsc: "HDFC0006789", bankName: "HDFC Bank" },
  },
];

const KYC_OPTIONS = ["Approved", "Pending", "Rejected"];
const STATUS_TABS = ["All", "Pending", "Active", "Suspended"];

const emptyForm = {
  name: "",
  email: "",
  mobile: "",
  branch: BRANCHES[0],
  kyc: "Pending",
  status: "Pending",
  investment: "",
  bankName: "",
  accountNumber: "",
  ifsc: "",
};

function initials(name) {
  return name.charAt(0);
}

function nextInvestorId(list) {
  const max = list.reduce((acc, inv) => {
    if (!inv.id) return acc;
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

function ReviewKycModal({ investor, onClose, onApprove, onReject }) {
  const [branch, setBranch] = useState(investor.branch || BRANCHES[0]);
  const [remarks, setRemarks] = useState("");

  return (
    <div className="im-modal-overlay" onClick={onClose}>
      <div className="im-modal invmgmt-review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="im-modal-header">
          <h2>KYC Review — {investor.name}</h2>
          <button className="im-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="im-modal-form">
          <div className="invmgmt-detail-grid">
            <div className="invmgmt-detail-card">
              <span className="invmgmt-detail-label">Full Name</span>
              <span className="invmgmt-detail-value">{investor.name}</span>
            </div>
            <div className="invmgmt-detail-card">
              <span className="invmgmt-detail-label">Mobile</span>
              <span className="invmgmt-detail-value">{investor.mobile}</span>
            </div>
            <div className="invmgmt-detail-card">
              <span className="invmgmt-detail-label">Email</span>
              <span className="invmgmt-detail-value">{investor.email}</span>
            </div>
            <div className="invmgmt-detail-card">
              <span className="invmgmt-detail-label">Date of Birth</span>
              <span className="invmgmt-detail-value">{investor.dob}</span>
            </div>
            <div className="invmgmt-detail-card">
              <span className="invmgmt-detail-label">Aadhaar Number</span>
              <span className="invmgmt-detail-value">{investor.aadhaar}</span>
            </div>
            <div className="invmgmt-detail-card">
              <span className="invmgmt-detail-label">Branch</span>
              <span className="invmgmt-detail-value">{investor.branch}</span>
            </div>
            <div className="invmgmt-detail-card invmgmt-detail-card--full">
              <span className="invmgmt-detail-label">Address</span>
              <span className="invmgmt-detail-value">{investor.address}</span>
            </div>
            <div className="invmgmt-detail-card">
              <span className="invmgmt-detail-label">City</span>
              <span className="invmgmt-detail-value">{investor.city}</span>
            </div>
            <div className="invmgmt-detail-card">
              <span className="invmgmt-detail-label">State</span>
              <span className="invmgmt-detail-value">{investor.state}</span>
            </div>
            <div className="invmgmt-detail-card">
              <span className="invmgmt-detail-label">PIN Code</span>
              <span className="invmgmt-detail-value">{investor.pin}</span>
            </div>
            <div className="invmgmt-detail-card">
              <span className="invmgmt-detail-label">Investment Amount</span>
              <span className="invmgmt-detail-value">{investor.investment}</span>
            </div>
            <div className="invmgmt-detail-card">
              <span className="invmgmt-detail-label">Current KYC Status</span>
              <span className={`im-badge im-badge-${investor.kyc.toLowerCase()}`}>{investor.kyc}</span>
            </div>
          </div>

          <div className="im-form-row">
            <label>Branch (assign / change)</label>
            <select
              className="invmgmt-branch-select"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="im-form-row">
            <label>Remarks (optional)</label>
            <textarea
              className="invmgmt-remarks"
              placeholder="Add remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />
          </div>

          <div className="im-modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => onReject(investor.email, remarks)}
            >
              <XCircle size={14} /> Reject
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => onApprove(investor.email, branch, remarks)}
            >
              <CheckCircle2 size={14} /> Approve KYC &amp; Activate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RejectConfirmModal({ investor, onClose, onConfirm }) {
  return (
    <div className="im-modal-overlay" onClick={onClose}>
      <div className="im-modal" onClick={(e) => e.stopPropagation()}>
        <div className="im-modal-header">
          <h2>Reject KYC</h2>
          <button className="im-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="im-modal-form">
          <p className="invmgmt-confirm-text">
            Are you sure you want to reject the KYC application for{" "}
            <strong>{investor.name}</strong>? Their account status will be set to Suspended.
          </p>

          <div className="im-modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => onConfirm(investor.email)}
            >
              <XCircle size={14} /> Confirm Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuperAdminNoticeModal({ notice, onClose }) {
  const isApprove = notice.type === "approve";

  return (
    <div className="im-modal-overlay" onClick={onClose}>
      <div className="im-modal invmgmt-notice-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`invmgmt-notice-icon${isApprove ? " invmgmt-notice-icon--approve" : " invmgmt-notice-icon--reject"}`}>
          <Send size={22} />
        </div>
        <h2 className="invmgmt-notice-title">
          {isApprove ? "Sent for Super Admin Approval" : "Rejection Sent to Super Admin"}
        </h2>
        <p className="invmgmt-notice-text">
          {notice.name}'s KYC {isApprove ? "approval" : "rejection"} request has been forwarded to
          the Super Admin for final review.
        </p>
        <div className="im-modal-actions im-modal-actions--center">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvestorManagement() {
  const [investors, setInvestors] = useState(initialInvestors);
  const [selected, setSelected] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [kycFilter, setKycFilter] = useState("All KYC Status");
  const [activeTab, setActiveTab] = useState("Pending");

  const [viewInvestor, setViewInvestor] = useState(null);
  const [reviewInvestor, setReviewInvestor] = useState(null);
  const [rejectInvestor, setRejectInvestor] = useState(null);
  const [notice, setNotice] = useState(null); // { type: "approve" | "reject", name }

  const tabCounts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab] = tab === "All" ? investors.length : investors.filter((inv) => inv.status === tab).length;
    return acc;
  }, {});

  const filteredInvestors = investors.filter((inv) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      inv.name.toLowerCase().includes(q) ||
      (inv.id || "").toLowerCase().includes(q) ||
      inv.mobile.includes(q) ||
      inv.email.toLowerCase().includes(q);
    const matchesKyc = kycFilter === "All KYC Status" || inv.kyc === kycFilter;
    const matchesTab = activeTab === "All" || inv.status === activeTab;
    return matchesSearch && matchesKyc && matchesTab;
  });

  const toggleAll = (e) => {
    setSelected(e.target.checked ? filteredInvestors.map((i) => i.email) : []);
  };

  const toggleOne = (email) => {
    setSelected((prev) =>
      prev.includes(email) ? prev.filter((x) => x !== email) : [...prev, email]
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
    if (!form.bankName.trim()) errs.bankName = "Bank name is required";
    if (!form.accountNumber.trim()) errs.accountNumber = "Account number is required";
    if (!form.ifsc.trim()) errs.ifsc = "IFSC code is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newInvestor = {
      email: form.email.trim(),
      id: nextInvestorId(investors),
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      branch: form.branch,
      registered: formatToday(),
      kyc: form.kyc,
      status: form.status,
      investment: formatInvestment(form.investment),
      dob: "",
      aadhaar: "",
      address: "",
      city: "",
      state: "",
      pin: "",
      bank: {
        accountHolder: form.name.trim(),
        accountNumber: form.accountNumber.trim(),
        ifsc: form.ifsc.trim(),
        bankName: form.bankName.trim(),
      },
    };

    setInvestors((prev) => [newInvestor, ...prev]);
    setShowAddModal(false);
  };

  const openView = (inv) => {
    setViewInvestor(inv);
  };

  const closeView = () => {
    setViewInvestor(null);
  };

  const handleApproveKyc = (email, branch, remarks) => {
    const name = reviewInvestor?.name;
    setInvestors((prev) => {
      const assignedId = nextInvestorId(prev);
      return prev.map((inv) =>
        inv.email === email
          ? { ...inv, id: inv.id || assignedId, branch, kyc: "Approved", status: "Active" }
          : inv
      );
    });
    setReviewInvestor(null);
    setNotice({ type: "approve", name });
  };

  const handleRejectKyc = (email) => {
    const name = reviewInvestor?.name || rejectInvestor?.name;
    setInvestors((prev) =>
      prev.map((inv) => (inv.email === email ? { ...inv, kyc: "Rejected", status: "Suspended" } : inv))
    );
    setReviewInvestor(null);
    setRejectInvestor(null);
    setNotice({ type: "reject", name });
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

      <div className="invmgmt-status-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`invmgmt-status-tab${activeTab === tab ? " invmgmt-status-tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} <span className="invmgmt-status-tab-count">{tabCounts[tab]}</span>
          </button>
        ))}
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
          value={kycFilter}
          onChange={(e) => setKycFilter(e.target.value)}
        >
          <option>All KYC Status</option>
          {KYC_OPTIONS.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
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
              <tr key={inv.email}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(inv.email)}
                    onChange={() => toggleOne(inv.email)}
                  />
                </td>
                <td>
                  {inv.id ? (
                    <span className="im-id">{inv.id}</span>
                  ) : (
                    <span className="invmgmt-id-pending">
                      {inv.status === "Pending" ? "Pending..." : "—"}
                    </span>
                  )}
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
                <td className="im-muted">{inv.branch}</td>
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
                        <button className="im-btn im-btn-approve" onClick={() => setReviewInvestor(inv)}>
                          Approve
                        </button>
                        <button className="im-btn im-btn-reject" onClick={() => setRejectInvestor(inv)}>
                          Reject
                        </button>
                      </>
                    )}
                    <button className="im-icon-btn" onClick={() => openView(inv)}>
                      <Eye size={14} />
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
                    <option key={b} value={b}>{b}</option>
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
                    {STATUS_TABS.filter((s) => s !== "All").map((s) => (
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

              <div className="im-form-row">
                <label>Bank Name</label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={handleChange("bankName")}
                  placeholder="e.g. HDFC Bank"
                />
                {errors.bankName && <span className="im-error">{errors.bankName}</span>}
              </div>

              <div className="im-form-row-split">
                <div className="im-form-row">
                  <label>Account Number</label>
                  <input
                    type="text"
                    value={form.accountNumber}
                    onChange={handleChange("accountNumber")}
                    placeholder="e.g. 500123456789"
                  />
                  {errors.accountNumber && <span className="im-error">{errors.accountNumber}</span>}
                </div>

                <div className="im-form-row">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    value={form.ifsc}
                    onChange={handleChange("ifsc")}
                    placeholder="e.g. HDFC0001234"
                  />
                  {errors.ifsc && <span className="im-error">{errors.ifsc}</span>}
                </div>
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

      {viewInvestor && (
        <div className="im-modal-overlay" onClick={closeView}>
          <div className="im-modal" onClick={(e) => e.stopPropagation()}>
            <div className="im-modal-header">
              <h2>Investor Details</h2>
              <button className="im-icon-btn" onClick={closeView}>
                <X size={16} />
              </button>
            </div>

            <div className="im-modal-form">
              <div className="im-form-row">
                <label>Investor ID</label>
                <span className="im-id">{viewInvestor.id || "Pending"}</span>
              </div>
              <div className="im-form-row">
                <label>Full Name</label>
                <span>{viewInvestor.name}</span>
              </div>
              <div className="im-form-row">
                <label>Email</label>
                <span>{viewInvestor.email}</span>
              </div>
              <div className="im-form-row">
                <label>Mobile</label>
                <span>{viewInvestor.mobile}</span>
              </div>
              <div className="im-form-row">
                <label>Branch</label>
                <span>{viewInvestor.branch}</span>
              </div>
              <div className="im-form-row-split">
                <div className="im-form-row">
                  <label>KYC Status</label>
                  <span className={`im-badge im-badge-${viewInvestor.kyc.toLowerCase()}`}>{viewInvestor.kyc}</span>
                </div>
                <div className="im-form-row">
                  <label>Account Status</label>
                  <span className={`im-badge im-badge-${viewInvestor.status.toLowerCase()}`}>{viewInvestor.status}</span>
                </div>
              </div>
              <div className="im-form-row">
                <label>Investment Amount</label>
                <span className="im-investment">{viewInvestor.investment}</span>
              </div>

              <p className="im-modal-section-title">Bank Details</p>
              <div className="im-form-row">
                <label>Account Holder</label>
                <span>{viewInvestor.bank.accountHolder}</span>
              </div>
              <div className="im-form-row">
                <label>Bank Name</label>
                <span>{viewInvestor.bank.bankName}</span>
              </div>
              <div className="im-form-row-split">
                <div className="im-form-row">
                  <label>Account Number</label>
                  <span>{viewInvestor.bank.accountNumber}</span>
                </div>
                <div className="im-form-row">
                  <label>IFSC Code</label>
                  <span>{viewInvestor.bank.ifsc}</span>
                </div>
              </div>

              <div className="im-modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeView}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {reviewInvestor && (
        <ReviewKycModal
          investor={reviewInvestor}
          onClose={() => setReviewInvestor(null)}
          onApprove={handleApproveKyc}
          onReject={handleRejectKyc}
        />
      )}

      {rejectInvestor && (
        <RejectConfirmModal
          investor={rejectInvestor}
          onClose={() => setRejectInvestor(null)}
          onConfirm={handleRejectKyc}
        />
      )}

      {notice && (
        <SuperAdminNoticeModal notice={notice} onClose={() => setNotice(null)} />
      )}
    </>
  );
}