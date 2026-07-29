import React, { useState } from "react";
import "../../Styles/SuperAdmin/RolesPermissions.css";

const ROLES = [
  { id: "super_admin", name: "Super Admin", users: 1, badge: "All Permissions" },
  { id: "admin", name: "Admin", users: 28, permCount: "24/32 Permissions" },
  { id: "branch_manager", name: "Branch Manager", users: 14, permCount: "16/32 Permissions" },
  { id: "investor", name: "Investor", users: 1247, permCount: "8/32 Permissions" },
];

const PERMISSIONS_LEFT = [
  { key: "view_dashboard", label: "View Dashboard" },
  { key: "approve_kyc", label: "Approve KYC" },
  { key: "generate_bond", label: "Generate Bond" },
  { key: "process_settlement", label: "Process Settlement" },
  { key: "export_reports", label: "Export Reports" },
  { key: "manage_branches", label: "Manage Branches" },
  { key: "email_settings", label: "Email Settings" },
  { key: "audit_logs", label: "Audit Logs" },
];

const PERMISSIONS_RIGHT = [
  { key: "manage_investors", label: "Manage Investors" },
  { key: "add_investment", label: "Add Investment" },
  { key: "mark_interest_paid", label: "Mark Interest Paid" },
  { key: "view_reports", label: "View Reports" },
  { key: "manage_admins", label: "Manage Admins" },
  { key: "system_settings", label: "System Settings" },
  { key: "sms_settings", label: "SMS Settings" },
  { key: "delete_records", label: "Delete Records" },
];

const DEFAULT_ADMIN_PERMISSIONS = {
  view_dashboard: true,
  approve_kyc: true,
  generate_bond: true,
  process_settlement: true,
  export_reports: true,
  manage_branches: false,
  email_settings: false,
  audit_logs: false,
  manage_investors: true,
  add_investment: true,
  mark_interest_paid: true,
  view_reports: true,
  manage_admins: true,
  system_settings: false,
  sms_settings: false,
  delete_records: false,
};

export default function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState("admin");
  const [permissions, setPermissions] = useState(DEFAULT_ADMIN_PERMISSIONS);

  const togglePermission = (key) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // TODO: call API to persist permissions for selectedRole
    console.log("Saving permissions for", selectedRole, permissions);
  };

  return (
    <div className="roles-page">
      <div className="roles-page__header">
        <h1 className="roles-page__title">Roles & Permissions</h1>
      </div>

      <div className="roles-page__grid">
        {/* System Roles */}
        <div className="roles-card">
          <div className="roles-card__header">
            <h2 className="roles-card__title">System Roles</h2>
            <button className="roles-btn roles-btn--primary">
              <span className="roles-btn__icon">+</span> Create Role
            </button>
          </div>

          <div className="roles-list">
            {ROLES.map((role) => (
              <div className="roles-list__item" key={role.id}>
                <div className="roles-list__info">
                  <div className="roles-list__name">{role.name}</div>
                  <div className="roles-list__badges">
                    <span className="roles-badge roles-badge--blue">
                      {role.users} Users
                    </span>
                    <span className="roles-badge roles-badge--green">
                      {role.badge || role.permCount}
                    </span>
                  </div>
                </div>
                <button className="roles-icon-btn" aria-label="Edit role">
                  ✎
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="roles-card">
          <div className="roles-card__header">
            <h2 className="roles-card__title">Permission Matrix</h2>
            <select
              className="roles-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} Role
                </option>
              ))}
            </select>
          </div>

          <div className="roles-matrix">
            <div className="roles-matrix__col">
              {PERMISSIONS_LEFT.map((perm) => (
                <label className="roles-checkbox" key={perm.key}>
                  <input
                    type="checkbox"
                    checked={!!permissions[perm.key]}
                    onChange={() => togglePermission(perm.key)}
                  />
                  <span>{perm.label}</span>
                </label>
              ))}
            </div>
            <div className="roles-matrix__col">
              {PERMISSIONS_RIGHT.map((perm) => (
                <label className="roles-checkbox" key={perm.key}>
                  <input
                    type="checkbox"
                    checked={!!permissions[perm.key]}
                    onChange={() => togglePermission(perm.key)}
                  />
                  <span>{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="roles-btn roles-btn--save" onClick={handleSave}>
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
}