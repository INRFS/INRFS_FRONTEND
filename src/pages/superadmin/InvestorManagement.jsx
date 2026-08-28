import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Search,
  RefreshCw,
  Download,
  Eye,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  IndianRupee,
} from "lucide-react";

import {
  getInvestorManagement,
  getInvestorManagementSummary,
  getInvestorManagementDetails,
  getInvestorManagementBranches,
  getInvestorManagementStatuses,
  exportInvestorsCSV,
} from "../../services/superadmin/investorManagementService";

import "../../Styles/SuperAdmin/InvestorManagement.css";

function normalizeInvestor(row) {
  return {
    id:
      row?.investor_id ??
      row?.id ??
      row?.investor_code ??
      "-",

    name:
      row?.full_name ??
      row?.investor_name ??
      row?.name ??
      "-",

    mobile:
      row?.mobile ??
      row?.mobile_number ??
      row?.phone ??
      "-",

    branch:
      row?.branch_name ??
      row?.branch ??
      "-",

    branchId:
      row?.branch_id ??
      row?.branchId ??
      row?.service_location_id ??
      "",

    registered:
      row?.registered_date ??
      row?.registration_date ??
      row?.created_at ??
      row?.created_date ??
      null,

    kyc:
      row?.kyc_status_name ??
      row?.kyc_status ??
      row?.kyc ??
      "-",

    status:
      row?.status_name ??
      row?.status ??
      "-",

    statusId:
      row?.status_id ??
      row?.statusId ??
      "",

    aum:
      row?.aum ??
      row?.total_investment ??
      row?.investment_amount ??
      0,

    raw: row,
  };
}

function formatDate(value) {
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
}

