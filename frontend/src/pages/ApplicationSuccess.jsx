import { useState } from "react";
import { CheckCircle2, ClipboardList, Download, FileText, Mail, LogOut, Shield, User } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getDeclarationPdfUrl } from "../services/portalApi";

const STORAGE_KEY = "lastSubmittedApplication";

function ApplicationSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const storedApplication = (() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const application = location.state?.application || storedApplication;

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!application) {
    return <Navigate to="/form" replace />;
  }

  return (
    <div className="asa-success-page min-h-screen">
      <header className="asa-success-topbar">
        <div className="asa-dash-top-title">
          <div className="asa-dash-brand-icon"><Shield size={18} /></div>
          <div>
            <strong>UIDAI ASA Onboarding Portal</strong>
            <span>Unique Identification Authority of India</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="asa-inline-new-btn">Open Dashboard</Link>
          <button type="button" onClick={handleLogout} className="asa-inline-new-btn">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="asa-success-main mx-auto max-w-6xl px-6 pb-16 pt-8">
        <section className="overflow-hidden rounded-[36px] border border-black/10 bg-[linear-gradient(135deg,#2e2e38_0%,#1f1f1f_100%)] shadow-2xl">
          <div className="grid gap-8 px-6 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ffe600]/40 bg-[#ffe600]/10 px-4 py-2 text-sm font-semibold text-[#ffe600]">
                <CheckCircle2 size={18} />
                Application Submitted Successfully
              </div>
              <h1 className="mt-5 text-4xl font-bold text-white">Your ASA onboarding request is now in the system.</h1>
              <p className="mt-4 max-w-2xl text-base text-white/75">
                The application has been recorded in PostgreSQL, the declaration signature has been captured, and the UIDAI onboarding review is ready to continue.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/dashboard"
                  className="rounded-2xl bg-[#ffe600] px-6 py-3 font-semibold text-[#1f1f1f] transition hover:bg-[#f1d600]"
                >
                  Open Dashboard
                </Link>

                <a
                  href={getDeclarationPdfUrl(application.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#ffe600]/35 bg-[#ffe600]/10 px-6 py-3 font-semibold text-[#ffe600] transition hover:bg-[#ffe600]/20"
                >
                  <Download size={18} />
                  Download Signed Declaration PDF
                </a>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">Submission Snapshot</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-white px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#6c6c73]">Application ID</p>
                  <p className="mt-2 text-2xl font-bold text-[#1f1f1f]">{application.applicationId}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoTile icon={User} label="Applicant" value={application.applicantName} />
                  <InfoTile icon={Mail} label="Official Email" value={application.email} />
                  <InfoTile icon={ClipboardList} label="Current Step" value={`Step ${application.currentStep}`} />
                  <InfoTile icon={FileText} label="Status" value={application.overallStatus} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="asa-success-info-tile rounded-2xl bg-[#f7f5ef] px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[#ffe600] p-2 text-[#1f1f1f]">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#6c6c73]">{label}</p>
          <p className="asa-success-tile-value mt-1 text-sm font-semibold text-[#1f1f1f]">{value || "Not available"}</p>
        </div>
      </div>
    </div>
  );
}

export default ApplicationSuccess;


