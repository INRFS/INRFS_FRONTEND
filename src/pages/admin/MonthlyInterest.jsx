import React, { useState } from "react";
import { Send, CheckCircle2, XCircle, X, AlertTriangle } from "lucide-react";
import { StatusBadge, formatINR } from "../../shared/Shared";
import "../../Styles/Admin/MontlyIntrest.css";

const initialRows = [
  { investor: "Arjun Sharma", bond: "BND-2025-001", amount: 5000, due: "15 Jul 2025", ref: "-", status: "Pending" },
  { investor: "Rahul Kumar", bond: "BND-2025-003", amount: 9479, due: "18 Jul 2025", ref: "UTR789456", status: "Paid" },
  { investor: "Neha Gupta", bond: "BND-2025-005", amount: 5750, due: "22 Jul 2025", ref: "-", status: "Pending" },
  { investor: "Vikram Singh", bond: "BND-2025-007", amount: 3385, due: "28 Jul 2025", ref: "-", status: "Overdue" },
];

const CONFIRM_COPY = {
  approve: {
    title: "Approve Interest Request",
    body: (r) => `Approve the interest payout of ${formatINR(r.amount)} for ${r.investor} (${r.bond})?`,
    confirmLabel: "Approve",
    confirmClass: "admin-btn--success",
  },
  reject: {
    title: "Reject Interest Request",
    body: (r) => `Reject the interest payout of ${formatINR(r.amount)} for ${r.investor} (${r.bond})? This cannot be undone.`,
    confirmLabel: "Reject",
    confirmClass: "admin-btn--danger",
  },
  markPaid: {
    title: "Mark as Paid",
    body: (r) => `Mark ${formatINR(r.amount)} for ${r.investor} (${r.bond}) as paid?`,
    confirmLabel: "Mark Paid",
    confirmClass: "admin-btn--success",
  },
  markAllPaid: {
    title: "Mark All Paid",
    body: () => "Mark all approved and overdue rows as paid? This applies to every eligible row on this page.",
    confirmLabel: "Mark All Paid",
    confirmClass: "admin-btn--success",
  },
};

export default function MonthlyInterest() {
  const [rows, setRows] = useState(initialRows);
  const [confirmAction, setConfirmAction] = useState(null);

  const openConfirm = (type, row) => {
    setConfirmAction({ type, row });
  };

  const closeConfirm = () => {
    setConfirmAction(null);
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { type, row } = confirmAction;

    if (type === "approve") {
      setRows((prev) => prev.map((r) => (r.bond === row.bond ? { ...r, status: "Approved" } : r)));
    } else if (type === "reject") {
      setRows((prev) => prev.map((r) => (r.bond === row.bond ? { ...r, status: "Rejected" } : r)));
    } else if (type === "markPaid") {
      setRows((prev) =>
        prev.map((r) =>
          r.bond === row.bond ? { ...r, status: "Paid", ref: r.ref === "-" ? "AUTO-" + Date.now() : r.ref } : r
        )
      );
    } else if (type === "markAllPaid") {
      setRows((prev) =>
        prev.map((r) => (r.status === "Approved" || r.status === "Overdue" ? { ...r, status: "Paid" } : r))
      );
    }

    setConfirmAction(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-actions admin-page-actions--between">
        <p className="admin-page-subtitle">Track and process monthly interest payouts — July 2025</p>
        <button className="admin-btn admin-btn--primary" onClick={() => openConfirm("markAllPaid", null)}>
          <Send size={14} /> Mark All Paid
        </button>
      </div>

      <div className="admin-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Investor</th>
              <th>Bond</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Reference</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.bond}>
                <td>{r.investor}</td>
                <td className="mono link">{r.bond}</td>
                <td className="mono amount-positive">{formatINR(r.amount)}</td>
                <td>{r.due}</td>
                <td>{r.ref}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>
                  {r.status === "Paid" && (
                    <span className="admin-action-muted"><CheckCircle2 size={14} /> Done</span>
                  )}
                  {r.status === "Rejected" && (
                    <span className="admin-action-muted"><XCircle size={14} /> Rejected</span>
                  )}
                  {r.status === "Pending" && (
                    <div className="admin-action-group">
                      <button className="admin-btn admin-btn--success admin-btn--pill" onClick={() => openConfirm("approve", r)}>
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button className="admin-btn admin-btn--danger admin-btn--pill" onClick={() => openConfirm("reject", r)}>
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}
                  {(r.status === "Approved" || r.status === "Overdue") && (
                    <button className="admin-btn admin-btn--success admin-btn--pill" onClick={() => openConfirm("markPaid", r)}>
                      <CheckCircle2 size={14} /> Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="admin-table-footer">Showing 1–{rows.length} of {rows.length} records</p>
      </div>

      {confirmAction && (
        <div className="admin-modal-overlay" onClick={closeConfirm}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="admin-modal-header__title">
                <AlertTriangle size={18} />
                <h3>{CONFIRM_COPY[confirmAction.type].title}</h3>
              </div>
              <button className="admin-modal-close-btn" onClick={closeConfirm}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p>{CONFIRM_COPY[confirmAction.type].body(confirmAction.row)}</p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn--outline" onClick={closeConfirm}>
                Cancel
              </button>
              <button
                className={`admin-btn ${CONFIRM_COPY[confirmAction.type].confirmClass}`}
                onClick={handleConfirm}
              >
                {CONFIRM_COPY[confirmAction.type].confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}