import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  LayoutGrid,
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  Bell,
  User,
  LogOut,
  Search,
  Settings,
  Menu,
  X,
} from "lucide-react";
import "../../Styles/Admin/AdminLayout.css";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/admin/investors", label: "Investor Mgmt", icon: Users },
  { to: "/admin/kyc-approvals", label: "KYC Approvals", icon: FileText, badge: 5 },
  { to: "/admin/investments", label: "Investments", icon: TrendingUp },
  { to: "/admin/monthly-interest", label: "Monthly Interest", icon: DollarSign },
  { to: "/admin/settlement", label: "Settlement", icon: Activity },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  // { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/profile", label: "Profile", icon: User },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ breadcrumb = ["Home", "Admin Portal"] }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Lock background scroll while the mobile drawer or the logout dialog is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen || showLogoutConfirm ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen, showLogoutConfirm]);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    navigate("/login");
  };

  return (
    <div className="admin-shell">
      <aside className={"admin-sidebar" + (sidebarOpen ? " admin-sidebar-open" : "")}>
        <div className="admin-logo">
          <img src="/assets/logo.jpg" alt="INRFS Logo" className="auth-logo-img" />

          <div>
            <div className="admin-logo-sub">INVESTMENT PORTAL</div>
          </div>

          <button
            type="button"
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                "admin-nav-item" + (isActive ? " admin-nav-item-active" : "")
              }
            >
              <Icon size={16} />
              <span>{label}</span>
              {badge && <span className="admin-nav-badge">{badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <span className="admin-user-avatar">R</span>
            <div>
              <div className="admin-user-name">Ravi Mehta</div>
              <div className="admin-user-email">admin@inrfs.in</div>
            </div>
          </div>
          <button className="admin-logout" onClick={() => setShowLogoutConfirm(true)}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Dims the page behind the drawer on mobile */}
      <div
        className={"admin-sidebar-backdrop" + (sidebarOpen ? " admin-sidebar-backdrop-open" : "")}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div className="admin-breadcrumb">
              {breadcrumb.map((crumb, i) => (
                <React.Fragment key={crumb}>
                  {i > 0 && <span className="admin-breadcrumb-sep">/</span>}
                  <span
                    className={
                      i === breadcrumb.length - 1
                        ? "admin-breadcrumb-current"
                        : "admin-breadcrumb-link"
                    }
                  >
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-search">
              <Search size={15} />
              <input type="text" placeholder="Search investors, bonds..." />
            </div>
            <button className="admin-bell">
              <Bell size={17} />
            </button>
            <div className="admin-profile">
              <span className="admin-profile-avatar">A</span>
              <div>
                <div className="admin-profile-name">Arjun Sharma</div>
                <div className="admin-profile-role">Administrator</div>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {showLogoutConfirm &&
        createPortal(
          <div
            className="admin-modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowLogoutConfirm(false);
            }}
          >
            <div className="admin-modal" role="dialog" aria-modal="true" aria-label="Log out">
              <div className="admin-modal-header">
                <h2>Log out</h2>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() => setShowLogoutConfirm(false)}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="admin-modal-body">
                <p>Are you sure you want to log out of the Admin portal?</p>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--outline"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
                <button type="button" className="admin-btn admin-btn--reject" onClick={confirmLogout}>
                  <LogOut size={14} /> Log out
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}