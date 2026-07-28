import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  CheckCircle2,
  Globe,
  User,
  ShieldCheck,
  Building2,
  Phone,
  ChevronLeft,
  ArrowRight,
  KeyRound,
} from "lucide-react";
import "../../Styles/login/Login.css";

const STATIC_OTP = "123456";

const features = [
  { icon: Shield, label: "Bank-grade 256-bit encryption" },
  { icon: Lock, label: "Two-factor authentication (OTP)" },
  { icon: CheckCircle2, label: "SEBI registered & RBI compliant" },
  { icon: Globe, label: "Access from anywhere, anytime" },
];

const roles = [
  { id: "investor", icon: User, title: "Investor", desc: "Access your portfolio" },
  { id: "admin", icon: ShieldCheck, title: "Admin", desc: "Manage Investors" },
  { id: "superadmin", icon: Lock, title: "Super Admin", desc: "Full system access" },
  { id: "branchmanager", icon: Building2, title: "Branch Manager", desc: "Branch operations" },
];

const roleRedirects = {
  investor: "/investor/dashboard",
  admin: "/admin/dashboard",
  superadmin: "/admin/dashboard",
  branchmanager: "/admin/dashboard",
};

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("investor");

  const [investorId, setInvestorId] = useState("");
  const [mobile, setMobile] = useState("");
  const [step, setStep] = useState("form");
  const [otp, setOtp] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const isInvestor = role === "investor";

  const handleRoleChange = (id) => {
    setRole(id);
    setError("");
    setStep("form");
    setOtp("");
    setInvestorId("");
    setMobile("");
    setUsername("");
    setPassword("");
  };

  const handleSendOtp = () => {
    setError("");
    if (!investorId.trim() || !mobile.trim()) {
      setError("Please enter both Investor ID and mobile number.");
      return;
    }
    setStep("otp");
  };

  const handleVerifyOtp = () => {
    if (otp.trim() === STATIC_OTP) {
      setError("");
      navigate(roleRedirects[role] || "/");
    } else {
      setError("Invalid OTP. Please try again.");
    }
  };

  const handleChangeDetails = () => {
    setStep("form");
    setOtp("");
    setError("");
  };

  const handleStaffLogin = () => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    navigate(roleRedirects[role] || "/");
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-logo">
          <img src="/assets/logo.JPG" alt="INRFS Logo" className="auth-logo-img" />
        </div>
        <h1 className="auth-left-title">
          Secure Investor
          <br />
          Management Portal
        </h1>
        <p className="auth-left-subtitle">
          Access your investments, track returns, and manage your financial
          future from one unified platform.
        </p>

        <ul className="auth-feature-list">
          {features.map(({ icon: Icon, label }) => (
            <li key={label}>
              <span className="auth-feature-icon">
                <Icon size={16} />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          {step === "form" && (
            <>
              <h2 className="auth-form-title">Welcome Back</h2>
              <p className="auth-form-subtitle">Sign in to your INRFS account</p>

              <div className="auth-field-label">Login As</div>
              <div className="role-grid">
                {roles.map(({ id, icon: Icon, title, desc }) => (
                  <button
                    type="button"
                    key={id}
                    className={`role-card${role === id ? " role-card-active" : ""}`}
                    onClick={() => handleRoleChange(id)}
                  >
                    <span className="role-card-icon">
                      <Icon size={18} />
                    </span>
                    <span className="role-card-title">{title}</span>
                    <span className="role-card-desc">{desc}</span>
                  </button>
                ))}
              </div>

              {isInvestor && (
                <>
                  <label className="auth-field-label" htmlFor="investorId">
                    Investor ID
                  </label>
                  <div className="auth-input">
                    <User size={16} className="auth-input-icon" />
                    <input
                      id="investorId"
                      type="text"
                      placeholder="Enter your Investor ID (e.g. INV001)"
                      value={investorId}
                      onChange={(e) => setInvestorId(e.target.value)}
                    />
                  </div>

                  <label className="auth-field-label" htmlFor="mobile">
                    Registered Mobile Number
                  </label>
                  <div className="auth-input">
                    <Phone size={16} className="auth-input-icon" />
                    <input
                      id="mobile"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>

                  {error && <p className="auth-error">{error}</p>}

                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={handleSendOtp}
                  >
                    Send OTP <ArrowRight size={16} />
                  </button>
                </>
              )}

              {!isInvestor && (
                <>
                  <label className="auth-field-label" htmlFor="username">
                    Username
                  </label>
                  <div className="auth-input">
                    <User size={16} className="auth-input-icon" />
                    <input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  <label className="auth-field-label" htmlFor="password">
                    Password
                  </label>
                  <div className="auth-input">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {error && <p className="auth-error">{error}</p>}

                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={handleStaffLogin}
                  >
                    Login <ArrowRight size={16} />
                  </button>
                </>
              )}

              <div className="auth-divider" />

              {isInvestor && (
                <p className="auth-register-hint">
                  New investor? <a href="/register">Register Now</a>
                </p>
              )}

              <a href="/" className="auth-back-link">
                <ChevronLeft size={15} /> Back to Home
              </a>
            </>
          )}

          {step === "otp" && isInvestor && (
            <>
              <h2 className="auth-form-title">Verify OTP</h2>
              <p className="auth-form-subtitle">
                Enter the OTP sent to your registered mobile number ending in{" "}
                {mobile.slice(-4).padStart(mobile.length, "•")}
              </p>

              <label className="auth-field-label" htmlFor="otp">
                One-Time Password
              </label>
              <div className="auth-input">
                <KeyRound size={16} className="auth-input-icon" />
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={handleVerifyOtp}
              >
                Verify & Continue <ArrowRight size={16} />
              </button>

              <div className="auth-divider" />

              <button
                type="button"
                className="auth-back-link auth-back-link-btn"
                onClick={handleChangeDetails}
              >
                <ChevronLeft size={15} /> Change details
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}