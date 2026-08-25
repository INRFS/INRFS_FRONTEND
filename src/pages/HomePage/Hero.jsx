import React, {
  useEffect,
  useState,
} from "react";

import { Plus } from "lucide-react";

import { useNavigate } from "react-router-dom";

import "../../Styles/HomePage/Hero.css";

import {
  getPublicHomeStats,
} from "../../services/landingService";


const DEFAULT_HERO = {
  total_aum_label: "₹0",
  active_investors_label: "0",
  max_interest_rate_label: "0%",
  approval_time_label: "48hrs",
  total_invested_label: "₹0",
  interest_earned_label: "₹0",
  active_bonds: 0,
  next_payout_label: "₹0",
  featured_bond: {
    id: "INRFS-INVESTMENT",
    title: "Fixed Deposit",
    status: "Available",
  },
};


export default function Hero() {
  const navigate = useNavigate();

  const [hero, setHero] =
    useState(DEFAULT_HERO);

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        const response =
          await getPublicHomeStats();

        if (!mounted) {
          return;
        }

        setHero({
          ...DEFAULT_HERO,
          ...(response?.data?.hero || {}),
          featured_bond: {
            ...DEFAULT_HERO.featured_bond,
            ...(response?.data?.hero?.featured_bond || {}),
          },
        });
      } catch (error) {
        console.error(
          "Failed to load public homepage stats:",
          error
        );
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  const heroStats = [
    {
      value: hero.total_aum_label,
      label: "TOTAL AUM",
    },
    {
      value: hero.active_investors_label,
      label: "ACTIVE INVESTORS",
    },
    {
      value: hero.max_interest_rate_label,
      label: "MAX INTEREST RATE",
    },
    {
      value: hero.approval_time_label,
      label: "APPROVAL TIME",
    },
  ];

  const featuredBond =
    hero.featured_bond || {};

  return (
    <section className="inrfs-hero">
      <div className="inrfs-hero-inner">
        <div className="inrfs-hero-left">
          <span className="pill pill-dark">
            <span className="pill-dot" />
            SEBI COMPLIANT INVESTMENT PLATFORM
          </span>

          <h1 className="inrfs-hero-title">
            Invest Smarter.
            <br />
            <span className="gradient-text">
              Grow Faster.
            </span>
            <br />
            With INRFS.
          </h1>

          <p className="inrfs-hero-subtitle">
            India's most trusted investor management
            portal. Earn up to competitive returns
            on fixed-income investments. Secure,
            transparent, and professionally managed.
          </p>

          <div className="inrfs-hero-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() =>
                navigate("/register")
              }
            >
              <Plus
                size={16}
                strokeWidth={2.5}
              />
              Start Investing Today
            </button>

            <button
              className="btn btn-outline-dark btn-lg"
              onClick={() =>
                navigate("/login")
              }
            >
              Existing Investor? Login
            </button>
          </div>

          <div className="inrfs-hero-stats">
            {heroStats.map((stat) => (
              <div
                className="hero-stat"
                key={stat.label}
              >
                <div className="hero-stat-value">
                  {stat.value}
                </div>

                <div className="hero-stat-label">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="inrfs-hero-right">
          <div className="portfolio-card">
            <div className="portfolio-card-header">
              PORTFOLIO OVERVIEW
            </div>

            <div className="portfolio-grid">
              <div className="portfolio-tile">
                <div className="portfolio-tile-label">
                  Total Invested
                </div>

                <div className="portfolio-tile-value">
                  {hero.total_invested_label}
                </div>
              </div>

              <div className="portfolio-tile">
                <div className="portfolio-tile-label">
                  Interest Earned
                </div>

                <div className="portfolio-tile-value">
                  {hero.interest_earned_label}
                </div>
              </div>

              <div className="portfolio-tile">
                <div className="portfolio-tile-label">
                  Active Bonds
                </div>

                <div className="portfolio-tile-value">
                  {hero.active_bonds}
                </div>
              </div>

              <div className="portfolio-tile">
                <div className="portfolio-tile-label">
                  Next Payout
                </div>

                <div className="portfolio-tile-value">
                  {hero.next_payout_label}
                </div>
              </div>
            </div>

            <div className="bond-card">
              <div>
                <div className="bond-card-id">
                  {featuredBond.id}
                </div>

                <div className="bond-card-title">
                  {featuredBond.title}
                </div>
              </div>

              <span className="badge-active">
                {featuredBond.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}