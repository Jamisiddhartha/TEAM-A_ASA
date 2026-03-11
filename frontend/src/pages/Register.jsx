import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import "./Register.css";
import aadhaarBg from "../assets/aadhaar.png";
import uidaiLogo from "../assets/uidai-logo.jpg";
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
      <header className="w-full bg-white border-b shadow-sm fixed top-0 left-0 z-50">
        <div className="max-w-screen-xl mx-auto px-8 py-3 flex items-center">
          <div className="flex items-center gap-3">
            <img src={uidaiLogo} className="h-10" />
            <div>
              <h1 className="text-xl font-semibold">
                <span style={{ color: "#FFE600" }}>UIDAI</span> PortalPortal
              </h1>
              <p className="text-xs text-gray-500">ASA Onboarding</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center ml-auto gap-6 text-sm text-gray-700">
            <a href="/" className="hover:text-orange-500 cursor-pointer">Home</a>
            <a href="#" className="hover:text-orange-500 cursor-pointer">About</a>
            <a href="#" className="hover:text-orange-500 cursor-pointer">Onboarding Process</a>
            <a href="#" className="hover:text-orange-500 cursor-pointer">Guidelines</a>
          </nav>

          <div className="hidden md:flex items-center gap-4 ml-6">
            <Link to="/register" className="px-4 py-2 border bg-gray-300 border-gray-400 rounded-md hover:bg-gray-100">
              Register
            </Link>
            <Link to="/login" className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-500">
              Login
            </Link>
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
                      <div style={{ color: "#000", fontWeight: "bold", fontSize: "14px" }}>{remainingTime}</div>
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

      <footer className="bg-white border-t py-4 fixed bottom-0 left-0 w-full z-50">
        <div className="max-w-screen-xl mx-auto px-8 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <img src={uidaiLogo} className="h-6" />
            <span>UIDAI ASA Portal</span>
          </div>

          <div className="flex gap-6">
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
