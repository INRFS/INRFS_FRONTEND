import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { StatusBadge, formatINR } from "../../shared/Shared";

const initialRows = [
  { investor: "Arjun Sharma", bond: "BND-2025-001", amount: 5000, due: "15 Jul 2025", ref: "-", status: "Pending" },
  { investor: "Rahul Kumar", bond: "BND-2025-003", amount: 9479, due: "18 Jul 2025", ref: "UTR789456", status: "Paid" },
  { investor: "Neha Gupta", bond: "BND-2025-005", amount: 5750, due: "22 Jul 2025", ref: "-", status: "Pending" },
  { investor: "Vikram Singh", bond: "BND-2025-007", amount: 3385, due: "28 Jul 2025", ref: "-", status: "Overdue" },
];


export default function MonthlyInterest() {
  const [rows, setRows] = useState(initialRows);

  const markPaid = (bond) => {
    setRows((prev) =>
      prev.map((r) => (r.bond === bond ? { ...r, status: "Paid", ref: r.ref === "-" ? "AUTO-" + Date.now() : r.ref } : r))
    );
  };

  const markAllPaid = () => {
    setRows((prev) => prev.map((r) => ({ ...r, status: "Paid" })));
  };

  return (
    <div className="admin-page">
      <div className="admin-page-actions admin-page-actions--between">
        <p className="admin-page-subtitle">Track and process monthly interest payouts — July 2025</p>
        <button className="admin-btn admin-btn--primary" onClick={markAllPaid}>
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
                  {r.status === "Paid" ? (
                    <span className="admin-action-muted"><CheckCircle2 size={14} /> Done</span>
                  ) : (
                    <button className="admin-btn admin-btn--success admin-btn--pill" onClick={() => markPaid(r.bond)}>
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
    </div>
  );
}