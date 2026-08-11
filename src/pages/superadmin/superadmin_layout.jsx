import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Building2,
  Shield,
  Users,
  TrendingUp,
  Wallet,
  KeyRound,
  FileText,
  BarChart3,
  Settings,
  Bell,
  User,
  LogOut,
  Search,
  Menu,
  X,
} from "lucide-react";
import "../../Styles/SuperAdmin/SuperAdminLayout.css";
import Modal from "./Modal";

const navItems = [
  { to: "/superadmin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/superadmin/investors", label: "Investor Management", icon: Users },
  { to: "/superadmin/investments", label: "Investment Management", icon: TrendingUp },
  { to: "/superadmin/payments", label: "Payments", icon: Wallet, badge: 5 },
  { to: "/superadmin/branches", label: "Branch Management", icon: Building2 },
  { to: "/superadmin/admins", label: "Admin Management", icon: Shield },
  { to: "/superadmin/roles", label: "Roles & Permissions", icon: KeyRound },
  { to: "/superadmin/audit-logs", label: "Audit Logs", icon: FileText },
  { to: "/superadmin/reports", label: "Reports", icon: BarChart3 },
  { to: "/superadmin/system-settings", label: "System Settings", icon: Settings },
  // { to: "/superadmin/notifications", label: "Notifications", icon: Bell },
  { to: "/superadmin/profile", label: "Profile", icon: User },
];

export default function SuperAdminLayout({ breadcrumb = ["Home", "Super Admin", "Dashboard"] }) {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    navigate("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="sa-shell">
      <aside className={"sa-sidebar" + (sidebarOpen ? " sa-sidebar-open" : "")}>
        <div className="sa-logo">
          <img src="/assets/logo2.jpg" alt="INRFS" className="sa-logo-badge" />
          <div>
            <div className="sa-logo-sub">INVESTMENT PORTAL</div>
          </div>
          <button
            className="sa-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="sa-nav">
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                "sa-nav-item" + (isActive ? " sa-nav-item-active" : "")
              }
            >
              <Icon size={16} />
              <span>{label}</span>
              {badge ? <span className="sa-nav-badge">{badge}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="sa-sidebar-footer">
          <div className="sa-user">
            <span className="sa-user-avatar">S</span>
            <div>
              <div className="sa-user-name">Super Admin</div>
              <div className="sa-user-email">superadmin@inrfs.in</div>
            </div>
          </div>
          <button className="sa-sidebar-logout" onClick={handleLogoutClick}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div
        className={
          "sa-sidebar-backdrop" + (sidebarOpen ? " sa-sidebar-backdrop-open" : "")
        }
        onClick={closeSidebar}
      />

      <div className="sa-main">
        <header className="sa-topbar">
          <div className="sa-topbar-left">
            <button
              className="sa-menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="sa-breadcrumb">
              {breadcrumb.map((crumb, i) => (
                <React.Fragment key={crumb}>
                  {i > 0 && <span className="sa-breadcrumb-sep">/</span>}
                  <span
                    className={
                      i === breadcrumb.length - 1
                        ? "sa-breadcrumb-current"
                        : "sa-breadcrumb-link"
                    }
                  >
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="sa-topbar-right">
            <div className="sa-search">
              <Search size={15} />
              <input type="text" placeholder="Search investors, bonds..." />
            </div>
            <button className="sa-bell">
              <Bell size={17} />
            </button>
            <div className="sa-profile">
              <span className="sa-profile-avatar">S</span>
              <div>
                <div className="sa-profile-name">Super Admin</div>
                <div className="sa-profile-role">Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        <main className="sa-content">
          <Outlet />
        </main>
      </div>

      {showLogoutConfirm && (
        <Modal
          title="Log out"
          onClose={() => setShowLogoutConfirm(false)}
          footer={
            <>
              <button
                type="button"
                className="sa-btn sa-btn-ghost"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button type="button" className="sa-btn sa-btn-danger" onClick={confirmLogout}>
                Log out
              </button>
            </>
          }
        >
          <p style={{ margin: 0, fontSize: 13.5, color: "#374151" }}>
            Are you sure you want to log out of the Super Admin portal?
          </p>
        </Modal>
      )}
    </div>
  );
}