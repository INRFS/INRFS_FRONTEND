import React, { useState } from "react";
import "../../Styles/SuperAdmin/AuditLogs.css";

const MOCK_LOGS = [
  { id: 1, timestamp: "2025-07-22T14:30:00", user: "Ravi Mehta", role: "Admin", action: "KYC Approved", status: "Success" },
  { id: 2, timestamp: "2025-07-22T14:00:00", user: "Kishore Nair", role: "Branch Manager", action: "Investment Added", status: "Success" },
  { id: 3, timestamp: "2025-07-22T13:30:00", user: "Super Admin", role: "Super Admin", action: "Login", status: "Success" },
  { id: 4, timestamp: "2025-07-22T13:00:00", user: "Priya Patel", role: "Investor", action: "Settings Updated", status: "Success" },
  { id: 5, timestamp: "2025-07-22T12:30:00", user: "System", role: "System", action: "Backup Run", status: "Failed" },
  { id: 6, timestamp: "2025-07-22T12:00:00", user: "Ravi Mehta", role: "Admin", action: "Interest Paid", status: "Success" },
  { id: 7, timestamp: "2025-07-22T11:30:00", user: "Kishore Nair", role: "Branch Manager", action: "KYC Approved", status: "Success" },
  { id: 8, timestamp: "2025-07-22T11:00:00", user: "Super Admin", role: "Super Admin", action: "Investment Added", status: "Success" },
  { id: 9, timestamp: "2025-07-22T10:30:00", user: "Priya Patel", role: "Investor", action: "Login", status: "Success" },
  { id: 10, timestamp: "2025-07-22T10:00:00", user: "System", role: "System", action: "Settings Updated", status: "Success" },
  { id: 11, timestamp: "2025-07-22T09:30:00", user: "Ravi Mehta", role: "Admin", action: "KYC Approved", status: "Success" },
  { id: 12, timestamp: "2025-07-22T09:00:00", user: "Kishore Nair", role: "Branch Manager", action: "Investment Added", status: "Success" },
  { id: 13, timestamp: "2025-07-22T08:30:00", user: "Super Admin", role: "Super Admin", action: "Login", status: "Success" },
  { id: 14, timestamp: "2025-07-22T08:00:00", user: "Priya Patel", role: "Investor", action: "Settings Updated", status: "Success" },
  { id: 15, timestamp: "2025-07-22T07:30:00", user: "System", role: "System", action: "Backup Run", status: "Success" },
  { id: 16, timestamp: "2025-07-21T18:00:00", user: "Ravi Mehta", role: "Admin", action: "Interest Paid", status: "Success" },
  { id: 17, timestamp: "2025-07-21T17:30:00", user: "Kishore Nair", role: "Branch Manager", action: "KYC Approved", status: "Failed" },
  { id: 18, timestamp: "2025-07-21T17:00:00", user: "Super Admin", role: "Super Admin", action: "Investment Added", status: "Success" },
  { id: 19, timestamp: "2025-07-21T16:30:00", user: "Priya Patel", role: "Investor", action: "Login", status: "Success" },
  { id: 20, timestamp: "2025-07-21T16:00:00", user: "System", role: "System", action: "Settings Updated", status: "Success" },
];

const PAGE_SIZE = 10;

function formatTimestamp(iso) {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timePart = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${datePart}, ${timePart}`;
}

function roleBadgeClass(role) {
  return "al-role-badge";
}

function statusBadgeClass(status) {
  return status === "Success" ? "al-status-badge al-status-success" : "al-status-badge al-status-failed";
}

export default function AuditLogs() {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(MOCK_LOGS.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = MOCK_LOGS.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  return (
    <div className="al-page">
      <div className="al-page-head">
        <h1>Audit Logs</h1>
      </div>

      <div className="al-card">
        <div className="al-table-wrap">
          <table className="al-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((log) => (
                <tr key={log.id}>
                  <td className="al-timestamp">{formatTimestamp(log.timestamp)}</td>
                  <td className="al-user">{log.user}</td>
                  <td>
                    <span className={roleBadgeClass(log.role)}>{log.role}</span>
                  </td>
                  <td className="al-action">{log.action}</td>
                  <td>
                    <span className={statusBadgeClass(log.status)}>{log.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="al-footer">
          <span className="al-footer-text">
            Showing {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, MOCK_LOGS.length)} of {MOCK_LOGS.length} records
          </span>
          <div className="al-pagination">
            <button
              type="button"
              className="al-page-btn"
              disabled={pageSafe === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            <span className="al-page-current">{pageSafe}</span>
            <button
              type="button"
              className="al-page-btn"
              disabled={pageSafe === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}