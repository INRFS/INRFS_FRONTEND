const API_URL =
  process.env.REACT_APP_API_URL ||
"http://187.52.115.32:8000";

const getToken = () => {
  const keys = [
    "access_token",
    "accessToken",
    "token",
    "auth_token",
    "authToken",
    "admin_token",
  ];

  for (const key of keys) {
    const localValue =
      localStorage.getItem(key);

    if (
      localValue &&
      localValue !== "null" &&
      localValue !== "undefined"
    ) {
      return localValue;
    }

    const sessionValue =
      sessionStorage.getItem(key);

    if (
      sessionValue &&
      sessionValue !== "null" &&
      sessionValue !== "undefined"
    ) {
      return sessionValue;
    }
  }

  return "";
};

const getHeaders = (json = false) => {
  const token = getToken();

  return {
    Accept: "application/json",

    ...(json
      ? {
          "Content-Type":
            "application/json",
        }
      : {}),

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

const apiRequest = async (
  endpoint,
  options = {}
) => {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        ...getHeaders(
          Boolean(options.body)
        ),
        ...(options.headers || {}),
      },
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    if (response.status === 401) {
      message =
        "Authentication failed. Please login again.";
    } else if (
      response.status === 403
    ) {
      message =
        data?.detail ||
        "You do not have permission to access this resource.";
    } else if (
      Array.isArray(data?.detail)
    ) {
      message = data.detail
        .map(
          (item) =>
            item?.msg ||
            item?.message ||
            String(item)
        )
        .join(", ");
    } else if (
      typeof data?.detail ===
      "string"
    ) {
      message = data.detail;
    } else if (
      typeof data?.message ===
      "string"
    ) {
      message = data.message;
    }

    throw new Error(message);
  }

  return data;
};

export const getList = (
  response
) => {
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
    response?.data
      ?.tenure_timeout_settlements,
    response?.data
      ?.closed_settlements,
  ];

  for (const value of candidates) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};

const makePagination = (
  limit = 100,
  offset = 0
) => {
  const params =
    new URLSearchParams();

  params.set(
    "limit",
    String(limit)
  );

  params.set(
    "offset",
    String(offset)
  );

  return params.toString();
};

const normalizeType = (
  value
) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");

export const getPaymentQueue =
  async ({
    paymentType = "All",
    limit = 100,
    offset = 0,
  } = {}) => {
    const type =
      normalizeType(paymentType);

    if (
      type === "tenure settlement"
    ) {
      return getSuperAdminTenureTimeoutSettlements(
        {
          limit,
          offset,
        }
      );
    }

    if (
      type ===
        "pre-close settlement" ||
      type ===
        "preclose settlement"
    ) {
      return getSuperAdminPrecloseRequests(
        {
          limit,
          offset,
        }
      );
    }

    const params =
      new URLSearchParams();

    params.set(
      "payment_type",
      paymentType
    );

    params.set(
      "limit",
      String(limit)
    );

    params.set(
      "offset",
      String(offset)
    );

    return apiRequest(
      `/api/superadmin/payments?${params.toString()}`,
      {
        method: "GET",
      }
    );
  };

export const getPaymentDetails =
  async (
    sourceId,
    paymentType
  ) => {
    if (
      sourceId ===
        undefined ||
      sourceId === null ||
      sourceId === ""
    ) {
      throw new Error(
        "Payment source ID is required."
      );
    }

    const type =
      normalizeType(paymentType);

    if (
      type === "tenure settlement"
    ) {
      return getSuperAdminTenureTimeoutSettlementDetails(
        sourceId
      );
    }

    if (
      type ===
        "pre-close settlement" ||
      type ===
        "preclose settlement"
    ) {
      return getSuperAdminPrecloseRequestDetails(
        sourceId
      );
    }

    const params =
      new URLSearchParams();

    params.set(
      "payment_type",
      paymentType
    );

    return apiRequest(
      `/api/superadmin/payments/${encodeURIComponent(
        sourceId
      )}?${params.toString()}`,
      {
        method: "GET",
      }
    );
  };

export const approvePayment =
  async (
    sourceId,
    paymentType
  ) => {
    if (
      sourceId ===
        undefined ||
      sourceId === null ||
      sourceId === ""
    ) {
      throw new Error(
        "Payment source ID is required."
      );
    }

    return apiRequest(
      "/api/superadmin/payments/approve",
      {
        method: "POST",

        body: JSON.stringify({
          source_id:
            Number(sourceId),

          payment_type:
            paymentType,
        }),
      }
    );
  };

export const rejectPayment =
  async (
    sourceId,
    paymentType,
    rejectionReason
  ) => {
    if (
      sourceId ===
        undefined ||
      sourceId === null ||
      sourceId === ""
    ) {
      throw new Error(
        "Payment source ID is required."
      );
    }

    const reason = String(
      rejectionReason || ""
    ).trim();

    if (!reason) {
      throw new Error(
        "Rejection reason is required."
      );
    }

    return apiRequest(
      "/api/superadmin/payments/reject",
      {
        method: "POST",

        body: JSON.stringify({
          source_id:
            Number(sourceId),

          payment_type:
            paymentType,

          rejection_reason:
            reason,
        }),
      }
    );
  };

