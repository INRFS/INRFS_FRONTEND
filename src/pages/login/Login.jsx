import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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


/* =========================================================
   API URL
========================================================= */

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://187.52.115.32:8000";


/* =========================================================
   FEATURES
========================================================= */

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


/* =========================================================
   ROLES
========================================================= */

const roles = [
  {
    id: "investor",
    icon: User,
    title: "Investor",
    desc: "Access your portfolio",
  },
  {
    id: "admin",
    icon: ShieldCheck,
    title: "Admin",
    desc: "Manage Investors",
  },
  {
    id: "superadmin",
    icon: Lock,
    title: "Super Admin",
    desc: "Full system access",
  },
];


/* =========================================================
   REDIRECTS
========================================================= */

const roleRedirects = {
  investor: "/investor/dashboard",
  admin: "/admin/dashboard",
  superadmin: "/superadmin/dashboard",
};


/* =========================================================
   LOGIN COMPONENT
========================================================= */

export default function Login() {

  const navigate = useNavigate();


  /* =======================================================
     STATE
  ======================================================= */

  const [role, setRole] =
    useState("investor");


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


  const isInvestor =
    role === "investor";


  /* =======================================================
     CHANGE ROLE
  ======================================================= */

  const handleRoleChange = (id) => {

    setRole(id);

    setError("");

    setInvestorId("");

    setUsername("");

    setPassword("");

  };


  /* =======================================================
     STORE LOGIN DATA
  ======================================================= */

  const storeAuthData = (data) => {

    localStorage.setItem(
      "access_token",
      data.access_token
    );


    localStorage.setItem(
      "token_type",
      data.token_type ||
        "bearer"
    );


    localStorage.setItem(
      "user_id",
      String(data.user_id)
    );


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

  };


  /* =======================================================
     API ERROR
  ======================================================= */

  const getApiError = async (
    response
  ) => {

    try {

      const data =
        await response.json();


      if (
        Array.isArray(
          data.detail
        )
      ) {

        return data.detail
          .map(
            (item) =>
              item.msg
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


  /* =======================================================
     INVESTOR LOGIN
  ======================================================= */

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
                  cleanInvestorId
                    .toUpperCase(),

                password:
                  password,
              }),
            }
          );


        if (!response.ok) {

          const message =
            await getApiError(
              response
            );

          throw new Error(
            message
          );

        }


        const data =
          await response.json();


        console.log(
          "Investor login response:",
          data
        );


        storeAuthData(data);


        navigate(
          roleRedirects.investor
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


  /* =======================================================
     ADMIN LOGIN
  ======================================================= */

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

                password:
                  password,
              }),
            }
          );


        if (!response.ok) {

          const message =
            await getApiError(
              response
            );

          throw new Error(
            message
          );

        }


        const data =
          await response.json();


        console.log(
          "Admin login response:",
          data
        );


        storeAuthData(data);


        navigate(
          roleRedirects.admin
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


  /* =======================================================
     SUPERADMIN LOGIN
  ======================================================= */

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

                password:
                  password,
              }),
            }
          );


        if (!response.ok) {

          const message =
            await getApiError(
              response
            );

          throw new Error(
            message
          );

        }


        const data =
          await response.json();


        console.log(
          "Superadmin login response:",
          data
        );


        storeAuthData(data);


        navigate(
          roleRedirects.superadmin
        );

      } catch (err) {

        console.error(
          "Superadmin login error:",
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


  /* =======================================================
     MAIN LOGIN
  ======================================================= */

  const handleLogin = () => {

    if (loading) {
      return;
    }


    if (role === "investor") {

      handleInvestorLogin();

      return;

    }


    if (role === "admin") {

      handleAdminLogin();

      return;

    }


    if (
      role ===
      "superadmin"
    ) {

      handleSuperAdminLogin();

    }

  };


  /* =======================================================
     ENTER KEY
  ======================================================= */

  const handleKeyDown = (event) => {

    if (
      event.key ===
      "Enter"
    ) {

      handleLogin();

    }

  };


  /* =======================================================
     UI
  ======================================================= */

  return (

    <div className="auth-page">


      {/* =================================================
          LEFT
      ================================================= */}

      <div className="auth-left">

        <div className="auth-logo">

          <img
            src="/assets/logo.JPG"
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


      {/* =================================================
          RIGHT
      ================================================= */}

      <div className="auth-right">

        <div className="auth-form-wrap">


          {/* =================================================
              TITLE
          ================================================= */}

          <h2 className="auth-form-title">

            Welcome Back

          </h2>


          <p className="auth-form-subtitle">

            Sign in to your INRFS account

          </p>


          {/* =================================================
              ROLE
          ================================================= */}

          <div className="auth-field-label">

            Login As

          </div>


          <div className="role-grid">

            {roles.map(
              ({
                id,
                icon: Icon,
                title,
                desc,
              }) => (

                <button
                  type="button"
                  key={id}
                  className={`role-card${
                    role === id
                      ? " role-card-active"
                      : ""
                  }`}
                  onClick={() =>
                    handleRoleChange(
                      id
                    )
                  }
                  disabled={
                    loading
                  }
                >

                  <span className="role-card-icon">

                    <Icon size={18} />

                  </span>


                  <span className="role-card-title">

                    {title}

                  </span>


                  <span className="role-card-desc">

                    {desc}

                  </span>

                </button>

              )
            )}

          </div>


          {/* =================================================
              INVESTOR LOGIN
          ================================================= */}

          {isInvestor && (

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
                      e.target.value
                        .toUpperCase()
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  disabled={
                    loading
                  }
                  autoComplete="username"
                />

              </div>


              <label
                className="auth-field-label"
                htmlFor="investorPassword"
              >

                Password

              </label>


              <div className="auth-input">

                <Lock
                  size={16}
                  className="auth-input-icon"
                />


                <input
                  id="investorPassword"
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
                  disabled={
                    loading
                  }
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
                onClick={
                  handleLogin
                }
                disabled={
                  loading
                }
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

            </>

          )}


          {/* =================================================
              ADMIN / SUPERADMIN
          ================================================= */}

          {!isInvestor && (

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
                  disabled={
                    loading
                  }
                  autoComplete="username"
                />

              </div>


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
                  disabled={
                    loading
                  }
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
                onClick={
                  handleLogin
                }
                disabled={
                  loading
                }
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

            </>

          )}


          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="auth-divider" />


          {/* =================================================
              REGISTER
          ================================================= */}

          {isInvestor && (

            <p className="auth-register-hint">

              New investor?{" "}

              <a href="/register">
                Register Now
              </a>

            </p>

          )}


          {/* =================================================
              HOME
          ================================================= */}

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