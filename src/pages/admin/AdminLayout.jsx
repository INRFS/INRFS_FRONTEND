import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/profile", label: "Profile", icon: User },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ breadcrumb = ["Home", "Admin Portal"] }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img src="/assets/logo.JPG" alt="INRFS Logo" className="auth-logo-img" />
          
          <div>
            <div className="admin-logo-title">INRFS</div>
            <div className="admin-logo-sub">INVESTMENT PORTAL</div>
          </div>
        </div>

        <div className="admin-portal-pill">ADMIN PORTAL</div>

        <nav className="admin-nav">
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
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
          <button className="admin-logout" onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
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
    </div>
  );
}