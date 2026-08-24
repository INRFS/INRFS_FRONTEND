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
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    if (Array.isArray(data?.detail)) {
      message = data.detail
        .map(
          (item) =>
            item?.msg ||
            "Validation error"
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

const request = async (
  url,
  options = {}
) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  return handleResponse(response);
};

const normalizeNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number <= 0
  ) {
    return "";
  }

  return String(Math.trunc(number));
};

export const getSuperAdminInvestments =
  async ({
    search = "",
    branchId = "",
    statusId = "",
    limit = 100,
    offset = 0,
  } = {}) => {
    const params =
      new URLSearchParams();

    if (
      search &&
      String(search).trim()
    ) {
      params.set(
        "search",
        String(search).trim()
      );
    }

    const safeBranchId =
      normalizeNumber(branchId);

    const safeStatusId =
      normalizeNumber(statusId);

    if (safeBranchId) {
      params.set(
        "branch_id",
        safeBranchId
      );
    }

    if (safeStatusId) {
      params.set(
        "status_id",
        safeStatusId
      );
    }

    const safeLimit =
      Math.min(
        Math.max(
          Number(limit) || 100,
          1
        ),
        100
      );

    const safeOffset =
      Math.max(
        Number(offset) || 0,
        0
      );

    params.set(
      "limit",
      String(safeLimit)
    );

    params.set(
      "offset",
      String(safeOffset)
    );

    return request(
      `${API_URL}/api/superadmin/investments?${params.toString()}`
    );
  };

export const getSuperAdminInvestmentDetails =
  async (investmentId) => {
    if (!investmentId) {
      throw new Error(
        "Investment ID is required."
      );
    }

    return request(
      `${API_URL}/api/superadmin/investments/${encodeURIComponent(
        investmentId
      )}`
    );
  };

export const exportInvestmentsCSV = (
  rows,
  filename = "investments.csv"
) => {
  if (
    !Array.isArray(rows) ||
    !rows.length
  ) {
    return false;
  }

  const keys =
    Object.keys(rows[0]);

  const escapeCSV = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return `"${String(value).replaceAll(
      '"',
      '""'
    )}"`;
  };

  const csv = [
    keys,
    ...rows.map((row) =>
      keys.map(
        (key) => row[key]
      )
    ),
  ]
    .map((row) =>
      row
        .map(escapeCSV)
        .join(",")
    )
    .join("\n");

  const blob = new Blob(
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
    document.createElement("a");

  link.href = url;
  link.download =
    filename;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  window.URL.revokeObjectURL(
    url
  );

  return true;
};

export { API_URL };