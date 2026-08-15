import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Users,
  UserCheck,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Clock3,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Activity,
  Building2,
  Search,
  RotateCcw,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../Styles/SuperAdmin/Reports.css";

const SUMMARY = [
  {
    label: "TOTAL ADMINS",
    value: "12",
    sub: "Registered administrators",
    icon: ShieldCheck,
    color: "blue",
  },
  {
    label: "ACTIVE ADMINS",
    value: "9",
    sub: "Currently active",
    icon: UserCheck,
    color: "green",
  },
  {
    label: "TOTAL INVESTORS",
    value: "248",
    sub: "Registered investors",
    icon: Users,
    color: "purple",
  },
  {
    label: "VERIFIED INVESTORS",
    value: "221",
    sub: "KYC verified",
    icon: CheckCircle2,
    color: "teal",
  },
  {
    label: "TOTAL INVESTMENTS",
    value: "386",
    sub: "Investment records",
    icon: TrendingUp,
    color: "orange",
  },
  {
    label: "ACTIVE INVESTMENTS",
    value: "274",
    sub: "Currently active",
    icon: Activity,
    color: "indigo",
  },
  {
    label: "PENDING INVESTMENTS",
    value: "47",
    sub: "Awaiting approval",
    icon: Clock3,
    color: "yellow",
  },
  {
    label: "TOTAL INVESTED",
    value: "₹10.25 Cr",
    sub: "Total principal value",
    icon: Wallet,
    color: "green",
  },
];

const MONTHLY_DATA = [
  { month: "Jan", investments: 18, value: 18 },
  { month: "Feb", investments: 26, value: 24 },
  { month: "Mar", investments: 34, value: 31 },
  { month: "Apr", investments: 42, value: 39 },
  { month: "May", investments: 51, value: 46 },
  { month: "Jun", investments: 63, value: 58 },
  { month: "Jul", investments: 71, value: 67 },
  { month: "Aug", investments: 81, value: 78 },
];

const ADMIN_DATA = [
  {
    admin: "Ravi Mehta",
    branch: "Hyderabad Branch",
    investors: 48,
    investments: 76,
    amount: 2850000,
    status: "Active",
    date: "2026-08-05",
  },
  {
    admin: "Anita Rao",
    branch: "Vijayawada Branch",
    investors: 42,
    investments: 69,
    amount: 2340000,
    status: "Active",
    date: "2026-08-04",
  },
  {
    admin: "Mohan Das",
    branch: "Hyderabad Branch",
    investors: 35,
    investments: 54,
    amount: 1890000,
    status: "Active",
    date: "2026-08-03",
  },
  {
    admin: "Priya Sharma",
    branch: "Visakhapatnam Branch",
    investors: 31,
    investments: 47,
    amount: 1420000,
    status: "Active",
    date: "2026-08-02",
  },
  {
    admin: "Kiran Kumar",
    branch: "Guntur Branch",
    investors: 24,
    investments: 38,
    amount: 985000,
    status: "Inactive",
    date: "2026-07-29",
  },
];

const INVESTOR_DATA = [
  {
    investor: "maddi rajasekhar",
    investorId: "INV000008",
    branch: "Vijayawada Branch",
    investments: 4,
    principal: 1000000,
    interest: 42000,
    status: "Active",
    date: "2026-08-14",
  },
  {
    investor: "nakirakanti rakesh",
    investorId: "INV000005",
    branch: "Hyderabad Branch",
    investments: 3,
    principal: 745000,
    interest: 31500,
    status: "Active",
    date: "2026-08-13",
  },
  {
    investor: "Test Investor",
    investorId: "INV000004",
    branch: "Vijayawada Branch",
    investments: 2,
    principal: 575000,
    interest: 22500,
    status: "Active",
    date: "2026-08-12",
  },
  {
    investor: "Rajasekhar M",
    investorId: "INV000010",
    branch: "Hyderabad Branch",
    investments: 2,
    principal: 430000,
    interest: 16400,
    status: "Pending",
    date: "2026-08-10",
  },
  {
    investor: "Test Investor 2",
    investorId: "INV000006",
    branch: "Hyderabad Branch",
    investments: 1,
    principal: 200000,
    interest: 8000,
    status: "Active",
    date: "2026-08-08",
  },
];

