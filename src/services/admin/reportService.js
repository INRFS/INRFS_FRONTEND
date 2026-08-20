const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

const getToken = () => {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
};

const getHeaders = () => {
  const token = getToken();

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    if (Array.isArray(data?.detail)) {
      message = data.detail
        .map(
          (item) =>
            item?.msg || "Validation error"
        )
        .join(", ");
    } else if (data?.detail) {
      message = String(data.detail);
    } else if (data?.message) {
      message = String(data.message);
    }

    throw new Error(message);
  }

  return data;
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  return handleResponse(response);
};

export const getReportDashboard = async (year) => {
  const params = new URLSearchParams();

  if (year) {
    params.set("year", String(year));
  }

  return request(
    `${API_URL}/admin/reports/dashboard?${params.toString()}`
  );
};

export const getReportSummary = async (year) => {
  const params = new URLSearchParams();

  if (year) {
    params.set("year", String(year));
  }

  return request(
    `${API_URL}/admin/reports/summary?${params.toString()}`
  );
};

export const getMonthlyInvestments = async (year) => {
  const params = new URLSearchParams();

  if (year) {
    params.set("year", String(year));
  }

  return request(
    `${API_URL}/admin/reports/monthly-investments?${params.toString()}`
  );
};

export const getInvestorGrowth = async (year) => {
  const params = new URLSearchParams();

  if (year) {
    params.set("year", String(year));
  }

  return request(
    `${API_URL}/admin/reports/investor-growth?${params.toString()}`
  );
};

export const getStatusDistribution = async (year) => {
  const params = new URLSearchParams();

  if (year) {
    params.set("year", String(year));
  }

  return request(
    `${API_URL}/admin/reports/status-distribution?${params.toString()}`
  );
};

export const getReportInvestments = async ({
  limit = 100,
  offset = 0,
} = {}) => {
  const safeLimit = Math.min(
    Number(limit) || 100,
    100
  );

  const safeOffset =
    Number(offset) || 0;

  const params = new URLSearchParams({
    limit: String(safeLimit),
    offset: String(safeOffset),
  });

  return request(
    `${API_URL}/admin/reports/investments?${params.toString()}`
  );
};

export const exportReportCSV = (
  rows,
  filename = "investment-report.csv"
) => {
  if (!rows?.length) {
    return;
  }

  const keys = Object.keys(rows[0]);

  const escapeCSV = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    const stringValue = String(value);

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(
        /"/g,
        '""'
      )}"`;
    }

    return stringValue;
  };

  const csv = [
    keys.join(","),
    ...rows.map((row) =>
      keys
        .map((key) =>
          escapeCSV(row[key])
        )
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
};

export { API_URL };