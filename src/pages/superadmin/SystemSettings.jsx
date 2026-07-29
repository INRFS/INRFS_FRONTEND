import React, { useState } from "react";
import "../../Styles/SuperAdmin/SystemSettings.css";

const TABS = [
  { id: "system", label: "System Settings", icon: "⚙️" },
  { id: "email", label: "Email Settings", icon: "✉️" },
  { id: "sms", label: "SMS Settings", icon: "📞" },
  { id: "backup", label: "Backup Settings", icon: "🗄️" },
];

const INITIAL_STATE = {
  system: {
    appName: "INRFS Investment Portal",
    supportEmail: "support@inrfs.in",
    minInvestment: "₹10,000",
    interestPaymentDay: "15",
  },
  email: {
    smtpHost: "smtp.sendgrid.net",
    smtpPort: "587",
    fromEmail: "noreply@inrfs.in",
  },
  sms: {
    provider: "Twilio",
    senderId: "INRFS",
    otpExpiry: "10 minutes",
  },
  backup: {
    lastBackup: "22 Jul 2025, 02:00 AM",
    lastBackupStatus: "Success",
    frequency: "Daily at 2:00 AM",
    retention: "30 days",
    location: "AWS S3",
  },
};

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("system");
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [toast, setToast] = useState({ show: false, message: "" });

  const handleChange = (tab, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: value },
    }));
  };

  const handleSave = (tab, label) => {
    // TODO: call API to persist formData[tab]
    console.log("Saving", tab, formData[tab]);
    setToast({ show: true, message: `${label} saved successfully!` });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  return (
    <div className="settings-page">
      <h1 className="settings-page__title">System Configuration</h1>

      <div className="settings-page__grid">
        {/* Sub-sidebar */}
        <div className="settings-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`settings-nav__item ${
                activeTab === tab.id ? "settings-nav__item--active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="settings-nav__icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="settings-card">
          {activeTab === "system" && (
            <>
              <h2 className="settings-card__title">System Settings</h2>
              <div className="settings-card__divider" />
              <div className="settings-form">
                <div className="settings-field">
                  <label>Application Name</label>
                  <input
                    type="text"
                    value={formData.system.appName}
                    onChange={(e) => handleChange("system", "appName", e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label>Support Email</label>
                  <input
                    type="email"
                    value={formData.system.supportEmail}
                    onChange={(e) => handleChange("system", "supportEmail", e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label>Min Investment</label>
                  <input
                    type="text"
                    value={formData.system.minInvestment}
                    onChange={(e) => handleChange("system", "minInvestment", e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label>Interest Payment Day</label>
                  <input
                    type="text"
                    value={formData.system.interestPaymentDay}
                    onChange={(e) =>
                      handleChange("system", "interestPaymentDay", e.target.value)
                    }
                  />
                </div>
                <button
                  className="settings-save-btn"
                  onClick={() => handleSave("system", "System Settings")}
                >
                  Save Settings
                </button>
              </div>
            </>
          )}

          {activeTab === "email" && (
            <>
              <h2 className="settings-card__title">Email Settings</h2>
              <div className="settings-card__divider" />
              <div className="settings-form">
                <div className="settings-field">
                  <label>SMTP Host</label>
                  <input
                    type="text"
                    value={formData.email.smtpHost}
                    onChange={(e) => handleChange("email", "smtpHost", e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label>SMTP Port</label>
                  <input
                    type="text"
                    value={formData.email.smtpPort}
                    onChange={(e) => handleChange("email", "smtpPort", e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label>From Email</label>
                  <input
                    type="email"
                    value={formData.email.fromEmail}
                    onChange={(e) => handleChange("email", "fromEmail", e.target.value)}
                  />
                </div>
                <button
                  className="settings-save-btn"
                  onClick={() => handleSave("email", "Email Settings")}
                >
                  Save Settings
                </button>
              </div>
            </>
          )}

          {activeTab === "sms" && (
            <>
              <h2 className="settings-card__title">SMS Settings</h2>
              <div className="settings-card__divider" />
              <div className="settings-form">
                <div className="settings-field">
                  <label>SMS Provider</label>
                  <input
                    type="text"
                    value={formData.sms.provider}
                    onChange={(e) => handleChange("sms", "provider", e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label>Sender ID</label>
                  <input
                    type="text"
                    value={formData.sms.senderId}
                    onChange={(e) => handleChange("sms", "senderId", e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label>OTP Expiry</label>
                  <input
                    type="text"
                    value={formData.sms.otpExpiry}
                    onChange={(e) => handleChange("sms", "otpExpiry", e.target.value)}
                  />
                </div>
                <button
                  className="settings-save-btn"
                  onClick={() => handleSave("sms", "SMS Settings")}
                >
                  Save Settings
                </button>
              </div>
            </>
          )}

          {activeTab === "backup" && (
            <>
              <h2 className="settings-card__title">Backup Settings</h2>
              <div className="settings-card__divider" />
              <div className="settings-form">
                <div className="settings-backup-status">
                  Last Backup: {formData.backup.lastBackup} —{" "}
                  <span className="settings-backup-status__success">
                    {formData.backup.lastBackupStatus}
                  </span>
                </div>
                <div className="settings-field">
                  <label>Backup Frequency</label>
                  <input
                    type="text"
                    value={formData.backup.frequency}
                    onChange={(e) => handleChange("backup", "frequency", e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label>Retention Period</label>
                  <input
                    type="text"
                    value={formData.backup.retention}
                    onChange={(e) => handleChange("backup", "retention", e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label>Location</label>
                  <input
                    type="text"
                    value={formData.backup.location}
                    onChange={(e) => handleChange("backup", "location", e.target.value)}
                  />
                </div>
                <button
                  className="settings-save-btn"
                  onClick={() => handleSave("backup", "Backup Settings")}
                >
                  Save Settings
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast popup */}
      {toast.show && (
        <div className="settings-toast">
          <span className="settings-toast__icon">✓</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}