import React from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import "./Landing.css";
import heroImage from "../assets/aadhaar.png";
import securityIcon from "../assets/security.jpeg";
import trackIcon from "../assets/track.jpeg";
import secureIcon from "../assets/secure.jpeg";

const LandingPage = () => {
  return (
    <div className="landing-page" style={{ backgroundImage: `url(${heroImage})` }}>
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-brand-wrap">
            <div className="asa-dash-brand-icon landing-brand-icon">
              <Shield size={18} />
            </div>
            <div>
              <h1 className="landing-brand-title">UIDAI Portal</h1>
              <p className="landing-brand-subtitle">ASA Onboarding</p>
            </div>
          </div>

          <div className="landing-header-right">
            <nav className="landing-links">
              <Link to="/" className="landing-link">Home</Link>
              <a href="#" className="landing-link">About</a>
              <a href="#" className="landing-link">Onboarding Process</a>
              <a href="#" className="landing-link">Guidelines</a>
            </nav>

            <div className="landing-header-actions">
              <Link to="/register" className="landing-header-btn landing-header-btn-primary">Register</Link>
              <Link to="/login" className="landing-header-btn landing-header-btn-muted">Login</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-content">
            <h2>
              Authentication Service
              <br />
              <span>Agency Portal</span>
            </h2>

            <p>
              Secure platform to apply and manage ASA onboarding and access services in a transparent manner.
            </p>

            <div className="landing-hero-actions">
              <Link to="/login" className="landing-cta">Apply Now</Link>
            </div>
          </div>
        </section>

        <section className="landing-features">
          <div className="landing-features-inner">
            <h3>
              Key <span>Features</span>
            </h3>

            <div className="landing-feature-grid">
              <article className="landing-feature-card">
                <div className="landing-feature-icon-wrap">
                  <img src={securityIcon} className="landing-feature-icon" alt="Security" />
                </div>
                <h4>Security Authentication</h4>
                <p>Robust security measures to protect your data and privacy</p>
              </article>

              <article className="landing-feature-card">
                <div className="landing-feature-icon-wrap">
                  <img src={secureIcon} className="landing-feature-icon" alt="Review" />
                </div>
                <h4>Officer Review Ready</h4>
                <p>Step 3 approval and condition verification are available from the dashboard.</p>
              </article>

              <article className="landing-feature-card">
                <div className="landing-feature-icon-wrap">
                  <img src={trackIcon} className="landing-feature-icon" alt="Process" />
                </div>
                <h4>Transparent Process</h4>
                <p>Experience a fully digital and transparent onboarding process</p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <div className="ey-mini-logo">
              <Shield size={12} />
            </div>
            <span>UIDAI ASA Portal</span>
          </div>

          <div className="landing-footer-links">
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
