const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://187.52.115.32:8000";

const getToken = () => {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("admin_token") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("admin_token") ||
    ""
  );
};

const getHeaders = (hasBody = false) => {
  const token = getToken();

  return {
    Accept: "application/json",
    ...(hasBody
      ? {
          "Content-Type": "application/json",
        }
      : {}),
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

const handleResponse = async (response) => {
  const contentType =
    response.headers.get("content-type") || "";

  let data;

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    if (
      typeof data === "string" &&
      data
    ) {
      message = data;
    } else if (
      Array.isArray(data?.detail)
    ) {
      message = data.detail
        .map(
          (item) =>
            item?.msg ||
            "Validation error"
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

export const getAdminProfile = async () => {
  const response = await fetch(
    `${API_URL}/admin/profile`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};

export const updateAdminProfile = async ({
  name,
  email,
  mobile,
}) => {
  const response = await fetch(
    `${API_URL}/admin/profile`,
    {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify({
        name: name?.trim(),
        email: email?.trim() || null,
        mobile: mobile?.trim() || null,
      }),
    }
  );

  return handleResponse(response);
};