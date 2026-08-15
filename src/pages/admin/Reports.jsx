import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  RefreshCw,
  Search,
  Users,
  TrendingUp,
  Wallet,
  Clock3,
  Percent,
  CheckCircle2,
  CalendarClock,
  Building2,
  AlertCircle,
  ChevronRight,
  X,
} from "lucide-react";
import "../../Styles/Admin/Reports.css";
import { getReportDashboard, exportReportCSV } from "../../services/admin/reportService";

const getValue = (obj, keys, fallback = "") => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== "") {
      return obj[key];
    }
  }
  return fallback;
};

const num = (value) => Number(value || 0);

const formatINR = (value) =>
  `₹${num(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatINRCompact = (value) => {
  const n = num(value);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)} K`;
  return formatINR(n);
};

const formatNumber = (value) => num(value).toLocaleString("en-IN");

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const dateValue = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const getInvestorName = (item) =>
  getValue(item, ["investor_name", "investor", "full_name", "name"], "Unknown Investor");

const getInvestorId = (item) =>
  getValue(
    item,
    ["investor_registration_id", "investor_id", "investorId", "registration_id", "login_id"],
    "—"
  );

const getInvestmentId = (item, index = 0) =>
  getValue(
    item,
    ["investment_id", "investmentId", "bond_id", "bond_number", "id"],
    `INV-${index + 1}`
  );

const getAmount = (item) =>
  num(getValue(item, ["investment_amount", "amount", "principal_amount", "total_amount"], 0));

const getRate = (item) =>
  num(getValue(item, ["interest_rate", "rate", "initial_rate"], 0));

const getInterest = (item) =>
  num(
    getValue(
      item,
      ["earned", "earned_amount", "interest_earned", "expected_interest_amount", "interest_amount"],
      0
    )
  );

const getStatus = (item) =>
  String(
    getValue(item, ["status_name", "investment_status", "status"], "Unknown")
  ).trim();

const getInvestmentDate = (item) =>
  getValue(item, ["investment_date", "invested_date", "created_at", "date"], "");

const getMaturityDate = (item) =>
  getValue(item, ["maturity_date", "maturityDate", "matures_on", "maturity"], "");

const getTenure = (item) =>
  num(getValue(item, ["tenure_months", "tenure", "duration_months"], 0));

const getBranch = (item) =>
  getValue(item, ["branch_name", "branch", "service_location_name", "location_name"], "—");

const normalizeStatus = (status) => status.toLowerCase().replace(/[_-]+/g, " ").trim();

const statusClass = (status) => {
  const s = normalizeStatus(status);
  if (s.includes("active") || s.includes("approved")) return "active";
  if (s.includes("pending")) return "pending";
  if (s.includes("reject")) return "rejected";
  if (s.includes("closed") || s.includes("settled") || s.includes("mature")) return "closed";
  return "neutral";
};

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const calculatedMaturity = (item) => {
  const explicit = dateValue(getMaturityDate(item));
  if (explicit) return explicit;
  const start = dateValue(getInvestmentDate(item));
  const tenure = getTenure(item);
  if (start && tenure > 0) return addMonths(start, tenure);
  return null;
};

const daysUntil = (date) => {
  if (!date) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
};

const csvSafeName = (value) =>
  String(value || "report")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const StatCard = ({ label, value, subtitle, icon: Icon, tone }) => (
  <div className={`reports-stat reports-stat--${tone}`}>
    <div className="reports-stat-head">
      <span>{label}</span>
      <div className="reports-stat-icon">
        <Icon size={16} />
      </div>
    </div>
    <strong>{value}</strong>
    <small>{subtitle}</small>
  </div>
);

const StatusBadge = ({ status }) => (
  <span className={`reports-status reports-status--${statusClass(status)}`}>
    {status}
  </span>
);

