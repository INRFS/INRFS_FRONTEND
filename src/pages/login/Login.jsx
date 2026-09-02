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
  Mail,
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

  const [showForgotPassword, setShowForgotPassword] =
    useState(false);

  const [forgotStep, setForgotStep] =
    useState("email");

  const [forgotEmail, setForgotEmail] =
    useState("");

  const [forgotOtp, setForgotOtp] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmNewPassword, setConfirmNewPassword] =
    useState("");

  const [forgotLoading, setForgotLoading] =
    useState(false);

  const [forgotMessage, setForgotMessage] =
    useState("");

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

  const handleSendForgotPasswordOtp = async () => {
    setForgotMessage("");

    const email = forgotEmail.trim().toLowerCase();

    if (!email) {
      setForgotMessage("Please enter your email address.");
      return;
    }

    try {
      setForgotLoading(true);

      const response = await fetch(
        `${API_URL}/auth/forgot-password/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      if (!response.ok) {
        const message = await getApiError(response);
        throw new Error(message);
      }

      const data = await response.json();

      setForgotMessage(
        data?.message ||
          "OTP has been sent to your email."
      );
      setForgotStep("otp");
    } catch (err) {
      console.error(
        "Forgot password OTP error:",
        err
      );

      setForgotMessage(
        err.message ||
          "Unable to send OTP."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyForgotPasswordOtp = async () => {
    setForgotMessage("");

    const email = forgotEmail.trim().toLowerCase();
    const otp = forgotOtp.trim();

    if (!otp || !/^\d{6}$/.test(otp)) {
      setForgotMessage(
        "Please enter a valid 6-digit OTP."
      );
      return;
    }

    try {
      setForgotLoading(true);

      const response = await fetch(
        `${API_URL}/auth/forgot-password/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      if (!response.ok) {
        const message = await getApiError(response);
        throw new Error(message);
      }

      const data = await response.json();

      setForgotMessage(
        data?.message ||
          "OTP verified successfully."
      );
      setForgotStep("password");
    } catch (err) {
      console.error(
        "Forgot password OTP verification error:",
        err
      );

      setForgotMessage(
        err.message ||
          "Invalid OTP."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setForgotMessage("");

    if (!newPassword) {
      setForgotMessage(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 8) {
      setForgotMessage(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (
      newPassword !==
      confirmNewPassword
    ) {
      setForgotMessage(
        "Passwords do not match."
      );
      return;
    }

    try {
      setForgotLoading(true);

      const response = await fetch(
        `${API_URL}/auth/forgot-password/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email:
              forgotEmail.trim().toLowerCase(),
            otp: forgotOtp.trim(),
            new_password: newPassword,
          }),
        }
      );

      if (!response.ok) {
        const message = await getApiError(response);
        throw new Error(message);
      }

      const data = await response.json();

      setForgotMessage(
        data?.message ||
          "Password reset successfully."
      );

      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotStep("email");
        setForgotEmail("");
        setForgotOtp("");
        setNewPassword("");
        setConfirmNewPassword("");
        setForgotMessage("");
      }, 1200);
    } catch (err) {
      console.error(
        "Password reset error:",
        err
      );

      setForgotMessage(
        err.message ||
          "Unable to reset password."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotPassword = () => {
    if (forgotLoading) {
      return;
    }

    setShowForgotPassword(false);
    setForgotStep("email");
    setForgotEmail("");
    setForgotOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setForgotMessage("");
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

          <div className="auth-forgot-row">
            <button
              type="button"
              className="auth-forgot-link"
              onClick={() => {
                setError("");
                setForgotMessage("");
                setShowForgotPassword(true);
              }}
              disabled={loading}
            >
              Forgot Password?
            </button>
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

          {showForgotPassword && (
            <div className="auth-modal-overlay">
              <div className="auth-modal">
                <div className="auth-modal-header">
                  <h3>Forgot Password</h3>
                  <button
                    type="button"
                    className="auth-modal-close"
                    onClick={closeForgotPassword}
                    disabled={forgotLoading}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                {forgotStep === "email" && (
                  <>
                    <p className="auth-modal-subtitle">
                      Enter your registered email address.
                      We will send you a 6-digit OTP.
                    </p>

                    <label
                      className="auth-field-label"
                      htmlFor="forgotEmail"
                    >
                      Email Address
                    </label>

                    <div className="auth-input">
                      <Mail
                        size={16}
                        className="auth-input-icon"
                      />
                      <input
                        id="forgotEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(
                            e.target.value
                          );
                          setForgotMessage("");
                        }}
                        disabled={forgotLoading}
                        autoComplete="email"
                      />
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-block auth-modal-primary-btn"
                      onClick={
                        handleSendForgotPasswordOtp
                      }
                      disabled={forgotLoading}
                    >
                      {forgotLoading
                        ? "Sending OTP..."
                        : "Send OTP"}
                    </button>
                  </>
                )}

                {forgotStep === "otp" && (
                  <>
                    <p className="auth-modal-subtitle">
                      Enter the OTP sent to
                      <strong>
                        {" "}
                        {forgotEmail}
                      </strong>
                    </p>

                    <label
                      className="auth-field-label"
                      htmlFor="forgotOtp"
                    >
                      OTP
                    </label>

                    <div className="auth-input">
                      <ShieldCheck
                        size={16}
                        className="auth-input-icon"
                      />
                      <input
                        id="forgotOtp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={forgotOtp}
                        onChange={(e) => {
                          const value =
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6);

                          setForgotOtp(value);
                          setForgotMessage("");
                        }}
                        disabled={forgotLoading}
                        autoComplete="one-time-code"
                      />
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-block auth-modal-primary-btn"
                      onClick={
                        handleVerifyForgotPasswordOtp
                      }
                      disabled={forgotLoading}
                    >
                      {forgotLoading
                        ? "Verifying..."
                        : "Verify OTP"}
                    </button>

                    <button
                      type="button"
                      className="auth-modal-secondary-btn"
                      onClick={() => {
                        setForgotOtp("");
                        setForgotMessage("");
                        setForgotStep("email");
                      }}
                      disabled={forgotLoading}
                    >
                      Change Email
                    </button>
                  </>
                )}

                {forgotStep === "password" && (
                  <>
                    <p className="auth-modal-subtitle">
                      OTP verified. Create your new
                      password.
                    </p>

                    <label
                      className="auth-field-label"
                      htmlFor="newPassword"
                    >
                      New Password
                    </label>

                    <div className="auth-input">
                      <Lock
                        size={16}
                        className="auth-input-icon"
                      />
                      <input
                        id="newPassword"
                        type="password"
                        placeholder="Minimum 8 characters"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(
                            e.target.value
                          );
                          setForgotMessage("");
                        }}
                        disabled={forgotLoading}
                        autoComplete="new-password"
                      />
                    </div>

                    <label
                      className="auth-field-label"
                      htmlFor="confirmNewPassword"
                    >
                      Confirm New Password
                    </label>

                    <div className="auth-input">
                      <Lock
                        size={16}
                        className="auth-input-icon"
                      />
                      <input
                        id="confirmNewPassword"
                        type="password"
                        placeholder="Re-enter new password"
                        value={confirmNewPassword}
                        onChange={(e) => {
                          setConfirmNewPassword(
                            e.target.value
                          );
                          setForgotMessage("");
                        }}
                        disabled={forgotLoading}
                        autoComplete="new-password"
                      />
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-block auth-modal-primary-btn"
                      onClick={
                        handleResetPassword
                      }
                      disabled={forgotLoading}
                    >
                      {forgotLoading
                        ? "Updating..."
                        : "Create New Password"}
                    </button>
                  </>
                )}

                {forgotMessage && (
                  <p className="auth-forgot-message">
                    {forgotMessage}
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}