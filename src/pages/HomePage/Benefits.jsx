import React from "react";
import {
  Shield,
  Award,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import "../../Styles/HomePage/Benefits.css";
import { useNavigate } from "react-router-dom";

const benefits = [
  "SEBI registered and RBI compliant operations",
  "Zero hidden charges — transparent fee structure",
  "Branch network across 12+ cities in India",
  "Dedicated relationship manager for every investor",
  "Bank-grade 256-bit SSL security for all transactions",
  "24/7 customer support via chat, email, and phone",
];

const benefitStats = [
  { icon: TrendingUp, label: "TOTAL RETURNS PAID", value: "₹4.2Cr+", bg: "#e8edff" },
  { icon: Award, label: "ACTIVE INVESTORS", value: "1,247", bg: "#e6f7ee" },
  { icon: Shield, label: "BONDS ISSUED", value: "3,890+", bg: "#f0e9ff" },
  { icon: DollarSign, label: "BRANCH OFFICES", value: "14", bg: "#fff2e0" },
];

export default function Benefits() {
  const navigate = useNavigate();
  return (
    <section className="inrfs-section" id="benefits">
      <div className="benefits-layout">
        <div className="benefits-left">
          <span className="pill pill-light">★ INVESTMENT BENEFITS</span>
          <h2>Why Thousands Trust INRFS</h2>
          <p className="benefits-intro">
            We combine the safety of fixed-income instruments with the
            transparency of modern technology.
          </p>
          <ul className="benefits-list">
            {benefits.map((item) => (
              <li key={item}>
                <CheckCircle2 size={16} className="check-icon" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button className="btn btn-primary btn-lg"onClick={() => navigate("/register")}>
            Open Your Account <ChevronRight size={16} />
          </button>
        </div>

        <div className="benefits-right">
          {benefitStats.map(({ icon: Icon, label, value, bg }) => (
            <div className="stat-card" key={label}>
              <div className="stat-card-top">
                <span className="stat-card-label">{label}</span>
                <span
                  className="stat-card-icon"
                  style={{ backgroundColor: bg }}
                >
                  <Icon size={16} />
                </span>
              </div>
              <div className="stat-card-value">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
