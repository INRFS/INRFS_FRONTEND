import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  Send,
  Ban,
  Archive,
  Clock,
  RefreshCw,
} from "lucide-react";

import { formatINR } from "../../shared/Shared";

import {
  getTenureTimeoutSettlements,
  getPrecloseRequests,
  getClosedSettlements,
  approveTenureTimeoutSettlement,
  rejectTenureTimeoutSettlement,
  approvePrecloseRequest,
  rejectPrecloseRequest,
  getList,
} from "../../services/admin/settlementService";

import "../../Styles/Admin/Settlement.css";

const GST_RATE = 0.18;

const STATUS = {
  PENDING: "Pending",
  AWAITING_SUPERADMIN:
    "Pending Super Admin",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PAID: "Paid",
};

const getValue = (
  row,
  keys,
  fallback = null
) => {
  for (const key of keys) {
    if (
      row &&
      row[key] !== undefined &&
      row[key] !== null &&
      row[key] !== ""
    ) {
      return row[key];
    }
  }

  return fallback;
};

const toNumber = (
  value,
  fallback = 0
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const normalizeStatus = (value) => {
  if (!value) {
    return STATUS.PENDING;
  }

  const status = String(value)
    .trim()
    .toLowerCase();

  if (status === "paid") {
    return STATUS.PAID;
  }

  if (
    status === "approved" ||
    status === "settled" ||
    status === "completed"
  ) {
    return STATUS.APPROVED;
  }

  if (
    status === "rejected" ||
    status === "declined" ||
    status === "reject"
  ) {
    return STATUS.REJECTED;
  }

  if (
    status.includes("awaiting") ||
    status.includes("super admin")
  ) {
    return STATUS.AWAITING_SUPERADMIN;
  }

  if (
    status.includes("pending") ||
    status.includes("requested") ||
    status.includes("submitted") ||
    status.includes("created")
  ) {
    return STATUS.PENDING;
  }

  return STATUS.PENDING;
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return String(value);
  }

  return parsedDate.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const statusClass = (status) =>
  String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "-");

function InfoItem({
  label,
  value,
}) {
  return (
    <div className="settlement-info-item">
      <span className="settlement-info-item__label">
        {label}
      </span>

      <span className="settlement-info-item__value">
        {value || "-"}
      </span>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  tone,
}) {
  return (
    <div
      className={`settlement-breakdown-row ${
        tone
          ? `settlement-breakdown-row--${tone}`
          : ""
      }`}
    >
      <span>{label}</span>

      <span className="mono">
        {value}
      </span>
    </div>
  );
}

function StatusPill({
  status,
}) {
  if (
    status ===
    STATUS.AWAITING_SUPERADMIN
  ) {
    return (
      <span className="admin-action-muted admin-action-muted--waiting">
        <Clock size={14} />
        Waiting for Super Admin approval
      </span>
    );
  }

  if (
    status === STATUS.APPROVED
  ) {
    return (
      <span className="admin-action-muted">
        <CheckCircle2 size={14} />
        Settled
      </span>
    );
  }

  if (
    status === STATUS.REJECTED
  ) {
    return (
      <span className="admin-action-muted">
        <XCircle size={14} />
        Rejected
      </span>
    );
  }

  return null;
};

