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
    const localValue = localStorage.getItem(key);

    if (localValue && localValue !== "null" && localValue !== "undefined") {
      return localValue;
    }

    const sessionValue = sessionStorage.getItem(key);

    if (
      sessionValue &&
      sessionValue !== "null" &&
      sessionValue !== "undefined"
    ) {
      return sessionValue;
    }
  }

  return null;
};

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    Accept: "application/json",
    ...(options.body
      ? {
          "Content-Type": "application/json",
        }
      : {}),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType =
    response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      data = text || null;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    if (response.status === 401) {
      message =
        "Authentication failed. Please login again.";
    } else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map(
          (item) =>
            item?.msg ||
            item?.message ||
            String(item)
        )
        .join(", ");
    } else if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (typeof data?.message === "string") {
      message = data.message;
    } else if (
      typeof data === "string" &&
      data
    ) {
      message = data;
    }

    throw new Error(message);
  }

  return data;
};

const getList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.investments)) {
    return response.investments;
  }

  if (Array.isArray(response?.tenures)) {
    return response.tenures;
  }

  if (Array.isArray(response?.bonds)) {
    return response.bonds;
  }

  return [];
};

const getStatusId = (investment) => {
  const values = [
    investment?.status_id,
    investment?.investment_status_id,
    investment?.statusId,
    investment?.investmentStatusId,
    investment?.status?.id,
    investment?.investment_status?.id,
    investment?.investmentStatus?.id,
  ];

  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      const number = Number(value);

      if (!Number.isNaN(number)) {
        return number;
      }
    }
  }

  return null;
};

const getStatusName = (investment) => {
  const values = [
    investment?.status_name,
    investment?.investment_status_name,
    investment?.statusName,
    investment?.status?.status_name,
    investment?.status?.name,
    investment?.investment_status?.status_name,
    investment?.investment_status?.name,
    investment?.investmentStatus?.status_name,
    investment?.investmentStatus?.name,
  ];

  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim()
    ) {
      return String(value).trim();
    }
  }

  return null;
};

const statusIdMap = {
  1: "Pending Approval",
  2: "Active",
  3: "Closed",
  4: "Rejected",
  5: "Refunded",
};

const normalizeStatus = (
  statusName,
  statusId
) => {
  if (statusName) {
    const value = String(statusName)
      .trim()
      .toLowerCase();

    if (
      value === "pending" ||
      value === "pending approval" ||
      value === "pending_approval" ||
      value === "pending-approval"
    ) {
      return "Pending Approval";
    }

    if (
      value === "active" ||
      value === "approved"
    ) {
      return "Active";
    }

    if (
      value === "closed" ||
      value === "settled"
    ) {
      return "Closed";
    }

    if (
      value === "rejected" ||
      value === "reject"
    ) {
      return "Rejected";
    }

    if (
      value === "refunded" ||
      value === "refund"
    ) {
      return "Refunded";
    }

    if (
      value === "extension requested" ||
      value === "tenure extension requested"
    ) {
      return "Extension Requested";
    }

    if (
      value === "pre-close requested" ||
      value === "preclose requested"
    ) {
      return "Pre-Close Requested";
    }

    return statusName;
  }

  if (
    statusId !== null &&
    statusIdMap[statusId]
  ) {
    return statusIdMap[statusId];
  }

  return "Unknown";
};

const normalizeInvestment = (
  investment
) => {
  const statusId =
    getStatusId(investment);

  const statusName =
    normalizeStatus(
      getStatusName(investment),
      statusId
    );

  return {
    ...investment,
    status_id: statusId,
    status_name: statusName,
  };
};

export const getInvestmentStatuses =
  async () => {
    return apiRequest(
      "/masters/investment-statuses",
      {
        method: "GET",
      }
    );
  };

export const getMyInvestments =
  async () => {
    const [
      investmentsResponse,
      statusesResponse,
    ] = await Promise.all([
      apiRequest(
        "/investments/my-investments",
        {
          method: "GET",
        }
      ),
      getInvestmentStatuses().catch(
        () => []
      ),
    ]);

    const investments =
      getList(
        investmentsResponse
      );

    const statuses =
      getList(statusesResponse);

    const statusMap = {};

    statuses.forEach(
      (status) => {
        if (
          status?.id !== undefined &&
          status?.id !== null
        ) {
          statusMap[
            Number(status.id)
          ] =
            status.status_name ||
            status.name;
        }
      }
    );

    return investments.map(
      (investment) => {
        const normalized =
          normalizeInvestment(
            investment
          );

        const statusId =
          normalized.status_id;

        const mappedStatus =
          statusId !== null
            ? statusMap[statusId]
            : null;

        return {
          ...normalized,
          status_name:
            normalizeStatus(
              mappedStatus ||
                normalized.status_name,
              statusId
            ),
        };
      }
    );
  };

