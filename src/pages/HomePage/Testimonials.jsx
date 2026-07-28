import React from "react";
import { Star } from "lucide-react";
import "../../Styles/HomePage/Testimonials.css";
import { useNavigate } from "react-router-dom";

const testimonials = [
  {
    quote:
      "INRFS has been a game changer for my retirement planning. The monthly interest arrives on time, and the bond certificate gives me complete peace of mind.",
    name: "Rajesh Nair",
    role: "Retired Teacher, Kerala",
    initial: "R",
  },
  {
    quote:
      "I was skeptical at first, but after seeing 12% annual returns consistently for 18 months, I've increased my investment. The app is incredibly easy to use.",
    name: "Ananya Krishnan",
    role: "Software Engineer, Bangalore",
    initial: "A",
  },
  {
    quote:
      "The transparent dashboard shows every transaction. I can see my interest accruing in real-time. Best fixed-income platform I've used in India.",
    name: "Suresh Reddy",
    role: "Business Owner, Hyderabad",
    initial: "S",
  },
];

export default function Testimonials() {
    const navigate = useNavigate();
  return (
    <>
      <section className="inrfs-section" id="testimonials">
        <div className="section-header">
          <span className="pill pill-light">☆ TESTIMONIALS</span>
          <h2>What Our Investors Say</h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <div className="stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="#f59e0b" stroke="#f59e0b" />
                ))}
              </div>
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-author">
                <span className="avatar">{t.initial}</span>
                <div>
                  <div className="author-name">{t.name}</div>
                  <div className="author-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="inrfs-cta">
        <h2>Ready to Start Investing?</h2>
        <p>
          Join 1,200+ investors already growing their wealth with INRFS.
          Registration takes less than 10 minutes.
        </p>
        <div className="inrfs-cta-actions">
          <button className="btn btn-white btn-lg"  onClick={() => navigate("/register")}>Register as Investor</button>
          <button className="btn btn-outline-light btn-lg"  onClick={() => navigate("/login")}>
            Login to Portal
          </button>
        </div>
      </section>
    </>
  );
}
