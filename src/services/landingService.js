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
  const contentType =
    response.headers.get("content-type") || "";

  let data = null;

  try {
    if (
      contentType.includes(
        "application/json"
      )
    ) {
      data = await response.json();
    } else {
      const text = await response.text();

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    if (Array.isArray(data?.detail)) {
      message = data.detail
        .map(
          (item) =>
            item?.msg ||
            item?.message ||
            String(item)
        )
        .join(", ");
    } else if (data?.detail) {
      message = String(data.detail);
    } else if (data?.message) {
      message = String(data.message);
    } else if (
      typeof data === "string" &&
      data.trim()
    ) {
      message = data;
    }

    throw new Error(message);
  }

  return data;
};


const request = async (
  endpoint,
  options = {}
) => {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    credentials: "include",

    ...options,

    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  return handleResponse(response);
};


export const getPublicHomeStats =
  async () => {
    return request(
      "/api/public/home-stats",
      {
        method: "GET",
      }
    );
  };


export const getPublicHomeStatsSafe =
  async () => {
    try {
      const response =
        await getPublicHomeStats();

      const hero =
        response?.data?.hero || {};

      const benefits =
        response?.data?.benefits || {};

      return {
        success:
          response?.success === true,

        hero: {
          total_aum:
            Number(
              hero.total_aum || 0
            ),

          total_aum_label:
            hero.total_aum_label ||
            "₹0",

          active_investors:
            Number(
              hero.active_investors || 0
            ),

          active_investors_label:
            hero.active_investors_label ||
            "0",

          max_interest_rate:
            Number(
              hero.max_interest_rate || 0
            ),

          max_interest_rate_label:
            hero.max_interest_rate_label ||
            "0%",

          approval_time_hours:
            Number(
              hero.approval_time_hours ||
                48
            ),

          approval_time_label:
            hero.approval_time_label ||
            "48hrs",

          total_invested_label:
            hero.total_invested_label ||
            "₹0",

          interest_earned_label:
            hero.interest_earned_label ||
            "₹0",

          active_bonds:
            Number(
              hero.active_bonds || 0
            ),

          next_payout_label:
            hero.next_payout_label ||
            "₹0",

          featured_bond: {
            id:
              hero?.featured_bond?.id ||
              "INRFS-INVESTMENT",

            title:
              hero?.featured_bond?.title ||
              "Fixed Deposit",

            status:
              hero?.featured_bond?.status ||
              "Available",

            interest_rate:
              Number(
                hero?.featured_bond
                  ?.interest_rate || 0
              ),

            tenure_months:
              Number(
                hero?.featured_bond
                  ?.tenure_months || 0
              ),
          },
        },

        benefits: {
          total_returns_paid:
            Number(
              benefits.total_returns_paid ||
                0
            ),

          total_returns_paid_label:
            benefits.total_returns_paid_label ||
            "₹0",

          active_investors:
            Number(
              benefits.active_investors || 0
            ),

          bonds_issued:
            Number(
              benefits.bonds_issued || 0
            ),

          branch_offices:
            Number(
              benefits.branch_offices || 0
            ),
        },
      };
    } catch (error) {
      console.error(
        "Failed to load public homepage statistics:",
        error
      );

      return {
        success: false,

        hero: {
          total_aum: 0,
          total_aum_label: "₹0",

          active_investors: 0,
          active_investors_label: "0",

          max_interest_rate: 0,
          max_interest_rate_label: "0%",

          approval_time_hours: 48,
          approval_time_label: "48hrs",

          total_invested_label: "₹0",
          interest_earned_label: "₹0",

          active_bonds: 0,
          next_payout_label: "₹0",

          featured_bond: {
            id: "INRFS-INVESTMENT",
            title: "Fixed Deposit",
            status: "Available",
            interest_rate: 0,
            tenure_months: 0,
          },
        },

        benefits: {
          total_returns_paid: 0,
          total_returns_paid_label: "₹0",
          active_investors: 0,
          bonds_issued: 0,
          branch_offices: 0,
        },
      };
    }
  };


export const refreshPublicHomeStats =
  async () => {
    return getPublicHomeStatsSafe();
  };


export {
  API_URL,
  getToken,
  getHeaders,
  request,
};