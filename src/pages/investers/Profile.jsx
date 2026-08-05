import React, { useState } from "react";
import { Edit2, X, Save } from "lucide-react";
import "../../Styles/Investor/Profile.css";

const initialProfile = {
  name: "Arjun Sharma",
  email: "arjun@inrfs.in",
  mobile: "+91 98765 43210",
  address: "204, Silver Oak Residency, Andheri West, Mumbai, Maharashtra 400058",
  role: "Investor Portal",
  branch: "Mumbai HQ",
  status: "Active",
  kyc: "KYC Verified",
  initial: "A",
  bank: {
    name: "HDFC Bank",
    accountNumber: "50100XXXXXX4321",
    ifsc: "HDFC0001234",
    accountType: "Savings",
  },
};

export default function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialProfile);

  const handleEditClick = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const handleSave = () => {
    setProfile(draft);
    setIsEditing(false);
  };

  const handleFieldChange = (field, value) => {
    setDraft((d) => ({ ...d, [field]: value }));
  };

  const handleBankFieldChange = (field, value) => {
    setDraft((d) => ({ ...d, bank: { ...d.bank, [field]: value } }));
  };

  return (
    <div className="investor-page">
      <div className="investor-page-actions investor-page-actions--end">
        {isEditing ? (
          <>
            <button
              className="investor-btn investor-btn--outline"
              onClick={handleCancel}
            >
              <X size={14} /> Cancel
            </button>
            <button
              className="investor-btn investor-btn--primary"
              onClick={handleSave}
            >
              <Save size={14} /> Save Changes
            </button>
          </>
        ) : (
          <button
            className="investor-btn investor-btn--primary"
            onClick={handleEditClick}
          >
            <Edit2 size={14} /> Edit Profile
          </button>
        )}
      </div>

      <div className="profile-layout">
        <div className="profile-card">
          <span className="profile-avatar">{profile.initial}</span>
          <p className="profile-name">{profile.name}</p>
          <p className="profile-email">{profile.email}</p>
          <span className="profile-role-pill">{profile.kyc}</span>
        </div>

        <div className="profile-right-col">
          <div className="profile-info-card">
            <p className="investor-section__title">Personal Information</p>
            <div className="profile-info-grid">
              <div className="profile-info-field">
                <span className="profile-info-label">Full Name</span>
                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    value={draft.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                  />
                ) : (
                  <span className="profile-info-value">{profile.name}</span>
                )}
              </div>
              <div className="profile-info-field">
                <span className="profile-info-label">Mobile</span>
                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    value={draft.mobile}
                    onChange={(e) => handleFieldChange("mobile", e.target.value)}
                  />
                ) : (
                  <span className="profile-info-value">{profile.mobile}</span>
                )}
              </div>
              <div className="profile-info-field">
                <span className="profile-info-label">Email</span>
                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="email"
                    value={draft.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                  />
                ) : (
                  <span className="profile-info-value">{profile.email}</span>
                )}
              </div>
              <div className="profile-info-field" style={{ gridColumn: "1 / -1" }}>
                <span className="profile-info-label">Address</span>
                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    value={draft.address}
                    onChange={(e) => handleFieldChange("address", e.target.value)}
                  />
                ) : (
                  <span className="profile-info-value">{profile.address}</span>
                )}
              </div>
              <div className="profile-info-field">
                <span className="profile-info-label">Role</span>
                <span className="profile-info-value">{profile.role}</span>
              </div>
              <div className="profile-info-field">
                <span className="profile-info-label">Branch</span>
                <span className="profile-info-value">{profile.branch}</span>
              </div>
              <div className="profile-info-field">
                <span className="profile-info-label">Status</span>
                <span className="profile-info-value">{profile.status}</span>
              </div>
            </div>
          </div>

          <div className="profile-info-card">
            <p className="investor-section__title">Bank Details</p>
            <div className="profile-info-grid">
              <div className="profile-info-field">
                <span className="profile-info-label">Bank Name</span>
                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    value={draft.bank.name}
                    onChange={(e) => handleBankFieldChange("name", e.target.value)}
                  />
                ) : (
                  <span className="profile-info-value">{profile.bank.name}</span>
                )}
              </div>
              <div className="profile-info-field">
                <span className="profile-info-label">Account Number</span>
                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    value={draft.bank.accountNumber}
                    onChange={(e) =>
                      handleBankFieldChange("accountNumber", e.target.value)
                    }
                  />
                ) : (
                  <span className="profile-info-value">
                    {profile.bank.accountNumber}
                  </span>
                )}
              </div>
              <div className="profile-info-field">
                <span className="profile-info-label">IFSC Code</span>
                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    value={draft.bank.ifsc}
                    onChange={(e) => handleBankFieldChange("ifsc", e.target.value)}
                  />
                ) : (
                  <span className="profile-info-value">{profile.bank.ifsc}</span>
                )}
              </div>
              <div className="profile-info-field">
                <span className="profile-info-label">Account Type</span>
                {isEditing ? (
                  <select
                    className="profile-info-input"
                    value={draft.bank.accountType}
                    onChange={(e) =>
                      handleBankFieldChange("accountType", e.target.value)
                    }
                  >
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                  </select>
                ) : (
                  <span className="profile-info-value">
                    {profile.bank.accountType}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}