const INVESTMENT_DATA = [
  {
    id: "INV000007",
    investor: "maddi rajasekhar",
    branch: "Vijayawada Branch",
    amount: 100000,
    rate: "4%",
    invested: "2026-08-14",
    maturity: "2027-08-14",
    interest: 0,
    status: "Active",
  },
  {
    id: "INV000008",
    investor: "maddi rajasekhar",
    branch: "Vijayawada Branch",
    amount: 325000,
    rate: "3%",
    invested: "2026-08-13",
    maturity: "2027-08-13",
    interest: 0,
    status: "Active",
  },
  {
    id: "INV000009",
    investor: "nakirakanti rakesh",
    branch: "Hyderabad Branch",
    amount: 345000,
    rate: "3%",
    invested: "2026-08-13",
    maturity: "2027-08-13",
    interest: 0,
    status: "Pending Approval",
  },
  {
    id: "INV000010",
    investor: "Rajasekhar M",
    branch: "Hyderabad Branch",
    amount: 230000,
    rate: "3%",
    invested: "2026-08-12",
    maturity: "2027-08-12",
    interest: 0,
    status: "Rejected",
  },
  {
    id: "INV000011",
    investor: "Test Investor",
    branch: "Vijayawada Branch",
    amount: 500000,
    rate: "4%",
    invested: "2026-08-10",
    maturity: "2027-08-10",
    interest: 18000,
    status: "Active",
  },
  {
    id: "INV000012",
    investor: "Test Investor 2",
    branch: "Hyderabad Branch",
    amount: 200000,
    rate: "3%",
    invested: "2026-08-08",
    maturity: "2027-08-08",
    interest: 8000,
    status: "Settled",
  },
];

const INVESTMENT_STATUS = [
  {
    name: "Active",
    value: 274,
    color: "#2563eb",
  },
  {
    name: "Pending",
    value: 47,
    color: "#f59e0b",
  },
  {
    name: "Rejected",
    value: 31,
    color: "#ef4444",
  },
  {
    name: "Settled",
    value: 34,
    color: "#10b981",
  },
];

const REPORT_OPTIONS = [
  {
    value: "overview",
    label: "Overview",
  },
  {
    value: "admins",
    label: "Admins",
  },
  {
    value: "investors",
    label: "Investors",
  },
  {
    value: "investments",
    label: "Investments",
  },
];

const formatAmount = (amount) =>
  `₹${Number(amount).toLocaleString("en-IN")}`;

const formatShortAmount = (amount) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }

  return formatAmount(amount);
};

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return date;
  }

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="sar-tooltip">
      <div className="sar-tooltip-title">{label}</div>

      {payload.map((item) => (
        <div className="sar-tooltip-row" key={item.dataKey}>
          <span>{item.name}</span>

          <strong>
            {item.dataKey === "value"
              ? `₹${item.value}L`
              : item.value}
          </strong>
        </div>
      ))}
    </div>
  );
};

