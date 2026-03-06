import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import "./Register.css";
import aadhaarBg from "../assets/aadhaar.png";

export default function Register() {

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "",
    mobile: "",
    password: ""
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
  special: false
});
const [showPasswordRules, setShowPasswordRules] = useState(false);
const handleChange = (e) => {

  const { name, value } = e.target;

  setForm({ ...form, [name]: value });

  let newErrors = { ...errors };

  // NAME VALIDATION
  if (name === "fullName") {

    if (!value.trim()) {
      newErrors.fullName = "Name is required";
    }
    else if (!/^[A-Za-z\s]*$/.test(value)) {
      newErrors.fullName = "Enter name only (letters)";
    }
    else {
      delete newErrors.fullName;
    }

  }

  // EMAIL VALIDATION
  if (name === "email") {

    if (!value.trim()) {
      newErrors.email = "Email is required";
    }
    else if (!/\S+@\S+\.\S+/.test(value)) {
      newErrors.email = "Enter valid email";
    }
    else {
      delete newErrors.email;
    }

  }

  // MOBILE VALIDATION
  if (name === "mobile") {

    if (!/^[0-9]*$/.test(value)) {
      newErrors.mobile = "Only numbers allowed";
    }
    else if (value.length > 10) {
      newErrors.mobile = "Mobile must be 10 digits";
    }
    else {
      delete newErrors.mobile;
    }

  }

  // PASSWORD VALIDATION (for green rules)
  if (name === "password") {

    setPasswordChecks({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[@$!%*?&]/.test(value)
    });

  }

  setErrors(newErrors);

};
const validateForm = () => {

  let newErrors = {};

  // NAME VALIDATION
  if (!form.fullName.trim()) {
    newErrors.fullName = "Full name is required";
  } 
  else if (!/^[A-Za-z\s]+$/.test(form.fullName)) {
    newErrors.fullName = "Name should contain only letters";
  }

  // EMAIL VALIDATION
  if (!form.email) {
    newErrors.email = "Email is required";
  } 
  else if (!/\S+@\S+\.\S+/.test(form.email)) {
    newErrors.email = "Enter valid email address";
  }

  // MOBILE VALIDATION
  if (!form.mobile) {
    newErrors.mobile = "Mobile number is required";
  } 
  else if (!/^[0-9]{10}$/.test(form.mobile)) {
    newErrors.mobile = "Enter valid 10 digit mobile number";
  }

  // ROLE VALIDATION
  if (!form.role) {
    newErrors.role = "Please select role";
  }

  // PASSWORD VALIDATION
  if (!form.password) {
    newErrors.password = "Password is required";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};
  // SEND OTP
 const sendOtp = async () => {

  // run validation first
  if (!validateForm()) {
    return;   // stop OTP if form invalid
  }

  try {

    const res = await axios.post(
      "http://localhost:5000/api/auth/send-otp",
      { email: form.email }
    );

    alert(res.data.message);

    if(res.data.success){
      setOtpSent(true);
      setOtpExpired(false);
      setTimerKey(prev => prev + 1);
    }

  } catch (err) {

    alert("Error sending OTP");

  }

};

  // VERIFY OTP
  const verifyOtp = async () => {

    const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

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

      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        { ...form, otp }
      );

      alert(res.data.message);

    } catch (err) {

      alert("Verification failed");

    }

  };

  return (

<div className="register-page" style={{ backgroundImage: `url(${aadhaarBg})` }}>

{/* NAVBAR */}

<nav className="register-navbar">

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
<button className="register-btn">Register</button>
</Link>

<Link to="/">
<button className="login-btn">Login</button>
</Link>

</div>

</nav>


{/* REGISTER SECTION */}

<div className="register-container">

{/* FORM CARD */}

<div className="register-card">

<h2>Create Account</h2>


<input
name="fullName"
placeholder="Full Name"
onChange={handleChange}
className={errors.fullName ? "input-error" : ""}
/>

{errors.fullName && <p className="error-text">{errors.fullName}</p>}


<input
name="email"
placeholder="Email"
onChange={handleChange}
className={errors.email ? "input-error" : ""}
/>

{errors.email && <p className="error-text">{errors.email}</p>}


<select
name="role"
onChange={handleChange}
className={errors.role ? "input-error" : ""}
>
<option value="">Select Role</option>
<option>Auditor</option>
<option>Admin</option>
<option>Applicant</option>
</select>

{errors.role && <p className="error-text">{errors.role}</p>}


<input
name="mobile"
placeholder="Mobile"
onChange={handleChange}
className={errors.mobile ? "input-error" : ""}
/>

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
: "red"
}}
>
Password must contain:
</span>

<span style={{ color: passwordChecks.length ? "green" : "red" }}>
 • Minimum 8 characters
</span>

<span style={{ color: passwordChecks.uppercase ? "green" : "red" }}>
 • One uppercase letter
</span>

<span style={{ color: passwordChecks.lowercase ? "green" : "red" }}>
 • One lowercase letter
</span>

<span style={{ color: passwordChecks.number ? "green" : "red" }}>
 • One number
</span>

<span style={{ color: passwordChecks.special ? "green" : "red" }}>
 • One special character
</span>

</p>

)}

</div>


{!otpSent && (
<button className="register-submit" onClick={sendOtp}>
Send OTP
</button>
)}


{otpSent && (

<>

<div
style={{
display: "flex",
alignItems: "center",
gap: "10px",
marginTop: "10px"
}}
>

<input
placeholder="Enter OTP"
value={otp}
onChange={(e) => setOtp(e.target.value)}
/>

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
alert("OTP expired");
}}
>

{({ remainingTime }) => (

<div style={{ color: "#000", fontWeight: "bold", fontSize: "14px" }}>
{remainingTime}
</div>

)}

</CountdownCircleTimer>

</div>

</div>


{!otpExpired && (
<button
className="register-submit"
onClick={verifyOtp}
disabled={!otp}
style={{ marginTop: "10px" }}
>
Verify OTP & Register
</button>
)}


{otpExpired && (
<button
className="register-submit"
onClick={sendOtp}
style={{ marginTop: "10px", backgroundColor: "#facc15" }}
>
Resend OTP
</button>
)}

</>

)}


<p className="register-link">
Already have account? <Link to="/">Login</Link>
</p>

</div>

</div>


{/* FOOTER */}

<footer className="register-footer">

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