const API_URL = "http://187.52.115.32:8000";

const getHeaders = () => {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      data?.o_message ||
      `Request failed with status ${response.status}`;

    throw new Error(
      Array.isArray(message)
        ? message
            .map((item) => item?.msg || String(item))
            .join(", ")
        : String(message)
    );
  }

  return data;
};

export const getMonthlyInterest = async ({
  interestDueDate = "",
  limit = 100,
  offset = 0,
} = {}) => {
  const params = new URLSearchParams();

  if (interestDueDate) {
    params.append("interest_due_date", interestDueDate);
  }

  params.append("limit", String(limit));
  params.append("offset", String(offset));

  const response = await fetch(
    `${API_URL}/admin/monthly-interest?${params.toString()}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};

export const getMonthlyInterestDetails = async (
  interestScheduleId
) => {
  const response = await fetch(
    `${API_URL}/admin/monthly-interest/${interestScheduleId}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};

export const sendMonthlyInterestForApproval = async (
  interestScheduleId
) => {
  const response = await fetch(
    `${API_URL}/admin/monthly-interest/${interestScheduleId}/send-for-approval`,
    {
      method: "PUT",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );

  return handleResponse(response);
};

export const sendAllMonthlyInterestForApproval = async (
  interestDueDate
) => {
  const response = await fetch(
    `${API_URL}/admin/monthly-interest/send-all-for-approval`,
    {
      method: "PUT",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        interest_due_date: interestDueDate,
      }),
    }
  );

  return handleResponse(response);
};