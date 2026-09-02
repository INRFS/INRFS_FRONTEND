const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://187.52.115.32:8000";

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("admin_token") ||
    ""
  );
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const finalUrl = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL}${endpoint}`;

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
    const response = await fetch(finalUrl, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeout);

    const contentType =
      response.headers.get("content-type") || "";

    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      data = {
        message: text,
      };
    }

    if (!response.ok) {
      let errorMessage =
        data?.detail ||
        data?.message ||
        `Request failed with status ${response.status}`;

      if (Array.isArray(data?.detail)) {
        errorMessage = data.detail
          .map((item) => {
            const field = Array.isArray(item?.loc)
              ? item.loc.join(".")
              : "field";

            return `${field}: ${
              item?.msg || "Validation error"
            }`;
          })
          .join(", ");
      }

      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    clearTimeout(timeout);

    if (error?.name === "AbortError") {
      throw new Error(
        "Request timed out. Please check whether the backend server is running."
      );
    }

    throw error;
  }
}

async function loginRequest(
  endpoint,
  payload
) {
  return request(endpoint, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export const investorLogin = async (
  investorId,
  password
) => {
  return loginRequest(
    "/auth/investor/login",
    {
      investor_id: String(
        investorId || ""
      ).trim(),
      password,
    }
  );
};

export const adminLogin = async (
  username,
  password
) => {
  return loginRequest(
    "/auth/admin/login",
    {
      username: String(
        username || ""
      ).trim(),
      password,
    }
  );
};

export const superAdminLogin = async (
  username,
  password
) => {
  return loginRequest(
    "/auth/superadmin/login",
    {
      username: String(
        username || ""
      ).trim(),
      password,
    }
  );
};

export const getCurrentUser = async () => {
  return request("/auth/me", {
    method: "GET",
  });
};

export const getStates = async () => {
  return request("/masters/states", {
    method: "GET",
  });
};

export const getBranches = async (
  stateId
) => {
  if (
    stateId === null ||
    stateId === undefined ||
    stateId === ""
  ) {
    return [];
  }

  return request(
    `/masters/branches?state_id=${encodeURIComponent(
      stateId
    )}`,
    {
      method: "GET",
    }
  );
};

export const sendEmailOtp = async (
  email,
  name
) => {
  const normalizedEmail = String(
    email || ""
  )
    .trim()
    .toLowerCase();

  const normalizedName = String(
    name || ""
  ).trim();

  if (!normalizedEmail) {
    throw new Error(
      "Please enter your email address."
    );
  }

  return request(
    "/auth/email/send-otp",
    {
      method: "POST",
      body: JSON.stringify({
        email: normalizedEmail,
        name: normalizedName || "User",
      }),
    }
  );
};

export const verifyEmailOtp = async (
  email,
  otp
) => {
  const normalizedEmail = String(
    email || ""
  )
    .trim()
    .toLowerCase();

  const normalizedOtp = String(
    otp || ""
  ).trim();

  if (!normalizedEmail) {
    throw new Error(
      "Please enter your email address."
    );
  }

  if (
    normalizedOtp.length !== 6 ||
    !/^\d{6}$/.test(normalizedOtp)
  ) {
    throw new Error(
      "Please enter a valid 6-digit OTP."
    );
  }

  return request(
    "/auth/email/verify-otp",
    {
      method: "POST",
      body: JSON.stringify({
        email: normalizedEmail,
        otp: normalizedOtp,
      }),
    }
  );
};

export const registerInvestor = async (
  formData
) => {
  const payload = {
    full_name:
      formData.fullName,

    mobile:
      formData.mobile,

    email:
      formData.email || null,

    password:
      formData.password,

    date_of_birth:
      formData.dob,

    aadhaar_number:
      formData.aadhaar,

    address:
      formData.address,

    city:
      formData.city,

    state_id:
      Number(formData.state),

    pincode:
      formData.pin,

    branch_id:
      Number(formData.branch),
  };

  console.log(
    "INVESTOR REGISTER PAYLOAD:",
    payload
  );

  return request(
    "/auth/investor/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

export const getInvestors = async ({
  statusName,
  kycStatusName,
  searchText,
  limit = 100,
  offset = 0,
} = {}) => {
  const params =
    new URLSearchParams();

  if (
    statusName &&
    statusName !== "All"
  ) {
    params.append(
      "status_name",
      statusName
    );
  }

  if (
    kycStatusName &&
    kycStatusName !==
      "All KYC Status"
  ) {
    params.append(
      "kyc_status_name",
      kycStatusName
    );
  }

  if (searchText) {
    params.append(
      "search_text",
      searchText
    );
  }

  params.append(
    "limit",
    String(limit)
  );

  params.append(
    "offset",
    String(offset)
  );

  return request(
    `/admin/investors?${params.toString()}`,
    {
      method: "GET",
    }
  );
};

export const getInvestorDetails =
  async (
    investorRegistrationId
  ) => {
    if (
      investorRegistrationId ===
        null ||
      investorRegistrationId ===
        undefined ||
      investorRegistrationId ===
        ""
    ) {
      throw new Error(
        "Investor registration ID is required"
      );
    }

    return request(
      `/admin/investors/${encodeURIComponent(
        investorRegistrationId
      )}`,
      {
        method: "GET",
      }
    );
  };

export const approveInvestor =
  async (
    investorId,
    remarks = ""
  ) => {
    if (
      investorId === null ||
      investorId === undefined ||
      investorId === ""
    ) {
      throw new Error(
        "Investor ID is required"
      );
    }

    return request(
      `/admin/investors/${encodeURIComponent(
        investorId
      )}/approve`,
      {
        method: "PUT",
        body: JSON.stringify({
          remarks:
            String(
              remarks || ""
            ).trim() || null,
        }),
      }
    );
  };

export const rejectInvestor =
  async (
    investorId,
    remarks = ""
  ) => {
    if (
      investorId === null ||
      investorId === undefined ||
      investorId === ""
    ) {
      throw new Error(
        "Investor ID is required"
      );
    }

    return request(
      `/admin/investors/${encodeURIComponent(
        investorId
      )}/reject`,
      {
        method: "PUT",
        body: JSON.stringify({
          remarks:
            String(
              remarks || ""
            ).trim() ||
            "Investor rejected by admin",
        }),
      }
    );
  };