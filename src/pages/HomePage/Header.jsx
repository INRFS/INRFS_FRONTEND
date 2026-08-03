import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import "../../Styles/HomePage/Header.css";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#features", label: "Features" },
  { href: "#benefits", label: "Benefits" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock background scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="inrfs-navbar">
      <div className="inrfs-navbar-inner">
        <div className="inrfs-logo">
          <img src="/assets/logo.jpg" alt="INRFS Logo" className="inrfs-logo-img" />
        </div>

        <nav className="inrfs-nav-links">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="inrfs-nav-actions">
          <button className="btn btn-outline" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/register")}>
            Register as Investor
          </button>
        </div>

        <button
          type="button"
          className="inrfs-menu-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Backdrop */}
      <div
        className={`inrfs-mobile-backdrop${menuOpen ? " inrfs-mobile-backdrop-open" : ""}`}
        onClick={closeMenu}
      />

      {/* Mobile slide-down menu */}
      <div className={`inrfs-mobile-menu${menuOpen ? " inrfs-mobile-menu-open" : ""}`}>
        <nav className="inrfs-mobile-nav-links">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="inrfs-mobile-nav-actions">
          <button
            className="btn btn-outline"
            onClick={() => {
              closeMenu();
              navigate("/login");
            }}
          >
            Login
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              closeMenu();
              navigate("/register");
            }}
          >
            Register as Investor
          </button>
        </div>
      </div>
    </header>
  );
}