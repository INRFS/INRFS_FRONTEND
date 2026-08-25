import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  LineChart as LineChartIcon,
  Percent,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import "../../Styles/Admin/Reports.css";

import {
  getReportDashboard,
  getReportSummary,
  getReportInvestments,
  getMonthlyInvestments,
  getInvestorGrowth,
  getStatusDistribution,
  exportReportCSV,
} from "../../services/admin/reportService";

const CHART_COLORS = [
  "#3159e8",
  "#18a978",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#06a6b8",
];

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const compactMoney = (value) => {
  const n = Number(value || 0);

  if (n >= 10000000) {
    return `₹${(n / 10000000).toFixed(2)} Cr`;
  }

  if (n >= 100000) {
    return `₹${(n / 100000).toFixed(2)} L`;
  }

  if (n >= 1000) {
    return `₹${(n / 1000).toFixed(1)} K`;
  }

  return money(n);
};

const formatDate = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusClass = (status) => {
  const s = String(status || "").toLowerCase();

  if (s === "active" || s === "approved") return "active";
  if (s === "pending") return "pending";
  if (
    s === "settled" ||
    s === "closed" ||
    s === "refunded"
  ) {
    return "closed";
  }
  if (s === "rejected") return "rejected";

  return "neutral";
};

const normalizeInvestment = (item, index) => {
  const id =
    item.investment_id ??
    item.investmentId ??
    item.id ??
    `INV-${index + 1}`;

  const investorId =
    item.investor_id ??
    item.investorId ??
    item.investor_registration_id ??
    "";

  const investor =
    item.investor_name ??
    item.investor ??
    item.full_name ??
    "Unknown Investor";

  const branch =
    item.branch_name ??
    item.branch ??
    "Unknown Branch";

  const amount = Number(
    item.investment_amount ??
      item.amount ??
      item.principal_amount ??
      0
  );

  const rate = Number(
    item.interest_rate ??
      item.rate ??
      0
  );

  const interest = Number(
    item.expected_interest_amount ??
      item.expected_interest ??
      item.interest_amount ??
      item.net_interest_amount ??
      0
  );

  const invested =
    item.investment_date ??
    item.invested_date ??
    item.created_date ??
    item.created_at;

  const maturity =
    item.maturity_date ??
    item.maturityDate;

  const rawStatus =
    item.status_name ??
    item.status ??
    item.investment_status ??
    "Unknown";

  return {
    raw: item,
    id: String(id),
    investorId: String(investorId),
    investor: String(investor),
    branch: String(branch),
    amount,
    rate,
    invested,
    maturity,
    interest,
    status: String(rawStatus),
    tenureMonths: Number(
      item.tenure_months ??
        item.tenureMonths ??
        0
    ),
  };
};

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  tone,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`reports-stat reports-stat--${tone}${
        onClick
          ? " reports-stat--clickable"
          : ""
      }`}
      onClick={onClick}
    >
      <div className="reports-stat-head">
        <span>{label}</span>

        <div className="reports-stat-icon">
          <Icon size={16} />
        </div>
      </div>

      <strong>{value}</strong>

      <small>{subtitle}</small>
    </button>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`reports-status reports-status--${statusClass(
        status
      )}`}
    >
      {status}
    </span>
  );
}

