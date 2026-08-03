import React, { useState } from "react";
import { Edit2, X, Save } from "lucide-react";

const initialProfile = {
  name: "Ravi Mehta",
  email: "ravi.admin@inrfs.in",
  mobile: "+91 98765 43210",
  role: "Admin Portal",
  branch: "Head Office",
  status: "Active",
  initial: "R",
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
    // Static/mock save — updates local state only, no API call.
    // Wire up your update-profile endpoint here later.
    setProfile(draft);
    setIsEditing(false);
  };

  const handleFieldChange = (field, value) => {
    setDraft((d) => ({ ...d, [field]: value }));
  };

  return (
    <div className="admin-page">
      <div className="admin-page-actions admin-page-actions--end">
        {isEditing ? (
          <>
            <button
              className="admin-btn admin-btn--outline"
              onClick={handleCancel}
            >
              <X size={14} /> Cancel
            </button>
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleSave}
            >
              <Save size={14} /> Save Changes
            </button>
          </>
        ) : (
          <button
            className="admin-btn admin-btn--primary"
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
          <span className="profile-role-pill">{profile.role}</span>
        </div>

        <div className="profile-info-card">
          <p className="admin-section__title">Personal Information</p>
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
      </div>
    </div>
  );
}