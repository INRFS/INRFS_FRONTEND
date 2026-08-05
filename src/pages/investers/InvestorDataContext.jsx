import React, { createContext, useContext, useMemo, useState } from "react";

const InvestorDataContext = createContext(null);

export function formatINR(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

const statusClassMap = {
  Active: "status-badge--active",
  Matured: "status-badge--completed",
  Completed: "status-badge--completed",
  Approved: "status-badge--approved",
  "Pending Approval": "status-badge--pending",
  Rejected: "status-badge--rejected",
};

export function StatusBadge({ status }) {
  const modifier = statusClassMap[status] || "status-badge--completed";
  return <span className={`status-badge ${modifier}`}>{status}</span>;
}

function formatDate(date) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function nextBondNumber(investments) {
  const year = new Date().getFullYear();
  const nums = investments
    .filter((inv) => inv.bond)
    .map((inv) => {
      const match = inv.bond.match(/BND-(\d{4})-(\d+)/);
      return match && Number(match[1]) === year ? Number(match[2]) : 0;
    });
  const max = nums.length ? Math.max(...nums) : 0;
  return `BND-${year}-${String(max + 1).padStart(3, "0")}`;
}

const initialInvestments = [
  {
    id: 1,
    bond: "BND-2025-001",
    amount: 500000,
    rateValue: 12,
    rate: "12% p.a.",
    tenure: 12,
    invested: "15 Jan 2025",
    matures: "15 Jan 2026",
    maturesTimestamp: new Date(2026, 0, 15).getTime(),
    monthlyInt: 5000,
    earned: 30000,
    status: "Active",
  },
  {
    id: 2,
    bond: "BND-2024-087",
    amount: 300000,
    rateValue: 11,
    rate: "11% p.a.",
    tenure: 12,
    invested: "10 Jun 2024",
    matures: "10 Jun 2025",
    maturesTimestamp: new Date(2025, 5, 10).getTime(),
    monthlyInt: 2750,
    earned: 33000,
    status: "Matured",
  },
];

const initialNotifications = [
  { id: 1, type: "success", title: "Investment Approved", body: "Your investment BND-2025-001 has been approved.", time: "2 hours ago", isNew: true },
  { id: 2, type: "info", title: "Bond Generated", body: "Bond BND-2025-001 has been generated.", time: "2 hours ago", isNew: true },
  { id: 3, type: "success", title: "Interest Credited", body: "₹5,000 monthly interest for June 2025 has been credited.", time: "5 days ago", isNew: false },
  { id: 4, type: "warning", title: "Upcoming Maturity", body: "Bond BND-2024-087 matures in 30 days. Plan your renewal.", time: "1 week ago", isNew: false },
  { id: 5, type: "info", title: "Email Confirmation", body: "Email confirmation sent to arjun@email.com for investment.", time: "2 weeks ago", isNew: false },
];

export function InvestorDataProvider({ children }) {
  const [investments, setInvestments] = useState(initialInvestments);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [lastCreated, setLastCreated] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  const addInvestment = ({ amount, rateValue, tenure, utr, status }) => {
    const isPending = status === "pending" || status === "Pending Approval";
    const finalStatus = isPending ? "Pending Approval" : "Active";

    const today = new Date();
    const maturityDate = new Date(today);
    maturityDate.setMonth(maturityDate.getMonth() + tenure);

    const monthlyInt = Math.round(amount * (rateValue / 100));
    const bond = isPending ? null : nextBondNumber(investments);

    const newInvestment = {
      id: Date.now(),
      bond,
      amount,
      rateValue,
      rate: isPending ? `${rateValue}% p.m. (initial)` : `${rateValue}% p.m.`,
      tenure,
      invested: formatDate(today),
      matures: isPending ? null : formatDate(maturityDate),
      maturesTimestamp: isPending ? null : maturityDate.getTime(),
      monthlyInt,
      earned: 0,
      status: finalStatus,
      utr: utr || null,
    };

    setInvestments((prev) => [newInvestment, ...prev]);

    setNotifications((prev) => [
      {
        id: Date.now() + 1,
        type: isPending ? "info" : "success",
        title: isPending ? "Investment Submitted" : "Investment Approved",
        body: isPending
          ? `Your investment of ₹${amount.toLocaleString("en-IN")} has been submitted and is pending admin approval.`
          : `Your investment of ₹${amount.toLocaleString("en-IN")} (${bond}) has been approved.`,
        time: "Just now",
        isNew: true,
      },
      ...prev,
    ]);

    setLastCreated(newInvestment);
    return newInvestment;
  };

  const approveInvestment = (investmentId, { finalRateValue } = {}) => {
    setInvestments((prev) =>
      prev.map((inv) => {
        if (inv.id !== investmentId) return inv;

        const rateValue = finalRateValue ?? inv.rateValue;
        const monthlyInt = Math.round(inv.amount * (rateValue / 100));
        const today = new Date();
        const maturityDate = new Date(today);
        maturityDate.setMonth(maturityDate.getMonth() + inv.tenure);

        return {
          ...inv,
          bond: inv.bond || nextBondNumber(prev),
          rateValue,
          rate: `${rateValue}% p.m.`,
          matures: formatDate(maturityDate),
          maturesTimestamp: maturityDate.getTime(),
          monthlyInt,
          status: "Active",
        };
      })
    );

    setNotifications((prev) => [
      {
        id: Date.now(),
        type: "success",
        title: "Investment Approved",
        body: "Your investment has been approved and activated. A bond certificate is now available.",
        time: "Just now",
        isNew: true,
      },
      ...prev,
    ]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isNew: false })));
  };

  const requestTenureExtension = (bondNumber, period) => {
    const investment = investments.find((inv) => inv.bond === bondNumber);
    if (!investment) {
      throw new Error(`Investment ${bondNumber} was not found.`);
    }
    if (investment.status === "Pending Approval") {
      throw new Error(`${bondNumber} already has a request awaiting admin approval.`);
    }

    const request = {
      id: Date.now(),
      bond: bondNumber,
      type: "Tenure Extension",
      period,
      status: "Pending Approval",
      requestedAt: new Date().toISOString(),
    };

    setPendingRequests((prev) => [request, ...prev]);

    setInvestments((prev) =>
      prev.map((inv) =>
        inv.bond === bondNumber ? { ...inv, status: "Pending Approval" } : inv
      )
    );

    setNotifications((prev) => [
      {
        id: Date.now() + 1,
        type: "info",
        title: "Tenure Extension Requested",
        body: `Your request to extend ${bondNumber} by ${period} has been sent to admin for approval.`,
        time: "Just now",
        isNew: true,
      },
      ...prev,
    ]);

    return request;
  };

  const requestSettlement = (bondNumber) => {
    const investment = investments.find((inv) => inv.bond === bondNumber);
    if (!investment) {
      throw new Error(`Investment ${bondNumber} was not found.`);
    }
    if (investment.status === "Pending Approval") {
      throw new Error(`${bondNumber} already has a request awaiting admin approval.`);
    }

    const request = {
      id: Date.now(),
      bond: bondNumber,
      type: "Settlement",
      status: "Pending Approval",
      requestedAt: new Date().toISOString(),
    };

    setPendingRequests((prev) => [request, ...prev]);

    setInvestments((prev) =>
      prev.map((inv) =>
        inv.bond === bondNumber ? { ...inv, status: "Pending Approval" } : inv
      )
    );

    setNotifications((prev) => [
      {
        id: Date.now() + 1,
        type: "info",
        title: "Settlement Requested",
        body: `Your settlement request for ${bondNumber} has been sent to admin for approval.`,
        time: "Just now",
        isNew: true,
      },
      ...prev,
    ]);

    return request;
  };

  const stats = useMemo(() => {
    const active = investments.filter((inv) => inv.status === "Active");
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalEarned = investments.reduce((sum, inv) => sum + inv.earned, 0);
    const monthlyPayout = active.reduce((sum, inv) => sum + inv.monthlyInt, 0);
    const portfolioValue = totalInvested + totalEarned;
    const nextMaturity = [...active].sort((a, b) => a.maturesTimestamp - b.maturesTimestamp)[0];
    const daysToMaturity = nextMaturity
      ? Math.max(0, Math.round((nextMaturity.maturesTimestamp - Date.now()) / 86400000))
      : null;

    return {
      totalInvested,
      totalEarned,
      activeCount: active.length,
      monthlyPayout,
      portfolioValue,
      nextMaturity,
      daysToMaturity,
    };
  }, [investments]);

  const value = {
    investments,
    notifications,
    addInvestment,
    approveInvestment,
    markAllNotificationsRead,
    stats,
    lastCreated,
    pendingRequests,
    requestTenureExtension,
    requestSettlement,
  };

  return <InvestorDataContext.Provider value={value}>{children}</InvestorDataContext.Provider>;
}

export function useInvestorData() {
  const ctx = useContext(InvestorDataContext);
  if (!ctx) throw new Error("useInvestorData must be used within InvestorDataProvider");
  return ctx;
}