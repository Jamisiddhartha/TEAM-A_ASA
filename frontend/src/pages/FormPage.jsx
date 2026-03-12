import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FileText, GitBranch, LayoutDashboard, LogOut, Shield, User } from "lucide-react";
import ApplicantDetails from "../forms/ApplicantDetails.jsx";
import uidaiLogo from "../assets/uidai-logo.jpg";

const formSteps = [
  { id: 1, label: "Applicant Details" },
  { id: 2, label: "Contact Details" },
  { id: 3, label: "ASA Setup" },
  { id: 4, label: "Authentication" },
  { id: 5, label: "Declaration" },
];

function FormPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handler = (event) => {
      if (event?.detail) {
        setCurrentStep(Number(event.detail));
      }
    };
    window.addEventListener("formStepChanged", handler);
    return () => window.removeEventListener("formStepChanged", handler);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function jumpToStep(stepId) {
    window.dispatchEvent(new CustomEvent("changeStep", { detail: stepId }));
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="asa-dash-layout asa-form-shell">
      <aside className="asa-dash-sidebar">
        <div>
          <div className="asa-dash-brand">
            <div className="asa-dash-brand-icon"><Shield size={20} /></div>
            <div>
              <h2>UIDAI Portal</h2>
              <p>ASA ONBOARDING</p>
            </div>
          </div>

          <nav className="asa-dash-nav">
            <Link to="/dashboard" className="asa-dash-nav-item">
              <LayoutDashboard size={19} />Dashboard
            </Link>
            <button type="button" className="asa-dash-nav-item active">
              <FileText size={19} />Application Form
            </button>

            <div className="asa-form-step-nav">
              {formSteps.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  className={`asa-form-step-item ${currentStep === step.id ? "active" : ""}`}
                  onClick={() => jumpToStep(step.id)}
                >
                  <span>{step.id}</span>
                  <p>{step.label}</p>
                </button>
              ))}
            </div>
          
            <div className="asa-form-bottom-nav">
              <Link
                to="/dashboard"
                className="asa-dash-nav-item"
                onClick={() => sessionStorage.setItem("dashboardTab", "flow")}
              >
                <GitBranch size={19} />Onboarding Flow
              </Link>
              <Link
                to="/dashboard"
                className="asa-dash-nav-item"
                onClick={() => sessionStorage.setItem("dashboardTab", "profile")}
              >
                <User size={19} />Profile
              </Link>
            </div>          </nav>
        </div>

        <div className="asa-dash-side-footer">
          <p>{user.email}</p>
          <button type="button" onClick={handleLogout} className="asa-dash-logout"><LogOut size={18} />Logout</button>
        </div>
      </aside>

      <section className="asa-dash-main">
        <header className="asa-dash-topbar">
          <div className="asa-dash-top-title">
            <img src={uidaiLogo} alt="UIDAI" />
            <div>
              <strong>UIDAI ASA Onboarding Portal</strong>
              <span>Unique Identification Authority of India</span>
            </div>
          </div>
          <Link to="/dashboard" className="asa-inline-new-btn">Go To Dashboard</Link>
        </header>

        <main className="asa-dash-content">
          <ApplicantDetails />
        </main>
      </section>
    </div>
  );
}

export default FormPage;








