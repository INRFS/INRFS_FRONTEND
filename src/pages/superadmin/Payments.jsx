import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  CalendarDays,
  UserRound,
  Landmark,
  Wallet,
  ShieldCheck,
  
} from "lucide-react";

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
    status: "Pending",
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
    status: "Pending",
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

const TABS = [
  "All",
  "Monthly Interest",
  "Tenure Settlement",
  "Pre-Close Settlement",
];

function formatDate(iso) {
  const d = new Date(iso);

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

function statusBadgeClass(status) {
  const value = status.toLowerCase();

  if (value === "approved") {
    return "pq-badge pq-badge-green";
  }

  if (value === "pending") {
    return "pq-badge pq-badge-orange";
  }

  if (value === "rejected") {
    return "pq-badge pq-badge-red";
  }

  if (value === "paid") {
    return "pq-badge pq-badge-teal";
  }

  return "pq-badge";
}

function typeBadgeClass(type) {
  if (type === "Monthly Interest") {
    return "pq-type-badge pq-type-blue";
  }

  if (type === "Tenure Settlement") {
    return "pq-type-badge pq-type-green";
  }

  if (type === "Pre-Close Settlement") {
    return "pq-type-badge pq-type-orange";
  }

  return "pq-type-badge";
}

export default function Payments() {
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [activeTab, setActiveTab] = useState("All");

  const [approvalPayment, setApprovalPayment] = useState(null);

  const [confirmation, setConfirmation] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  const pendingSummary = useMemo(() => {
    const pending = payments.filter(
      (p) => p.status === "Pending"
    );

    const total = pending.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    return {
      count: pending.length,
      total,
    };
  }, [payments]);

  const filtered = useMemo(() => {
    if (activeTab === "All") {
      return payments;
    }

    return payments.filter(
      (p) => p.type === activeTab
    );
  }, [payments, activeTab]);

  function openApproval(payment) {
    if (payment.status !== "Pending") {
      return;
    }

    setApprovalPayment(payment);
  }

  function closeApproval() {
    if (actionLoading) {
      return;
    }

    setApprovalPayment(null);
  }

  function openConfirmation(type, payment) {
    setConfirmation({
      type,
      payment,
    });
  }

  function closeConfirmation() {
    if (actionLoading) {
      return;
    }

    setConfirmation(null);
  }

  function handleApprove(id) {
    setActionLoading(true);

    setTimeout(() => {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status: "Approved",
              }
            : p
        )
      );

      setApprovalPayment(null);
      setConfirmation(null);
      setActionLoading(false);
    }, 250);
  }

  function handleReject(id) {
    setActionLoading(true);

    setTimeout(() => {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status: "Rejected",
              }
            : p
        )
      );

      setApprovalPayment(null);
      setConfirmation(null);
      setActionLoading(false);
    }, 250);
  }

  function handleMarkPaid(id) {
    setActionLoading(true);

    setTimeout(() => {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status: "Paid",
              }
            : p
        )
      );

      setConfirmation(null);
      setActionLoading(false);
    }, 250);
  }

  function getConfirmationContent() {
    if (!confirmation) {
      return null;
    }

    const { type, payment } = confirmation;

    if (type === "approve") {
      return {
        title: "Approve Payment?",
        icon: <CheckCircle2 size={26} />,
        iconClass: "pq-confirm-icon pq-confirm-icon-approve",
        message: `Are you sure you want to approve this payment of ${formatAmount(
          payment.amount
        )} for ${payment.investor}?`,
        subMessage:
          "After approval, this payment can be marked as paid.",
        confirmText: "Approve Payment",
        confirmClass: "pq-confirm-approve",
        action: () => handleApprove(payment.id),
      };
    }

    if (type === "reject") {
      return {
        title: "Reject Payment?",
        icon: <XCircle size={26} />,
        iconClass: "pq-confirm-icon pq-confirm-icon-reject",
        message: `Are you sure you want to reject this payment of ${formatAmount(
          payment.amount
        )} for ${payment.investor}?`,
        subMessage:
          "This payment request will be moved to Rejected status.",
        confirmText: "Reject Payment",
        confirmClass: "pq-confirm-reject",
        action: () => handleReject(payment.id),
      };
    }

    if (type === "paid") {
      return {
        title: "Mark Payment as Paid?",
        icon: <CheckCircle2 size={26} />,
        iconClass: "pq-confirm-icon pq-confirm-icon-paid",
        message: `Confirm that the payment of ${formatAmount(
          payment.amount
        )} for ${payment.investor} has been paid?`,
        subMessage:
          "Once confirmed, the payment status will change to Paid.",
        confirmText: "Mark Paid",
        confirmClass: "pq-confirm-paid",
        action: () => handleMarkPaid(payment.id),
      };
    }

    return null;
  }

  const confirmationContent = getConfirmationContent();

  return (
    <div className="pq-page">
      <div className="pq-page-head">
        <div>
          <h1>Payment Queue</h1>

          <p>
            Approved payment requests from all branch admins
          </p>
        </div>

        <div className="pq-pending-card">
          <span className="pq-pending-label">
            {pendingSummary.count} Pending
          </span>

          <span className="pq-pending-amount">
            {formatAmount(pendingSummary.total)}
          </span>
        </div>
      </div>

      <div className="pq-card">
        <div className="pq-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={
                "pq-tab" +
                (activeTab === tab
                  ? " pq-tab-active"
                  : "")
              }
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
                  <td
                    colSpan={9}
                    className="pq-empty"
                  >
                    No payment requests found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="pq-name">
                      {p.investor}
                    </td>

                    <td>
                      <span className="pq-id-link-static">
                        {p.bond}
                      </span>
                    </td>

                    <td>
                      <span
                        className={typeBadgeClass(p.type)}
                      >
                        {p.type}
                      </span>
                    </td>

                    <td className="pq-amount">
                      {formatAmount(p.amount)}
                    </td>

                    <td className="pq-muted">
                      {p.requestedBy}
                    </td>

                    <td className="pq-muted">
                      {p.approvedBy}
                    </td>

                    <td className="pq-muted">
                      {formatDate(p.date)}
                    </td>

                    <td>
                      <span
                        className={statusBadgeClass(
                          p.status
                        )}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td>
                      <div className="pq-actions">
                        {p.status === "Pending" && (
                          <>
                            <button
                              type="button"
                              className="pq-approve-btn"
                              onClick={() =>
                                openApproval(p)
                              }
                            >
                              <CheckCircle2 size={14} />
                              <span>Approve</span>
                            </button>

                            <button
                              type="button"
                              className="pq-reject-btn"
                              onClick={() =>
                                openConfirmation(
                                  "reject",
                                  p
                                )
                              }
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
                            onClick={() =>
                              openConfirmation(
                                "paid",
                                p
                              )
                            }
                          >
                            <CheckCircle2 size={14} />
                            <span>Mark Paid</span>
                          </button>
                        )}

                        {p.status === "Paid" && (
                          <span className="pq-paid-label">
                            <CheckCircle2 size={14} />
                            <span>Paid</span>
                          </span>
                        )}

                        {p.status === "Rejected" && (
                          <span className="pq-rejected-label">
                            Rejected
                          </span>
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

      {approvalPayment && (
        <Modal
          title="Review & Approve Payment"
          onClose={closeApproval}
        >
          <div className="pq-approval-modal">
            <div className="pq-approval-intro">
              <div className="pq-approval-icon">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h3>Payment approval request</h3>

                <p>
                  Review the payment details submitted
                  by the branch admin before approving
                  this request.
                </p>
              </div>
            </div>

            <div className="pq-payment-summary">
              <div className="pq-summary-main">
                <span>PAYMENT AMOUNT</span>

                <strong>
                  {formatAmount(
                    approvalPayment.amount
                  )}
                </strong>
              </div>

              <span
                className={statusBadgeClass(
                  approvalPayment.status
                )}
              >
                {approvalPayment.status}
              </span>
            </div>

            <div className="pq-modal-grid">
              <div className="pq-detail-card">
                <div className="pq-detail-icon pq-detail-blue">
                  <UserRound size={17} />
                </div>

                <div>
                  <span className="pq-modal-label">
                    Investor
                  </span>

                  <strong className="pq-modal-value">
                    {approvalPayment.investor}
                  </strong>
                </div>
              </div>

              <div className="pq-detail-card">
                <div className="pq-detail-icon pq-detail-purple">
                  <Landmark size={17} />
                </div>

                <div>
                  <span className="pq-modal-label">
                    Bond Number
                  </span>

                  <strong className="pq-modal-value">
                    {approvalPayment.bond}
                  </strong>
                </div>
              </div>

              <div className="pq-detail-card">
                <div className="pq-detail-icon pq-detail-green">
                  <Wallet size={17} />
                </div>

                <div>
                  <span className="pq-modal-label">
                    Payment Type
                  </span>

                  <span
                    className={typeBadgeClass(
                      approvalPayment.type
                    )}
                  >
                    {approvalPayment.type}
                  </span>
                </div>
              </div>

              <div className="pq-detail-card">
                <div className="pq-detail-icon pq-detail-orange">
                  <CalendarDays size={17} />
                </div>

                <div>
                  <span className="pq-modal-label">
                    Request Date
                  </span>

                  <strong className="pq-modal-value">
                    {formatDate(
                      approvalPayment.date
                    )}
                  </strong>
                </div>
              </div>

              <div className="pq-detail-card">
                <div>
                  <span className="pq-modal-label">
                    Requested By
                  </span>

                  <strong className="pq-modal-value">
                    {approvalPayment.requestedBy}
                  </strong>
                </div>
              </div>

              <div className="pq-detail-card">
                <div>
                  <span className="pq-modal-label">
                    Branch Admin Approval
                  </span>

                  <strong className="pq-modal-value">
                    {approvalPayment.approvedBy || "—"}
                  </strong>
                </div>
              </div>

              <div className="pq-detail-card pq-detail-card-wide">
                <div>
                  <span className="pq-modal-label">
                    Payment Request ID
                  </span>

                  <strong className="pq-modal-value">
                    {approvalPayment.id}
                  </strong>
                </div>
              </div>
            </div>

            <div className="pq-approval-warning">
              <ShieldCheck size={17} />

              <span>
                Approving this request will move it
                to <b>Approved</b>. The payment can
                then be processed using{" "}
                <b>Mark Paid</b>.
              </span>
            </div>

            <div className="pq-modal-actions">
              <button
                type="button"
                className="pq-modal-cancel"
                onClick={closeApproval}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="pq-modal-reject"
                onClick={() =>
                  openConfirmation(
                    "reject",
                    approvalPayment
                  )
                }
                disabled={actionLoading}
              >
                <XCircle size={15} />
                Reject
              </button>

              <button
                type="button"
                className="pq-modal-approve"
                onClick={() =>
                  openConfirmation(
                    "approve",
                    approvalPayment
                  )
                }
                disabled={actionLoading}
              >
                <CheckCircle2 size={16} />
                Approve Payment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirmation && confirmationContent && (
        <Modal
          title={confirmationContent.title}
          onClose={closeConfirmation}
        >
          <div className="pq-confirm-modal">
            <div className={confirmationContent.iconClass}>
              {confirmationContent.icon}
            </div>

            <h3>
              {confirmationContent.title}
            </h3>

            <p className="pq-confirm-message">
              {confirmationContent.message}
            </p>

            <p className="pq-confirm-submessage">
              {confirmationContent.subMessage}
            </p>

            <div className="pq-confirm-payment">
              <div>
                <span>Investor</span>
                <strong>
                  {confirmation.payment.investor}
                </strong>
              </div>

              <div>
                <span>Amount</span>
                <strong>
                  {formatAmount(
                    confirmation.payment.amount
                  )}
                </strong>
              </div>

              <div>
                <span>Payment ID</span>
                <strong>
                  {confirmation.payment.id}
                </strong>
              </div>
            </div>

            <div className="pq-confirm-actions">
              <button
                type="button"
                className="pq-modal-cancel"
                onClick={closeConfirmation}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  "pq-confirm-action " +
                  confirmationContent.confirmClass
                }
                onClick={confirmationContent.action}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  "Processing..."
                ) : (
                  <>
                    {confirmation.type === "reject" ? (
                      <XCircle size={16} />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}

                    {confirmationContent.confirmText}
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}