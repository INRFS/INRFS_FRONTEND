import React, { useState } from "react";
import { FileText, X } from "lucide-react";
import { StatusBadge } from "../../shared/Shared";
import "../../Styles/Admin/Kycapprovals.css";

const initialApplications = [
  { id: "INV001", name: "Arjun Sharma", status: "Approved", mobile: "9876543210", email: "arjun@email.com", branch: "Mumbai HQ" },
  { id: "INV002", name: "Priya Patel", status: "Pending", mobile: "9876511111", email: "priya@email.com", branch: "Delhi Branch" },
  { id: "INV003", name: "Rahul Kumar", status: "Approved", mobile: "9876522222", email: "rahul@email.com", branch: "Mumbai HQ" },
  { id: "INV004", name: "Sunita Verma", status: "Rejected", mobile: "9876533333", email: "sunita@email.com", branch: "Pune Branch" },
  { id: "INV005", name: "Vikram Singh", status: "Pending", mobile: "9876544444", email: "vikram@email.com", branch: "Bangalore Branch" },
  { id: "INV006", name: "Neha Gupta", status: "Approved", mobile: "9876555555", email: "neha@email.com", branch: "Mumbai HQ" },
];

const documentsByStatus = {
  "Aadhaar Card (Front)": "Verified",
  "Aadhaar Card (Back)": "Verified",
  "PAN Card": "Verified",
  "Passport Photo": "Pending",
  "Bank Passbook": "Pending",
};

export default function KycApprovals() {
  const [applications, setApplications] = useState(initialApplications);
  const pendingApplications = applications.filter((app) => app.status === "Pending");

  const [selectedId, setSelectedId] = useState(pendingApplications[0]?.id ?? null);
  const [remarks, setRemarks] = useState("");
  const [confirmAction, setConfirmAction] = useState(null); // "approve" | "reject" | null

  const selected = applications.find((a) => a.id === selectedId) ?? null;

  const pickNextPending = (afterId) => {
    const remaining = applications
      .filter((app) => app.status === "Pending" && app.id !== afterId);
    setSelectedId(remaining[0]?.id ?? null);
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    setRemarks("");
  };

  const openConfirm = (action) => {
    if (!selected) return;
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    setConfirmAction(null);
  };

  const confirmActionHandler = () => {
    if (!selected || !confirmAction) return;
    const newStatus = confirmAction === "approve" ? "Active" : "Rejected";
    setApplications((prev) =>
      prev.map((app) => (app.id === selected.id ? { ...app, status: newStatus } : app))
    );
    pickNextPending(selected.id);
    setRemarks("");
    setConfirmAction(null);
  };

  return (
    <div className="admin-page kyc-layout">
      <div className="kyc-list-card">
        <p className="admin-section__title">Applications</p>
        <div className="kyc-list">
          {pendingApplications.length === 0 && (
            <p className="kyc-list-empty">No pending KYC applications.</p>
          )}
          {pendingApplications.map((app) => (
            <button
              key={app.id}
              className={`kyc-list-item${selectedId === app.id ? " kyc-list-item--active" : ""}`}
              onClick={() => handleSelect(app.id)}
            >
              <div>
                <p className="kyc-list-item__name">{app.name}</p>
                <p className="kyc-list-item__id mono">{app.id}</p>
              </div>
              <StatusBadge status={app.status} />
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="kyc-detail-card">
          <div className="kyc-detail-header">
            <p className="admin-section__title">KYC Review — {selected.name}</p>
            <StatusBadge status={selected.status} />
          </div>

          <div className="kyc-field-grid">
            <div className="kyc-field">
              <span className="kyc-field__label">Full Name</span>
              <span className="kyc-field__value">{selected.name}</span>
            </div>
            <div className="kyc-field">
              <span className="kyc-field__label">Mobile</span>
              <span className="kyc-field__value">{selected.mobile}</span>
            </div>
            <div className="kyc-field">
              <span className="kyc-field__label">Email</span>
              <span className="kyc-field__value">{selected.email}</span>
            </div>
            <div className="kyc-field">
              <span className="kyc-field__label">Branch</span>
              <span className="kyc-field__value">{selected.branch}</span>
            </div>
          </div>

          <p className="admin-section__title">Documents</p>
          <div className="kyc-doc-list">
            {Object.entries(documentsByStatus).map(([doc, status]) => (
              <div key={doc} className="kyc-doc-row">
                <span className="kyc-doc-icon"><FileText size={16} /></span>
                <span className="kyc-doc-name">{doc}</span>
                <StatusBadge status={status} />
              </div>
            ))}
          </div>

          <p className="admin-section__title">Remarks</p>
          <textarea
            className="kyc-remarks"
            placeholder="Add remarks..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="kyc-actions">
            <button className="admin-btn admin-btn--reject" onClick={() => openConfirm("reject")}>Reject</button>
            <button className="admin-btn admin-btn--approve" onClick={() => openConfirm("approve")}>Approve KYC</button>
          </div>
        </div>
      ) : (
        <div className="kyc-detail-card kyc-detail-card--empty">
          <p>No pending investor selected.</p>
        </div>
      )}

      {confirmAction && selected && (
        <div className="kyc-confirm-overlay" onClick={closeConfirm}>
          <div className="kyc-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="kyc-confirm-header">
              <h2>{confirmAction === "approve" ? "Approve KYC" : "Reject KYC"}</h2>
              <button className="im-icon-btn" onClick={closeConfirm}>
                <X size={16} />
              </button>
            </div>

            <p className="kyc-confirm-text">
              Are you sure you want to {confirmAction === "approve" ? "approve" : "reject"} the KYC
              application for <strong>{selected.name}</strong> ({selected.id})?
              {confirmAction === "approve"
                ? " Their account status will be set to Active."
                : " Their account status will be set to Rejected."}
            </p>

            {remarks.trim() && (
              <p className="kyc-confirm-remarks">
                <span className="kyc-field__label">Remarks:</span> {remarks}
              </p>
            )}

            <div className="kyc-confirm-actions">
              <button className="btn btn-outline" onClick={closeConfirm}>
                Cancel
              </button>
              <button
                className={confirmAction === "approve" ? "admin-btn admin-btn--approve" : "admin-btn admin-btn--reject"}
                onClick={confirmActionHandler}
              >
                {confirmAction === "approve" ? "Yes, Approve" : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}