import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Plus,
  TrendingUp,
  // Award,
  Bell,
  User,
  // Settings as SettingsIcon,
  LogOut,
  Search,
  Menu,
  X,
} from "lucide-react";
import { useInvestorData } from "./InvestorDataContext";
import "../../Styles/Investor/InvestorLayout.css";

const investorUser = {
  name: "Arjun Sharma",
  email: "arjun@inrfs.in",
  initial: "A",
};

export default function InvestorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications } = useInvestorData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.isNew).length;

  const navItems = [
    { to: "/investor/dashboard", label: "Dashboard", icon: LayoutGrid },
    { to: "/investor/invest-now", label: "Invest Now", icon: Plus },
    { to: "/investor/my-investments", label: "My Investments", icon: TrendingUp },
    // { to: "/investor/my-bonds", label: "My Bonds", icon: Award },
    // { to: "/investor/notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    { to: "/investor/profile", label: "Profile", icon: User },
    // { to: "/investor/settings", label: "Settings", icon: SettingsIcon },
  ];

  const activeItem = navItems.find((item) => location.pathname.startsWith(item.to));
  const currentLabel = activeItem ? activeItem.label : "Investor Portal";

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Lock background scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="investor-shell">
      <aside className={"investor-sidebar" + (sidebarOpen ? " investor-sidebar-open" : "")}>
        <div>
          <div className="investor-logo">
            <img src="/assets/logo.jpg" alt="INRFS Logo" className="auth-logo-img" />
            <div>
              <div className="investor-logo-sub">INVESTMENT PORTAL</div>
            </div>
            <button
              type="button"
              className="investor-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="investor-nav">
            {navItems.map(({ to, label, icon: Icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  "investor-nav-item" + (isActive ? " investor-nav-item-active" : "")
                }
              >
                <Icon size={16} />
                <span>{label}</span>
                {badge ? <span className="investor-nav-badge">{badge}</span> : null}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="investor-sidebar-footer">
          <div className="investor-user">
            <span className="investor-user-avatar">{investorUser.initial}</span>
            <div>
              <div className="investor-user-name">{investorUser.name}</div>
              <div className="investor-user-email">{investorUser.email}</div>
            </div>
          </div>
          <button className="investor-logout" onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Dims the page behind the drawer on mobile */}
      <div
        className={"investor-sidebar-backdrop" + (sidebarOpen ? " investor-sidebar-backdrop-open" : "")}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="investor-main">
        <header className="investor-topbar">
          <div className="investor-topbar-left">
            <button
              type="button"
              className="investor-menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div className="investor-breadcrumb">
              <span className="investor-breadcrumb-link">Home</span>
              <span className="investor-breadcrumb-sep">/</span>
              <span className="investor-breadcrumb-link">Investor Portal</span>
              <span className="investor-breadcrumb-sep">/</span>
              <span className="investor-breadcrumb-current">{currentLabel}</span>
            </div>
          </div>

          <div className="investor-topbar-right">
            <div className="investor-search">
              <Search size={15} />
              <input type="text" placeholder="Search investors, bonds..." />
            </div>
            <button className="investor-bell" onClick={() => navigate("/investor/notifications")}>
              <Bell size={17} />
              {unreadCount > 0 && <span className="investor-bell-badge">{unreadCount}</span>}
            </button>
            <div className="investor-profile">
              <span className="investor-profile-avatar">{investorUser.initial}</span>
              <div>
                <div className="investor-profile-name">{investorUser.name}</div>
                <div className="investor-profile-role">Investor Portal</div>
              </div>
            </div>
          </div>
        </header>

        <main className="investor-content">
          <h1 className="investor-page-title">{currentLabel}</h1>
          <Outlet />
        </main>
      </div>
    </div>
  );
}