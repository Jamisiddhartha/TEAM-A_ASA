import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import "./Register.css";
import aadhaarBg from "../assets/aadhaar.png";
import uidaiLogo from "../assets/uidai-logo.jpg";
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
  const timerKey = 0; // Keeping structure clean
  const navigate = useNavigate();
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
      "http://localhost:5001/api/auth/send-otp",
      { email: form.email }
    );

    alert(res.data.message);

    if(res.data.success){
      setOtpSent(true);
      setOtpExpired(false);
      // Removed setTimerKey, not needed for basic redirect usage
    }

  } catch (err) {
    console.log(err);
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
        "http://localhost:5001/api/auth/verify-otp",
        { ...form, otp }
      );

      alert(res.data.message);
      if(res.data.message === "User Registered Successfully"){
        setOtpSent(false);
        setOtp("");
        navigate("/login");
      }

    } catch (err) {
      console.log(err);
      alert("Verification failed");

    }

  };

  return (

<div className="register-page" style={{ backgroundImage: `url(${aadhaarBg})` }}>

{/* NAVBAR */}

<header className="w-full bg-white border-b shadow-sm fixed top-0 left-0 z-50"  >
      
              <div className="max-w-screen-xl mx-auto px-8 py-3 flex items-center" >
      
       
      
                <div className="flex items-center gap-3">
      
                  <img src={uidaiLogo} className="h-10" />
      
                  <div>
      
                    <h1 className="text-xl font-semibold">
      
                      <span style={{color:"#FFE600"}}>UIDAI</span> PortalPortal
      
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
      
       
      
                <div className="flex items-center gap-2 md:gap-4 ml-auto md:ml-6">
      
                <Link to="/register" className="px-3 md:px-4 py-2 border bg-gray-100 border-gray-400 rounded-md hover:bg-gray-200 active:scale-95 transition-all duration-200 shadow-sm">
        Register
      </Link>
      
      <Link to="/login" className="px-3 md:px-4 py-2 font-semibold bg-[#FFE600] text-[#161D23] rounded-md hover:bg-[#e6cf00] active:scale-95 transition-all duration-200 shadow-sm">
        Login
      </Link>
                </div>
      
       
      
              </div>
      
            </header>


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
Already have account? <Link to="/login">Login</Link>
</p>

</div>

</div>


{/* FOOTER */}

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