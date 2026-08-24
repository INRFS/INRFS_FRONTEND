import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  approveInvestment,
  getInvestmentDetails,
  getInvestments,
  rejectInvestment,
  getPendingTenureExtensions,
  submitTenureExtension,
} from "../../services/admin/investmentManagementService";

import "../../Styles/Admin/investments.css";

const getValue = (
  row,
  keys,
  fallback = "-"
) => {
  if (!row) {
    return fallback;
  }

  for (const key of keys) {
    if (
      row[key] !== undefined &&
      row[key] !== null &&
      row[key] !== ""
    ) {
      return row[key];
    }
  }

  const lowered = Object.keys(row).reduce(
    (acc, key) => {
      acc[key.toLowerCase()] = row[key];
      return acc;
    },
    {}
  );

  for (const key of keys) {
    const value =
      lowered[String(key).toLowerCase()];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return fallback;
};

const normalizeStatus = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "pending";
  }

  const status = String(value)
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ");

  if (
    status === "pending" ||
    status === "pending approval" ||
    status === "awaiting approval" ||
    status === "waiting for approval" ||
    status === "under review" ||
    status === "submitted"
  ) {
    return "pending";
  }

  if (
    status === "approved" ||
    status === "active" ||
    status === "success"
  ) {
    return status === "approved"
      ? "approved"
      : status;
  }

  if (
    status === "rejected" ||
    status === "cancelled" ||
    status === "canceled"
  ) {
    return "rejected";
  }

  if (
    status === "matured" ||
    status === "closed" ||
    status === "completed"
  ) {
    return status;
  }

  return status;
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
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

const formatAmount = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const getInvestmentStatus = (item) =>
  getValue(
    item,
    [
      "status_name",
      "investment_status_name",
      "investment_status",
      "status",
    ],
    "Pending"
  );

const getTenureStatus = (item) =>
  getValue(
    item,
    [
      "status_name",
      "request_status_name",
      "tenure_status_name",
      "status",
    ],
    "Pending"
  );

const getInvestmentId = (item) =>
  getValue(
    item,
    [
      "investment_id",
      "id",
      "investmentId",
    ],
    null
  );

const getTenureRequestId = (item) =>
  getValue(
    item,
    [
      "request_id",
      "tenure_extension_id",
      "extension_request_id",
      "id",
    ],
    null
  );

