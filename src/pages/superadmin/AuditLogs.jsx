import React, { useState } from "react";
import "../../Styles/SuperAdmin/AuditLogs.css";

const LOGS = [
  { ts: "22 Jul 2025, 14:30", user: "Ravi Mehta", role: "Admin", action: "KYC Approved", status: "Success" },
  { ts: "22 Jul 2025, 14:00", user: "Kishore Nair", role: "Branch Manager", action: "Investment Added", status: "Success" },
  { ts: "22 Jul 2025, 13:30", user: "Super Admin", role: "Super Admin", action: "Login", status: "Success" },
  { ts: "22 Jul 2025, 13:00", user: "Priya Patel", role: "Investor", action: "Settings Updated", status: "Success" },
  { ts: "22 Jul 2025, 12:30", user: "System", role: "System", action: "Backup Run", status: "Failed" },
  { ts: "22 Jul 2025, 12:00", user: "Ravi Mehta", role: "Admin", action: "Interest Paid", status: "Success" },
  { ts: "22 Jul 2025, 11:30", user: "Kishore Nair", role: "Branch Manager", action: "KYC Approved", status: "Success" },
  { ts: "22 Jul 2025, 11:00", user: "Super Admin", role: "Super Admin", action: "Investment Added", status: "Success" },
  { ts: "22 Jul 2025, 10:30", user: "Priya Patel", role: "Investor", action: "Login", status: "Success" },
  { ts: "22 Jul 2025, 10:00", user: "System", role: "System", action: "Settings Updated", status: "Success" },
];

const ROLE_CLASS = {
  Admin: "audit-role--admin",
  "Branch Manager": "audit-role--branch",
  Investor: "audit-role--investor",
  "Super Admin": "audit-role--super",
  System: "audit-role--system",
};

export default function AuditLogs({ totalRecords = 20, pageSize = 10 }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(totalRecords / pageSize);
  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalRecords);

  const handleExport = () => {
    // TODO: hook up export
    console.log("Exporting audit logs...");
  };

  return (
    <div className="audit-page">
      <div className="audit-page__header">
        <h1 className="audit-page__title">Audit Logs</h1>
        <button className="audit-export-btn" onClick={handleExport}>
          ⬇ Export
        </button>
      </div>

      <div className="audit-card">
        <table className="audit-table">
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
            {LOGS.map((log, idx) => (
              <tr key={idx}>
                <td className="audit-table__ts">{log.ts}</td>
                <td className="audit-table__user">{log.user}</td>
                <td>
                  <span className={`audit-role ${ROLE_CLASS[log.role] || ""}`}>
                    {log.role}
                  </span>
                </td>
                <td>{log.action}</td>
                <td>
                  <span
                    className={`audit-status ${
                      log.status === "Success"
                        ? "audit-status--success"
                        : "audit-status--failed"
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="audit-pagination">
          <span className="audit-pagination__info">
            Showing {rangeStart}-{rangeEnd} of {totalRecords} records
          </span>
          <div className="audit-pagination__controls">
            <button
              className="audit-pagination__arrow"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`audit-pagination__num ${
                  p === page ? "audit-pagination__num--active" : ""
                }`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="audit-pagination__arrow"
              disabled={page === totalPages}
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