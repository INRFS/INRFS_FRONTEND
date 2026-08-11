import React, { useState, useMemo } from "react";
import { Eye, CheckCircle2, XCircle, FileText } from "lucide-react";
import "../../Styles/SuperAdmin/Payments.css";
import Modal from "./Modal";

const INITIAL_PAYMENTS = [
  {
    id: "PMT-001",
    investor: "Arjun Sharma",
    bond: "BND-2025-001",
    type: "Monthly Interest",
    amount: 15000,
    requestedBy: "Ravi Mehta",
    approvedBy: "Ravi Mehta",
    date: "2026-08-05",
    status: "Rejected",
  },
  {
    id: "PMT-002",
    investor: "Neha Gupta",
    bond: "BND-2025-003",
    type: "Monthly Interest",
    amount: 18000,
    requestedBy: "Anita Rao",
    approvedBy: "Anita Rao",
    date: "2026-08-05",
    status: "Approved",
  },
  {
    id: "PMT-003",
    investor: "Rahul Kumar",
    bond: "BND-2025-002",
    type: "Tenure Settlement",
    amount: 1032500,
    requestedBy: "Anita Rao",
    approvedBy: "Anita Rao",
    date: "2026-08-04",
    status: "Pending",
  },
  {
    id: "PMT-004",
    investor: "Arjun Sharma",
    bond: "BND-2025-001",
    type: "Pre-Close Settlement",
    amount: 515000,
    requestedBy: "Ravi Mehta",
    approvedBy: "Ravi Mehta",
    date: "2026-08-03",
    status: "Approved",
  },
  {
    id: "PMT-005",
    investor: "Sunita Verma",
    bond: "BND-2025-008",
    type: "Monthly Interest",
    amount: 4500,
    requestedBy: "Mohan Das",
    approvedBy: "Mohan Das",
    date: "2026-08-02",
    status: "Paid",
  },
];

const TABS = ["All", "Monthly Interest", "Tenure Settlement", "Pre-Close Settlement"];

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatAmount(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function statusBadgeClass(status) {
  const v = status.toLowerCase();
  if (v === "approved") return "pq-badge pq-badge-green";
  if (v === "pending") return "pq-badge pq-badge-orange";
  if (v === "rejected") return "pq-badge pq-badge-red";
  if (v === "paid") return "pq-badge pq-badge-teal";
  return "pq-badge";
}

function typeBadgeClass(type) {
  if (type === "Monthly Interest") return "pq-type-badge pq-type-blue";
  if (type === "Tenure Settlement") return "pq-type-badge pq-type-green";
  if (type === "Pre-Close Settlement") return "pq-type-badge pq-type-orange";
  return "pq-type-badge";
}

export default function Payments() {
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [activeTab, setActiveTab] = useState("All");
  const [viewPayment, setViewPayment] = useState(null);

  const pendingSummary = useMemo(() => {
    const pending = payments.filter((p) => p.status === "Pending");
    const total = pending.reduce((sum, p) => sum + p.amount, 0);
    return { count: pending.length, total };
  }, [payments]);

  const filtered = useMemo(() => {
    if (activeTab === "All") return payments;
    return payments.filter((p) => p.type === activeTab);
  }, [payments, activeTab]);

  function handleApprove(id) {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Approved" } : p))
    );
  }

  function handleReject(id) {
    if (!window.confirm("Reject this payment request?")) return;
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Rejected" } : p))
    );
  }

  function handleMarkPaid(id) {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Paid" } : p))
    );
  }

  function handleReceipt(payment) {
    setViewPayment(payment);
  }

  return (
    <div className="pq-page">
      <div className="pq-page-head">
        <div>
          <h1>Payment Queue</h1>
          <p>Approved payment requests from all branch admins</p>
        </div>
        <div className="pq-pending-card">
          <span className="pq-pending-label">{pendingSummary.count} Pending</span>
          <span className="pq-pending-amount">{formatAmount(pendingSummary.total)}</span>
        </div>
      </div>

      <div className="pq-card">
        <div className="pq-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={"pq-tab" + (activeTab === tab ? " pq-tab-active" : "")}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="pq-table-wrap">
          <table className="pq-table">
            <thead>
              <tr>
                <th>Investor</th>
                <th>Bond</th>
                <th>Payment Type</th>
                <th>Amount</th>
                <th>Requested By</th>
                <th>Approved By Admin</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="pq-empty">
                    No payment requests found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="pq-name">{p.investor}</td>
                    <td>
                      <button type="button" className="pq-id-link" onClick={() => setViewPayment(p)}>
                        {p.bond}
                      </button>
                    </td>
                    <td>
                      <span className={typeBadgeClass(p.type)}>{p.type}</span>
                    </td>
                    <td className="pq-amount">{formatAmount(p.amount)}</td>
                    <td className="pq-muted">{p.requestedBy}</td>
                    <td className="pq-muted">{p.approvedBy}</td>
                    <td className="pq-muted">{formatDate(p.date)}</td>
                    <td>
                      <span className={statusBadgeClass(p.status)}>{p.status}</span>
                    </td>
                    <td>
                      <div className="pq-actions">
                        <button
                          type="button"
                          className="pq-view-btn"
                          onClick={() => setViewPayment(p)}
                          aria-label="View payment"
                        >
                          <Eye size={15} />
                        </button>

                        {p.status === "Pending" && (
                          <>
                            <button
                              type="button"
                              className="pq-approve-btn"
                              onClick={() => handleApprove(p.id)}
                            >
                              <CheckCircle2 size={13} />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              className="pq-reject-btn"
                              onClick={() => handleReject(p.id)}
                              aria-label="Reject payment"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        )}

                        {p.status === "Approved" && (
                          <button
                            type="button"
                            className="pq-markpaid-btn"
                            onClick={() => handleMarkPaid(p.id)}
                          >
                            <CheckCircle2 size={13} />
                            <span>Mark Paid</span>
                          </button>
                        )}

                        {p.status === "Paid" && (
                          <button
                            type="button"
                            className="pq-receipt-btn"
                            onClick={() => handleReceipt(p)}
                          >
                            <FileText size={13} />
                            <span>Receipt</span>
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
      </div>

      {viewPayment && (
        <Modal title={viewPayment.bond} onClose={() => setViewPayment(null)}>
          <div className="pq-modal-grid">
            <div>
              <span className="pq-modal-label">Investor</span>
              <span className="pq-modal-value">{viewPayment.investor}</span>
            </div>
            <div>
              <span className="pq-modal-label">Bond</span>
              <span className="pq-modal-value">{viewPayment.bond}</span>
            </div>
            <div>
              <span className="pq-modal-label">Payment Type</span>
              <span className={typeBadgeClass(viewPayment.type)}>{viewPayment.type}</span>
            </div>
            <div>
              <span className="pq-modal-label">Amount</span>
              <span className="pq-modal-value">{formatAmount(viewPayment.amount)}</span>
            </div>
            <div>
              <span className="pq-modal-label">Requested By</span>
              <span className="pq-modal-value">{viewPayment.requestedBy}</span>
            </div>
            <div>
              <span className="pq-modal-label">Approved By Admin</span>
              <span className="pq-modal-value">{viewPayment.approvedBy}</span>
            </div>
            <div>
              <span className="pq-modal-label">Date</span>
              <span className="pq-modal-value">{formatDate(viewPayment.date)}</span>
            </div>
            <div>
              <span className="pq-modal-label">Status</span>
              <span className={statusBadgeClass(viewPayment.status)}>{viewPayment.status}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}