export default function SuperAdminReports() {
  const [search, setSearch] = useState("");
  const [reportType, setReportType] = useState("overview");
  const [branch, setBranch] = useState("all");
  const [status, setStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const branches = useMemo(() => {
    const values = [
      ...ADMIN_DATA.map((item) => item.branch),
      ...INVESTOR_DATA.map((item) => item.branch),
      ...INVESTMENT_DATA.map((item) => item.branch),
    ];

    return [...new Set(values)];
  }, []);

  const filteredAdmins = useMemo(() => {
    return ADMIN_DATA.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        !searchText ||
        item.admin.toLowerCase().includes(searchText) ||
        item.branch.toLowerCase().includes(searchText);

      const matchesBranch =
        branch === "all" || item.branch === branch;

      const matchesStatus =
        status === "all" ||
        item.status.toLowerCase() === status.toLowerCase();

      const matchesFrom =
        !fromDate || item.date >= fromDate;

      const matchesTo =
        !toDate || item.date <= toDate;

      return (
        matchesSearch &&
        matchesBranch &&
        matchesStatus &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [search, branch, status, fromDate, toDate]);

  const filteredInvestors = useMemo(() => {
    return INVESTOR_DATA.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        !searchText ||
        item.investor.toLowerCase().includes(searchText) ||
        item.investorId.toLowerCase().includes(searchText) ||
        item.branch.toLowerCase().includes(searchText);

      const matchesBranch =
        branch === "all" || item.branch === branch;

      const matchesStatus =
        status === "all" ||
        item.status.toLowerCase() === status.toLowerCase();

      const matchesFrom =
        !fromDate || item.date >= fromDate;

      const matchesTo =
        !toDate || item.date <= toDate;

      return (
        matchesSearch &&
        matchesBranch &&
        matchesStatus &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [search, branch, status, fromDate, toDate]);

  const filteredInvestments = useMemo(() => {
    return INVESTMENT_DATA.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        !searchText ||
        item.id.toLowerCase().includes(searchText) ||
        item.investor.toLowerCase().includes(searchText) ||
        item.branch.toLowerCase().includes(searchText);

      const matchesBranch =
        branch === "all" || item.branch === branch;

      const matchesStatus =
        status === "all" ||
        item.status.toLowerCase() === status.toLowerCase();

      const matchesFrom =
        !fromDate || item.invested >= fromDate;

      const matchesTo =
        !toDate || item.invested <= toDate;

      return (
        matchesSearch &&
        matchesBranch &&
        matchesStatus &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [search, branch, status, fromDate, toDate]);

  const resetFilters = () => {
    setSearch("");
    setReportType("overview");
    setBranch("all");
    setStatus("all");
    setFromDate("");
    setToDate("");
  };

  const getExportData = () => {
    if (reportType === "admins") {
      return filteredAdmins.map((item) => ({
        Admin: item.admin,
        Branch: item.branch,
        Investors: item.investors,
        Investments: item.investments,
        "Investment Value": item.amount,
        Status: item.status,
        Date: item.date,
      }));
    }

    if (reportType === "investors") {
      return filteredInvestors.map((item) => ({
        Investor: item.investor,
        "Investor ID": item.investorId,
        Branch: item.branch,
        Investments: item.investments,
        Principal: item.principal,
        "Interest Earned": item.interest,
        Status: item.status,
        Date: item.date,
      }));
    }

    if (reportType === "investments") {
      return filteredInvestments.map((item) => ({
        "Investment ID": item.id,
        Investor: item.investor,
        Branch: item.branch,
        Amount: item.amount,
        Rate: item.rate,
        Invested: item.invested,
        Maturity: item.maturity,
        Interest: item.interest,
        Status: item.status,
      }));
    }

    return [
      {
        "Report Type": "Super Admin Overview",
        "Total Admins": 12,
        "Active Admins": 9,
        "Total Investors": 248,
        "Verified Investors": 221,
        "Total Investments": 386,
        "Active Investments": 274,
        "Pending Investments": 47,
        "Total Invested": "₹10.25 Cr",
      },
    ];
  };

  const handleExportExcel = () => {
    const data = getExportData();

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      reportType === "overview"
        ? "Overview"
        : reportType.charAt(0).toUpperCase() +
          reportType.slice(1)
    );

    const fileName =
      `super-admin-${reportType}-report-` +
      `${new Date().toISOString().slice(0, 10)}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const title =
      reportType === "overview"
        ? "Super Admin Overview Report"
        : `Super Admin ${
            reportType.charAt(0).toUpperCase() +
            reportType.slice(1)
          } Report`;

    doc.setFontSize(18);
    doc.setTextColor(20, 35, 65);
    doc.text(title, 14, 16);

    doc.setFontSize(9);
    doc.setTextColor(120, 130, 145);

    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-IN")}`,
      14,
      23
    );

    let columns = [];
    let rows = [];

    if (reportType === "admins") {
      columns = [
        "Admin",
        "Branch",
        "Investors",
        "Investments",
        "Investment Value",
        "Status",
        "Date",
      ];

      rows = filteredAdmins.map((item) => [
        item.admin,
        item.branch,
        item.investors,
        item.investments,
        formatAmount(item.amount),
        item.status,
        formatDate(item.date),
      ]);
    } else if (reportType === "investors") {
      columns = [
        "Investor",
        "Investor ID",
        "Branch",
        "Investments",
        "Principal",
        "Interest",
        "Status",
        "Date",
      ];

      rows = filteredInvestors.map((item) => [
        item.investor,
        item.investorId,
        item.branch,
        item.investments,
        formatAmount(item.principal),
        formatAmount(item.interest),
        item.status,
        formatDate(item.date),
      ]);
    } else if (reportType === "investments") {
      columns = [
        "Investment ID",
        "Investor",
        "Branch",
        "Amount",
        "Rate",
        "Invested",
        "Maturity",
        "Interest",
        "Status",
      ];

      rows = filteredInvestments.map((item) => [
        item.id,
        item.investor,
        item.branch,
        formatAmount(item.amount),
        item.rate,
        formatDate(item.invested),
        formatDate(item.maturity),
        formatAmount(item.interest),
        item.status,
      ]);
    } else {
      columns = ["Metric", "Value"];

      rows = [
        ["Total Admins", "12"],
        ["Active Admins", "9"],
        ["Total Investors", "248"],
        ["Verified Investors", "221"],
        ["Total Investments", "386"],
        ["Active Investments", "274"],
        ["Pending Investments", "47"],
        ["Total Invested", "₹10.25 Cr"],
      ];
    }

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 30,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [49, 91, 234],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [247, 249, 252],
      },
    });

    const fileName =
      `super-admin-${reportType}-report-` +
      `${new Date().toISOString().slice(0, 10)}.pdf`;

    doc.save(fileName);
  };

  return (
    <div className="sar-page">
      <div className="sar-header">
        <div>
          <div className="sar-eyebrow">
            SUPER ADMIN REPORT CENTER
          </div>

          <h1>Reports & Analytics</h1>

          <p>
            Complete overview of administrators, investors
            and investments.
          </p>
        </div>

        <div className="sar-header-date">
          <span>REPORT PERIOD</span>
          <strong>As of 15 Aug 2026</strong>
        </div>
      </div>

      <div className="sar-filter-card">
        <div className="sar-filter-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search investor, admin, investment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          {REPORT_OPTIONS.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
        </select>

        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        >
          <option value="all">All Branches</option>

          {branches.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Pending">Pending</option>
          <option value="Pending Approval">
            Pending Approval
          </option>
          <option value="Rejected">Rejected</option>
          <option value="Settled">Settled</option>
        </select>

        <input
          className="sar-date-input"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <input
          className="sar-date-input"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

        <button
          className="sar-reset-btn"
          onClick={resetFilters}
          type="button"
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>

      <div className="sar-download-bar">
        <div className="sar-report-info">
          <strong>
            {reportType === "overview"
              ? "Overview Report"
              : `${
                  reportType.charAt(0).toUpperCase() +
                  reportType.slice(1)
                } Report`}
          </strong>

          <span>
            {reportType === "admins"
              ? `${filteredAdmins.length} admins`
              : reportType === "investors"
              ? `${filteredInvestors.length} investors`
              : reportType === "investments"
              ? `${filteredInvestments.length} investments`
              : "Complete platform summary"}
          </span>
        </div>

        <div className="sar-download-actions">
          <button
            className="sar-export-btn sar-export-excel"
            onClick={handleExportExcel}
            type="button"
          >
            <FileSpreadsheet size={14} />
            Export Excel
          </button>

          <button
            className="sar-export-btn sar-export-pdf"
            onClick={handleExportPdf}
            type="button"
          >
            <FileText size={14} />
            Export PDF
          </button>
        </div>
      </div>

      <section className="sar-summary-grid">
        {SUMMARY.map((item) => {
          const Icon = item.icon;

          return (
            <div
              className={`sar-summary-card sar-summary-${item.color}`}
              key={item.label}
            >
              <div className="sar-summary-top">
                <span>{item.label}</span>

                <div className="sar-summary-icon">
                  <Icon size={17} />
                </div>
              </div>

              <div className="sar-summary-value">
                {item.value}
              </div>

              <div className="sar-summary-sub">
                {item.sub}
              </div>
            </div>
          );
        })}
      </section>

      <section className="sar-overview-grid">
        <div className="sar-card sar-performance-card">
          <div className="sar-card-header">
            <div>
              <span className="sar-card-eyebrow">
                INVESTMENT PERFORMANCE
              </span>

              <h2>Monthly Investment Growth</h2>
            </div>

            <div className="sar-card-chip">
              <TrendingUp size={13} />
              +18.6%
            </div>
          </div>

          <div className="sar-chart">
            <ResponsiveContainer
              width="100%"
              height={285}
            >
              <BarChart
                data={MONTHLY_DATA}
                margin={{
                  top: 10,
                  right: 8,
                  left: -12,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#edf1f6"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#8b98ad",
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#8b98ad",
                  }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend
                  verticalAlign="bottom"
                  align="left"
                  wrapperStyle={{
                    fontSize: 10,
                    paddingTop: 10,
                  }}
                />

                <Bar
                  dataKey="investments"
                  name="Investments"
                  fill="#315bea"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />

                <Bar
                  dataKey="value"
                  name="Investment Value (₹L)"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sar-card sar-status-card">
          <div className="sar-card-header">
            <div>
              <span className="sar-card-eyebrow">
                INVESTMENT STATUS
              </span>

              <h2>Portfolio Distribution</h2>
            </div>
          </div>

          <div className="sar-pie-wrap">
            <ResponsiveContainer
              width="100%"
              height={205}
            >
              <PieChart>
                <Pie
                  data={INVESTMENT_STATUS}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                  stroke="none"
                >
                  {INVESTMENT_STATUS.map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.color}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) =>
                    `${value} investments`
                  }
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="sar-pie-center">
              <strong>386</strong>
              <span>Total</span>
            </div>
          </div>

          <div className="sar-status-list">
            {INVESTMENT_STATUS.map((item) => (
              <div
                className="sar-status-row"
                key={item.name}
              >
                <div>
                  <span
                    className="sar-status-dot"
                    style={{
                      background: item.color,
                    }}
                  />

                  <span>{item.name}</span>
                </div>

                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {reportType === "admins" && (
        <section className="sar-card">
          <div className="sar-card-header">
            <div>
              <span className="sar-card-eyebrow">
                ADMIN PERFORMANCE
              </span>

              <h2>Branch Admin Overview</h2>
            </div>

            <span className="sar-card-count">
              {filteredAdmins.length} Records
            </span>
          </div>

          <div className="sar-table-wrap">
            <table className="sar-table">
              <thead>
                <tr>
                  <th>ADMIN</th>
                  <th>BRANCH</th>
                  <th>INVESTORS</th>
                  <th>INVESTMENTS</th>
                  <th>INVESTMENT VALUE</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {filteredAdmins.map((admin) => (
                  <tr key={admin.admin}>
                    <td>
                      <div className="sar-person">
                        <div className="sar-avatar">
                          {admin.admin.charAt(0)}
                        </div>

                        <div>
                          <strong>{admin.admin}</strong>
                          <span>Branch Admin</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="sar-branch">
                        <Building2 size={13} />
                        {admin.branch}
                      </div>
                    </td>

                    <td>{admin.investors}</td>

                    <td>{admin.investments}</td>

                    <td className="sar-money">
                      {formatShortAmount(admin.amount)}
                    </td>

                    <td>
                      <span
                        className={
                          admin.status === "Active"
                            ? "sar-status-active"
                            : "sar-status-inactive"
                        }
                      >
                        {admin.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {!filteredAdmins.length && (
                  <tr>
                    <td
                      colSpan="6"
                      className="sar-empty"
                    >
                      No admin records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {reportType === "investors" && (
        <section className="sar-card">
          <div className="sar-card-header">
            <div>
              <span className="sar-card-eyebrow">
                INVESTOR PORTFOLIO
              </span>

              <h2>Investor Report</h2>
            </div>

            <span className="sar-card-count">
              {filteredInvestors.length} Records
            </span>
          </div>

          <div className="sar-table-wrap">
            <table className="sar-table">
              <thead>
                <tr>
                  <th>INVESTOR</th>
                  <th>BRANCH</th>
                  <th>INVESTMENTS</th>
                  <th>PRINCIPAL</th>
                  <th>INTEREST EARNED</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvestors.map((investor) => (
                  <tr key={investor.investorId}>
                    <td>
                      <div className="sar-person">
                        <div className="sar-avatar sar-avatar-purple">
                          {investor.investor
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {investor.investor}
                          </strong>

                          <span>
                            {investor.investorId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>{investor.branch}</td>

                    <td>{investor.investments}</td>

                    <td className="sar-money">
                      {formatAmount(investor.principal)}
                    </td>

                    <td className="sar-interest">
                      {formatAmount(investor.interest)}
                    </td>

                    <td>
                      <span
                        className={
                          investor.status === "Active"
                            ? "sar-status-active"
                            : "sar-status-pending"
                        }
                      >
                        {investor.status}
                      </span>
                    </td>

                    <td>
                      {formatDate(investor.date)}
                    </td>
                  </tr>
                ))}

                {!filteredInvestors.length && (
                  <tr>
                    <td
                      colSpan="7"
                      className="sar-empty"
                    >
                      No investor records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {reportType === "investments" && (
        <section className="sar-card">
          <div className="sar-card-header">
            <div>
              <span className="sar-card-eyebrow">
                INVESTMENT REPORT
              </span>

              <h2>Investment Details</h2>
            </div>

            <span className="sar-card-count">
              {filteredInvestments.length} Records
            </span>
          </div>

          <div className="sar-table-wrap">
            <table className="sar-table">
              <thead>
                <tr>
                  <th>INVESTMENT</th>
                  <th>INVESTOR</th>
                  <th>BRANCH</th>
                  <th>AMOUNT</th>
                  <th>RATE</th>
                  <th>INVESTED</th>
                  <th>MATURITY</th>
                  <th>INTEREST</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvestments.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.id}</strong>
                    </td>

                    <td>{item.investor}</td>

                    <td>{item.branch}</td>

                    <td className="sar-money">
                      {formatAmount(item.amount)}
                    </td>

                    <td>{item.rate}</td>

                    <td>
                      {formatDate(item.invested)}
                    </td>

                    <td>
                      {formatDate(item.maturity)}
                    </td>

                    <td className="sar-interest">
                      {formatAmount(item.interest)}
                    </td>

                    <td>
                      <span
                        className={
                          item.status === "Active"
                            ? "sar-status-active"
                            : item.status === "Rejected"
                            ? "sar-status-rejected"
                            : item.status === "Settled"
                            ? "sar-status-settled"
                            : "sar-status-pending"
                        }
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {!filteredInvestments.length && (
                  <tr>
                    <td
                      colSpan="9"
                      className="sar-empty"
                    >
                      No investment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {reportType === "overview" && (
        <>
          <section className="sar-bottom-grid">
            <div className="sar-card">
              <div className="sar-card-header">
                <div>
                  <span className="sar-card-eyebrow">
                    ADMIN PERFORMANCE
                  </span>

                  <h2>Branch Admin Overview</h2>
                </div>

                <span className="sar-card-count">
                  Top 5
                </span>
              </div>

              <div className="sar-table-wrap">
                <table className="sar-table">
                  <thead>
                    <tr>
                      <th>ADMIN</th>
                      <th>BRANCH</th>
                      <th>INVESTORS</th>
                      <th>INVESTMENTS</th>
                      <th>VALUE</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ADMIN_DATA.slice(0, 5).map(
                      (admin) => (
                        <tr key={admin.admin}>
                          <td>
                            <strong>
                              {admin.admin}
                            </strong>
                          </td>

                          <td>{admin.branch}</td>

                          <td>{admin.investors}</td>

                          <td>{admin.investments}</td>

                          <td className="sar-money">
                            {formatShortAmount(
                              admin.amount
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="sar-card">
              <div className="sar-card-header">
                <div>
                  <span className="sar-card-eyebrow">
                    RECENT ACTIVITY
                  </span>

                  <h2>Platform Activity</h2>
                </div>

                <Activity
                  size={17}
                  className="sar-header-icon"
                />
              </div>

              <div className="sar-activity-list">
                <div className="sar-activity-item">
                  <div className="sar-activity-icon sar-activity-investor">
                    <Users size={14} />
                  </div>

                  <div className="sar-activity-content">
                    <strong>
                      New investor registered
                    </strong>

                    <span>
                      Rajasekhar M completed registration
                    </span>
                  </div>

                  <small>12 min</small>
                </div>

                <div className="sar-activity-item">
                  <div className="sar-activity-icon sar-activity-investment">
                    <TrendingUp size={14} />
                  </div>

                  <div className="sar-activity-content">
                    <strong>
                      Investment approved
                    </strong>

                    <span>
                      INV000008 approved by admin
                    </span>
                  </div>

                  <small>38 min</small>
                </div>

                <div className="sar-activity-item">
                  <div className="sar-activity-icon sar-activity-admin">
                    <ShieldCheck size={14} />
                  </div>

                  <div className="sar-activity-content">
                    <strong>
                      New admin added
                    </strong>

                    <span>
                      Priya Sharma added as Branch Admin
                    </span>
                  </div>

                  <small>1 hr</small>
                </div>

                <div className="sar-activity-item">
                  <div className="sar-activity-icon sar-activity-pending">
                    <AlertCircle size={14} />
                  </div>

                  <div className="sar-activity-content">
                    <strong>
                      Investment pending
                    </strong>

                    <span>
                      INV000010 waiting for approval
                    </span>
                  </div>

                  <small>2 hrs</small>
                </div>
              </div>
            </div>
          </section>

          <section className="sar-card sar-health-card">
            <div className="sar-card-header">
              <div>
                <span className="sar-card-eyebrow">
                  PLATFORM SUMMARY
                </span>

                <h2>Current Financial Position</h2>
              </div>
            </div>

            <div className="sar-health-main">
              <div className="sar-health-icon">
                <IndianRupee size={20} />
              </div>

              <div>
                <span>Total Portfolio Value</span>
                <strong>₹10.25 Cr</strong>
              </div>
            </div>

            <div className="sar-health-items">
              <div>
                <span>ACTIVE PORTFOLIO</span>
                <strong>₹7.82 Cr</strong>
              </div>

              <div>
                <span>PENDING VALUE</span>
                <strong>₹1.43 Cr</strong>
              </div>

              <div>
                <span>SETTLED VALUE</span>
                <strong>₹1.00 Cr</strong>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}