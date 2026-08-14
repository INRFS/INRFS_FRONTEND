import React, { useEffect, useMemo, useState } from "react";
import {
  Send,
  CheckCircle2,
  Ban,
  X,
  AlertTriangle,
  Filter,
  Clock,
  RefreshCw,
} from "lucide-react";
import { StatusBadge, formatINR } from "../../shared/Shared";
import {
  getMonthlyInterest,
  approveMonthlyInterest,
  rejectMonthlyInterest,
  approveAllMonthlyInterest,
} from "../../services/admin/monthlyInterestService";
import "../../Styles/Admin/MontlyIntrest.css";

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

const normalizeStatus = (value) => {
  if (!value) return "Pending";

  const status = String(value).trim().toLowerCase();

  if (
    status === "approved" ||
    status === "active" ||
    status === "paid"
  ) {
    return status === "paid" ? "Paid" : "Approved";
  }

  if (
    status.includes("awaiting") ||
    status.includes("super admin")
  ) {
    return "Awaiting Approval";
  }

  if (
    status === "rejected" ||
    status === "reject"
  ) {
    return "Rejected";
  }

  return "Pending";
};

const formatDate = (value) => {
  if (!value) return "-";

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

const toISODate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const gstFor = (amount) =>
  Math.round(Number(amount || 0) * GST_RATE);

const netPayableFor = (amount) =>
  Number(amount || 0) - gstFor(amount);

const normalizeRow = (row, index) => {
  const amount = Number(
    getValue(
      row,
      [
        "interest_amount",
        "interestAmount",
        "interest",
        "amount",
        "interest_due",
        "interest_due_amount",
      ],
      0
    )
  );

  const dueDate = getValue(
    row,
    [
      "interest_due_date",
      "interestDueDate",
      "due_date",
      "dueDate",
      "payment_due_date",
    ],
    null
  );

  const investor = getValue(
    row,
    [
      "investor_name",
      "investorName",
      "full_name",
      "name",
      "investor",
    ],
    "-"
  );

  const bond = getValue(
    row,
    [
      "bond_number",
      "bondNumber",
      "bond_id",
      "bond",
    ],
    "-"
  );

  const id = getValue(
    row,
    [
      "interest_schedule_id",
      "interestScheduleId",
      "id",
      "schedule_id",
    ],
    index
  );

  return {
    id,
    investor,
    bond,
    amount,
    due: dueDate,
    dueLabel: formatDate(dueDate),
    ref: getValue(
      row,
      [
        "payment_reference",
        "paymentReference",
        "reference",
        "utr",
      ],
      "-"
    ),
    status: normalizeStatus(
      getValue(
        row,
        [
          "status",
          "status_name",
          "interest_status",
          "approval_status",
        ],
        "Pending"
      )
    ),
    raw: row,
  };
};

function DetailRow({ label, value, valueClass = "" }) {
  return (
    <div className="admin-detail-row">
      <span className="admin-detail-row__label">
        {label}
      </span>

      <span
        className={`admin-detail-row__value ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}

const getTodayISO = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function MonthlyInterest() {
  const [rows, setRows] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [step, setStep] = useState("details");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMonthlyInterest({
        interestDueDate: filterDate,
        limit: 100,
        offset: 0,
      });

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.items)
        ? response.items
        : [];

      setRows(list.map(normalizeRow));
    } catch (err) {
      setError(err.message || "Failed to load monthly interest");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterDate]);

  const groups = useMemo(() => {
    const map = {};

    rows.forEach((row) => {
      const key = row.due || "unknown";

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(row);
    });

    return Object.entries(map)
      .sort(
        ([a], [b]) =>
          new Date(a).getTime() -
          new Date(b).getTime()
      )
      .map(([due, groupRows]) => ({
        due,
        dueLabel:
          groupRows[0]?.dueLabel || formatDate(due),
        rows: groupRows,
        total: groupRows.reduce(
          (sum, row) => sum + row.amount,
          0
        ),
        netTotal: groupRows.reduce(
          (sum, row) =>
            sum + netPayableFor(row.amount),
          0
        ),
      }));
  }, [rows]);

  const visibleGroups = groups;

  const pendingRows = visibleGroups
    .flatMap((group) => group.rows)
    .filter((row) => row.status === "Pending");

  const totalInterest = rows.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );

  const pendingCount = rows.filter(
    (row) => row.status === "Pending"
  ).length;

  const approvedCount = rows.filter(
    (row) => row.status === "Approved" || row.status === "Paid"
  ).length;

  const rejectedCount = rows.filter(
    (row) => row.status === "Rejected"
  ).length;

  const totalNetPayable = rows.reduce(
    (sum, row) => sum + Number(netPayableFor(row.amount) || 0),
    0
  );

  const openConfirm = (type, row) => {
    setConfirmAction({
      type,
      row,
    });

    setStep(
      type === "approveAllPending"
        ? "confirm"
        : "details"
    );
  };

  const closeConfirm = () => {
    setConfirmAction(null);
    setStep("details");
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    try {
      setActionLoading(true);
      setError("");

      const {
        type,
        row,
      } = confirmAction;

      if (type === "approve") {
        await approveMonthlyInterest(row.id);
      }

      if (type === "reject") {
        await rejectMonthlyInterest(
          row.id,
          "Rejected by Admin",
          null
        );
      }

      if (type === "approveAllPending") {
        const dueDate =
          filterDate ||
          toISODate(row[0]?.due);

        if (!dueDate) {
          throw new Error(
            "Please select a due date before approving all."
          );
        }

        await approveAllMonthlyInterest(
          dueDate
        );
      }

      closeConfirm();
      await loadData();
    } catch (err) {
      setError(
        err.message ||
          "Action could not be completed."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const activeRow =
    confirmAction?.row;

  return (
    <div className="admin-page monthly-interest-page">
      <div className="monthly-interest-stats">
        <div className="monthly-interest-stat monthly-interest-stat--blue">
          <span>Total Interest</span>
          <strong>{formatINR(totalInterest)}</strong>
          <small>All interest payments</small>
        </div>

        <div className="monthly-interest-stat monthly-interest-stat--amber">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
          <small>Waiting for approval</small>
        </div>

        <div className="monthly-interest-stat monthly-interest-stat--green">
          <span>Approved</span>
          <strong>{approvedCount}</strong>
          <small>Approved or paid</small>
        </div>

        <div className="monthly-interest-stat monthly-interest-stat--red">
          <span>Rejected</span>
          <strong>{rejectedCount}</strong>
          <small>Rejected payments</small>
        </div>

        <div className="monthly-interest-stat monthly-interest-stat--purple">
          <span>Net Payable</span>
          <strong>{formatINR(totalNetPayable)}</strong>
          <small>After GST deduction</small>
        </div>
      </div>

      <div className="admin-page-actions admin-page-actions--between monthly-interest-header">


        <div className="admin-header-actions">
          <label className="admin-date-filter">
            <Filter size={14} />

            <input
              type="date"
              value={filterDate}
              onChange={(e) =>
                setFilterDate(e.target.value)
              }
            />
          </label>

          {filterDate && (
            <button
              className="admin-btn admin-btn--outline"
              onClick={() =>
                setFilterDate("")
              }
            >
              <X size={14} />
              Clear Filter
            </button>
          )}

 
{/* 
          <button
            className="admin-btn admin-btn--primary"
            disabled={
              pendingRows.length === 0 ||
              actionLoading
            }
            onClick={() =>
              openConfirm(
                "approveAllPending",
                pendingRows
              )
            }
          >
            <Send size={14} />
            Approve All Pending
          </button> */}
        </div>
      </div>

      {error && (
        <div className="admin-error-box">
          {error}
        </div>
      )}

      {loading ? (
        <div className="admin-table-card">
          <p className="admin-no-results">
            Loading monthly interest...
          </p>
        </div>
      ) : visibleGroups.length === 0 ? (
        <div className="admin-table-card">
          <p className="admin-no-results">
            No interest payments found.
          </p>
        </div>
      ) : (
        visibleGroups.map((group) => (
          <div
            className="due-group"
            key={group.due}
          >
            <div className="due-group-header">
              <span className="due-group-header__date">
                {group.dueLabel}
              </span>

              {group.due === getTodayISO() && (
                <span className="due-badge due-badge--today">
                  Due Today
                </span>
              )}

              <span className="due-group-header__meta">
                {group.rows.length} payment
                {group.rows.length > 1
                  ? "s"
                  : ""}{" "}
                · {formatINR(group.total)} gross ·{" "}
                {formatINR(group.netTotal)} net of GST
              </span>
            </div>

            <div className="admin-table-card monthly-interest-table-card">
              <div className="monthly-interest-table-scroll">
                <table className="data-table monthly-interest-data-table">
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
                  {group.rows.map((row) => {
                    const gst =
                      gstFor(row.amount);

                    const net =
                      netPayableFor(
                        row.amount
                      );

                    return (
                      <tr key={row.id}>
                        <td>
                          {row.investor}
                        </td>

                        <td className="mono link">
                          {row.bond}
                        </td>

                        <td className="mono amount-positive">
                          {formatINR(
                            row.amount
                          )}
                        </td>

                        <td className="mono">
                          -{formatINR(gst)}
                        </td>

                        <td className="mono amount-positive">
                          {formatINR(net)}
                        </td>

                        <td className="due-date--muted">
                          {row.dueLabel}
                        </td>

                        <td>
                          <StatusBadge
                            status={
                              row.status
                            }
                          />
                        </td>

                        <td>
                          {row.status ===
                            "Pending" && (
                            <div className="admin-action-group">
                              <button
                                className="admin-btn admin-btn--success admin-btn--pill"
                                disabled={
                                  actionLoading
                                }
                                onClick={() =>
                                  openConfirm(
                                    "approve",
                                    row
                                  )
                                }
                              >
                                <CheckCircle2
                                  size={14}
                                />
                                Approve
                              </button>

                              <button
                                className="admin-icon-btn admin-icon-btn--danger"
                                disabled={
                                  actionLoading
                                }
                                onClick={() =>
                                  openConfirm(
                                    "reject",
                                    row
                                  )
                                }
                              >
                                <Ban
                                  size={14}
                                />
                              </button>
                            </div>
                          )}

                          {row.status ===
                            "Awaiting Approval" && (
                            <span className="admin-action-muted">
                              <Clock
                                size={14}
                              />
                              Waiting for Super
                              Admin Approval
                            </span>
                          )}

                          {row.status ===
                            "Approved" && (
                            <span className="admin-action-muted">
                              <CheckCircle2
                                size={14}
                              />
                              Approved
                            </span>
                          )}

                          {row.status ===
                            "Rejected" && (
                            <span className="admin-action-muted">
                              <Ban
                                size={14}
                              />
                              Rejected
                            </span>
                          )}

                          {row.status === "Paid" && (
                            <span className="admin-action-muted">
                              <CheckCircle2
                                size={14}
                              />
                              Paid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}

      {confirmAction && (
        <div
          className="admin-modal-overlay"
          onClick={closeConfirm}
        >
          <div
            className="admin-modal-box"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="admin-modal-header">
              <div className="admin-modal-header__title">
                <AlertTriangle size={18} />
                <h3>
                  {confirmAction.type ===
                  "reject"
                    ? "Reject Interest Request"
                    : confirmAction.type ===
                      "approveAllPending"
                    ? "Approve All Pending"
                    : "Interest Payout Details"}
                </h3>
              </div>

              <button
                className="admin-modal-close-btn"
                onClick={closeConfirm}
              >
                <X size={16} />
              </button>
            </div>

            {step === "details" &&
              activeRow && (
                <>
                  <div className="admin-modal-body">
                    <div className="admin-detail-list">
                      <DetailRow
                        label="Investor"
                        value={
                          activeRow.investor
                        }
                      />

                      <DetailRow
                        label="Bond Number"
                        value={
                          activeRow.bond
                        }
                        valueClass="mono"
                      />

                      <DetailRow
                        label="Interest Amount"
                        value={formatINR(
                          activeRow.amount
                        )}
                        valueClass="mono amount-positive"
                      />

                      <DetailRow
                        label="GST (18%)"
                        value={`-${formatINR(
                          gstFor(
                            activeRow.amount
                          )
                        )}`}
                        valueClass="mono"
                      />

                      <DetailRow
                        label="Net Payable"
                        value={formatINR(
                          netPayableFor(
                            activeRow.amount
                          )
                        )}
                        valueClass="mono amount-positive"
                      />

                      <DetailRow
                        label="Due Date"
                        value={
                          activeRow.dueLabel
                        }
                      />

                      <DetailRow
                        label="Status"
                        value={
                          <StatusBadge
                            status={
                              activeRow.status
                            }
                          />
                        }
                      />
                    </div>
                  </div>

                  <div className="admin-modal-footer">
                    <button
                      className="admin-btn admin-btn--outline"
                      onClick={closeConfirm}
                    >
                      Cancel
                    </button>

                    <button
                      className={`admin-btn ${
                        confirmAction.type ===
                        "reject"
                          ? "admin-btn--danger"
                          : "admin-btn--success"
                      }`}
                      onClick={() =>
                        setStep("confirm")
                      }
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

            {step === "confirm" && (
              <>
                <div className="admin-modal-body">
                  {confirmAction.type ===
                    "approveAllPending" ? (
                    <p>
                      Send{" "}
                      <strong>
                        {
                          activeRow.length
                        }
                      </strong>{" "}
                      pending interest payments
                      for Super Admin approval?
                    </p>
                  ) : confirmAction.type ===
                    "reject" ? (
                    <p>
                      Reject the interest
                      payout for{" "}
                      <strong>
                        {
                          activeRow.investor
                        }
                      </strong>{" "}
                      on bond{" "}
                      <strong>
                        {activeRow.bond}
                      </strong>
                      ?
                    </p>
                  ) : (
                    <p>
                      Send the interest payout
                      of{" "}
                      <strong>
                        {formatINR(
                          netPayableFor(
                            activeRow.amount
                          )
                        )}
                      </strong>{" "}
                      for{" "}
                      <strong>
                        {
                          activeRow.investor
                        }
                      </strong>{" "}
                      to Super Admin for final
                      approval?
                    </p>
                  )}
                </div>

                <div className="admin-modal-footer">
                  <button
                    className="admin-btn admin-btn--outline"
                    onClick={() =>
                      confirmAction.type ===
                      "approveAllPending"
                        ? closeConfirm()
                        : setStep("details")
                    }
                  >
                    Back
                  </button>

                  <button
                    className={`admin-btn ${
                      confirmAction.type ===
                      "reject"
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
                      : confirmAction.type ===
                        "reject"
                      ? "Reject"
                      : "Send for Approval"}
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