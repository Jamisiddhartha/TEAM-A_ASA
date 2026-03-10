import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "./Login.css";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import aadhaarBg from "../assets/aadhaar.png";
import uidaiLogo from "../assets/uidai-logo.jpg";

export default function Login() {
  const navigate = useNavigate();

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

   
if (res.data.token) {
  localStorage.setItem("token", res.data.token);
  navigate("/form");
} else {
  alert(res.data.message);
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
       <header className="w-full bg-white border-b shadow-sm fixed top-0 left-0 z-50"  >
      
              <div className="max-w-screen-xl mx-auto px-8 py-3 flex items-center" >
      
       
      
                <div className="flex items-center gap-3">
      
                  <img src={uidaiLogo} className="h-10" />
      
                  <div>
      
                    <h1 className="text-xl font-semibold">
      
                    <span style={{color:"#FFE600"}}>UIDAI</span> Portal
      
                    </h1>
      
                    <p className="text-xs text-gray-500">ASA Onboarding</p>
      
                  </div>
      
                </div>
      
       
      
                <nav className="hidden md:flex items-center ml-auto gap-6 text-sm text-gray-700">
      
               <a href="/" className="hover:text-yellow-400 cursor-pointer">Home</a>
      
                  <a href="#" className="hover:text-orange-500 cursor-pointer">About</a>
      
                  <a href="#" className="hover:text-orange-500 cursor-pointer">Onboarding Process</a>
                  <a href="#" className="hover:text-orange-500 cursor-pointer">Guidelines</a>
                 
      
                </nav>
      
       
      
                <div className="hidden md:flex items-center gap-4 ml-6">
      
               <Link to="/register" className="px-4 py-2 rounded-md font-semibold" style={{background:"#FFE600", color:"#161D23"}}>
        Register
      </Link>
      
      <Link to="/login" className="px-4 py-2 border bg-gray-300 border-gray-400 rounded-md hover:bg-gray-100">
        Login
      </Link>
                </div>
      
       
      
              </div>
      
            </header>
      

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