export const markPaymentPaid =
  async (
    sourceId,
    paymentType
  ) => {
    if (
      sourceId ===
        undefined ||
      sourceId === null ||
      sourceId === ""
    ) {
      throw new Error(
        "Payment source ID is required."
      );
    }

    return apiRequest(
      "/api/superadmin/payments/mark-paid",
      {
        method: "POST",

        body: JSON.stringify({
          source_id:
            Number(sourceId),

          payment_type:
            paymentType,
        }),
      }
    );
  };

/* =========================================================
   MONTHLY INTEREST
   ========================================================= */

export const getMonthlyInterestQueue =
  async ({
    limit = 100,
    offset = 0,
  } = {}) => {
    const params =
      new URLSearchParams();

    params.set(
      "payment_type",
      "MONTHLY_INTEREST"
    );

    params.set(
      "limit",
      String(limit)
    );

    params.set(
      "offset",
      String(offset)
    );

    return apiRequest(
      `/api/superadmin/payments?${params.toString()}`,
      {
        method: "GET",
      }
    );
  };

export const getMonthlyInterestDetails =
  async (
    interestScheduleId
  ) => {
    if (
      interestScheduleId ===
        undefined ||
      interestScheduleId === null ||
      interestScheduleId === ""
    ) {
      throw new Error(
        "Monthly interest ID is required."
      );
    }

    return apiRequest(
      `/api/superadmin/payments/${encodeURIComponent(
        interestScheduleId
      )}?payment_type=MONTHLY_INTEREST`,
      {
        method: "GET",
      }
    );
  };

export const approveMonthlyInterest =
  async (
    interestScheduleId
  ) => {
    return approvePayment(
      interestScheduleId,
      "MONTHLY_INTEREST"
    );
  };

export const rejectMonthlyInterest =
  async (
    interestScheduleId,
    rejectionReason
  ) => {
    return rejectPayment(
      interestScheduleId,
      "MONTHLY_INTEREST",
      rejectionReason
    );
  };

export const markMonthlyInterestPaid =
  async (
    interestScheduleId
  ) => {
    return markPaymentPaid(
      interestScheduleId,
      "MONTHLY_INTEREST"
    );
  };

export const getMonthlyInterestPaymentQueue =
  getMonthlyInterestQueue;

export const getMonthlyInterestPaymentDetails =
  getMonthlyInterestDetails;

export const approveMonthlyInterestPayment =
  approveMonthlyInterest;

export const rejectMonthlyInterestPayment =
  rejectMonthlyInterest;

export const markMonthlyInterestPaymentPaid =
  markMonthlyInterestPaid;

/* =========================================================
   TENURE EXTENSION
   ========================================================= */

export const getAllTenureExtensions =
  async ({
    branchId = null,
    limit = 100,
    offset = 0,
  } = {}) => {
    const params =
      new URLSearchParams();

    if (
      branchId !== null &&
      branchId !== undefined &&
      branchId !== ""
    ) {
      params.set(
        "branch_id",
        String(branchId)
      );
    }

    params.set(
      "limit",
      String(limit)
    );

    params.set(
      "offset",
      String(offset)
    );

    return apiRequest(
      `/api/superadmin/tenure-extensions?${params.toString()}`,
      {
        method: "GET",
      }
    );
  };

export const getTenureExtensionDetails =
  async (requestId) => {
    if (
      requestId ===
        undefined ||
      requestId === null ||
      requestId === ""
    ) {
      throw new Error(
        "Tenure extension request ID is required."
      );
    }

    return apiRequest(
      `/api/superadmin/tenure-extensions/${encodeURIComponent(
        requestId
      )}`,
      {
        method: "GET",
      }
    );
  };

export const approveTenureExtension =
  async (
    requestId,
    remarks = null
  ) => {
    if (
      requestId ===
        undefined ||
      requestId === null ||
      requestId === ""
    ) {
      throw new Error(
        "Tenure extension request ID is required."
      );
    }

    return apiRequest(
      `/api/superadmin/tenure-extensions/${encodeURIComponent(
        requestId
      )}/approve`,
      {
        method: "PUT",

        body: JSON.stringify({
          remarks:
            remarks === undefined
              ? null
              : remarks,
        }),
      }
    );
  };

export const rejectTenureExtension =
  async (
    requestId,
    remarks
  ) => {
    if (
      requestId ===
        undefined ||
      requestId === null ||
      requestId === ""
    ) {
      throw new Error(
        "Tenure extension request ID is required."
      );
    }

    const reason = String(
      remarks || ""
    ).trim();

    if (!reason) {
      throw new Error(
        "Rejection reason is required."
      );
    }

    return apiRequest(
      `/api/superadmin/tenure-extensions/${encodeURIComponent(
        requestId
      )}/reject`,
      {
        method: "PUT",

        body: JSON.stringify({
          remarks: reason,
        }),
      }
    );
  };

