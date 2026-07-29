import React, { useState } from "react";
import "../../Styles/SuperAdmin/Profile.css";

const INITIAL_PROFILE = {
  fullName: "Super Admin",
  email: "superadmin@inrfs.in",
  mobile: "+91 98765 43210",
  role: "Super Admin",
  branch: "Head Office",
  status: "Active",
};

export default function Profile() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(INITIAL_PROFILE);
  const [showToast, setShowToast] = useState(false);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel clicked: revert unsaved changes
      setFormData(profile);
      setIsEditing(false);
    } else {
      // Edit clicked: enter edit mode
      setFormData(profile);
      setIsEditing(true);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const initial = profile.fullName.charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h1 className="profile-page__title">My Profile</h1>
        <button className="profile-edit-btn" onClick={handleEditToggle}>
          {isEditing ? "✕ Cancel" : "✎ Edit Profile"}
        </button>
      </div>

      <div className="profile-page__grid">
        {/* Avatar card */}
        <div className="profile-avatar-card">
          <div className="profile-avatar">{initial}</div>
          <div className="profile-avatar-card__name">{profile.fullName}</div>
          <div className="profile-avatar-card__email">{profile.email}</div>
          <span className="profile-role-badge">{profile.role}</span>
        </div>

        {/* Personal info card */}
        <div className="profile-info-card">
          <h2 className="profile-info-card__title">Personal Information</h2>
          <div className="profile-info-card__divider" />

          <div className="profile-info-grid">
            <div className="profile-field">
              <span className="profile-field__label">FULL NAME</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
              ) : (
                <span className="profile-field__value">{profile.fullName}</span>
              )}
            </div>

            <div className="profile-field">
              <span className="profile-field__label">MOBILE</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                />
              ) : (
                <span className="profile-field__value">{profile.mobile}</span>
              )}
            </div>

            <div className="profile-field">
              <span className="profile-field__label">EMAIL</span>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              ) : (
                <span className="profile-field__value">{profile.email}</span>
              )}
            </div>

            <div className="profile-field">
              <span className="profile-field__label">ROLE</span>
              <span className="profile-field__value">{profile.role}</span>
            </div>

            <div className="profile-field">
              <span className="profile-field__label">BRANCH</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => handleChange("branch", e.target.value)}
                />
              ) : (
                <span className="profile-field__value">{profile.branch}</span>
              )}
            </div>

            <div className="profile-field">
              <span className="profile-field__label">STATUS</span>
              <span className="profile-field__value">{profile.status}</span>
            </div>
          </div>

          {isEditing && (
            <button className="profile-save-btn" onClick={handleSave}>
              Save Changes
            </button>
          )}
        </div>
      </div>

      {showToast && (
        <div className="profile-toast">
          <span className="profile-toast__icon">✓</span>
          Profile updated successfully!
        </div>
      )}
    </div>
  );
}