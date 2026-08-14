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

const getHeaders = (
  includeJson = false
) => {
  const token = getToken();

  return {
    Accept: "application/json",

    ...(includeJson
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

const handleResponse = async (
  response
) => {
  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      data?.o_message ||
      `Request failed with status ${response.status}`;

    throw new Error(
      Array.isArray(message)
        ? message
            .map(
              (item) =>
                item?.msg ||
                String(item)
            )
            .join(", ")
        : String(message)
    );
  }

  return data;
};

/* =========================================================
   PENDING TENURE EXTENSION REQUESTS
========================================================= */

export const getPendingTenureExtensions =
  async ({
    limit = 100,
    offset = 0,
  } = {}) => {
    const params =
      new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });

    const response =
      await fetch(
        `${API_URL}/admin/tenure-extensions/pending?${params.toString()}`,
        {
          method: "GET",
          headers:
            getHeaders(false),
        }
      );

    return handleResponse(response);
  };

/* =========================================================
   TENURE EXTENSION DETAILS
========================================================= */

export const getTenureExtensionDetails =
  async (requestId) => {
    if (!requestId) {
      throw new Error(
        "Tenure extension request ID is required."
      );
    }

    const response =
      await fetch(
        `${API_URL}/admin/tenure-extensions/${encodeURIComponent(
          requestId
        )}`,
        {
          method: "GET",
          headers:
            getHeaders(false),
        }
      );

    return handleResponse(response);
  };

/* =========================================================
   APPROVE TENURE EXTENSION
========================================================= */

export const approveTenureExtension =
  async (
    requestId,
    remarks = null
  ) => {
    if (!requestId) {
      throw new Error(
        "Tenure extension request ID is required."
      );
    }

    const response =
      await fetch(
        `${API_URL}/admin/tenure-extensions/${encodeURIComponent(
          requestId
        )}/approve`,
        {
          method: "PUT",

          headers:
            getHeaders(true),

          body: JSON.stringify({
            remarks:
              remarks || null,
          }),
        }
      );

    return handleResponse(response);
  };

/* =========================================================
   REJECT TENURE EXTENSION
========================================================= */

export const rejectTenureExtension =
  async (
    requestId,
    remarks = null
  ) => {
    if (!requestId) {
      throw new Error(
        "Tenure extension request ID is required."
      );
    }

    const response =
      await fetch(
        `${API_URL}/admin/tenure-extensions/${encodeURIComponent(
          requestId
        )}/reject`,
        {
          method: "PUT",

          headers:
            getHeaders(true),

          body: JSON.stringify({
            remarks:
              remarks || null,
          }),
        }
      );

    return handleResponse(response);
  };

/* =========================================================
   CREATE SETTLEMENT
========================================================= */

export const createSettlement = async (
  investmentId
) => {
  if (!investmentId) {
    throw new Error(
      "Investment ID is required."
    );
  }

  const response =
    await fetch(
      `${API_URL}/admin/investments/${encodeURIComponent(
        investmentId
      )}/settlement`,
      {
        method: "POST",

        headers:
          getHeaders(true),

        body: JSON.stringify({}),
      }
    );

  return handleResponse(response);
};

/* =========================================================
   OPTIONAL HELPERS
========================================================= */

export const getList = (
  response
) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (
    Array.isArray(response?.requests)
  ) {
    return response.requests;
  }

  return [];
};