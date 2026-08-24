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

export const getSuperAdminProfile =
  async () => {
    return request(
      `${API_URL}/api/superadmin/profile`
    );
  };

export const updateSuperAdminProfile =
  async (payload) => {
    return request(
      `${API_URL}/api/superadmin/profile`,
      {
        method: "PUT",
        body: JSON.stringify({
          full_name: payload.fullName,
          email: payload.email,
          mobile: payload.mobile,
        }),
      }
    );
  };

export { API_URL };