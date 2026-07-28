import React from "react";
import { Bell, LogOut } from "lucide-react";
import "./shared.css"

export function formatINR(n) {
    return "₹" + Number(n || 0).toLocaleString("en-IN");
}


const statusStyleMap = {
    Approved: { bg: "#dcfce7", color: "#16a34a" },
    Verified: { bg: "#dcfce7", color: "#16a34a" },
    Active: { bg: "#dcfce7", color: "#16a34a" },
    Completed: { bg: "#dcfce7", color: "#16a34a" },
    Pending: { bg: "#fef3c7", color: "#d97706" },
    "Pending Approval": { bg: "#fef3c7", color: "#d97706" },
    Rejected: { bg: "#fee2e2", color: "#dc2626" },
    Matured: { bg: "#eef1ff", color: "#2f5cf0" },
};

export function StatusBadge({ status }) {
    const style = statusStyleMap[status] || { bg: "#f1f5f9", color: "#64748b" };
    return (
        <span
            style={{
                display: "inline-block",
                background: style.bg,
                color: style.color,
                fontSize: "11px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "999px",
                whiteSpace: "nowrap",
            }}
        >
            {status}
        </span>
    );
}

export function StatCard({ label, value, accent }) {
    return (
        <div className="stat-card">
            <p className="stat-card__label">{label}</p>
            <p className={`stat-card__value ${accent ? "stat-card__value--accent" : ""}`}>{value}</p>
        </div>
    );
}
export default function Sidebar({ items = [], active, onSelect, footerLabel, onLogout }) {
    return (
        <div className="sidebar">
            <div>
                <div className="sidebar__header">
                    <p className="sidebar__title">INFRS</p>
                    <p className="sidebar__subtitle">{footerLabel}</p>
                </div>
                <nav className="sidebar__nav">
                    {items.map((item) => (
                        <button key={item.key} onClick={() => onSelect(item.key)} className={`sidebar__item ${active === item.key ? "sidebar__item--active" : ""}`}>
                            <item.icon size={16} />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>
            <button onClick={onLogout} className="sidebar__logout">
                <LogOut size={16} />Log Out
            </button>
        </div>
    );
}

export function TopBar({ title, subtitle }) {
    return (
        <div className="topbar">
            <div>
                <h1 className="topbar__title">{title}</h1>
                {subtitle && <p className="topbar__subtitle">{subtitle}</p>}
            </div>
            <div className="topbar__actions">
                <Bell size={18} color="#64748b" />
                <div className="topbar__avatar">{title[0]}</div>
            </div>
        </div>
    );
}