const normalizeTenureItem = (
  row,
  index
) => {
  const source =
    row?.settlement ||
    row?.details ||
    row;

  const principal =
    toNumber(
      getValue(
        source,
        [
          "principal_amount",
          "principal",
          "investment_amount",
          "amount",
        ],
        0
      )
    );

  const interestEarned =
    toNumber(
      getValue(
        source,
        [
          "interest_amount",
          "interest_earned",
          "interestEarned",
          "expected_interest_amount",
          "total_interest",
        ],
        0
      )
    );

  const gstAmount =
    toNumber(
      getValue(
        source,
        [
          "gst_amount",
          "gst",
          "gstAmount",
        ],
        Number(
          (
            interestEarned *
            GST_RATE
          ).toFixed(2)
        )
      )
    );

  const penalty =
    toNumber(
      getValue(
        source,
        [
          "penalty_amount",
          "penalty",
        ],
        0
      )
    );

  const netSettlementAmount =
    toNumber(
      getValue(
        source,
        [
          "net_settlement_amount",
          "netSettlementAmount",
          "net_settlement",
          "net_payable",
        ],
        Number(
          (
            principal +
            interestEarned -
            gstAmount -
            penalty
          ).toFixed(2)
        )
      )
    );

  return {
    id: getValue(
      source,
      [
        "settlement_id",
        "id",
      ],
      index
    ),

    investmentId:
      getValue(
        source,
        [
          "investment_id",
          "investment_code",
        ],
        "-"
      ),

    investor:
      getValue(
        source,
        [
          "investor_name",
          "investorName",
          "full_name",
          "investor",
        ],
        "-"
      ),

    investorId:
      getValue(
        source,
        [
          "investor_id",
          "investorId",
        ],
        "-"
      ),

    branch:
      getValue(
        source,
        [
          "branch_name",
          "branch",
          "location_name",
        ],
        "-"
      ),

    bondNumber:
      getValue(
        source,
        [
          "bond_number",
          "bond_id",
        ],
        "-"
      ),

    investmentDate:
      getValue(
        source,
        [
          "investment_date",
        ],
        null
      ),

    maturedOn:
      getValue(
        source,
        [
          "maturity_date",
          "matured_on",
        ],
        null
      ),

    date:
      getValue(
        source,
        [
          "approved_date",
          "paid_date",
          "created_date",
        ],
        null
      ),

    principal,

    interestEarned,

    gstAmount,

    penalty,

    netSettlementAmount,

    status: (() => {
      const statusValue = getValue(
        source,
        [
          "status_name",
          "status",
          "settlement_status",
        ],
        STATUS.PENDING
      );

      const remarks = String(
        getValue(source, ["remarks"], "") || ""
      ).toLowerCase();

      if (
        remarks.includes("sent to super admin") ||
        remarks.includes("waiting for super admin")
      ) {
        return STATUS.AWAITING_SUPERADMIN;
      }

      return normalizeStatus(statusValue);
    })(),

    type: "Tenure Timeout",

    raw: source,
  };
};

const normalizePrecloseItem = (
  row,
  index
) => {
  const source =
    row?.request ||
    row?.preclose ||
    row?.details ||
    row;

  const principal =
    toNumber(
      getValue(
        source,
        [
          "principal_amount",
          "investment_amount",
          "principal",
          "amount",
        ],
        0
      )
    );

  const interestEarned =
    toNumber(
      getValue(
        source,
        [
          "interest_amount",
          "interest_earned",
          "expected_interest_amount",
        ],
        0
      )
    );

  const penalty =
    toNumber(
      getValue(
        source,
        [
          "penalty_amount",
          "penalty",
        ],
        0
      )
    );

  const gstAmount =
    toNumber(
      getValue(
        source,
        [
          "gst_amount",
          "gst",
        ],
        Number(
          (
            interestEarned *
            GST_RATE
          ).toFixed(2)
        )
      )
    );

  const netSettlementAmount =
    toNumber(
      getValue(
        source,
        [
          "net_settlement_amount",
          "net_payable",
          "settlement_amount",
        ],
        Number(
          (
            principal +
            interestEarned -
            gstAmount -
            penalty
          ).toFixed(2)
        )
      )
    );

  return {
    id: getValue(
      source,
      [
        "request_id",
        "preclose_request_id",
        "id",
      ],
      index
    ),

    investmentId:
      getValue(
        source,
        [
          "investment_id",
          "investment_code",
        ],
        "-"
      ),

    investor:
      getValue(
        source,
        [
          "investor_name",
          "full_name",
          "investor",
        ],
        "-"
      ),

    investorId:
      getValue(
        source,
        [
          "investor_id",
        ],
        "-"
      ),

    branch:
      getValue(
        source,
        [
          "branch_name",
          "branch",
        ],
        "-"
      ),

    bondNumber:
      getValue(
        source,
        [
          "bond_number",
          "bond_id",
        ],
        "-"
      ),

    investmentDate:
      getValue(
        source,
        [
          "investment_date",
        ],
        null
      ),

    requestedDate:
      getValue(
        source,
        [
          "requested_date",
        ],
        null
      ),

    reason:
      getValue(
        source,
        [
          "preclose_reason",
          "reason",
          "remarks",
        ],
        "-"
      ),

    principal,

    interestEarned,

    gstAmount,

    penalty,

    netSettlementAmount,

    status:
      normalizeStatus(
        getValue(
          source,
          [
            "request_status",
            "status_name",
            "status",
          ],
          STATUS.PENDING
        )
      ),

    type: "Pre-Close",

    raw: source,
  };
};