function formatCurrency(value) {
  const number = Number(value || 0);

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function Dropdown({
  label,
  options,
  value,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (
        ref.current &&
        !ref.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, []);

  const selected = options.find(
    (option) =>
      String(option.value) === String(value)
  );

  return (
    <div
      className="ivm-dropdown"
      ref={ref}
    >
      <button
        type="button"
        className="ivm-dropdown-btn"
        onClick={() =>
          setOpen((current) => !current)
        }
      >
        <span>
          {selected?.label || label}
        </span>

        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="ivm-dropdown-menu">
          <button
            type="button"
            className={`ivm-dropdown-item ${
              !value
                ? "ivm-dropdown-item-active"
                : ""
            }`}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            {label}
          </button>

          {options.map((option) => (
            <button
              type="button"
              key={String(option.value)}
              className={`ivm-dropdown-item ${
                String(value) ===
                String(option.value)
                  ? "ivm-dropdown-item-active"
                  : ""
              }`}
              onClick={() => {
                onChange(
                  String(option.value)
                );
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InvestorManagement() {
  const [investors, setInvestors] =
    useState([]);

  const [summary, setSummary] =
    useState({});

  const [branches, setBranches] =
    useState([]);

  const [statuses, setStatuses] =
    useState([]);

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [branchFilter, setBranchFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [limit] =
    useState(10);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedInvestor, setSelectedInvestor] =
    useState(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const offset =
    (page - 1) * limit;

  const totalPages = Math.max(
    1,
    Math.ceil(total / limit)
  );

  const loadSummary = async () => {
    try {
      const response =
        await getInvestorManagementSummary();

      setSummary(
        response?.data || {}
      );
    } catch (err) {
      console.error(
        "Investor summary error:",
        err
      );
    }
  };

  const loadFilters = async () => {
    try {
      const [
        branchResponse,
        statusResponse,
      ] = await Promise.all([
        getInvestorManagementBranches(),
        getInvestorManagementStatuses(),
      ]);

      const branchRows =
        Array.isArray(
          branchResponse?.data
        )
          ? branchResponse.data
          : [];

      const statusRows =
        Array.isArray(
          statusResponse?.data
        )
          ? statusResponse.data
          : [];

      const branchOptions =
        branchRows
          .filter(
            (item) =>
              item?.id !== null &&
              item?.id !== undefined &&
              item?.branch_name
          )
          .map((item) => ({
            value: String(item.id),
            label: String(
              item.branch_name
            ),
          }));

      const statusOptions =
        statusRows
          .filter(
            (item) =>
              item?.id !== null &&
              item?.id !== undefined &&
              (item?.status_name ||
                item?.status)
          )
          .map((item) => ({
            value: String(item.id),
            label: String(
              item.status_name ||
                item.status
            ),
          }));

      setBranches(
        branchOptions
      );

      setStatuses(
        statusOptions
      );
    } catch (err) {
      console.error(
        "Investor filters loading error:",
        err
      );

      setBranches([]);
      setStatuses([]);
    }
  };

  const loadInvestors = async ({
    showLoader = true,
  } = {}) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const response =
        await getInvestorManagement({
          search,
          branchId: branchFilter,
          statusId: statusFilter,
          limit,
          offset,
        });

      const rows =
        Array.isArray(
          response?.data
        )
          ? response.data
          : [];

      const normalized =
        rows.map(
          normalizeInvestor
        );

      setInvestors(
        normalized
      );

      setTotal(
        Number(
          response?.total ??
            response?.count ??
            normalized.length
        )
      );
    } catch (err) {
      console.error(
        "Investor loading error:",
        err
      );

      setInvestors([]);
      setTotal(0);

      setError(
        err?.message ||
          "Unable to load investors."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSummary();
    loadFilters();
  }, []);

  useEffect(() => {
    loadInvestors({
      showLoader: true,
    });
  }, [
    search,
    branchFilter,
    statusFilter,
    page,
  ]);

  const handleSearchChange = (
    event
  ) => {
    const value =
      event.target.value;

    setSearchInput(value);
    setSearch(value.trim());
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleRefresh = async () => {
    await Promise.all([
      loadInvestors({
        showLoader: false,
      }),
      loadSummary(),
    ]);
  };

  const openDetails = async (
    investor
  ) => {
    setSelectedInvestor({
      ...investor,
      details: null,
    });

    setDetailsLoading(true);

    try {
      const response =
        await getInvestorManagementDetails(
          investor.id
        );

      setSelectedInvestor({
        ...investor,
        details:
          response?.data || {},
      });
    } catch (err) {
      console.error(
        "Investor details error:",
        err
      );

      setSelectedInvestor({
        ...investor,
        details: {
          error:
            err?.message ||
            "Unable to load investor details.",
        },
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedInvestor(null);
  };

  const handleExport = () => {
    if (!investors.length) {
      return;
    }

    exportInvestorsCSV(
      investors,
      "investors.csv"
    );
  };

  const stats = useMemo(() => {
    const totalInvestors =
      summary?.total_investors ??
      summary?.investor_count ??
      summary?.total ??
      total;

    const active =
      summary?.active_investors ??
      summary?.active_count ??
      investors.filter(
        (item) =>
          String(
            item.status
          ).toLowerCase() ===
          "active"
      ).length;

    const inactive =
      summary?.inactive_investors ??
      summary?.inactive_count ??
      investors.filter(
        (item) =>
          String(
            item.status
          ).toLowerCase() ===
          "inactive"
      ).length;

    const aum =
      summary?.total_aum ??
      summary?.aum ??
      summary?.total_investment ??
      investors.reduce(
        (sum, item) =>
          sum +
          Number(
            item.aum || 0
          ),
        0
      );

    return [
      {
        title: "Total Investors",
        value: totalInvestors,
        icon: Users,
      },
      {
        title: "Active Investors",
        value: active,
        icon: UserCheck,
      },
      {
        title: "Inactive Investors",
        value: inactive,
        icon: UserX,
      },
      {
        title: "Total AUM",
        value: formatCurrency(
          aum
        ),
        icon: IndianRupee,
      },
    ];
  }, [
    summary,
    investors,
    total,
  ]);

  return (
    <div className="ivm-page">
      <div className="ivm-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              className="ivm-stat-card"
              key={stat.title}
            >
              <div className="ivm-stat-icon">
                <Icon size={20} />
              </div>

              <div>
                <div className="ivm-stat-title">
                  {stat.title}
                </div>

                <div className="ivm-stat-value">
                  {stat.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="ivm-toolbar">
        <div className="ivm-search">
          <Search size={17} />

          <input
            type="text"
            value={searchInput}
            placeholder="Search investor..."
            onChange={
              handleSearchChange
            }
          />

          {searchInput && (
            <button
              type="button"
              className="ivm-search-clear"
              onClick={
                clearSearch
              }
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <Dropdown
          label="All Branches"
          options={branches}
          value={branchFilter}
          onChange={(value) => {
            setBranchFilter(value);
            setPage(1);
          }}
        />

        <Dropdown
          label="All Status"
          options={statuses}
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        />

        <button
          type="button"
          className="ivm-export-btn"
          onClick={
            handleExport
          }
          disabled={
            !investors.length
          }
        >
          <Download size={16} />
          Export
        </button>
      </div>

      {error && (
        <div className="ivm-error">
          {error}
        </div>
      )}

      <div className="ivm-table-card">
        {loading ? (
          <div className="ivm-loading">
            <RefreshCw
              size={28}
              className="ivm-spin"
            />

            <p>
              Loading investors...
            </p>
          </div>
        ) : investors.length === 0 ? (
          <div className="ivm-empty">
            <Users size={42} />

            <h3>
              No investors found
            </h3>

            <p>
              Try changing your
              search or filters.
            </p>
          </div>
        ) : (
          <div className="ivm-table-wrap">
            <table className="ivm-table">
              <thead>
                <tr>
                  <th>
                    Investor
                  </th>

                  <th>
                    Mobile
                  </th>

                  <th>
                    Branch
                  </th>

                  <th>
                    Registered
                  </th>

                  <th>
                    KYC
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    AUM
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {investors.map(
                  (investor) => (
                    <tr
                      key={
                        investor.id
                      }
                    >
                      <td>
                        <div className="ivm-investor">
                          <div className="ivm-avatar">
                            {String(
                              investor.name ||
                                "I"
                            )
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {
                                investor.name
                              }
                            </strong>

                            <small>
                              {
                                investor.id
                              }
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {
                          investor.mobile
                        }
                      </td>

                      <td>
                        {
                          investor.branch
                        }
                      </td>

                      <td>
                        {formatDate(
                          investor.registered
                        )}
                      </td>

                      <td>
                        <span
                          className={`ivm-badge ivm-kyc-${String(
                            investor.kyc
                          )
                            .toLowerCase()
                            .replaceAll(
                              " ",
                              "-"
                            )}`}
                        >
                          {
                            investor.kyc
                          }
                        </span>
                      </td>

                      <td>
                        <span
                          className={`ivm-badge ivm-status-${String(
                            investor.status
                          )
                            .toLowerCase()
                            .replaceAll(
                              " ",
                              "-"
                            )}`}
                        >
                          {
                            investor.status
                          }
                        </span>
                      </td>

                      <td className="ivm-aum">
                        {formatCurrency(
                          investor.aum
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="ivm-view-btn"
                          onClick={() =>
                            openDetails(
                              investor
                            )
                          }
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading &&
          total > 0 && (
            <div className="ivm-pagination">
              <span>
                Page {page} of{" "}
                {totalPages}
              </span>

              <div className="ivm-pagination-buttons">
                <button
                  type="button"
                  disabled={
                    page <= 1
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          1,
                          current - 1
                        )
                    )
                  }
                >
                  <ChevronLeft
                    size={16}
                  />
                </button>

                <button
                  type="button"
                  disabled={
                    page >=
                    totalPages
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.min(
                          totalPages,
                          current + 1
                        )
                    )
                  }
                >
                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>
            </div>
          )}
      </div>

      {selectedInvestor && (
        <div
          className="ivm-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDetails();
            }
          }}
        >
          <div className="ivm-modal">
            <div className="ivm-modal-header">
              <div>
                <h2>
                  Investor Details
                </h2>

                <p>
                  {
                    selectedInvestor.id
                  }
                </p>
              </div>

              <button
                type="button"
                className="ivm-close-btn"
                onClick={
                  closeDetails
                }
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="ivm-modal-loading">
                <RefreshCw
                  size={28}
                  className="ivm-spin"
                />

                <p>
                  Loading investor
                  details...
                </p>
              </div>
            ) : selectedInvestor.details
                ?.error ? (
              <div className="ivm-modal-error">
                {
                  selectedInvestor
                    .details.error
                }
              </div>
            ) : (
              <div className="ivm-details">
                <div className="ivm-details-profile">
                  <div className="ivm-details-avatar">
                    {String(
                      selectedInvestor.name ||
                        "I"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3>
                      {
                        selectedInvestor.name
                      }
                    </h3>

                    <span>
                      {
                        selectedInvestor.id
                      }
                    </span>
                  </div>
                </div>

                <div className="ivm-detail-grid">
                  <div>
                    <label>
                      Mobile
                    </label>

                    <strong>
                      {
                        selectedInvestor.mobile
                      }
                    </strong>
                  </div>

                  <div>
                    <label>
                      Branch
                    </label>

                    <strong>
                      {
                        selectedInvestor.branch
                      }
                    </strong>
                  </div>

                  <div>
                    <label>
                      Registered
                    </label>

                    <strong>
                      {formatDate(
                        selectedInvestor.registered
                      )}
                    </strong>
                  </div>

                  <div>
                    <label>
                      KYC
                    </label>

                    <strong>
                      {
                        selectedInvestor.kyc
                      }
                    </strong>
                  </div>

                  <div>
                    <label>
                      Status
                    </label>

                    <strong>
                      {
                        selectedInvestor.status
                      }
                    </strong>
                  </div>

                  <div>
                    <label>
                      Total Investment
                    </label>

                    <strong>
                      {formatCurrency(
                        selectedInvestor.aum
                      )}
                    </strong>
                  </div>
                </div>

                {selectedInvestor.details &&
                  Object.keys(
                    selectedInvestor.details
                  ).length > 0 && (
                    <div className="ivm-raw-details">
                      <h3>
                        Additional
                        Information
                      </h3>

                      <div className="ivm-raw-grid">
                        {Object.entries(
                          selectedInvestor.details
                        ).map(
                          ([key, value]) => (
                            <div
                              key={key}
                            >
                              <label>
                                {key
                                  .replaceAll(
                                    "_",
                                    " "
                                  )
                                  .replace(
                                    /\b\w/g,
                                    (char) =>
                                      char.toUpperCase()
                                  )}
                              </label>

                              <strong>
                                {value ===
                                  null ||
                                value ===
                                  undefined
                                  ? "-"
                                  : typeof value ===
                                    "object"
                                  ? JSON.stringify(
                                      value
                                    )
                                  : String(
                                      value
                                    )}
                              </strong>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}