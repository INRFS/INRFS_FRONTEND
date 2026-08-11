import React, { useMemo, useState } from "react";
import { Send, CheckCircle2, Ban, X, AlertTriangle, Filter, Clock } from "lucide-react";
import { StatusBadge, formatINR } from "../../shared/Shared";
import "../../Styles/Admin/MontlyIntrest.css";

// Static "today" for this demo — swap for a real date source when wiring up data.
const TODAY_LABEL = "05 Aug 2026";
const GST_RATE = 0.18;

const initialRows = [
  { investor: "Arjun Sharma", bond: "BND-2025-001", amount: 15000, due: "05 Aug 2026", ref: "-", status: "Pending" },
  { investor: "Neha Gupta", bond: "BND-2025-003", amount: 18000, due: "05 Aug 2026", ref: "-", status: "Pending" },
  { investor: "Rahul Kumar", bond: "BND-2025-002", amount: 26250, due: "06 Aug 2026", ref: "-", status: "Pending" },
  { investor: "Vikram Singh", bond: "BND-2025-007", amount: 9750, due: "06 Aug 2026", ref: "-", status: "Awaiting Approval" },
  { investor: "Priya Patel", bond: "BND-2025-004", amount: 7500, due: "10 Aug 2026", ref: "-", status: "Approved" },
  { investor: "Sunita Verma", bond: "BND-2025-008", amount: 4500, due: "12 Aug 2026", ref: "UTR112233", status: "Paid" },
];

function gstFor(amount) {
  return Math.round(amount * GST_RATE);
}

function netPayableFor(amount) {
  return amount - gstFor(amount);
}

const CONFIRM_COPY = {
  approve: {
    title: "Interest Payout Details",
    confirmTitle: "Send for Super Admin Approval",
    body: (r) =>
      `Send the interest payout of ${formatINR(netPayableFor(r.amount))} (net of 18% GST) for ${r.investor} (${r.bond}) to the Super Admin for final approval?`,
    confirmLabel: "Send for Approval",
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
    confirmTitle: "Send All for Super Admin Approval",
    body: (rows) =>
      `Send all ${rows.length} pending interest payouts (${formatINR(rows.reduce((s, r) => s + r.amount, 0))} gross, ${formatINR(rows.reduce((s, r) => s + netPayableFor(r.amount), 0))} net of GST) to the Super Admin for final approval?`,
    confirmLabel: "Send All for Approval",
    confirmClass: "admin-btn--success",
    showDetails: false,
  },
};

const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

// Parses "05 Aug 2026" style strings into a local Date at midnight.
function parseDueDate(str) {
  const [day, mon, year] = str.split(" ");
  const monthIndex = MONTHS[mon];
  if (monthIndex === undefined) return null;
  return new Date(Number(year), monthIndex, Number(day));
}

// Converts a Date into the yyyy-mm-dd format used by <input type="date">.
function toISODate(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

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
  const [filterDate, setFilterDate] = useState(""); // yyyy-mm-dd, "" = no filter

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
      netTotal: map[due].reduce((s, r) => s + netPayableFor(r.amount), 0),
    }));
  }, [rows]);

  // Groups that match the selected filter date (or all groups when no filter is set).
  const visibleGroups = useMemo(() => {
    if (!filterDate) return groups;
    return groups.filter((g) => toISODate(parseDueDate(g.due)) === filterDate);
  }, [groups, filterDate]);

  // "Approve All Pending" only acts on what's currently visible under the filter.
  const pendingRows = visibleGroups.flatMap((g) => g.rows).filter((r) => r.status === "Pending");

  const clearFilter = () => setFilterDate("");

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
      // Branch admin approval doesn't finalize the payout — it moves to the
      // Super Admin's Payment Queue for final sign-off. Status only flips to
      // "Approved" once the Super Admin actually approves it on their end.
      setRows((prev) => prev.map((r) => (r.bond === row.bond ? { ...r, status: "Awaiting Approval" } : r)));
    } else if (type === "reject") {
      setRows((prev) => prev.map((r) => (r.bond === row.bond ? { ...r, status: "Rejected" } : r)));
    } else if (type === "approveAllPending") {
      const bondsToApprove = new Set(row.map((r) => r.bond));
      setRows((prev) =>
        prev.map((r) => (bondsToApprove.has(r.bond) && r.status === "Pending" ? { ...r, status: "Awaiting Approval" } : r))
      );
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
          <label className="admin-date-filter">
            <Filter size={14} />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              aria-label="Filter by due date"
            />
          </label>
          {filterDate && (
            <button className="admin-btn admin-btn--outline" onClick={clearFilter}>
              <X size={14} /> Clear Filter
            </button>
          )}

          <button
            className="admin-btn admin-btn--primary"
            disabled={pendingRows.length === 0}
            onClick={() => openConfirm("approveAllPending", pendingRows)}
          >
            <Send size={14} /> Approve All Pending
          </button>
        </div>
      </div>

      {visibleGroups.length === 0 && (
        <div className="admin-table-card">
          <p className="admin-no-results">No interest payments due on the selected date.</p>
        </div>
      )}

      {visibleGroups.map((group) => (
        <div className="due-group" key={group.due}>
          <div className="due-group-header">
            <span className="due-group-header__date">
              {group.isToday ? `Today — ${group.due}` : group.due}
            </span>
            {group.isToday && <span className="due-badge due-badge--today">Due Today</span>}
            <span className="due-group-header__meta">
              {group.rows.length} payment{group.rows.length > 1 ? "s" : ""} · {formatINR(group.total)} gross ·{" "}
              {formatINR(group.netTotal)} net of GST
            </span>
          </div>

          <div className="admin-table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Investor</th>
                  <th>Bond Number</th>
                  <th>Interest Amount</th>
                  <th>GST (18%)</th>
                  <th>Net Payable</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((r) => {
                  const gst = gstFor(r.amount);
                  const net = netPayableFor(r.amount);
                  return (
                    <tr key={r.bond}>
                      <td>{r.investor}</td>
                      <td className="mono link">{r.bond}</td>
                      <td className="mono amount-positive">{formatINR(r.amount)}</td>
                      <td className="mono">-{formatINR(gst)}</td>
                      <td className="mono amount-positive">{formatINR(net)}</td>
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
                        {r.status === "Awaiting Approval" && (
                          <span className="admin-action-muted">
                            <Clock size={14} /> Waiting for Super Admin Approval
                          </span>
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
                  );
                })}
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
                    <DetailRow label="Interest Amount" value={formatINR(confirmAction.row.amount)} valueClass="mono amount-positive" />
                    <DetailRow label="GST (18%)" value={`-${formatINR(gstFor(confirmAction.row.amount))}`} valueClass="mono" />
                    <DetailRow label="Net Payable" value={formatINR(netPayableFor(confirmAction.row.amount))} valueClass="mono amount-positive" />
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