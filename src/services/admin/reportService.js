const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://187.52.115.32:8000";

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
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

const handleResponse = async (response) => {
  const data =
    await response.json().catch(() => null);

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

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

export const getReportDashboard =
  async () => {
    const response = await fetch(
      `${API_URL}/admin/reports/dashboard`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  };

export const getReportSummary =
  async () => {
    const response = await fetch(
      `${API_URL}/admin/reports/summary`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  };

export const getMonthlyInvestments =
  async () => {
    const response = await fetch(
      `${API_URL}/admin/reports/monthly-investments`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  };

export const getInvestorGrowth =
  async () => {
    const response = await fetch(
      `${API_URL}/admin/reports/investor-growth`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  };

export const getStatusDistribution =
  async () => {
    const response = await fetch(
      `${API_URL}/admin/reports/status-distribution`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  };

export const getReportInvestments =
  async ({
    limit = 10,
    offset = 0,
  } = {}) => {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });

    const response = await fetch(
      `${API_URL}/admin/reports/investments?${params.toString()}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
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

    const stringValue =
      String(value);

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

  const blob = new Blob(
    [csv],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

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