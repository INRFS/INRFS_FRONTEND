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

export const getAdminManagement = async ({
  search = "",
} = {}) => {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set(
      "search",
      search.trim()
    );
  }

  const query =
    params.toString();

  return request(
    `${API_URL}/api/superadmin/admins${
      query ? `?${query}` : ""
    }`
  );
};

export const getAdminDetails = async (
  adminId
) => {
  if (!adminId) {
    throw new Error(
      "Admin ID is required."
    );
  }

  return request(
    `${API_URL}/api/superadmin/admins/${encodeURIComponent(
      adminId
    )}`
  );
};

export const getAdminBranches = async () => {
  return request(
    `${API_URL}/api/superadmin/admins/filters/branches`
  );
};

export const getAdminRoles = async () => {
  return request(
    `${API_URL}/api/superadmin/admins/filters/roles`
  );
};

export const getAdminStatuses = async () => {
  return request(
    `${API_URL}/api/superadmin/admins/filters/statuses`
  );
};
export const createAdmin = async (payload) => {
  return request(
    `${API_URL}/api/superadmin/admins`,
    {
      method: "POST",
      body: JSON.stringify({
        full_name: payload.full_name,
        email: payload.email,
        mobile: payload.mobile,
        branch_id: Number(payload.branch_id),
        role_id: Number(payload.role_id),
        status_id: Number(payload.status_id),

        // IMPORTANT
        password: payload.password,
      }),
    }
  );
};

export const updateAdmin = async (
  adminId,
  payload
) => {
  if (!adminId) {
    throw new Error(
      "Admin ID is required."
    );
  }

  return request(
    `${API_URL}/api/superadmin/admins/${encodeURIComponent(
      adminId
    )}`,
    {
      method: "PUT",
      body: JSON.stringify({
        full_name:
          payload.full_name,
        email:
          payload.email,
        mobile:
          payload.mobile,
        branch_id:
          Number(payload.branch_id),
        role_id:
          Number(payload.role_id),
        status_id:
          Number(payload.status_id),
      }),
    }
  );
};

export const suspendAdmin = async (
  adminId
) => {
  if (!adminId) {
    throw new Error(
      "Admin ID is required."
    );
  }

  return request(
    `${API_URL}/api/superadmin/admins/${encodeURIComponent(
      adminId
    )}/suspend`,
    {
      method: "PATCH",
    }
  );
};

export const exportAdminsCSV = (
  rows,
  filename = "admins.csv"
) => {
  if (
    !Array.isArray(rows) ||
    !rows.length
  ) {
    return false;
  }

  const headers = [
    "Admin ID",
    "Name",
    "Email",
    "Mobile",
    "Branch",
    "Role",
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
      row.admin_id ??
        row.id ??
        "",
      row.admin_name ??
        row.full_name ??
        row.name ??
        "",
      row.email ?? "",
      row.mobile ?? "",
      row.branch_name ??
        row.branch ??
        "",
      row.role_name ??
        row.role ??
        "",
      row.status_name ??
        row.status ??
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

export { API_URL };