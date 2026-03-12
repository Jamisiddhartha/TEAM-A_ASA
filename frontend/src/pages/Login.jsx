import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "./Login.css";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import aadhaarBg from "../assets/aadhaar.png";
import { loginUser } from "../services/portalApi";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState("");

  const isLocalDev = useMemo(() => {
    if (typeof window === "undefined") return false;
    return ["localhost", "127.0.0.1"].includes(window.location.hostname);
  }, []);

  const handleChange = (e) => {
    setFeedback("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      setFeedback("Enter both email and password.");
      return;
    }

    if (!captchaToken && !isLocalDev) {
      setFeedback("Please verify captcha before login.");
      return;
    }

    try {
      setLoading(true);
      setFeedback(isLocalDev && !captchaToken ? "Captcha bypassed for local development." : "");
      const res = await loginUser({ email, password });

      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        navigate("/dashboard");
      } else {
        setFeedback(res.message || "Login failed.");
      }
    } catch (err) {
      setFeedback(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${aadhaarBg})` }}>
      <header className="login-header">
        <div className="login-header-inner">
          <div className="login-brand-wrap">
            <div className="asa-dash-brand-icon login-brand-icon"><Shield size={18} /></div>
            <div>
              <h1 className="login-brand-title">UIDAI Portal</h1>
              <p className="login-brand-subtitle">ASA Onboarding</p>
            </div>
          </div>

          <div className="login-header-right">
            <nav className="login-links">
              <Link to="/" className="login-link">Home</Link>
              <a href="#" className="login-link">About</a>
              <a href="#" className="login-link">Onboarding Process</a>
              <a href="#" className="login-link">Guidelines</a>
            </nav>

            <div className="login-header-actions">
              <Link to="/register" className="login-header-btn login-header-btn-primary">Register</Link>
              <Link to="/login" className="login-header-btn login-header-btn-muted">Login</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="login-main">
        <div className="login-content">
          <div className="login-card">
            <h2 className="login-card-title">ASA Portal Login</h2>

            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="input-field"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="captcha-box">
              <ReCAPTCHA
                sitekey="6Lc20X8sAAAAAGzkMW7hsJ8Q3bq2l4c-f9yIfLYM"
                onChange={(token) => {
                  setCaptchaToken(token);
                  setFeedback("");
                }}
              />
            </div>

            {feedback ? <p className="login-feedback">{feedback}</p> : null}
            {isLocalDev ? <p className="login-dev-note">Local development mode: captcha can be bypassed for testing.</p> : null}

            <button type="button" onClick={handleLogin} className="btn btn-primary btn-login" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="register-link">
              New user?{" "}
              <Link to="/register" className="register-link-anchor">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="login-footer">
        <div className="login-footer-inner">
          <div className="footer-brand-wrap">
            <div className="ey-mini-logo"><Shield size={12} /></div>
            <span>UIDAI ASA Portal</span>
          </div>

          <div className="footer-links">
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}


