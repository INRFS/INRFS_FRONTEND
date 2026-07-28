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
  const nums = investments.map((inv) => {
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

  const addInvestment = ({ amount, rateValue, tenure }) => {
    const today = new Date();
    const maturityDate = new Date(today);
    maturityDate.setMonth(maturityDate.getMonth() + tenure);

    const monthlyInt = Math.round((amount * (rateValue / 100)) / 12);
    const bond = nextBondNumber(investments);

    const newInvestment = {
      id: Date.now(),
      bond,
      amount,
      rateValue,
      rate: `${rateValue}% p.a.`,
      tenure,
      invested: formatDate(today),
      matures: formatDate(maturityDate),
      maturesTimestamp: maturityDate.getTime(),
      monthlyInt,
      earned: 0,
      status: "Active",
    };

    setInvestments((prev) => [newInvestment, ...prev]);

    setNotifications((prev) => [
      {
        id: Date.now() + 1,
        type: "success",
        title: "Investment Submitted",
        body: `Your investment of ₹${amount.toLocaleString("en-IN")} (${bond}) has been submitted and is being processed.`,
        time: "Just now",
        isNew: true,
      },
      {
        id: Date.now() + 2,
        type: "info",
        title: "Bond Generated",
        body: `Investment Bond ${bond} has been generated. You can download it from My Bonds.`,
        time: "Just now",
        isNew: true,
      },
      ...prev,
    ]);

    setLastCreated(newInvestment);
    return newInvestment;
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isNew: false })));
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
    markAllNotificationsRead,
    stats,
    lastCreated,
  };

  return <InvestorDataContext.Provider value={value}>{children}</InvestorDataContext.Provider>;
}

export function useInvestorData() {
  const ctx = useContext(InvestorDataContext);
  if (!ctx) throw new Error("useInvestorData must be used within InvestorDataProvider");
  return ctx;
}
