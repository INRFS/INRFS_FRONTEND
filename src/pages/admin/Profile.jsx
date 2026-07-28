import React from "react";
import { Edit2 } from "lucide-react";

const profile = {
  name: "Ravi Mehta",
  email: "ravi.admin@inrfs.in",
  mobile: "+91 98765 43210",
  role: "Admin Portal",
  branch: "Head Office",
  status: "Active",
  initial: "R",
};

export default function Profile() {
  return (
    <div className="admin-page">
      <div className="admin-page-actions admin-page-actions--end">
        <button className="admin-btn admin-btn--primary"><Edit2 size={14} /> Edit Profile</button>
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
              <span className="profile-info-value">{profile.name}</span>
            </div>
            <div className="profile-info-field">
              <span className="profile-info-label">Mobile</span>
              <span className="profile-info-value">{profile.mobile}</span>
            </div>
            <div className="profile-info-field">
              <span className="profile-info-label">Email</span>
              <span className="profile-info-value">{profile.email}</span>
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
