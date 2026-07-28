import React from "react";
import { Edit2 } from "lucide-react";
import "../../Styles/Investor/Profile.css";

const profile = {
  name: "Arjun Sharma",
  email: "arjun@inrfs.in",
  mobile: "+91 98765 43210",
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
  return (
    <div className="investor-page">
      <div className="investor-page-actions investor-page-actions--end">
        <button className="investor-btn investor-btn--primary"><Edit2 size={14} /> Edit Profile</button>
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

          <div className="profile-info-card">
            <p className="investor-section__title">Bank Details</p>
            <div className="profile-info-grid">
              <div className="profile-info-field">
                <span className="profile-info-label">Bank Name</span>
                <span className="profile-info-value">{profile.bank.name}</span>
              </div>
              <div className="profile-info-field">
                <span className="profile-info-label">Account Number</span>
                <span className="profile-info-value">{profile.bank.accountNumber}</span>
              </div>
              <div className="profile-info-field">
                <span className="profile-info-label">IFSC Code</span>
                <span className="profile-info-value">{profile.bank.ifsc}</span>
              </div>
              <div className="profile-info-field">
                <span className="profile-info-label">Account Type</span>
                <span className="profile-info-value">{profile.bank.accountType}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
