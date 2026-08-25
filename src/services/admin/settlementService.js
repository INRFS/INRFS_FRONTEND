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
    const localValue =
      localStorage.getItem(key);

    if (
      localValue &&
      localValue !== "null" &&
      localValue !== "undefined"
    ) {
      return localValue;
    }

    const sessionValue =
      sessionStorage.getItem(key);

    if (
      sessionValue &&
      sessionValue !== "null" &&
      sessionValue !== "undefined"
    ) {
      return sessionValue;
    }
  }

  return "";
};

const getHeaders = (json = false) => {
  const token = getToken();

  return {
    Accept: "application/json",

    ...(json
      ? {
          "Content-Type":
            "application/json",
        }
      : {}),

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),
  };
};

const apiRequest = async (
  endpoint,
  options = {}
) => {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        ...getHeaders(
          Boolean(options.body)
        ),
        ...(options.headers || {}),
      },
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    if (response.status === 401) {
      message =
        "Authentication failed. Please login again.";
    } else if (
      Array.isArray(data?.detail)
    ) {
      message = data.detail
        .map(
          (item) =>
            item?.msg ||
            item?.message ||
            String(item)
        )
        .join(", ");
    } else if (
      typeof data?.detail === "string"
    ) {
      message = data.detail;
    } else if (
      typeof data?.message === "string"
    ) {
      message = data.message;
    }

    throw new Error(message);
  }

  return data;
};

const makePagination = (
  limit = 100,
  offset = 0
) => {
  const params =
    new URLSearchParams();

  params.set(
    "limit",
    String(limit)
  );

  params.set(
    "offset",
    String(offset)
  );

  return params.toString();
};

/* =========================================================
   GET LIST
   ========================================================= */

export const getList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    Array.isArray(response?.items)
  ) {
    return response.items;
  }

  if (
    Array.isArray(response?.data)
  ) {
    return response.data;
  }

  if (
    Array.isArray(response?.settlements)
  ) {
    return response.settlements;
  }

  if (
    Array.isArray(response?.requests)
  ) {
    return response.requests;
  }

  if (
    Array.isArray(response?.results)
  ) {
    return response.results;
  }

  if (
    Array.isArray(
      response?.tenure_timeout_settlements
    )
  ) {
    return response.tenure_timeout_settlements;
  }

  if (
    Array.isArray(
      response?.preclose_requests
    )
  ) {
    return response.preclose_requests;
  }

  if (
    Array.isArray(
      response?.closed_settlements
    )
  ) {
    return response.closed_settlements;
  }

  return [];
};

/* =========================================================
   TENURE TIMEOUT SETTLEMENTS
   ========================================================= */

export const getTenureTimeoutSettlements =
  async ({
    limit = 100,
    offset = 0,
  } = {}) => {
    return apiRequest(
      `/admin/settlements/tenure-timeout?${makePagination(
        limit,
        offset
      )}`,
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   TENURE TIMEOUT DETAILS
   ========================================================= */

export const getTenureTimeoutSettlementDetails =
  async (settlementId) => {
    if (
      settlementId === undefined ||
      settlementId === null ||
      settlementId === ""
    ) {
      throw new Error(
        "Settlement ID is required"
      );
    }

    return apiRequest(
      `/admin/settlements/tenure-timeout/${encodeURIComponent(
        settlementId
      )}`,
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   ADMIN APPROVE TENURE TIMEOUT
   ========================================================= */

export const approveTenureTimeoutSettlement =
  async (settlementId) => {
    if (
      settlementId === undefined ||
      settlementId === null ||
      settlementId === ""
    ) {
      throw new Error(
        "Settlement ID is required"
      );
    }

    return apiRequest(
      `/admin/settlements/tenure-timeout/${encodeURIComponent(
        settlementId
      )}/approve`,
      {
        method: "PUT",
        body: JSON.stringify({}),
      }
    );
  };

/* =========================================================
   ADMIN REJECT TENURE TIMEOUT
   ========================================================= */

export const rejectTenureTimeoutSettlement =
  async (settlementId) => {
    if (
      settlementId === undefined ||
      settlementId === null ||
      settlementId === ""
    ) {
      throw new Error(
        "Settlement ID is required"
      );
    }

    return apiRequest(
      `/admin/settlements/tenure-timeout/${encodeURIComponent(
        settlementId
      )}/reject`,
      {
        method: "PUT",
        body: JSON.stringify({}),
      }
    );
  };

/* =========================================================
   PRE-CLOSE REQUESTS
   ========================================================= */

export const getPrecloseRequests =
  async ({
    limit = 100,
    offset = 0,
  } = {}) => {
    return apiRequest(
      `/admin/settlements/preclose?${makePagination(
        limit,
        offset
      )}`,
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   PRE-CLOSE DETAILS
   ========================================================= */

export const getPrecloseRequestDetails =
  async (requestId) => {
    if (
      requestId === undefined ||
      requestId === null ||
      requestId === ""
    ) {
      throw new Error(
        "Pre-close request ID is required"
      );
    }

    return apiRequest(
      `/admin/settlements/preclose/${encodeURIComponent(
        requestId
      )}`,
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   ADMIN APPROVE PRE-CLOSE
   ========================================================= */

export const approvePrecloseRequest =
  async (requestId) => {
    if (
      requestId === undefined ||
      requestId === null ||
      requestId === ""
    ) {
      throw new Error(
        "Pre-close request ID is required"
      );
    }

    return apiRequest(
      `/admin/settlements/preclose/${encodeURIComponent(
        requestId
      )}/approve`,
      {
        method: "PUT",
        body: JSON.stringify({}),
      }
    );
  };

/* =========================================================
   ADMIN REJECT PRE-CLOSE
   ========================================================= */

export const rejectPrecloseRequest =
  async (requestId) => {
    if (
      requestId === undefined ||
      requestId === null ||
      requestId === ""
    ) {
      throw new Error(
        "Pre-close request ID is required"
      );
    }

    return apiRequest(
      `/admin/settlements/preclose/${encodeURIComponent(
        requestId
      )}/reject`,
      {
        method: "PUT",
        body: JSON.stringify({}),
      }
    );
  };

/* =========================================================
   CLOSED SETTLEMENTS
   ========================================================= */

export const getClosedSettlements =
  async ({
    limit = 100,
    offset = 0,
  } = {}) => {
    return apiRequest(
      `/admin/settlements/closed?${makePagination(
        limit,
        offset
      )}`,
      {
        method: "GET",
      }
    );
  };

/* =========================================================
   EXPORT
   ========================================================= */

export { API_URL };

export default {
  getTenureTimeoutSettlements,
  getTenureTimeoutSettlementDetails,

  approveTenureTimeoutSettlement,
  rejectTenureTimeoutSettlement,

  getPrecloseRequests,
  getPrecloseRequestDetails,

  approvePrecloseRequest,
  rejectPrecloseRequest,

  getClosedSettlements,

  getList,
};