function MiniMetric({ label, value, tone }) {
  return (
    <div
      className={`reports-mini-metric reports-mini-metric--${tone}`}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PanelTitle({
  title,
  subtitle,
  action,
}) {
  return (
    <div className="reports-panel-head reports-panel-head--table">
      <div>
        <span>REPORT</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      {action}
    </div>
  );
}

function EmptyRow({ colSpan }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="reports-empty-row"
      >
        No records found.
      </td>
    </tr>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="reports-chart-tooltip">
      <strong>{label}</strong>

      {payload.map((item) => (
        <div key={item.dataKey}>
          <span>{item.name}</span>

          <b>
            {item.dataKey === "amount" ||
            item.dataKey === "invested" ||
            item.dataKey === "investment_amount"
              ? money(item.value)
              : item.value}
          </b>
        </div>
      ))}
    </div>
  );
}

function InvestmentTable({
  rows,
  onView,
}) {
  return (
    <div className="reports-table-scroll">
      <table className="reports-table">
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
            <th>ACTION</th>
          </tr>
        </thead>

        <tbody>
          {!rows.length ? (
            <EmptyRow colSpan={10} />
          ) : (
            rows.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.id}</strong>
                </td>

                <td>
                  <div className="reports-person">
                    <span className="reports-avatar">
                      {item.investor
                        .charAt(0)
                        .toUpperCase()}
                    </span>

                    <div>
                      <strong>
                        {item.investor}
                      </strong>

                      <small>
                        {item.investorId}
                      </small>
                    </div>
                  </div>
                </td>

                <td>{item.branch}</td>

                <td>
                  <strong>
                    {money(item.amount)}
                  </strong>
                </td>

                <td>{item.rate}%</td>

                <td>
                  {formatDate(item.invested)}
                </td>

                <td>
                  {formatDate(item.maturity)}
                </td>

                <td className="reports-green-text">
                  {money(item.interest)}
                </td>

                <td>
                  <StatusBadge
                    status={item.status}
                  />
                </td>

                <td>
                  <button
                    type="button"
                    className="reports-icon-action"
                    onClick={() =>
                      onView(item)
                    }
                  >
                    <Eye size={13} />
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function InvestorModal({
  investor,
  onClose,
  onDownloadInvestment,
  onDownloadInvestor,
}) {
  if (!investor) {
    return null;
  }

  return (
    <div
      className="reports-modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="reports-investor-modal">
        <div className="reports-modal-head">
          <div className="reports-modal-investor">
            <div className="reports-avatar reports-avatar--large">
              {investor.investor
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <span>
                INVESTOR PORTFOLIO
              </span>

              <h2>
                {investor.investor}
              </h2>

              <p>
                {investor.investorId} ·{" "}
                {investor.branch}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="reports-modal-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="reports-investor-summary">
          <div>
            <span>Total Invested</span>
            <strong>
              {money(investor.amount)}
            </strong>
          </div>

          <div>
            <span>Expected Interest</span>
            <strong className="reports-green-text">
              {money(investor.interest)}
            </strong>
          </div>

          <div>
            <span>Investment Count</span>
            <strong>
              {investor.count}
            </strong>
          </div>

          <div>
            <span>Active</span>
            <strong>
              {investor.active}
            </strong>
          </div>
        </div>

        <div className="reports-modal-actions">
          <button
            type="button"
            className="reports-download-btn reports-download-btn--primary"
            onClick={() =>
              onDownloadInvestor(
                investor
              )
            }
          >
            <Download size={14} />
            Download Investor Report
          </button>
        </div>

        <div className="reports-modal-section-title">
          <div>
            <span>INVESTMENTS</span>
            <h3>
              All investments of{" "}
              {investor.investor}
            </h3>
          </div>

          <small>
            {investor.items.length}{" "}
            records
          </small>
        </div>

        <div className="reports-table-scroll reports-modal-table">
          <table className="reports-table">
            <thead>
              <tr>
                <th>INVESTMENT</th>
                <th>INVESTED</th>
                <th>RATE</th>
                <th>INTEREST</th>
                <th>MATURITY</th>
                <th>STATUS</th>
                <th>DOWNLOAD</th>
              </tr>
            </thead>

            <tbody>
              {investor.items.map(
                (item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>
                        {item.id}
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {money(
                          item.amount
                        )}
                      </strong>
                    </td>

                    <td>
                      {item.rate}%
                    </td>

                    <td className="reports-green-text">
                      {money(
                        item.interest
                      )}
                    </td>

                    <td>
                      {formatDate(
                        item.maturity
                      )}
                    </td>

                    <td>
                      <StatusBadge
                        status={
                          item.status
                        }
                      />
                    </td>

                    <td>
                      <button
                        type="button"
                        className="reports-row-download"
                        onClick={() =>
                          onDownloadInvestment(
                            item
                          )
                        }
                      >
                        <Download
                          size={13}
                        />
                        Download
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="reports-modal-footer">
          <span>
            Total principal:{" "}
            <strong>
              {money(investor.amount)}
            </strong>
          </span>

          <span>
            Total expected value:{" "}
            <strong>
              {money(
                investor.amount +
                  investor.interest
              )}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}

function InvestorReport({
  rows,
  onView,
  onDownloadAll,
}) {
  const data = useMemo(() => {
    const map = new Map();

    rows.forEach((item) => {
      if (!map.has(item.investorId)) {
        map.set(item.investorId, {
          investorId:
            item.investorId,
          investor:
            item.investor,
          branch:
            item.branch,
          count: 0,
          amount: 0,
          interest: 0,
          active: 0,
          pending: 0,
          settled: 0,
          items: [],
        });
      }

      const row =
        map.get(item.investorId);

      row.count += 1;
      row.amount += item.amount;
      row.interest += item.interest;

      row.items.push(item);

      const status =
        item.status.toLowerCase();

      if (
        status === "active" ||
        status === "approved"
      ) {
        row.active += 1;
      }

      if (status === "pending") {
        row.pending += 1;
      }

      if (
        status === "settled" ||
        status === "closed"
      ) {
        row.settled += 1;
      }
    });

    return [...map.values()].sort(
      (a, b) => b.amount - a.amount
    );
  }, [rows]);

  const branchChart = useMemo(() => {
    const map = new Map();

    data.forEach((item) => {
      if (!map.has(item.branch)) {
        map.set(item.branch, {
          branch: item.branch,
          investors: 0,
          amount: 0,
        });
      }

      const row =
        map.get(item.branch);

      row.investors += 1;
      row.amount += item.amount;
    });

    return [...map.values()];
  }, [data]);

  const statusChart = useMemo(() => {
    const totals = {};

    rows.forEach((item) => {
      const status =
        item.status || "Unknown";

      totals[status] =
        (totals[status] || 0) + 1;
    });

    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .filter((item) => item.value > 0);
  }, [rows]);

  const totalInvested =
    data.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  const totalInterest =
    data.reduce(
      (sum, item) =>
        sum + item.interest,
      0
    );

  return (
    <div className="reports-investors-layout">
      <section className="reports-panel reports-table-panel">
        <PanelTitle
          title="Investors"
          subtitle={`${data.length} investors · ${rows.length} investment records`}
          action={
            <button
              type="button"
              className="reports-download-btn reports-download-btn--primary"
              onClick={onDownloadAll}
            >
              <FileSpreadsheet
                size={14}
              />
              Download All Investors
            </button>
          }
        />

        <div className="reports-investor-summary-strip">
          <MiniMetric
            label="Investors"
            value={data.length}
            tone="blue"
          />

          <MiniMetric
            label="Investments"
            value={rows.length}
            tone="purple"
          />

          <MiniMetric
            label="Invested"
            value={compactMoney(
              totalInvested
            )}
            tone="green"
          />

          <MiniMetric
            label="Interest"
            value={compactMoney(
              totalInterest
            )}
            tone="teal"
          />
        </div>

        <div className="reports-table-scroll">
          <table className="reports-table reports-investors-table">
            <thead>
              <tr>
                <th>INVESTOR</th>
                <th>BRANCH</th>
                <th>INVESTMENTS</th>
                <th>TOTAL INVESTED</th>
                <th>INTEREST</th>
                <th>ACTIVE</th>
                <th>PENDING</th>
                <th>SETTLED</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {!data.length ? (
                <EmptyRow colSpan={9} />
              ) : (
                data.map((row) => (
                  <tr
                    key={
                      row.investorId
                    }
                  >
                    <td>
                      <div className="reports-person">
                        <span className="reports-avatar">
                          {row.investor
                            .charAt(0)
                            .toUpperCase()}
                        </span>

                        <div>
                          <strong>
                            {row.investor}
                          </strong>

                          <small>
                            {
                              row.investorId
                            }
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      {row.branch}
                    </td>

                    <td>
                      <strong>
                        {row.count}
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {money(
                          row.amount
                        )}
                      </strong>
                    </td>

                    <td className="reports-green-text">
                      {money(
                        row.interest
                      )}
                    </td>

                    <td>
                      {row.active}
                    </td>

                    <td>
                      {row.pending}
                    </td>

                    <td>
                      {row.settled}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="reports-investor-view-btn"
                        onClick={() =>
                          onView(row)
                        }
                      >
                        <Eye size={13} />
                        View Portfolio
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="reports-visual-grid">
        <div className="reports-panel reports-chart-panel">
          <div className="reports-panel-head">
            <div>
              <span>
                VISUALIZATION
              </span>
              <h2>
                Top investor portfolios
              </h2>
              <p>
                Principal invested by investor
              </p>
            </div>
          </div>

          <div className="reports-chart reports-chart--investors">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={data
                  .slice(0, 6)
                  .map((item) => ({
                    name:
                      item.investor.split(
                        " "
                      )[0],
                    amount:
                      item.amount,
                  }))}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={
                    compactMoney
                  }
                />

                <Tooltip
                  content={
                    <ChartTooltip />
                  }
                />

                <Bar
                  dataKey="amount"
                  name="Invested"
                  fill="#3159e8"
                  radius={[
                    5,
                    5,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="reports-panel reports-chart-panel">
          <div className="reports-panel-head">
            <div>
              <span>
                VISUALIZATION
              </span>
              <h2>
                Investment status
              </h2>
              <p>
                Investment records by status
              </p>
            </div>
          </div>

          <div className="reports-status-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={statusChart}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={4}
                  stroke="none"
                >
                  {statusChart.map(
                    (entry, index) => (
                      <Cell
                        key={
                          entry.name
                        }
                        fill={
                          CHART_COLORS[
                            index %
                              CHART_COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="reports-pie-center">
              <strong>
                {rows.length}
              </strong>
              <span>Records</span>
            </div>
          </div>

          <div className="reports-chart-legend">
            {statusChart.map(
              (item, index) => (
                <div key={item.name}>
                  <span
                    style={{
                      background:
                        CHART_COLORS[
                          index %
                            CHART_COLORS.length
                        ],
                    }}
                  />

                  {item.name}

                  <strong>
                    {item.value}
                  </strong>
                </div>
              )
            )}
          </div>
        </div>

        <div className="reports-panel reports-chart-panel reports-chart-panel--wide">
          <div className="reports-panel-head">
            <div>
              <span>
                VISUALIZATION
              </span>

              <h2>
                Investor distribution by branch
              </h2>

              <p>
                Investor count and principal value by branch
              </p>
            </div>
          </div>

          <div className="reports-chart reports-chart--branch">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={branchChart}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="branch"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  content={
                    <ChartTooltip />
                  }
                />

                <Legend />

                <Bar
                  dataKey="investors"
                  name="Investors"
                  fill="#18a978"
                />

                <Bar
                  dataKey="amount"
                  name="Invested Amount"
                  fill="#8b5cf6"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}

function Overview({
  investments,
  summary,
  monthly,
  onInvestorClick,
  onInvestmentClick,
}) {
  const totalPortfolio =
    Number(
      summary?.new_investments
    ) ||
    investments.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  const active =
    investments.filter(
      (item) =>
        ["active", "approved"].includes(
          item.status.toLowerCase()
        )
    );

  const pending =
    investments.filter(
      (item) =>
        item.status.toLowerCase() ===
        "pending"
    );

  const settled =
    investments.filter(
      (item) =>
        ["settled", "closed"].includes(
          item.status.toLowerCase()
        )
    );

  const investorCount = new Set(
    investments.map(
      (item) => item.investorId
    )
  ).size;

  return (
    <>
      <div className="reports-overview-top">
        <section className="reports-panel reports-overview-hero">
          <div className="reports-panel-head">
            <div>
              <span>
                PORTFOLIO OVERVIEW
              </span>

              <h2>
                Investment performance
              </h2>

              <p>
                Live investment data from the backend.
              </p>
            </div>
          </div>

          <div className="reports-overview-big">
            <div>
              <small>
                Total portfolio
              </small>

              <strong>
                {money(
                  totalPortfolio
                )}
              </strong>

              <span className="reports-positive">
                <ArrowUpRight
                  size={13}
                />
                Live data
              </span>
            </div>

            <div className="reports-overview-hero-icon">
              <Wallet size={28} />
            </div>
          </div>

          <div className="reports-overview-metrics">
            <div>
              <span>Investors</span>
              <strong>
                {investorCount}
              </strong>
            </div>

            <div>
              <span>Active</span>
              <strong>
                {money(
                  active.reduce(
                    (s, x) =>
                      s + x.amount,
                    0
                  )
                )}
              </strong>
            </div>

            <div>
              <span>Pending</span>
              <strong>
                {money(
                  pending.reduce(
                    (s, x) =>
                      s + x.amount,
                    0
                  )
                )}
              </strong>
            </div>

            <div>
              <span>Settled</span>
              <strong>
                {money(
                  settled.reduce(
                    (s, x) =>
                      s + x.amount,
                    0
                  )
                )}
              </strong>
            </div>
          </div>
        </section>

        <section className="reports-panel reports-overview-chart">
          <div className="reports-panel-head">
            <div>
              <span>
                INVESTMENT TREND
              </span>

              <h2>
                Monthly investment value
              </h2>
            </div>
          </div>

          <div className="reports-chart reports-chart--overview">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={monthly}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={
                    compactMoney
                  }
                />

                <Tooltip
                  content={
                    <ChartTooltip />
                  }
                />

                <Area
                  type="monotone"
                  dataKey="amount"
                  name="Investment"
                  stroke="#3159e8"
                  strokeWidth={2.5}
                  fill="#3159e8"
                  fillOpacity={0.12}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="reports-panel reports-table-panel">
        <PanelTitle
          title="Recent Investments"
          subtitle="Latest investment records"
          action={
            <button
              type="button"
              className="reports-link-btn"
              onClick={() =>
                onInvestorClick()
              }
            >
              Investors
              <ChevronRight size={14} />
            </button>
          }
        />

        <InvestmentTable
          rows={investments.slice(
            0,
            5
          )}
          onView={onInvestmentClick}
        />
      </section>
    </>
  );
}

function GenericReport({
  title,
  subtitle,
  rows,
  columns,
}) {
  return (
    <section className="reports-panel reports-table-panel">
      <PanelTitle
        title={title}
        subtitle={subtitle}
      />

      <div className="reports-table-scroll">
        <table className="reports-table">
          <thead>
            <tr>
              {columns.map(
                (column) => (
                  <th key={column.key}>
                    {column.label}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {!rows.length ? (
              <EmptyRow
                colSpan={
                  columns.length
                }
              />
            ) : (
              rows.map(
                (row, index) => (
                  <tr
                    key={
                      row.id ||
                      row.investment_id ||
                      index
                    }
                  >
                    {columns.map(
                      (column) => (
                        <td
                          key={
                            column.key
                          }
                        >
                          {column.render
                            ? column.render(
                                row
                              )
                            : row[
                                column.key
                              ] ?? "-"}
                        </td>
                      )
                    )}
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Reports() {
  const currentYear =
    new Date().getFullYear();

  const [year, setYear] =
    useState(currentYear);

  const [activeTab, setActiveTab] =
    useState("overview");

  const [search, setSearch] =
    useState("");

  const [branch, setBranch] =
    useState("all");

  const [status, setStatus] =
    useState("all");

  const [
    selectedInvestor,
    setSelectedInvestor,
  ] = useState(null);

  const [
    selectedInvestment,
    setSelectedInvestment,
  ] = useState(null);

  const [
    investments,
    setInvestments,
  ] = useState([]);

  const [summary, setSummary] =
    useState(null);

  const [monthly, setMonthly] =
    useState([]);

  const [
    investorGrowth,
    setInvestorGrowth,
  ] = useState([]);

  const [
    statusDistribution,
    setStatusDistribution,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState("");

  const loadReports = async () => {
    try {
      setError("");

      setRefreshing(true);

      const [
        investmentResponse,
        summaryResponse,
        monthlyResponse,
        growthResponse,
        statusResponse,
      ] = await Promise.allSettled([
        getReportInvestments({
          limit: 1000,
          offset: 0,
        }),

        getReportSummary(year),

        getMonthlyInvestments(year),

        getInvestorGrowth(year),

        getStatusDistribution(year),
      ]);

      if (
        investmentResponse.status ===
        "fulfilled"
      ) {
        const payload =
          investmentResponse.value;

        const rows =
          Array.isArray(payload)
            ? payload
            : payload?.data || [];

        setInvestments(
          rows.map(
            normalizeInvestment
          )
        );
      } else {
        throw investmentResponse.reason;
      }

      if (
        summaryResponse.status ===
        "fulfilled"
      ) {
        setSummary(
          summaryResponse.value?.data ||
            summaryResponse.value ||
            null
        );
      }

      if (
        monthlyResponse.status ===
        "fulfilled"
      ) {
        const rows =
          Array.isArray(
            monthlyResponse.value
          )
            ? monthlyResponse.value
            : monthlyResponse.value
                ?.data || [];

        setMonthly(
          rows.map((row) => ({
            month:
              row.month_name ||
              row.month ||
              "",
            amount: Number(
              row.invested_amount ??
                row.amount ??
                row.investment_amount ??
                0
            ),
            investors: Number(
              row.investor_count ??
                row.investors ??
                0
            ),
            investments: Number(
              row.investment_count ??
                row.investments ??
                0
            ),
          }))
        );
      }

      if (
        growthResponse.status ===
        "fulfilled"
      ) {
        const rows =
          Array.isArray(
            growthResponse.value
          )
            ? growthResponse.value
            : growthResponse.value
                ?.data || [];

        setInvestorGrowth(rows);
      }

      if (
        statusResponse.status ===
        "fulfilled"
      ) {
        const rows =
          Array.isArray(
            statusResponse.value
          )
            ? statusResponse.value
            : statusResponse.value
                ?.data || [];

        setStatusDistribution(rows);
      }

      setLastUpdated(
        new Date().toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      );
    } catch (err) {
      console.error(
        "Reports loading error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load reports."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [year]);

  const branches = useMemo(() => {
    return [
      ...new Set(
        investments
          .map(
            (item) => item.branch
          )
          .filter(Boolean)
      ),
    ].sort();
  }, [investments]);

  const filtered = useMemo(() => {
    const q =
      search
        .trim()
        .toLowerCase();

    return investments.filter(
      (item) => {
        const matchesSearch =
          !q ||
          item.id
            .toLowerCase()
            .includes(q) ||
          item.investor
            .toLowerCase()
            .includes(q) ||
          item.investorId
            .toLowerCase()
            .includes(q);

        const matchesBranch =
          branch === "all" ||
          item.branch === branch;

        const matchesStatus =
          status === "all" ||
          item.status
            .toLowerCase() ===
            status.toLowerCase();

        return (
          matchesSearch &&
          matchesBranch &&
          matchesStatus
        );
      }
    );
  }, [
    investments,
    search,
    branch,
    status,
  ]);

  const investorGroups = useMemo(() => {
    const map = new Map();

    filtered.forEach((item) => {
      if (
        !map.has(
          item.investorId
        )
      ) {
        map.set(item.investorId, {
          investorId:
            item.investorId,
          investor:
            item.investor,
          branch:
            item.branch,
          count: 0,
          amount: 0,
          interest: 0,
          active: 0,
          pending: 0,
          settled: 0,
          items: [],
        });
      }

      const row = map.get(
        item.investorId
      );

      row.count += 1;
      row.amount += item.amount;
      row.interest += item.interest;
      row.items.push(item);

      const currentStatus =
        item.status.toLowerCase();

      if (
        currentStatus === "active" ||
        currentStatus === "approved"
      ) {
        row.active += 1;
      }

      if (
        currentStatus ===
        "pending"
      ) {
        row.pending += 1;
      }

      if (
        currentStatus ===
          "settled" ||
        currentStatus ===
          "closed"
      ) {
        row.settled += 1;
      }
    });

    return [...map.values()].sort(
      (a, b) =>
        b.amount - a.amount
    );
  }, [filtered]);

  const totalPortfolio =
    filtered.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  const active =
    filtered.filter((item) =>
      ["active", "approved"].includes(
        item.status.toLowerCase()
      )
    );

  const pending =
    filtered.filter(
      (item) =>
        item.status.toLowerCase() ===
        "pending"
    );

  const settled =
    filtered.filter((item) =>
      ["settled", "closed"].includes(
        item.status.toLowerCase()
      )
    );

  const totalInterest =
    filtered.reduce(
      (sum, item) =>
        sum + item.interest,
      0
    );

  const derivedMonthly = useMemo(() => {
    const map = new Map();

    filtered.forEach((item) => {
      if (!item.invested) {
        return;
      }

      const d = new Date(
        item.invested
      );

      if (
        Number.isNaN(d.getTime())
      ) {
        return;
      }

      const key =
        `${d.getFullYear()}-${String(
          d.getMonth() + 1
        ).padStart(2, "0")}`;

      if (!map.has(key)) {
        map.set(key, {
          month: d.toLocaleString(
            "en-US",
            {
              month: "short",
            }
          ),
          amount: 0,
          investors: new Set(),
          investments: 0,
          sort: key,
        });
      }

      const row = map.get(key);

      row.amount += item.amount;
      row.investments += 1;

      row.investors.add(
        item.investorId
      );
    });

    return [...map.values()]
      .sort((a, b) =>
        a.sort.localeCompare(
          b.sort
        )
      )
      .map((row) => ({
        month: row.month,
        amount: row.amount,
        investors:
          row.investors.size,
        investments:
          row.investments,
      }));
  }, [filtered]);

  const chartMonthly =
    monthly.length
      ? monthly
      : derivedMonthly;

  const downloadInvestment = (
    item
  ) => {
    exportReportCSV(
      [item.raw],
      `${item.id}-report.csv`
    );
  };

  const downloadInvestor = (
    investor
  ) => {
    exportReportCSV(
      investor.items.map(
        (item) => item.raw
      ),
      `${investor.investorId}-report.csv`
    );
  };

  const downloadAllInvestors = () => {
    exportReportCSV(
      investorGroups.map(
        (item) => ({
          investor_id:
            item.investorId,
          investor:
            item.investor,
          branch:
            item.branch,
          investment_count:
            item.count,
          total_invested:
            item.amount,
          expected_interest:
            item.interest,
          active:
            item.active,
          pending:
            item.pending,
          settled:
            item.settled,
        })
      ),
      "all-investors-report.csv"
    );
  };

  const downloadAllInvestments = () => {
    exportReportCSV(
      filtered.map(
        (item) => item.raw
      ),
      "all-investments-report.csv"
    );
  };

  const openInvestorFromInvestment = (
    item
  ) => {
    const investor =
      investorGroups.find(
        (x) =>
          x.investorId ===
          item.investorId
      );

    if (investor) {
      setSelectedInvestor(
        investor
      );
    }
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: TrendingUp,
    },
    {
      id: "investors",
      label: "Investors",
      icon: Users,
    },
    {
      id: "investments",
      label: "Investments",
      icon: Wallet,
    },
    {
      id: "maturity",
      label: "Maturity",
      icon: CalendarClock,
    },
    {
      id: "interest",
      label: "Interest",
      icon: Percent,
    },
    {
      id: "settlement",
      label: "Settlement",
      icon: CheckCircle2,
    },
    {
      id: "branches",
      label: "Branches",
      icon: Building2,
    },
    {
      id: "monthly",
      label: "Monthly",
      icon: LineChartIcon,
    },
  ];

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-panel">
          <div className="reports-panel-head">
            <div>
              <span>
                REPORTS
              </span>
              <h2>
                Loading reports...
              </h2>
              <p>
                Fetching live data from the server.
              </p>
            </div>

            <RefreshCw
              size={20}
              className="reports-loading-icon"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">


      {error && (
        <div className="reports-error">
          {error}
        </div>
      )}

      {/* <div className="reports-stat-grid">
        <StatCard
          label="TOTAL INVESTORS"
          value={
            new Set(
              investments.map(
                (x) =>
                  x.investorId
              )
            ).size
          }
          subtitle="Live investor records"
          icon={Users}
          tone="blue"
          onClick={() =>
            setActiveTab(
              "investors"
            )
          }
        />

        <StatCard
          label="TOTAL INVESTMENTS"
          value={filtered.length}
          subtitle="Investment accounts"
          icon={Wallet}
          tone="indigo"
          onClick={() =>
            setActiveTab(
              "investments"
            )
          }
        />

        <StatCard
          label="TOTAL PORTFOLIO"
          value={compactMoney(
            summary?.new_investments ??
              totalPortfolio
          )}
          subtitle="Principal value"
          icon={TrendingUp}
          tone="purple"
        />

        <StatCard
          label="ACTIVE PORTFOLIO"
          value={compactMoney(
            active.reduce(
              (s, x) =>
                s + x.amount,
              0
            )
          )}
          subtitle={`${active.length} active records`}
          icon={CheckCircle2}
          tone="green"
        />

        <StatCard
          label="PENDING VALUE"
          value={compactMoney(
            pending.reduce(
              (s, x) =>
                s + x.amount,
              0
            )
          )}
          subtitle={`${pending.length} awaiting action`}
          icon={Clock3}
          tone="amber"
        />

        <StatCard
          label="INTEREST PAID"
          value={compactMoney(
            summary?.interest_paid ??
              totalInterest
          )}
          subtitle="Paid interest"
          icon={Percent}
          tone="teal"
        />
      </div> */}

      <div className="reports-tab-bar">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              type="button"
              key={tab.id}
              className={`reports-tab ${
                activeTab ===
                tab.id
                  ? "reports-tab--active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab(
                  tab.id
                )
              }
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="reports-filter-card">
        <div className="reports-filter-grid">
          <label className="reports-input reports-input--search">
            <Search size={15} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search investor, investor ID, investment..."
            />
          </label>

          <select
            value={branch}
            onChange={(event) =>
              setBranch(
                event.target.value
              )
            }
          >
            <option value="all">
              All Branches
            </option>

            {branches.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
          >
            <option value="all">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Approved">
              Approved
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Closed">
              Closed
            </option>

            <option value="Settled">
              Settled
            </option>

            <option value="Rejected">
              Rejected
            </option>
          </select>

          <button
            type="button"
            className="reports-download-all-btn"
            onClick={
              downloadAllInvestments
            }
          >
            <FileSpreadsheet
              size={14}
            />
            Download All
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <Overview
          investments={filtered}
          summary={summary}
          monthly={chartMonthly}
          onInvestorClick={() =>
            setActiveTab(
              "investors"
            )
          }
          onInvestmentClick={
            setSelectedInvestment
          }
        />
      )}

      {activeTab === "investors" && (
        <InvestorReport
          rows={filtered}
          onView={
            setSelectedInvestor
          }
          onDownloadAll={
            downloadAllInvestors
          }
        />
      )}

      {activeTab === "investments" && (
        <section className="reports-panel reports-table-panel">
          <PanelTitle
            title="Investment Report"
            subtitle={`${filtered.length} investment records`}
            action={
              <button
                type="button"
                className="reports-download-btn reports-download-btn--primary"
                onClick={
                  downloadAllInvestments
                }
              >
                <Download
                  size={14}
                />
                Download All
              </button>
            }
          />

          <InvestmentTable
            rows={filtered}
            onView={
              setSelectedInvestment
            }
          />
        </section>
      )}

      {activeTab === "maturity" && (
        <GenericReport
          title="Maturity Report"
          subtitle="Investment maturity information"
          rows={filtered}
          columns={[
            {
              key: "id",
              label: "INVESTMENT",
            },
            {
              key: "investor",
              label: "INVESTOR",
            },
            {
              key: "amount",
              label: "PRINCIPAL",
              render: (row) =>
                money(
                  row.amount
                ),
            },
            {
              key: "maturity",
              label: "MATURITY",
              render: (row) =>
                formatDate(
                  row.maturity
                ),
            },
            {
              key: "interest",
              label: "INTEREST",
              render: (row) =>
                money(
                  row.interest
                ),
            },
            {
              key: "status",
              label: "STATUS",
              render: (row) => (
                <StatusBadge
                  status={
                    row.status
                  }
                />
              ),
            },
          ]}
        />
      )}

      {activeTab === "interest" && (
        <GenericReport
          title="Interest Report"
          subtitle="Expected interest position by investment"
          rows={filtered}
          columns={[
            {
              key: "investor",
              label: "INVESTOR",
            },
            {
              key: "id",
              label: "INVESTMENT",
            },
            {
              key: "amount",
              label: "PRINCIPAL",
              render: (row) =>
                money(
                  row.amount
                ),
            },
            {
              key: "rate",
              label: "RATE",
              render: (row) =>
                `${row.rate}%`,
            },
            {
              key: "interest",
              label: "INTEREST",
              render: (row) =>
                money(
                  row.interest
                ),
            },
            {
              key: "status",
              label: "STATUS",
              render: (row) => (
                <StatusBadge
                  status={
                    row.status
                  }
                />
              ),
            },
          ]}
        />
      )}

      {activeTab === "settlement" && (
        <GenericReport
          title="Settlement Report"
          subtitle="Settled investment records"
          rows={settled}
          columns={[
            {
              key: "id",
              label: "INVESTMENT",
            },
            {
              key: "investor",
              label: "INVESTOR",
            },
            {
              key: "amount",
              label: "PRINCIPAL",
              render: (row) =>
                money(
                  row.amount
                ),
            },
            {
              key: "interest",
              label: "INTEREST",
              render: (row) =>
                money(
                  row.interest
                ),
            },
            {
              key: "status",
              label: "STATUS",
              render: (row) => (
                <StatusBadge
                  status={
                    row.status
                  }
                />
              ),
            },
          ]}
        />
      )}

      {activeTab === "branches" && (
        <GenericReport
          title="Branch Performance"
          subtitle="Investment activity by branch"
          rows={branches.map(
            (branchName) => {
              const branchRows =
                investments.filter(
                  (item) =>
                    item.branch ===
                    branchName
                );

              const investorCount =
                new Set(
                  branchRows.map(
                    (item) =>
                      item.investorId
                  )
                ).size;

              const amount =
                branchRows.reduce(
                  (sum, item) =>
                    sum +
                    item.amount,
                  0
                );

              return {
                branch:
                  branchName,
                investors:
                  investorCount,
                investments:
                  branchRows.length,
                amount,
              };
            }
          )}
          columns={[
            {
              key: "branch",
              label: "BRANCH",
            },
            {
              key: "investors",
              label: "INVESTORS",
            },
            {
              key: "investments",
              label: "INVESTMENTS",
            },
            {
              key: "amount",
              label: "PORTFOLIO",
              render: (row) =>
                money(
                  row.amount
                ),
            },
          ]}
        />
      )}

      {activeTab === "monthly" && (
        <section className="reports-panel reports-table-panel">
          <PanelTitle
            title="Monthly Investment Report"
            subtitle={`Investment activity for ${year}`}
          />

          <div className="reports-monthly-cards">
            {chartMonthly.map(
              (row) => (
                <div
                  className="reports-month-card"
                  key={row.month}
                >
                  <span>
                    {row.month}{" "}
                    {year}
                  </span>

                  <strong>
                    {money(
                      row.amount
                    )}
                  </strong>

                  <small>
                    {
                      row.investments
                    }{" "}
                    investments ·{" "}
                    {
                      row.investors
                    }{" "}
                    investors
                  </small>
                </div>
              )
            )}
          </div>

          <div className="reports-chart reports-chart--monthly">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={chartMonthly}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={
                    compactMoney
                  }
                />

                <Tooltip
                  content={
                    <ChartTooltip />
                  }
                />

                <Area
                  type="monotone"
                  dataKey="amount"
                  name="Investment"
                  stroke="#3159e8"
                  strokeWidth={2.5}
                  fill="#3159e8"
                  fillOpacity={0.12}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {selectedInvestment && (
        <div
          className="reports-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedInvestment(
                null
              );
            }
          }}
        >
          <div className="reports-investment-modal">
            <div className="reports-modal-head">
              <div>
                <span>
                  INVESTMENT DETAILS
                </span>

                <h2>
                  {
                    selectedInvestment.id
                  }
                </h2>

                <p>
                  {
                    selectedInvestment.investor
                  }{" "}
                  ·{" "}
                  {
                    selectedInvestment.investorId
                  }
                </p>
              </div>

              <button
                type="button"
                className="reports-modal-close"
                onClick={() =>
                  setSelectedInvestment(
                    null
                  )
                }
              >
                <X size={18} />
              </button>
            </div>

            <div className="reports-detail-grid">
              <div>
                <span>
                  Investor
                </span>

                <strong>
                  {
                    selectedInvestment.investor
                  }
                </strong>
              </div>

              <div>
                <span>
                  Branch
                </span>

                <strong>
                  {
                    selectedInvestment.branch
                  }
                </strong>
              </div>

              <div>
                <span>
                  Principal
                </span>

                <strong>
                  {money(
                    selectedInvestment.amount
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Interest Rate
                </span>

                <strong>
                  {
                    selectedInvestment.rate
                  }
                  %
                </strong>
              </div>

              <div>
                <span>
                  Investment Date
                </span>

                <strong>
                  {formatDate(
                    selectedInvestment.invested
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Maturity Date
                </span>

                <strong>
                  {formatDate(
                    selectedInvestment.maturity
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Expected Interest
                </span>

                <strong className="reports-green-text">
                  {money(
                    selectedInvestment.interest
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Status
                </span>

                <StatusBadge
                  status={
                    selectedInvestment.status
                  }
                />
              </div>
            </div>

            <div className="reports-modal-footer">
              <button
                type="button"
                className="reports-download-btn reports-download-btn--primary"
                onClick={() =>
                  downloadInvestment(
                    selectedInvestment
                  )
                }
              >
                <Download
                  size={14}
                />
                Download Investment
              </button>

              <button
                type="button"
                className="reports-action-btn reports-action-btn--dark"
                onClick={() => {
                  openInvestorFromInvestment(
                    selectedInvestment
                  );

                  setSelectedInvestment(
                    null
                  );
                }}
              >
                View Investor Portfolio
              </button>
            </div>
          </div>
        </div>
      )}

      <InvestorModal
        investor={selectedInvestor}
        onClose={() =>
          setSelectedInvestor(
            null
          )
        }
        onDownloadInvestment={
          downloadInvestment
        }
        onDownloadInvestor={
          downloadInvestor
        }
      />
    </div>
  );
}