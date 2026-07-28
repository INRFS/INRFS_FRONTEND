import React from "react";
import {
  Shield,
  Award,
  DollarSign,
  TrendingUp,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import "../../Styles/HomePage/Feature.css";

const features = [
  {
    icon: Shield,
    title: "Secure KYC Verification",
    desc: "Multi-layer document verification with Aadhaar and PAN authentication. Your identity, secured.",
  },
  {
    icon: Award,
    title: "Digital Bond Certificates",
    desc: "Legally valid digital investment bonds with QR verification, downloadable as PDF anytime.",
  },
  {
    icon: DollarSign,
    title: "Monthly Interest Payouts",
    desc: "Earn regular monthly interest credited directly to your bank account, on time, every month.",
  },
  {
    icon: TrendingUp,
    title: "Up to 13% Annual Returns",
    desc: "Competitive interest rates on fixed-income investments with flexible tenure options.",
  },
  {
    icon: BarChart3,
    title: "Real-time Dashboard",
    desc: "Track your portfolio performance, interest history, and upcoming payouts live.",
  },
  {
    icon: RefreshCw,
    title: "Flexible Settlement",
    desc: "Early settlement, tenure extension, and full settlement options with transparent terms.",
  },
];

export default function Feature() {
  return (
    <section className="inrfs-section" id="features">
      <div className="section-header">
        <span className="pill pill-light">⚡ WHY INRFS</span>
        <h2>Everything You Need to Invest Confidently</h2>
        <p>
          From KYC onboarding to bond generation, monthly interest payouts to
          full settlements — our end-to-end platform handles it all.
        </p>
      </div>

      <div className="features-grid">
        {features.map(({ icon: Icon, title, desc }) => (
          <div className="feature-card" key={title}>
            <div className="feature-icon">
              <Icon size={20} strokeWidth={2} />
            </div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
