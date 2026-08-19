const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
   "http://187.52.115.32:8000";


// =========================================================
// TOKEN
// =========================================================

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("admin_token")
  );
}


// =========================================================
// HEADERS
// =========================================================

function getHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}


// =========================================================
// REQUEST
// =========================================================

async function request(
  url,
  options = {}
) {
  const finalUrl =
    url.startsWith("http")
      ? url
      : `${API_BASE_URL}${url}`;

  const response = await fetch(
    finalUrl,
    {
      credentials: "include",

      ...options,

      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    }
  );

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  const data =
    contentType.includes(
      "application/json"
    )
      ? await response.json()
      : await response.text();

  if (!response.ok) {

    const message =
      typeof data === "string"
        ? data
        : data?.detail ||
          data?.message ||
          `Request failed: ${response.status}`;

    throw new Error(
      typeof message === "string"
        ? message
        : JSON.stringify(message)
    );
  }

  return data;
}


// =========================================================
// MASTER - INVESTOR STATUSES
// =========================================================

export const getInvestorStatuses =
  async () => {

    return request(
      "/masters/investor-request-statuses",
      {
        method: "GET",
      }
    );
  };


// =========================================================
// MASTER - KYC STATUSES
// =========================================================

export const getKycStatuses =
  async () => {

    return request(
      "/masters/kyc-statuses",
      {
        method: "GET",
      }
    );
  };


// =========================================================
// GET INVESTORS
// =========================================================

export const getInvestors =
  async ({
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


// =========================================================
// GET INVESTOR DETAILS
// =========================================================

export const getInvestorDetails =
  async (
    investorRegistrationId
  ) => {

    if (
      investorRegistrationId ===
        null ||
      investorRegistrationId ===
        undefined ||
      investorRegistrationId === ""
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


// =========================================================
// APPROVE INVESTOR
// =========================================================

export const approveInvestor =
  async (
    investorId,
    {
      branch_id,
      remarks,
    } = {}
  ) => {

    // Investor ID validation
    if (
      investorId === null ||
      investorId === undefined ||
      investorId === ""
    ) {

      throw new Error(
        "Investor ID is required"
      );
    }

    // Branch validation
    if (
      branch_id === null ||
      branch_id === undefined ||
      branch_id === ""
    ) {

      throw new Error(
        "Branch ID is required"
      );
    }

    const numericBranchId =
      Number(branch_id);

    if (
      !Number.isInteger(
        numericBranchId
      ) ||
      numericBranchId <= 0
    ) {

      throw new Error(
        "Invalid branch ID"
      );
    }

    console.log(
      "APPROVE INVESTOR",
      {
        investorId,
        branch_id:
          numericBranchId,
      }
    );

    return request(
      `/admin/investors/${encodeURIComponent(
        investorId
      )}/approve`,
      {
        method: "PUT",

        body: JSON.stringify({
          branch_id:
            numericBranchId,

          remarks:
            remarks ||
            "Investor approved by admin",
        }),
      }
    );
  };


// =========================================================
// REJECT INVESTOR
// =========================================================

export const rejectInvestor =
  async (
    investorId,
    {
      remarks,
    } = {}
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
            remarks ||
            "Investor rejected by admin",
        }),
      }
    );
  };