const normalizeClosedItem = (
  row,
  index
) => {
  const source =
    row?.settlement ||
    row?.details ||
    row;

  const typeValue =
    String(
      getValue(
        source,
        [
          "settlement_type",
          "type",
        ],
        ""
      )
    )
      .trim()
      .toUpperCase();

  const type =
    typeValue === "PRECLOSE" ||
    typeValue === "PRE_CLOSE" ||
    typeValue === "PRE-CLOSE"
      ? "Pre-Close"
      : "Tenure Timeout";

  const principal =
    toNumber(
      getValue(
        source,
        [
          "principal_amount",
          "principal",
          "investment_amount",
        ],
        0
      )
    );

  const interestEarned =
    toNumber(
      getValue(
        source,
        [
          "interest_amount",
          "interest_earned",
        ],
        0
      )
    );

  const gstAmount =
    toNumber(
      getValue(
        source,
        [
          "gst_amount",
          "gst",
        ],
        Number(
          (
            interestEarned *
            GST_RATE
          ).toFixed(2)
        )
      )
    );

  const penalty =
    toNumber(
      getValue(
        source,
        [
          "penalty_amount",
          "penalty",
        ],
        0
      )
    );

  const netSettlementAmount =
    toNumber(
      getValue(
        source,
        [
          "net_settlement_amount",
          "net_settlement",
          "net_payable",
        ],
        Number(
          (
            principal +
            interestEarned -
            gstAmount -
            penalty
          ).toFixed(2)
        )
      )
    );

  return {
    id: getValue(
      source,
      [
        "settlement_id",
        "id",
      ],
      index
    ),

    investmentId:
      getValue(
        source,
        [
          "investment_id",
          "investment_code",
        ],
        "-"
      ),

    investor:
      getValue(
        source,
        [
          "investor_name",
          "full_name",
          "investor",
        ],
        "-"
      ),

    investorId:
      getValue(
        source,
        [
          "investor_id",
        ],
        "-"
      ),

    branch:
      getValue(
        source,
        [
          "branch_name",
          "branch",
        ],
        "-"
      ),

    bondNumber:
      getValue(
        source,
        [
          "bond_number",
          "bond_id",
        ],
        "-"
      ),

    date:
      getValue(
        source,
        [
          "approved_date",
          "paid_date",
          "created_date",
        ],
        null
      ),

    principal,

    interestEarned,

    gstAmount,

    penalty,

    netSettlementAmount,

    status:
      normalizeStatus(
        getValue(
          source,
          [
            "status_name",
            "status",
          ],
          STATUS.APPROVED
        )
      ),

    type,

    raw: source,
  };
};

