const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://187.52.115.32:8000";

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("admin_token")
  );
}

function getHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  const contentType =
    response.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    if (typeof data === "string" && data) {
      message = data;
    } else if (data?.detail) {
      if (Array.isArray(data.detail)) {
        message = data.detail
          .map(
            (item) =>
              item.msg || "Validation error"
          )
          .join(", ");
      } else {
        message = data.detail;
      }
    } else if (data?.message) {
      message = data.message;
    }

    throw new Error(message);
  }

  return data;
}

export const getInvestments = async ({
  bondId = "",
  limit = 100,
  offset = 0,
} = {}) => {
  const params = new URLSearchParams();

  if (bondId) {
    params.append("bond_id", bondId);
  }

  params.append("limit", String(limit));
  params.append("offset", String(offset));

  return request(
    `/admin/investments?${params.toString()}`,
    {
      method: "GET",
    }
  );
};

export const getPendingInvestments = async ({
  limit = 100,
  offset = 0,
} = {}) => {
  const params = new URLSearchParams();

  params.append("limit", String(limit));
  params.append("offset", String(offset));

  return request(
    `/admin/investments/pending?${params.toString()}`,
    {
      method: "GET",
    }
  );
};

export const getInvestmentDetails = async (
  investmentId
) => {
  if (
    investmentId === undefined ||
    investmentId === null ||
    investmentId === ""
  ) {
    throw new Error(
      "Investment ID is required"
    );
  }

  return request(
    `/admin/investments/${encodeURIComponent(
      String(investmentId)
    )}`,
    {
      method: "GET",
    }
  );
};

export const getInvestmentBondDetails = async (
  investmentId
) => {
  if (
    investmentId === undefined ||
    investmentId === null ||
    investmentId === ""
  ) {
    throw new Error(
      "Investment ID is required"
    );
  }

  return request(
    `/admin/investments/${encodeURIComponent(
      String(investmentId)
    )}/bond`,
    {
      method: "GET",
    }
  );
};

export const approveInvestment = async (
  investmentId,
  {
    interestRate,
    remarks = "",
  } = {}
) => {
  if (
    investmentId === undefined ||
    investmentId === null ||
    investmentId === ""
  ) {
    throw new Error(
      "Investment ID is required"
    );
  }

  if (
    interestRate === undefined ||
    interestRate === null ||
    interestRate === ""
  ) {
    throw new Error(
      "Interest rate is required"
    );
  }

  const numericRate =
    Number(interestRate);

  if (
    Number.isNaN(numericRate) ||
    numericRate < 0
  ) {
    throw new Error(
      "Enter a valid interest rate"
    );
  }

  return request(
    `/admin/investments/${encodeURIComponent(
      String(investmentId)
    )}/approve`,
    {
      method: "PUT",
      body: JSON.stringify({
        interest_rate: numericRate,
        remarks:
          remarks?.trim() || null,
      }),
    }
  );
};

export const rejectInvestment = async (
  investmentId,
  {
    rejectionReason,
    remarks = "",
  } = {}
) => {
  if (
    investmentId === undefined ||
    investmentId === null ||
    investmentId === ""
  ) {
    throw new Error(
      "Investment ID is required"
    );
  }

  if (!rejectionReason?.trim()) {
    throw new Error(
      "Rejection reason is required"
    );
  }

  return request(
    `/admin/investments/${encodeURIComponent(
      String(investmentId)
    )}/reject`,
    {
      method: "PUT",
      body: JSON.stringify({
        rejection_reason:
          rejectionReason.trim(),
        remarks:
          remarks?.trim() || null,
      }),
    }
  );
};

export const getPendingTenureExtensions =
  async ({
    limit = 100,
    offset = 0,
  } = {}) => {
    const params =
      new URLSearchParams();

    params.append(
      "limit",
      String(limit)
    );

    params.append(
      "offset",
      String(offset)
    );

    return request(
      `/admin/tenure-extensions/pending?${params.toString()}`,
      {
        method: "GET",
      }
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
        "Request ID is required"
      );
    }

    return request(
      `/admin/tenure-extensions/${encodeURIComponent(
        String(requestId)
      )}`,
      {
        method: "GET",
      }
    );
  };

