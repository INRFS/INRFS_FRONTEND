import React from "react";
import "../../Styles/HomePage/Footer.css";

export default function Footer() {
  return (
    <footer className="inrfs-footer" id="contact">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="inrfs-logo">
             <img
            src="/assets/logo.jpg"
            alt="INRFS Logo"
            className="inrfs-logo-img"
          />
          </div>
          <p>
            India's trusted investor management and fixed-income investment
            portal. Regulated, secure, and committed to your financial
            growth.
          </p>
        </div>

        <div className="footer-col">
          <h4>Investors</h4>
          <a href="/register">Register</a>
          <a href="/login">Login</a>
          <a href="#dashboard">My Dashboard</a>
          <a href="#investments">My Investments</a>
          <a href="#profile">Profile</a>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <a href="#about">About INRFS</a>
          <a href="#careers">Careers</a>
          <a href="#press">Press</a>
          <a href="#blog">Blog</a>
          <a href="#contact">Contact Us</a>
        </div>

        <div className="footer-col">
          <h4>Legal</h4>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#kyc">KYC Policy</a>
          <a href="#grievance">Grievance</a>
          <a href="#sebi">SEBI Registration</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2025 INRFS Investment Portal. All rights reserved.</span>
        <span>SEBI Registration No: IN123456789 | CIN: U65900MH2020PTC123456</span>
      </div>
    </footer>
  );
}
