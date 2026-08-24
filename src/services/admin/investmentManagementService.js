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
          Authorization:
            `Bearer ${token}`,
        }
      : {}),
  };
};

const handleResponse = async (
  response
) => {
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
    } else if (response.status === 403) {
      message =
        data?.detail ||
        "You do not have permission to perform this action.";
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
      typeof data?.detail === "string"
    ) {
      message = data.detail;
    } else if (
      typeof data?.message === "string"
    ) {
      message = data.message;
    }

    throw new Error(message);
  }

  return data;
};

const request = async (
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

  return handleResponse(response);
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

const makeQuery = (params = {}) => {
  const searchParams =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        searchParams.set(
          key,
          String(value)
        );
      }
    }
  );

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : "";
};

/* =========================================================
   INVESTMENTS
   ========================================================= */

export const getInvestments =
  async ({
    search = "",
    branchId = null,
    statusId = null,
    limit = 100,
    offset = 0,
  } = {}) => {
    return request(
      `/admin/investments${makeQuery({
        search,
        branch_id: branchId,
        status_id: statusId,
        limit,
        offset,
      })}`
    );
  };

export const getAllInvestments =
  async ({
    search = "",
    branchId = null,
    statusId = null,
    limit = 100,
    offset = 0,
  } = {}) => {
    return getInvestments({
      search,
      branchId,
      statusId,
      limit,
      offset,
    });
  };

export const getPendingInvestments =
  async ({
    branchId = null,
    limit = 100,
    offset = 0,
  } = {}) => {
    return request(
      `/admin/investments/pending${makeQuery({
        branch_id: branchId,
        limit,
        offset,
      })}`
    );
  };

export const getInvestmentDetails =
  async (investmentId) => {
    if (
      investmentId ===
        undefined ||
      investmentId === null ||
      investmentId === ""
    ) {
      throw new Error(
        "Investment ID is required."
      );
    }

    return request(
      `/admin/investments/${encodeURIComponent(
        investmentId
      )}`
    );
  };

export const approveInvestment =
  async (
    investmentId,
    {
      interestRate,
      remarks = "",
    } = {}
  ) => {
    if (
      investmentId ===
        undefined ||
      investmentId === null ||
      investmentId === ""
    ) {
      throw new Error(
        "Investment ID is required."
      );
    }

    const body = {};

    if (
      interestRate !==
        undefined &&
      interestRate !== null &&
      interestRate !== ""
    ) {
      body.interest_rate =
        Number(interestRate);
    }

    if (remarks !== undefined) {
      body.remarks =
        remarks || null;
    }

    return request(
      `/admin/investments/${encodeURIComponent(
        investmentId
      )}/approve`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    );
  };

export const rejectInvestment =
  async (
    investmentId,
    {
      rejectionReason = "",
      remarks = "",
    } = {}
  ) => {
    if (
      investmentId ===
        undefined ||
      investmentId === null ||
      investmentId === ""
    ) {
      throw new Error(
        "Investment ID is required."
      );
    }

    const reason =
      String(
        rejectionReason || ""
      ).trim();

    if (!reason) {
      throw new Error(
        "Rejection reason is required."
      );
    }

    return request(
      `/admin/investments/${encodeURIComponent(
        investmentId
      )}/reject`,
      {
        method: "PUT",
        body: JSON.stringify({
          rejection_reason:
            reason,
          remarks:
            remarks || null,
        }),
      }
    );
  };

/* =========================================================
   INVESTMENT BOND DETAILS
   ========================================================= */

export const getInvestmentBondDetails =
  async (investmentId) => {
    if (
      investmentId ===
        undefined ||
      investmentId === null ||
      investmentId === ""
    ) {
      throw new Error(
        "Investment ID is required."
      );
    }

    return request(
      `/admin/investments/${encodeURIComponent(
        investmentId
      )}/bond`
    );
  };

/* =========================================================
   TENURE EXTENSION
   ADMIN CAN ONLY REVIEW AND SEND
   ========================================================= */

export const getPendingTenureExtensions =
  async ({
    branchId = null,
    limit = 100,
    offset = 0,
  } = {}) => {
    return request(
      `/admin/tenure-extensions/pending${makeQuery(
        {
          branch_id: branchId,
          limit,
          offset,
        }
      )}`
    );
  };

export const getTenureExtensionDetails =
  async (requestId) => {
    if (
      requestId === undefined ||
      requestId === null ||
      requestId === ""
    ) {
      throw new Error(
        "Tenure extension request ID is required."
      );
    }

    return request(
      `/admin/tenure-extensions/${encodeURIComponent(
        requestId
      )}`
    );
  };

/*
 * IMPORTANT:
 *
 * Admin does NOT approve tenure extension.
 * Admin only submits the request to Super Admin.
 */

export const submitTenureExtension =
  async (
    requestId,
    {
      remarks = "",
    } = {}
  ) => {
    if (
      requestId === undefined ||
      requestId === null ||
      requestId === ""
    ) {
      throw new Error(
        "Tenure extension request ID is required."
      );
    }

    return request(
      `/admin/tenure-extensions/${encodeURIComponent(
        requestId
      )}/submit`,
      {
        method: "PUT",
        body: JSON.stringify({
          remarks:
            remarks || null,
        }),
      }
    );
  };

