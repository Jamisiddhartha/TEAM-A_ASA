import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Activity, ClipboardList, FileText, GitBranch, LayoutDashboard, LogOut, Shield, User } from "lucide-react";
import { fetchApplications } from "../services/portalApi";
import uidaiLogo from "../assets/uidai-logo.jpg";
import { getDashboardPathByRole, normalizeRole } from "../utils/roleRoutes";

export default function AuditorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    fetchApplications()
      .then((rows) => setApplications(rows || []))
      .catch(() => setError("Unable to load auditor dashboard data right now."))
      .finally(() => setLoading(false));
  }, []);

  const role = normalizeRole(user?.role);
  const auditQueue = useMemo(
    () => applications.filter((app) => Number(app.currentStep || 0) >= 4 && Number(app.currentStep || 0) <= 8),
    [applications]
  );

  const stats = useMemo(() => {
    const total = auditQueue.length;
    const preOnboarding = auditQueue.filter((app) => Number(app.currentStep || 0) >= 4 && Number(app.currentStep || 0) <= 6).length;
    const isAudit = auditQueue.filter((app) => Number(app.currentStep || 0) >= 7 && Number(app.currentStep || 0) <= 8).length;
    return { total, preOnboarding, isAudit };
  }, [auditQueue]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role !== "auditor") return <Navigate to={getDashboardPathByRole(user?.role)} replace />;

  return (
    <div className="asa-dash-layout">
      <aside className="asa-dash-sidebar">
        <div>
          <div className="asa-dash-brand">
            <div className="asa-dash-brand-icon"><Shield size={20} /></div>
            <div>
              <h2>UIDAI Portal</h2>
              <p>AUDITOR WORKSPACE</p>
            </div>
          </div>

          <nav className="asa-dash-nav">
            <button type="button" className={`asa-dash-nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
              <LayoutDashboard size={19} />Dashboard
            </button>
            <button type="button" className={`asa-dash-nav-item ${activeTab === "queue" ? "active" : ""}`} onClick={() => setActiveTab("queue")}>
              <FileText size={19} />Audit Queue
            </button>
            <button type="button" className={`asa-dash-nav-item ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
              <User size={19} />Profile
            </button>
          </nav>
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
              <span>Auditor Dashboard</span>
            </div>
          </div>
        </header>

        <main className="asa-dash-content">
          {error ? <p className="error-banner">{error}</p> : null}
          {loading ? <div className="loading-screen">Loading auditor dashboard...</div> : null}

          {!loading && activeTab === "dashboard" ? (
            <>
              <div className="asa-page-head asa-dashboard-head">
                <div className="asa-dash-headline">
                  <h1>Welcome, {user.fullname || "Auditor"}</h1>
                  <p>Applications in audit stages are shown in your queue.</p>
                </div>
              </div>

              <section className="asa-dash-metrics">
                <article className="asa-metric-card">
                  <div className="asa-metric-icon orange"><ClipboardList size={20} /></div>
                  <strong>{stats.total}</strong>
                  <p>Total Audit Queue</p>
                </article>
                <article className="asa-metric-card">
                  <div className="asa-metric-icon"><GitBranch size={20} /></div>
                  <strong>{stats.preOnboarding}</strong>
                  <p>Pre-onboarding Audit</p>
                </article>
                <article className="asa-metric-card">
                  <div className="asa-metric-icon"><Activity size={20} /></div>
                  <strong>{stats.isAudit}</strong>
                  <p>IS Audit Stage</p>
                </article>
              </section>
            </>
          ) : null}

          {!loading && activeTab === "queue" ? (
            <section className="asa-applications-page">
              <div className="asa-page-head">
                <div>
                  <h2>Audit Queue</h2>
                  <p>Applications currently in Step 4 to Step 8 are listed here.</p>
                </div>
              </div>

              <div className="asa-app-list-wrap">
                {auditQueue.length === 0 ? (
                  <p className="helper-text">No applications are currently in audit stages.</p>
                ) : (
                  auditQueue.map((item) => (
                    <article key={item.id} className="asa-app-list-row">
                      <div className="asa-app-left">
                        <div className="asa-app-doc"><FileText size={22} /></div>
                        <div>
                          <h4>{item.organizationName || "Organization"}</h4>
                          <p>{item.applicationId || "-"} • {item.applicantName || "Applicant"}</p>
                        </div>
                      </div>

                      <div className="asa-app-right">
                        <span className="asa-status-pill">Step {item.currentStep || "-"}</span>
                        <small>{item.email || "-"}</small>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          ) : null}

          {!loading && activeTab === "profile" ? (
            <section className="asa-dash-panel">
              <div className="asa-panel-head">
                <h3>Profile</h3>
              </div>
              <div className="asa-profile-grid">
                <div>
                  <span>Full Name</span>
                  <strong>{user.fullname || "-"}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{user.email || "-"}</strong>
                </div>
                <div>
                  <span>Role</span>
                  <strong>{user.role || "Auditor"}</strong>
                </div>
              </div>
            </section>
          ) : null}
        </main>
      </section>
    </div>
  );
}
