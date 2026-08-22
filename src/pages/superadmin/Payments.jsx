import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  XCircle,
  CalendarDays,
  UserRound,
  Landmark,
  Wallet,
  ShieldCheck,
  Loader2,
  RefreshCw,
  AlertCircle,
  Clock3,
  ArrowRight,
} from "lucide-react";

import "../../Styles/SuperAdmin/Payments.css";
import Modal from "./Modal";

import {
  getPaymentQueue,
  getPaymentDetails,
  approvePayment,
  rejectPayment,
  markPaymentPaid,
  getAllTenureExtensions,
  getTenureExtensionDetails,
  approveTenureExtension,
  rejectTenureExtension,
  markTenureExtensionPaid,
} from "../../services/superadmin/paymentService";

const PAYMENT_TABS = [
  "All",
  "Monthly Interest",
  "Tenure Settlement",
  "Pre-Close Settlement",
  "Tenure Extension",
];

const GST_RATE = 0.18;

const getValue = (row, keys, fallback = null) => {
  for (const key of keys) {
    if (
      row &&
      row[key] !== undefined &&
      row[key] !== null
    ) {
      return row[key];
    }
  }

  return fallback;
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const normalizeStatus = (value) => {
  const status = String(value || "")
    .trim()
    .toLowerCase();

  if (
    status === "approved" ||
    status === "active"
  ) {
    return "Approved";
  }

  if (status === "rejected" || status === "reject") {
    return "Rejected";
  }

  if (status === "paid") {
    return "Paid";
  }

  if (
    status === "pending" ||
    status === "pending super admin" ||
    status.includes("super admin") ||
    status.includes("awaiting")
  ) {
    return "Pending";
  }

  return "Pending";
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAmount = (value) =>
  `₹${toNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const getList = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.items,
    response?.results,
    response?.requests,
    response?.settlements,
    response?.preclose_requests,
    response?.tenure_timeout_settlements,
    response?.closed_settlements,
    response?.data?.items,
    response?.data?.results,
    response?.data?.requests,
    response?.data?.settlements,
    response?.data?.preclose_requests,
    response?.data?.tenure_timeout_settlements,
    response?.data?.closed_settlements,
  ];

  for (const value of candidates) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};

const normalizePayment = (
  row,
  index,
  forcedType = null
) => {
  const rawSettlementType = String(
    getValue(
      row,
      [
        "settlement_type",
        "settlementType",
        "type",
      ],
      ""
    )
  )
    .trim()
    .toUpperCase();

  let type = forcedType;

  if (!type) {
    if (
      rawSettlementType === "PRECLOSE" ||
      rawSettlementType === "PRE_CLOSE" ||
      rawSettlementType === "PRE-CLOSE"
    ) {
      type = "Pre-Close Settlement";
    } else if (
      rawSettlementType === "TENURE_TIMEOUT" ||
      rawSettlementType === "TENURE TIMEOUT"
    ) {
      type = "Tenure Settlement";
    } else {
      type = getValue(
        row,
        [
          "payment_type",
          "paymentType",
          "type",
        ],
        "Monthly Interest"
      );
    }
  }

  const principal = toNumber(
    getValue(
      row,
      [
        "principal_amount",
        "principalAmount",
        "principal",
        "investment_amount",
        "investmentAmount",
      ],
      0
    )
  );

  const interest = toNumber(
    getValue(
      row,
      [
        "interest_amount",
        "interestAmount",
        "interest",
        "interest_earned",
        "interestEarned",
        "expected_interest_amount",
      ],
      0
    )
  );

  const penalty = toNumber(
    getValue(
      row,
      [
        "penalty_amount",
        "penaltyAmount",
        "penalty",
      ],
      0
    )
  );

  const storedGst = getValue(
    row,
    [
      "gst_amount",
      "gstAmount",
      "gst",
    ],
    null
  );

  const gst =
    storedGst === null
      ? Number((interest * GST_RATE).toFixed(2))
      : toNumber(storedGst);

  const storedNet = getValue(
    row,
    [
      "net_settlement_amount",
      "netSettlementAmount",
      "net_settlement",
      "net_payable",
      "settlement_amount",
    ],
    null
  );

  const settlementNet =
    storedNet === null
      ? Number(
          (
            principal +
            interest -
            gst -
            penalty
          ).toFixed(2)
        )
      : toNumber(storedNet);

  const monthlyAmount = toNumber(
    getValue(
      row,
      [
        "payment_amount",
        "paymentAmount",
        "amount",
        "approved_amount",
        "approvedAmount",
        "interest_due",
        "interest_due_amount",
      ],
      0
    )
  );

  const amount =
    type === "Monthly Interest"
      ? monthlyAmount
      : settlementNet;

  const sourceId = getValue(
    row,
    [
      "source_id",
      "sourceId",
      "preclose_request_id",
      "settlement_id",
      "payment_request_id",
      "paymentRequestId",
      "request_id",
      "requestId",
      "id",
    ],
    index + 1
  );

  return {
    ...row,

    id: String(sourceId),
    sourceId,

    investor: String(
      getValue(
        row,
        [
          "investor",
          "investor_name",
          "investorName",
          "full_name",
          "fullName",
          "name",
        ],
        "—"
      )
    ),

    investorId: String(
      getValue(
        row,
        [
          "investor_id",
          "investorId",
        ],
        "—"
      )
    ),

    bond: String(
      getValue(
        row,
        [
          "bond_number",
          "bondNumber",
          "bond_id",
          "bondId",
          "bond_no",
          "bondNo",
          "bond",
        ],
        "—"
      )
    ),

    type: String(type),

    principal,
    interest,
    gst,
    penalty,
    netSettlement: settlementNet,

    amount,

    requestedBy: String(
      getValue(
        row,
        [
          "requested_by_name",
          "requestedByName",
          "requested_by",
          "requestedBy",
          "admin_name",
          "adminName",
        ],
        "—"
      )
    ),

    approvedBy:
      getValue(
        row,
        [
          "approved_by_name",
          "approvedByName",
          "approved_by",
          "approvedBy",
        ],
        null
      ) || "—",

    date: getValue(
      row,
      [
        "requested_on",
        "requested_date",
        "requestedDate",
        "payment_date",
        "paymentDate",
        "approved_date",
        "approvedDate",
        "created_date",
        "created_at",
        "createdAt",
        "date",
      ],
      null
    ),

    status: normalizeStatus(
      getValue(
        row,
        [
          "status",
          "status_name",
          "statusName",
          "payment_status",
          "paymentStatus",
          "settlement_status",
        ],
        "Pending"
      )
    ),
  };
};

const normalizeTenureRequest = (
  row,
  index
) => {
  const requestId = getValue(
    row,
    [
      "request_id",
      "requestId",
      "id",
    ],
    index + 1
  );

  return {
    ...row,

    requestId: Number(requestId),

    investorId: String(
      getValue(
        row,
        [
          "investor_id",
          "investorId",
        ],
        "—"
      )
    ),

    investorName: String(
      getValue(
        row,
        [
          "investor_name",
          "investorName",
          "full_name",
          "fullName",
          "investor",
        ],
        "—"
      )
    ),

    bondId: String(
      getValue(
        row,
        [
          "bond_id",
          "bondId",
          "bond_number",
          "bondNumber",
        ],
        "—"
      )
    ),

    currentMaturity: getValue(
      row,
      [
        "current_maturity_date",
        "currentMaturityDate",
        "maturity_date",
        "maturityDate",
      ],
      null
    ),

    currentInterestRate: getValue(
      row,
      [
        "current_interest_rate",
        "currentInterestRate",
        "interest_rate",
        "interestRate",
      ],
      null
    ),

    requestedExtension: String(
      getValue(
        row,
        [
          "requested_extension",
          "requestedExtension",
          "requested_tenure_months",
          "requestedTenureMonths",
        ],
        "—"
      )
    ),

    submittedDate: getValue(
      row,
      [
        "submitted_date",
        "submittedDate",
        "requested_date",
        "requestedDate",
      ],
      null
    ),

    amount: toNumber(
      getValue(
        row,
        [
          "amount",
          "payment_amount",
          "paymentAmount",
          "extension_amount",
          "extensionAmount",
          "settlement_amount",
          "settlementAmount",
        ],
        0
      )
    ),

    status: normalizeStatus(
      getValue(
        row,
        [
          "request_status",
          "requestStatus",
          "status_name",
          "statusName",
          "status",
        ],
        "Pending"
      )
    ),
  };
};

const normalizeTenureForAll = (request) => ({
  ...request,

  id: `tenure-extension-${request.requestId}`,
  sourceId: request.requestId,
  investor: request.investorName || "—",
  investorId: request.investorId || "—",
  bond: request.bondId || "—",
  type: "Tenure Extension",

  principal: request.amount || 0,
  interest: 0,
  gst: 0,
  penalty: 0,
  netSettlement: request.amount || 0,
  amount: request.amount || 0,

  requestedBy:
    request.requestedBy ||
    request.requestedByName ||
    "—",

  approvedBy:
    request.approvedBy ||
    request.approvedByName ||
    "—",

  date: request.submittedDate || null,

  status: normalizeStatus(
    request.status
  ),

  isTenureExtension: true,
});

const statusBadgeClass = (status) => {
  const value = String(status || "")
    .toLowerCase();

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
};

const typeBadgeClass = (type) => {
  if (type === "Monthly Interest") {
    return "pq-type-badge pq-type-blue";
  }

  if (type === "Tenure Settlement") {
    return "pq-type-badge pq-type-green";
  }

  if (type === "Pre-Close Settlement") {
    return "pq-type-badge pq-type-orange";
  }

  if (type === "Tenure Extension") {
    return "pq-type-badge pq-type-blue";
  }

  return "pq-type-badge";
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [tenureRequests, setTenureRequests] = useState([]);

  const [activeTab, setActiveTab] = useState("All");

  const [loading, setLoading] = useState(true);
  const [tenureLoading, setTenureLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [tenureError, setTenureError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [approvalPayment, setApprovalPayment] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [confirmation, setConfirmation] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [tenureReviewOpen, setTenureReviewOpen] = useState(false);
  const [tenureDetails, setTenureDetails] = useState(null);
  const [tenureDetailsLoading, setTenureDetailsLoading] =
    useState(false);
  const [tenureRemarks, setTenureRemarks] = useState("");

  const showSuccess = (message) => {
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPaymentQueue({
        paymentType: activeTab,
        limit: 100,
        offset: 0,
      });

      const rows = getList(response);

      const forcedType =
        activeTab === "Monthly Interest"
          ? "Monthly Interest"
          : activeTab === "Tenure Settlement"
          ? "Tenure Settlement"
          : activeTab === "Pre-Close Settlement"
          ? "Pre-Close Settlement"
          : null;

      let normalized = rows.map(
        (row, index) =>
          normalizePayment(
            row,
            index,
            forcedType
          )
      );

      if (activeTab === "All") {
        normalized = normalized.filter(
          (payment) =>
            payment.type === "Monthly Interest" ||
            payment.type === "Tenure Settlement" ||
            payment.type === "Pre-Close Settlement"
        );
      }

      const unique = [];
      const seen = new Set();

      normalized.forEach((payment) => {
        const key =
          `${payment.type}-${payment.sourceId}`;

        if (!seen.has(key)) {
          seen.add(key);
          unique.push(payment);
        }
      });

      setPayments(unique);
    } catch (err) {
      console.error(
        "Failed to load payments:",
        err
      );

      setError(
        err?.message ||
          "Failed to load payment queue."
      );

      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTenureRequests = async () => {
    try {
      setTenureLoading(true);
      setTenureError("");

      const response =
        await getAllTenureExtensions({
          limit: 100,
          offset: 0,
        });

      const rows = getList(response);

      setTenureRequests(
        rows.map(normalizeTenureRequest)
      );
    } catch (err) {
      console.error(
        "Failed to load tenure extension requests:",
        err
      );

      setTenureError(
        err?.message ||
          "Failed to load tenure extension requests."
      );

      setTenureRequests([]);
    } finally {
      setTenureLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [activeTab]);

  useEffect(() => {
    loadTenureRequests();
  }, []);

  const allRows = useMemo(() => {
    if (activeTab === "Tenure Extension") {
      return tenureRequests.map(
        normalizeTenureForAll
      );
    }

    if (activeTab === "All") {
      return [
        ...payments,
        ...tenureRequests.map(
          normalizeTenureForAll
        ),
      ];
    }

    return payments;
  }, [
    activeTab,
    payments,
    tenureRequests,
  ]);

  const pendingSummary = useMemo(() => {
    const pending = allRows.filter(
      (row) =>
        normalizeStatus(row.status) ===
        "Pending"
    );

    return {
      count: pending.length,
      total: pending.reduce(
        (sum, row) =>
          sum + toNumber(row.amount),
        0
      ),
    };
  }, [allRows]);

  const closeApproval = () => {
    if (actionLoading) {
      return;
    }

    setApprovalPayment(null);
    setSelectedPayment(null);
    setDetailsLoading(false);
  };

  const openApproval = async (payment) => {
    if (
      !payment ||
      normalizeStatus(payment.status) !==
        "Pending"
    ) {
      return;
    }

    setApprovalPayment(payment);
    setSelectedPayment(null);
    setDetailsLoading(true);
    setError("");

    try {
      const response =
        await getPaymentDetails(
          payment.sourceId,
          payment.type
        );

      const details =
        response?.data ||
        response?.payment ||
        response;

      if (details) {
        setSelectedPayment(
          normalizePayment(
            {
              ...payment,
              ...details,
            },
            0,
            payment.type
          )
        );
      } else {
        setSelectedPayment(payment);
      }
    } catch (err) {
      console.error(
        "Failed to load payment details:",
        err
      );

      setSelectedPayment(payment);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeConfirmation = () => {
    if (actionLoading) {
      return;
    }

    setConfirmation(null);
    setRejectionReason("");
  };

  const openConfirmation = (
    type,
    payment
  ) => {
    if (!payment) {
      return;
    }

    if (type === "reject") {
      setRejectionReason("");
    }

    setConfirmation({
      type,
      payment,
    });
  };

  const handleApprove = async (payment) => {
    if (!payment) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await approvePayment(
        payment.sourceId,
        payment.type
      );

      closeConfirmation();
      closeApproval();

      showSuccess(
        `${payment.type} approved successfully.`
      );

      await loadPayments();
    } catch (err) {
      console.error(
        "Approve payment failed:",
        err
      );

      setError(
        err?.message ||
          "Failed to approve payment."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (payment) => {
    if (!payment) {
      return;
    }

    const reason =
      rejectionReason.trim();

    if (!reason) {
      setError(
        "Please enter a rejection reason."
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await rejectPayment(
        payment.sourceId,
        payment.type,
        reason
      );

      closeConfirmation();
      closeApproval();

      showSuccess(
        `${payment.type} rejected successfully.`
      );

      await loadPayments();
    } catch (err) {
      console.error(
        "Reject payment failed:",
        err
      );

      setError(
        err?.message ||
          "Failed to reject payment."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async (payment) => {
    if (!payment) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await markPaymentPaid(
        payment.sourceId,
        payment.type
      );

      closeConfirmation();

      showSuccess(
        `${payment.type} marked as paid successfully.`
      );

      await loadPayments();
    } catch (err) {
      console.error(
        "Mark paid failed:",
        err
      );

      setError(
        err?.message ||
          "Failed to mark payment as paid."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openTenureReview = async (
    request
  ) => {
    if (
      !request ||
      normalizeStatus(request.status) !==
        "Pending"
    ) {
      return;
    }

    setTenureReviewOpen(true);
    setTenureDetails(null);
    setTenureDetailsLoading(true);
    setTenureRemarks("");
    setTenureError("");

    try {
      const response =
        await getTenureExtensionDetails(
          request.requestId
        );

      const details =
        response?.data ||
        response?.request ||
        response;

      const normalized =
        details
          ? normalizeTenureRequest({
              ...request,
              ...details,
            })
          : request;

      setTenureDetails(normalized);
    } catch (err) {
      console.error(
        "Failed to load tenure extension details:",
        err
      );

      setTenureDetails(request);
    } finally {
      setTenureDetailsLoading(false);
    }
  };

  const closeTenureReview = () => {
    if (actionLoading) {
      return;
    }

    setTenureReviewOpen(false);
    setTenureDetails(null);
    setTenureRemarks("");
  };

  const handleApproveTenure = async () => {
    if (!tenureDetails) {
      return;
    }

    try {
      setActionLoading(true);
      setTenureError("");

      await approveTenureExtension(
        tenureDetails.requestId,
        tenureRemarks.trim() || null
      );

      closeTenureReview();

      showSuccess(
        "Tenure extension approved successfully."
      );

      await loadTenureRequests();
    } catch (err) {
      console.error(
        "Approve tenure extension failed:",
        err
      );

      setTenureError(
        err?.message ||
          "Failed to approve tenure extension."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectTenure = async () => {
    if (!tenureDetails) {
      return;
    }

    const reason =
      tenureRemarks.trim();

    if (!reason) {
      setTenureError(
        "Rejection reason is required."
      );
      return;
    }

    try {
      setActionLoading(true);
      setTenureError("");

      await rejectTenureExtension(
        tenureDetails.requestId,
        reason
      );

      closeTenureReview();

      showSuccess(
        "Tenure extension rejected successfully."
      );

      await loadTenureRequests();
    } catch (err) {
      console.error(
        "Reject tenure extension failed:",
        err
      );

      setTenureError(
        err?.message ||
          "Failed to reject tenure extension."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkTenurePaid = async (
    request
  ) => {
    if (!request) {
      return;
    }

    try {
      setActionLoading(true);
      setTenureError("");

      await markTenureExtensionPaid(
        request.requestId
      );

      closeConfirmation();

      showSuccess(
        "Tenure extension payment marked as paid successfully."
      );

      await loadTenureRequests();
    } catch (err) {
      console.error(
        "Mark tenure extension paid failed:",
        err
      );

      setTenureError(
        err?.message ||
          "Failed to mark tenure extension as paid."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getActionContent = () => {
    if (!confirmation) {
      return null;
    }

    const {
      type,
      payment,
    } = confirmation;

    if (type === "approve") {
      return {
        title: "Approve Payment?",
        message: `Are you sure you want to approve ${payment.type} of ${formatAmount(
          payment.amount
        )} for ${payment.investor}?`,
        subMessage:
          "The row will remain visible with Approved status. It can then be marked Paid.",
        confirmText: "Approve",
        confirmClass: "pq-confirm-approve",
        action: () =>
          handleApprove(payment),
        icon: (
          <CheckCircle2 size={26} />
        ),
        iconClass:
          "pq-confirm-icon pq-confirm-icon-approve",
      };
    }

    if (type === "reject") {
      return {
        title: "Reject Payment?",
        message: `Are you sure you want to reject ${payment.type} for ${payment.investor}?`,
        subMessage:
          "The row will remain visible with Rejected status.",
        confirmText: "Reject",
        confirmClass: "pq-confirm-reject",
        action: () =>
          handleReject(payment),
        icon: (
          <XCircle size={26} />
        ),
        iconClass:
          "pq-confirm-icon pq-confirm-icon-reject",
      };
    }

    if (type === "paid") {
      return {
        title: "Mark Payment as Paid?",
        message: `Confirm that ${payment.type} of ${formatAmount(
          payment.amount
        )} for ${payment.investor} has been paid.`,
        subMessage:
          "The row will remain visible with Paid status.",
        confirmText: "Mark Paid",
        confirmClass: "pq-confirm-paid",
        action: () =>
          handleMarkPaid(payment),
        icon: (
          <CheckCircle2 size={26} />
        ),
        iconClass:
          "pq-confirm-icon pq-confirm-icon-paid",
      };
    }

    if (type === "tenure-paid") {
      return {
        title:
          "Mark Tenure Extension as Paid?",
        message: `Confirm that the tenure extension payment for ${
          payment.investorName ||
          payment.investor ||
          "this investor"
        } has been paid.`,
        subMessage:
          "The row will remain visible with Paid status.",
        confirmText: "Mark Paid",
        confirmClass: "pq-confirm-paid",
        action: () =>
          handleMarkTenurePaid(payment),
        icon: (
          <CheckCircle2 size={26} />
        ),
        iconClass:
          "pq-confirm-icon pq-confirm-icon-paid",
      };
    }

    return null;
  };

  const actionContent =
    getActionContent();

  const pendingCount =
    pendingSummary.count;

  const pendingAmount =
    pendingSummary.total;

  const renderActions = (payment) => {
    const status =
      normalizeStatus(payment.status);

    if (payment.isTenureExtension) {
      if (status === "Pending") {
        return (
          <button
            type="button"
            className="pq-approve-btn pq-review-btn"
            onClick={() =>
              openTenureReview(
                payment
              )
            }
            disabled={actionLoading}
          >
            <ShieldCheck size={14} />
            <span>Review</span>
            <ArrowRight size={13} />
          </button>
        );
      }

      if (status === "Approved") {
        return (
          <button
            type="button"
            className="pq-markpaid-btn"
            onClick={() =>
              openConfirmation(
                "tenure-paid",
                payment
              )
            }
            disabled={actionLoading}
          >
            <CheckCircle2 size={14} />
            <span>Mark Paid</span>
          </button>
        );
      }

      if (status === "Paid") {
        return (
          <span className="pq-paid-label">
            <CheckCircle2 size={14} />
            <span>Paid</span>
          </span>
        );
      }

      if (status === "Rejected") {
        return (
          <span className="pq-rejected-label">
            Rejected
          </span>
        );
      }

      return null;
    }

    if (status === "Pending") {
      return (
        <>
          <button
            type="button"
            className="pq-approve-btn"
            onClick={() =>
              openApproval(payment)
            }
            disabled={actionLoading}
          >
            <CheckCircle2 size={14} />
            <span>Review</span>
          </button>

          <button
            type="button"
            className="pq-reject-btn"
            onClick={() =>
              openConfirmation(
                "reject",
                payment
              )
            }
            disabled={actionLoading}
          >
            <XCircle size={15} />
          </button>
        </>
      );
    }

    if (status === "Approved") {
      return (
        <button
          type="button"
          className="pq-markpaid-btn"
          onClick={() =>
            openConfirmation(
              "paid",
              payment
            )
          }
          disabled={actionLoading}
        >
          <CheckCircle2 size={14} />
          <span>Mark Paid</span>
        </button>
      );
    }

    if (status === "Paid") {
      return (
        <span className="pq-paid-label">
          <CheckCircle2 size={14} />
          <span>Paid</span>
        </span>
      );
    }

    if (status === "Rejected") {
      return (
        <span className="pq-rejected-label">
          Rejected
        </span>
      );
    }

    return null;
  };

  const renderSettlementTable = (
    rows
  ) => (
    <div className="pq-table-wrap">
      <table className="pq-table">
        <thead>
          <tr>
            <th>Investor</th>
            <th>Bond</th>
            <th>Payment Type</th>
            <th>Principal</th>
            <th>Interest</th>
            <th>GST</th>
            <th>Penalty</th>
            <th>Net Settlement</th>
            <th>Requested By</th>
            <th>Approved By Admin</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={13}
                className="pq-loading"
              >
                <Loader2
                  size={22}
                  className="pq-spin"
                />
                <span>
                  Loading payments...
                </span>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={13}
                className="pq-empty"
              >
                <div className="pq-empty-content">
                  <Wallet size={30} />
                  <strong>
                    No payment requests found
                  </strong>
                  <span>
                    There are no requests in this category.
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((payment) => (
              <tr
                key={`${payment.type}-${payment.sourceId}`}
              >
                <td className="pq-name">
                  {payment.investor}
                </td>

                <td>
                  <span className="pq-id-link-static">
                    {payment.bond}
                  </span>
                </td>

                <td>
                  <span
                    className={typeBadgeClass(
                      payment.type
                    )}
                  >
                    {payment.type}
                  </span>
                </td>

                <td className="pq-amount">
                  {formatAmount(
                    payment.principal
                  )}
                </td>

                <td className="pq-amount">
                  {formatAmount(
                    payment.interest
                  )}
                </td>

                <td className="pq-amount">
                  {formatAmount(
                    payment.gst
                  )}
                </td>

                <td className="pq-amount">
                  {payment.penalty
                    ? `-${formatAmount(
                        payment.penalty
                      )}`
                    : formatAmount(0)}
                </td>

                <td className="pq-amount">
                  {formatAmount(
                    payment.netSettlement
                  )}
                </td>

                <td className="pq-muted">
                  {payment.requestedBy}
                </td>

                <td className="pq-muted">
                  {payment.approvedBy}
                </td>

                <td className="pq-muted">
                  {formatDate(
                    payment.date
                  )}
                </td>

                <td>
                  <span
                    className={statusBadgeClass(
                      payment.status
                    )}
                  >
                    {payment.status}
                  </span>
                </td>

                <td>
                  <div className="pq-actions">
                    {renderActions(
                      payment
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderMonthlyTable = (rows) => (
    <div className="pq-table-wrap">
      <table className="pq-table">
        <thead>
          <tr>
            <th>Investor</th>
            <th>Bond</th>
            <th>Payment Type</th>
            <th>Amount</th>
            <th>GST</th>
            <th>Net Amount</th>
            <th>Requested By</th>
            <th>Approved By Admin</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={11}
                className="pq-loading"
              >
                <Loader2
                  size={22}
                  className="pq-spin"
                />
                <span>
                  Loading payments...
                </span>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={11}
                className="pq-empty"
              >
                <div className="pq-empty-content">
                  <Wallet size={30} />
                  <strong>
                    No payment requests found
                  </strong>
                  <span>
                    There are no requests in this category.
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((payment) => (
              <tr
                key={`${payment.type}-${payment.sourceId}`}
              >
                <td className="pq-name">
                  {payment.investor}
                </td>

                <td>
                  <span className="pq-id-link-static">
                    {payment.bond}
                  </span>
                </td>

                <td>
                  <span
                    className={typeBadgeClass(
                      payment.type
                    )}
                  >
                    {payment.type}
                  </span>
                </td>

                <td className="pq-amount">
                  {formatAmount(
                    payment.amount
                  )}
                </td>

                <td className="pq-amount">
                  {formatAmount(
                    payment.gst
                  )}
                </td>

                <td className="pq-amount">
                  {formatAmount(
                    payment.amount -
                      payment.gst
                  )}
                </td>

                <td className="pq-muted">
                  {payment.requestedBy}
                </td>

                <td className="pq-muted">
                  {payment.approvedBy}
                </td>

                <td className="pq-muted">
                  {formatDate(
                    payment.date
                  )}
                </td>

                <td>
                  <span
                    className={statusBadgeClass(
                      payment.status
                    )}
                  >
                    {payment.status}
                  </span>
                </td>

                <td>
                  <div className="pq-actions">
                    {renderActions(
                      payment
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderTenureExtensionTable =
    () => (
      <div className="pq-table-wrap">
        <table className="pq-table pq-tenure-table">
          <thead>
            <tr>
              <th>Investor</th>
              <th>Investor ID</th>
              <th>Bond</th>
              <th>Current Maturity</th>
              <th>Interest Rate</th>
              <th>Requested Extension</th>
              <th>Amount</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tenureLoading ? (
              <tr>
                <td
                  colSpan={10}
                  className="pq-loading"
                >
                  <Loader2
                    size={22}
                    className="pq-spin"
                  />
                  <span>
                    Loading tenure extension requests...
                  </span>
                </td>
              </tr>
            ) : tenureRequests.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="pq-empty"
                >
                  <div className="pq-empty-content">
                    <Clock3 size={30} />
                    <strong>
                      No tenure extension requests
                    </strong>
                    <span>
                      There are currently no tenure extension requests.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              tenureRequests.map(
                (request) => (
                  <tr
                    key={request.requestId}
                  >
                    <td className="pq-name">
                      {request.investorName}
                    </td>

                    <td className="pq-muted">
                      {request.investorId}
                    </td>

                    <td>
                      <span className="pq-id-link-static">
                        {request.bondId}
                      </span>
                    </td>

                    <td className="pq-muted">
                      {formatDate(
                        request.currentMaturity
                      )}
                    </td>

                    <td className="pq-muted">
                      {request.currentInterestRate !==
                      null &&
                      request.currentInterestRate !==
                      undefined
                        ? `${request.currentInterestRate}%`
                        : "—"}
                    </td>

                    <td>
                      <span className="pq-type-badge pq-type-blue">
                        {request.requestedExtension}
                      </span>
                    </td>

                    <td className="pq-amount">
                      {formatAmount(
                        request.amount
                      )}
                    </td>

                    <td className="pq-muted">
                      {formatDateTime(
                        request.submittedDate
                      )}
                    </td>

                    <td>
                      <span
                        className={statusBadgeClass(
                          request.status
                        )}
                      >
                        {normalizeStatus(
                          request.status
                        )}
                      </span>
                    </td>

                    <td>
                      <div className="pq-actions">
                        {renderActions({
                          ...request,
                          isTenureExtension:
                            true,
                        })}
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    );

  const renderContent = () => {
    if (activeTab === "Tenure Extension") {
      return renderTenureExtensionTable();
    }

    if (
      activeTab === "Tenure Settlement" ||
      activeTab === "Pre-Close Settlement"
    ) {
      return renderSettlementTable(
        payments
      );
    }

    if (activeTab === "Monthly Interest") {
      return renderMonthlyTable(
        payments
      );
    }

    const settlementRows =
      payments.filter(
        (row) =>
          row.type ===
            "Tenure Settlement" ||
          row.type ===
            "Pre-Close Settlement"
      );

    const monthlyRows =
      payments.filter(
        (row) =>
          row.type ===
          "Monthly Interest"
      );

    return (
      <div>
        {settlementRows.length > 0 &&
          renderSettlementTable(
            settlementRows
          )}

        {monthlyRows.length > 0 && (
          <div
            style={{
              marginTop:
                settlementRows.length > 0
                  ? 16
                  : 0,
            }}
          >
            {renderMonthlyTable(
              monthlyRows
            )}
          </div>
        )}

        {tenureRequests.length > 0 && (
          <div
            style={{
              marginTop: 16,
            }}
          >
            {renderTenureExtensionTable()}
          </div>
        )}

        {settlementRows.length === 0 &&
          monthlyRows.length === 0 &&
          tenureRequests.length === 0 &&
          renderMonthlyTable([])}
      </div>
    );
  };

  return (
    <div className="pq-page">
      <div className="pq-page-head">
        <div>
          <h1>Payment Queue</h1>
          <p>
            Payment requests from all branch admins
          </p>
        </div>

        <div className="pq-head-actions">
          <div className="pq-pending-card">
            <span className="pq-pending-label">
              {pendingCount} Pending
            </span>

            <span className="pq-pending-amount">
              {formatAmount(
                pendingAmount
              )}
            </span>
          </div>

          <button
            type="button"
            className="pq-refresh-btn"
            onClick={() => {
              loadPayments();
              loadTenureRequests();
            }}
            disabled={
              loading ||
              tenureLoading ||
              actionLoading
            }
          >
            <RefreshCw
              size={15}
              className={
                loading ||
                tenureLoading
                  ? "pq-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="pq-alert pq-alert-success">
          <CheckCircle2 size={17} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="pq-alert pq-alert-error">
          <AlertCircle size={17} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>
        </div>
      )}

      {tenureError && (
        <div className="pq-alert pq-alert-error">
          <AlertCircle size={17} />
          <span>{tenureError}</span>
          <button
            type="button"
            onClick={() =>
              setTenureError("")
            }
          >
            ×
          </button>
        </div>
      )}

      <div className="pq-card">
        <div className="pq-tabs">
          {PAYMENT_TABS.map(
            (tab) => (
              <button
                key={tab}
                type="button"
                className={
                  activeTab === tab
                    ? "pq-tab pq-tab-active"
                    : "pq-tab"
                }
                onClick={() =>
                  setActiveTab(tab)
                }
              >
                {tab}
              </button>
            )
          )}
        </div>

        {renderContent()}

        <div className="pq-table-footer">
          Showing{" "}
          <strong>
            {allRows.length}
          </strong>{" "}
          records
        </div>
      </div>

      {approvalPayment && (
        <Modal
          title="Review & Approve Payment"
          onClose={closeApproval}
        >
          <div className="pq-approval-modal">
            {detailsLoading ? (
              <div className="pq-modal-loading">
                <Loader2
                  size={25}
                  className="pq-spin"
                />
                <span>
                  Loading payment details...
                </span>
              </div>
            ) : (
              selectedPayment && (
                <>
                  <div className="pq-approval-intro">
                    <div className="pq-approval-icon">
                      <ShieldCheck size={22} />
                    </div>

                    <div>
                      <h3>
                        Review payment request
                      </h3>

                      <p>
                        Review the complete settlement
                        amount before approving or rejecting
                        this request.
                      </p>
                    </div>
                  </div>

                  <div className="pq-payment-summary">
                    <div className="pq-summary-main">
                      <span>
                        NET SETTLEMENT
                      </span>

                      <strong>
                        {formatAmount(
                          selectedPayment.amount
                        )}
                      </strong>
                    </div>

                    <span
                      className={statusBadgeClass(
                        selectedPayment.status
                      )}
                    >
                      {selectedPayment.status}
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
                          {selectedPayment.investor}
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
                          {selectedPayment.bond}
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
                            selectedPayment.type
                          )}
                        >
                          {selectedPayment.type}
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
                            selectedPayment.date
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
                          {selectedPayment.requestedBy}
                        </strong>
                      </div>
                    </div>

                    <div className="pq-detail-card">
                      <div>
                        <span className="pq-modal-label">
                          Approved By Admin
                        </span>
                        <strong className="pq-modal-value">
                          {selectedPayment.approvedBy}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {selectedPayment.type !==
                    "Monthly Interest" && (
                    <div className="pq-payment-summary">
                      <div>
                        <span className="pq-modal-label">
                          Principal
                        </span>
                        <strong>
                          {formatAmount(
                            selectedPayment.principal
                          )}
                        </strong>
                      </div>

                      <div>
                        <span className="pq-modal-label">
                          Interest
                        </span>
                        <strong>
                          {formatAmount(
                            selectedPayment.interest
                          )}
                        </strong>
                      </div>

                      <div>
                        <span className="pq-modal-label">
                          GST
                        </span>
                        <strong>
                          {formatAmount(
                            selectedPayment.gst
                          )}
                        </strong>
                      </div>

                      <div>
                        <span className="pq-modal-label">
                          Penalty
                        </span>
                        <strong>
                          {formatAmount(
                            selectedPayment.penalty
                          )}
                        </strong>
                      </div>

                      <div>
                        <span className="pq-modal-label">
                          Net Settlement
                        </span>
                        <strong>
                          {formatAmount(
                            selectedPayment.netSettlement
                          )}
                        </strong>
                      </div>
                    </div>
                  )}

                  <div className="pq-approval-warning">
                    <ShieldCheck size={17} />
                    <span>
                      Approve to change the status to{" "}
                      <b>Approved</b>. The row will remain
                      visible. After approval, use{" "}
                      <b>Mark Paid</b> to change it to{" "}
                      <b>Paid</b>.
                    </span>
                  </div>

                  <div className="pq-modal-actions">
                    <button
                      type="button"
                      className="pq-modal-cancel"
                      onClick={
                        closeApproval
                      }
                      disabled={
                        actionLoading
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="pq-modal-reject"
                      onClick={() =>
                        openConfirmation(
                          "reject",
                          selectedPayment
                        )
                      }
                      disabled={
                        actionLoading
                      }
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
                          selectedPayment
                        )
                      }
                      disabled={
                        actionLoading
                      }
                    >
                      <CheckCircle2 size={16} />
                      Approve
                    </button>
                  </div>
                </>
              )
            )}
          </div>
        </Modal>
      )}

      {tenureReviewOpen && (
        <Modal
          title="Review Tenure Extension"
          onClose={closeTenureReview}
        >
          <div className="pq-approval-modal">
            {tenureDetailsLoading ? (
              <div className="pq-modal-loading">
                <Loader2
                  size={25}
                  className="pq-spin"
                />
                <span>
                  Loading tenure extension details...
                </span>
              </div>
            ) : tenureDetails ? (
              <>
                <div className="pq-approval-intro">
                  <div className="pq-approval-icon">
                    <ShieldCheck size={22} />
                  </div>

                  <div>
                    <h3>
                      Tenure extension request
                    </h3>

                    <p>
                      Review the request submitted
                      by the branch admin.
                    </p>
                  </div>
                </div>

                <div className="pq-payment-summary">
                  <div className="pq-summary-main">
                    <span>
                      REQUEST AMOUNT
                    </span>

                    <strong>
                      {formatAmount(
                        tenureDetails.amount
                      )}
                    </strong>
                  </div>

                  <span
                    className={statusBadgeClass(
                      tenureDetails.status
                    )}
                  >
                    {normalizeStatus(
                      tenureDetails.status
                    )}
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
                        {tenureDetails.investorName}
                      </strong>
                    </div>
                  </div>

                  <div className="pq-detail-card">
                    <div className="pq-detail-icon pq-detail-purple">
                      <Landmark size={17} />
                    </div>
                    <div>
                      <span className="pq-modal-label">
                        Bond
                      </span>
                      <strong className="pq-modal-value">
                        {tenureDetails.bondId}
                      </strong>
                    </div>
                  </div>

                  <div className="pq-detail-card">
                    <div>
                      <span className="pq-modal-label">
                        Current Maturity
                      </span>
                      <strong className="pq-modal-value">
                        {formatDate(
                          tenureDetails.currentMaturity
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="pq-detail-card">
                    <div>
                      <span className="pq-modal-label">
                        Requested Extension
                      </span>
                      <strong className="pq-modal-value">
                        {tenureDetails.requestedExtension}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pq-detail-card">
                  <div>
                    <span className="pq-modal-label">
                      Remarks
                    </span>

                    <textarea
                      value={tenureRemarks}
                      onChange={(event) =>
                        setTenureRemarks(
                          event.target.value
                        )
                      }
                      placeholder="Optional remarks for approval or required reason for rejection"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="pq-modal-actions">
                  <button
                    type="button"
                    className="pq-modal-cancel"
                    onClick={
                      closeTenureReview
                    }
                    disabled={
                      actionLoading
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="pq-modal-reject"
                    onClick={
                      handleRejectTenure
                    }
                    disabled={
                      actionLoading
                    }
                  >
                    <XCircle size={15} />
                    Reject
                  </button>

                  <button
                    type="button"
                    className="pq-modal-approve"
                    onClick={
                      handleApproveTenure
                    }
                    disabled={
                      actionLoading
                    }
                  >
                    <CheckCircle2 size={16} />
                    Approve
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </Modal>
      )}

      {actionContent && (
        <Modal
          title={actionContent.title}
          onClose={closeConfirmation}
        >
          <div className="pq-confirm-modal">
            <div
              className={
                actionContent.iconClass
              }
            >
              {actionContent.icon}
            </div>

            <h3>
              {actionContent.message}
            </h3>

            <p>
              {actionContent.subMessage}
            </p>

            {confirmation?.type ===
              "reject" && (
              <textarea
                value={rejectionReason}
                onChange={(event) =>
                  setRejectionReason(
                    event.target.value
                  )
                }
                placeholder="Enter rejection reason"
                rows={4}
                autoFocus
              />
            )}

            <div className="pq-modal-actions">
              <button
                type="button"
                className="pq-modal-cancel"
                onClick={
                  closeConfirmation
                }
                disabled={
                  actionLoading
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  actionContent.confirmClass
                }
                onClick={
                  actionContent.action
                }
                disabled={
                  actionLoading ||
                  (confirmation?.type ===
                    "reject" &&
                    !rejectionReason.trim())
                }
              >
                {actionLoading ? (
                  <Loader2
                    size={15}
                    className="pq-spin"
                  />
                ) : (
                  <CheckCircle2 size={15} />
                )}

                {actionContent.confirmText}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
