import React from "react";
import Header from "./Header";
import Hero from "./Hero";
import Feature from "./Feature";
import Benefits from "./Benefits";
import Testimonials from "./Testimonials";
import Footer from "./Footer";
import "../../Styles/HomePage/HomePage.css";

export default function HomePage() {
  return (
    <div className="inrfs-page">
      <Header />
      <Hero />
      <Feature />
      <Benefits />
      <Testimonials />
      <Footer />
    </div>
  );
}
