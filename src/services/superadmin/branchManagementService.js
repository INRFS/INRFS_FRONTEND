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
  const response = await fetch(
    url,
    {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    }
  );

  return handleResponse(response);
};

export const getBranchManagement =
  async ({
    search = "",
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

    params.set(
      "limit",
      String(safeLimit)
    );

    params.set(
      "offset",
      String(safeOffset)
    );

    return request(
      `${API_URL}/api/superadmin/branch-management?${params.toString()}`
    );
  };

export const getBranchManagementDetails =
  async (branchId) => {
    if (
      branchId === null ||
      branchId === undefined ||
      branchId === ""
    ) {
      throw new Error(
        "Branch ID is required."
      );
    }

    return request(
      `${API_URL}/api/superadmin/branch-management/${encodeURIComponent(
        branchId
      )}`
    );
  };

export const getBranchStates =
  async () => {
    return request(
      `${API_URL}/api/superadmin/branch-management/states`
    );
  };

export const createBranch =
  async ({
    branch_name,
    city_name,
    state_id,
    is_active = true,
  }) => {
    return request(
      `${API_URL}/api/superadmin/branch-management`,
      {
        method: "POST",
        body: JSON.stringify({
          branch_name:
            String(branch_name || "").trim(),
          city_name:
            String(city_name || "").trim(),
          state_id: Number(state_id),
          is_active: Boolean(is_active),
        }),
      }
    );
  };

export const updateBranch =
  async (
    branchId,
    {
      branch_name,
      city_name,
      state_id,
      is_active = true,
    }
  ) => {
    if (
      branchId === null ||
      branchId === undefined ||
      branchId === ""
    ) {
      throw new Error(
        "Branch ID is required."
      );
    }

    return request(
      `${API_URL}/api/superadmin/branch-management/${encodeURIComponent(
        branchId
      )}`,
      {
        method: "PUT",
        body: JSON.stringify({
          branch_name:
            String(branch_name || "").trim(),
          city_name:
            String(city_name || "").trim(),
          state_id: Number(state_id),
          is_active: Boolean(is_active),
        }),
      }
    );
  };

export const deleteBranch =
  async (branchId) => {
    if (
      branchId === null ||
      branchId === undefined ||
      branchId === ""
    ) {
      throw new Error(
        "Branch ID is required."
      );
    }

    return request(
      `${API_URL}/api/superadmin/branch-management/${encodeURIComponent(
        branchId
      )}`,
      {
        method: "DELETE",
      }
    );
  };

export const exportBranchesCSV = (
  rows,
  filename = "branches.csv"
) => {
  if (
    !Array.isArray(rows) ||
    !rows.length
  ) {
    return false;
  }

  const headers = [
    "Branch",
    "City",
    "State",
    "Admin",
    "Investors",
    "AUM",
    "Status",
  ];

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
    headers,
    ...rows.map((row) => [
      row.branch ??
        row.branch_name ??
        "",
      row.city ??
        row.city_name ??
        "",
      row.state ??
        row.state_name ??
        "",
      row.admin ??
        row.admin_name ??
        "",
      row.investors ??
        row.active_investor_count ??
        0,
      row.aum ?? 0,
      row.status ??
        row.branch_status ??
        "",
    ]),
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
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);

  return true;
};

export {
  API_URL,
};