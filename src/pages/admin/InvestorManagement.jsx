import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Download,
  Eye,
  Check,
  X,
  Loader2,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  BadgeCheck,
  IndianRupee,
} from "lucide-react";

import {
  getInvestors,
  getInvestorStatuses,
  getKycStatuses,
  getInvestorDetails,
  approveInvestor,
  rejectInvestor,
} from "../../services/admin/investorManagementService";

import "../../Styles/Admin/InvestorManagement.css";

const STATUS_TABS = [
  {
    key: "All",
    label: "All",
  },
  {
    key: "Pending",
    label: "Pending",
  },
  {
    key: "Active",
    label: "Active",
  },
  {
    key: "Suspended",
    label: "Suspended",
  },
];

const getArray = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.rows)) {
    return response.rows;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};

const getValue = (
  obj,
  keys,
  fallback = ""
) => {
  for (const key of keys) {
    if (
      obj &&
      obj[key] !== undefined &&
      obj[key] !== null &&
      obj[key] !== ""
    ) {
      return obj[key];
    }
  }

  return fallback;
};

const normalizeInvestor = (item) => {
  const fullName = getValue(
    item,
    [
      "investor_name",
      "full_name",
      "investor_full_name",
      "name",
      "fullName",
    ],
    "Unknown Investor"
  );

  const email = getValue(
    item,
    [
      "email",
      "email_address",
      "investor_email",
    ],
    ""
  );

  const investorId = getValue(
    item,
    [
      "investor_id",
      "investor_code",
      "investorId",
    ],
    ""
  );

  const investorRegistrationId =
    getValue(
      item,
      [
        "investor_registration_id",
        "registration_id",
        "investorRegistrationId",
        "id",
      ],
      null
    );

  const mobile = getValue(
    item,
    [
      "mobile",
      "mobile_number",
      "phone",
      "phone_number",
    ],
    "-"
  );

  const branch = getValue(
    item,
    [
      "branch_name",
      "branch",
      "branchName",
    ],
    "-"
  );

  const registeredDate = getValue(
    item,
    [
      "registered_date",
      "registration_date",
      "created_date",
      "created_at",
      "registered_on",
    ],
    null
  );

  const kycStatus = getValue(
    item,
    [
      "kyc_status_name",
      "kyc_status",
      "kycStatus",
    ],
    "Pending"
  );
  const status = getValue(
    item,
    [
      "account_status",
      "status_name",
      "status",
      "request_status_name",
      "request_status",
    ],
    "Pending"
  );

  const investment = getValue(
    item,
    [
      "investment_amount",
      "total_investment",
      "total_invested",
      "investment",
    ],
    0
  );

  const branchId = getValue(
    item,
    [
      "branch_id",
      "branchId",
    ],
    item?.branch?.id ??
      item?.branch?.branch_id ??
      item?.branch?.branchId ??
      null
  );

  const userId = getValue(
    item,
    [
      "user_id",
      "userId",
    ],
    null
  );

  return {
    ...item,
    raw: item,
    investorId,
    investorRegistrationId,
    fullName,
    email,
    mobile,
    branch,
    branchId,
    userId,
    registeredDate,
    kycStatus,
    status,
    investment,
  };
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
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

const formatAmount = (value) => {
  const number = Number(value || 0);

  return number.toLocaleString(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  );
};

const normalizeStatus = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase();
};

const statusMatches = (
  investor,
  status
) => {
  if (status === "All") {
    return true;
  }

  const investorStatus =
    normalizeStatus(
      investor.status
    );

  const selectedStatus =
    normalizeStatus(status);

  if (selectedStatus === "active") {
    return (
      investorStatus === "active" ||
      investorStatus === "approved"
    );
  }

  if (selectedStatus === "suspended") {
    return (
      investorStatus === "suspended"
    );
  }

  if (selectedStatus === "pending") {
    return (
      investorStatus === "pending"
    );
  }

  return (
    investorStatus ===
    selectedStatus
  );
};

const getDetailValue = (obj, keys, fallback = "-") => {
  for (const key of keys) {
    if (
      obj &&
      obj[key] !== undefined &&
      obj[key] !== null &&
      obj[key] !== ""
    ) {
      return obj[key];
    }
  }

  return fallback;
};

