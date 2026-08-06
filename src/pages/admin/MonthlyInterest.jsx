import React, { useMemo, useState } from "react";
import { Send, CheckCircle2, Ban, X, AlertTriangle, Calendar } from "lucide-react";
import { StatusBadge, formatINR } from "../../shared/Shared";
import "../../Styles/Admin/MontlyIntrest.css";

// Static "today" for this demo — swap for a real date source when wiring up data.
const TODAY_LABEL = "05 Aug 2026";

const initialRows = [
  { investor: "Arjun Sharma", bond: "BND-2025-001", amount: 15000, due: "05 Aug 2026", ref: "-", status: "Pending" },
  { investor: "Neha Gupta", bond: "BND-2025-003", amount: 18000, due: "05 Aug 2026", ref: "-", status: "Pending" },
  { investor: "Rahul Kumar", bond: "BND-2025-002", amount: 26250, due: "06 Aug 2026", ref: "-", status: "Pending" },
  { investor: "Vikram Singh", bond: "BND-2025-007", amount: 9750, due: "06 Aug 2026", ref: "-", status: "Pending" },
  { investor: "Priya Patel", bond: "BND-2025-004", amount: 7500, due: "10 Aug 2026", ref: "-", status: "Pending" },
  { investor: "Sunita Verma", bond: "BND-2025-008", amount: 4500, due: "12 Aug 2026", ref: "UTR112233", status: "Paid" },
];

const CONFIRM_COPY = {
  approve: {
    title: "Interest Payout Details",
    confirmTitle: "Approve Interest Request",
    body: (r) => `Approve the interest payout of ${formatINR(r.amount)} for ${r.investor} (${r.bond})?`,
    confirmLabel: "Approve",
    confirmClass: "admin-btn--success",
    showDetails: true,
  },
  reject: {
    title: "Interest Payout Details",
    confirmTitle: "Reject Interest Request",
    body: (r) => `Reject the interest payout of ${formatINR(r.amount)} for ${r.investor} (${r.bond})? This cannot be undone.`,
    confirmLabel: "Reject",
    confirmClass: "admin-btn--danger",
    showDetails: true,
  },
  approveAllPending: {
    title: "Approve All Pending",
    confirmTitle: "Approve All Pending",
    body: (rows) => `Approve all ${rows.length} pending interest payouts totalling ${formatINR(rows.reduce((s, r) => s + r.amount, 0))}?`,
    confirmLabel: "Approve All",
    confirmClass: "admin-btn--success",
    showDetails: false,
  },
};

function DetailRow({ label, value, valueClass }) {
  return (
    <div className="admin-detail-row">
      <span className="admin-detail-row__label">{label}</span>
      <span className={`admin-detail-row__value ${valueClass || ""}`}>{value}</span>
    </div>
  );
}