export default function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("all");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getReportDashboard();
      setDashboard(response || {});
    } catch (err) {
      setError(err?.message || "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const summary = dashboard?.summary || {};

  const records = useMemo(() => {
    const source =
      dashboard?.recent_investments ||
      dashboard?.investments ||
      dashboard?.investment_records ||
      dashboard?.records ||
      [];
    return Array.isArray(source) ? source : [];
  }, [dashboard]);

  const branches = useMemo(() => {
    return [...new Set(records.map(getBranch).filter((x) => x && x !== "—"))].sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

    return records.filter((item) => {
      const text = [
        getInvestorName(item),
        getInvestorId(item),
        getInvestmentId(item),
        getBranch(item),
        getStatus(item),
      ]
        .join(" ")
        .toLowerCase();

      if (q && !text.includes(q)) return false;
      if (branch !== "all" && getBranch(item) !== branch) return false;
      if (status !== "all" && normalizeStatus(getStatus(item)) !== status) return false;

      const d = dateValue(getInvestmentDate(item));
      if (from && (!d || d < from)) return false;
      if (to && (!d || d > to)) return false;

      return true;
    });
  }, [records, search, branch, status, dateFrom, dateTo]);

  const metrics = useMemo(() => {
    const totalInvested = records.reduce((s, x) => s + getAmount(x), 0);
    const active = records.filter((x) => ["active", "approved"].includes(normalizeStatus(getStatus(x))));
    const pending = records.filter((x) => normalizeStatus(getStatus(x)).includes("pending"));
    const rejected = records.filter((x) => normalizeStatus(getStatus(x)).includes("reject"));
    const settled = records.filter((x) => {
      const s = normalizeStatus(getStatus(x));
      return s.includes("closed") || s.includes("settled") || s.includes("mature");
    });
    const interest = records.reduce((s, x) => s + getInterest(x), 0);
    const monthlyInterest = records.reduce((s, x) => {
      const amount = getAmount(x);
      const rate = getRate(x);
      return s + (amount && rate ? (amount * rate) / 100 : 0);
    }, 0);

    return {
      totalInvestors: num(summary.total_investors) || new Set(records.map(getInvestorId)).size,
      totalInvestments: num(summary.total_investments) || records.length,
      totalInvested: num(summary.total_aum) || totalInvested,
      activeAmount: active.reduce((s, x) => s + getAmount(x), 0),
      pendingAmount: pending.reduce((s, x) => s + getAmount(x), 0),
      rejectedAmount: rejected.reduce((s, x) => s + getAmount(x), 0),
      settledAmount: settled.reduce((s, x) => s + getAmount(x), 0),
      interest: interest || num(summary.monthly_interest_due),
      monthlyInterest,
      activeCount: num(summary.active_investments) || active.length,
      pendingCount: num(summary.pending_approvals) || pending.length,
      rejectedCount: rejected.length,
      settledCount: settled.length,
    };
  }, [records, summary]);

  const investorRows = useMemo(() => {
    const map = new Map();

    filteredRecords.forEach((item, index) => {
      const key = String(getInvestorId(item) || getInvestorName(item) || index);
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          investorId: getInvestorId(item),
          investor: getInvestorName(item),
          branch: getBranch(item),
          investments: 0,
          total: 0,
          interest: 0,
          active: 0,
          pending: 0,
          rejected: 0,
          settled: 0,
          latest: "",
          items: [],
        });
      }

      const row = map.get(key);
      const s = normalizeStatus(getStatus(item));
      row.investments += 1;
      row.total += getAmount(item);
      row.interest += getInterest(item);
      row.items.push(item);

      if (s.includes("active") || s.includes("approved")) row.active += 1;
      if (s.includes("pending")) row.pending += 1;
      if (s.includes("reject")) row.rejected += 1;
      if (s.includes("closed") || s.includes("settled") || s.includes("mature")) row.settled += 1;

      const d = dateValue(getInvestmentDate(item));
      if (d && (!row.latest || d > new Date(row.latest))) row.latest = d.toISOString();
    });

    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [filteredRecords]);

  const maturityRows = useMemo(() => {
    return filteredRecords
      .map((item, index) => {
        const maturity = calculatedMaturity(item);
        return {
          item,
          index,
          maturity,
          days: daysUntil(maturity),
        };
      })
      .filter((x) => x.maturity)
      .sort((a, b) => a.maturity - b.maturity);
  }, [filteredRecords]);

  const interestRows = useMemo(() => {
    return filteredRecords
      .map((item) => {
        const amount = getAmount(item);
        const rate = getRate(item);
        const monthly = num(
          getValue(item, ["monthly_interest", "monthly_interest_due", "interest_due"], 0)
        ) || (amount && rate ? (amount * rate) / 100 : 0);

        const paid = num(getValue(item, ["interest_paid", "paid_interest"], 0));
        const earned = getInterest(item);
        const pending = num(
          getValue(item, ["interest_pending", "pending_interest", "interest_balance"], 0)
        ) || Math.max(0, earned - paid);

        return { item, monthly, paid, earned, pending, rate };
      })
      .sort((a, b) => b.monthly - a.monthly);
  }, [filteredRecords]);

  const branchRows = useMemo(() => {
    const map = new Map();

    filteredRecords.forEach((item) => {
      const key = getBranch(item);
      if (!map.has(key)) {
        map.set(key, {
          branch: key,
          investors: new Set(),
          investments: 0,
          principal: 0,
          active: 0,
          pending: 0,
          rejected: 0,
          settled: 0,
          interest: 0,
        });
      }

      const row = map.get(key);
      row.investors.add(getInvestorId(item));
      row.investments += 1;
      row.principal += getAmount(item);
      row.interest += getInterest(item);

      const s = normalizeStatus(getStatus(item));
      if (s.includes("active") || s.includes("approved")) row.active += 1;
      if (s.includes("pending")) row.pending += 1;
      if (s.includes("reject")) row.rejected += 1;
      if (s.includes("closed") || s.includes("settled") || s.includes("mature")) row.settled += 1;
    });

    return [...map.values()]
      .map((x) => ({ ...x, investors: x.investors.size }))
      .sort((a, b) => b.principal - a.principal);
  }, [filteredRecords]);

  const monthlyRows = useMemo(() => {
    const map = new Map();

    filteredRecords.forEach((item) => {
      const d = dateValue(getInvestmentDate(item));
      if (!d) return;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          month: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
          investors: new Set(),
          investments: 0,
          principal: 0,
          interest: 0,
          settled: 0,
        });
      }

      const row = map.get(key);
      row.investors.add(getInvestorId(item));
      row.investments += 1;
      row.principal += getAmount(item);
      row.interest += getInterest(item);

      const s = normalizeStatus(getStatus(item));
      if (s.includes("closed") || s.includes("settled") || s.includes("mature")) row.settled += getAmount(item);
    });

    return [...map.values()]
      .map((x) => ({ ...x, investors: x.investors.size }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [filteredRecords]);

  const attentionRows = useMemo(() => {
    const rows = [];

    filteredRecords.forEach((item) => {
      const s = normalizeStatus(getStatus(item));
      const maturity = calculatedMaturity(item);
      const days = daysUntil(maturity);

      if (s.includes("pending")) {
        rows.push({ type: "Pending Approval", item, priority: 1, detail: "Requires admin review" });
      }

      if (days !== null && days < 0 && !s.includes("closed") && !s.includes("settled")) {
        rows.push({ type: "Overdue Maturity", item, priority: 0, detail: `${Math.abs(days)} day(s) overdue` });
      } else if (days !== null && days <= 7 && days >= 0 && !s.includes("closed")) {
        rows.push({ type: "Maturity Soon", item, priority: 2, detail: `${days} day(s) remaining` });
      }

      const pendingInterest = num(getValue(item, ["interest_pending", "pending_interest", "interest_balance"], 0));
      if (pendingInterest > 0) {
        rows.push({ type: "Interest Pending", item, priority: 1, detail: formatINR(pendingInterest) });
      }
    });

    return rows.sort((a, b) => a.priority - b.priority).slice(0, 8);
  }, [filteredRecords]);

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "investments", label: "Investments", icon: Wallet },
    { id: "investors", label: "Investors", icon: Users },
    { id: "maturity", label: "Maturity", icon: CalendarClock },
    { id: "interest", label: "Interest", icon: Percent },
    { id: "settlement", label: "Settlement", icon: CheckCircle2 },
    { id: "branches", label: "Branches", icon: Building2 },
    { id: "monthly", label: "Monthly", icon: TrendingUp },
    { id: "extensions", label: "Extensions", icon: Clock3 },
  ];

  const exportRows = (rows, filename) => {
    if (!rows.length) return;
    exportReportCSV(rows, filename);
  };

  const exportCurrentReport = () => {
    if (activeTab === "investors") {
      exportRows(
        investorRows.map((x) => ({
          Investor_ID: x.investorId,
          Investor: x.investor,
          Branch: x.branch,
          Investments: x.investments,
          Total_Principal: x.total,
          Interest_Earned: x.interest,
          Active: x.active,
          Pending: x.pending,
          Rejected: x.rejected,
          Settled: x.settled,
        })),
        "investor-report.csv"
      );
      return;
    }

    if (activeTab === "branches") {
      exportRows(
        branchRows.map((x) => ({
          Branch: x.branch,
          Investors: x.investors,
          Investments: x.investments,
          Principal: x.principal,
          Active: x.active,
          Pending: x.pending,
          Rejected: x.rejected,
          Settled: x.settled,
          Interest: x.interest,
        })),
        "branch-report.csv"
      );
      return;
    }

    if (activeTab === "monthly") {
      exportRows(
        monthlyRows.map((x) => ({
          Month: x.month,
          Investors: x.investors,
          Investments: x.investments,
          Principal: x.principal,
          Interest: x.interest,
          Settled: x.settled,
        })),
        "monthly-report.csv"
      );
      return;
    }

    if (activeTab === "maturity") {
      exportRows(
        maturityRows.map(({ item, maturity, days }, index) => ({
          Investment_ID: getInvestmentId(item, index),
          Investor: getInvestorName(item),
          Principal: getAmount(item),
          Rate: getRate(item),
          Maturity_Date: maturity?.toISOString() || "",
          Days_Remaining: days,
          Status: getStatus(item),
        })),
        "maturity-report.csv"
      );
      return;
    }

    exportRows(
      filteredRecords.map((item, index) => ({
        Investment_ID: getInvestmentId(item, index),
        Investor_ID: getInvestorId(item),
        Investor: getInvestorName(item),
        Branch: getBranch(item),
        Amount: getAmount(item),
        Interest_Rate: getRate(item),
        Investment_Date: getInvestmentDate(item),
        Maturity_Date: calculatedMaturity(item)?.toISOString() || "",
        Status: getStatus(item),
        Interest: getInterest(item),
      })),
      `${csvSafeName(activeTab)}-report.csv`
    );
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <RefreshCw size={24} className="reports-spinner" />
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="reports-page">


      <div className="reports-stat-grid">
        <StatCard label="TOTAL INVESTORS" value={formatNumber(metrics.totalInvestors)} subtitle="Registered investors" icon={Users} tone="blue" />
        <StatCard label="TOTAL INVESTMENTS" value={formatNumber(metrics.totalInvestments)} subtitle="Investment records" icon={TrendingUp} tone="indigo" />
        <StatCard label="TOTAL PORTFOLIO" value={formatINRCompact(metrics.totalInvested)} subtitle="Principal value" icon={Wallet} tone="purple" />
        <StatCard label="ACTIVE PORTFOLIO" value={formatINRCompact(metrics.activeAmount)} subtitle={`${metrics.activeCount} active investments`} icon={CheckCircle2} tone="green" />
        <StatCard label="PENDING VALUE" value={formatINRCompact(metrics.pendingAmount)} subtitle={`${metrics.pendingCount} awaiting action`} icon={Clock3} tone="amber" />
        <StatCard label="INTEREST" value={formatINRCompact(metrics.interest)} subtitle="Reported interest" icon={Percent} tone="teal" />
      </div>

      <div className="reports-filter-card">
        <div className="reports-filter-grid">
          <label className="reports-input reports-input--search">
            <Search size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search investor, investment ID..."
            />
          </label>

          <div className="reports-view-select">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              aria-label="Select report"
            >
              {tabs.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <select value={branch} onChange={(e) => setBranch(e.target.value)} aria-label="Branch">
            <option value="all">All Branches</option>
            {branches.map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="approved">Approved</option>
            <option value="pending approval">Pending Approval</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
            <option value="settled">Settled</option>
          </select>

          <input
            className="reports-date-input"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="From date"
          />

          <input
            className="reports-date-input"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="To date"
          />
        </div>
      </div>

      {error && (
        <div className="reports-error">
          <AlertCircle size={17} />
          <span>{error}</span>
          <button onClick={() => loadReports()}>Try Again</button>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="reports-overview">
                    <section className="reports-panel">
            <div className="reports-panel-head">
              <div>
                <span>RECENT INVESTMENTS</span>
                <h2>Latest investment activity</h2>
              </div>
              <button className="reports-link-btn" onClick={() => setActiveTab("investments")}>Open full report <ChevronRight size={14} /></button>
            </div>
            <InvestmentTable rows={filteredRecords.slice(0, 8)} onView={setSelectedItem} />
          </section>
         

          <div className="reports-overview-grid">
            <section className="reports-panel">
              <div className="reports-panel-head">
                <div>
                  <span>PORTFOLIO STATUS</span>
                  <h2>Where the money is</h2>
                </div>
              </div>
              <div className="reports-status-bars">
                <div><span><b>Active</b><em>{formatINR(metrics.activeAmount)}</em></span><i><b style={{ width: `${metrics.totalInvested ? Math.min(100, metrics.activeAmount / metrics.totalInvested * 100) : 0}%` }} /></i></div>
                <div><span><b>Pending</b><em>{formatINR(metrics.pendingAmount)}</em></span><i><b style={{ width: `${metrics.totalInvested ? Math.min(100, metrics.pendingAmount / metrics.totalInvested * 100) : 0}%` }} /></i></div>
                <div><span><b>Settled</b><em>{formatINR(metrics.settledAmount)}</em></span><i><b style={{ width: `${metrics.totalInvested ? Math.min(100, metrics.settledAmount / metrics.totalInvested * 100) : 0}%` }} /></i></div>
                <div><span><b>Rejected</b><em>{formatINR(metrics.rejectedAmount)}</em></span><i><b style={{ width: `${metrics.totalInvested ? Math.min(100, metrics.rejectedAmount / metrics.totalInvested * 100) : 0}%` }} /></i></div>
              </div>
            </section>

            <section className="reports-panel">
              <div className="reports-panel-head">
                <div>
                  <span>ACTION REQUIRED</span>
                  <h2>Items needing attention</h2>
                </div>
                <button onClick={() => setActiveTab("maturity")} className="reports-link-btn">View report <ChevronRight size={14} /></button>
              </div>

              <div className="reports-attention">
                {attentionRows.length === 0 ? (
                  <div className="reports-empty-small">No immediate attention items found.</div>
                ) : (
                  attentionRows.map((row, index) => (
                    <button key={`${row.type}-${index}`} className="reports-attention-row" onClick={() => setSelectedItem(row.item)}>
                      <span className={`reports-attention-dot reports-attention-dot--${row.priority === 0 ? "red" : row.priority === 1 ? "amber" : "blue"}`} />
                      <div>
                        <strong>{row.type}</strong>
                        <small>{getInvestorName(row.item)} · {getInvestmentId(row.item, index)}</small>
                      </div>
                      <em>{row.detail}</em>
                    </button>
                  ))
                )}
              </div>
            </section>
          </div>


        </div>
      )}

      {activeTab === "investments" && (
        <section className="reports-panel reports-table-panel">
          <PanelTitle title="Investment Report" subtitle={`${filteredRecords.length} records matching the current filters`} onExport={exportCurrentReport} />
          <InvestmentTable rows={filteredRecords} onView={setSelectedItem} />
        </section>
      )}

      {activeTab === "investors" && (
        <section className="reports-panel reports-table-panel">
          <PanelTitle title="Investor Portfolio Report" subtitle={`${investorRows.length} investors grouped from investment records`} onExport={exportCurrentReport} />
          <div className="reports-table-scroll">
            <table className="reports-table">
              <thead><tr><th>INVESTOR</th><th>BRANCH</th><th>INVESTMENTS</th><th>TOTAL PRINCIPAL</th><th>INTEREST</th><th>ACTIVE</th><th>PENDING</th><th>REJECTED</th><th>SETTLED</th><th>ACTION</th></tr></thead>
              <tbody>
                {investorRows.length === 0 ? <EmptyRow colSpan={10} /> : investorRows.map((row) => (
                  <tr key={row.id}>
                    <td><div className="reports-person"><span>{row.investor.charAt(0).toUpperCase()}</span><div><strong>{row.investor}</strong><small>{row.investorId}</small></div></div></td>
                    <td>{row.branch}</td>
                    <td><b className="reports-number-badge">{row.investments}</b></td>
                    <td><strong>{formatINR(row.total)}</strong></td>
                    <td className="reports-green-text">{formatINR(row.interest)}</td>
                    <td><StatusCount tone="green" value={row.active} /></td>
                    <td><StatusCount tone="amber" value={row.pending} /></td>
                    <td><StatusCount tone="red" value={row.rejected} /></td>
                    <td><StatusCount tone="gray" value={row.settled} /></td>
                    <td><button className="reports-action-btn" onClick={() => setSelectedItem({ investorRow: row })}>View Portfolio</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "maturity" && (
        <section className="reports-panel reports-table-panel">
          <PanelTitle title="Maturity Report" subtitle="Upcoming, due and overdue investments" onExport={exportCurrentReport} />
          <div className="reports-maturity-summary">
            <MiniMetric label="Overdue" value={maturityRows.filter((x) => x.days < 0).length} tone="red" />
            <MiniMetric label="Next 7 Days" value={maturityRows.filter((x) => x.days >= 0 && x.days <= 7).length} tone="amber" />
            <MiniMetric label="8–30 Days" value={maturityRows.filter((x) => x.days > 7 && x.days <= 30).length} tone="blue" />
            <MiniMetric label="31+ Days" value={maturityRows.filter((x) => x.days > 30).length} tone="green" />
          </div>
          <div className="reports-table-scroll">
            <table className="reports-table">
              <thead><tr><th>INVESTMENT</th><th>INVESTOR</th><th>PRINCIPAL</th><th>RATE</th><th>MATURITY</th><th>DAYS</th><th>SETTLEMENT VALUE</th><th>STATUS</th></tr></thead>
              <tbody>
                {maturityRows.length === 0 ? <EmptyRow colSpan={8} /> : maturityRows.map(({ item, maturity, days }, index) => (
                  <tr key={getInvestmentId(item, index)}>
                    <td><strong>{getInvestmentId(item, index)}</strong></td>
                    <td>{getInvestorName(item)}</td>
                    <td>{formatINR(getAmount(item))}</td>
                    <td>{getRate(item)}%</td>
                    <td>{formatDate(maturity)}</td>
                    <td><span className={`reports-days reports-days--${days < 0 ? "red" : days <= 7 ? "amber" : "green"}`}>{days < 0 ? `${Math.abs(days)} overdue` : `${days} days`}</span></td>
                    <td>{formatINR(getAmount(item) + getInterest(item))}</td>
                    <td><StatusBadge status={getStatus(item)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "interest" && (
        <section className="reports-panel reports-table-panel">
          <PanelTitle title="Interest Report" subtitle="Monthly interest and reported interest position" onExport={exportCurrentReport} />
          <div className="reports-maturity-summary">
            <MiniMetric label="Monthly Interest" value={formatINR(metrics.monthlyInterest)} tone="blue" />
            <MiniMetric label="Reported Interest" value={formatINR(metrics.interest)} tone="green" />
            <MiniMetric label="Records" value={interestRows.length} tone="purple" />
          </div>
          <div className="reports-table-scroll">
            <table className="reports-table">
              <thead><tr><th>INVESTOR</th><th>INVESTMENT</th><th>PRINCIPAL</th><th>RATE</th><th>MONTHLY INTEREST</th><th>REPORTED INTEREST</th><th>PAID</th><th>PENDING</th><th>STATUS</th></tr></thead>
              <tbody>
                {interestRows.length === 0 ? <EmptyRow colSpan={9} /> : interestRows.map(({ item, monthly, paid, earned, pending, rate }, index) => (
                  <tr key={getInvestmentId(item, index)}>
                    <td>{getInvestorName(item)}</td>
                    <td><strong>{getInvestmentId(item, index)}</strong></td>
                    <td>{formatINR(getAmount(item))}</td>
                    <td>{rate}%</td>
                    <td className="reports-blue-text">{formatINR(monthly)}</td>
                    <td>{formatINR(earned)}</td>
                    <td className="reports-green-text">{formatINR(paid)}</td>
                    <td className={pending > 0 ? "reports-red-text" : ""}>{formatINR(pending)}</td>
                    <td><StatusBadge status={getStatus(item)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "settlement" && (
        <section className="reports-panel reports-table-panel">
          <PanelTitle title="Settlement Report" subtitle="Matured and settled investment positions" onExport={exportCurrentReport} />
          <div className="reports-maturity-summary">
            <MiniMetric label="Settled Principal" value={formatINR(metrics.settledAmount)} tone="green" />
            <MiniMetric label="Pending Principal" value={formatINR(metrics.pendingAmount)} tone="amber" />
            <MiniMetric label="Settled Records" value={metrics.settledCount} tone="blue" />
          </div>
          <div className="reports-table-scroll">
            <table className="reports-table">
              <thead><tr><th>INVESTMENT</th><th>INVESTOR</th><th>PRINCIPAL</th><th>INTEREST</th><th>TOTAL VALUE</th><th>MATURITY</th><th>STATUS</th></tr></thead>
              <tbody>
                {filteredRecords.length === 0 ? <EmptyRow colSpan={7} /> : filteredRecords.map((item, index) => (
                  <tr key={getInvestmentId(item, index)}>
                    <td><strong>{getInvestmentId(item, index)}</strong></td>
                    <td>{getInvestorName(item)}</td>
                    <td>{formatINR(getAmount(item))}</td>
                    <td className="reports-green-text">{formatINR(getInterest(item))}</td>
                    <td><strong>{formatINR(getAmount(item) + getInterest(item))}</strong></td>
                    <td>{formatDate(calculatedMaturity(item))}</td>
                    <td><StatusBadge status={getStatus(item)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "branches" && (
        <section className="reports-panel reports-table-panel">
          <PanelTitle title="Branch Performance Report" subtitle="Investment activity grouped by branch" onExport={exportCurrentReport} />
          <div className="reports-table-scroll">
            <table className="reports-table">
              <thead><tr><th>BRANCH</th><th>INVESTORS</th><th>INVESTMENTS</th><th>PRINCIPAL</th><th>ACTIVE</th><th>PENDING</th><th>REJECTED</th><th>SETTLED</th><th>INTEREST</th></tr></thead>
              <tbody>
                {branchRows.length === 0 ? <EmptyRow colSpan={9} /> : branchRows.map((row) => (
                  <tr key={row.branch}>
                    <td><div className="reports-branch"><Building2 size={15} /><strong>{row.branch}</strong></div></td>
                    <td>{row.investors}</td>
                    <td>{row.investments}</td>
                    <td><strong>{formatINR(row.principal)}</strong></td>
                    <td><StatusCount tone="green" value={row.active} /></td>
                    <td><StatusCount tone="amber" value={row.pending} /></td>
                    <td><StatusCount tone="red" value={row.rejected} /></td>
                    <td><StatusCount tone="gray" value={row.settled} /></td>
                    <td className="reports-green-text">{formatINR(row.interest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "monthly" && (
        <section className="reports-panel reports-table-panel">
          <PanelTitle title="Monthly Business Report" subtitle="Monthly investment activity from available investment dates" onExport={exportCurrentReport} />
          <div className="reports-table-scroll">
            <table className="reports-table">
              <thead><tr><th>MONTH</th><th>INVESTORS</th><th>INVESTMENTS</th><th>NEW PRINCIPAL</th><th>INTEREST</th><th>SETTLED VALUE</th></tr></thead>
              <tbody>
                {monthlyRows.length === 0 ? <EmptyRow colSpan={6} /> : monthlyRows.map((row) => (
                  <tr key={row.key}>
                    <td><strong>{row.month}</strong></td>
                    <td>{row.investors}</td>
                    <td>{row.investments}</td>
                    <td><strong>{formatINR(row.principal)}</strong></td>
                    <td className="reports-green-text">{formatINR(row.interest)}</td>
                    <td>{formatINR(row.settled)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "extensions" && (
        <section className="reports-panel reports-empty-feature">
          <div className="reports-feature-icon"><Clock3 size={25} /></div>
          <h2>Tenure Extension Report</h2>
          <p>Your current report API does not expose tenure-extension records. The UI is ready for the dedicated extension endpoint without changing the rest of the report flow.</p>
          <div className="reports-feature-note">Recommended endpoint: <b>/api/admin/reports/tenure-extensions</b></div>
        </section>
      )}

      {selectedItem && (
        <div className="reports-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setSelectedItem(null)}>
          <div className="reports-modal">
            <div className="reports-modal-head">
              <div>
                <span>REPORT DETAILS</span>
                <h2>{selectedItem.investorRow ? selectedItem.investorRow.investor : getInvestorName(selectedItem)}</h2>
                <p>{selectedItem.investorRow ? selectedItem.investorRow.investorId : getInvestmentId(selectedItem)}</p>
              </div>
              <button onClick={() => setSelectedItem(null)}><X size={18} /></button>
            </div>

            {selectedItem.investorRow ? (
              <div className="reports-investor-detail">
                <div className="reports-detail-cards">
                  <MiniMetric label="Investments" value={selectedItem.investorRow.investments} tone="blue" />
                  <MiniMetric label="Principal" value={formatINR(selectedItem.investorRow.total)} tone="purple" />
                  <MiniMetric label="Interest" value={formatINR(selectedItem.investorRow.interest)} tone="green" />
                  <MiniMetric label="Active" value={selectedItem.investorRow.active} tone="teal" />
                </div>
                <InvestmentTable rows={selectedItem.investorRow.items} onView={() => {}} />
              </div>
            ) : (
              <div className="reports-detail-grid">
                <Detail label="Investor" value={getInvestorName(selectedItem)} />
                <Detail label="Investor ID" value={getInvestorId(selectedItem)} />
                <Detail label="Investment ID" value={getInvestmentId(selectedItem)} />
                <Detail label="Branch" value={getBranch(selectedItem)} />
                <Detail label="Principal" value={formatINR(getAmount(selectedItem))} />
                <Detail label="Interest Rate" value={`${getRate(selectedItem)}%`} />
                <Detail label="Investment Date" value={formatDate(getInvestmentDate(selectedItem))} />
                <Detail label="Maturity Date" value={formatDate(calculatedMaturity(selectedItem))} />
                <Detail label="Interest" value={formatINR(getInterest(selectedItem))} />
                <Detail label="Status" value={<StatusBadge status={getStatus(selectedItem)} />} />
              </div>
            )}

            <div className="reports-modal-footer">
              <button className="reports-action-btn reports-action-btn--dark" onClick={() => setSelectedItem(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PanelTitle({ title, subtitle, onExport }) {
  return (
    <div className="reports-panel-head reports-panel-head--table">
      <div>
        <span>REPORT</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <button className="reports-export-btn" onClick={onExport}>
        <Download size={14} />
        Export CSV
      </button>
    </div>
  );
}

function InvestmentTable({ rows, onView }) {
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
          {rows.length === 0 ? (
            <EmptyRow colSpan={10} />
          ) : (
            rows.map((item, index) => (
              <tr key={`${getInvestmentId(item, index)}-${index}`}>
                <td><strong>{getInvestmentId(item, index)}</strong></td>
                <td><div className="reports-person"><span>{getInvestorName(item).charAt(0).toUpperCase()}</span><div><strong>{getInvestorName(item)}</strong><small>{getInvestorId(item)}</small></div></div></td>
                <td>{getBranch(item)}</td>
                <td><strong>{formatINR(getAmount(item))}</strong></td>
                <td>{getRate(item)}%</td>
                <td>{formatDate(getInvestmentDate(item))}</td>
                <td>{formatDate(calculatedMaturity(item))}</td>
                <td className="reports-green-text">{formatINR(getInterest(item))}</td>
                <td><StatusBadge status={getStatus(item)} /></td>
                <td><button className="reports-icon-action" title="View details" onClick={() => onView(item)}>View</button></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function MiniMetric({ label, value, tone }) {
  return (
    <div className={`reports-mini-metric reports-mini-metric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusCount({ tone, value }) {
  return <span className={`reports-count reports-count--${tone}`}>{value}</span>;
}

function Detail({ label, value }) {
  return (
    <div className="reports-detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyRow({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="reports-empty-row">
        No records found for the selected filters.
      </td>
    </tr>
  );
}