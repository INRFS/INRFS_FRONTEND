const API_URL =
  process.env.REACT_APP_API_URL ||
"http://187.52.115.32:8000";

const getToken = () => {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    "";

  return token;
};

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    let message = "Request failed";

    if (Array.isArray(data.detail)) {
      message = data.detail
        .map((item) => item.msg || "Validation error")
        .join(", ");
    } else if (typeof data.detail === "string") {
      message = data.detail;
    } else if (typeof data.message === "string") {
      message = data.message;
    }

    if (response.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("token");
    }

    throw new Error(message);
  }

  return data;
};

export const getInvestorDashboard = async () => {
  return apiRequest("/investor/dashboard", {
    method: "GET",
  });
};

export default getInvestorDashboard;