export default function MonthlyInterest() {
  const [rows, setRows] = useState(initialRows);
  const [confirmAction, setConfirmAction] = useState(null);
  const [step, setStep] = useState("details");

  const groups = useMemo(() => {
    const order = [];
    const map = {};
    rows.forEach((r) => {
      if (!map[r.due]) {
        map[r.due] = [];
        order.push(r.due);
      }
      map[r.due].push(r);
    });
    order.sort((a, b) => new Date(a) - new Date(b));
    return order.map((due) => ({
      due,
      isToday: due === TODAY_LABEL,
      rows: map[due],
      total: map[due].reduce((s, r) => s + r.amount, 0),
    }));
  }, [rows]);

  const pendingRows = rows.filter((r) => r.status === "Pending");

  const openConfirm = (type, rowOrRows) => {
    const copy = CONFIRM_COPY[type];
    setConfirmAction({ type, row: rowOrRows });
    setStep(copy.showDetails ? "details" : "confirm");
  };

  const closeConfirm = () => {
    setConfirmAction(null);
    setStep("details");
  };

  const goToConfirmStep = () => setStep("confirm");
  const goBackToDetails = () => setStep("details");

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { type, row } = confirmAction;

    if (type === "approve") {
      setRows((prev) => prev.map((r) => (r.bond === row.bond ? { ...r, status: "Approved" } : r)));
    } else if (type === "reject") {
      setRows((prev) => prev.map((r) => (r.bond === row.bond ? { ...r, status: "Rejected" } : r)));
    } else if (type === "approveAllPending") {
      setRows((prev) => prev.map((r) => (r.status === "Pending" ? { ...r, status: "Approved" } : r)));
    }

    closeConfirm();
  };

  const activeCopy = confirmAction ? CONFIRM_COPY[confirmAction.type] : null;

  return (
    <div className="admin-page">
      <div className="admin-page-actions admin-page-actions--between">
        <div>
          <h2 className="admin-page-title">Monthly Interest</h2>
          <p className="admin-page-subtitle">Investments with interest payments due — grouped by due date</p>
        </div>
        <div className="admin-header-actions">
          <span className="admin-date-pill">
            <Calendar size={14} /> Today: {TODAY_LABEL}
          </span>
          <button
            className="admin-btn admin-btn--primary"
            disabled={pendingRows.length === 0}
            onClick={() => openConfirm("approveAllPending", pendingRows)}
          >
            <Send size={14} /> Approve All Pending
          </button>
        </div>
      </div>

      {groups.map((group) => (
        <div className="due-group" key={group.due}>
          <div className="due-group-header">
            <span className="due-group-header__date">
              {group.isToday ? `Today — ${group.due}` : group.due}
            </span>
            {group.isToday && <span className="due-badge due-badge--today">Due Today</span>}
            <span className="due-group-header__meta">
              {group.rows.length} payment{group.rows.length > 1 ? "s" : ""} · {formatINR(group.total)} total
            </span>
          </div>

          <div className="admin-table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Investor</th>
                  <th>Bond Number</th>
                  <th>Monthly Interest</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((r) => (
                  <tr key={r.bond}>
                    <td>{r.investor}</td>
                    <td className="mono link">{r.bond}</td>
                    <td className="mono amount-positive">{formatINR(r.amount)}</td>
                    <td className={group.isToday ? "due-date--today" : "due-date--muted"}>{r.due}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      {r.status === "Pending" && (
                        <div className="admin-action-group">
                          <button className="admin-btn admin-btn--success admin-btn--pill" onClick={() => openConfirm("approve", r)}>
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button
                            className="admin-icon-btn admin-icon-btn--danger"
                            aria-label="Reject"
                            onClick={() => openConfirm("reject", r)}
                          >
                            <Ban size={14} />
                          </button>
                        </div>
                      )}
                      {r.status === "Approved" && (
                        <span className="admin-action-muted"><CheckCircle2 size={14} /> Approved</span>
                      )}
                      {r.status === "Rejected" && (
                        <span className="admin-action-muted"><Ban size={14} /> Rejected</span>
                      )}
                      {r.status === "Paid" && (
                        <span className="admin-action-muted"><CheckCircle2 size={14} /> Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {confirmAction && (
        <div className="admin-modal-overlay" onClick={closeConfirm}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>

            {/* STEP 1: Details review (single-row actions only) */}
            {step === "details" && activeCopy.showDetails && (
              <>
                <div className="admin-modal-header">
                  <div className="admin-modal-header__title">
                    <AlertTriangle size={18} />
                    <h3>{activeCopy.title}</h3>
                  </div>
                  <button className="admin-modal-close-btn" onClick={closeConfirm}>
                    <X size={16} />
                  </button>
                </div>
                <div className="admin-modal-body">
                  <div className="admin-detail-list">
                    <DetailRow label="Investor" value={confirmAction.row.investor} />
                    <DetailRow label="Bond Number" value={confirmAction.row.bond} valueClass="mono" />
                    <DetailRow label="Amount" value={formatINR(confirmAction.row.amount)} valueClass="mono amount-positive" />
                    <DetailRow label="Due Date" value={confirmAction.row.due} />
                    <DetailRow label="Reference" value={confirmAction.row.ref} valueClass="mono" />
                    <DetailRow label="Status" value={<StatusBadge status={confirmAction.row.status} />} />
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button className="admin-btn admin-btn--outline" onClick={closeConfirm}>
                    Cancel
                  </button>
                  <button className={`admin-btn ${activeCopy.confirmClass}`} onClick={goToConfirmStep}>
                    Continue to {activeCopy.confirmLabel}
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: Final confirm */}
            {step === "confirm" && (
              <>
                <div className="admin-modal-header">
                  <div className="admin-modal-header__title">
                    <AlertTriangle size={18} />
                    <h3>{activeCopy.confirmTitle}</h3>
                  </div>
                  <button className="admin-modal-close-btn" onClick={closeConfirm}>
                    <X size={16} />
                  </button>
                </div>
                <div className="admin-modal-body">
                  <p>{activeCopy.body(confirmAction.row)}</p>
                </div>
                <div className="admin-modal-footer">
                  <button
                    className="admin-btn admin-btn--outline"
                    onClick={activeCopy.showDetails ? goBackToDetails : closeConfirm}
                  >
                    {activeCopy.showDetails ? "Back" : "Cancel"}
                  </button>
                  <button className={`admin-btn ${activeCopy.confirmClass}`} onClick={handleConfirm}>
                    {activeCopy.confirmLabel}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}