export const approveTenureExtension =
  async (
    requestId,
    remarks = ""
  ) => {
    if (
      requestId === undefined ||
      requestId === null ||
      requestId === ""
    ) {
      throw new Error(
        "Request ID is required"
      );
    }

    return request(
      `/admin/tenure-extensions/${encodeURIComponent(
        String(requestId)
      )}/approve`,
      {
        method: "PUT",
        body: JSON.stringify({
          remarks:
            remarks?.trim() || null,
        }),
      }
    );
  };

export const rejectTenureExtension =
  async (
    requestId,
    remarks = ""
  ) => {
    if (
      requestId === undefined ||
      requestId === null ||
      requestId === ""
    ) {
      throw new Error(
        "Request ID is required"
      );
    }

    return request(
      `/admin/tenure-extensions/${encodeURIComponent(
        String(requestId)
      )}/reject`,
      {
        method: "PUT",
        body: JSON.stringify({
          remarks:
            remarks?.trim() || null,
        }),
      }
    );
  };

export const getMonthlyInterest =
  async ({
    interestDueDate = "",
    limit = 100,
    offset = 0,
  } = {}) => {
    const params =
      new URLSearchParams();

    if (interestDueDate) {
      params.append(
        "interest_due_date",
        interestDueDate
      );
    }

    params.append(
      "limit",
      String(limit)
    );

    params.append(
      "offset",
      String(offset)
    );

    return request(
      `/admin/monthly-interest?${params.toString()}`,
      {
        method: "GET",
      }
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
        "Interest schedule ID is required"
      );
    }

    return request(
      `/admin/monthly-interest/${encodeURIComponent(
        String(interestScheduleId)
      )}`,
      {
        method: "GET",
      }
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
        "Interest schedule ID is required"
      );
    }

    return request(
      `/admin/monthly-interest/${encodeURIComponent(
        String(interestScheduleId)
      )}/approve`,
      {
        method: "PUT",
      }
    );
  };

export const rejectMonthlyInterest =
  async (
    interestScheduleId,
    {
      rejectionReason,
      remarks = "",
    } = {}
  ) => {
    if (
      interestScheduleId ===
        undefined ||
      interestScheduleId === null ||
      interestScheduleId === ""
    ) {
      throw new Error(
        "Interest schedule ID is required"
      );
    }

    if (!rejectionReason?.trim()) {
      throw new Error(
        "Rejection reason is required"
      );
    }

    return request(
      `/admin/monthly-interest/${encodeURIComponent(
        String(interestScheduleId)
      )}/reject`,
      {
        method: "PUT",
        body: JSON.stringify({
          rejection_reason:
            rejectionReason.trim(),
          remarks:
            remarks?.trim() || null,
        }),
      }
    );
  };

export const approveAllMonthlyInterest =
  async (interestDueDate) => {
    if (!interestDueDate) {
      throw new Error(
        "Interest due date is required"
      );
    }

    return request(
      "/admin/monthly-interest/approve-all",
      {
        method: "PUT",
        body: JSON.stringify({
          interest_due_date:
            interestDueDate,
        }),
      }
    );
  };

export const createTenureTimeoutSettlement =
  async (investmentId) => {
    if (
      investmentId === undefined ||
      investmentId === null ||
      investmentId === ""
    ) {
      throw new Error(
        "Investment ID is required"
      );
    }

    return request(
      `/admin/investments/${encodeURIComponent(
        String(investmentId)
      )}/settlement`,
      {
        method: "POST",
      }
    );
  };

export const getDashboardSummary =
  async () => {
    return request(
      "/admin/dashboard/summary",
      {
        method: "GET",
      }
    );
  };

export const getInvestorGrowth =
  async () => {
    return request(
      "/admin/dashboard/investor-growth",
      {
        method: "GET",
      }
    );
  };

export const getMonthlyInvestmentTrend =
  async () => {
    return request(
      "/admin/dashboard/monthly-investment-trend",
      {
        method: "GET",
      }
    );
  };