export default function InvestmentManagement() {
  const [activeTab, setActiveTab] =
    useState("pending");

  const [investments, setInvestments] =
    useState([]);

  const [tenureRequests, setTenureRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [tenureLoading, setTenureLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchText, setSearchText] =
    useState("");

  const [
    selectedInvestment,
    setSelectedInvestment,
  ] = useState(null);

  const [
    selectedInvestmentId,
    setSelectedInvestmentId,
  ] = useState(null);

  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false);

  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);

  const [
    approveOpen,
    setApproveOpen,
  ] = useState(false);

  const [
    rejectOpen,
    setRejectOpen,
  ] = useState(false);

  const [
    interestRate,
    setInterestRate,
  ] = useState("");

  const [
    remarks,
    setRemarks,
  ] = useState("");

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState("");

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    selectedTenureRequest,
    setSelectedTenureRequest,
  ] = useState(null);

  const [
    tenureSendOpen,
    setTenureSendOpen,
  ] = useState(false);

  const [
    tenureRemarks,
    setTenureRemarks,
  ] = useState("");

  const [
    tenureActionLoading,
    setTenureActionLoading,
  ] = useState(false);

  const loadInvestments =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getInvestments({
            limit: 100,
            offset: 0,
          });

        const rows = Array.isArray(
          response?.data
        )
          ? response.data
          : [];

        setInvestments(rows);
      } catch (err) {
        setError(
          err?.message ||
            "Failed to load investments."
        );

        setInvestments([]);
      } finally {
        setLoading(false);
      }
    }, []);

  const loadTenureRequests =
    useCallback(async () => {
      try {
        setTenureLoading(true);

        const response =
          await getPendingTenureExtensions({
            limit: 100,
            offset: 0,
          });

        const rows = Array.isArray(
          response?.data
        )
          ? response.data
          : [];

        setTenureRequests(rows);
      } catch (err) {
        setTenureRequests([]);
      } finally {
        setTenureLoading(false);
      }
    }, []);

  const loadAllData =
    useCallback(async () => {
      await Promise.all([
        loadInvestments(),
        loadTenureRequests(),
      ]);
    }, [
      loadInvestments,
      loadTenureRequests,
    ]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const filteredInvestments =
    useMemo(() => {
      let result = [...investments];

      const search =
        searchText.trim().toLowerCase();

      if (activeTab === "pending") {
        result = result.filter(
          (item) =>
            normalizeStatus(
              getInvestmentStatus(item)
            ) === "pending"
        );
      }

      if (search) {
        result = result.filter((item) => {
          const values = [
            getValue(item, [
              "investment_id",
              "id",
            ]),
            getValue(item, [
              "investor_id",
              "investor_code",
            ]),
            getValue(item, [
              "investor_name",
              "investor_full_name",
              "full_name",
            ]),
            getValue(item, [
              "bond_id",
              "bond_number",
              "bond_code",
            ]),
          ];

          return values.some((value) =>
            String(value)
              .toLowerCase()
              .includes(search)
          );
        });
      }

      return result;
    }, [
      investments,
      activeTab,
      searchText,
    ]);

  const filteredTenureRequests =
    useMemo(() => {
      let result = [...tenureRequests];

      const search =
        searchText.trim().toLowerCase();

      if (search) {
        result = result.filter((item) => {
          const values = [
            getValue(item, [
              "investor_id",
              "investor_code",
            ]),
            getValue(item, [
              "investor_name",
              "investor_full_name",
              "full_name",
            ]),
            getValue(item, [
              "bond_id",
              "bond_number",
              "bond_code",
            ]),
            getValue(item, [
              "investment_id",
              "id",
            ]),
          ];

          return values.some((value) =>
            String(value)
              .toLowerCase()
              .includes(search)
          );
        });
      }

      return result;
    }, [
      tenureRequests,
      searchText,
    ]);

  const openDetails = async (
    investmentId
  ) => {
    if (
      investmentId === null ||
      investmentId === undefined ||
      investmentId === ""
    ) {
      return;
    }

    try {
      setDetailsLoading(true);
      setDetailsOpen(true);
      setSelectedInvestment(null);
      setError("");

      const response =
        await getInvestmentDetails(
          investmentId
        );

      setSelectedInvestment(
        response?.data || null
      );
    } catch (err) {
      setError(
        err?.message ||
          "Failed to load investment details."
      );

      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const openApprove = async (
    investmentId
  ) => {
    const row = investments.find(
      (item) =>
        String(getInvestmentId(item)) ===
        String(investmentId)
    );

    setSelectedInvestment(
      row || null
    );

    setSelectedInvestmentId(
      investmentId
    );

    setInterestRate("");
    setRemarks("");
    setError("");
    setApproveOpen(true);

    try {
      const response =
        await getInvestmentDetails(
          investmentId
        );

      const details =
        response?.data ||
        row ||
        null;

      setSelectedInvestment(details);

      const rate = getValue(
        details,
        [
          "interest_rate",
          "rate",
          "initial_rate",
          "current_rate",
        ],
        3
      );

      const rateNumber =
        String(rate).match(
          /[\d.]+/
        )?.[0];

      setInterestRate(
        rateNumber || "3"
      );
    } catch (err) {
      setError(
        err?.message ||
          "Failed to load investment details."
      );
    }
  };

  const openReject = (
    investmentId
  ) => {
    setSelectedInvestmentId(
      investmentId
    );

    setRejectionReason("");
    setRemarks("");
    setError("");
    setRejectOpen(true);
  };

  const closeApprove = () => {
    if (actionLoading) {
      return;
    }

    setApproveOpen(false);
    setSelectedInvestmentId(null);
    setInterestRate("");
    setRemarks("");
  };

  const closeReject = () => {
    if (actionLoading) {
      return;
    }

    setRejectOpen(false);
    setSelectedInvestmentId(null);
    setRejectionReason("");
    setRemarks("");
  };

  const handleApprove =
    async () => {
      if (
        selectedInvestmentId ===
          null ||
        selectedInvestmentId ===
          undefined
      ) {
        return;
      }

      if (
        interestRate === "" ||
        interestRate === null ||
        interestRate === undefined
      ) {
        setError(
          "Interest rate is required."
        );
        return;
      }

      const numericRate =
        Number(interestRate);

      if (
        Number.isNaN(numericRate) ||
        numericRate < 0
      ) {
        setError(
          "Please enter a valid interest rate."
        );
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await approveInvestment(
          selectedInvestmentId,
          {
            interestRate:
              numericRate,
            remarks,
          }
        );

        setApproveOpen(false);
        setSelectedInvestmentId(
          null
        );
        setInterestRate("");
        setRemarks("");

        await loadAllData();
      } catch (err) {
        setError(
          err?.message ||
            "Investment approval failed."
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleReject =
    async () => {
      if (
        selectedInvestmentId ===
          null ||
        selectedInvestmentId ===
          undefined
      ) {
        return;
      }

      if (
        !rejectionReason.trim()
      ) {
        setError(
          "Rejection reason is required."
        );
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await rejectInvestment(
          selectedInvestmentId,
          {
            rejectionReason:
              rejectionReason.trim(),
            remarks,
          }
        );

        setRejectOpen(false);
        setSelectedInvestmentId(
          null
        );
        setRejectionReason("");
        setRemarks("");

        await loadAllData();
      } catch (err) {
        setError(
          err?.message ||
            "Investment rejection failed."
        );
      } finally {
        setActionLoading(false);
      }
    };

  /*
   * IMPORTANT:
   *
   * Admin does NOT approve/reject
   * tenure extension requests.
   *
   * Admin only sends the request
   * to Super Admin.
   */

  const openTenureSend =
    (request) => {
      setSelectedTenureRequest(
        request
      );

      setTenureRemarks("");
      setError("");
      setTenureSendOpen(true);
    };

  const closeTenureSend =
    () => {
      if (
        tenureActionLoading
      ) {
        return;
      }

      setTenureSendOpen(false);
      setSelectedTenureRequest(
        null
      );
      setTenureRemarks("");
    };

  const handleSendTenure =
    async () => {
      if (
        !selectedTenureRequest
      ) {
        return;
      }

      const requestId =
        getTenureRequestId(
          selectedTenureRequest
        );

      if (
        requestId === null ||
        requestId === undefined ||
        requestId === ""
      ) {
        setError(
          "Tenure extension request ID is missing."
        );
        return;
      }

      try {
        setTenureActionLoading(
          true
        );

        setError("");

        await submitTenureExtension(
          requestId,
          {
            remarks:
              tenureRemarks.trim() ||
              "Submitted to Super Admin by Admin.",
          }
        );

        /*
         * Remove immediately from the
         * Admin pending list.
         */
        setTenureRequests(
          (previous) =>
            previous.filter(
              (item) =>
                String(
                  getTenureRequestId(
                    item
                  )
                ) !==
                String(requestId)
            )
        );

        setTenureSendOpen(false);
        setSelectedTenureRequest(
          null
        );
        setTenureRemarks("");

        await loadTenureRequests();
      } catch (err) {
        setError(
          err?.message ||
            "Failed to send tenure extension request to Super Admin."
        );
      } finally {
        setTenureActionLoading(
          false
        );
      }
    };

  const pendingCount =
    investments.filter(
      (item) =>
        normalizeStatus(
          getInvestmentStatus(item)
        ) === "pending"
    ).length;

  const approvedCount =
    investments.filter((item) =>
      [
        "approved",
        "active",
        "success",
      ].includes(
        normalizeStatus(
          getInvestmentStatus(item)
        )
      )
    ).length;

  const rejectedCount =
    investments.filter(
      (item) =>
        normalizeStatus(
          getInvestmentStatus(item)
        ) === "rejected"
    ).length;

  const allInvestmentCount =
    investments.length;

  const tenurePendingCount =
    tenureRequests.length;

  const totalInvestedAmount =
    investments.reduce(
      (total, item) => {
        const amount =
          Number(
            getValue(
              item,
              [
                "investment_amount",
                "amount",
                "principal_amount",
                "invested_amount",
                "total_amount",
              ],
              0
            )
          );

        return (
          total +
          (Number.isNaN(amount)
            ? 0
            : amount)
        );
      },
      0
    );

  return (
    <div className="investment-page">

      <div className="investment-stats">

        <div className="investment-stat-card investment-stat-card--blue">
          <span>
            Total Investments
          </span>

          <strong>
            {allInvestmentCount}
          </strong>

          <small>
            All investment requests
          </small>
        </div>

        <div className="investment-stat-card investment-stat-card--amber">
          <span>
            Pending Approval
          </span>

          <strong>
            {pendingCount}
          </strong>

          <small>
            Waiting for admin
          </small>
        </div>

        <div className="investment-stat-card investment-stat-card--green">
          <span>
            Active Investments
          </span>

          <strong>
            {approvedCount}
          </strong>

          <small>
            Approved and active
          </small>
        </div>

        <div className="investment-stat-card investment-stat-card--red">
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

        <div className="investment-stat-card investment-stat-card--purple">
          <span>
            Total Invested
          </span>

          <strong>
            {formatAmount(
              totalInvestedAmount
            )}
          </strong>

          <small>
            Combined investment amount
          </small>
        </div>

      </div>

      <div className="investment-controls-row">

        <div className="investment-tabs">

          <button
            type="button"
            className={
              activeTab === "pending"
                ? "investment-tab investment-tab--active"
                : "investment-tab"
            }
            onClick={() => {
              setActiveTab(
                "pending"
              );
              setSearchText("");
              setError("");
            }}
          >
            <span>
              Pending Approval
            </span>

            <span className="investment-tab-count">
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            className={
              activeTab === "tenure"
                ? "investment-tab investment-tab--active"
                : "investment-tab"
            }
            onClick={() => {
              setActiveTab(
                "tenure"
              );
              setSearchText("");
              setError("");
            }}
          >
            <span>
              Tenure Extend Requests
            </span>

            <span className="investment-tab-count">
              {tenurePendingCount}
            </span>
          </button>

          <button
            type="button"
            className={
              activeTab === "all"
                ? "investment-tab investment-tab--active"
                : "investment-tab"
            }
            onClick={() => {
              setActiveTab("all");
              setSearchText("");
              setError("");
            }}
          >
            <span>
              All Investments
            </span>
          </button>

        </div>

        <div className="investment-toolbar">

          <input
            type="text"
            value={searchText}
            onChange={(event) =>
              setSearchText(
                event.target.value
              )
            }
            placeholder={
              activeTab === "tenure"
                ? "Search investor, bond number..."
                : "Search bonds, investors..."
            }
          />

          <button
            type="button"
            className="investment-export"
          >
            ↓ Export
          </button>

        </div>

      </div>

      {error && (
        <div className="investment-error">
          {error}
        </div>
      )}

      {activeTab === "tenure" ? (

        <div className="investment-table-wrapper">

          <table className="investment-table investment-table--tenure">

            <thead>
              <tr>
                <th>
                  INVESTOR ID
                </th>

                <th>
                  INVESTOR
                </th>

                <th>
                  BOND NUMBER
                </th>

                <th>
                  CURRENT MATURITY
                </th>

                <th>
                  CURRENT RATE
                </th>

                <th>
                  REQUESTED EXTENSION
                </th>

                <th>
                  SUBMITTED ON
                </th>

                <th>
                  STATUS
                </th>

                <th>
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody>

              {tenureLoading ? (

                <tr>
                  <td
                    colSpan={9}
                    className="investment-empty"
                  >
                    Loading tenure extension requests...
                  </td>
                </tr>

              ) : filteredTenureRequests.length === 0 ? (

                <tr>
                  <td
                    colSpan={9}
                    className="investment-empty"
                  >
                    No tenure extension requests found.
                  </td>
                </tr>

              ) : (

                filteredTenureRequests.map(
                  (item, index) => {

                    const requestId =
                      getTenureRequestId(
                        item
                      );

                    const currentMaturity =
                      getValue(
                        item,
                        [
                          "current_maturity_date",
                          "maturity_date",
                        ]
                      );

                    const currentRate =
                      getValue(
                        item,
                        [
                          "current_interest_rate",
                          "interest_rate",
                          "current_rate",
                        ],
                        "-"
                      );

                    const requestedExtension =
                      getValue(
                        item,
                        [
                          "requested_extension",
                          "requested_tenure",
                          "requested_tenure_months",
                        ],
                        "-"
                      );

                    const submittedDate =
                      getValue(
                        item,
                        [
                          "submitted_date",
                          "requested_date",
                          "created_date",
                        ],
                        null
                      );

                    const status =
                      getTenureStatus(
                        item
                      );

                    return (
                      <tr
                        key={
                          requestId ||
                          `tenure-${index}`
                        }
                      >

                        <td>
                          {getValue(
                            item,
                            [
                              "investor_id",
                              "investor_code",
                            ]
                          )}
                        </td>

                        <td>
                          {getValue(
                            item,
                            [
                              "investor_name",
                              "investor_full_name",
                              "full_name",
                            ]
                          )}
                        </td>

                        <td>
                          {getValue(
                            item,
                            [
                              "bond_id",
                              "bond_number",
                              "bond_code",
                            ]
                          )}
                        </td>

                        <td>
                          {formatDate(
                            currentMaturity
                          )}
                        </td>

                        <td>
                          <span className="investment-rate-badge">
                            {currentRate ===
                            "-"
                              ? "-"
                              : Number(
                                  currentRate
                                ).toFixed(2)}
                          </span>
                        </td>

                        <td>
                          <span className="investment-extension-badge">
                            {String(
                              requestedExtension
                            ).startsWith(
                              "+"
                            )
                              ? requestedExtension
                              : `+${requestedExtension}`}
                          </span>
                        </td>

                        <td>
                          {formatDateTime(
                            submittedDate
                          )}
                        </td>

                        <td>
                          <span className="investment-status investment-status--pending">
                            {status}
                          </span>
                        </td>

                        <td>
                          <div className="investment-actions">

                            <button
                              type="button"
                              className="investment-btn investment-btn--approve"
                              onClick={() =>
                                openTenureSend(
                                  item
                                )
                              }
                            >
                              Review &amp; Send
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

      ) : (

        <div className="investment-table-wrapper">

          <table className="investment-table investment-table--all">

            <thead>
              <tr>
                <th>
                  INVESTOR ID
                </th>

                <th>
                  INVESTOR
                </th>

                <th>
                  INVESTMENT ID
                </th>

                <th>
                  AMOUNT
                </th>

                <th>
                  RATE
                </th>

                <th>
                  INVESTED
                </th>

                <th>
                  MATURES
                </th>

                <th>
                  STATUS
                </th>

                <th>
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan={9}
                    className="investment-empty"
                  >
                    Loading investments...
                  </td>
                </tr>

              ) : filteredInvestments.length ===
                0 ? (

                <tr>
                  <td
                    colSpan={9}
                    className="investment-empty"
                  >
                    No investments found.
                  </td>
                </tr>

              ) : (

                filteredInvestments.map(
                  (item, index) => {

                    const investmentId =
                      getInvestmentId(
                        item
                      );

                    const status =
                      normalizeStatus(
                        getInvestmentStatus(
                          item
                        )
                      );

                    const investorId =
                      getValue(
                        item,
                        [
                          "investor_id",
                          "investor_code",
                        ]
                      );

                    const investorName =
                      getValue(
                        item,
                        [
                          "investor_name",
                          "investor_full_name",
                          "full_name",
                        ]
                      );

                    const amount =
                      getValue(
                        item,
                        [
                          "investment_amount",
                          "amount",
                          "principal_amount",
                          "invested_amount",
                        ],
                        0
                      );

                    const rate =
                      getValue(
                        item,
                        [
                          "interest_rate",
                          "rate",
                          "current_interest_rate",
                        ],
                        "-"
                      );

                    const investedDate =
                      getValue(
                        item,
                        [
                          "investment_date",
                          "invested_date",
                          "created_date",
                        ],
                        null
                      );

                    const maturityDate =
                      getValue(
                        item,
                        [
                          "maturity_date",
                          "current_maturity_date",
                        ],
                        null
                      );

                    return (
                      <tr
                        key={
                          investmentId ||
                          `investment-${index}`
                        }
                      >

                        <td>
                          {investorId}
                        </td>

                        <td>
                          {investorName}
                        </td>

                        <td>
                          {investmentId}
                        </td>

                        <td>
                          {formatAmount(
                            amount
                          )}
                        </td>

                        <td>
                          <span className="investment-rate-badge">
                            {rate === "-"
                              ? "-"
                              : Number(
                                  rate
                                ).toFixed(
                                  2
                                )}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            investedDate
                          )}
                        </td>

                        <td>
                          {formatDate(
                            maturityDate
                          )}
                        </td>

                        <td>
                          <span
                            className={
                              status ===
                              "pending"
                                ? "investment-status investment-status--pending"
                                : status ===
                                  "approved" ||
                                  status ===
                                    "active"
                                ? "investment-status investment-status--approved"
                                : status ===
                                  "rejected"
                                ? "investment-status investment-status--rejected"
                                : "investment-status"
                            }
                          >
                            {getInvestmentStatus(
                              item
                            )}
                          </span>
                        </td>

                        <td>

                          <div className="investment-actions">

                            <button
                              type="button"
                              className="investment-btn investment-btn--view"
                              onClick={() =>
                                openDetails(
                                  investmentId
                                )
                              }
                            >
                              View
                            </button>

                            {activeTab ===
                              "pending" &&
                              status ===
                                "pending" && (
                                <>
                                  <button
                                    type="button"
                                    className="investment-btn investment-btn--approve"
                                    onClick={() =>
                                      openApprove(
                                        investmentId
                                      )
                                    }
                                  >
                                    Approve
                                  </button>

                                  <button
                                    type="button"
                                    className="investment-btn investment-btn--reject"
                                    onClick={() =>
                                      openReject(
                                        investmentId
                                      )
                                    }
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

      )}

      {detailsOpen && (
        <div
          className="investment-modal-overlay"
          onClick={() =>
            setDetailsOpen(false)
          }
        >
          <div
            className="investment-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="investment-modal-header">
              <h2>
                Investment Details
              </h2>

              <button
                type="button"
                onClick={() =>
                  setDetailsOpen(false)
                }
              >
                ×
              </button>
            </div>

            <div className="investment-modal-body">

              {detailsLoading ? (

                <div className="investment-empty">
                  Loading details...
                </div>

              ) : selectedInvestment ? (

                <div className="investment-details-grid">

                  <div>
                    <span>
                      Investor ID
                    </span>

                    <strong>
                      {getValue(
                        selectedInvestment,
                        [
                          "investor_id",
                          "investor_code",
                        ]
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Investor
                    </span>

                    <strong>
                      {getValue(
                        selectedInvestment,
                        [
                          "investor_name",
                          "investor_full_name",
                          "full_name",
                        ]
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Investment ID
                    </span>

                    <strong>
                      {getInvestmentId(
                        selectedInvestment
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Amount
                    </span>

                    <strong>
                      {formatAmount(
                        getValue(
                          selectedInvestment,
                          [
                            "investment_amount",
                            "amount",
                          ],
                          0
                        )
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Interest Rate
                    </span>

                    <strong>
                      {getValue(
                        selectedInvestment,
                        [
                          "interest_rate",
                          "rate",
                        ]
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Maturity Date
                    </span>

                    <strong>
                      {formatDate(
                        getValue(
                          selectedInvestment,
                          [
                            "maturity_date",
                            "current_maturity_date",
                          ],
                          null
                        )
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Status
                    </span>

                    <strong>
                      {getInvestmentStatus(
                        selectedInvestment
                      )}
                    </strong>
                  </div>

                </div>

              ) : (

                <div className="investment-empty">
                  Investment details not found.
                </div>

              )}

            </div>

          </div>
        </div>
      )}

      {approveOpen && (
        <div className="investment-modal-overlay">

          <div className="investment-modal">

            <div className="investment-modal-header">

              <h2>
                Approve Investment
              </h2>

              <button
                type="button"
                onClick={
                  closeApprove
                }
              >
                ×
              </button>

            </div>

            <div className="investment-modal-body">

              <p>
                You are approving this
                investment as Admin.
              </p>

              <label>
                Interest Rate
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={interestRate}
                onChange={(event) =>
                  setInterestRate(
                    event.target.value
                  )
                }
              />

              <label>
                Remarks
              </label>

              <textarea
                value={remarks}
                onChange={(event) =>
                  setRemarks(
                    event.target.value
                  )
                }
                placeholder="Optional remarks"
              />

            </div>

            <div className="investment-modal-footer">

              <button
                type="button"
                onClick={
                  closeApprove
                }
                disabled={
                  actionLoading
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="investment-btn investment-btn--approve"
                onClick={
                  handleApprove
                }
                disabled={
                  actionLoading
                }
              >
                {actionLoading
                  ? "Approving..."
                  : "Approve Investment"}
              </button>

            </div>

          </div>

        </div>
      )}

      {rejectOpen && (
        <div className="investment-modal-overlay">

          <div className="investment-modal">

            <div className="investment-modal-header">

              <h2>
                Reject Investment
              </h2>

              <button
                type="button"
                onClick={
                  closeReject
                }
              >
                ×
              </button>

            </div>

            <div className="investment-modal-body">

              <label>
                Rejection Reason
              </label>

              <textarea
                value={
                  rejectionReason
                }
                onChange={(event) =>
                  setRejectionReason(
                    event.target.value
                  )
                }
                placeholder="Enter rejection reason"
              />

              <label>
                Remarks
              </label>

              <textarea
                value={remarks}
                onChange={(event) =>
                  setRemarks(
                    event.target.value
                  )
                }
                placeholder="Optional remarks"
              />

            </div>

            <div className="investment-modal-footer">

              <button
                type="button"
                onClick={
                  closeReject
                }
                disabled={
                  actionLoading
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="investment-btn investment-btn--reject"
                onClick={
                  handleReject
                }
                disabled={
                  actionLoading
                }
              >
                {actionLoading
                  ? "Rejecting..."
                  : "Reject Investment"}
              </button>

            </div>

          </div>

        </div>
      )}

      {tenureSendOpen &&
        selectedTenureRequest && (
          <div className="investment-modal-overlay">

            <div className="investment-modal">

              <div className="investment-modal-header">

                <h2>
                  Review Tenure Extension
                </h2>

                <button
                  type="button"
                  onClick={
                    closeTenureSend
                  }
                >
                  ×
                </button>

              </div>

              <div className="investment-modal-body">

                <div className="investment-review-box">

                  <div>
                    <span>
                      Investor
                    </span>

                    <strong>
                      {getValue(
                        selectedTenureRequest,
                        [
                          "investor_name",
                          "investor_full_name",
                          "full_name",
                        ]
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Bond
                    </span>

                    <strong>
                      {getValue(
                        selectedTenureRequest,
                        [
                          "bond_id",
                          "bond_number",
                          "bond_code",
                        ]
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Current Maturity
                    </span>

                    <strong>
                      {formatDate(
                        getValue(
                          selectedTenureRequest,
                          [
                            "current_maturity_date",
                            "maturity_date",
                          ],
                          null
                        )
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Requested Extension
                    </span>

                    <strong>
                      {getValue(
                        selectedTenureRequest,
                        [
                          "requested_extension",
                          "requested_tenure",
                          "requested_tenure_months",
                        ]
                      )}
                    </strong>
                  </div>

                </div>

                <div className="investment-superadmin-notice">
                  This request will be sent to Super Admin.
                  Admin cannot approve or reject a tenure
                  extension request.
                </div>

                <label>
                  Remarks
                </label>

                <textarea
                  value={
                    tenureRemarks
                  }
                  onChange={(event) =>
                    setTenureRemarks(
                      event.target.value
                    )
                  }
                  placeholder="Optional remarks for Super Admin"
                />

              </div>

              <div className="investment-modal-footer">

                <button
                  type="button"
                  onClick={
                    closeTenureSend
                  }
                  disabled={
                    tenureActionLoading
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="investment-btn investment-btn--approve"
                  onClick={
                    handleSendTenure
                  }
                  disabled={
                    tenureActionLoading
                  }
                >
                  {tenureActionLoading
                    ? "Sending..."
                    : "Send to Super Admin"}
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}