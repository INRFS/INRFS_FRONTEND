import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Plus,
  Eye,
  Download,
  Clock,
  RefreshCw,
  Lock,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getMyInvestments,
  getMyInvestmentBond,
  getInvestmentTenures,
  requestTenureExtension,
  requestPreClose,
} from "../../services/investment_service";
import {
  StatusBadge,
  formatINR,
} from "./InvestorDataContext";
import "../../Styles/Investor/MyInvestments.css";

const getTenureMonths = (
  tenure
) => {
  const value =
    tenure?.tenure_months ??
    tenure?.tenureMonths ??
    tenure?.months ??
    tenure?.duration_months ??
    tenure?.durationMonths;

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const getInvestmentTenureId = (
  investment
) => {
  const value =
    investment?.tenure_id ??
    investment?.tenureId;

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

const getInvestmentId = (
  investment
) => {
  return (
    investment?.id ??
    investment?.investment_id
  );
};

const getInvestmentStatus = (
  investment
) => {
  const value =
    investment?.status_name ??
    investment?.statusName ??
    investment?.status?.status_name ??
    investment?.status?.name;

  if (value) {
    const status =
      String(value)
        .trim()
        .toLowerCase();

    if (
      status === "active" ||
      status === "approved"
    ) {
      return "Active";
    }

    if (
      status ===
        "pending approval" ||
      status === "pending"
    ) {
      return "Pending Approval";
    }

    if (
      status === "closed" ||
      status === "settled"
    ) {
      return "Closed";
    }

    if (
      status === "rejected" ||
      status === "reject"
    ) {
      return "Rejected";
    }

    if (
      status === "refunded" ||
      status === "refund"
    ) {
      return "Refunded";
    }

    if (
      status ===
        "extension requested"
    ) {
      return "Extension Requested";
    }

    if (
      status ===
        "pre-close requested" ||
      status ===
        "preclose requested"
    ) {
      return "Pre-Close Requested";
    }

    return value;
  }

  const statusId = Number(
    investment?.investment_status_id ??
      investment?.status_id
  );

  if (statusId === 2) {
    return "Active";
  }

  if (statusId === 1) {
    return "Pending Approval";
  }

  if (statusId === 3) {
    return "Closed";
  }

  if (statusId === 4) {
    return "Rejected";
  }

  if (statusId === 5) {
    return "Refunded";
  }

  return "Unknown";
};

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const getAmount = (
  investment
) => {
  return (
    investment?.investment_amount ??
    investment?.amount ??
    0
  );
};

const getInterestRate = (
  investment
) => {
  const rate =
    investment?.interest_rate ??
    investment?.interestRate ??
    0;

  return `${rate}% p.a.`;
};

const getMonthlyInterest = (
  investment
) => {
  if (
    investment?.monthly_interest !==
      undefined &&
    investment?.monthly_interest !==
      null
  ) {
    return investment.monthly_interest;
  }

  if (
    investment?.expected_monthly_interest !==
      undefined &&
    investment?.expected_monthly_interest !==
      null
  ) {
    return investment.expected_monthly_interest;
  }

  const amount = Number(
    getAmount(investment)
  );

  const rate = Number(
    investment?.interest_rate ??
      investment?.interestRate ??
      0
  );

  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(rate)
  ) {
    return 0;
  }

  return (
    (amount * rate) /
    100 /
    12
  );
};

const getEarnedAmount = (
  investment
) => {
  return (
    investment?.earned ??
    investment?.earned_amount ??
    investment?.expected_interest_amount ??
    0
  );
};

export default function Myinvestments() {
  const navigate =
    useNavigate();

  const [
    investments,
    setInvestments,
  ] = useState([]);

  const [
    investmentTenures,
    setInvestmentTenures,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    ,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    activeTab,
    setActiveTab,
  ] = useState("all");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    extensionModal,
    setExtensionModal,
  ] = useState(null);

  const [
    preCloseModal,
    setPreCloseModal,
  ] = useState(null);

  const [
    selectedExtension,
    setSelectedExtension,
  ] = useState("");

  const [
    extensionRemarks,
    setExtensionRemarks,
  ] = useState("");

  const [
    preCloseReason,
    setPreCloseReason,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    localActionState,
    setLocalActionState,
  ] = useState({});

  const loadInvestments =
    useCallback(
      async (
        showLoader = true
      ) => {
        try {
          if (showLoader) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setError("");

          const [
            investmentsResponse,
            tenureResponse,
          ] = await Promise.all([
            getMyInvestments(),
            getInvestmentTenures(),
          ]);

          const investmentList =
            Array.isArray(
              investmentsResponse
            )
              ? investmentsResponse
              : investmentsResponse?.data ||
                investmentsResponse?.investments ||
                [];

          const tenureList =
            Array.isArray(
              tenureResponse
            )
              ? tenureResponse
              : tenureResponse?.data ||
                tenureResponse?.items ||
                tenureResponse?.tenures ||
                [];

          const normalized =
            investmentList.map(
              (investment) => {
                const tenureId =
                  getInvestmentTenureId(
                    investment
                  );

                const matchingTenure =
                  tenureList.find(
                    (tenure) =>
                      Number(
                        tenure?.id
                      ) ===
                      Number(
                        tenureId
                      )
                  );

                const tenureMonths =
                  getTenureMonths(
                    matchingTenure
                  );

                return {
                  ...investment,
                  tenureId,
                  tenureMonths,
                  status_name:
                    getInvestmentStatus(
                      investment
                    ),
                };
              }
            );

          // Bond number is created by the backend when an investment is approved.
          // Fetch it for active investments so the table always shows the latest value.
          const normalizedWithBonds =
            await Promise.all(
              normalized.map(
                async (investment) => {
                  const investmentId =
                    getInvestmentId(
                      investment
                    );

                  const status =
                    getInvestmentStatus(
                      investment
                    );

                  if (
                    !investmentId ||
                    status !== "Active"
                  ) {
                    return investment;
                  }

                  try {
                    const bond =
                      await getMyInvestmentBond(
                        investmentId
                      );

                    const bondNumber =
                      bond?.bond_number ||
                      bond?.bond_id ||
                      bond?.bondNumber;

                    return bondNumber
                      ? {
                          ...investment,
                          bond_number: bondNumber,
                          bond: bondNumber,
                        }
                      : investment;
                  } catch (bondError) {
                    // Keep the investment visible even if the bond endpoint is temporarily unavailable.
                    return investment;
                  }
                }
              )
            );

          setInvestments(
            normalizedWithBonds
          );

          setInvestmentTenures(
            tenureList
          );
        } catch (err) {
          setError(
            err?.message ||
              "Unable to load investments."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer =
      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);

    return () =>
      clearTimeout(timer);
  }, [successMessage]);

  const activeInvestments =
    useMemo(() => {
      return investments.filter(
        (investment) =>
          getInvestmentStatus(
            investment
          ) === "Active"
      );
    }, [investments]);

  const pendingInvestments =
    useMemo(() => {
      return investments.filter(
        (investment) =>
          getInvestmentStatus(
            investment
          ) ===
          "Pending Approval"
      );
    }, [investments]);

  const otherInvestments =
    useMemo(() => {
      return investments.filter(
        (investment) => {
          const status =
            getInvestmentStatus(
              investment
            );

          return (
            status !== "Active" &&
            status !==
              "Pending Approval"
          );
        }
      );
    }, [investments]);

  const visibleInvestments =
    useMemo(() => {
      let list =
        investments;

      if (
        activeTab ===
        "active"
      ) {
        list =
          activeInvestments;
      }

      if (
        activeTab ===
        "pending"
      ) {
        list =
          pendingInvestments;
      }

      if (
        activeTab ===
        "other"
      ) {
        list =
          otherInvestments;
      }

      const query =
        searchTerm
          .trim()
          .toLowerCase();

      if (!query) {
        return list;
      }

      return list.filter(
        (investment) => {
          const values = [
            investment?.investment_id,
            investment?.bond_number,
            investment?.bond,
            investment?.utr,
            investment?.investment_amount,
            investment?.status_name,
          ];

          return values.some(
            (value) =>
              value !==
                undefined &&
              value !== null &&
              String(value)
                .toLowerCase()
                .includes(query)
          );
        }
      );
    }, [
      activeTab,
      investments,
      activeInvestments,
      pendingInvestments,
      otherInvestments,
      searchTerm,
    ]);

  const getAvailableExtensions =
    useCallback(
      (investment) => {
        const currentMonths =
          Number(
            investment?.tenureMonths
          );

        if (
          !Number.isFinite(
            currentMonths
          ) ||
          currentMonths <= 0
        ) {
          return [];
        }

        const validTenures =
          investmentTenures
            .map(
              (tenure) => {
                const months =
                  getTenureMonths(
                    tenure
                  );

                return {
                  id:
                    tenure?.id,
                  months,
                  name:
                    tenure?.tenure_name ||
                    tenure?.name ||
                    `${months} Months`,
                };
              }
            )
            .filter(
              (tenure) =>
                tenure.months >
                  currentMonths
            )
            .sort(
              (a, b) =>
                a.months -
                b.months
            );

        return validTenures
          .map(
            (tenure) => ({
              ...tenure,
              extensionMonths:
                tenure.months -
                currentMonths,
            })
          )
          .filter(
            (tenure) =>
              tenure.extensionMonths >
              0
          );
      },
      [investmentTenures]
    );

  const openExtensionModal =
    (investment) => {
      const options =
        getAvailableExtensions(
          investment
        );

      if (
        options.length === 0
      ) {
        setError(
          "No valid tenure extension is available for this investment."
        );
        return;
      }

      setError("");

      setSelectedExtension(
        String(
          options[0]
            .extensionMonths
        )
      );

      setExtensionRemarks("");

      setExtensionModal(
        {
          investment,
          options,
        }
      );
    };

  const closeExtensionModal =
    () => {
      if (submitting) {
        return;
      }

      setExtensionModal(null);
      setSelectedExtension("");
      setExtensionRemarks("");
    };

  const openPreCloseModal =
    (investment) => {
      setError("");
      setPreCloseReason("");

      setPreCloseModal(
        investment
      );
    };

  const closePreCloseModal =
    () => {
      if (submitting) {
        return;
      }

      setPreCloseModal(null);
      setPreCloseReason("");
    };

  const handleExtensionSubmit =
    async () => {
      if (
        !extensionModal?.investment
      ) {
        return;
      }

      const investment =
        extensionModal.investment;

      const investmentId =
        getInvestmentId(
          investment
        );

      const extensionMonths =
        Number(
          selectedExtension
        );

      if (
        !investmentId
      ) {
        setError(
          "Investment ID is missing."
        );
        return;
      }

      if (
        !Number.isFinite(
          extensionMonths
        ) ||
        extensionMonths <= 0
      ) {
        setError(
          "Please select a valid tenure extension."
        );
        return;
      }

      try {
        setSubmitting(true);
        setError("");

        await requestTenureExtension(
          investmentId,
          extensionMonths,
          extensionRemarks
        );

        setSuccessMessage(
          "Tenure extension request submitted successfully."
        );

        closeExtensionModal();

        setLocalActionState(
          (previous) => ({
            ...previous,
            [investmentId]:
              "Extension Requested",
          })
        );

        await loadInvestments(
          false
        );
      } catch (err) {
        setError(
          err?.message ||
            "Unable to submit tenure extension request."
        );
      } finally {
        setSubmitting(false);
      }
    };

  const handlePreCloseSubmit =
    async () => {
      if (!preCloseModal) {
        return;
      }

      const investmentId =
        getInvestmentId(
          preCloseModal
        );

      const reason =
        preCloseReason.trim();

      if (!investmentId) {
        setError(
          "Investment ID is missing."
        );
        return;
      }

      if (!reason) {
        setError(
          "Please enter a pre-close reason."
        );
        return;
      }

      try {
        setSubmitting(true);
        setError("");

        await requestPreClose(
          investmentId,
          reason
        );

        setSuccessMessage(
          "Pre-close request submitted successfully."
        );

        closePreCloseModal();

        setLocalActionState(
          (previous) => ({
            ...previous,
            [investmentId]:
              "Pre-Close Requested",
          })
        );

        await loadInvestments(
          false
        );
      } catch (err) {
        setError(
          err?.message ||
            "Unable to submit pre-close request."
        );
      } finally {
        setSubmitting(false);
      }
    };

  const handleView =
    async (investment) => {
      const investmentId =
        getInvestmentId(
          investment
        );

      if (!investmentId) {
        setError(
          "Investment ID is missing."
        );
        return;
      }

      try {
        setError("");

        const bond =
          await getMyInvestmentBond(
            investmentId
          );

        const bondNumber =
          bond?.bond_number ||
          bond?.bond_id ||
          bond?.bondNumber;

        if (!bondNumber) {
          setError(
            "Bond certificate has not been generated yet. Please refresh after admin approval."
          );
          return;
        }

        // Use the numeric investment ID in the URL. The certificate page
        // fetches the bond securely for the logged-in investor.
        navigate(
          `/investor/bond-certificate/${encodeURIComponent(
            investmentId
          )}`
        );
      } catch (err) {
        setError(
          err?.message ||
            "Unable to open the bond certificate."
        );
      }
    };

const getActionState =
    (investment) => {
      const investmentId =
        getInvestmentId(
          investment
        );

      return (
        localActionState[
          investmentId
        ] || ""
      );
    };

  return (
    <div className="investor-page">
      <div className="my-investments-stat-grid">
        <div className="my-investments-stat-card my-investments-stat-card--blue">
          <span>Total Investments</span>
          <strong>{investments.length}</strong>
          <small>All investment requests</small>
        </div>
        <div className="my-investments-stat-card my-investments-stat-card--green">
          <span>Active Investments</span>
          <strong>{activeInvestments.length}</strong>
          <small>Currently active</small>
        </div>
        <div className="my-investments-stat-card my-investments-stat-card--amber">
          <span>Pending Approval</span>
          <strong>{pendingInvestments.length}</strong>
          <small>Waiting for admin</small>
        </div>
        <div className="my-investments-stat-card my-investments-stat-card--purple">
          <span>Other Investments</span>
          <strong>{otherInvestments.length}</strong>
          <small>Closed or rejected</small>
        </div>
        <div className="my-investments-stat-card my-investments-stat-card--teal">
          <span>Total Invested</span>
          <strong>{formatINR(investments.reduce((sum, investment) => sum + Number(getAmount(investment) || 0), 0))}</strong>
          <small>Total principal</small>
        </div>
        <div className="my-investments-stat-card my-investments-stat-card--blue">
          <span>Interest Earned</span>
          <strong>{formatINR(investments.reduce((sum, investment) => sum + Number(getEarnedAmount(investment) || 0), 0))}</strong>
          <small>Expected interest</small>
        </div>
      </div>

      {successMessage && (
        <div className="investment-alert investment-alert--success">
          <CheckCircle size={18} />
          <span>
            {successMessage}
          </span>
          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="investment-alert investment-alert--error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <X size={16} />
          </button>
        </div>
      )}

      {pendingInvestments.length >
        0 && (
        <div className="pending-approval-banner">
          <Clock size={18} />
          <p>
            <strong>
              Pending approval
            </strong>{" "}
            — Your investment request
            has been sent to the
            branch admin. Bond
            certificate will be
            generated once the admin
            approves and activates
            your investment.
          </p>
        </div>
      )}

      <div className="investor-table-card">
        <div className="investor-table-card__header">
          <div className="my-investments-header-tabs">

        <button
          type="button"
          className={`mb-tab${
            activeTab === "all"
              ? " mb-tab--active"
              : ""
          }`}
          onClick={() =>
            setActiveTab("all")
          }
        >
          All Investments
          <span className="mb-tab-count">
            {investments.length}
          </span>
        </button>

        <button
          type="button"
          className={`mb-tab${
            activeTab === "active"
              ? " mb-tab--active"
              : ""
          }`}
          onClick={() =>
            setActiveTab("active")
          }
        >
          Active
          <span className="mb-tab-count">
            {activeInvestments.length}
          </span>
        </button>

        <button
          type="button"
          className={`mb-tab${
            activeTab === "pending"
              ? " mb-tab--active"
              : ""
          }`}
          onClick={() =>
            setActiveTab("pending")
          }
        >
          Pending
          <span className="mb-tab-count">
            {pendingInvestments.length}
          </span>
        </button>

        <button
          type="button"
          className={`mb-tab${
            activeTab === "other"
              ? " mb-tab--active"
              : ""
          }`}
          onClick={() =>
            setActiveTab("other")
          }
        >
          Others
          <span className="mb-tab-count">
            {otherInvestments.length}
          </span>
        </button>

          </div>

          <div className="my-investments-header-actions">
       

          <div className="my-investments-header-search">
          <input
            className="investor-search-input"
            placeholder="Search investments or bonds..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />
               <button
              type="button"
              className="my-investment-add-tab"
              onClick={() =>
                navigate(
                  "/investor/invest-now"
                )
              }
            >
              <Plus size={14} />
              New Investment
            </button>
<button
            type="button"
            className="investor-btn investor-btn--outline"
          >
            <Download size={14} />
            Export
          </button>
          </div>
          </div>
        </div>

        {loading ? (
          <div className="mb-loading">
            Loading investments...
          </div>
        ) : (
          <>
            <div className="investor-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      Bond Number
                    </th>
                    <th>
                      Amount
                    </th>
                    <th>
                      Rate
                    </th>
                    <th>
                      Invested On
                    </th>
                    <th>
                      Matures On
                    </th>
                    <th>
                      Monthly Int.
                    </th>
                    <th>
                      Earned
                    </th>
                    <th>
                      Status
                    </th>
                    <th>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visibleInvestments.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="mb-no-results"
                      >
                        {activeTab ===
                        "active"
                          ? "No active investments yet."
                          : "No investments found."}
                      </td>
                    </tr>
                  )}

                  {visibleInvestments.map(
                    (
                      investment
                    ) => {
                      const investmentId =
                        getInvestmentId(
                          investment
                        );

                      const status =
                        getInvestmentStatus(
                          investment
                        );

                      const isPending =
                        status ===
                        "Pending Approval";

                      const isActive =
                        status ===
                        "Active";

                      const actionState =
                        getActionState(
                          investment
                        );

                      const bond =
                        investment?.bond_number ||
                        investment?.bond ||
                        "Pending...";

                      const extensionOptions =
                        getAvailableExtensions(
                          investment
                        );

                      return (
                        <tr
                          key={
                            investmentId
                          }
                        >
                          <td className="mono">
                            {isPending ? (
                              <span className="pending-bond-cell">
                                Pending...
                              </span>
                            ) : isActive ? (
                              <span
                                className="link"
                                style={{
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  handleView(
                                    investment
                                  )
                                }
                              >
                                {bond}
                              </span>
                            ) : (
                              <span className="pending-bond-cell">
                                —
                              </span>
                            )}
                          </td>

                          <td className="mono">
                            {formatINR(
                              getAmount(
                                investment
                              )
                            )}
                          </td>

                          <td>
                            <span
                              className={`rate-pill${
                                isPending
                                  ? " rate-pill--initial"
                                  : ""
                              }`}
                            >
                              {getInterestRate(
                                investment
                              )}
                              {isPending
                                ? " (initial)"
                                : ""}
                            </span>
                          </td>

                          <td>
                            {formatDate(
                              investment?.investment_date ||
                                investment?.investmentDate
                            )}
                          </td>

                          <td>
                            {isPending
                              ? "—"
                              : formatDate(
                                  investment?.maturity_date ||
                                    investment?.maturityDate
                                )}
                          </td>

                          <td className="mono amount-positive">
                            {formatINR(
                              getMonthlyInterest(
                                investment
                              )
                            )}
                          </td>

                          <td className="mono">
                            {formatINR(
                              getEarnedAmount(
                                investment
                              )
                            )}
                          </td>

                          <td>
                            <StatusBadge
                              status={
                                actionState ||
                                status
                              }
                            />
                          </td>

                          <td className="investor-table-actions">
                            {isPending ? (
                              <span className="pending-actions-lock">
                                <Lock size={12} />
                                Pending
                                Approval
                              </span>
                            ) : isActive ? (
                              <>
                                <button
                                  type="button"
                                  title="View"
                                  className="icon-btn icon-btn--view"
                                  onClick={() =>
                                    handleView(
                                      investment
                                    )
                                  }
                                >
                                  <Eye size={14} />
                                </button>

                                <button
                                  type="button"
                                  title="Download Bond"
                                  className="icon-btn icon-btn--settle"
                                  onClick={() =>
                                    handleView(
                                      investment
                                    )
                                  }
                                >
                                  <Download size={14} />
                                </button>

                                {actionState !==
                                  "Extension Requested" &&
                                  actionState !==
                                    "Pre-Close Requested" && (
                                    <>
                                      <button
                                        type="button"
                                        className="bond-action-btn bond-action-btn--extend"
                                        onClick={() =>
                                          openExtensionModal(
                                            investment
                                          )
                                        }
                                        disabled={
                                          extensionOptions.length ===
                                          0
                                        }
                                      >
                                        <RefreshCw size={13} />
                                        Extend
                                      </button>

                                      <button
                                        type="button"
                                        className="bond-action-btn bond-action-btn--preclose"
                                        onClick={() =>
                                          openPreCloseModal(
                                            investment
                                          )
                                        }
                                      >
                                        <X size={13} />
                                        Pre-Close
                                      </button>
                                    </>
                                  )}

                                {actionState ===
                                  "Extension Requested" && (
                                  <span className="request-status request-status--extend">
                                    Extension
                                    Requested
                                  </span>
                                )}

                                {actionState ===
                                  "Pre-Close Requested" && (
                                  <span className="request-status request-status--preclose">
                                    Pre-Close
                                    Requested
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="no-actions">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>

            <p className="admin-table-footer">
              Showing{" "}
              {visibleInvestments.length >
              0
                ? `1–${visibleInvestments.length}`
                : "0"}{" "}
              of{" "}
              {visibleInvestments.length}{" "}
              records
            </p>
          </>
        )}
      </div>

      {extensionModal && (
        <div className="investment-modal-overlay">
          <div className="investment-modal">
            <div className="investment-modal__header">
              <div>
                <h3>
                  Extend Investment
                </h3>
                <p>
                  Select the new tenure
                  for this investment.
                </p>
              </div>

              <button
                type="button"
                className="investment-modal__close"
                onClick={
                  closeExtensionModal
                }
                disabled={
                  submitting
                }
              >
                <X size={18} />
              </button>
            </div>

            <div className="investment-modal__body">
              <div className="investment-modal-info">
                <div>
                  <span>
                    Investment
                  </span>
                  <strong>
                    {getInvestmentId(
                      extensionModal.investment
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Current Tenure
                  </span>
                  <strong>
                    {
                      extensionModal
                        .investment
                        .tenureMonths
                    }{" "}
                    Months
                  </strong>
                </div>
              </div>

              <label className="investment-modal-label">
                Select Extension
              </label>

              <div className="extension-options">
                {extensionModal.options.map(
                  (option) => (
                    <button
                      type="button"
                      key={`${option.id}-${option.months}`}
                      className={`extension-option${
                        String(
                          option.extensionMonths
                        ) ===
                        String(
                          selectedExtension
                        )
                          ? " extension-option--active"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedExtension(
                          String(
                            option.extensionMonths
                          )
                        )
                      }
                    >
                      <strong>
                        +
                        {
                          option.extensionMonths
                        }{" "}
                        Months
                      </strong>
                      <span>
                        Total{" "}
                        {
                          option.months
                        }{" "}
                        Months
                      </span>
                    </button>
                  )
                )}
              </div>

              <label className="investment-modal-label">
                Remarks
              </label>

              <textarea
                className="investment-modal-textarea"
                value={
                  extensionRemarks
                }
                onChange={(event) =>
                  setExtensionRemarks(
                    event.target.value
                  )
                }
                placeholder="Enter remarks"
                rows={3}
                disabled={
                  submitting
                }
              />
            </div>

            <div className="investment-modal__footer">
              <button
                type="button"
                className="investor-btn investor-btn--outline"
                onClick={
                  closeExtensionModal
                }
                disabled={
                  submitting
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="investor-btn investor-btn--primary"
                onClick={
                  handleExtensionSubmit
                }
                disabled={
                  submitting ||
                  !selectedExtension
                }
              >
                {submitting
                  ? "Submitting..."
                  : "Send Extension Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {preCloseModal && (
        <div className="investment-modal-overlay">
          <div className="investment-modal">
            <div className="investment-modal__header">
              <div>
                <h3>
                  Pre-Close Investment
                </h3>
                <p>
                  Send a pre-close request
                  to the administrator.
                </p>
              </div>

              <button
                type="button"
                className="investment-modal__close"
                onClick={
                  closePreCloseModal
                }
                disabled={
                  submitting
                }
              >
                <X size={18} />
              </button>
            </div>

            <div className="investment-modal__body">
              <div className="investment-modal-info">
                <div>
                  <span>
                    Investment
                  </span>
                  <strong>
                    {getInvestmentId(
                      preCloseModal
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Amount
                  </span>
                  <strong>
                    {formatINR(
                      getAmount(
                        preCloseModal
                      )
                    )}
                  </strong>
                </div>
              </div>

              <label className="investment-modal-label">
                Reason
              </label>

              <textarea
                className="investment-modal-textarea"
                value={
                  preCloseReason
                }
                onChange={(event) =>
                  setPreCloseReason(
                    event.target.value
                  )
                }
                placeholder="Enter reason for pre-close"
                rows={5}
                disabled={
                  submitting
                }
              />
            </div>

            <div className="investment-modal__footer">
              <button
                type="button"
                className="investor-btn investor-btn--outline"
                onClick={
                  closePreCloseModal
                }
                disabled={
                  submitting
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="investor-btn investor-btn--primary"
                onClick={
                  handlePreCloseSubmit
                }
                disabled={
                  submitting ||
                  !preCloseReason.trim()
                }
              >
                {submitting
                  ? "Submitting..."
                  : "Send Pre-Close Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}