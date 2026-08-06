import React, { useState } from "react";
import { formatINR } from "../../shared/Shared";
import { CheckCircle2, XCircle, X, AlertTriangle, Send, CheckCheck, Ban } from "lucide-react";
import "../../Styles/Admin/Settlement.css";

const initialTenureItems = [
  {
    bondNumber: "BND-2025-002",
    investor: "Rahul Kumar",
    investorId: "INV003",
    branch: "Bangalore",
    maturedOn: "18 Jul 2026",
    principal: 875000,
    interestEarned: 157500,
    status: "Pending",
  },
  {
    bondNumber: "BND-2024-055",
    investor: "Sunita Verma",
    investorId: "INV004",
    branch: "Chennai",
    maturedOn: "10 Jan 2026",
    principal: 150000,
    interestEarned: 54000,
    status: "Pending",
  },
];

const initialPrecloseItems = [
  {
    bondNumber: "BND-2025-001",
    investor: "Arjun Sharma",
    branch: "Hyderabad",
    requestedOn: "02 Aug 2026",
    monthsActive: 6,
    reason: "Medical emergency",
    principal: 500000,
    interestEarned: 90000,
    penalty: 25000,
    status: "Pending",
  },
  {
    bondNumber: "BND-2025-003",
    investor: "Neha Gupta",
    branch: "Bangalore",
    requestedOn: "03 Aug 2026",
    monthsActive: 7,
    reason: "Relocation abroad",
    principal: 600000,
    interestEarned: 126000,
    penalty: 30000,
    status: "Pending",
  },
];

const CONFIRM_COPY = {
  tenureApprove: {
    title: "Approve Settlement",
    confirmClass: "admin-btn--success",
    confirmLabel: "Confirm Approval",
    body: (item) => (
      <>
        Approve settlement of <strong>{formatINR(item.principal + item.interestEarned)}</strong> for{" "}
        <strong>{item.investor}</strong> on bond <strong>{item.bondNumber}</strong>? This cannot be undone.
      </>
    ),
  },
  preApprove: {
    title: "Approve Pre-Close Request",
    confirmClass: "admin-btn--success",
    confirmLabel: "Confirm Approval",
    body: (item) => (
      <>
        Approve the pre-close request for <strong>{item.investor}</strong> on bond{" "}
        <strong>{item.bondNumber}</strong>, releasing a net amount of{" "}
        <strong>{formatINR(item.principal + item.interestEarned - item.penalty)}</strong>? This cannot be undone.
      </>
    ),
  },
  preReject: {
    title: "Reject Pre-Close Request",
    confirmClass: "admin-btn--danger",
    confirmLabel: "Confirm Rejection",
    body: (item) => (
      <>
        Reject the pre-close request for <strong>{item.investor}</strong> on bond{" "}
        <strong>{item.bondNumber}</strong>? This cannot be undone.
      </>
    ),
  },
};

function InfoItem({ label, value }) {
  return (
    <div className="settlement-info-item">
      <span className="settlement-info-item__label">{label}</span>
      <span className="settlement-info-item__value">{value}</span>
    </div>
  );
}

function BreakdownRow({ label, value, tone }) {
  return (
    <div className={`settlement-breakdown-row ${tone ? `settlement-breakdown-row--${tone}` : ""}`}>
      <span>{label}</span>
      <span className="mono">{value}</span>
    </div>
  );
}

