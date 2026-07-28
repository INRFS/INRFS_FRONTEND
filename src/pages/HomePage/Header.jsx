import React from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/HomePage/Header.css";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="inrfs-navbar">
      <div className="inrfs-navbar-inner">
        <div className="inrfs-logo">
          <img src="/assets/logo.jpg" alt="INRFS Logo" className="inrfs-logo-img"/>
        </div>
        <nav className="inrfs-nav-links">
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#benefits">Benefits</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="inrfs-nav-actions">
          <button className="btn btn-outline" onClick={() => navigate("/login")}>
            Login
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/register")}
          >
            Register as Investor
          </button>
        </div>
      </div>
    </header>
  );
}