/*
 * These are intentionally NOT used by Admin.
 *
 * Super Admin should use its own service/routes
 * for approve/reject.
 */

/* =========================================================
   TENURE TIMEOUT SETTLEMENTS
   ========================================================= */

export const getTenureTimeoutSettlements =
  async ({
    limit = 100,
    offset = 0,
  } = {}) => {
    return request(
      `/admin/settlements/tenure-timeout?${makePagination(
        limit,
        offset
      )}`
    );
  };

export const getTenureTimeoutSettlementDetails =
  async (settlementId) => {
    if (
      settlementId ===
        undefined ||
      settlementId === null ||
      settlementId === ""
    ) {
      throw new Error(
        "Settlement ID is required."
      );
    }

    return request(
      `/admin/settlements/tenure-timeout/${encodeURIComponent(
        settlementId
      )}`
    );
  };

export const createTenureTimeoutSettlement =
  async (settlementId) => {
    if (
      settlementId ===
        undefined ||
      settlementId === null ||
      settlementId === ""
    ) {
      throw new Error(
        "Settlement ID is required."
      );
    }

    return request(
      `/admin/settlements/tenure-timeout/${encodeURIComponent(
        settlementId
      )}`,
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    );
  };

/* =========================================================
   MONTHLY INTEREST
   ========================================================= */

export const getMonthlyInterest =
  async ({
    interestDueDate = "",
    limit = 100,
    offset = 0,
  } = {}) => {
    return request(
      `/admin/monthly-interest${makeQuery({
        interest_due_date:
          interestDueDate,
        limit,
        offset,
      })}`
    );
  };

export const getMonthlyInterestDetails =
  async (interestScheduleId) => {
    if (
      interestScheduleId ===
        undefined ||
      interestScheduleId === null ||
      interestScheduleId === ""
    ) {
      throw new Error(
        "Interest schedule ID is required."
      );
    }

    return request(
      `/admin/monthly-interest/${encodeURIComponent(
        interestScheduleId
      )}`
    );
  };

export const approveMonthlyInterest =
  async (interestScheduleId) => {
    if (
      interestScheduleId ===
        undefined ||
      interestScheduleId === null ||
      interestScheduleId === ""
    ) {
      throw new Error(
        "Interest schedule ID is required."
      );
    }

    return request(
      `/admin/monthly-interest/${encodeURIComponent(
        interestScheduleId
      )}/approve`,
      {
        method: "PUT",
        body: JSON.stringify({}),
      }
    );
  };

export const rejectMonthlyInterest =
  async (
    interestScheduleId,
    rejectionReason,
    remarks = null
  ) => {
    if (
      interestScheduleId ===
        undefined ||
      interestScheduleId === null ||
      interestScheduleId === ""
    ) {
      throw new Error(
        "Interest schedule ID is required."
      );
    }

    const reason =
      String(
        rejectionReason || ""
      ).trim();

    if (!reason) {
      throw new Error(
        "Rejection reason is required."
      );
    }

    return request(
      `/admin/monthly-interest/${encodeURIComponent(
        interestScheduleId
      )}/reject`,
      {
        method: "PUT",
        body: JSON.stringify({
          rejection_reason:
            reason,
          remarks,
        }),
      }
    );
  };

export const approveAllMonthlyInterest =
  async (interestDueDate) => {
    if (!interestDueDate) {
      throw new Error(
        "Interest due date is required."
      );
    }

    return request(
      `/admin/monthly-interest/approve-all`,
      {
        method: "PUT",
        body: JSON.stringify({
          interest_due_date:
            interestDueDate,
        }),
      }
    );
  };

/* =========================================================
   HELPERS
   ========================================================= */

export const getList = (
  response
) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    Array.isArray(
      response?.data
    )
  ) {
    return response.data;
  }

  if (
    Array.isArray(
      response?.items
    )
  ) {
    return response.items;
  }

  if (
    Array.isArray(
      response?.results
    )
  ) {
    return response.results;
  }

  if (
    Array.isArray(
      response?.requests
    )
  ) {
    return response.requests;
  }

  if (
    Array.isArray(
      response?.investments
    )
  ) {
    return response.investments;
  }

  if (
    Array.isArray(
      response?.preclose_requests
    )
  ) {
    return response.preclose_requests;
  }

  if (
    Array.isArray(
      response?.tenure_extension_requests
    )
  ) {
    return response.tenure_extension_requests;
  }

  return [];
};
















export const getAllTenureExtensions = async ({
  limit = 100,
  offset = 0,
} = {}) => {
  return request(
    `/admin/tenure-extensions/all${makeQuery({
      limit,
      offset,
    })}`
  );
};








export { API_URL };

export default {
  getInvestments,
  getAllInvestments,
  getPendingInvestments,
  getInvestmentDetails,
  approveInvestment,
  rejectInvestment,
  getInvestmentBondDetails,

  getPendingTenureExtensions,
  getTenureExtensionDetails,
  submitTenureExtension,

  getTenureTimeoutSettlements,
  getTenureTimeoutSettlementDetails,
  createTenureTimeoutSettlement,

  getMonthlyInterest,
  getMonthlyInterestDetails,
  approveMonthlyInterest,
  rejectMonthlyInterest,
  approveAllMonthlyInterest,

  getList,



  getAllTenureExtensions,
};