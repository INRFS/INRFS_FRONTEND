import React, {
  useEffect,
  useState,
} from "react";

import {
  Award,
  DollarSign,
  Shield,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

import "../../Styles/HomePage/Benefits.css";

import { useNavigate } from "react-router-dom";

import {
  getPublicHomeStats,
} from "../../services/landingService";


const benefits = [
  "SEBI registered and RBI compliant operations",
  "Zero hidden charges — transparent fee structure",
  "Branch network across multiple cities in India",
  "Dedicated relationship manager for every investor",
  "Bank-grade security for all transactions",
  "Customer support via chat, email, and phone",
];


const DEFAULT_BENEFITS = {
  total_returns_paid_label: "₹0",
  active_investors: 0,
  bonds_issued: 0,
  branch_offices: 0,
};


export default function Benefits() {
  const navigate = useNavigate();

  const [stats, setStats] =
    useState(DEFAULT_BENEFITS);

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        const response =
          await getPublicHomeStats();

        if (!mounted) {
          return;
        }

        setStats({
          ...DEFAULT_BENEFITS,
          ...(response?.data?.benefits || {}),
        });
      } catch (error) {
        console.error(
          "Failed to load public homepage benefits stats:",
          error
        );
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  const benefitStats = [
    {
      icon: TrendingUp,
      label: "TOTAL RETURNS PAID",
      value:
        stats.total_returns_paid_label,
      bg: "#e8edff",
    },
    {
      icon: Award,
      label: "ACTIVE INVESTORS",
      value:
        stats.active_investors.toLocaleString(),
      bg: "#e6f7ee",
    },
    {
      icon: Shield,
      label: "BONDS ISSUED",
      value:
        stats.bonds_issued.toLocaleString(),
      bg: "#f0e9ff",
    },
    {
      icon: DollarSign,
      label: "BRANCH OFFICES",
      value:
        stats.branch_offices.toLocaleString(),
      bg: "#fff2e0",
    },
  ];

  return (
    <section
      className="inrfs-section"
      id="benefits"
    >
      <div className="benefits-layout">
        <div className="benefits-left">
          <span className="pill pill-light">
            ★ INVESTMENT BENEFITS
          </span>

          <h2>
            Why Thousands Trust INRFS
          </h2>

          <p className="benefits-intro">
            We combine the safety of fixed-income
            instruments with the transparency of
            modern technology.
          </p>

          <ul className="benefits-list">
            {benefits.map((item) => (
              <li key={item}>
                <CheckCircle2
                  size={16}
                  className="check-icon"
                />

                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button
            className="btn btn-primary btn-lg"
            onClick={() =>
              navigate("/register")
            }
          >
            Open Your Account
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="benefits-right">
          {benefitStats.map(
            ({
              icon: Icon,
              label,
              value,
              bg,
            }) => (
              <div
                className="stat-card"
                key={label}
              >
                <div className="stat-card-top">
                  <span className="stat-card-label">
                    {label}
                  </span>

                  <span
                    className="stat-card-icon"
                    style={{
                      backgroundColor: bg,
                    }}
                  >
                    <Icon size={16} />
                  </span>
                </div>

                <div className="stat-card-value">
                  {value}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}