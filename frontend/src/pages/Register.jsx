import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { Shield } from "lucide-react";
import "./Register.css";
import aadhaarBg from "../assets/aadhaar.png";
import { sendOtp, verifyOtp } from "../services/portalApi";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "",
    mobile: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [errors, setErrors] = useState({});
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    const newErrors = { ...errors };

    if (name === "fullName") {
      if (!value.trim()) newErrors.fullName = "Name is required";
      else if (!/^[A-Za-z\s]*$/.test(value)) newErrors.fullName = "Enter name only (letters)";
      else delete newErrors.fullName;
    }

    if (name === "email") {
      if (!value.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(value)) newErrors.email = "Enter valid email";
      else delete newErrors.email;
    }

    if (name === "mobile") {
      if (!/^[0-9]*$/.test(value)) newErrors.mobile = "Only numbers allowed";
      else if (value.length > 10) newErrors.mobile = "Mobile must be 10 digits";
      else delete newErrors.mobile;
    }

    if (name === "password") {
      setPasswordChecks({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[@$!%*?&]/.test(value),
      });
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (!/^[A-Za-z\s]+$/.test(form.fullName)) newErrors.fullName = "Name should contain only letters";

    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Enter valid email address";

    if (!form.mobile) newErrors.mobile = "Mobile number is required";
    else if (!/^[0-9]{10}$/.test(form.mobile)) newErrors.mobile = "Enter valid 10 digit mobile number";

    if (!form.role) newErrors.role = "Please select role";
    if (!form.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await sendOtp({ email: form.email });
      alert(res.message);
      if (res.success) {
        setOtpSent(true);
        setOtpExpired(false);
        setTimerKey((prev) => prev + 1);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(form.password)) {
      alert(
        "Password must contain:\n\n" +
          "• Minimum 8 characters\n" +
          "• One uppercase letter\n" +
          "• One lowercase letter\n" +
          "• One number\n" +
          "• One special character"
      );
      return;
    }

    if (otpExpired) {
      alert("OTP expired. Please resend OTP.");
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp({ ...form, otp });
      alert(res.message);
      if (res.message === "User Registered Successfully") {
        if (res.token) {
          localStorage.setItem("token", res.token);
        }
        setOtpSent(false);
        setOtp("");
        navigate("/login");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page" style={{ backgroundImage: `url(${aadhaarBg})` }}>
      <header className="register-header">
        <div className="register-header-inner">
          <div className="register-brand-wrap">
            <div className="asa-dash-brand-icon register-brand-icon">
              <Shield size={18} />
            </div>
            <div>
              <h1 className="register-brand-title">UIDAI Portal</h1>
              <p className="register-brand-subtitle">ASA Onboarding</p>
            </div>
          </div>

          <div className="register-header-right">
            <nav className="register-nav">
              <Link to="/" className="register-nav-link">Home</Link>
              <a href="#" className="register-nav-link">About</a>
              <a href="#" className="register-nav-link">Onboarding Process</a>
              <a href="#" className="register-nav-link">Guidelines</a>
            </nav>

            <div className="register-header-actions">
              <Link to="/register" className="register-header-btn register-header-btn-primary">
                Register
              </Link>
              <Link to="/login" className="register-header-btn register-header-btn-muted">
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="register-container">
        <div className="register-card">
          <h2>Create Account</h2>

          <input name="fullName" placeholder="Full Name" onChange={handleChange} className={errors.fullName ? "input-error" : ""} />
          {errors.fullName && <p className="error-text">{errors.fullName}</p>}

          <input name="email" placeholder="Email" onChange={handleChange} className={errors.email ? "input-error" : ""} />
          {errors.email && <p className="error-text">{errors.email}</p>}

          <select name="role" onChange={handleChange} className={errors.role ? "input-error" : ""}>
            <option value="">Select Role</option>
            <option>Auditor</option>
            <option>Admin</option>
            <option>IS Division</option>
            <option>Tech Centre</option>
            <option>Applicant</option>
          </select>
          {errors.role && <p className="error-text">{errors.role}</p>}

          <input name="mobile" placeholder="Mobile" onChange={handleChange} className={errors.mobile ? "input-error" : ""} />
          {errors.mobile && <p className="error-text">{errors.mobile}</p>}

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            onFocus={() => setShowPasswordRules(true)}
            onBlur={() => setShowPasswordRules(false)}
          />

          <div style={{ fontSize: "12px", marginBottom: "10px" }}>
            {showPasswordRules && (
              <p className="password-rules">
                <span
                  style={{
                    color:
                      passwordChecks.length &&
                      passwordChecks.uppercase &&
                      passwordChecks.lowercase &&
                      passwordChecks.number &&
                      passwordChecks.special
                        ? "green"
                        : "red",
                  }}
                >
                  Password must contain:
                </span>
                <span style={{ color: passwordChecks.length ? "green" : "red" }}> • Minimum 8 characters</span>
                <span style={{ color: passwordChecks.uppercase ? "green" : "red" }}> • One uppercase letter</span>
                <span style={{ color: passwordChecks.lowercase ? "green" : "red" }}> • One lowercase letter</span>
                <span style={{ color: passwordChecks.number ? "green" : "red" }}> • One number</span>
                <span style={{ color: passwordChecks.special ? "green" : "red" }}> • One special character</span>
              </p>
            )}
          </div>

          {!otpSent && (
            <button className="register-submit" onClick={handleSendOtp} disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          )}

          {otpSent && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />

                <div className="otp-timer">
                  <CountdownCircleTimer
                    key={timerKey}
                    isPlaying
                    duration={60}
                    colors="#facc15"
                    size={45}
                    strokeWidth={6}
                    onComplete={() => {
                      setOtpExpired(true);
                      return { shouldRepeat: false };
                    }}
                  >
                    {({ remainingTime }) => (
                      <div style={{ color: "#ffe600", fontWeight: "700", fontSize: "14px", textShadow: "0 1px 2px rgba(0,0,0,0.7)" }}>{remainingTime}</div>
                    )}
                  </CountdownCircleTimer>
                </div>
              </div>

              {!otpExpired && (
                <button
                  className="register-submit"
                  onClick={handleVerifyOtp}
                  disabled={!otp || loading}
                  style={{ marginTop: "10px" }}
                >
                  {loading ? "Verifying..." : "Verify OTP & Register"}
                </button>
              )}

              {otpExpired && (
                <button
                  className="register-submit"
                  onClick={handleSendOtp}
                  style={{ marginTop: "10px", backgroundColor: "#facc15" }}
                  disabled={loading}
                >
                  {loading ? "Resending..." : "Resend OTP"}
                </button>
              )}
            </>
          )}

          <p className="register-link">
            Already have account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>

      <footer className="register-footer">
        <div className="register-footer-inner">
          <div className="register-footer-brand">
            <div className="ey-mini-logo">
              <Shield size={12} />
            </div>
            <span>UIDAI ASA Portal</span>
          </div>

          <div className="register-footer-links">
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}





