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

const handleResponse = async (
  response
) => {
  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    if (
      Array.isArray(
        data?.detail
      )
    ) {
      message =
        data.detail
          .map(
            (item) =>
              item?.msg ||
              "Validation error"
          )
          .join(", ");
    } else if (
      data?.detail
    ) {
      message =
        String(data.detail);
    } else if (
      data?.message
    ) {
      message =
        String(data.message);
    }

    throw new Error(message);
  }

  return data;
};

const request = async (
  url,
  options = {}
) => {
  const response =
    await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    });

  return handleResponse(
    response
  );
};


const normalizeId = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  const number =
    Number(value);

  if (
    !Number.isFinite(number) ||
    number <= 0
  ) {
    return "";
  }

  return String(
    Math.trunc(number)
  );
};


export const getInvestorManagement =
  async ({
    search = "",
    branchId = "",
    statusId = "",
    limit = 10,
    offset = 0,
  } = {}) => {

    const params =
      new URLSearchParams();

    const safeLimit =
      Math.min(
        Math.max(
          Number(limit) || 10,
          1
        ),
        100
      );

    const safeOffset =
      Math.max(
        Number(offset) || 0,
        0
      );

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
      normalizeId(
        branchId
      );

    const safeStatusId =
      normalizeId(
        statusId
      );

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

    params.set(
      "limit",
      String(safeLimit)
    );

    params.set(
      "offset",
      String(safeOffset)
    );

    return request(
      `${API_URL}/api/superadmin/investor-management?${params.toString()}`
    );
  };



export const getInvestorManagementBranches =
  async () => {
    return request(
      `${API_URL}/api/superadmin/investor-management/filters/branches`
    );
  };


export const getInvestorManagementStatuses =
  async () => {
    return request(
      `${API_URL}/api/superadmin/investor-management/filters/statuses`
    );
  };


export const getInvestorManagementSummary =
  async () => {
    return request(
      `${API_URL}/api/superadmin/investor-management/summary`
    );
  };


export const getInvestorManagementDetails =
  async (
    investorId
  ) => {

    if (
      !investorId
    ) {
      throw new Error(
        "Investor ID is required."
      );
    }

    return request(
      `${API_URL}/api/superadmin/investor-management/${encodeURIComponent(
        investorId
      )}`
    );
  };


export const exportInvestorsCSV = (
  rows,
  filename = "investors.csv"
) => {

  if (
    !Array.isArray(rows) ||
    !rows.length
  ) {
    return false;
  }

  const headers = [
    "Investor ID",
    "Name",
    "Mobile",
    "Branch",
    "Registered",
    "KYC",
    "Status",
    "AUM",
  ];

  const escapeCSV = (
    value
  ) => {

    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return `"${String(
      value
    ).replaceAll(
      '"',
      '""'
    )}"`;
  };

  const csv = [
    headers,
    ...rows.map(
      (row) => [
        row.id,
        row.name,
        row.mobile,
        row.branch,
        row.registered,
        row.kyc,
        row.status,
        row.aum,
      ]
    ),
  ]
    .map(
      (row) =>
        row
          .map(
            escapeCSV
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