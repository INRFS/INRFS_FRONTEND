import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Plus, Search, Eye, Pencil, Trash2, X } from "lucide-react";
import "../../Styles/Admin/InvestorManagement.css";

const initialInvestors = [
  {
    id: "INV001",
    name: "Arjun Sharma",
    email: "arjun@email.com",
    mobile: "9876543210",
    registered: "12 Jan 2025",
    kyc: "Approved",
    status: "Active",
    investment: "₹5,00,000",
    bank: { accountHolder: "Arjun Sharma", accountNumber: "500123456789", ifsc: "HDFC0001234", bankName: "HDFC Bank" },
  },
  {
    id: "INV002",
    name: "Priya Patel",
    email: "priya@email.com",
    mobile: "9876543211",
    registered: "14 Jan 2025",
    kyc: "Pending",
    status: "Pending",
    investment: "₹2,50,000",
    bank: { accountHolder: "Priya Patel", accountNumber: "500223456790", ifsc: "ICIC0002345", bankName: "ICICI Bank" },
  },
  {
    id: "INV003",
    name: "Rahul Kumar",
    email: "rahul@email.com",
    mobile: "9876543212",
    registered: "16 Jan 2025",
    kyc: "Approved",
    status: "Active",
    investment: "₹8,75,000",
    bank: { accountHolder: "Rahul Kumar", accountNumber: "500323456791", ifsc: "SBIN0003456", bankName: "State Bank of India" },
  },
  {
    id: "INV004",
    name: "Sunita Verma",
    email: "sunita@email.com",
    mobile: "9876543213",
    registered: "18 Jan 2025",
    kyc: "Rejected",
    status: "Suspended",
    investment: "₹1,50,000",
    bank: { accountHolder: "Sunita Verma", accountNumber: "500423456792", ifsc: "AXIS0004567", bankName: "Axis Bank" },
  },
  {
    id: "INV005",
    name: "Vikram Singh",
    email: "vikram@email.com",
    mobile: "9876543214",
    registered: "20 Jan 2025",
    kyc: "Pending",
    status: "Pending",
    investment: "₹3,25,000",
    bank: { accountHolder: "Vikram Singh", accountNumber: "500523456793", ifsc: "PUNB0005678", bankName: "Punjab National Bank" },
  },
  {
    id: "INV006",
    name: "Neha Gupta",
    email: "neha@email.com",
    mobile: "9876543215",
    registered: "22 Jan 2025",
    kyc: "Approved",
    status: "Active",
    investment: "₹6,00,000",
    bank: { accountHolder: "Neha Gupta", accountNumber: "500623456794", ifsc: "HDFC0006789", bankName: "HDFC Bank" },
  },
];

const KYC_OPTIONS = ["Approved", "Pending", "Rejected"];
const STATUS_OPTIONS = ["Active", "Pending", "Suspended"];

const emptyForm = {
  name: "",
  email: "",
  mobile: "",
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
  const navigate = useNavigate();
  const [investors, setInvestors] = useState(initialInvestors);
  const [selected, setSelected] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [kycFilter, setKycFilter] = useState("All KYC Status");
  const [statusFilter, setStatusFilter] = useState("Pending");

  const [viewInvestor, setViewInvestor] = useState(null);

  const filteredInvestors = investors.filter((inv) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      inv.name.toLowerCase().includes(q) ||
      inv.id.toLowerCase().includes(q) ||
      inv.mobile.includes(q) ||
      inv.email.toLowerCase().includes(q);
    const matchesKyc = kycFilter === "All KYC Status" || inv.kyc === kycFilter;
    const matchesStatus = statusFilter === "All Status" || inv.status === statusFilter;
    return matchesSearch && matchesKyc && matchesStatus;
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
      id: nextInvestorId(investors),
      name: form.name.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      registered: formatToday(),
      kyc: form.kyc,
      status: form.status,
      investment: formatInvestment(form.investment),
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

  // Approve/Reject no longer happen in a popup here — they navigate
  // to the KYC Approvals page, where the actual decision is made.
  const goToKycApprovals = (inv) => {
    navigate(`/admin/kyc-approvals?investorId=${inv.id}`);
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
          value={kycFilter}
          onChange={(e) => setKycFilter(e.target.value)}
        >
          <option>All KYC Status</option>
          {KYC_OPTIONS.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <select
          className="im-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
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
                <td colSpan={9} className="im-no-results">
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
                        <button className="im-btn im-btn-approve" onClick={() => goToKycApprovals(inv)}>
                          Approve
                        </button>
                        <button className="im-btn im-btn-reject" onClick={() => goToKycApprovals(inv)}>
                          Reject
                        </button>
                      </>
                    )}
                    <button className="im-icon-btn" onClick={() => openView(inv)}>
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
                <span className="im-id">{viewInvestor.id}</span>
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
    </>
  );
}