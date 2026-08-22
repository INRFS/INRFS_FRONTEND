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
  const data =
    await response.json().catch(() => null);

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

const buildParams = (values = {}) => {
  const params = new URLSearchParams();

  Object.entries(values).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        params.set(
          key,
          String(value)
        );
      }
    }
  );

  return params.toString();
};

export const getSuperAdminDashboard =
  async () => {
    return request(
      `${API_URL}/api/superadmin/dashboard`
    );
  };

export const getSuperAdminBranches =
  async ({
    search = "",
    limit = 100,
    offset = 0,
  } = {}) => {
    const query = buildParams({
      search,
      limit: Math.min(
        Number(limit) || 100,
        100
      ),
      offset: Number(offset) || 0,
    });

    return request(
      `${API_URL}/api/superadmin/branches?${query}`
    );
  };

export const getSuperAdminBranchDetails =
  async (branchId) => {
    return request(
      `${API_URL}/api/superadmin/branches/${branchId}`
    );
  };

export const getSuperAdminAdmins =
  async ({
    search = "",
  } = {}) => {
    const query = buildParams({
      search,
    });

    return request(
      `${API_URL}/api/superadmin/admins?${query}`
    );
  };

export const getSuperAdminAdminDetails =
  async (adminId) => {
    return request(
      `${API_URL}/api/superadmin/admins/${adminId}`
    );
  };

export const getSuperAdminInvestors =
  async ({
    search = "",
    branchId = "",
    statusId = "",
    limit = 100,
    offset = 0,
  } = {}) => {
    const query = buildParams({
      search,
      branch_id: branchId,
      status_id: statusId,
      limit: Math.min(
        Number(limit) || 100,
        100
      ),
      offset: Number(offset) || 0,
    });

    return request(
      `${API_URL}/api/superadmin/investors?${query}`
    );
  };

export const getSuperAdminInvestorDetails =
  async (investorId) => {
    return request(
      `${API_URL}/api/superadmin/investors/${investorId}`
    );
  };

export const getSuperAdminInvestments =
  async ({
    search = "",
    branchId = "",
    statusId = "",
    limit = 100,
    offset = 0,
  } = {}) => {
    const query = buildParams({
      search,
      branch_id: branchId,
      status_id: statusId,
      limit: Math.min(
        Number(limit) || 100,
        100
      ),
      offset: Number(offset) || 0,
    });

    return request(
      `${API_URL}/api/superadmin/investments?${query}`
    );
  };

export const getSuperAdminPayments =
  async ({
    paymentType,
    limit = 100,
    offset = 0,
  }) => {
    const query = buildParams({
      payment_type: paymentType,
      limit: Math.min(
        Number(limit) || 100,
        100
      ),
      offset: Number(offset) || 0,
    });

    return request(
      `${API_URL}/api/superadmin/payments?${query}`
    );
  };

export const getSuperAdminPaymentDetails =
  async (
    sourceId,
    paymentType
  ) => {
    const query = buildParams({
      payment_type: paymentType,
    });

    return request(
      `${API_URL}/api/superadmin/payments/${sourceId}?${query}`
    );
  };

/*
  These two functions are used directly
  by SuperAdminDashboard.jsx.

  Admin endpoint currently returns the
  admin list without pagination.
*/
export const getRecentAdmins =
  async (limit = 5) => {
    const response =
      await getSuperAdminAdmins();

    const rows = Array.isArray(
      response?.data
    )
      ? response.data
      : [];

    return {
      ...response,
      data: rows.slice(0, limit),
    };
  };

export const getRecentInvestors =
  async (limit = 5) => {
    return getSuperAdminInvestors({
      limit,
      offset: 0,
    });
  };

export {
  API_URL,
};

export default {
  getSuperAdminDashboard,
  getSuperAdminBranches,
  getSuperAdminBranchDetails,
  getSuperAdminAdmins,
  getSuperAdminAdminDetails,
  getSuperAdminInvestors,
  getSuperAdminInvestorDetails,
  getSuperAdminInvestments,
  getSuperAdminPayments,
  getSuperAdminPaymentDetails,
  getRecentAdmins,
  getRecentInvestors,
};