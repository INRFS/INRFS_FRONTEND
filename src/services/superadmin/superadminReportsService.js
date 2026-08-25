const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://187.52.115.32:8000";

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("access_token") ||
  sessionStorage.getItem("token") ||
  "";

const headers = () => {
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
      ...headers(),
      ...(options.headers || {}),
    },
  });

  const type =
    response.headers.get("content-type") ||
    "";

  let data = null;

  try {
    if (
      type.includes(
        "application/json"
      )
    ) {
      data = await response.json();
    } else {
      const text =
        await response.text();

      try {
        data = text
          ? JSON.parse(text)
          : null;
      } catch {
        data = text;
      }
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    if (
      Array.isArray(
        data?.detail
      )
    ) {
      message =
        data.detail
          .map(
            (item) =>
              item?.msg ||
              item?.message ||
              String(item)
          )
          .join(", ");
    } else if (
      data?.detail
    ) {
      message =
        String(
          data.detail
        );
    } else if (
      data?.message
    ) {
      message =
        String(
          data.message
        );
    } else if (
      typeof data ===
        "string" &&
      data
    ) {
      message = data;
    }

    throw new Error(
      message
    );
  }

  return data;
};

const add = (
  params,
  key,
  value
) => {
  if (
    value !==
      undefined &&
    value !== null &&
    String(
      value
    ).trim() !== ""
  ) {
    params.set(
      key,
      String(
        value
      ).trim()
    );
  }
};

const paramsFor = ({
  search = "",
  branchId = "",
  adminId = "",
  statusId = "",
  fromDate = "",
  toDate = "",
} = {}) => {
  const params =
    new URLSearchParams();

  add(
    params,
    "search",
    search
  );

  add(
    params,
    "branch_id",
    branchId
  );

  add(
    params,
    "admin_id",
    adminId
  );

  add(
    params,
    "status_id",
    statusId
  );

  add(
    params,
    "from_date",
    fromDate
  );

  add(
    params,
    "to_date",
    toDate
  );

  return params;
};

const pagination = (
  params,
  page = 1,
  limit = 100,
  offset
) => {
  const safeLimit =
    Math.min(
      Math.max(
        Number(
          limit
        ) || 100,
        1
      ),
      500
    );

  const safeOffset =
    offset !== undefined &&
    offset !== null &&
    String(
      offset
    ).trim() !== ""
      ? Math.max(
          Number(
            offset
          ) || 0,
          0
        )
      : Math.max(
          (Number(
            page
          ) || 1) -
            1,
          0
        ) *
        safeLimit;

  params.set(
    "limit",
    String(
      safeLimit
    )
  );

  params.set(
    "offset",
    String(
      safeOffset
    )
  );
};

const rows = (
  response
) =>
  Array.isArray(
    response?.data
  )
    ? response.data
    : Array.isArray(
        response
      )
    ? response
    : [];

const num = (
  value
) => {
  const n =
    Number(value);

  return Number.isFinite(
    n
  )
    ? n
    : 0;
};

const date = (
  value
) => {
  if (!value) {
    return null;
  }

  const d =
    new Date(value);

  return Number.isNaN(
    d.getTime()
  )
    ? null
    : d;
};

