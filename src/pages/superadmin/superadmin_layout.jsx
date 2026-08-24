import React from "react";
import {
  LayoutGrid,
  Building2,
  Shield,
  Users,
  TrendingUp,
  Wallet,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  MoreVertical,
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import "../../Styles/SuperAdmin/SuperAdminLayout.css";
import Modal from "./Modal";

import {
  getSuperAdminProfile,
} from "../../services/superadmin/profileService";

const navItems = [
  {
    to: "/superadmin/dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
  },
  {
    to: "/superadmin/investors",
    label: "Investor Management",
    icon: Users,
  },
  {
    to: "/superadmin/investments",
    label: "Investment Management",
    icon: TrendingUp,
  },
  {
    to: "/superadmin/payments",
    label: "Payments",
    icon: Wallet,
  },
  {
    to: "/superadmin/branches",
    label: "Branch Management",
    icon: Building2,
  },
  {
    to: "/superadmin/admins",
    label: "Admin Management",
    icon: Shield,
  },
  {
    to: "/superadmin/reports",
    label: "Reports",
    icon: BarChart3,
  },
  {
    to: "/superadmin/profile",
    label: "Profile",
    icon: User,
  },
];

export default function SuperAdminLayout({
  breadcrumb = [
    "Home",
    "Super Admin",
    "Dashboard",
  ],
}) {
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] =
    React.useState(false);

  const [sidebarOpen, setSidebarOpen] =
    React.useState(false);

  const [profile, setProfile] =
    React.useState(null);

  const [profileLoading, setProfileLoading] =
    React.useState(true);

  // ==========================================
  // LOAD LOGGED-IN SUPER ADMIN PROFILE
  // ==========================================

  React.useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setProfileLoading(true);

        const response =
          await getSuperAdminProfile();

        if (!mounted) {
          return;
        }

        const profileData =
          response?.data ||
          response?.profile ||
          response ||
          null;

        setProfile(profileData);
      } catch (error) {
        console.error(
          "Failed to load Super Admin profile:",
          error
        );
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
  }, []);

  // ==========================================
  // PROFILE VALUES
  // ==========================================

  const profileName =
    profile?.full_name ||
    profile?.fullName ||
    profile?.name ||
    "Super Admin";

  const profileEmail =
    profile?.email ||
    profile?.username ||
    "superadmin@inrfs.in";

  const profileRole =
    profile?.role_name ||
    profile?.role ||
    profile?.roleName ||
    "Super Admin";

  const profileInitial =
    String(profileName || "S")
      .trim()
      .charAt(0)
      .toUpperCase() || "S";

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };
const confirmLogout = () => {
  setShowLogoutConfirm(false);

  // Get role BEFORE clearing localStorage
  const role = String(
    localStorage.getItem("role") || ""
  )
    .trim()
    .toUpperCase();

  let loginPath = "/login";

  if (role === "SUPERADMIN") {
    loginPath = "/superadmin-login";
  } else if (
    role === "ADMIN" ||
    role === "BRANCH MANAGER"
  ) {
    loginPath = "/admin-login";
  } else if (role === "INVESTOR") {
    loginPath = "/login";
  }

  // Clear authentication
  localStorage.removeItem("access_token");
  localStorage.removeItem("token");
  localStorage.removeItem("admin_token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("user_id");
  localStorage.removeItem("login_id");
  localStorage.removeItem("full_name");
  localStorage.removeItem("role");
  localStorage.removeItem("role_id");
  localStorage.removeItem("branch_id");
  localStorage.removeItem("branch_name");
  localStorage.removeItem("permissions");
  localStorage.removeItem("mobile");

  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("admin_token");

  navigate(loginPath, {
    replace: true,
  });
};

  // ==========================================
  // SIDEBAR
  // ==========================================

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  React.useEffect(() => {
    document.body.style.overflow =
      sidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="sa-shell">

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <aside
        className={
          "sa-sidebar" +
          (sidebarOpen
            ? " sa-sidebar-open"
            : "")
        }
      >

        {/* LOGO */}

        <div className="sa-logo">

          <img
            src="/assets/logo2.jpg"
            alt="INRFS"
            className="sa-logo-badge"
          />

          <div>
            <div className="sa-logo-sub">
              INVESTMENT PORTAL
            </div>
          </div>

          <button
            type="button"
            className="sa-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>

        </div>

        {/* NAVIGATION */}

        <nav className="sa-nav">

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
                onClick={closeSidebar}
                className={({ isActive }) =>
                  "sa-nav-item" +
                  (isActive
                    ? " sa-nav-item-active"
                    : "")
                }
              >

                <Icon size={16} />

                <span>
                  {label}
                </span>

                {badge ? (
                  <span className="sa-nav-badge">
                    {badge}
                  </span>
                ) : null}

              </NavLink>
            )
          )}

        </nav>

        {/* ========================================
            SIDEBAR USER
        ======================================== */}

        <div className="sa-sidebar-footer">

          <div className="sa-user">

            <span className="sa-user-avatar">
              {profileInitial}
            </span>

            <div>

              <div className="sa-user-name">
                {profileLoading
                  ? "Loading..."
                  : profileName}
              </div>

              <div className="sa-user-email">
                {profileLoading
                  ? ""
                  : profileEmail}
              </div>

            </div>

          </div>

          <button
            type="button"
            className="sa-sidebar-logout"
            onClick={handleLogoutClick}
          >
            <LogOut size={16} />

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* ========================================
          MOBILE SIDEBAR BACKDROP
      ======================================== */}

      <div
        className={
          "sa-sidebar-backdrop" +
          (sidebarOpen
            ? " sa-sidebar-backdrop-open"
            : "")
        }
        onClick={closeSidebar}
      />

      {/* ========================================
          MAIN
      ======================================== */}

      <div className="sa-main">

        {/* ======================================
            TOPBAR
        ====================================== */}

        <header className="sa-topbar">

          <div className="sa-topbar-left">

            <button
              type="button"
              className="sa-menu-toggle"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>

            {/* BREADCRUMB */}

            <div className="sa-breadcrumb">

              {breadcrumb.map(
                (crumb, index) => (
                  <React.Fragment
                    key={`${crumb}-${index}`}
                  >

                    {index > 0 && (
                      <span className="sa-breadcrumb-sep">
                        /
                      </span>
                    )}

                    <span
                      className={
                        index ===
                        breadcrumb.length - 1
                          ? "sa-breadcrumb-current"
                          : "sa-breadcrumb-link"
                      }
                    >
                      {crumb}
                    </span>

                  </React.Fragment>
                )
              )}

            </div>

          </div>

          {/* ====================================
              TOPBAR PROFILE
          ==================================== */}

          <div className="sa-topbar-right">

            <div className="sa-profile">

              <span className="sa-profile-avatar">
                {profileInitial}
              </span>

              <div>

                <div className="sa-profile-name">

                  {profileLoading
                    ? "Loading..."
                    : profileName}

                </div>

                <div className="sa-profile-role">

                  {profileLoading
                    ? ""
                    : profileRole}

                </div>

              </div>

            </div>

            <button
              type="button"
              className="sa-mobile-more"
              aria-label="More options"
            >
              <MoreVertical size={18} />
            </button>

          </div>

        </header>

        {/* ========================================
            PAGE CONTENT
        ======================================== */}

        <main className="sa-content">
          <Outlet />
        </main>

      </div>

      {/* ========================================
          LOGOUT MODAL
      ======================================== */}

      {showLogoutConfirm && (
        <Modal
          title="Log out"
          onClose={() =>
            setShowLogoutConfirm(false)
          }
          footer={
            <>
              <button
                type="button"
                className="sa-btn sa-btn-ghost"
                onClick={() =>
                  setShowLogoutConfirm(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="sa-btn sa-btn-danger"
                onClick={confirmLogout}
              >
                Log out
              </button>
            </>
          }
        >
          <p
            style={{
              margin: 0,
              fontSize: 13.5,
              color: "#374151",
            }}
          >
            Are you sure you want to
            log out of the Super Admin
            portal?
          </p>
        </Modal>
      )}

    </div>
  );
}