const getInvestorDetailFields = (investor) => {
  const data = investor || {};

  return [
    { label: "Investor ID", value: getDetailValue(data, ["investor_id", "investorId", "investor_code"]) },
    { label: "Investor Name", value: getDetailValue(data, ["investor_name", "full_name", "investor_full_name", "name", "fullName"]) },
    { label: "Mobile", value: getDetailValue(data, ["mobile", "mobile_number", "phone", "phone_number"]) },
    { label: "Email", value: getDetailValue(data, ["email", "email_address", "investor_email"]) },
    { label: "Branch Name", value: getDetailValue(data, ["branch_name", "branch", "branchName"]) },
    {
      label: "Registered Date",
      value: formatDate(getDetailValue(data, ["registered_date", "registration_date", "created_date", "created_at", "registered_on"], null)),
    },
    { label: "KYC Status", value: getDetailValue(data, ["kyc_status_name", "kyc_status", "kycStatus"]) },
    {
      label: "Account Status",
      value: getDetailValue(data, ["account_status", "status_name", "status", "request_status_name", "request_status"]),
    },
    {
      label: "Investment Amount",
      value: formatAmount(getDetailValue(data, ["investment_amount", "total_investment", "total_invested", "investment"], 0)),
    },
    { label: "Date of Birth", value: getDetailValue(data, ["date_of_birth", "dob", "birth_date"]) },
    { label: "Aadhaar Number", value: getDetailValue(data, ["aadhaar_number", "aadhaar", "aadhar_number", "aadhar"]) },
    { label: "Address", value: getDetailValue(data, ["address", "full_address"]) },
    { label: "City", value: getDetailValue(data, ["city", "city_name"]) },
    { label: "State", value: getDetailValue(data, ["state_name", "state", "stateName"]) },
    { label: "Pincode", value: getDetailValue(data, ["pincode", "pin_code", "postal_code"]) },
    {
      label: "Account Holder Name",
      value: getDetailValue(data, ["account_holder_name", "accountHolderName", "bank_account_holder_name"]),
    },
    { label: "Bank Name", value: getDetailValue(data, ["bank_name", "bankName"]) },
    { label: "Account Type", value: getDetailValue(data, ["account_type", "accountType"]) },
    {
      label: "Account Number",
      value: getDetailValue(data, ["account_number", "accountNumber", "bank_account_number"]),
    },
    { label: "IFSC Code", value: getDetailValue(data, ["ifsc_code", "ifsc", "ifscCode"]) },
    {
      label: "Approved Date",
      value: formatDate(getDetailValue(data, ["approved_date", "approval_date", "approved_at"], null)),
    },
    {
      label: "Remarks",
      value: getDetailValue(data, ["remarks", "approval_remarks", "rejection_remarks"]),
    },
  ];
};