export const normalizeInvestmentRow =
  (
    row = {}
  ) => ({
    ...row,

    investment_id:
      row.investment_id ??
      row.investment_code ??
      row.id ??
      "",

    investor_id:
      row.investor_id ??
      row.investor_registration_id ??
      "",

    investor_name:
      row.investor_name ??
      row.investor ??
      row.full_name ??
      "—",

    investor_email:
      row.investor_email ??
      row.email ??
      "—",

    investor_mobile:
      row.investor_mobile ??
      row.mobile ??
      "—",

    branch_id:
      row.branch_id ??
      "",

    branch_name:
      row.branch_name ??
      row.branch ??
      "—",

    admin_id:
      row.admin_id ??
      "",

    admin_name:
      row.admin_name ??
      row.admin ??
      "—",

    superadmin_id:
      row.superadmin_id ??
      "",

    superadmin_name:
      row.superadmin_name ??
      row.super_admin_name ??
      "—",

    investment_amount:
      num(
        row.investment_amount ??
        row.amount
      ),

    interest_rate:
      num(
        row.interest_rate ??
        row.rate
      ),

    expected_interest_amount:
      num(
        row.expected_interest_amount ??
        row.expected_interest
      ),

    maturity_amount:
      num(
        row.maturity_amount
      ),

    status_id:
      row.status_id ??
      row.investment_status_id ??
      "",

    status_name:
      row.status_name ??
      row.status ??
      row.investment_status ??
      "Unknown",

    investment_date:
      row.investment_date ??
      "",

    maturity_date:
      row.maturity_date ??
      "",

    tenure_months:
      num(
        row.tenure_months
      ),

    approved_date:
      row.approved_date ??
      "",
  });

const filterRows = (
  data,
  filters = {}
) => {
  const {
    search = "",
    branchId = "",
    adminId = "",
    statusId = "",
    fromDate = "",
    toDate = "",
  } = filters;

  const q =
    String(
      search || ""
    )
      .trim()
      .toLowerCase();

  const from =
    date(
      fromDate
    );

  const to =
    date(
      toDate
    );

  return data.filter(
    (raw) => {
      const row =
        normalizeInvestmentRow(
          raw
        );

      if (q) {
        const haystack = [
          row.investment_id,
          row.investor_id,
          row.investor_name,
          row.investor_email,
          row.branch_name,
          row.admin_name,
          row.superadmin_name,
        ]
          .map(
            (v) =>
              String(
                v || ""
              ).toLowerCase()
          )
          .join(" ");

        if (
          !haystack.includes(
            q
          )
        ) {
          return false;
        }
      }

      if (
        branchId &&
        String(
          row.branch_id
        ) !==
          String(
            branchId
          )
      ) {
        return false;
      }

      if (
        adminId &&
        String(
          row.admin_id
        ) !==
          String(
            adminId
          )
      ) {
        return false;
      }

      if (
        statusId &&
        String(
          row.status_id
        ) !==
          String(
            statusId
          )
      ) {
        return false;
      }

      const rowDate =
        date(
          row.investment_date
        );

      if (
        from &&
        rowDate &&
        rowDate <
          from
      ) {
        return false;
      }

      if (
        to &&
        rowDate
      ) {
        const end =
          new Date(
            to
          );

        end.setHours(
          23,
          59,
          59,
          999
        );

        if (
          rowDate >
          end
        ) {
          return false;
        }
      }

      return true;
    }
  );
};

export const getSuperAdminReportFilters =
  async () =>
    request(
      "/api/superadmin/reports/filters",
      {
        method:
          "GET",
      }
    );

export const getSuperAdminReportInvestments =
  async ({
    search = "",
    branchId = "",
    adminId = "",
    statusId = "",
    fromDate = "",
    toDate = "",
    page = 1,
    limit = 500,
    offset,
  } = {}) => {
    const params =
      paramsFor({
        search,
        branchId,
        adminId,
        statusId,
        fromDate,
        toDate,
      });

    pagination(
      params,
      page,
      limit,
      offset
    );

    return request(
      `/api/superadmin/reports/investments?${params.toString()}`,
      {
        method:
          "GET",
      }
    );
  };

export const getSuperAdminReportInvestmentDetails =
  async (
    investmentId
  ) => {
    if (
      investmentId ===
        undefined ||
      investmentId ===
        null ||
      String(
        investmentId
      ).trim() === ""
    ) {
      throw new Error(
        "Investment ID is required."
      );
    }

    return request(
      `/api/superadmin/reports/investments/${encodeURIComponent(
        String(
          investmentId
        ).trim()
      )}`,
      {
        method:
          "GET",
      }
    );
  };

