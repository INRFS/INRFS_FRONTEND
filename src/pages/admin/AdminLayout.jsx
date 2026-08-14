import React, {
  useEffect,
  useState,
} from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { createPortal } from "react-dom";
import {
  LayoutGrid,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  Bell,
  User,
  LogOut,
  Search,
  Menu,
  X,
} from "lucide-react";
import "../../Styles/Admin/AdminLayout.css";
import {
  getAdminProfile,
} from "../../services/admin/adminProfileService";

const navItems = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
  },
  {
    to: "/admin/investors",
    label: "Investor Management",
    icon: Users,
  },
  {
    to: "/admin/investments",
    label: "Investments",
    icon: TrendingUp,
  },
  {
    to: "/admin/monthly-interest",
    label: "Monthly Interest",
    icon: DollarSign,
  },
  {
    to: "/admin/settlement",
    label: "Settlement",
    icon: Activity,
  },
  {
    to: "/admin/reports",
    label: "Reports",
    icon: BarChart3,
  },
  {
    to: "/admin/profile",
    label: "Profile",
    icon: User,
  },
];

const getInitial = (name) => {
  if (!name) {
    return "A";
  }

  return String(name)
    .trim()
    .charAt(0)
    .toUpperCase();
};

const getProfileData = (response) => {
  if (response?.data) {
    return response.data;
  }

  return response || {};
};

export default function AdminLayout({
  breadcrumb = ["Home", "Admin Portal"],
}) {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [
    showLogoutConfirm,
    setShowLogoutConfirm,
  ] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    username: "",
    role: "",
    branch: "",
    status: "",
    initial: "A",
  });

  const [profileLoading, setProfileLoading] =
    useState(true);

  useEffect(() => {
    document.body.style.overflow =
      sidebarOpen || showLogoutConfirm
        ? "hidden"
        : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [
    sidebarOpen,
    showLogoutConfirm,
  ]);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const response =
          await getAdminProfile();

        const data =
          getProfileData(response);

        if (!mounted) {
          return;
        }

        const name =
          data?.name ||
          data?.full_name ||
          data?.fullName ||
          data?.username ||
          data?.user_name ||
          "";

        const email =
          data?.email ||
          data?.email_address ||
          "";

        const username =
          data?.username ||
          data?.user_name ||
          "";

        const role =
          data?.role ||
          data?.role_name ||
          data?.roleName ||
          "Admin";

        const branch =
          data?.branch ||
          data?.branch_name ||
          data?.branchName ||
          "—";

        const status =
          data?.status ||
          data?.status_name ||
          data?.statusName ||
          "Active";

        setProfile({
          name,
          email,
          username,
          role,
          branch,
          status,
          initial: getInitial(name),
        });
      } catch (error) {
        if (!mounted) {
          return;
        }

        const storedName =
          localStorage.getItem(
            "admin_name"
          ) ||
          localStorage.getItem(
            "user_name"
          ) ||
          localStorage.getItem(
            "username"
          ) ||
          "";

        const storedEmail =
          localStorage.getItem(
            "admin_email"
          ) ||
          localStorage.getItem(
            "email"
          ) ||
          "";

        setProfile({
          name: storedName,
          email: storedEmail,
          username: storedName,
          role: "Admin",
          branch: "—",
          status: "Active",
          initial: getInitial(
            storedName
          ),
        });
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

  const confirmLogout = () => {
    localStorage.removeItem(
      "access_token"
    );
    localStorage.removeItem("token");
    localStorage.removeItem(
      "admin_token"
    );

    sessionStorage.removeItem(
      "access_token"
    );
    sessionStorage.removeItem("token");

    setShowLogoutConfirm(false);

    navigate("/login");
  };

  const displayName =
    profileLoading
      ? "Loading..."
      : profile.name || "Admin";

  const displayEmail =
    profileLoading
      ? ""
      : profile.email || "";

  const displayRole =
    profile.role || "Admin";

  const displayInitial =
    profile.initial ||
    getInitial(displayName);

  return (
    <div className="admin-shell">
      <aside
        className={
          "admin-sidebar" +
          (sidebarOpen
            ? " admin-sidebar-open"
            : "")
        }
      >
        <div className="admin-logo">
          <img
            src="/assets/logo.jpg"
            alt="INRFS Logo"
            className="auth-logo-img"
          />

          <div>
            <div className="admin-logo-sub">
              INVESTMENT PORTAL
            </div>
          </div>

          <button
            type="button"
            className="admin-sidebar-close"
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map(
            ({
              to,
              label,
              icon: Icon,
            }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() =>
                  setSidebarOpen(false)
                }
                className={({
                  isActive,
                }) =>
                  "admin-nav-item" +
                  (isActive
                    ? " admin-nav-item-active"
                    : "")
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            )
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <span className="admin-user-avatar">
              {displayInitial}
            </span>

            <div>
              <div className="admin-user-name">
                {displayName}
              </div>

              <div className="admin-user-email">
                {displayEmail}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout"
            onClick={() =>
              setShowLogoutConfirm(true)
            }
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      <div
        className={
          "admin-sidebar-backdrop" +
          (sidebarOpen
            ? " admin-sidebar-backdrop-open"
            : "")
        }
        onClick={() =>
          setSidebarOpen(false)
        }
      />

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-menu-toggle"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div className="admin-breadcrumb">
              {breadcrumb.map(
                (crumb, index) => (
                  <React.Fragment
                    key={`${crumb}-${index}`}
                  >
                    {index > 0 && (
                      <span className="admin-breadcrumb-sep">
                        /
                      </span>
                    )}

                    <span
                      className={
                        index ===
                        breadcrumb.length - 1
                          ? "admin-breadcrumb-current"
                          : "admin-breadcrumb-link"
                      }
                    >
                      {crumb}
                    </span>
                  </React.Fragment>
                )
              )}
            </div>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-search">
              <Search size={15} />

              <input
                type="text"
                placeholder="Search investors, bonds..."
              />
            </div>

            <button
              type="button"
              className="admin-bell"
            >
              <Bell size={17} />
            </button>

            <div className="admin-profile">
              <span className="admin-profile-avatar">
                {displayInitial}
              </span>

              <div>
                <div className="admin-profile-name">
                  {displayName}
                </div>

                <div className="admin-profile-role">
                  {displayRole}
                </div>
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
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setShowLogoutConfirm(false);
              }
            }}
          >
            <div
              className="admin-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Log out"
            >
              <div className="admin-modal-header">
                <h2>Log out</h2>

                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() =>
                    setShowLogoutConfirm(
                      false
                    )
                  }
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="admin-modal-body">
                <p>
                  Are you sure you want
                  to log out of the Admin
                  portal?
                </p>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--outline"
                  onClick={() =>
                    setShowLogoutConfirm(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="admin-btn admin-btn--reject"
                  onClick={confirmLogout}
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}