export default function Settlement() {
  const [activeTab, setActiveTab] = useState("tenure");
  const [tenureItems, setTenureItems] = useState(initialTenureItems);
  const [precloseItems, setPrecloseItems] = useState(initialPrecloseItems);
  const [confirmAction, setConfirmAction] = useState(null);

  // const tenurePendingCount = tenureItems.filter((i) => i.status === "Pending").length;
  // const preclosePendingCount = precloseItems.filter((i) => i.status === "Pending").length;

  const openConfirm = (kind, item) => setConfirmAction({ kind, item });
  const closeConfirm = () => setConfirmAction(null);

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { kind, item } = confirmAction;

    if (kind === "tenureApprove") {
      setTenureItems((prev) =>
        prev.map((i) => (i.bondNumber === item.bondNumber ? { ...i, status: "Approved" } : i))
      );
    } else if (kind === "preApprove") {
      setPrecloseItems((prev) =>
        prev.map((i) => (i.bondNumber === item.bondNumber ? { ...i, status: "Approved" } : i))
      );
    } else if (kind === "preReject") {
      setPrecloseItems((prev) =>
        prev.map((i) => (i.bondNumber === item.bondNumber ? { ...i, status: "Rejected" } : i))
      );
    }

    closeConfirm();
  };

  const activeCopy = confirmAction ? CONFIRM_COPY[confirmAction.kind] : null;

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Settlement Management</h2>
      <p className="admin-page-subtitle">Review and approve settlement requests before sending to Super Admin</p>

      <div className="settlement-tabs">
        <button
          className={`settlement-tab ${activeTab === "tenure" ? "settlement-tab--active" : ""}`}
          onClick={() => setActiveTab("tenure")}
        >
          Tenure Timeout <span className="settlement-tab__count">{tenureItems.length}</span>
        </button>
        <button
          className={`settlement-tab ${activeTab === "preclose" ? "settlement-tab--active" : ""}`}
          onClick={() => setActiveTab("preclose")}
        >
          Pre-Close Requests <span className="settlement-tab__count">{precloseItems.length}</span>
        </button>
      </div>

      {activeTab === "tenure" && (
        <div className="settlement-card-list">
          {tenureItems.map((item) => {
            const net = item.principal + item.interestEarned;
            return (
              <div className="settlement-card" key={item.bondNumber}>
                <div className="settlement-card-header">
                  <div className="settlement-card-header__left">
                    <span className="settlement-bond-link">{item.bondNumber}</span>
                    <span className={`settlement-badge settlement-badge--${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="settlement-card-header__actions">
                    {item.status === "Pending" && (
                      <button
                        className="admin-btn admin-btn--success admin-btn--pill"
                        onClick={() => openConfirm("tenureApprove", item)}
                      >
                        <Send size={14} /> Approve Settlement
                      </button>
                    )}
                    {item.status === "Approved" && (
                      <span className="admin-action-muted"><CheckCircle2 size={14} /> Settled</span>
                    )}
                  </div>
                </div>

                <div className="settlement-card-body">
                  <div className="settlement-info-grid">
                    <InfoItem label="Investor" value={item.investor} />
                    <InfoItem label="Investor ID" value={item.investorId} />
                    <InfoItem label="Branch" value={item.branch} />
                    <InfoItem label="Matured On" value={item.maturedOn} />
                  </div>

                  <div className="settlement-breakdown-list">
                    <BreakdownRow label="Principal" value={formatINR(item.principal)} />
                    <BreakdownRow label="Total Interest Earned" value={formatINR(item.interestEarned)} />
                    <BreakdownRow label="Net Settlement Amount" value={formatINR(net)} tone="total" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "preclose" && (
        <div className="settlement-card-list">
          {precloseItems.map((item) => {
            const net = item.principal + item.interestEarned - item.penalty;
            return (
              <div className="settlement-card" key={item.bondNumber}>
                <div className="settlement-card-header">
                  <div className="settlement-card-header__left">
                    <span className="settlement-bond-link">{item.bondNumber}</span>
                    <span className={`settlement-badge settlement-badge--${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                    <span className="settlement-badge settlement-badge--preclose">Pre-Close</span>
                  </div>
                  <div className="settlement-card-header__actions">
                    {item.status === "Pending" && (
                      <>
                        <button
                          className="admin-btn admin-btn--success admin-btn--pill"
                          onClick={() => openConfirm("preApprove", item)}
                        >
                          <CheckCheck size={14} /> Approve
                        </button>
                        <button
                          className="admin-btn admin-btn--danger admin-btn--pill"
                          onClick={() => openConfirm("preReject", item)}
                        >
                          <Ban size={14} /> Reject
                        </button>
                      </>
                    )}
                    {item.status === "Approved" && (
                      <span className="admin-action-muted"><CheckCircle2 size={14} /> Approved</span>
                    )}
                    {item.status === "Rejected" && (
                      <span className="admin-action-muted"><XCircle size={14} /> Rejected</span>
                    )}
                  </div>
                </div>

                <div className="settlement-card-body">
                  <div className="settlement-info-grid">
                    <InfoItem label="Investor" value={item.investor} />
                    <InfoItem label="Branch" value={item.branch} />
                    <InfoItem label="Requested On" value={item.requestedOn} />
                    <InfoItem label="Months Active" value={`${item.monthsActive} months`} />
                  </div>

                  <div className="settlement-reason-box">
                    <span className="settlement-reason-box__label">Reason:</span> {item.reason}
                  </div>

                  <div className="settlement-breakdown-list">
                    <BreakdownRow label="Principal" value={formatINR(item.principal)} />
                    <BreakdownRow label="Interest Earned" value={formatINR(item.interestEarned)} />
                    <BreakdownRow label="Early Penalty" value={`-${formatINR(item.penalty)}`} tone="penalty" />
                    <BreakdownRow label="Net Pre-Close Amount" value={formatINR(net)} tone="total" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmAction && (
        <div className="settlement-modal-overlay" onClick={closeConfirm}>
          <div className="settlement-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="settlement-modal-header">
              <div className="settlement-modal-header__title">
                <AlertTriangle size={18} />
                <h3>{activeCopy.title}</h3>
              </div>
              <button className="settlement-modal-close-btn" onClick={closeConfirm}>
                <X size={16} />
              </button>
            </div>
            <div className="settlement-modal-body">
              <p>{activeCopy.body(confirmAction.item)}</p>
            </div>
            <div className="settlement-modal-footer">
              <button className="admin-btn admin-btn--outline" onClick={closeConfirm}>
                Cancel
              </button>
              <button className={`admin-btn ${activeCopy.confirmClass}`} onClick={handleConfirm}>
                {activeCopy.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}