export const getSuperAdminReportAdmins =
  async ({
    search = "",
    branchId = "",
    adminId = "",
    statusId = "",
    fromDate = "",
    toDate = "",
    page = 1,
    limit = 500,
    offset,
  } = {}) => {
    const params =
      paramsFor({
        search,
        branchId,
        adminId,
        statusId,
        fromDate,
        toDate,
      });

    pagination(
      params,
      page,
      limit,
      offset
    );

    return request(
      `/api/superadmin/reports/admins?${params.toString()}`,
      {
        method:
          "GET",
      }
    );
  };

export const getSuperAdminReportInvestors =
  async ({
    search = "",
    branchId = "",
    adminId = "",
    statusId = "",
    fromDate = "",
    toDate = "",
    page = 1,
    limit = 500,
    offset,
  } = {}) => {
    const params =
      paramsFor({
        search,
        branchId,
        adminId,
        statusId,
        fromDate,
        toDate,
      });

    pagination(
      params,
      page,
      limit,
      offset
    );

    return request(
      `/api/superadmin/reports/investors?${params.toString()}`,
      {
        method:
          "GET",
      }
    );
  };

const getInvestmentData =
  async (
    filters = {}
  ) => {
    const response =
      await getSuperAdminReportInvestments(
        {
          ...filters,
          limit: 500,
          offset: 0,
        }
      );

    return filterRows(
      rows(
        response
      ),
      filters
    ).map(
      normalizeInvestmentRow
    );
  };

export const getSuperAdminReportMaturity =
  async (
    filters = {}
  ) => {
    const data =
      (
        await getInvestmentData(
          filters
        )
      )
        .filter(
          (row) =>
            date(
              row.maturity_date
            )
        )
        .sort(
          (a, b) =>
            (
              date(
                a.maturity_date
              )?.getTime() ||
              0
            ) -
            (
              date(
                b.maturity_date
              )?.getTime() ||
              0
            )
        );

    return {
      success:
        true,
      data,
      total:
        data.length,
    };
  };

export const getSuperAdminReportInterest =
  async (
    filters = {}
  ) => {
    const data =
      (
        await getInvestmentData(
          filters
        )
      ).sort(
        (a, b) =>
          b.expected_interest_amount -
          a.expected_interest_amount
      );

    return {
      success:
        true,
      data,
      total:
        data.length,
    };
  };

export const getSuperAdminReportBranches =
  async (
    filters = {}
  ) => {
    const data =
      await getInvestmentData(
        filters
      );

    const grouped =
      new Map();

    data.forEach(
      (row) => {
        const key =
          String(
            row.branch_id ||
            row.branch_name ||
            "unknown"
          );

        if (
          !grouped.has(
            key
          )
        ) {
          grouped.set(
            key,
            {
              branch_id:
                row.branch_id ||
                null,

              branch_name:
                row.branch_name ||
                "Unknown Branch",

              investor_ids:
                new Set(),

              investment_count:
                0,

              principal_amount:
                0,

              expected_interest:
                0,

              maturity_amount:
                0,
            }
          );
        }

        const item =
          grouped.get(
            key
          );

        if (
          row.investor_id
        ) {
          item.investor_ids.add(
            String(
              row.investor_id
            )
          );
        }

        item.investment_count +=
          1;

        item.principal_amount +=
          row.investment_amount;

        item.expected_interest +=
          row.expected_interest_amount;

        item.maturity_amount +=
          row.maturity_amount;
      }
    );

    const result =
      [
        ...grouped.values(),
      ]
        .map(
          (item) => ({
            branch_id:
              item.branch_id,

            branch_name:
              item.branch_name,

            investor_count:
              item.investor_ids
                .size,

            investment_count:
              item.investment_count,

            principal_amount:
              item.principal_amount,

            expected_interest:
              item.expected_interest,

            maturity_amount:
              item.maturity_amount,
          })
        )
        .sort(
          (a, b) =>
            b.principal_amount -
            a.principal_amount
        );

    return {
      success:
        true,
      data:
        result,
      total:
        result.length,
    };
  };