export const getMyInvestment =
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

    const [
      investmentResponse,
      statusesResponse,
    ] = await Promise.all([
      apiRequest(
        `/investments/my-investments/${encodeURIComponent(
          investmentId
        )}`,
        {
          method: "GET",
        }
      ),
      getInvestmentStatuses().catch(
        () => []
      ),
    ]);

    const statuses =
      getList(statusesResponse);

    const statusMap = {};

    statuses.forEach(
      (status) => {
        if (
          status?.id !== undefined &&
          status?.id !== null
        ) {
          statusMap[
            Number(status.id)
          ] =
            status.status_name ||
            status.name;
        }
      }
    );

    const investment =
      investmentResponse?.data ||
      investmentResponse;

    const normalized =
      normalizeInvestment(
        investment
      );

    const mappedStatus =
      normalized.status_id !== null
        ? statusMap[
            normalized.status_id
          ]
        : null;

    return {
      ...normalized,
      status_name:
        normalizeStatus(
          mappedStatus ||
            normalized.status_name,
          normalized.status_id
        ),
    };
  };

export const getMyInvestmentBond =
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

    const token = getToken();

    if (!token) {
      throw new Error(
        "Authentication token not found. Please login again."
      );
    }

    const response =
      await apiRequest(
        `/investments/my-investments/${encodeURIComponent(
          investmentId
        )}/bond`,
        {
          method: "GET",
        }
      );

    return (
      response?.data ||
      response
    );
  };

export const getMyBond =
  async (bondId) => {
    if (
      bondId === undefined ||
      bondId === null ||
      bondId === ""
    ) {
      throw new Error(
        "Bond ID is required"
      );
    }

    const token = getToken();

    if (!token) {
      throw new Error(
        "Authentication token not found. Please login again."
      );
    }

    const response =
      await apiRequest(
        `/investments/my-bonds/${encodeURIComponent(
          bondId
        )}`,
        {
          method: "GET",
        }
      );

    return (
      response?.data ||
      response
    );
  };

export const getInvestmentTenures =
  async () => {
    const response =
      await apiRequest(
        "/masters/investment-tenures",
        {
          method: "GET",
        }
      );

    return getList(response);
  };

export const calculateInvestment =
  async (
    investmentAmount,
    tenureId
  ) => {
    const amount =
      Number(investmentAmount);

    const tenure =
      Number(tenureId);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new Error(
        "Valid investment amount is required."
      );
    }

    if (
      !Number.isFinite(tenure) ||
      tenure <= 0
    ) {
      throw new Error(
        "Valid tenure is required."
      );
    }

    return apiRequest(
      "/investments/calculate",
      {
        method: "POST",
        body: JSON.stringify({
          investment_amount: amount,
          tenure_id: tenure,
        }),
      }
    );
  };

export const createInvestment =
  async (
    investmentAmount,
    tenureId
  ) => {
    const amount =
      Number(investmentAmount);

    const tenure =
      Number(tenureId);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new Error(
        "Valid investment amount is required."
      );
    }

    if (
      !Number.isFinite(tenure) ||
      tenure <= 0
    ) {
      throw new Error(
        "Valid tenure is required."
      );
    }

    return apiRequest(
      "/investments/",
      {
        method: "POST",
        body: JSON.stringify({
          investment_amount: amount,
          tenure_id: tenure,
        }),
      }
    );
  };

export const requestTenureExtension =
  async (
    investmentId,
    extensionMonths,
    remarks = ""
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

    const months =
      Number(extensionMonths);

    if (
      !Number.isFinite(months) ||
      months <= 0
    ) {
      throw new Error(
        "Valid extension months are required"
      );
    }

    return apiRequest(
      `/investments/my-investments/${encodeURIComponent(
        investmentId
      )}/tenure-extension`,
      {
        method: "POST",
        body: JSON.stringify({
          extension_months: months,
          remarks:
            remarks?.trim() || null,
        }),
      }
    );
  };

export const requestPreClose =
  async (
    investmentId,
    reason
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

    const cleanReason =
      String(reason || "").trim();

    if (!cleanReason) {
      throw new Error(
        "Pre-close reason is required"
      );
    }

    return apiRequest(
      `/investments/my-investments/${encodeURIComponent(
        investmentId
      )}/preclose`,
      {
        method: "POST",
        body: JSON.stringify({
          reason: cleanReason,
        }),
      }
    );
  };

export const approveInvestment =
  async (
    investmentId,
    interestRate,
    remarks = ""
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

    const rate =
      Number(interestRate);

    if (
      !Number.isFinite(rate) ||
      rate <= 0
    ) {
      throw new Error(
        "Valid interest rate is required"
      );
    }

    return apiRequest(
      `/investments/admin/${encodeURIComponent(
        investmentId
      )}/approve`,
      {
        method: "PUT",
        body: JSON.stringify({
          interest_rate: rate,
          remarks:
            remarks?.trim() || null,
        }),
      }
    );
  };

export const rejectInvestment =
  async (
    investmentId,
    remarks
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

    const cleanRemarks =
      String(
        remarks || ""
      ).trim();

    if (!cleanRemarks) {
      throw new Error(
        "Rejection remarks are required"
      );
    }

    return apiRequest(
      `/investments/admin/${encodeURIComponent(
        investmentId
      )}/reject`,
      {
        method: "PUT",
        body: JSON.stringify({
          remarks: cleanRemarks,
        }),
      }
    );
  };

export default {
  getInvestmentStatuses,
  getMyInvestments,
  getMyInvestment,
  getMyInvestmentBond,
  getMyBond,
  getInvestmentTenures,
  calculateInvestment,
  createInvestment,
  requestTenureExtension,
  requestPreClose,
  approveInvestment,
  rejectInvestment,
};