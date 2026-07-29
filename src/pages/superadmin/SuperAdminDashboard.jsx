import React from "react";
import {
  Building2,
  Shield,
  Users,
  DollarSign,
  Activity,
  CheckCircle2,
  KeyRound,
  Settings,
} from "lucide-react";
import "../../Styles/SuperAdmin/SuperAdminLayout.css";

const stats = [
  { label: "TOTAL BRANCHES", value: "14", icon: Building2, tint: "sa-tint-blue" },
  { label: "TOTAL ADMINS", value: "28", icon: Shield, tint: "sa-tint-purple" },
  { label: "TOTAL INVESTORS", value: "1,247", icon: Users, tint: "sa-tint-green" },
  { label: "SYSTEM AUM", value: "₹58.4Cr", icon: DollarSign, tint: "sa-tint-green" },
  { label: "ACTIVE SESSIONS", value: "42", icon: Activity, tint: "sa-tint-orange" },
];

const panels = [
  {
    title: "Branch Management",
    icon: Building2,
    tint: "sa-tint-blue",
    actions: ["Add Branch", "Edit Branch", "View Performance", "Assign Admin"],
  },
  {
    title: "Admin Management",
    icon: Shield,
    tint: "sa-tint-blue",
    actions: ["Create Admin", "Assign Role", "Reset Password", "Deactivate"],
  },
  {
    title: "Roles & Permissions",
    icon: KeyRound,
    tint: "sa-tint-blue",
    actions: ["Create Role", "Edit Permissions", "Assign Role", "Audit Roles"],
  },
  {
    title: "System Config",
    icon: Settings,
    tint: "sa-tint-blue",
    actions: ["App Settings", "Email Config", "SMS Config", "Backup"],
  },
];

const auditLogs = [
  { time: "22 Jul 2025, 14:32", user: "Ravi Mehta", role: "Admin", action: "KYC Approved — INV002", status: "Success" },
  { time: "22 Jul 2025, 13:15", user: "Kishore Nair", role: "Branch Mgr", action: "Investment Added", status: "Success" },
  { time: "22 Jul 2025, 12:00", user: "Super Admin", role: "Super Admin", action: "Role Updated", status: "Success" },
  { time: "22 Jul 2025, 10:45", user: "Unknown", role: "—", action: "Failed Login Attempt", status: "Failed" },
];

export default function SuperAdminDashboard() {
  return (
    <div className="sa-dashboard">
      <div className="sa-page-head">
        <h1>Super Admin Dashboard</h1>
        <p>Complete system oversight and configuration</p>
      </div>

      <div className="sa-stat-grid">
        {stats.map(({ label, value, icon: Icon, tint }) => (
          <div className="sa-stat-card" key={label}>
            <div className="sa-stat-card-top">
              <span className="sa-stat-label">{label}</span>
              <span className={`sa-stat-icon ${tint}`}>
                <Icon size={16} />
              </span>
            </div>
            <div className="sa-stat-value">{value}</div>
          </div>
        ))}
        <div className="sa-stat-card">
          <div className="sa-stat-card-top">
            <span className="sa-stat-label">SYSTEM HEALTH</span>
            <span className="sa-stat-icon sa-tint-green">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <div className="sa-stat-value">99.9%</div>
        </div>
      </div>

      <div className="sa-panel-grid">
        {panels.map(({ title, icon: Icon, tint, actions }) => (
          <div className="sa-panel" key={title}>
            <div className="sa-panel-head">
              <div className="sa-panel-head-left">
                <span className={`sa-panel-icon ${tint}`}>
                  <Icon size={16} />
                </span>
                <h3>{title}</h3>
              </div>
              <button className="sa-btn sa-btn--outline">Manage</button>
            </div>
            <div className="sa-panel-actions">
              {actions.map((action) => (
                <button className="sa-action-btn" key={action}>
                  {action}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sa-audit-card">
        <div className="sa-audit-head">
          <h3>Recent Audit Logs</h3>
          <button className="sa-btn sa-btn--outline">View All</button>
        </div>
        <table className="sa-audit-table">
          <thead>
            <tr>
              <th>TIMESTAMP</th>
              <th>USER</th>
              <th>ROLE</th>
              <th>ACTION</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log, i) => (
              <tr key={i}>
                <td className="mono">{log.time}</td>
                <td>{log.user}</td>
                <td>
                  <span className="sa-role-pill">{log.role}</span>
                </td>
                <td>{log.action}</td>
                <td>
                  <span
                    className={
                      "sa-status-pill " +
                      (log.status === "Success" ? "sa-status-success" : "sa-status-failed")
                    }
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}