export const getSuperAdminReportMonthly =
  async (
    filters = {}
  ) => {
    const data =
      await getInvestmentData(
        filters
      );

    const grouped =
      new Map();

    data.forEach(
      (row) => {
        const d =
          date(
            row.investment_date
          );

        if (!d) {
          return;
        }

        const key =
          `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(
            2,
            "0"
          )}`;

        if (
          !grouped.has(
            key
          )
        ) {
          grouped.set(
            key,
            {
              month:
                key,

              year:
                d.getFullYear(),

              month_number:
                d.getMonth() +
                1,

              investor_ids:
                new Set(),

              investment_count:
                0,

              principal_amount:
                0,

              expected_interest:
                0,

              maturity_amount:
                0,
            }
          );
        }

        const item =
          grouped.get(
            key
          );

        if (
          row.investor_id
        ) {
          item.investor_ids.add(
            String(
              row.investor_id
            )
          );
        }

        item.investment_count +=
          1;

        item.principal_amount +=
          row.investment_amount;

        item.expected_interest +=
          row.expected_interest_amount;

        item.maturity_amount +=
          row.maturity_amount;
      }
    );

    const result =
      [
        ...grouped.values(),
      ]
        .map(
          (item) => ({
            month:
              item.month,

            year:
              item.year,

            month_number:
              item.month_number,

            investor_count:
              item.investor_ids
                .size,

            investment_count:
              item.investment_count,

            principal_amount:
              item.principal_amount,

            expected_interest:
              item.expected_interest,

            maturity_amount:
              item.maturity_amount,
          })
        )
        .sort(
          (a, b) =>
            a.year -
              b.year ||
            a.month_number -
              b.month_number
        );

    return {
      success:
        true,
      data:
        result,
      total:
        result.length,
    };
  };

export const getSuperAdminReportSettlement =
  async (
    filters = {}
  ) => {
    const params =
      paramsFor(
        filters
      );

    pagination(
      params,
      1,
      filters.limit ||
        500,
      filters.offset ||
        0
    );

    return request(
      `/api/superadmin/reports/settlements?${params.toString()}`,
      {
        method:
          "GET",
      }
    );
  };

export const getSuperAdminReportExtensions =
  async (
    filters = {}
  ) => {
    const params =
      paramsFor(
        filters
      );

    pagination(
      params,
      1,
      filters.limit ||
        500,
      filters.offset ||
        0
    );

    return request(
      `/api/superadmin/reports/extensions?${params.toString()}`,
      {
        method:
          "GET",
      }
    );
  };

export const getSuperAdminReportSummary =
  async (
    filters = {}
  ) => {
    const [
      investments,
      admins,
      investors,
    ] =
      await Promise.all(
        [
          getSuperAdminReportInvestments(
            {
              ...filters,
              limit: 500,
              offset: 0,
            }
          ),

          getSuperAdminReportAdmins(
            {
              ...filters,
              limit: 500,
              offset: 0,
            }
          ),

          getSuperAdminReportInvestors(
            {
              ...filters,
              limit: 500,
              offset: 0,
            }
          ),
        ]
      );

    const investmentRows =
      rows(
        investments
      ).map(
        normalizeInvestmentRow
      );

    return {
      success:
        true,

      data: {
        investment_count:
          investmentRows.length,

        investor_count:
          rows(
            investors
          ).length,

        admin_count:
          rows(
            admins
          ).length,

        principal_amount:
          investmentRows.reduce(
            (
              sum,
              row
            ) =>
              sum +
              row.investment_amount,
            0
          ),

        expected_interest:
          investmentRows.reduce(
            (
              sum,
              row
            ) =>
              sum +
              row.expected_interest_amount,
            0
          ),

        maturity_amount:
          investmentRows.reduce(
            (
              sum,
              row
            ) =>
              sum +
              row.maturity_amount,
            0
          ),
      },
    };
  };

