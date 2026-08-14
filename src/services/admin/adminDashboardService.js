const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://187.52.115.32:8000";

const getToken = () => {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("admin_token") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
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
    credentials: "include",
    headers,
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
    let message = `Request failed with status ${response.status}`;

    if (typeof data === "string" && data) {
      message = data;
    } else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((item) => item?.msg || "Validation error")
        .join(", ");
    } else if (data?.detail) {
      message = data.detail;
    } else if (data?.message) {
      message = data.message;
    }

    throw new Error(message);
  }

  return data;
};

const getData = (response) => {
  if (response?.data !== undefined) {
    return response.data;
  }

  return response;
};

export const getAdminDashboardSummary = async () => {
  return apiRequest("/admin/dashboard/summary", {
    method: "GET",
  });
};

export const getAdminInvestorGrowth = async () => {
  return apiRequest("/admin/dashboard/investor-growth", {
    method: "GET",
  });
};

export const getAdminMonthlyInvestmentTrend = async () => {
  return apiRequest(
    "/admin/dashboard/monthly-investment-trend",
    {
      method: "GET",
    }
  );
};

export const getAdminDashboardData = async () => {
  const [
    summaryResponse,
    investorGrowthResponse,
    investmentTrendResponse,
  ] = await Promise.all([
    getAdminDashboardSummary(),
    getAdminInvestorGrowth(),
    getAdminMonthlyInvestmentTrend(),
  ]);

  return {
    summary: getData(summaryResponse),
    investorGrowth: getData(investorGrowthResponse),
    investmentTrend: getData(investmentTrendResponse),
  };
};