export const markTenureExtensionPaid =
  async (requestId) => {
    if (
      requestId ===
        undefined ||
      requestId === null ||
      requestId === ""
    ) {
      throw new Error(
        "Tenure extension request ID is required."
      );
    }

    return apiRequest(
      `/api/superadmin/tenure-extensions/${encodeURIComponent(
        requestId
      )}/mark-paid`,
      {
        method: "PUT",
      }
    );
  };

/* =========================================================
   PRE-CLOSE
   ========================================================= */

export const getSuperAdminPrecloseRequests =
  async ({
    limit = 100,
    offset = 0,
  } = {}) => {
    return apiRequest(
      `/api/superadmin/settlements/preclose?${makePagination(
        limit,
        offset
      )}`,
      {
        method: "GET",
      }
    );
  };

export const getSuperAdminPrecloseRequestDetails =
  async (requestId) => {
    if (
      requestId ===
        undefined ||
      requestId === null ||
      requestId === ""
    ) {
      throw new Error(
        "Pre-close request ID is required."
      );
    }

    return apiRequest(
      `/api/superadmin/settlements/preclose/${encodeURIComponent(
        requestId
      )}`,
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   TENURE TIMEOUT
   ========================================================= */

export const getSuperAdminTenureTimeoutSettlements =
  async ({
    limit = 100,
    offset = 0,
  } = {}) => {
    return apiRequest(
      `/api/superadmin/settlements/tenure-timeout?${makePagination(
        limit,
        offset
      )}`,
      {
        method: "GET",
      }
    );
  };

export const getSuperAdminTenureTimeoutSettlementDetails =
  async (settlementId) => {
    if (
      settlementId ===
        undefined ||
      settlementId === null ||
      settlementId === ""
    ) {
      throw new Error(
        "Tenure settlement ID is required."
      );
    }

    return apiRequest(
      `/api/superadmin/settlements/tenure-timeout/${encodeURIComponent(
        settlementId
      )}`,
      {
        method: "GET",
      }
    );
  };

export const getPrecloseRequests =
  getSuperAdminPrecloseRequests;

export const getPrecloseRequestDetails =
  getSuperAdminPrecloseRequestDetails;

export const getTenureTimeoutSettlements =
  getSuperAdminTenureTimeoutSettlements;

export const getTenureTimeoutSettlementDetails =
  getSuperAdminTenureTimeoutSettlementDetails;

export const approvePrecloseRequest =
  async (requestId) => {
    return approvePayment(
      requestId,
      "Pre-Close Settlement"
    );
  };

export const rejectPrecloseRequest =
  async (
    requestId,
    rejectionReason
  ) => {
    return rejectPayment(
      requestId,
      "Pre-Close Settlement",
      rejectionReason
    );
  };

export const markPrecloseRequestPaid =
  async (requestId) => {
    return markPaymentPaid(
      requestId,
      "Pre-Close Settlement"
    );
  };

export const approveTenureTimeoutSettlement =
  async (settlementId) => {
    return approvePayment(
      settlementId,
      "Tenure Settlement"
    );
  };

export const rejectTenureTimeoutSettlement =
  async (
    settlementId,
    rejectionReason
  ) => {
    return rejectPayment(
      settlementId,
      "Tenure Settlement",
      rejectionReason
    );
  };

export const markTenureTimeoutSettlementPaid =
  async (settlementId) => {
    return markPaymentPaid(
      settlementId,
      "Tenure Settlement"
    );
  };

export default {
  getPaymentQueue,
  getPaymentDetails,

  approvePayment,
  rejectPayment,
  markPaymentPaid,

  getMonthlyInterestQueue,
  getMonthlyInterestDetails,
  approveMonthlyInterest,
  rejectMonthlyInterest,
  markMonthlyInterestPaid,

  getMonthlyInterestPaymentQueue,
  getMonthlyInterestPaymentDetails,
  approveMonthlyInterestPayment,
  rejectMonthlyInterestPayment,
  markMonthlyInterestPaymentPaid,

  getAllTenureExtensions,
  getTenureExtensionDetails,
  approveTenureExtension,
  rejectTenureExtension,
  markTenureExtensionPaid,

  getSuperAdminPrecloseRequests,
  getSuperAdminPrecloseRequestDetails,

  getSuperAdminTenureTimeoutSettlements,
  getSuperAdminTenureTimeoutSettlementDetails,

  getPrecloseRequests,
  getPrecloseRequestDetails,

  getTenureTimeoutSettlements,
  getTenureTimeoutSettlementDetails,

  approvePrecloseRequest,
  rejectPrecloseRequest,
  markPrecloseRequestPaid,

  approveTenureTimeoutSettlement,
  rejectTenureTimeoutSettlement,
  markTenureTimeoutSettlementPaid,
};