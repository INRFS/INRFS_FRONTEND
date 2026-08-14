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
  Lock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

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

import "../../Styles/Investor/MyBonds.css";


const getInvestmentId = (
  investment
) => {
  return (
    investment?.id ??
    investment?.investment_id
  );
};


const getStatus = (
  investment
) => {
  const status =
    investment?.status_name ||
    investment?.statusName ||
    investment?.status?.status_name ||
    investment?.status?.name;

  if (status) {
    const value =
      String(status)
        .trim()
        .toLowerCase();

    if (
      value === "active" ||
      value === "approved"
    ) {
      return "Active";
    }

    if (
      value === "pending" ||
      value ===
        "pending approval" ||
      value ===
        "pending_admin_review" ||
      value ===
        "pending admin review"
    ) {
      return "Pending Approval";
    }

    if (
      value === "rejected" ||
      value === "reject"
    ) {
      return "Rejected";
    }

    if (
      value === "closed" ||
      value === "settled"
    ) {
      return "Closed";
    }

    return status;
  }

  const statusId = Number(
    investment?.investment_status_id
  );

  if (statusId === 1) {
    return "Pending Approval";
  }

  if (statusId === 2) {
    return "Active";
  }

  if (statusId === 3) {
    return "Closed";
  }

  if (statusId === 4) {
    return "Rejected";
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
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


const getMonthlyInterest = (
  investment
) => {
  if (
    investment?.expected_monthly_interest !==
      undefined &&
    investment?.expected_monthly_interest !==
      null
  ) {
    return Number(
      investment.expected_monthly_interest
    );
  }

  const amount =
    Number(
      investment?.investment_amount ||
      0
    );

  const rate =
    Number(
      investment?.interest_rate ||
      0
    );

  return (
    amount *
    rate /
    100
  );
};


const getEarned = (
  investment
) => {
  return Number(
    investment?.expected_interest_amount ||
    0
  );
};


export default function MyBonds() {
  const navigate =
    useNavigate();

  const [
    investments,
    setInvestments,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    activeTab,
    setActiveTab,
  ] = useState("all");

  const [
    extensionModal,
    setExtensionModal,
  ] = useState(null);

  const [
    extensionMonths,
    setExtensionMonths,
  ] = useState("6");

  const [
    extensionRemarks,
    setExtensionRemarks,
  ] = useState("");

  const [
    preCloseModal,
    setPreCloseModal,
  ] = useState(null);

  const [
    preCloseReason,
    setPreCloseReason,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);


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

          const response =
            await getMyInvestments();

          const list =
            Array.isArray(
              response
            )
              ? response
              : response?.data ||
                response?.investments ||
                [];

          const enriched =
            await Promise.all(
              list.map(
                async (
                  investment
                ) => {
                  const id =
                    getInvestmentId(
                      investment
                    );

                  let bond =
                    null;

                  if (
                    getStatus(
                      investment
                    ) ===
                    "Active" &&
                    id
                  ) {
                    try {
                      bond =
                        await getMyInvestmentBond(
                          id
                        );
                    } catch {
                      bond =
                        null;
                    }
                  }

                  return {
                    ...investment,
                    bond_id:
                      bond?.bond_id ||
                      null,
                    bond:
                      bond?.bond_id ||
                      null,
                    bond_details:
                      bond,
                  };
                }
              )
            );

          setInvestments(
            enriched
          );
        } catch (
          err
        ) {
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
  }, [
    loadInvestments,
  ]);


  const activeInvestments =
    useMemo(
      () =>
        investments.filter(
          (investment) =>
            getStatus(
              investment
            ) === "Active"
        ),
      [investments]
    );


  const pendingInvestments =
    useMemo(
      () =>
        investments.filter(
          (investment) =>
            getStatus(
              investment
            ) ===
            "Pending Approval"
        ),
      [investments]
    );


  const otherInvestments =
    useMemo(
      () =>
        investments.filter(
          (investment) => {
            const status =
              getStatus(
                investment
              );

            return (
              status !==
                "Active" &&
              status !==
                "Pending Approval"
            );
          }
        ),
      [investments]
    );


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
            investment?.bond_id,
            investment?.bond,
            investment?.investment_amount,
            getStatus(
              investment
            ),
          ];

          return values.some(
            (value) =>
              value !==
                undefined &&
              value !==
                null &&
              String(value)
                .toLowerCase()
                .includes(
                  query
                )
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


  const handleViewBond =
    (investment) => {
      const bond =
        investment?.bond_id ||
        investment?.bond;

      if (!bond) {
        setError(
          "Bond certificate has not been generated yet."
        );
        return;
      }

      navigate(
        `/investor/bond-certificate/${encodeURIComponent(
          bond
        )}`
      );
    };


  const handleDownloadBond =
    (investment) => {
      handleViewBond(
        investment
      );
    };


  const openExtension =
    (investment) => {
      setExtensionModal(
        investment
      );

      setExtensionMonths(
        "6"
      );

      setExtensionRemarks(
        ""
      );

      setError("");
    };


  const submitExtension =
    async () => {
      if (
        !extensionModal
      ) {
        return;
      }

      const id =
        getInvestmentId(
          extensionModal
        );

      const months =
        Number(
          extensionMonths
        );

      if (!id) {
        setError(
          "Investment ID is missing."
        );
        return;
      }

      if (
        !Number.isFinite(
          months
        ) ||
        months <= 0
      ) {
        setError(
          "Enter valid extension months."
        );
        return;
      }

      try {
        setSubmitting(
          true
        );
        setError("");

        await requestTenureExtension(
          id,
          months,
          extensionRemarks
        );

        setExtensionModal(
          null
        );

        await loadInvestments(
          false
        );
      } catch (
        err
      ) {
        setError(
          err?.message ||
            "Unable to submit tenure extension."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };


  const openPreClose =
    (investment) => {
      setPreCloseModal(
        investment
      );

      setPreCloseReason(
        ""
      );

      setError("");
    };


  const submitPreClose =
    async () => {
      if (
        !preCloseModal
      ) {
        return;
      }

      const id =
        getInvestmentId(
          preCloseModal
        );

      const reason =
        preCloseReason.trim();

      if (!id) {
        setError(
          "Investment ID is missing."
        );
        return;
      }

      if (!reason) {
        setError(
          "Enter a pre-close reason."
        );
        return;
      }

      try {
        setSubmitting(
          true
        );
        setError("");

        await requestPreClose(
          id,
          reason
        );

        setPreCloseModal(
          null
        );

        await loadInvestments(
          false
        );
      } catch (
        err
      ) {
        setError(
          err?.message ||
            "Unable to submit pre-close request."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };


  return (
    <div className="investor-page">

      <div className="investor-page-actions investor-page-actions--end">

        <button
          type="button"
          className="investor-btn investor-btn--primary"
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
          onClick={() =>
            loadInvestments(
              false
            )
          }
          disabled={refreshing}
        >
          <RefreshCw
            size={14}
            className={
              refreshing
                ? "spin"
                : ""
            }
          />
          Refresh
        </button>

      </div>


      {error && (
        <div className="investment-alert investment-alert--error">
          <AlertCircle
            size={18}
          />
          <span>
            {error}
          </span>
        </div>
      )}


      {pendingInvestments.length >
        0 && (
        <div className="pending-approval-banner">
          <Clock
            size={18}
          />

          <p>
            <strong>
              Pending approval
            </strong>{" "}
            — Your investment
            request has been
            sent to the branch
            admin. Bond
            certificate will be
            generated once the
            admin approves and
            activates your
            investment.
          </p>
        </div>
      )}


      <div className="mb-tabs">

        <button
          type="button"
          className={`mb-tab${
            activeTab === "all"
              ? " mb-tab--active"
              : ""
          }`}
          onClick={() =>
            setActiveTab(
              "all"
            )
          }
        >
          All Investments

          <span className="mb-tab-count">
            {
              investments.length
            }
          </span>
        </button>


        <button
          type="button"
          className={`mb-tab${
            activeTab ===
            "active"
              ? " mb-tab--active"
              : ""
          }`}
          onClick={() =>
            setActiveTab(
              "active"
            )
          }
        >
          Active

          <span className="mb-tab-count">
            {
              activeInvestments.length
            }
          </span>
        </button>


        <button
          type="button"
          className={`mb-tab${
            activeTab ===
            "pending"
              ? " mb-tab--active"
              : ""
          }`}
          onClick={() =>
            setActiveTab(
              "pending"
            )
          }
        >
          Pending

          <span className="mb-tab-count">
            {
              pendingInvestments.length
            }
          </span>
        </button>


        <button
          type="button"
          className={`mb-tab${
            activeTab ===
            "other"
              ? " mb-tab--active"
              : ""
          }`}
          onClick={() =>
            setActiveTab(
              "other"
            )
          }
        >
          Others

          <span className="mb-tab-count">
            {
              otherInvestments.length
            }
          </span>
        </button>

      </div>


      <div className="investor-table-card">

        <div className="investor-table-card__header">

          <input
            className="investor-search-input"
            placeholder="Search investments or bonds..."
            value={
              searchTerm
            }
            onChange={(
              event
            ) =>
              setSearchTerm(
                event.target
                  .value
              )
            }
          />

          <button
            type="button"
            className="investor-btn investor-btn--outline"
          >
            <Download
              size={14}
            />
            Export
          </button>

        </div>


        {loading ? (
          <div className="mb-loading">
            Loading investments...
          </div>
        ) : (
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
                      No investments
                      found.
                    </td>
                  </tr>
                )}


                {visibleInvestments.map(
                  (
                    investment
                  ) => {
                    const status =
                      getStatus(
                        investment
                      );

                    const isPending =
                      status ===
                      "Pending Approval";

                    const isActive =
                      status ===
                      "Active";

                    const bond =
                      investment?.bond_id ||
                      investment?.bond;

                    const amount =
                      Number(
                        investment?.investment_amount ||
                        0
                      );

                    const rate =
                      Number(
                        investment?.interest_rate ||
                        0
                      );

                    return (
                      <tr
                        key={
                          getInvestmentId(
                            investment
                          )
                        }
                      >

                        <td className="mono">

                          {isPending ||
                          !bond ? (
                            <span className="pending-bond-cell">
                              Pending...
                            </span>
                          ) : (
                            <span
                              className="link"
                              style={{
                                cursor:
                                  "pointer",
                              }}
                              onClick={() =>
                                handleViewBond(
                                  investment
                                )
                              }
                            >
                              {bond}
                            </span>
                          )}

                        </td>


                        <td className="mono">
                          {formatINR(
                            amount
                          )}
                        </td>


                        <td>
                          <span
                            className="rate-pill"
                          >
                            {rate}%
                          </span>
                        </td>


                        <td>
                          {formatDate(
                            investment?.investment_date
                          )}
                        </td>


                        <td>
                          {formatDate(
                            investment?.maturity_date
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
                            getEarned(
                              investment
                            )
                          )}
                        </td>


                        <td>
                          <StatusBadge
                            status={
                              status
                            }
                          />
                        </td>


                        <td className="investor-table-actions">

                          {isPending ? (
                            <span className="pending-actions-lock">
                              <Lock
                                size={12}
                              />
                              Pending Approval
                            </span>
                          ) : isActive &&
                            bond ? (
                            <>
                              <button
                                type="button"
                                title="View Bond"
                                className="icon-btn icon-btn--view"
                                onClick={() =>
                                  handleViewBond(
                                    investment
                                  )
                                }
                              >
                                <Eye
                                  size={14}
                                />
                              </button>

                              <button
                                type="button"
                                title="Download Bond"
                                className="icon-btn icon-btn--settle"
                                onClick={() =>
                                  handleDownloadBond(
                                    investment
                                  )
                                }
                              >
                                <Download
                                  size={14}
                                />
                              </button>

                              <button
                                type="button"
                                className="investor-btn investor-btn--outline"
                                onClick={() =>
                                  openExtension(
                                    investment
                                  )
                                }
                              >
                                Extend
                              </button>

                              <button
                                type="button"
                                className="investor-btn investor-btn--danger"
                                onClick={() =>
                                  openPreClose(
                                    investment
                                  )
                                }
                              >
                                Pre-Close
                              </button>
                            </>
                          ) : (
                            <span>
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

            <p className="admin-table-footer">
              Showing{" "}
              {
                visibleInvestments.length
              }{" "}
              of{" "}
              {
                visibleInvestments.length
              }{" "}
              records
            </p>

          </div>
        )}

      </div>


      {extensionModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            !submitting &&
            setExtensionModal(
              null
            )
          }
        >
          <div
            className="modal-box"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">
              <h3>
                Extend Investment
              </h3>

              <button
                type="button"
                onClick={() =>
                  setExtensionModal(
                    null
                  )
                }
              >
                ×
              </button>
            </div>

            <div className="modal-body">

              <label>
                Extension Months
              </label>

              <select
                value={
                  extensionMonths
                }
                onChange={(
                  event
                ) =>
                  setExtensionMonths(
                    event.target
                      .value
                  )
                }
              >
                <option value="3">
                  3 Months
                </option>
                <option value="6">
                  6 Months
                </option>
                <option value="12">
                  12 Months
                </option>
                <option value="36">
                  36 Months
                </option>
              </select>


              <label>
                Remarks
              </label>

              <textarea
                value={
                  extensionRemarks
                }
                onChange={(
                  event
                ) =>
                  setExtensionRemarks(
                    event.target
                      .value
                  )
                }
                placeholder="Optional remarks"
              />

            </div>

            <div className="modal-footer">

              <button
                type="button"
                onClick={() =>
                  setExtensionModal(
                    null
                  )
                }
                disabled={
                  submitting
                }
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  submitExtension
                }
                disabled={
                  submitting
                }
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Request"}
              </button>

            </div>

          </div>
        </div>
      )}


      {preCloseModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            !submitting &&
            setPreCloseModal(
              null
            )
          }
        >
          <div
            className="modal-box"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">
              <h3>
                Pre-Close Investment
              </h3>

              <button
                type="button"
                onClick={() =>
                  setPreCloseModal(
                    null
                  )
                }
              >
                ×
              </button>
            </div>

            <div className="modal-body">

              <label>
                Reason
              </label>

              <textarea
                value={
                  preCloseReason
                }
                onChange={(
                  event
                ) =>
                  setPreCloseReason(
                    event.target
                      .value
                  )
                }
                placeholder="Enter reason"
              />

            </div>

            <div className="modal-footer">

              <button
                type="button"
                onClick={() =>
                  setPreCloseModal(
                    null
                  )
                }
                disabled={
                  submitting
                }
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  submitPreClose
                }
                disabled={
                  submitting
                }
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Request"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}