export default function InvestorManagement() {
  const [
    investors,
    setInvestors,
  ] = useState([]);

  const [
    statusOptions,
    setStatusOptions,
  ] = useState([]);

  const [
    kycOptions,
    setKycOptions,
  ] = useState([]);

  const [
    activeTab,
    setActiveTab,
  ] = useState("All");

  const [
    kycFilter,
    setKycFilter,
  ] = useState("All KYC Status");

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    searchText,
    setSearchText,
  ] = useState("");

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
    selectedInvestor,
    setSelectedInvestor,
  ] = useState(null);

  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(null);

  const [
    showDetails,
    setShowDetails,
  ] = useState(false);

  const loadMasters =
    useCallback(async () => {
      try {
        const [
          statusesResponse,
          kycResponse,
        ] = await Promise.all([
          getInvestorStatuses(),
          getKycStatuses(),
        ]);

        setStatusOptions(
          getArray(
            statusesResponse
          )
        );

        setKycOptions(
          getArray(
            kycResponse
          )
        );
      } catch (err) {
        console.error(
          "Failed to load investor masters:",
          err
        );
      }
    }, []);

  const loadInvestors =
    useCallback(
      async (showRefresh = false) => {
        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const response =
            await getInvestors({
              searchText,
              limit: 100,
              offset: 0,
            });

          const rows =
            getArray(response);

          const normalized =
            rows.map(
              normalizeInvestor
            );

          setInvestors(
            normalized
          );
        } catch (err) {
          console.error(
            "Failed to load investors:",
            err
          );

          setError(
            err?.message ||
              "Unable to load investors."
          );

          setInvestors([]);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [searchText]
    );

  useEffect(() => {
    loadMasters();
  }, [loadMasters]);

  useEffect(() => {
    loadInvestors();
  }, [loadInvestors]);

  const filteredInvestors =
    useMemo(() => {
      let result = investors;

      if (activeTab !== "All") {
        result =
          result.filter(
            (investor) =>
              statusMatches(
                investor,
                activeTab
              )
          );
      }

      if (
        kycFilter &&
        kycFilter !==
          "All KYC Status"
      ) {
        result =
          result.filter(
            (investor) =>
              normalizeStatus(
                investor.kycStatus
              ) ===
              normalizeStatus(
                kycFilter
              )
          );
      }

      return result;
    }, [
      investors,
      activeTab,
      kycFilter,
    ]);

  const statusCounts =
    useMemo(() => {
      return {
        All: investors.length,

        Pending:
          investors.filter(
            (investor) =>
              normalizeStatus(
                investor.status
              ) === "pending"
          ).length,

        Active:
          investors.filter(
            (investor) => {
              const status =
                normalizeStatus(
                  investor.status
                );

              return (
                status ===
                  "active" ||
                status ===
                  "approved"
              );
            }
          ).length,

        Suspended:
          investors.filter(
            (investor) =>
              normalizeStatus(
                investor.status
              ) === "suspended"
          ).length,
      };
    }, [investors]);

  const investorStats = useMemo(() => {
    const totalInvestors = investors.length;
    const pendingKyc = investors.filter((investor) => {
      const status = normalizeStatus(investor.kycStatus);
      return (
        status === "pending" ||
        status === "submitted" ||
        status === "under review"
      );
    }).length;
    const activeInvestors = investors.filter((investor) => {
      const status = normalizeStatus(investor.status);
      return status === "active" || status === "approved";
    }).length;
    const suspendedInvestors = investors.filter(
      (investor) => normalizeStatus(investor.status) === "suspended"
    ).length;
    const totalInvestment = investors.reduce(
      (sum, investor) => sum + Number(investor.investment || 0),
      0
    );
    return {
      totalInvestors,
      pendingKyc,
      activeInvestors,
      suspendedInvestors,
      totalInvestment,
    };
  }, [investors]);

  const handleSearch = () => {
    setSearchText(
      searchInput.trim()
    );
  };

  const handleSearchKeyDown = (
    event
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const getDetailsId = (
    investor
  ) => {
    const candidates = [
      investor?.raw
        ?.investor_registration_id,
      investor?.raw
        ?.registration_id,
      investor?.raw?.id,
      investor?.investorRegistrationId,
    ];

    for (const value of candidates) {
      if (
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        const numberValue =
          Number(value);

        if (
          Number.isInteger(
            numberValue
          ) &&
          numberValue > 0
        ) {
          return numberValue;
        }
      }
    }

    return null;
  };

  const handleView = async (
    investor
  ) => {
    const detailsId =
      getDetailsId(investor);

    setShowDetails(true);
    setSelectedInvestor(null);

    if (!detailsId) {
      setSelectedInvestor({
        ...investor,
        error:
          "Investor registration ID is not available.",
      });

      return;
    }

    try {
      setDetailsLoading(true);

      const details =
        await getInvestorDetails(
          detailsId
        );

      const data =
        details?.data ||
        details;

      setSelectedInvestor({
        ...investor,
        ...data,
        raw: data,
      });
    } catch (err) {
      console.error(
        "Failed to load investor details:",
        err
      );

      setSelectedInvestor({
        ...investor,
        error:
          err?.message ||
          "Unable to load details.",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApprove =
    async (investor) => {
      let loadingKey = null;

      try {
        
        const userId =
          investor?.userId ??
          investor?.raw?.user_id ??
          investor?.raw?.userId;

        const branchId =
          investor?.branchId ??
          investor?.raw?.branch_id ??
          investor?.raw?.branchId ??
          investor?.raw?.branch?.id ??
          investor?.raw?.branch?.branch_id;

        if (
          userId === null ||
          userId === undefined ||
          userId === ""
        ) {
          throw new Error(
            "User ID is not available for this investor."
          );
        }

        if (
          branchId === null ||
          branchId === undefined ||
          branchId === ""
        ) {
          throw new Error(
            "Branch ID is not available for this investor. Please check the investor details or branch assignment."
          );
        }

        const numericUserId = Number(userId);
        const numericBranchId = Number(branchId);

        if (
          !Number.isInteger(numericUserId) ||
          numericUserId <= 0
        ) {
          throw new Error(
            "Invalid user ID for investor approval."
          );
        }

        if (
          !Number.isInteger(numericBranchId) ||
          numericBranchId <= 0
        ) {
          throw new Error(
            "Invalid branch ID for investor approval."
          );
        }

        const confirmed =
          window.confirm(
            `Approve investor ${investor.fullName}?`
          );

        if (!confirmed) {
          return;
        }

        loadingKey =
          investor?.investorId ||
          String(numericUserId);

        setActionLoading(loadingKey);
        setError("");

        await approveInvestor(
          String(numericUserId),
          {
            branch_id: numericBranchId,
            remarks:
              "Investor approved by admin",
          }
        );
        await loadInvestors(true);

        alert(
          "Investor approved successfully."
        );
      } catch (err) {
        console.error(
          "Investor approval failed:",
          err
        );

        setError(
          err?.message ||
            "Failed to approve investor."
        );

        alert(
          err?.message ||
            "Failed to approve investor."
        );
      } finally {
        setActionLoading(null);
      }
    };

  const handleReject =
    async (investor) => {
      const investorId =
        investor?.investorId ||
        investor?.raw?.investor_id ||
        investor?.raw?.investor_code;

      if (!investorId) {
        alert(
          "Investor ID is not available."
        );

        return;
      }

      const remarks =
        window.prompt(
          "Enter rejection remarks:"
        );

      if (remarks === null) {
        return;
      }

      try {
        setActionLoading(
          investorId
        );

        await rejectInvestor(
          investorId,
          {
            remarks:
              remarks.trim() ||
              "Investor rejected by admin",
          }
        );

        await loadInvestors(true);

        alert(
          "Investor rejected successfully."
        );
      } catch (err) {
        console.error(
          "Investor rejection failed:",
          err
        );

        alert(
          err?.message ||
            "Investor rejection is not available in the backend."
        );
      } finally {
        setActionLoading(null);
      }
    };

  const handleExport = () => {
    if (
      !filteredInvestors.length
    ) {
      alert(
        "No investor records to export."
      );

      return;
    }

    const headers = [
      "Investor ID",
      "Investor Name",
      "Email",
      "Mobile",
      "Branch",
      "Registered",
      "KYC",
      "Status",
      "Investment",
    ];

    const rows =
      filteredInvestors.map(
        (investor) => [
          investor.investorId,
          investor.fullName,
          investor.email,
          investor.mobile,
          investor.branch,
          formatDate(
            investor.registeredDate
          ),
          investor.kycStatus,
          investor.status,
          formatAmount(
            investor.investment
          ),
        ]
      );

    const csv = [
      headers,
      ...rows,
    ]
      .map(
        (row) =>
          row
            .map(
              (value) =>
                `"${String(
                  value ?? ""
                ).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(",")
      )
      .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      window.URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;
    link.download =
      "investors.csv";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    window.URL.revokeObjectURL(
      url
    );
  };

  const getStatusClass =
    (status) => {
      const normalized =
        normalizeStatus(
          status
        );

      if (
        normalized ===
          "active" ||
        normalized ===
          "approved"
      ) {
        return "investor-status investor-status--active";
      }

      if (
        normalized ===
        "suspended"
      ) {
        return "investor-status investor-status--suspended";
      }

      if (
        normalized ===
        "rejected"
      ) {
        return "investor-status investor-status--rejected";
      }

      return "investor-status investor-status--pending";
    };

  const getKycClass =
    (status) => {
      const normalized =
        normalizeStatus(
          status
        );

      if (
        normalized ===
          "approved" ||
        normalized ===
          "verified"
      ) {
        return "investor-kyc investor-kyc--approved";
      }

      if (
        normalized ===
        "rejected"
      ) {
        return "investor-kyc investor-kyc--rejected";
      }

      return "investor-kyc investor-kyc--pending";
    };

  const getInitial = (
    name
  ) => {
    if (!name) {
      return "?";
    }

    return name
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  return (
    <div className="investor-management-page">
      <div className="investor-stat-grid">
        <div className="investor-stat-card investor-stat-card--blue">
          <div className="investor-stat-card-top">
            <span className="investor-stat-label">Total Investors</span>
            <span className="investor-stat-icon"><Users size={18} /></span>
          </div>
          <div className="investor-stat-value">{investorStats.totalInvestors}</div>
          <span className="investor-stat-note">Registered investors</span>
        </div>

        <div className="investor-stat-card investor-stat-card--amber">
          <div className="investor-stat-card-top">
            <span className="investor-stat-label">Pending KYC</span>
            <span className="investor-stat-icon"><BadgeCheck size={18} /></span>
          </div>
          <div className="investor-stat-value">{investorStats.pendingKyc}</div>
          <span className="investor-stat-note">Awaiting verification</span>
        </div>

        <div className="investor-stat-card investor-stat-card--green">
          <div className="investor-stat-card-top">
            <span className="investor-stat-label">Active Investors</span>
            <span className="investor-stat-icon"><UserCheck size={18} /></span>
          </div>
          <div className="investor-stat-value">{investorStats.activeInvestors}</div>
          <span className="investor-stat-note">Active accounts</span>
        </div>

        <div className="investor-stat-card investor-stat-card--red">
          <div className="investor-stat-card-top">
            <span className="investor-stat-label">Suspended</span>
            <span className="investor-stat-icon"><UserX size={18} /></span>
          </div>
          <div className="investor-stat-value">{investorStats.suspendedInvestors}</div>
          <span className="investor-stat-note">Suspended accounts</span>
        </div>

        <div className="investor-stat-card investor-stat-card--purple">
          <div className="investor-stat-card-top">
            <span className="investor-stat-label">Total Investment</span>
            <span className="investor-stat-icon"><IndianRupee size={18} /></span>
          </div>
          <div className="investor-stat-value investor-stat-value--amount">
            {formatAmount(investorStats.totalInvestment)}
          </div>
          <span className="investor-stat-note"> investment amounts</span>
        </div>
      </div>

      <div className="investor-management-toolbar">
        <div className="investor-search-box">
          <Search size={16} />

          <input
            type="text"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            onKeyDown={handleSearchKeyDown}
            placeholder="Search by name, ID, mobile..."
          />

          {searchInput && (
            <button
              type="button"
              className="investor-search-clear"
              onClick={() => {
                setSearchInput("");
                setSearchText("");
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="investor-status-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              type="button"
              key={tab.key}
              className={
                activeTab === tab.key
                  ? "investor-status-tab investor-status-tab--active"
                  : "investor-status-tab"
              }
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.label}</span>
              <span className="investor-tab-count">
                {statusCounts[tab.key] || 0}
              </span>
            </button>
          ))}
        </div>

        <select
          value={kycFilter}
          onChange={(event) =>
            setKycFilter(event.target.value)
          }
          className="investor-kyc-filter"
        >
          <option value="All KYC Status">
            All KYC Status
          </option>

          {kycOptions.map((option, index) => {
            const value = getValue(
              option,
              [
                "status_name",
                "name",
                "kyc_status_name",
                "label",
              ],
              ""
            );

            if (!value) {
              return null;
            }

            return (
              <option
                key={option.id || value || index}
                value={value}
              >
                {value}
              </option>
            );
          })}
        </select>

        <button
          type="button"
          className="investor-export-btn investor-toolbar-export"
          onClick={handleExport}
        >
          <Download size={14} />
          Export
        </button>
      </div>

      {error && (
        <div className="investor-management-error">
          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              loadInvestors(
                true
              )
            }
          >
            Retry
          </button>
        </div>
      )}

      <div className="investor-table-card">
        <div className="investor-table-scroll">
          <table className="investor-table">
            <thead>
              <tr>
                <th>
                  Investor Name
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
                  Investment
                </th>

                <th>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="investor-table-loading"
                  >
                    <Loader2
                      size={22}
                      className="investor-spin"
                    />

                    <span>
                      Loading investors...
                    </span>
                  </td>
                </tr>
              ) : filteredInvestors.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="investor-table-empty"
                  >
                    <Users size={28} />

                    <span>
                      No investors found.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredInvestors.map(
                  (investor) => {
                    const loadingAction =
                      actionLoading ===
                      (
                        investor.investorId ||
                        String(investor.userId || "")
                      );

                 
                    const currentKycStatus =
                      normalizeStatus(
                        investor.kycStatus
                      );

                    const canTakeKycAction =
                      currentKycStatus ===
                        "pending" ||
                      currentKycStatus ===
                        "submitted" ||
                      currentKycStatus ===
                        "under review";

                    return (
                      <tr
                        key={
                          investor.investorRegistrationId ||
                          investor.investorId
                        }
                      >
                        <td>
                          <div className="investor-name-cell">
                            <span className="investor-avatar">
                              {getInitial(
                                investor.fullName
                              )}
                            </span>

                            <div>
                              <div className="investor-name">
                                {
                                  investor.fullName
                                }
                              </div>

                              {investor.email && (
                                <div className="investor-email">
                                  {
                                    investor.email
                                  }
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          {
                            investor.mobile
                          }
                        </td>

                        <td>
                          <span className="investor-branch">
                            {
                              investor.branch
                            }
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            investor.registeredDate
                          )}
                        </td>

                        <td>
                          <span
                            className={getKycClass(
                              investor.kycStatus
                            )}
                          >
                            {
                              investor.kycStatus
                            }
                          </span>
                        </td>

                        <td>
                          <span
                            className={getStatusClass(
                              investor.status
                            )}
                          >
                            {
                              investor.status
                            }
                          </span>
                        </td>

                        <td className="investor-investment">
                          {formatAmount(
                            investor.investment
                          )}
                        </td>

                        <td>
                          <div className="investor-actions">
                            {canTakeKycAction && (
                              <>
                                <button
                                  type="button"
                                  className="investor-action-btn investor-action-btn--approve"
                                  onClick={() =>
                                    handleApprove(
                                      investor
                                    )
                                  }
                                  disabled={Boolean(loadingAction)}
                                >
                                  {loadingAction ? (
                                    <Loader2
                                      size={14}
                                      className="investor-spin"
                                    />
                                  ) : (
                                    <Check
                                      size={14}
                                    />
                                  )}

                                  {loadingAction
                                    ? "Approving..."
                                    : "Approve"}
                                </button>

                                <button
                                  type="button"
                                  className="investor-action-btn investor-action-btn--reject"
                                  onClick={() =>
                                    handleReject(
                                      investor
                                    )
                                  }
                                  disabled={Boolean(loadingAction)}
                                >
                                  {loadingAction ? (
                                    <Loader2
                                      size={14}
                                      className="investor-spin"
                                    />
                                  ) : (
                                    <X
                                      size={14}
                                    />
                                  )}

                                  {loadingAction
                                    ? "Rejecting..."
                                    : "Reject"}
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              className="investor-action-btn investor-action-btn--view"
                              onClick={() =>
                                handleView(
                                  investor
                                )
                              }
                              title="View investor"
                            >
                              <Eye
                                size={16}
                              />
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

        <div className="investor-table-footer">
          Showing{" "}
          <strong>
            {
              filteredInvestors.length
            }
          </strong>{" "}
          records
        </div>
      </div>

      {showDetails && (
        <div
          className="investor-details-overlay"
          onClick={() =>
            setShowDetails(
              false
            )
          }
        >
          <div
            className="investor-details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="investor-details-header">
              <div>
                <h2>
                  Investor Details
                </h2>

                <p>
                  View investor registration
                  information
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDetails(
                    false
                  )
                }
                className="investor-details-close"
              >
                <X size={19} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="investor-details-loading">
                <Loader2
                  size={26}
                  className="investor-spin"
                />

                <span>
                  Loading details...
                </span>
              </div>
            ) : selectedInvestor?.error ? (
              <div className="investor-details-error">
                {
                  selectedInvestor.error
                }
              </div>
            ) : (
              <div className="investor-details-content">
                {getInvestorDetailFields(
                  selectedInvestor
                ).map((field) => (
                  <div
                    className="investor-detail-item"
                    key={field.label}
                  >
                    <span>{field.label}</span>
                    <strong>
                      {field.value === null ||
                      field.value === undefined ||
                      field.value === ""
                        ? "-"
                        : String(field.value)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}