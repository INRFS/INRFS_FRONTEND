import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  LayoutGrid,
  Plus,
  TrendingUp,
  Bell,
  User,
  LogOut,
  Search,
  Menu,
  X,
} from "lucide-react";

import { useInvestorData } from "./InvestorDataContext";

import {
  getCurrentUser,
} from "../../services/authService";

import "../../Styles/Investor/InvestorLayout.css";

export default function InvestorLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { notifications } =
    useInvestorData();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [profile, setProfile] =
    useState(null);

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [profileError, setProfileError] =
    useState("");

  const unreadCount =
    notifications.filter(
      (n) => n.isNew
    ).length;

  const navItems = [
    {
      to: "/investor/dashboard",
      label: "Dashboard",
      icon: LayoutGrid,
    },
    {
      to: "/investor/invest-now",
      label: "Invest Now",
      icon: Plus,
    },
    {
      to: "/investor/my-investments",
      label: "My Investments",
      icon: TrendingUp,
    },
    {
      to: "/investor/profile",
      label: "Profile",
      icon: User,
    },
  ];

  const activeItem = navItems.find(
    (item) =>
      location.pathname.startsWith(
        item.to
      )
  );

  const currentLabel = activeItem
    ? activeItem.label
    : "Investor Portal";

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError("");

        const data =
          await getCurrentUser();

        if (!mounted) {
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error(
          "Failed to load investor profile:",
          error
        );

        if (!mounted) {
          return;
        }

        setProfileError(
          error?.message ||
            "Unable to load profile"
        );

        const token =
          localStorage.getItem(
            "access_token"
          );

        if (!token) {
          navigate("/login", {
            replace: true,
          });
        }
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow =
      sidebarOpen
        ? "hidden"
        : "";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [sidebarOpen]);

  const investorUser = useMemo(() => {
    const fullName =
      profile?.full_name ||
      profile?.name ||
      "Investor";

    const email =
      profile?.email ||
      "";

    const role =
      profile?.role ||
      "INVESTOR";

    const loginId =
      profile?.login_id ||
      "";

    const initial =
      String(fullName)
        .trim()
        .charAt(0)
        .toUpperCase() || "I";

    return {
      name: fullName,
      email,
      role,
      loginId,
      initial,
    };
  }, [profile]);

  const handleLogout = () => {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "token_type"
    );

    localStorage.removeItem(
      "user_id"
    );

    localStorage.removeItem(
      "login_id"
    );

    localStorage.removeItem(
      "full_name"
    );

    localStorage.removeItem(
      "role"
    );

    sessionStorage.removeItem(
      "access_token"
    );

    sessionStorage.removeItem(
      "token"
    );

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="investor-shell">
      <aside
        className={
          "investor-sidebar" +
          (sidebarOpen
            ? " investor-sidebar-open"
            : "")
        }
      >
        <div>
          <div className="investor-logo">
            <img
              src="/assets/logo.jpg"
              alt="INRFS Logo"
              className="auth-logo-img"
            />

            <div>
              <div className="investor-logo-sub">
                INVESTMENT PORTAL
              </div>
            </div>

            <button
              type="button"
              className="investor-sidebar-close"
              onClick={() =>
                setSidebarOpen(false)
              }
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="investor-nav">
            {navItems.map(
              ({
                to,
                label,
                icon: Icon,
                badge,
              }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({
                    isActive,
                  }) =>
                    "investor-nav-item" +
                    (isActive
                      ? " investor-nav-item-active"
                      : "")
                  }
                >
                  <Icon size={16} />

                  <span>
                    {label}
                  </span>

                  {badge ? (
                    <span className="investor-nav-badge">
                      {badge}
                    </span>
                  ) : null}
                </NavLink>
              )
            )}
          </nav>
        </div>

        <div className="investor-sidebar-footer">
          <div className="investor-user">
            <span className="investor-user-avatar">
              {investorUser.initial}
            </span>

            <div>
              <div className="investor-user-name">
                {profileLoading
                  ? "Loading..."
                  : investorUser.name}
              </div>

              <div className="investor-user-email">
                {profileLoading
                  ? ""
                  : investorUser.email}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="investor-logout"
            onClick={handleLogout}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      <div
        className={
          "investor-sidebar-backdrop" +
          (sidebarOpen
            ? " investor-sidebar-backdrop-open"
            : "")
        }
        onClick={() =>
          setSidebarOpen(false)
        }
      />

      <div className="investor-main">
        <header className="investor-topbar">
          <div className="investor-topbar-left">
            <button
              type="button"
              className="investor-menu-toggle"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div className="investor-breadcrumb">
              <span className="investor-breadcrumb-link">
                Home
              </span>

              <span className="investor-breadcrumb-sep">
                /
              </span>

              <span className="investor-breadcrumb-link">
                Investor Portal
              </span>

              <span className="investor-breadcrumb-sep">
                /
              </span>

              <span className="investor-breadcrumb-current">
                {currentLabel}
              </span>
            </div>
          </div>

          <div className="investor-topbar-right">
     

          
            <div className="investor-profile">
              <span className="investor-profile-avatar">
                {investorUser.initial}
              </span>

              <div>
                <div className="investor-profile-name">
                  {profileLoading
                    ? "Loading..."
                    : investorUser.name}
                </div>

                <div className="investor-profile-role">
                  {profileLoading
                    ? ""
                    : investorUser.role ===
                      "INVESTOR"
                    ? "Investor Portal"
                    : investorUser.role}
                </div>
              </div>
            </div>
          </div>
        </header>

        {profileError && (
          <div className="investor-profile-error">
            {profileError}
          </div>
        )}

        <main className="investor-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}