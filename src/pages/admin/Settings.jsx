import React, { useState } from "react";

export default function Settings() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword) return;
    console.log("Updating password...");
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="admin-page settings-layout">
      <div className="settings-card">
        <p className="admin-section__title">Notification Preferences</p>

        <div className="settings-toggle-row">
          <div>
            <p className="settings-toggle-title">Email Notifications</p>
            <p className="settings-toggle-desc">Get email alerts for all activity</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={emailNotif} onChange={() => setEmailNotif((v) => !v)} />
            <span className="switch-slider" />
          </label>
        </div>

        <div className="settings-toggle-row">
          <div>
            <p className="settings-toggle-title">SMS Notifications</p>
            <p className="settings-toggle-desc">Get SMS for interest credits</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={smsNotif} onChange={() => setSmsNotif((v) => !v)} />
            <span className="switch-slider" />
          </label>
        </div>
      </div>

      <div className="settings-card">
        <p className="admin-section__title">Security</p>

        <div className="settings-toggle-row">
          <div>
            <p className="settings-toggle-title">Two-Factor Authentication</p>
            <p className="settings-toggle-desc">Require OTP on every login</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={twoFactor} onChange={() => setTwoFactor((v) => !v)} />
            <span className="switch-slider" />
          </label>
        </div>

        <label className="settings-field-label">Current Password</label>
        <input
          type="password"
          className="settings-input"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <label className="settings-field-label">New Password</label>
        <input
          type="password"
          className="settings-input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button className="admin-btn admin-btn--primary admin-btn--block" onClick={handleUpdatePassword}>
          Update Password
        </button>
      </div>
    </div>
  );
}