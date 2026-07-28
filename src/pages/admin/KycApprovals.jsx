import React, { useState } from "react";
import { FileText } from "lucide-react";
import { StatusBadge } from "../../shared/Shared";

const applications = [
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
  const [selectedId, setSelectedId] = useState(applications[0].id);
  const [remarks, setRemarks] = useState("");
  const selected = applications.find((a) => a.id === selectedId);

  return (
    <div className="admin-page kyc-layout">
      <div className="kyc-list-card">
        <p className="admin-section__title">Applications</p>
        <div className="kyc-list">
          {applications.map((app) => (
            <button
              key={app.id}
              className={`kyc-list-item${selectedId === app.id ? " kyc-list-item--active" : ""}`}
              onClick={() => setSelectedId(app.id)}
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
          <button className="admin-btn admin-btn--reject">Reject</button>
          <button className="admin-btn admin-btn--approve">Approve KYC</button>
        </div>
      </div>
    </div>
  );
}
