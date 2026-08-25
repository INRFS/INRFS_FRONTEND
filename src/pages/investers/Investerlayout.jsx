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
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { getCurrentUser } from "../../services/authService";
import "../../Styles/Investor/InvestorLayout.css";

export default function InvestorLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const navItems = [
    { to: "/investor/dashboard", label: "Dashboard", icon: LayoutGrid },
    { to: "/investor/invest-now", label: "Invest Now", icon: Plus },
    { to: "/investor/my-investments", label: "My Investments", icon: TrendingUp },
    { to: "/investor/profile", label: "Profile", icon: User },
  ];

  const activeItem = navItems.find((item) =>
    location.pathname.startsWith(item.to)
  );

  const currentLabel = activeItem ? activeItem.label : "Investor Portal";

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError("");

        const data = await getCurrentUser();

        if (!mounted) return;

        setProfile(data);
      } catch (error) {
        console.error("Failed to load investor profile:", error);

        if (!mounted) return;

        setProfileError(error?.message || "Unable to load profile");

        const token =
          localStorage.getItem("access_token") ||
          localStorage.getItem("token") ||
          sessionStorage.getItem("access_token") ||
          sessionStorage.getItem("token");

        if (!token) {
          navigate("/login", { replace: true });
        }
      } finally {
        if (mounted) setProfileLoading(false);
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = sidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setLogoutModalOpen(false);
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const investorUser = useMemo(() => {
    const fullName = profile?.full_name || profile?.name || "Investor";
    const email = profile?.email || "";
    const role = profile?.role || "INVESTOR";
    const loginId = profile?.login_id || "";
    const initial =
      String(fullName).trim().charAt(0).toUpperCase() || "I";

    return {
      name: fullName,
      email,
      role,
      loginId,
      initial,
    };
  }, [profile]);

  const confirmLogout = () => {
    [
      "access_token",
      "token",
      "token_type",
      "user_id",
      "login_id",
      "full_name",
      "role",
    ].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    setLogoutModalOpen(false);

    navigate("/login", { replace: true });
  };

  const cancelLogout = () => {
    setLogoutModalOpen(false);
  };

  return (
    <div className="investor-shell">
      <aside
        className={
          "investor-sidebar" +
          (sidebarOpen ? " investor-sidebar-open" : "")
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
                  "investor-nav-item" +
                  (isActive ? " investor-nav-item-active" : "")
                }
              >
                <Icon size={16} />
                <span>{label}</span>

                {badge ? (
                  <span className="investor-nav-badge">
                    {badge}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="investor-sidebar-footer">
          <div className="investor-user">
            <span className="investor-user-avatar">
              {investorUser.initial}
            </span>

            <div>
              <div className="investor-user-name">
                {profileLoading ? "Loading..." : investorUser.name}
              </div>

              <div className="investor-user-email">
                {profileLoading ? "" : investorUser.email}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="investor-logout"
            onClick={() => setLogoutModalOpen(true)}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      <div
        className={
          "investor-sidebar-backdrop" +
          (sidebarOpen ? " investor-sidebar-backdrop-open" : "")
        }
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
              <span className="investor-breadcrumb-link">
                Investor Portal
              </span>
              <span className="investor-breadcrumb-sep">/</span>
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
                  {profileLoading ? "Loading..." : investorUser.name}
                </div>

                <div className="investor-profile-role">
                  {profileLoading
                    ? ""
                    : investorUser.role === "INVESTOR"
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

      {logoutModalOpen && (
        <div
          className="investor-logout-overlay"
          onClick={cancelLogout}
          role="presentation"
        >
          <div
            className="investor-logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="investor-logout-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="investor-logout-icon">
              <LogOut size={22} />
            </div>

            <div className="investor-logout-content">
              <h3 id="investor-logout-title">Logout</h3>
              <p>
                Are you sure you want to logout from your investor portal?
              </p>
            </div>

            <div className="investor-logout-actions">
              <button
                type="button"
                className="investor-logout-cancel"
                onClick={cancelLogout}
              >
                Cancel
              </button>

              <button
                type="button"
                className="investor-logout-confirm"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
