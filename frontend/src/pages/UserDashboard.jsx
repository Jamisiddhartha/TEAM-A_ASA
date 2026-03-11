import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { UserRound } from "lucide-react";
import Header from "../components/Header";
import { fetchApplications } from "../services/portalApi";

const roleProfiles = {
  Applicant: {
    label: "Applicant",
    heading: "ASA applicant dashboard",
    body: "Submit your application form and monitor your generated application IDs.",
    accentLabel: "Applicant view",
  },
  Auditor: {
    label: "Auditor",
    heading: "ASA dashboard",
    body: "Review incoming applications that are currently at Step 2.",
    accentLabel: "Auditor view",
  },
  Admin: {
    label: "Onboarding Officer",
    heading: "Step 2 intake dashboard",
    body: "View all applications with generated IDs. Portal workflow actions beyond Step 2 are removed.",
    accentLabel: "Officer view",
  },
};

function formatRole(role) {
  return roleProfiles[role]?.label || "Portal user";
}

function getApplicationScope(applications, user) {
  if (!user) return [];
  if (user.role === "Applicant") {
    return applications.filter(
      (application) => application.createdByUserId === user.id || application.email?.toLowerCase() === user.email?.toLowerCase()
    );
  }
  return applications;
}

function sortApplicationsByFreshness(applications) {
  return [...applications].sort((left, right) => new Date(right.updatedAt || right.createdAt) - new Date(left.updatedAt || left.createdAt));
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApplications()
      .then((applicationData) => setApplications(applicationData || []))
      .catch(() => setError("Unable to load dashboard data. Please confirm backend and PostgreSQL are running."))
      .finally(() => setLoading(false));
  }, []);

  const scopedApplications = useMemo(() => getApplicationScope(applications, user), [applications, user]);
  const orderedApplications = useMemo(() => sortApplicationsByFreshness(scopedApplications), [scopedApplications]);
  const profile = roleProfiles[user?.role] || roleProfiles.Applicant;

  const metrics = useMemo(() => {
    return {
      totalApplications: scopedApplications.length,
      stepTwoCount: scopedApplications.filter((application) => application.currentStep === 2).length,
    };
  }, [scopedApplications]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="command-center-page">
      <Header />
      <main className="site-shell command-center-shell">
        <section className="command-center-hero panel-card">
          <div>
            <p className="eyebrow">{profile.accentLabel}</p>
            <h1>{profile.heading}</h1>
            <p className="command-center-copy">{profile.body}</p>
            <div className="hero-actions">
              <button type="button" className="button button-primary" onClick={() => navigate("/form")}>Open applicant form</button>
            </div>
          </div>
          <div className="command-center-spotlight">
            <div className="spotlight-badge"><UserRound size={18} />{formatRole(user.role)}</div>
            <h2>{user.fullname}</h2>
            <p>{user.email}</p>
            <div className="spotlight-grid">
              <div><span>Visible applications</span><strong>{metrics.totalApplications}</strong></div>
              <div><span>At Step 2</span><strong>{metrics.stepTwoCount}</strong></div>
            </div>
          </div>
        </section>

        {error ? <p className="error-banner">{error}</p> : null}
        {loading ? <div className="loading-screen">Loading dashboard...</div> : null}

        {!loading ? (
          <section className="section-block">
            <div className="section-heading left-aligned">
              <p className="eyebrow">Application registry</p>
              <h3>Applications available in Step 2 intake</h3>
            </div>

            <div className="application-grid">
              {orderedApplications.map((application) => (
                <article className="application-card" key={application.id}>
                  <div className="application-card-top">
                    <div>
                      <p className="application-id">{application.applicationId}</p>
                      <h4>{application.organizationName}</h4>
                    </div>
                    <span className="status-pill">Step {application.currentStep}</span>
                  </div>
                  <p>{application.applicationSummary || "No summary provided."}</p>
                  <div className="application-meta">
                    <span>{application.applicantName}</span>
                    <span>{application.overallStatus}</span>
                    <span>{application.environmentStatus}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
