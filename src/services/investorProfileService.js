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


const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    let message = "Request failed";

    if (Array.isArray(data.detail)) {
      message = data.detail
        .map(
          (item) =>
            item.msg || "Validation error"
        )
        .join(", ");
    } else if (
      typeof data.detail === "string"
    ) {
      message = data.detail;
    } else if (
      typeof data.message === "string"
    ) {
      message = data.message;
    }

    throw new Error(message);
  }

  return data;
};


export const getInvestorProfile = async () => {
  return apiRequest(
    "/investors/profile",
    {
      method: "GET",
    }
  );
};


export const updateInvestorProfile = async (
  profile
) => {
  const payload = {
    full_name:
      profile.name?.trim() || null,

    mobile:
      profile.mobile?.trim() || null,

    email:
      profile.email?.trim() || null,

    date_of_birth:
      profile.dateOfBirth || null,

    address:
      profile.address?.trim() || null,

    city:
      profile.city?.trim() || null,

    state_id:
      profile.stateId
        ? Number(profile.stateId)
        : null,

    pincode:
      profile.pincode?.trim() || null,

    branch_id:
      profile.branchId
        ? Number(profile.branchId)
        : null,
  };

  return apiRequest(
    "/investors/profile",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
};


export { API_URL };