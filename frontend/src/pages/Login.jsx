import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "./Login.css";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import aadhaarBg from "../assets/aadhaar.png";

export default function Login() {

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {

    if (!captchaToken) {
      alert("Please verify captcha");
      return;
    }

    try {

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          ...form,
          captcha: captchaToken
        }
      );

      alert(res.data.message);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      setLoading(false);

    } catch (err) {

      console.log(err);
      alert("Login failed");
      setLoading(false);

    }

  };

  return (
  <div className="login-page" style={{ backgroundImage: `url(${aadhaarBg})` }}>
      {/* NAVBAR */}
      <nav className="login-navbar">
        <div className="navbar-brand">
          <span className="navbar-title">UIDAI Portal</span>
          <span className="navbar-subtitle">ASA Onboarding</span>
        </div>
        <div className="navbar-links">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Onboarding Process</a>
          <a href="#">Guidelines</a>
          <Link to="/register">
            <button className="btn btn-primary btn-sm">Register</button>
          </Link>
          <button className="btn btn-secondary btn-sm">Login</button>
        </div>
      </nav>

      {/* LOGIN SECTION */}

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

          {/* PASSWORD */}

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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>


          {/* CAPTCHA */}

          <div className="captcha-box">

            <ReCAPTCHA
              sitekey="6Lc20X8sAAAAAGzkMW7hsJ8Q3bq2l4c-f9yIfLYM"
              onChange={(token) => setCaptchaToken(token)}
            />

          </div>


          {/* LOGIN BUTTON */}

          <button
            onClick={handleLogin}
            className="btn btn-primary btn-login"
          >

            {loading ? "Logging in..." : "Login"}

          </button>


          {/* REGISTER */}

         <p className="register-link">
              New user?{" "}
              <Link to="/register" className="register-link-anchor">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </main>
        


       {/* FOOTER */}
      <footer className="login-footer">
        <span className="footer-brand">UIDAI ASA Portal</span>
        <div className="footer-links">
          <a href="#">Contact</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </footer>

    </div>

  );
}