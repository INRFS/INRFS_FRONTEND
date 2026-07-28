import React from "react";
import { Plus } from "lucide-react";
import "../../Styles/HomePage/Hero.css";
import { useNavigate } from "react-router-dom";

const heroStats = [
  { value: "₹58Cr+", label: "TOTAL AUM" },
  { value: "1,200+", label: "ACTIVE INVESTORS" },
  { value: "13%", label: "MAX ANNUAL RETURN" },
  { value: "48hrs", label: "APPROVAL TIME" },
];

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="inrfs-hero">
      <div className="inrfs-hero-inner">
        <div className="inrfs-hero-left">
          <span className="pill pill-dark">
            <span className="pill-dot" /> SEBI COMPLIANT INVESTMENT PLATFORM
          </span>
          <h1 className="inrfs-hero-title">
            Invest Smarter.
            <br />
            <span className="gradient-text">Grow Faster.</span>
            <br />
            With INRFS.
          </h1>
          <p className="inrfs-hero-subtitle">
            India's most trusted investor management portal. Earn up to 13%
            annual returns on fixed-income investments. Secure, transparent,
            and professionally managed.
          </p>
          <div className="inrfs-hero-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate("/register")}
            >
              <Plus size={16} strokeWidth={2.5} /> Start Investing Today
            </button>
            <button
              className="btn btn-outline-dark btn-lg"
              onClick={() => navigate("/login")}
            >
              Existing Investor? Login
            </button>
          </div>

          <div className="inrfs-hero-stats">
            {heroStats.map((stat) => (
              <div className="hero-stat" key={stat.label}>
                <div className="hero-stat-value">{stat.value}</div>
                <div className="hero-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="inrfs-hero-right">
          <div className="portfolio-card">
            <div className="portfolio-card-header">PORTFOLIO OVERVIEW</div>
            <div className="portfolio-grid">
              <div className="portfolio-tile">
                <div className="portfolio-tile-label">Total Invested</div>
                <div className="portfolio-tile-value">₹8,00,000</div>
              </div>
              <div className="portfolio-tile">
                <div className="portfolio-tile-label">Interest Earned</div>
                <div className="portfolio-tile-value">₹72,000</div>
              </div>
              <div className="portfolio-tile">
                <div className="portfolio-tile-label">Active Bonds</div>
                <div className="portfolio-tile-value">3</div>
              </div>
              <div className="portfolio-tile">
                <div className="portfolio-tile-label">Next Payout</div>
                <div className="portfolio-tile-value">₹8,000</div>
              </div>
            </div>
            <div className="bond-card">
              <div>
                <div className="bond-card-id">BND-2025-001</div>
                <div className="bond-card-title">
                  Fixed Deposit — 12% p.a.
                </div>
              </div>
              <span className="badge-active">Active</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
