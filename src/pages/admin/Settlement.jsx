import React, { useEffect, useMemo, useState } from "react";
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
  getPendingTenureExtensions,
  approveTenureExtension,
  rejectTenureExtension,
} from "../../services/admin/settlementService";

import "../../Styles/Admin/Settlement.css";

const GST_RATE = 0.18;

const STATUS = {
  PENDING: "Pending",
  AWAITING_SUPERADMIN: "Awaiting Super Admin",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const getValue = (row, keys, fallback = null) => {
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

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const normalizeStatus = (value) => {
  if (!value) {
    return STATUS.PENDING;
  }

  const status = String(value)
    .trim()
    .toLowerCase();

  if (
    status === "approved" ||
    status === "settled" ||
    status === "completed"
  ) {
    return STATUS.APPROVED;
  }

  if (
    status === "rejected" ||
    status === "declined"
  ) {
    return STATUS.REJECTED;
  }

  if (
    status.includes("awaiting") ||
    status.includes("super admin") ||
    status.includes("sent")
  ) {
    return STATUS.AWAITING_SUPERADMIN;
  }

  return STATUS.PENDING;
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusClass = (status) =>
  String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "-");

function InfoItem({ label, value }) {
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

function StatusPill({ status }) {
  if (status === STATUS.AWAITING_SUPERADMIN) {
    return (
      <span className="admin-action-muted admin-action-muted--waiting">
        <Clock size={14} />
        Waiting for Super Admin approval
      </span>
    );
  }

  if (status === STATUS.APPROVED) {
    return (
      <span className="admin-action-muted">
        <CheckCircle2 size={14} />
        Settled
      </span>
    );
  }

  if (status === STATUS.REJECTED) {
    return (
      <span className="admin-action-muted">
        <XCircle size={14} />
        Rejected
      </span>
    );
  }

  return null;
}

const normalizeTenureItem = (row, index) => {
  const principal = toNumber(
    getValue(
      row,
      [
        "principal",
        "principal_amount",
        "investment_amount",
        "amount",
        "invested_amount",
        "investment_value",
        "principalAmount",
      ],
      0
    )
  );

  const interestEarned = toNumber(
    getValue(
      row,
      [
        "interest_earned",
        "interestEarned",
        "total_interest",
        "interest_amount",
        "earned_interest",
        "expected_interest_amount",
        "interest",
        "total_interest_earned",
      ],
      0
    )
  );

  const backendGst = getValue(
    row,
    [
      "gst",
      "gst_amount",
      "gstAmount",
      "gst_on_interest",
      "gst_amount_on_interest",
    ],
    null
  );

  const gstAmount =
    backendGst !== null
      ? toNumber(backendGst)
      : Number(
          (
            interestEarned * GST_RATE
          ).toFixed(2)
        );

  const backendNet = getValue(
    row,
    [
      "net_settlement_amount",
      "net_settlement",
      "netSettlementAmount",
      "net_payable",
      "net_amount",
      "settlement_amount",
    ],
    null
  );

  const netSettlementAmount =
    backendNet !== null
      ? toNumber(backendNet)
      : Number(
          (
            principal +
            interestEarned -
            gstAmount
          ).toFixed(2)
        );

  return {
    id: getValue(
      row,
      [
        "request_id",
        "requestId",
        "settlement_id",
        "settlementId",
        "id",
      ],
      index
    ),

    investmentId: getValue(
      row,
      [
        "investment_id",
        "investmentId",
        "investment_code",
      ],
      "-"
    ),

    bondNumber: getValue(
      row,
      [
        "bond_number",
        "bondNumber",
        "bond_id",
        "bond",
        "bond_code",
        "bond_no",
      ],
      "-"
    ),

    investor: getValue(
      row,
      [
        "investor_name",
        "investorName",
        "full_name",
        "investor_full_name",
        "name",
        "investor",
        "customer_name",
      ],
      "-"
    ),

    investorId: getValue(
      row,
      [
        "investor_id",
        "investorId",
        "investor_registration_id",
        "investor_registration_number",
        "investor_code",
        "registration_id",
        "customer_id",
      ],
      "-"
    ),

    branch: getValue(
      row,
      [
        "branch_name",
        "branchName",
        "branch",
        "branch_name_text",
        "service_location_name",
        "location_name",
        "branchNameText",
      ],
      "-"
    ),

    maturedOn: getValue(
      row,
      [
        "matured_on",
        "maturedOn",
        "maturity_date",
        "maturityDate",
        "mature_date",
        "matured_date",
      ],
      null
    ),

    investmentDate: getValue(
      row,
      [
        "investment_date",
        "invested_on",
        "investmentDate",
        "start_date",
        "bond_start_date",
      ],
      null
    ),

    principal,
    interestEarned,
    gstAmount,
    netSettlementAmount,

    status: normalizeStatus(
      getValue(
        row,
        [
          "status",
          "status_name",
          "approval_status",
          "settlement_status",
          "settlement_status_name",
        ],
        STATUS.PENDING
      )
    ),

    raw: row,
  };
};

export default function Settlement() {
  const [activeTab, setActiveTab] =
    useState("tenure");

  const [tenureItems, setTenureItems] =
    useState([]);

  const [precloseItems, setPrecloseItems] =
    useState([]);

  const [closedItems, setClosedItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [confirmAction, setConfirmAction] =
    useState(null);

  const loadTenureItems = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getPendingTenureExtensions({
          limit: 100,
          offset: 0,
        });

      console.log(
        "Settlement API response:",
        response
      );

      let list = [];

      if (Array.isArray(response)) {
        list = response;
      } else if (
        Array.isArray(response?.data)
      ) {
        list = response.data;
      } else if (
        Array.isArray(response?.items)
      ) {
        list = response.items;
      }

      console.log(
        "Settlement raw list:",
        list
      );

      const normalized =
        list.map(
          normalizeTenureItem
        );

      console.log(
        "Settlement normalized list:",
        normalized
      );

      setTenureItems(normalized);
    } catch (err) {
      console.error(
        "Failed to load settlements:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load settlement requests."
      );

      setTenureItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenureItems();
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

  const handleConfirm = async () => {
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
        kind === "tenureApprove"
      ) {
        await approveTenureExtension(
          item.id,
          null
        );
      }

      if (
        kind === "tenureReject"
      ) {
        await rejectTenureExtension(
          item.id,
          "Rejected by Admin"
        );
      }

      setConfirmAction(null);

      await loadTenureItems();
    } catch (err) {
      console.error(
        "Settlement action failed:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Settlement action failed."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const closed = useMemo(() => {
    return [
      ...tenureItems
        .filter(
          (item) =>
            item.status ===
              STATUS.APPROVED ||
            item.status ===
              STATUS.REJECTED
        )
        .map((item) => ({
          ...item,
          type: "Tenure",
          date: item.maturedOn,
          penalty: 0,
        })),

      ...closedItems,
    ];
  }, [
    tenureItems,
    closedItems,
  ]);

  const activeItem =
    confirmAction?.item;

  const totalRequests =
    tenureItems.length;

  const pendingCount =
    tenureItems.filter(
      (item) => item.status === STATUS.PENDING
    ).length;

  const awaitingCount =
    tenureItems.filter(
      (item) => item.status === STATUS.AWAITING_SUPERADMIN
    ).length;

  const approvedCount =
    tenureItems.filter(
      (item) => item.status === STATUS.APPROVED
    ).length;

  const rejectedCount =
    tenureItems.filter(
      (item) => item.status === STATUS.REJECTED
    ).length;

  const totalNetSettlement =
    tenureItems.reduce(
      (sum, item) =>
        sum + Number(item.netSettlementAmount || 0),
      0
    );

  return (
    <div className="admin-page settlement-page">
      <div className="settlement-stat-grid">
        <div className="settlement-stat-card settlement-stat-card--blue">
          <span>Total Requests</span>
          <strong>{totalRequests}</strong>
          <small>All tenure requests</small>
        </div>

        <div className="settlement-stat-card settlement-stat-card--amber">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
          <small>Waiting for admin action</small>
        </div>

        <div className="settlement-stat-card settlement-stat-card--purple">
          <span>Awaiting Approval</span>
          <strong>{awaitingCount}</strong>
          <small>Sent to Super Admin</small>
        </div>

        <div className="settlement-stat-card settlement-stat-card--green">
          <span>Approved</span>
          <strong>{approvedCount}</strong>
          <small>Settled requests</small>
        </div>

        <div className="settlement-stat-card settlement-stat-card--red">
          <span>Rejected</span>
          <strong>{rejectedCount}</strong>
          <small>Rejected requests</small>
        </div>

        <div className="settlement-stat-card settlement-stat-card--teal">
          <span>Net Settlement</span>
          <strong>{formatINR(totalNetSettlement)}</strong>
          <small>Current request value</small>
        </div>
      </div>

   



      {}

      {error && (
        <div className="admin-error-box">
          {error}
        </div>
      )}

      {}

      <div className="settlement-tabs">
        {}
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
            {
              tenureItems.filter(
                (item) =>
                  item.status ===
                  STATUS.PENDING
              ).length
            }
          </span>
        </button>

        {}
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
            {precloseItems.length}
          </span>
        </button>

        {}
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
            {closed.length}
          </span>
        </button>
      </div>

      {}

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
          {}

          {activeTab === "tenure" && (
            <div className="settlement-card-list">
              {tenureItems.length === 0 && (
                <div className="settlement-empty-state">
                  <Archive
                    size={20}
                  />

                  <p>
                    No tenure timeout
                    settlements found.
                  </p>
                </div>
              )}

              {tenureItems.map(
                (item) => {
                  const gstAmount =
                    item.gstAmount;

                  const net =
                    item.netSettlementAmount;

                  return (
                    <div
                      className="settlement-card"
                      key={item.id}
                    >
                      {}

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

                                Approve Settlement
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

                      {}

                      <div className="settlement-card-body">
                        {}

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

                        {}

                        <div className="settlement-breakdown-list">
                          <BreakdownRow
                            label="Principal"
                            value={formatINR(
                              item.principal
                            )}
                          />

                          <BreakdownRow
                            label="Total Interest Earned"
                            value={formatINR(
                              item.interestEarned
                            )}
                          />

                          <BreakdownRow
                            label="GST (18% on interest)"
                            value={`-${formatINR(
                              gstAmount
                            )}`}
                            tone="penalty"
                          />

                          <BreakdownRow
                            label="Net Settlement Amount"
                            value={formatINR(
                              net
                            )}
                            tone="total"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {}

          {activeTab ===
            "preclose" && (
            <div className="settlement-card-list">
              <div className="settlement-empty-state">
                <Archive
                  size={20}
                />

                <p>
                  No pre-close settlement
                  requests available.
                </p>
              </div>
            </div>
          )}

          {}

          {activeTab === "closed" && (
            <div className="settlement-card-list">
              {closed.length === 0 ? (
                <div className="settlement-empty-state">
                  <Archive
                    size={20}
                  />

                  <p>
                    No closed settlements
                    yet.
                  </p>
                </div>
              ) : (
                closed.map(
                  (item) => {
                    const gstAmount =
                      toNumber(
                        item.gstAmount,
                        Number(
                          (
                            item.interestEarned *
                            GST_RATE
                          ).toFixed(2)
                        )
                      );

                    const netAfterGst =
                      toNumber(
                        item.netSettlementAmount,
                        Number(
                          (
                            item.principal +
                            item.interestEarned -
                            gstAmount -
                            (item.penalty ||
                              0)
                          ).toFixed(2)
                        )
                      );

                    return (
                      <div
                        className="settlement-card"
                        key={`${item.type}-${item.id}`}
                      >
                        {}

                        <div className="settlement-card-header">
                          <div className="settlement-card-header__left">
                            <span className="settlement-bond-link">
                              {
                                item.bondNumber
                              }
                            </span>

                            <span
                              className={`settlement-badge settlement-badge--${statusClass(
                                item.status
                              )}`}
                            >
                              {
                                item.status
                              }
                            </span>

                            <span className="settlement-badge settlement-badge--preclose">
                              {
                                item.type
                              }
                            </span>
                          </div>

                          <StatusPill
                            status={
                              item.status
                            }
                          />
                        </div>

                        {}

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
                              label="Date"
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
                                gstAmount
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
                                netAfterGst
                              )}
                              tone="total"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }
                )
              )}
            </div>
          )}
        </>
      )}

      {}

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
            {}

            <div className="settlement-modal-header">
              <div className="settlement-modal-header__title">
                <AlertTriangle
                  size={18}
                />

                <h3>
                  {confirmAction.kind ===
                  "tenureReject"
                    ? "Reject Settlement"
                    : "Send Settlement for Super Admin Approval"}
                </h3>
              </div>

              <button
                type="button"
                className="settlement-modal-close-btn"
                onClick={closeConfirm}
                disabled={
                  actionLoading
                }
              >
                <X size={16} />
              </button>
            </div>

            {}

            <div className="settlement-modal-body">
              {activeItem && (
                <>
                  <p>
                    {confirmAction.kind ===
                    "tenureReject"
                      ? `Reject settlement for ${activeItem.investor} on bond ${activeItem.bondNumber}?`
                      : `Send the settlement for ${activeItem.investor} on bond ${activeItem.bondNumber} to Super Admin for approval?`}
                  </p>

                  {}

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
                        Branch
                      </span>

                      <strong>
                        {
                          activeItem.branch
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
                  </div>

                  {}

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
                        GST{" "}
                        <em>
                          (18% on interest)
                        </em>
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

            {}

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
                  "tenureReject"
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
                    "tenureReject"
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