export default function Settlement() {
  const [
    activeTab,
    setActiveTab,
  ] = useState("tenure");

  const [
    tenureItems,
    setTenureItems,
  ] = useState([]);

  const [
    precloseItems,
    setPrecloseItems,
  ] = useState([]);

  const [
    closedItems,
    setClosedItems,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    confirmAction,
    setConfirmAction,
  ] = useState(null);

  const loadSettlementData =
    async () => {
      try {
        setLoading(true);
        setError("");

        const [
          tenureResponse,
          precloseResponse,
          closedResponse,
        ] =
          await Promise.all([
            getTenureTimeoutSettlements(
              {
                limit: 100,
                offset: 0,
              }
            ),

            getPrecloseRequests({
              limit: 100,
              offset: 0,
            }),

            getClosedSettlements({
              limit: 100,
              offset: 0,
            }),
          ]);

        const tenureList =
          getList(
            tenureResponse
          );

        const precloseList =
          getList(
            precloseResponse
          );

        const closedList =
          getList(
            closedResponse
          );

        setTenureItems(
          tenureList.map(
            normalizeTenureItem
          )
        );

        setPrecloseItems(
          precloseList.map(
            normalizePrecloseItem
          )
        );

        setClosedItems(
          closedList.map(
            normalizeClosedItem
          )
        );
      } catch (err) {
        console.error(
          "Failed to load settlement data:",
          err
        );

        setError(
          err?.message ||
            "Failed to load settlement data."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadSettlementData();
  }, []);

  const openConfirm = (
    kind,
    item
  ) => {
    setConfirmAction({
      kind,
      item,
    });
  };

  const closeConfirm = () => {
    if (actionLoading) {
      return;
    }

    setConfirmAction(null);
  };

  const handleConfirm =
    async () => {
      if (!confirmAction) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        const {
          kind,
          item,
        } = confirmAction;

        if (
          kind ===
          "tenureApprove"
        ) {
          await approveTenureTimeoutSettlement(
            item.id
          );
        }

        if (
          kind ===
          "tenureReject"
        ) {
          await rejectTenureTimeoutSettlement(
            item.id
          );
        }

        if (
          kind ===
          "precloseApprove"
        ) {
          await approvePrecloseRequest(
            item.id
          );
        }

        if (
          kind ===
          "precloseReject"
        ) {
          await rejectPrecloseRequest(
            item.id
          );
        }

        setConfirmAction(null);

        await loadSettlementData();
      } catch (err) {
        console.error(
          "Settlement action failed:",
          err
        );

        setError(
          err?.message ||
            "Settlement action failed."
        );
      } finally {
        setActionLoading(false);
      }
    };

  const pendingTenureCount =
    tenureItems.filter(
      (item) =>
        item.status ===
        STATUS.PENDING
    ).length;

  const pendingPrecloseCount =
    precloseItems.filter(
      (item) =>
        item.status ===
        STATUS.PENDING
    ).length;

  const totalRequests =
    tenureItems.length +
    precloseItems.length;

  const approvedCount =
    closedItems.filter(
      (item) =>
        item.status === STATUS.APPROVED ||
        item.status === STATUS.PAID
    ).length;

  const rejectedCount =
    tenureItems.filter(
      (item) =>
        item.status ===
        STATUS.REJECTED
    ).length;

  const totalNetSettlement =
    closedItems.reduce(
      (sum, item) =>
        sum +
        Number(
          item.netSettlementAmount ||
            0
        ),
      0
    );

  const activeItem =
    confirmAction?.item;

  return (
    <div className="admin-page settlement-page">

      <div className="settlement-stat-grid">

        <div className="settlement-stat-card settlement-stat-card--blue">
          <span>
            Total Requests
          </span>

          <strong>
            {totalRequests}
          </strong>

          <small>
            Tenure + Pre-Close
          </small>
        </div>

        <div className="settlement-stat-card settlement-stat-card--yellow">
          <span>
            Pending
          </span>

          <strong>
            {pendingTenureCount +
              pendingPrecloseCount}
          </strong>

          <small>
            Awaiting admin action
          </small>
        </div>

        <div className="settlement-stat-card settlement-stat-card--green">
          <span>
            Approved
          </span>

          <strong>
            {approvedCount}
          </strong>

          <small>
            Closed settlements
          </small>
        </div>

        <div className="settlement-stat-card settlement-stat-card--red">
          <span>
            Rejected
          </span>

          <strong>
            {rejectedCount}
          </strong>

          <small>
            Rejected requests
          </small>
        </div>

        <div className="settlement-stat-card settlement-stat-card--teal">
          <span>
            Net Settlement
          </span>

          <strong>
            {formatINR(
              totalNetSettlement
            )}
          </strong>

          <small>
            Closed settlements
          </small>
        </div>

      </div>

      {error && (
        <div className="admin-error-box">
          {error}
        </div>
      )}

      <div className="settlement-tabs">

        <button
          type="button"
          className={`settlement-tab ${
            activeTab === "tenure"
              ? "settlement-tab--active"
              : ""
          }`}
          onClick={() =>
            setActiveTab("tenure")
          }
        >
          Tenure Timeout

          <span className="settlement-tab__count">
            {pendingTenureCount}
          </span>
        </button>

        <button
          type="button"
          className={`settlement-tab ${
            activeTab === "preclose"
              ? "settlement-tab--active"
              : ""
          }`}
          onClick={() =>
            setActiveTab("preclose")
          }
        >
          Pre-Close Requests

          <span className="settlement-tab__count">
            {pendingPrecloseCount}
          </span>
        </button>

        <button
          type="button"
          className={`settlement-tab ${
            activeTab === "closed"
              ? "settlement-tab--active"
              : ""
          }`}
          onClick={() =>
            setActiveTab("closed")
          }
        >
          Closed Settlements

          <span className="settlement-tab__count">
            {closedItems.length}
          </span>
        </button>

      </div>

      {loading ? (
        <div className="settlement-empty-state">
          <RefreshCw
            size={20}
            className="settlement-loading-icon"
          />

          <p>
            Loading settlement
            requests...
          </p>
        </div>
      ) : (
        <>

          {activeTab === "tenure" && (
            <div className="settlement-card-list">

              {tenureItems.length === 0 && (
                <div className="settlement-empty-state">
                  <Archive size={20} />

                  <p>
                    No tenure timeout
                    settlements found.
                  </p>
                </div>
              )}

              {tenureItems.map(
                (item) => (
                  <div
                    className="settlement-card"
                    key={`tenure-${item.id}`}
                  >

                    <div className="settlement-card-header">

                      <div className="settlement-card-header__left">

                        <span className="settlement-bond-link">
                          {item.bondNumber}
                        </span>

                        <span
                          className={`settlement-badge settlement-badge--${statusClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>

                        <span className="settlement-badge settlement-badge--preclose">
                          Tenure Timeout
                        </span>

                      </div>

                      <div className="settlement-card-header__actions">

                        {item.status ===
                          STATUS.PENDING && (
                          <>
                            <button
                              type="button"
                              className="admin-btn admin-btn--success admin-btn--pill"
                              disabled={
                                actionLoading
                              }
                              onClick={() =>
                                openConfirm(
                                  "tenureApprove",
                                  item
                                )
                              }
                            >
                              <Send
                                size={14}
                              />
                              Send to Super Admin
                            </button>

                            <button
                              type="button"
                              className="admin-btn admin-btn--danger admin-btn--pill"
                              disabled={
                                actionLoading
                              }
                              onClick={() =>
                                openConfirm(
                                  "tenureReject",
                                  item
                                )
                              }
                            >
                              <Ban
                                size={14}
                              />
                              Reject
                            </button>
                          </>
                        )}

                        <StatusPill
                          status={
                            item.status
                          }
                        />

                      </div>

                    </div>

                    <div className="settlement-card-body">

                      <div className="settlement-info-grid">

                        <InfoItem
                          label="Investor"
                          value={
                            item.investor
                          }
                        />

                        <InfoItem
                          label="Investor ID"
                          value={
                            item.investorId
                          }
                        />

                        <InfoItem
                          label="Branch"
                          value={
                            item.branch
                          }
                        />

                        <InfoItem
                          label="Bond Number"
                          value={
                            item.bondNumber
                          }
                        />

                        <InfoItem
                          label="Investment Date"
                          value={formatDate(
                            item.investmentDate
                          )}
                        />

                        <InfoItem
                          label="Matured On"
                          value={formatDate(
                            item.maturedOn
                          )}
                        />

                      </div>

                      <div className="settlement-breakdown-list">

                        <BreakdownRow
                          label="Principal"
                          value={formatINR(
                            item.principal
                          )}
                        />

                        <BreakdownRow
                          label="Interest Earned"
                          value={formatINR(
                            item.interestEarned
                          )}
                        />

                        <BreakdownRow
                          label="GST (18% on interest)"
                          value={`-${formatINR(
                            item.gstAmount
                          )}`}
                          tone="penalty"
                        />

                        <BreakdownRow
                          label="Net Settlement"
                          value={formatINR(
                            item.netSettlementAmount
                          )}
                          tone="total"
                        />

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

          {activeTab === "preclose" && (
            <div className="settlement-card-list">

              {precloseItems.length === 0 && (
                <div className="settlement-empty-state">
                  <Archive size={20} />

                  <p>
                    No pre-close
                    requests available.
                  </p>
                </div>
              )}

              {precloseItems.map(
                (item) => (
                  <div
                    className="settlement-card"
                    key={`preclose-${item.id}`}
                  >

                    <div className="settlement-card-header">

                      <div className="settlement-card-header__left">

                        <span className="settlement-bond-link">
                          {item.bondNumber}
                        </span>

                        <span
                          className={`settlement-badge settlement-badge--${statusClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>

                        <span className="settlement-badge settlement-badge--preclose">
                          Pre-Close
                        </span>

                      </div>

                      <div className="settlement-card-header__actions">

                        {item.status ===
                          STATUS.PENDING && (
                          <>
                            <button
                              type="button"
                              className="admin-btn admin-btn--success admin-btn--pill"
                              disabled={
                                actionLoading
                              }
                              onClick={() =>
                                openConfirm(
                                  "precloseApprove",
                                  item
                                )
                              }
                            >
                              <Send
                                size={14}
                              />
                              Send to Super Admin
                            </button>

                            <button
                              type="button"
                              className="admin-btn admin-btn--danger admin-btn--pill"
                              disabled={
                                actionLoading
                              }
                              onClick={() =>
                                openConfirm(
                                  "precloseReject",
                                  item
                                )
                              }
                            >
                              <Ban
                                size={14}
                              />
                              Reject
                            </button>
                          </>
                        )}

                        <StatusPill
                          status={
                            item.status
                          }
                        />

                      </div>

                    </div>

                    <div className="settlement-card-body">

                      <div className="settlement-info-grid">

                        <InfoItem
                          label="Investor"
                          value={
                            item.investor
                          }
                        />

                        <InfoItem
                          label="Investor ID"
                          value={
                            item.investorId
                          }
                        />

                        <InfoItem
                          label="Branch"
                          value={
                            item.branch
                          }
                        />

                        <InfoItem
                          label="Bond Number"
                          value={
                            item.bondNumber
                          }
                        />

                        <InfoItem
                          label="Investment Date"
                          value={formatDate(
                            item.investmentDate
                          )}
                        />

                        <InfoItem
                          label="Requested Date"
                          value={formatDate(
                            item.requestedDate
                          )}
                        />

                      </div>

                      <div className="settlement-breakdown-list">

                        <BreakdownRow
                          label="Principal"
                          value={formatINR(
                            item.principal
                          )}
                        />

                        <BreakdownRow
                          label="Interest Earned"
                          value={formatINR(
                            item.interestEarned
                          )}
                        />

                        <BreakdownRow
                          label="GST (18% on interest)"
                          value={`-${formatINR(
                            item.gstAmount
                          )}`}
                          tone="penalty"
                        />

                        <BreakdownRow
                          label="Penalty"
                          value={`-${formatINR(
                            item.penalty
                          )}`}
                          tone="penalty"
                        />

                        <BreakdownRow
                          label="Net Settlement"
                          value={formatINR(
                            item.netSettlementAmount
                          )}
                          tone="total"
                        />

                      </div>

                      <div className="settlement-reason-box">
                        <strong>
                          Reason:
                        </strong>

                        <span>
                          {item.reason}
                        </span>
                      </div>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

          {activeTab === "closed" && (
            <div className="settlement-card-list">

              {closedItems.length === 0 && (
                <div className="settlement-empty-state">
                  <Archive size={20} />

                  <p>
                    No closed settlements
                    yet.
                  </p>
                </div>
              )}

              {closedItems.map(
                (item) => (
                  <div
                    className="settlement-card"
                    key={`closed-${item.type}-${item.id}`}
                  >

                    <div className="settlement-card-header">

                      <div className="settlement-card-header__left">

                        <span className="settlement-bond-link">
                          {item.bondNumber}
                        </span>

                        <span
                          className={`settlement-badge settlement-badge--${statusClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>

                        <span className="settlement-badge settlement-badge--preclose">
                          {item.type}
                        </span>

                      </div>

                      <StatusPill
                        status={
                          item.status
                        }
                      />

                    </div>

                    <div className="settlement-card-body">

                      <div className="settlement-info-grid">

                        <InfoItem
                          label="Investor"
                          value={
                            item.investor
                          }
                        />

                        <InfoItem
                          label="Investor ID"
                          value={
                            item.investorId
                          }
                        />

                        <InfoItem
                          label="Branch"
                          value={
                            item.branch
                          }
                        />

                        <InfoItem
                          label="Bond Number"
                          value={
                            item.bondNumber
                          }
                        />

                        <InfoItem
                          label="Settlement Date"
                          value={formatDate(
                            item.date
                          )}
                        />

                        <InfoItem
                          label="Type"
                          value={
                            item.type
                          }
                        />

                      </div>

                      <div className="settlement-breakdown-list">

                        <BreakdownRow
                          label="Principal"
                          value={formatINR(
                            item.principal
                          )}
                        />

                        <BreakdownRow
                          label="Interest Earned"
                          value={formatINR(
                            item.interestEarned
                          )}
                        />

                        <BreakdownRow
                          label="GST (18% on interest)"
                          value={`-${formatINR(
                            item.gstAmount
                          )}`}
                          tone="penalty"
                        />

                        {item.penalty >
                          0 && (
                          <BreakdownRow
                            label="Early Penalty"
                            value={`-${formatINR(
                              item.penalty
                            )}`}
                            tone="penalty"
                          />
                        )}

                        <BreakdownRow
                          label="Net Payable"
                          value={formatINR(
                            item.netSettlementAmount
                          )}
                          tone="total"
                        />

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </>
      )}

      {confirmAction && (
        <div
          className="settlement-modal-overlay"
          onClick={closeConfirm}
        >
          <div
            className="settlement-modal-box"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="settlement-modal-header">

              <div className="settlement-modal-header__title">

                <AlertTriangle
                  size={18}
                />

                <h3>
                  {confirmAction.kind ===
                    "tenureReject" ||
                  confirmAction.kind ===
                    "precloseReject"
                    ? "Reject Settlement"
                    : "Send to Super Admin"}
                </h3>

              </div>

              <button
                type="button"
                className="settlement-modal-close-btn"
                onClick={
                  closeConfirm
                }
                disabled={
                  actionLoading
                }
              >
                <X size={16} />
              </button>

            </div>

            <div className="settlement-modal-body">

              {activeItem && (
                <>
                  <p>
                    {confirmAction.kind ===
                      "tenureReject" ||
                    confirmAction.kind ===
                      "precloseReject"
                      ? `Reject settlement for ${activeItem.investor} on bond ${activeItem.bondNumber}?`
                      : `Send ${activeItem.type || "settlement"} for ${activeItem.investor} on bond ${activeItem.bondNumber} to Super Admin for approval?`}
                  </p>

                  <div className="settlement-confirm-info">

                    <div>
                      <span>
                        Investor
                      </span>

                      <strong>
                        {
                          activeItem.investor
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Investor ID
                      </span>

                      <strong>
                        {
                          activeItem.investorId
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Bond
                      </span>

                      <strong>
                        {
                          activeItem.bondNumber
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Type
                      </span>

                      <strong>
                        {
                          activeItem.type
                        }
                      </strong>
                    </div>

                  </div>

                  <div className="settlement-confirm-breakdown">

                    <div className="settlement-confirm-breakdown__row">
                      <span>
                        Principal
                      </span>

                      <span className="mono">
                        {formatINR(
                          activeItem.principal
                        )}
                      </span>
                    </div>

                    <div className="settlement-confirm-breakdown__row">
                      <span>
                        Interest Earned
                      </span>

                      <span className="mono">
                        {formatINR(
                          activeItem.interestEarned
                        )}
                      </span>
                    </div>

                    <div className="settlement-confirm-breakdown__row settlement-confirm-breakdown__row--gst">
                      <span>
                        GST
                      </span>

                      <span className="mono">
                        -
                        {formatINR(
                          activeItem.gstAmount
                        )}
                      </span>
                    </div>

                    <div className="settlement-confirm-breakdown__row settlement-confirm-breakdown__row--total">
                      <span>
                        Net Settlement
                      </span>

                      <span className="mono">
                        {formatINR(
                          activeItem.netSettlementAmount
                        )}
                      </span>
                    </div>

                  </div>
                </>
              )}

            </div>

            <div className="settlement-modal-footer">

              <button
                type="button"
                className="admin-btn admin-btn--outline"
                onClick={
                  closeConfirm
                }
                disabled={
                  actionLoading
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className={`admin-btn ${
                  confirmAction.kind ===
                    "tenureReject" ||
                  confirmAction.kind ===
                    "precloseReject"
                    ? "admin-btn--danger"
                    : "admin-btn--success"
                }`}
                disabled={
                  actionLoading
                }
                onClick={
                  handleConfirm
                }
              >
                {actionLoading
                  ? "Processing..."
                  : confirmAction.kind ===
                      "tenureReject" ||
                    confirmAction.kind ===
                      "precloseReject"
                  ? "Reject"
                  : "Confirm & Send"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}