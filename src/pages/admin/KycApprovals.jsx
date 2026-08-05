import React, { useState } from "react";
import { X } from "lucide-react";
import { StatusBadge } from "../../shared/Shared";
import "../../Styles/Admin/Kycapprovals.css";

const initialApplications = [
  { id: "INV001", name: "Arjun Sharma", status: "Approved", mobile: "9876543210", email: "arjun@email.com", branch: "Mumbai HQ", dob: "1990-04-12", aadhaar: "XXXX XXXX 4321", address: "204, Silver Oak Residency, Andheri West", city: "Mumbai", state: "Maharashtra", pin: "400058" },
  { id: "INV002", name: "Priya Patel", status: "Pending", mobile: "9876511111", email: "priya@email.com", branch: "Delhi Branch", dob: "1988-11-03", aadhaar: "XXXX XXXX 5566", address: "12, Rajouri Garden", city: "Delhi", state: "Delhi", pin: "110027" },
  { id: "INV003", name: "Rahul Kumar", status: "Approved", mobile: "9876522222", email: "rahul@email.com", branch: "Mumbai HQ", dob: "1992-07-21", aadhaar: "XXXX XXXX 7788", address: "45, Whitefield Main Road", city: "Bangalore", state: "Karnataka", pin: "560066" },
  { id: "INV004", name: "Sunita Verma", status: "Rejected", mobile: "9876533333", email: "sunita@email.com", branch: "Pune Branch", dob: "1985-02-14", aadhaar: "XXXX XXXX 9900", address: "78, Koregaon Park", city: "Pune", state: "Maharashtra", pin: "411001" },
  { id: "INV005", name: "Vikram Singh", status: "Pending", mobile: "9876544444", email: "vikram@email.com", branch: "Bangalore Branch", dob: "1991-09-30", aadhaar: "XXXX XXXX 1122", address: "9, MG Road", city: "Bangalore", state: "Karnataka", pin: "560001" },
  { id: "INV006", name: "Neha Gupta", status: "Approved", mobile: "9876555555", email: "neha@email.com", branch: "Mumbai HQ", dob: "1993-06-05", aadhaar: "XXXX XXXX 3344", address: "22, Bandra West", city: "Mumbai", state: "Maharashtra", pin: "400050" },
];

export default function KycApprovals() {
  const [applications, setApplications] = useState(initialApplications);
  const pendingApplications = applications.filter((app) => app.status === "Pending");

  const [selectedId, setSelectedId] = useState(pendingApplications[0]?.id ?? null);
  const [remarks, setRemarks] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

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
              <span className="kyc-field__label">Date of Birth</span>
              <span className="kyc-field__value">{selected.dob}</span>
            </div>
            <div className="kyc-field">
              <span className="kyc-field__label">Aadhaar Number</span>
              <span className="kyc-field__value">{selected.aadhaar}</span>
            </div>
            <div className="kyc-field">
              <span className="kyc-field__label">Branch</span>
              <span className="kyc-field__value">{selected.branch}</span>
            </div>
            <div className="kyc-field kyc-field--full">
              <span className="kyc-field__label">Address</span>
              <span className="kyc-field__value">{selected.address}</span>
            </div>
            <div className="kyc-field">
              <span className="kyc-field__label">City</span>
              <span className="kyc-field__value">{selected.city}</span>
            </div>
            <div className="kyc-field">
              <span className="kyc-field__label">State</span>
              <span className="kyc-field__value">{selected.state}</span>
            </div>
            <div className="kyc-field">
              <span className="kyc-field__label">PIN Code</span>
              <span className="kyc-field__value">{selected.pin}</span>
            </div>
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