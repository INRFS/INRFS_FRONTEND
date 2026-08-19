import React, { useState } from "react";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  Shield,
  Lock,
  CheckCircle2,
  Globe,
  User,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import "../../Styles/login/Login.css";

const API_URL =
  process.env.REACT_APP_API_URL ||
   "http://187.52.115.32:8000";

const features = [
  {
    icon: Shield,
    label: "Bank-grade 256-bit encryption",
  },
  {
    icon: Lock,
    label: "Secure authentication",
  },
  {
    icon: CheckCircle2,
    label: "SEBI registered & RBI compliant",
  },
  {
    icon: Globe,
    label: "Access from anywhere, anytime",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminLogin =
    location.pathname === "/admin-login";

  const isSuperAdminLogin =
    location.pathname === "/superadmin-login";

  const isInvestorLogin =
    !isAdminLogin && !isSuperAdminLogin;

  const [investorId, setInvestorId] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const getPageTitle = () => {
    if (isAdminLogin) {
      return "Admin Login";
    }

    if (isSuperAdminLogin) {
      return "Super Admin Login";
    }

    return "Investor Login";
  };

  const getPageSubtitle = () => {
    if (isAdminLogin) {
      return "Sign in to your INRFS admin account";
    }

    if (isSuperAdminLogin) {
      return "Sign in to your INRFS super admin account";
    }

    return "Sign in to your INRFS investor account";
  };

  const storeAuthData = (data) => {
    if (data.access_token) {
      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "token",
        data.access_token
      );
    }

    localStorage.setItem(
      "token_type",
      data.token_type || "bearer"
    );

    if (data.user_id !== undefined) {
      localStorage.setItem(
        "user_id",
        String(data.user_id)
      );
    }

    localStorage.setItem(
      "login_id",
      data.login_id || ""
    );

    localStorage.setItem(
      "full_name",
      data.full_name || ""
    );

    localStorage.setItem(
      "role",
      data.role || ""
    );
if (data.branch_id !== undefined && data.branch_id !== null) {
  localStorage.setItem(
    "branch_id",
    String(data.branch_id)
  );
}

if (data.branch_name) {
  localStorage.setItem(
    "branch_name",
    data.branch_name
  );
}
    if (data.role_id !== undefined) {
      localStorage.setItem(
        "role_id",
        String(data.role_id)
      );
    }

    if (data.permissions !== undefined) {
      localStorage.setItem(
        "permissions",
        JSON.stringify(data.permissions)
      );
    }

    if (data.mobile) {
      localStorage.setItem(
        "mobile",
        data.mobile
      );
    }
  };

  const getApiError = async (response) => {
    try {
      const data =
        await response.json();

      if (
        Array.isArray(data.detail)
      ) {
        return data.detail
          .map(
            (item) =>
              item?.msg ||
              String(item)
          )
          .join(", ");
      }

      if (
        typeof data.detail ===
        "string"
      ) {
        return data.detail;
      }

      if (
        typeof data.message ===
        "string"
      ) {
        return data.message;
      }

      return "Login failed.";
    } catch {
      return "Unable to connect to the server.";
    }
  };

  const handleInvestorLogin =
    async () => {
      setError("");

      const cleanInvestorId =
        investorId.trim();

      if (!cleanInvestorId) {
        setError(
          "Please enter your Investor ID."
        );
        return;
      }

      if (!password.trim()) {
        setError(
          "Please enter your password."
        );
        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/auth/investor/login`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                investor_id:
                  cleanInvestorId.toUpperCase(),
                password,
              }),
            }
          );

        if (!response.ok) {
          const message =
            await getApiError(
              response
            );

          throw new Error(message);
        }

        const data =
          await response.json();

        console.log(
          "Investor login response:",
          data
        );

        storeAuthData(data);

        navigate(
          "/investor/dashboard"
        );
      } catch (err) {
        console.error(
          "Investor login error:",
          err
        );

        setError(
          err.message ||
            "Invalid Investor ID or password."
        );
      } finally {
        setLoading(false);
      }
    };

  const handleAdminLogin =
    async () => {
      setError("");

      const cleanUsername =
        username.trim();

      if (!cleanUsername) {
        setError(
          "Please enter your username."
        );
        return;
      }

      if (!password.trim()) {
        setError(
          "Please enter your password."
        );
        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/auth/admin/login`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                username:
                  cleanUsername,
                password,
              }),
            }
          );

        if (!response.ok) {
          const message =
            await getApiError(
              response
            );

          throw new Error(message);
        }

        const data =
          await response.json();

        console.log(
          "Admin login response:",
          data
        );

        storeAuthData(data);

        navigate(
          "/admin/dashboard"
        );
      } catch (err) {
        console.error(
          "Admin login error:",
          err
        );

        setError(
          err.message ||
            "Invalid username or password."
        );
      } finally {
        setLoading(false);
      }
    };

  const handleSuperAdminLogin =
    async () => {
      setError("");

      const cleanUsername =
        username.trim();

      if (!cleanUsername) {
        setError(
          "Please enter your username."
        );
        return;
      }

      if (!password.trim()) {
        setError(
          "Please enter your password."
        );
        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/auth/superadmin/login`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                username:
                  cleanUsername,
                password,
              }),
            }
          );

        if (!response.ok) {
          const message =
            await getApiError(
              response
            );

          throw new Error(message);
        }

        const data =
          await response.json();

        console.log(
          "Super Admin login response:",
          data
        );

        storeAuthData(data);

        navigate(
          "/superadmin/dashboard"
        );
      } catch (err) {
        console.error(
          "Super Admin login error:",
          err
        );

        setError(
          err.message ||
            "Invalid username or password."
        );
      } finally {
        setLoading(false);
      }
    };

  const handleLogin = () => {
    if (loading) {
      return;
    }

    if (isInvestorLogin) {
      handleInvestorLogin();
      return;
    }

    if (isAdminLogin) {
      handleAdminLogin();
      return;
    }

    if (isSuperAdminLogin) {
      handleSuperAdminLogin();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  const getLoginIcon = () => {
    if (isSuperAdminLogin) {
      return Lock;
    }

    if (isAdminLogin) {
      return ShieldCheck;
    }

    return User;
  };

  const LoginIcon = getLoginIcon();

  return (
    <div className="auth-page">

      <div className="auth-left">

        <div className="auth-logo">
          <img
            src="/assets/logo.jpg"
            alt="INRFS Logo"
            className="auth-logo-img"
          />
        </div>

        <h1 className="auth-left-title">
          Secure Investor
          <br />
          Management Portal
        </h1>

        <p className="auth-left-subtitle">
          Access your investments,
          track returns, and manage
          your financial future from
          one unified platform.
        </p>

        <ul className="auth-feature-list">
          {features.map(
            ({
              icon: Icon,
              label,
            }) => (
              <li key={label}>
                <span className="auth-feature-icon">
                  <Icon size={16} />
                </span>

                {label}
              </li>
            )
          )}
        </ul>

      </div>

      <div className="auth-right">

        <div className="auth-form-wrap">

          <h2 className="auth-form-title">
            Welcome Back
          </h2>

          <p className="auth-form-subtitle">
            {getPageSubtitle()}
          </p>

          <div className="auth-login-type">
            <LoginIcon size={16} />

            <span>
              {getPageTitle()}
            </span>
          </div>

          {isInvestorLogin && (
            <>
              <label
                className="auth-field-label"
                htmlFor="investorId"
              >
                Investor ID
              </label>

              <div className="auth-input">

                <User
                  size={16}
                  className="auth-input-icon"
                />

                <input
                  id="investorId"
                  type="text"
                  placeholder="Enter Investor ID (e.g. INV000001)"
                  value={investorId}
                  onChange={(e) =>
                    setInvestorId(
                      e.target.value.toUpperCase()
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  disabled={loading}
                  autoComplete="username"
                />

              </div>
            </>
          )}

          {(isAdminLogin ||
            isSuperAdminLogin) && (
            <>
              <label
                className="auth-field-label"
                htmlFor="username"
              >
                Username
              </label>

              <div className="auth-input">

                <User
                  size={16}
                  className="auth-input-icon"
                />

                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  disabled={loading}
                  autoComplete="username"
                />

              </div>
            </>
          )}

          <label
            className="auth-field-label"
            htmlFor="password"
          >
            Password
          </label>

          <div className="auth-input">

            <Lock
              size={16}
              className="auth-input-icon"
            />

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              disabled={loading}
              autoComplete="current-password"
            />

          </div>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              "Signing in..."
            ) : (
              <>
                Login

                <ArrowRight
                  size={16}
                />
              </>
            )}
          </button>

          <div className="auth-divider" />

          {isInvestorLogin && (
            <p className="auth-register-hint">
              New investor?{" "}

              <a href="/register">
                Register Now
              </a>
            </p>
          )}

          <a
            href="/"
            className="auth-back-link"
          >
            Back to Home
          </a>

        </div>

      </div>

    </div>
  );
}