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
  approveTenureExtension,
  rejectTenureExtension,
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
    if (status === "approved") {
      return "approved";
    }

    return status;
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
    return value;
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
    return value;
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
    return value;
  }

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const getInvestmentStatus = (item) => {
  return getValue(
    item,
    [
      "status_name",
      "investment_status_name",
      "investment_status",
      "status",
    ],
    "Pending"
  );
};

const getTenureStatus = (item) => {
  return getValue(
    item,
    [
      "status_name",
      "request_status_name",
      "tenure_status_name",
      "status",
    ],
    "Pending"
  );
};

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
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [approveOpen, setApproveOpen] =
    useState(false);

  const [rejectOpen, setRejectOpen] =
    useState(false);

  const [
    selectedInvestmentId,
    setSelectedInvestmentId,
  ] = useState(null);

  const [
    interestRate,
    setInterestRate,
  ] = useState("");

  const [remarks, setRemarks] =
    useState("");

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
    tenureApproveOpen,
    setTenureApproveOpen,
  ] = useState(false);

  const [
    tenureRejectOpen,
    setTenureRejectOpen,
  ] = useState(false);

  const [
    tenureRemarks,
    setTenureRemarks,
  ] = useState("");

  const [
    tenureRejectionReason,
    setTenureRejectionReason,
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

        setInvestments(
          Array.isArray(response?.data)
            ? response.data
            : []
        );
      } catch (err) {
        setError(
          err?.message ||
            "Failed to load investments"
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

        const response = await getPendingTenureExtensions({
  limit: 100,
  offset: 0,
});

        setTenureRequests(
          Array.isArray(response?.data)
            ? response.data
            : []
        );
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
        result = result.filter((item) => {
          return (
            normalizeStatus(
              getInvestmentStatus(item)
            ) === "pending"
          );
        });
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
              "bond_name",
              "bond_id",
              "bond_code",
              "bond_number",
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
              "bond_number",
              "bond_code",
              "bond_id",
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

  const openDetails = async (id) => {
    if (
      id === null ||
      id === undefined ||
      id === ""
    ) {
      return;
    }

    try {
      setDetailsLoading(true);
      setDetailsOpen(true);
      setSelectedInvestment(null);
      setError("");

      const response =
        await getInvestmentDetails(id);

      setSelectedInvestment(
        response?.data || null
      );
    } catch (err) {
      setError(
        err?.message ||
          "Failed to load investment details"
      );

      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const openApprove = async (id) => {
    const row = investments.find(
      (item) =>
        String(getValue(item, ["investment_id", "id"])) ===
        String(id)
    );

    setSelectedInvestment(row || null);
    setSelectedInvestmentId(id);
    setInterestRate("");
    setRemarks("");
    setError("");
    setApproveOpen(true);

    try {
      const response = await getInvestmentDetails(id);
      const details = response?.data || row || null;
      setSelectedInvestment(details);

      const rate = getValue(
        details,
        ["interest_rate", "rate", "initial_rate", "current_rate"],
        3
      );

      setInterestRate(
        String(rate).match(/[\d.]+/)?.[0] || "3"
      );
    } catch (err) {
      setError(err?.message || "Failed to load investment details");
    }
  };

  const openReject = (id) => {
    setSelectedInvestmentId(id);
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

  const handleApprove = async () => {
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
        "Interest rate is required"
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
        "Please enter a valid interest rate"
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await approveInvestment(
        selectedInvestmentId,
        {
          interestRate: numericRate,
          remarks,
        }
      );

      setApproveOpen(false);
      setSelectedInvestmentId(null);
      setInterestRate("");
      setRemarks("");

      await loadAllData();
    } catch (err) {
      setError(
        err?.message ||
          "Investment approval failed"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (
      selectedInvestmentId ===
        null ||
      selectedInvestmentId ===
        undefined
    ) {
      return;
    }

    if (!rejectionReason.trim()) {
      setError(
        "Rejection reason is required"
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
      setSelectedInvestmentId(null);
      setRejectionReason("");
      setRemarks("");

      await loadAllData();
    } catch (err) {
      setError(
        err?.message ||
          "Investment rejection failed"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openTenureApprove = (
    request
  ) => {
    setSelectedTenureRequest(
      request
    );
    setTenureRemarks("");
    setError("");
    setTenureApproveOpen(true);
  };

  const openTenureReject = (
    request
  ) => {
    setSelectedTenureRequest(
      request
    );
    setTenureRejectionReason("");
    setTenureRemarks("");
    setError("");
    setTenureRejectOpen(true);
  };

  const closeTenureApprove = () => {
    if (tenureActionLoading) {
      return;
    }

    setTenureApproveOpen(false);
    setSelectedTenureRequest(null);
    setTenureRemarks("");
  };

  const closeTenureReject = () => {
    if (tenureActionLoading) {
      return;
    }

    setTenureRejectOpen(false);
    setSelectedTenureRequest(null);
    setTenureRejectionReason("");
    setTenureRemarks("");
  };

  const handleTenureApprove =
    async () => {
      if (
        !selectedTenureRequest
      ) {
        return;
      }

      const requestId =
        getValue(
          selectedTenureRequest,
          [
            "tenure_extension_id",
            "extension_request_id",
            "request_id",
            "id",
          ],
          null
        );

      if (
        requestId === null ||
        requestId === undefined
      ) {
        setError(
          "Tenure extension request ID is missing"
        );
        return;
      }

      try {
        setTenureActionLoading(true);
        setError("");

        await approveTenureExtension(
          requestId,
          {
            remarks:
              tenureRemarks.trim() ||
              "Tenure extension approved by admin",
          }
        );

        setTenureApproveOpen(false);
        setSelectedTenureRequest(null);
        setTenureRemarks("");

        await loadAllData();
      } catch (err) {
        setError(
          err?.message ||
            "Tenure extension approval failed"
        );
      } finally {
        setTenureActionLoading(false);
      }
    };

  const handleTenureReject =
    async () => {
      if (
        !selectedTenureRequest
      ) {
        return;
      }

      if (
        !tenureRejectionReason.trim()
      ) {
        setError(
          "Rejection reason is required"
        );
        return;
      }

      const requestId =
        getValue(
          selectedTenureRequest,
          [
            "tenure_extension_id",
            "extension_request_id",
            "request_id",
            "id",
          ],
          null
        );

      if (
        requestId === null ||
        requestId === undefined
      ) {
        setError(
          "Tenure extension request ID is missing"
        );
        return;
      }

      try {
        setTenureActionLoading(true);
        setError("");

        await rejectTenureExtension(
          requestId,
          {
            rejectionReason:
              tenureRejectionReason.trim(),
            remarks:
              tenureRemarks.trim(),
          }
        );

        setTenureRejectOpen(false);
        setSelectedTenureRequest(null);
        setTenureRejectionReason("");
        setTenureRemarks("");

        await loadAllData();
      } catch (err) {
        setError(
          err?.message ||
            "Tenure extension rejection failed"
        );
      } finally {
        setTenureActionLoading(false);
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
    tenureRequests.filter(
      (item) =>
        normalizeStatus(
          getTenureStatus(item)
        ) === "pending"
    ).length;

  const totalInvestedAmount =
    investments.reduce(
      (total, item) => {
        const amount = Number(
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

        return total + (
          Number.isNaN(amount)
            ? 0
            : amount
        );
      },
      0
    );

  return (
    <div className="investment-page">


      <div className="investment-stats">
        <div className="investment-stat-card investment-stat-card--blue">
          <span>Total Investments</span>
          <strong>{allInvestmentCount}</strong>
          <small>All investment requests</small>
        </div>

        <div className="investment-stat-card investment-stat-card--amber">
          <span>Pending Approval</span>
          <strong>{pendingCount}</strong>
          <small>Waiting for admin</small>
        </div>

        <div className="investment-stat-card investment-stat-card--green">
          <span>Active Investments</span>
          <strong>{approvedCount}</strong>
          <small>Approved and active</small>
        </div>

        <div className="investment-stat-card investment-stat-card--red">
          <span>Rejected</span>
          <strong>{rejectedCount}</strong>
          <small>Rejected requests</small>
        </div>

        <div className="investment-stat-card investment-stat-card--purple">
          <span>Total Invested</span>
          <strong>{formatAmount(totalInvestedAmount)}</strong>
          <small>Combined investment amount</small>
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
              setActiveTab("pending");
              setSearchText("");
              setError("");
            }}
          >
            <span>Pending Approval</span>
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
              setActiveTab("tenure");
              setSearchText("");
              setError("");
            }}
          >
            <span>Tenure Extend Requests</span>
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
            <span>All Investments</span>
          </button>
        </div>

        <div className="investment-toolbar">
          <input
            type="text"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
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

          <table className={`investment-table ${activeTab === "tenure" ? "investment-table--tenure" : "investment-table--all"}`}>

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
                    colSpan="9"
                    className="investment-empty"
                  >
                    Loading tenure extension
                    requests...
                  </td>
                </tr>
              ) : filteredTenureRequests.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="investment-empty"
                  >
                    No tenure extension
                    requests found
                  </td>
                </tr>
              ) : (
                filteredTenureRequests.map(
                  (request, index) => {

                    const requestId =
                      getValue(
                        request,
                        [
                          "tenure_extension_id",
                          "extension_request_id",
                          "request_id",
                          "id",
                        ],
                        index + 1
                      );

                    const status =
                      getTenureStatus(
                        request
                      );

                    const normalized =
                      normalizeStatus(
                        status
                      );

                    const isPending =
                      normalized ===
                      "pending";

                    return (
                      <tr
                        key={String(
                          requestId
                        )}
                      >

                        <td>
                          {getValue(
                            request,
                            [
                              "investor_id",
                              "investor_code",
                            ]
                          )}
                        </td>

                        <td>
                          <div className="investor-cell">
                            <strong>
                              {getValue(
                                request,
                                [
                                  "investor_name",
                                  "investor_full_name",
                                  "full_name",
                                ]
                              )}
                            </strong>
                          </div>
                        </td>

                        <td>
                          {getValue(
                            request,
                            [
                              "bond_number",
                              "bond_code",
                              "bond_id",
                            ]
                          )}
                        </td>

                        <td>
                          {formatDate(
                            getValue(
                              request,
                              [
                                "current_maturity_date",
                                "maturity_date",
                                "current_maturity",
                              ],
                              null
                            )
                          )}
                        </td>

                        <td>
                          <span className="investment-rate-badge">
                            {getValue(
                              request,
                              [
                                "current_rate",
                                "interest_rate",
                                "rate",
                              ]
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="investment-extension-badge">
                            {getValue(
                              request,
                              [
                                "requested_extension",
                                "extension_months",
                                "requested_months",
                                "extension_tenure",
                              ]
                            )}
                          </span>
                        </td>

                        <td>
                          {formatDateTime(
                            getValue(
                              request,
                              [
                                "submitted_on",
                                "submitted_at",
                                "created_at",
                                "created_date",
                              ],
                              null
                            )
                          )}
                        </td>

                        <td>
                          <span
                            className={`investment-status investment-status-${normalized}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td>
                          <div className="investment-actions">

                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  className="action-approve"
                                  onClick={() =>
                                    openTenureApprove(
                                      request
                                    )
                                  }
                                  disabled={
                                    tenureActionLoading
                                  }
                                >
                                  Review & Approve
                                </button>

                                <button
                                  type="button"
                                  className="action-reject"
                                  onClick={() =>
                                    openTenureReject(
                                      request
                                    )
                                  }
                                  disabled={
                                    tenureActionLoading
                                  }
                                >
                                  ×
                                </button>
                              </>
                            ) : (
                              <span>
                                -
                              </span>
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

          <div className="investment-table-footer">
            Showing{" "}
            {filteredTenureRequests.length}{" "}
            records
          </div>

        </div>
      ) : (
        <div className="investment-table-wrapper">

          <table className={`investment-table ${activeTab === "tenure" ? "investment-table--tenure" : "investment-table--all"}`}>

            <thead>
              <tr>

                {activeTab === "all" && (
                  <th>
                    BOND NUMBER
                  </th>
                )}

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
                    colSpan={
                      activeTab === "all"
                        ? "10"
                        : "9"
                    }
                    className="investment-empty"
                  >
                    Loading investments...
                  </td>
                </tr>
              ) : filteredInvestments.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={
                      activeTab === "all"
                        ? "10"
                        : "9"
                    }
                    className="investment-empty"
                  >
                    No investments found
                  </td>
                </tr>
              ) : (
                filteredInvestments.map(
                  (
                    investment,
                    index
                  ) => {

                    const id =
                      getValue(
                        investment,
                        [
                          "investment_id",
                          "id",
                        ],
                        index + 1
                      );

                    const status =
                      getInvestmentStatus(
                        investment
                      );

                    const normalized =
                      normalizeStatus(
                        status
                      );

                    const isPending =
                      normalized ===
                      "pending";

                    return (
                      <tr
                        key={String(id)}
                      >

                        {activeTab === "all" && (
                          <td>
                            <strong>
                              {getValue(
                                investment,
                                [
                                  "bond_number",
                                  "bond_code",
                                  "bond_id",
                                ]
                              )}
                            </strong>
                          </td>
                        )}

                        <td>
                          {getValue(
                            investment,
                            [
                              "investor_id",
                              "investor_code",
                            ]
                          )}
                        </td>

                        <td>
                          <div className="investor-cell">

                            <strong>
                              {getValue(
                                investment,
                                [
                                  "investor_name",
                                  "investor_full_name",
                                  "full_name",
                                ]
                              )}
                            </strong>

                          </div>
                        </td>

                        <td>
                          {getValue(
                            investment,
                            [
                              "investment_id",
                              "id",
                            ]
                          )}
                        </td>

                        <td>
                          {formatAmount(
                            getValue(
                              investment,
                              [
                                "investment_amount",
                                "amount",
                                "principal_amount",
                              ],
                              null
                            )
                          )}
                        </td>

                        <td>
                          <span className="investment-rate-badge">
                            {getValue(
                              investment,
                              [
                                "interest_rate",
                                "initial_rate",
                                "rate",
                              ]
                            )}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            getValue(
                              investment,
                              [
                                "investment_date",
                                "invested_date",
                                "created_date",
                                "created_at",
                              ],
                              null
                            )
                          )}
                        </td>

                        <td>
                          {formatDate(
                            getValue(
                              investment,
                              [
                                "maturity_date",
                                "matures_on",
                                "maturity",
                              ],
                              null
                            )
                          )}
                        </td>

                        <td>
                          <span
                            className={`investment-status investment-status-${normalized}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td>

                          <div className="investment-actions">

                            <button
                              type="button"
                              className="action-view"
                              onClick={() =>
                                openDetails(
                                  id
                                )
                              }
                            >
                              View
                            </button>

                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  className="action-approve"
                                  onClick={() =>
                                    openApprove(
                                      id
                                    )
                                  }
                                  disabled={
                                    actionLoading
                                  }
                                >
                                  Approve
                                </button>

                                <button
                                  type="button"
                                  className="action-reject"
                                  onClick={() =>
                                    openReject(
                                      id
                                    )
                                  }
                                  disabled={
                                    actionLoading
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

          <div className="investment-table-footer">
            Showing{" "}
            {filteredInvestments.length}{" "}
            records
          </div>

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

              <div>
                <h2>
                  Investment Details
                </h2>

                <p>
                  View investment information
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDetailsOpen(false)
                }
              >
                ×
              </button>

            </div>

            {detailsLoading ? (
              <div className="investment-modal-loading">
                Loading...
              </div>
            ) : selectedInvestment ? (
              <div className="investment-details-grid">

                {Object.entries(
                  selectedInvestment
                ).map(
                  ([key, value]) => (
                    <div
                      className="investment-detail-item"
                      key={key}
                    >

                      <span>
                        {key
                          .replace(
                            /_/g,
                            " "
                          )
                          .replace(
                            /\b\w/g,
                            (letter) =>
                              letter.toUpperCase()
                          )}
                      </span>

                      <strong>
                        {value === null ||
                        value ===
                          undefined ||
                        value === ""
                          ? "-"
                          : String(
                              value
                            )}
                      </strong>

                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="investment-modal-loading">
                Investment details not
                available
              </div>
            )}

          </div>
        </div>
      )}

      {approveOpen && (
        <div
          className="investment-modal-overlay"
          onClick={closeApprove}
        >
          <div
            className="im-review-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="investment-modal-header">
              <h2>Review &amp; Approve Investment</h2>
              <button
                type="button"
                onClick={closeApprove}
                disabled={actionLoading}
              >
                ×
              </button>
            </div>

            <div className="im-review-body">
              <div className="im-review-details">
                <h3>Investment Details</h3>

                <div className="im-review-grid">
                  <div>
                    <span>Investor</span>
                    <strong>
                      {getValue(selectedInvestment, [
                        "investor_name",
                        "investor_full_name",
                        "full_name",
                      ])}
                    </strong>
                  </div>

                  <div>
                    <span>Investor ID</span>
                    <strong>
                      {getValue(selectedInvestment, [
                        "investor_id",
                        "investor_code",
                      ])}
                    </strong>
                  </div>

                  <div>
                    <span>Branch</span>
                    <strong>
                      {getValue(selectedInvestment, [
                        "branch_name",
                        "branch",
                        "service_location_name",
                      ])}
                    </strong>
                  </div>

                  <div>
                    <span>Amount</span>
                    <strong>
                      {formatAmount(
                        getValue(selectedInvestment, [
                          "investment_amount",
                          "amount",
                          "principal_amount",
                          "invested_amount",
                        ])
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Tenure</span>
                    <strong>
                      {(() => {
                        const value = getValue(selectedInvestment, [
                          "tenure",
                          "tenure_months",
                          "investment_tenure",
                          "duration_months",
                        ]);
                        return String(value).toLowerCase().includes("month")
                          ? value
                          : `${value} months`;
                      })()}
                    </strong>
                  </div>

                  <div>
                    <span>Transaction Ref</span>
                    <strong>
                      {getValue(selectedInvestment, [
                        "transaction_ref",
                        "transaction_reference",
                        "txn_ref",
                        "utr_number",
                        "utr",
                      ])}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="im-rate-box">
                <h3>Set Final Interest Rate</h3>

                <p>
                  Investor submitted at <strong>
                    {getValue(
                      selectedInvestment,
                      ["interest_rate", "rate", "initial_rate"],
                      interestRate || 3
                    )}
                    % per month
                  </strong>. You can adjust the rate before approving.
                </p>

                <div className="im-rate-input-row">
                  <div className="im-rate-input-field">
                    <label>Interest Rate (% per month)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={interestRate}
                      onChange={(event) =>
                        setInterestRate(event.target.value)
                      }
                    />
                  </div>

                  <div className="im-rate-preview">
                    <span>Monthly Interest</span>
                    <strong>
                      {formatAmount(
                        Number(
                          getValue(
                            selectedInvestment,
                            [
                              "investment_amount",
                              "amount",
                              "principal_amount",
                              "invested_amount",
                            ],
                            0
                          )
                        ) * Number(interestRate || 0) / 100
                      )}
                    </strong>
                  </div>
                </div>

                <div className="im-rate-quick-row">
                  {[2, 2.5, 3, 3.5, 4].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      className={
                        Number(interestRate) === rate
                          ? "im-rate-quick-btn im-rate-quick-btn--active"
                          : "im-rate-quick-btn"
                      }
                      onClick={() => setInterestRate(String(rate))}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="im-info-box">
                Approving will <strong>activate the investment</strong>,
                assign a bond number, and generate the digital bond
                certificate at <strong>{interestRate || 0}% per month</strong>.
                The investor will be notified automatically.
              </div>
            </div>

            <div className="im-review-actions">
              <button
                type="button"
                className="admin-btn admin-btn--outline"
                onClick={closeApprove}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-btn modal-reject"
                onClick={() => {
                  const id = selectedInvestmentId;
                  closeApprove();
                  openReject(id);
                }}
                disabled={actionLoading}
              >
                ⊗ Reject
              </button>

              <button
                type="button"
                className="admin-btn admin-btn--approve"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                ✓ {actionLoading ? "Approving..." : "Approve & Generate Bond"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectOpen && (
        <div
          className="investment-modal-overlay"
          onClick={closeReject}
        >
          <div
            className="investment-modal investment-action-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="investment-modal-header">

              <div>
                <h2>
                  Reject Investment
                </h2>

                <p>
                  Provide a reason for
                  rejection
                </p>
              </div>

              <button
                type="button"
                onClick={closeReject}
                disabled={
                  actionLoading
                }
              >
                ×
              </button>

            </div>

            <div className="investment-form">

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
                placeholder="Enter remarks"
              />

              <div className="investment-modal-actions">

                <button
                  type="button"
                  className="modal-cancel"
                  onClick={closeReject}
                  disabled={
                    actionLoading
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="modal-reject"
                  onClick={
                    handleReject
                  }
                  disabled={
                    actionLoading
                  }
                >
                  {actionLoading
                    ? "Rejecting..."
                    : "Reject"}
                </button>

              </div>

            </div>

          </div>
        </div>
      )}

      {tenureApproveOpen &&
        selectedTenureRequest && (
          <div
            className="investment-modal-overlay"
            onClick={
              closeTenureApprove
            }
          >
            <div
              className="investment-modal investment-action-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="investment-modal-header">

                <div>
                  <h2>
                    Review & Approve
                  </h2>

                  <p>
                    Tenure extension request
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeTenureApprove
                  }
                  disabled={
                    tenureActionLoading
                  }
                >
                  ×
                </button>

              </div>

              <div className="investment-details-grid investment-tenure-details-grid">

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
                    Investor ID
                  </span>

                  <strong>
                    {getValue(
                      selectedTenureRequest,
                      [
                        "investor_id",
                        "investor_code",
                      ]
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Bond Number
                  </span>

                  <strong>
                    {getValue(
                      selectedTenureRequest,
                      [
                        "bond_number",
                        "bond_code",
                        "bond_id",
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
                    Current Rate
                  </span>

                  <strong>
                    {getValue(
                      selectedTenureRequest,
                      [
                        "current_rate",
                        "interest_rate",
                        "rate",
                      ]
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
                        "extension_months",
                        "requested_months",
                      ]
                    )}
                  </strong>
                </div>

              </div>

              <div className="investment-form">

                <label>
                  Remarks
                </label>

                <textarea
                  value={tenureRemarks}
                  onChange={(event) =>
                    setTenureRemarks(
                      event.target.value
                    )
                  }
                  placeholder="Enter remarks"
                />

                <div className="investment-modal-actions">

                  <button
                    type="button"
                    className="modal-cancel"
                    onClick={
                      closeTenureApprove
                    }
                    disabled={
                      tenureActionLoading
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="modal-approve"
                    onClick={
                      handleTenureApprove
                    }
                    disabled={
                      tenureActionLoading
                    }
                  >
                    {tenureActionLoading
                      ? "Approving..."
                      : "Approve Extension"}
                  </button>

                </div>

              </div>

            </div>
          </div>
        )}

      {tenureRejectOpen &&
        selectedTenureRequest && (
          <div
            className="investment-modal-overlay"
            onClick={
              closeTenureReject
            }
          >
            <div
              className="investment-modal investment-action-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="investment-modal-header">

                <div>
                  <h2>
                    Reject Extension
                  </h2>

                  <p>
                    Reject tenure extension
                    request
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeTenureReject
                  }
                  disabled={
                    tenureActionLoading
                  }
                >
                  ×
                </button>

              </div>

              <div className="investment-form">

                <label>
                  Rejection Reason
                </label>

                <textarea
                  value={
                    tenureRejectionReason
                  }
                  onChange={(event) =>
                    setTenureRejectionReason(
                      event.target.value
                    )
                  }
                  placeholder="Enter rejection reason"
                />

                <label>
                  Remarks
                </label>

                <textarea
                  value={tenureRemarks}
                  onChange={(event) =>
                    setTenureRemarks(
                      event.target.value
                    )
                  }
                  placeholder="Enter remarks"
                />

                <div className="investment-modal-actions">

                  <button
                    type="button"
                    className="modal-cancel"
                    onClick={
                      closeTenureReject
                    }
                    disabled={
                      tenureActionLoading
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="modal-reject"
                    onClick={
                      handleTenureReject
                    }
                    disabled={
                      tenureActionLoading
                    }
                  >
                    {tenureActionLoading
                      ? "Rejecting..."
                      : "Reject Extension"}
                  </button>

                </div>

              </div>

            </div>
          </div>
        )}

    </div>
  );
}