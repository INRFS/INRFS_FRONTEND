import React, { useState, useMemo } from "react";
import { formatINR } from "../../shared/Shared";
import {
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  Send,
  CheckCheck,
  Ban,
  Archive,
  Clock,
} from "lucide-react";
import "../../Styles/Admin/Settlement.css";

const GST_RATE = 0.18;

const STATUS = {
  PENDING: "Pending",
  AWAITING_SUPERADMIN: "Awaiting Super Admin",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const statusClass = (status) => status.toLowerCase().replace(/\s+/g, "-");

const initialTenureItems = [
  {
    bondNumber: "BND-2025-002",
    investor: "Rahul Kumar",
    investorId: "INV003",
    branch: "Bangalore",
    maturedOn: "18 Jul 2026",
    principal: 875000,
    interestEarned: 157500,
    status: STATUS.PENDING,
  },
  {
    bondNumber: "BND-2024-055",
    investor: "Sunita Verma",
    investorId: "INV004",
    branch: "Chennai",
    maturedOn: "10 Jan 2026",
    principal: 150000,
    interestEarned: 54000,
    status: STATUS.PENDING,
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
    status: STATUS.PENDING,
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
    status: STATUS.PENDING,
  },
];

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

function StatusPill({ status }) {
  if (status === STATUS.AWAITING_SUPERADMIN) {
    return (
      <span className="admin-action-muted admin-action-muted--waiting">
        <Clock size={14} /> Waiting for Super Admin approval
      </span>
    );
  }
  if (status === STATUS.APPROVED) {
    return (
      <span className="admin-action-muted">
        <CheckCircle2 size={14} /> Settled
      </span>
    );
  }
  if (status === STATUS.REJECTED) {
    return (
      <span className="admin-action-muted">
        <XCircle size={14} /> Rejected
      </span>
    );
  }
  return null;
}

function ConfirmBreakdown({ item, includePenalty }) {
  const gstAmount = Math.round(item.interestEarned * GST_RATE);
  const penalty = includePenalty ? item.penalty : 0;
  const net = item.principal + item.interestEarned - gstAmount - penalty;

  return (
    <div className="settlement-confirm-breakdown">
      <div className="settlement-confirm-breakdown__row">
        <span>Principal</span>
        <span className="mono">{formatINR(item.principal)}</span>
      </div>
      <div className="settlement-confirm-breakdown__row">
        <span>Interest Earned</span>
        <span className="mono">{formatINR(item.interestEarned)}</span>
      </div>
      <div className="settlement-confirm-breakdown__row settlement-confirm-breakdown__row--gst">
        <span>
          GST <em>(18% on interest)</em>
        </span>
        <span className="mono">-{formatINR(gstAmount)}</span>
      </div>
      {includePenalty && (
        <div className="settlement-confirm-breakdown__row settlement-confirm-breakdown__row--penalty">
          <span>Early Penalty</span>
          <span className="mono">-{formatINR(penalty)}</span>
        </div>
      )}
      <div className="settlement-confirm-breakdown__row settlement-confirm-breakdown__row--total">
        <span>Net Payable</span>
        <span className="mono">{formatINR(net)}</span>
      </div>
    </div>
  );
}

const CONFIRM_COPY = {
  tenureApprove: {
    title: "Send for Super Admin Approval",
    confirmClass: "admin-btn--success",
    confirmLabel: "Confirm & Send",
    body: (item) => (
      <>
        <p>
          Send the matured settlement for <strong>{item.investor}</strong> on bond{" "}
          <strong>{item.bondNumber}</strong> to the Super Admin for approval? You won't be able to edit it
          once sent.
        </p>
        <ConfirmBreakdown item={item} includePenalty={false} />
      </>
    ),
  },
  preApprove: {
    title: "Send for Super Admin Approval",
    confirmClass: "admin-btn--success",
    confirmLabel: "Confirm & Send",
    body: (item) => (
      <>
        <p>
          Send the pre-close request for <strong>{item.investor}</strong> on bond{" "}
          <strong>{item.bondNumber}</strong> to the Super Admin for approval? You won't be able to edit it
          once sent.
        </p>
        <ConfirmBreakdown item={item} includePenalty={true} />
      </>
    ),
  },
  preReject: {
    title: "Reject Pre-Close Request",
    confirmClass: "admin-btn--danger",
    confirmLabel: "Confirm Rejection",
    body: (item) => (
      <p>
        Reject the pre-close request for <strong>{item.investor}</strong> on bond{" "}
        <strong>{item.bondNumber}</strong>? This cannot be undone.
      </p>
    ),
  },
};

export default function Settlement() {
  const [activeTab, setActiveTab] = useState("tenure");
  const [tenureItems, setTenureItems] = useState(initialTenureItems);
  const [precloseItems, setPrecloseItems] = useState(initialPrecloseItems);
  const [confirmAction, setConfirmAction] = useState(null);

  const closedItems = useMemo(() => {
    const isClosed = (status) => status === STATUS.APPROVED || status === STATUS.REJECTED;

    const tenureClosed = tenureItems
      .filter((i) => isClosed(i.status))
      .map((i) => ({
        type: "Tenure",
        bondNumber: i.bondNumber,
        investor: i.investor,
        branch: i.branch,
        date: i.maturedOn,
        principal: i.principal,
        interestEarned: i.interestEarned,
        penalty: 0,
        status: i.status,
      }));

    const precloseClosed = precloseItems
      .filter((i) => isClosed(i.status))
      .map((i) => ({
        type: "Pre-Close",
        bondNumber: i.bondNumber,
        investor: i.investor,
        branch: i.branch,
        date: i.requestedOn,
        principal: i.principal,
        interestEarned: i.interestEarned,
        penalty: i.penalty,
        status: i.status,
      }));

    return [...tenureClosed, ...precloseClosed].sort((a, b) => (a.status === STATUS.APPROVED ? -1 : 1));
  }, [tenureItems, precloseItems]);

  const openConfirm = (kind, item) => setConfirmAction({ kind, item });
  const closeConfirm = () => setConfirmAction(null);

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { kind, item } = confirmAction;

    if (kind === "tenureApprove") {
      setTenureItems((prev) =>
        prev.map((i) =>
          i.bondNumber === item.bondNumber ? { ...i, status: STATUS.AWAITING_SUPERADMIN } : i
        )
      );
    } else if (kind === "preApprove") {
      setPrecloseItems((prev) =>
        prev.map((i) =>
          i.bondNumber === item.bondNumber ? { ...i, status: STATUS.AWAITING_SUPERADMIN } : i
        )
      );
    } else if (kind === "preReject") {
      setPrecloseItems((prev) =>
        prev.map((i) => (i.bondNumber === item.bondNumber ? { ...i, status: STATUS.REJECTED } : i))
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
        <button
          className={`settlement-tab ${activeTab === "closed" ? "settlement-tab--active" : ""}`}
          onClick={() => setActiveTab("closed")}
        >
          Closed Settlements <span className="settlement-tab__count">{closedItems.length}</span>
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
                    <span className={`settlement-badge settlement-badge--${statusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="settlement-card-header__actions">
                    {item.status === STATUS.PENDING && (
                      <button
                        className="admin-btn admin-btn--success admin-btn--pill"
                        onClick={() => openConfirm("tenureApprove", item)}
                      >
                        <Send size={14} /> Approve Settlement
                      </button>
                    )}
                    <StatusPill status={item.status} />
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
                    <span className={`settlement-badge settlement-badge--${statusClass(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="settlement-badge settlement-badge--preclose">Pre-Close</span>
                  </div>
                  <div className="settlement-card-header__actions">
                    {item.status === STATUS.PENDING && (
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
                    <StatusPill status={item.status} />
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

      {activeTab === "closed" && (
        <div className="settlement-card-list">
          {closedItems.length === 0 && (
            <div className="settlement-empty-state">
              <Archive size={20} />
              <p>No closed settlements yet.</p>
            </div>
          )}

          {closedItems.map((item) => {
            const gstAmount = Math.round(item.interestEarned * GST_RATE);
            const netAfterGst =
              item.principal + item.interestEarned - gstAmount - (item.penalty || 0);

            return (
              <div className="settlement-card" key={`${item.type}-${item.bondNumber}`}>
                <div className="settlement-card-header">
                  <div className="settlement-card-header__left">
                    <span className="settlement-bond-link">{item.bondNumber}</span>
                    <span className={`settlement-badge settlement-badge--${statusClass(item.status)}`}>
                      {item.status}
                    </span>
                    <span
                      className={`settlement-badge ${
                        item.type === "Pre-Close" ? "settlement-badge--preclose" : ""
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <div className="settlement-card-header__actions">
                    <StatusPill status={item.status} />
                  </div>
                </div>

                <div className="settlement-card-body">
                  <div className="settlement-info-grid">
                    <InfoItem label="Investor" value={item.investor} />
                    <InfoItem label="Branch" value={item.branch} />
                    <InfoItem label="Date" value={item.date} />
                    <InfoItem label="Type" value={item.type} />
                  </div>

                  <div className="settlement-breakdown-list">
                    <BreakdownRow label="Principal" value={formatINR(item.principal)} />
                    <BreakdownRow label="Interest Earned" value={formatINR(item.interestEarned)} />
                    <BreakdownRow label="GST (18% on interest)" value={`-${formatINR(gstAmount)}`} tone="penalty" />
                    {item.penalty > 0 && (
                      <BreakdownRow label="Early Penalty" value={`-${formatINR(item.penalty)}`} tone="penalty" />
                    )}
                    <BreakdownRow label="Net Payable" value={formatINR(netAfterGst)} tone="total" />
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
            <div className="settlement-modal-body">{activeCopy.body(confirmAction.item)}</div>
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