export const exportReportCSV =
  (
    data,
    filename =
      "superadmin-report.csv"
  ) => {
    const items =
      Array.isArray(
        data
      )
        ? data
        : [];

    if (
      !items.length
    ) {
      return false;
    }

    const headersList =
      Object.keys(
        items[0] ||
          {}
      );

    if (
      !headersList.length
    ) {
      return false;
    }

    const escapeCSV =
      (value) => {
        if (
          value ===
            null ||
          value ===
            undefined
        ) {
          return "";
        }

        let output =
          value;

        if (
          typeof value ===
          "object"
        ) {
          try {
            output =
              JSON.stringify(
                value
              );
          } catch {
            output =
              String(
                value
              );
          }
        }

        return `"${String(
          output
        ).replace(
          /"/g,
          '""'
        )}"`;
      };

    const csv = [
      headersList
        .map(
          escapeCSV
        )
        .join(","),

      ...items.map(
        (item) =>
          headersList
            .map(
              (key) =>
                escapeCSV(
                  item?.[
                    key
                  ]
                )
            )
            .join(
              ","
            )
      ),
    ].join(
      "\n"
    );

    const blob =
      new Blob(
        [
          "\ufeff" +
            csv,
        ],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      window.URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      filename;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    window.URL.revokeObjectURL(
      url
    );

    return true;
  };

export const downloadInvestmentReportCSV =
  async (
    filters = {}
  ) => {
    const response =
      await getSuperAdminReportInvestments(
        {
          ...filters,
          limit: 500,
          offset: 0,
        }
      );

    return exportReportCSV(
      rows(
        response
      ),
      "superadmin-investment-report.csv"
    );
  };

export const downloadSuperAdminInvestmentReportCSV =
  async (
    filters = {}
  ) =>
    downloadInvestmentReportCSV(
      filters
    );

export const downloadSuperAdminAdminReportCSV =
  async (
    filters = {}
  ) => {
    const response =
      await getSuperAdminReportAdmins(
        {
          ...filters,
          limit: 500,
          offset: 0,
        }
      );

    return exportReportCSV(
      rows(
        response
      ),
      "superadmin-admin-report.csv"
    );
  };

export const downloadSuperAdminInvestorReportCSV =
  async (
    filters = {}
  ) => {
    const response =
      await getSuperAdminReportInvestors(
        {
          ...filters,
          limit: 500,
          offset: 0,
        }
      );

    return exportReportCSV(
      rows(
        response
      ),
      "superadmin-investor-report.csv"
    );
  };

export const downloadSuperAdminMaturityReportCSV =
  async (
    filters = {}
  ) => {
    const response =
      await getSuperAdminReportMaturity(
        filters
      );

    return exportReportCSV(
      response?.data ||
        [],
      "superadmin-maturity-report.csv"
    );
  };

export const downloadSuperAdminInterestReportCSV =
  async (
    filters = {}
  ) => {
    const response =
      await getSuperAdminReportInterest(
        filters
      );

    return exportReportCSV(
      response?.data ||
        [],
      "superadmin-interest-report.csv"
    );
  };

export const downloadSuperAdminBranchReportCSV =
  async (
    filters = {}
  ) => {
    const response =
      await getSuperAdminReportBranches(
        filters
      );

    return exportReportCSV(
      response?.data ||
        [],
      "superadmin-branch-report.csv"
    );
  };

export const downloadSuperAdminMonthlyReportCSV =
  async (
    filters = {}
  ) => {
    const response =
      await getSuperAdminReportMonthly(
        filters
      );

    return exportReportCSV(
      response?.data ||
        [],
      "superadmin-monthly-report.csv"
    );
  };

export {
  API_URL,
  getToken,
  request,
  rows,
  filterRows,
};