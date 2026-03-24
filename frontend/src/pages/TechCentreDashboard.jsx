import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Activity,
  ClipboardCheck,
  Eye,
  FileText,
  LayoutDashboard,
  LogOut,
  Send,
  Shield,
  User,
  X,
} from "lucide-react";
import {
  fetchAdminStep2Applications,
  fetchStep9Details,
  fetchStep11Details,
  updateStep9TechCentreDetails,
} from "../services/portalApi";
import uidaiLogo from "../assets/uidai-logo.jpg";
import { getDashboardPathByRole, normalizeRole } from "../utils/roleRoutes";

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN");
}

export default function TechCentreDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [step9Loading, setStep9Loading] = useState(false);
  const [step9Saving, setStep9Saving] = useState(false);
  const [step9Error, setStep9Error] = useState("");
  const [step9Success, setStep9Success] = useState("");
  const [step9Details, setStep9Details] = useState(null);
  const [step9Form, setStep9Form] = useState({
    techCentreSupportStatus: "acknowledged",
    techCentreNotes: "",
  });
  const [step11Details, setStep11Details] = useState(null);
  const [step11Loading, setStep11Loading] = useState(false);

  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const role = normalizeRole(user?.role);

  async function loadApplications() {
    setLoading(true);
    setError("");
    try {
      const rows = await fetchAdminStep2Applications();
      const queue = (rows || []).filter((app) => Number(app.currentStep || 0) >= 10);
      const step9Snapshots = await Promise.all(queue.map((app) => fetchStep9Details(app.id).catch(() => null)));
      setApplications(queue.map((app, index) => ({ ...app, step9Snapshot: step9Snapshots[index] })));
    } catch {
      setError("Unable to load Tech Centre dashboard data right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  const stats = useMemo(() => {
    const total = applications.length;
    const acknowledged = applications.filter((app) => app.step9Snapshot?.techCentreAcknowledged).length;
    const ready = applications.filter((app) => app.step9Snapshot?.techCentreSupportStatus === "ready_for_step11").length;
    return { total, acknowledged, ready };
  }, [applications]);

  async function openWorkflow(app) {
    setSelectedApplication(app);
    setShowDetails(false);
    setStep9Loading(true);
    setStep9Saving(false);
    setStep9Error("");
    setStep9Success("");
    setStep9Details(null);
    setStep11Details(null);
    setStep11Loading(false);
    setStep9Form({
      techCentreSupportStatus: app.step9Snapshot?.techCentreSupportStatus || "acknowledged",
      techCentreNotes: app.step9Snapshot?.techCentreNotes || "",
    });

    try {
      const details = await fetchStep9Details(app.id);
      setStep9Details(details || null);
      setStep9Form({
        techCentreSupportStatus: details?.techCentreSupportStatus || "acknowledged",
        techCentreNotes: details?.techCentreNotes || "",
      });

      if (Number(app.currentStep || 0) >= 11) {
        setStep11Loading(true);
        const liveDetails = await fetchStep11Details(app.id).catch(() => null);
        setStep11Details(liveDetails || null);
        setStep11Loading(false);
      }
    } catch {
      setStep9Error("Unable to load Tech Centre handoff details right now.");
    } finally {
      setStep9Loading(false);
    }
  }

  async function handleUpdateTechCentre() {
    if (!selectedApplication) return;

    try {
      setStep9Saving(true);
      setStep9Error("");
      setStep9Success("");

      const response = await updateStep9TechCentreDetails(selectedApplication.id, {
        techCentreUserId: user?.id || null,
        supportStatus: step9Form.techCentreSupportStatus,
        techCentreNotes: step9Form.techCentreNotes.trim() || null,
      });

      setStep9Details(response?.step9 || null);
      setStep9Success(response?.message || "Tech Centre handoff updated successfully.");
      await loadApplications();
    } catch (err) {
      setStep9Error(err?.response?.data?.message || "Failed to update Tech Centre handoff.");
    } finally {
      setStep9Saving(false);
    }
  }

  function closeWorkflow() {
    setSelectedApplication(null);
    setShowDetails(false);
    setStep9Loading(false);
    setStep9Saving(false);
    setStep9Error("");
    setStep9Success("");
    setStep9Details(null);
    setStep9Form({ techCentreSupportStatus: "acknowledged", techCentreNotes: "" });
    setStep11Details(null);
    setStep11Loading(false);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!["tech centre", "tech_centre", "tech-centre", "techcentre"].includes(role)) {
    return <Navigate to={getDashboardPathByRole(user?.role)} replace />;
  }

  return (
    <>
      <div className="asa-dash-layout">
        <aside className="asa-dash-sidebar">
          <div>
            <div className="asa-dash-brand">
              <div className="asa-dash-brand-icon"><Shield size={20} /></div>
              <div>
                <h2>UIDAI Portal</h2>
                <p>TECH CENTRE</p>
              </div>
            </div>

            <nav className="asa-dash-nav">
              <button type="button" className={`asa-dash-nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
                <LayoutDashboard size={19} />Dashboard
              </button>
              <button type="button" className={`asa-dash-nav-item ${activeTab === "queue" ? "active" : ""}`} onClick={() => setActiveTab("queue")}>
                <FileText size={19} />Handoff Queue
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
                <span>Tech Centre Dashboard</span>
              </div>
            </div>
          </header>

          <main className="asa-dash-content">
            {error ? <p className="error-banner">{error}</p> : null}
            {loading ? <div className="loading-screen">Loading Tech Centre dashboard...</div> : null}

            {!loading && activeTab === "dashboard" ? (
              <>
                <div className="asa-page-head asa-dashboard-head">
                  <div className="asa-dash-headline">
                    <h1>Welcome, {user.fullname || "Tech Centre"}</h1>
                    <p>Receive Step 9 approvals, acknowledge operational handoff, and track readiness toward live production.</p>
                  </div>
                </div>

                <section className="asa-dash-metrics">
                  <article className="asa-metric-card">
                    <div className="asa-metric-icon orange"><Activity size={20} /></div>
                    <strong>{stats.total}</strong>
                    <p>Total Forwarded Cases</p>
                  </article>
                  <article className="asa-metric-card">
                    <div className="asa-metric-icon"><ClipboardCheck size={20} /></div>
                    <strong>{stats.acknowledged}</strong>
                    <p>Acknowledged By Tech Centre</p>
                  </article>
                  <article className="asa-metric-card">
                    <div className="asa-metric-icon"><Send size={20} /></div>
                    <strong>{stats.ready}</strong>
                    <p>Ready For Step 11</p>
                  </article>
                </section>
              </>
            ) : null}

            {!loading && activeTab === "queue" ? (
              <section className="asa-applications-page">
                <div className="asa-page-head">
                  <div>
                    <h2>Tech Centre Handoff Queue</h2>
                    <p>Confirm the Step 9 handoff, capture operational notes, and mark readiness for the production migration stage.</p>
                  </div>
                </div>

                <div className="asa-app-list-wrap">
                  {applications.length === 0 ? (
                    <p className="helper-text">No Step 9 handoffs have reached Tech Centre yet.</p>
                  ) : (
                    applications.map((item) => (
                      <article key={item.id} className="asa-app-list-row">
                        <div className="asa-app-left">
                          <div className="asa-app-doc"><FileText size={22} /></div>
                          <div>
                            <h4>{item.organizationName || "Organization"}</h4>
                            <p>{item.applicationId || "-"}</p>
                          </div>
                        </div>

                        <div className="asa-app-right">
                          <small>{item.step9Snapshot?.techCentreSupportStatus?.replace(/_/g, " ") || "pending"}</small>
                        </div>

                        <button type="button" className="asa-icon-action" onClick={() => setSelectedApplication(item)} aria-label="View handoff item">
                          <Eye size={17} />
                        </button>

                        <button type="button" className="asa-inline-new-btn" onClick={() => openWorkflow(item)}>
                          <Send size={15} />
                          {item.step9Snapshot?.techCentreAcknowledged ? "Update Handoff" : "Acknowledge Handoff"}
                        </button>
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
                    <strong>{user.role || "Tech Centre"}</strong>
                  </div>
                </div>
              </section>
            ) : null}
          </main>
        </section>
      </div>

      {selectedApplication ? (
        <div className="asa-modal-backdrop" onClick={closeWorkflow}>
          <div className="asa-modal asa-admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="asa-modal-head">
              <div className="asa-modal-title">
                <div className="asa-app-doc"><FileText size={20} /></div>
                <h3>Step 9 Tech Centre Handoff</h3>
              </div>
              <button type="button" className="asa-icon-action" onClick={closeWorkflow}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <p className="helper-text" style={{ marginTop: 0 }}>
                Acknowledge the approval intimation, capture operational support notes, and indicate readiness for the live migration stage.
              </p>
              <button type="button" className="asa-inline-new-btn" onClick={() => setShowDetails((prev) => !prev)}>
                <Eye size={15} />
                {showDetails ? "Hide Details" : "View Details"}
              </button>
            </div>

            {showDetails ? (
              <div className="asa-dash-panel" style={{ marginTop: 12 }}>
                <div className="asa-panel-head"><h3>Application Snapshot</h3></div>
                <div className="asa-modal-grid">
                  <div><span>APPLICATION ID</span><p>{selectedApplication.applicationId || "-"}</p></div>
                  <div><span>CURRENT STEP</span><p>{selectedApplication.currentStep || "-"}</p></div>
                  <div><span>ORGANIZATION</span><p>{selectedApplication.organizationName || "-"}</p></div>
                  <div><span>APPLICANT NAME</span><p>{selectedApplication.applicantName || "-"}</p></div>
                  <div><span>EMAIL</span><p>{selectedApplication.email || "-"}</p></div>
                  <div><span>MOBILE</span><p>{selectedApplication.mobile || "-"}</p></div>
                </div>
              </div>
            ) : null}

            <div className="asa-dash-panel" style={{ marginTop: 14 }}>
              <div className="asa-panel-head"><h3>Step 9 Approval Intimation</h3></div>
              {step9Loading ? (
                <p className="helper-text">Loading Step 9 details...</p>
              ) : (
                <>
                  <div className="asa-profile-grid">
                    <div><span>Approval Reference</span><strong>{step9Details?.approvalReference || "-"}</strong></div>
                    <div><span>Issued At</span><strong>{formatDateTime(step9Details?.issuedAt)}</strong></div>
                    <div><span>Approved By</span><strong>{step9Details?.approvedByName || "-"}</strong></div>
                    <div><span>Approval Note</span><strong style={{ wordBreak: "break-word" }}>{step9Details?.approvalNote || "-"}</strong></div>
                    <div><span>Forwarded To Tech Centre</span><strong>{step9Details?.notifiedTechCentre ? "Yes" : "No"}</strong></div>
                    <div><span>Applicant Notified</span><strong>{step9Details?.notifiedApplicant ? "Yes" : "No"}</strong></div>
                  </div>

                  {!step9Details?.notifiedTechCentre ? (
                    <p className="helper-text" style={{ marginTop: 12 }}>IS Division has not forwarded this Step 9 approval to Tech Centre yet.</p>
                  ) : (
                    <>
                      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                        <label style={{ display: "grid", gap: 8 }}>
                          <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Support Status</span>
                          <select className="asa-flow-select" value={step9Form.techCentreSupportStatus} onChange={(event) => setStep9Form((current) => ({ ...current, techCentreSupportStatus: event.target.value }))} disabled={step9Saving}>
                            <option value="pending">Pending Review</option>
                            <option value="acknowledged">Acknowledged By Tech Centre</option>
                            <option value="ready_for_step11">Operationally Ready For Step 11</option>
                          </select>
                        </label>

                        <label style={{ display: "grid", gap: 8 }}>
                          <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Tech Centre Notes</span>
                          <textarea value={step9Form.techCentreNotes} onChange={(event) => setStep9Form((current) => ({ ...current, techCentreNotes: event.target.value }))} placeholder="Capture operational readiness notes, mapping coordination, or production support observations." style={{ width: "100%", minHeight: 110, borderRadius: 12, padding: 12, border: "1px solid rgba(255,230,0,0.25)", background: "#121218", color: "#fff" }} disabled={step9Saving} />
                        </label>
                      </div>

                      <div className="asa-profile-grid" style={{ marginTop: 14 }}>
                        <div><span>Acknowledged</span><strong>{step9Details?.techCentreAcknowledged ? "Yes" : "No"}</strong></div>
                        <div><span>Acknowledged By</span><strong>{step9Details?.techCentreAcknowledgedByName || "-"}</strong></div>
                        <div><span>Acknowledged At</span><strong>{formatDateTime(step9Details?.techCentreAcknowledgedAt)}</strong></div>
                        <div><span>Current Notes</span><strong style={{ wordBreak: "break-word" }}>{step9Details?.techCentreNotes || "-"}</strong></div>
                      </div>

                      {step9Error ? <p className="error-banner" style={{ marginTop: 12 }}>{step9Error}</p> : null}
                      {step9Success ? <p className="helper-text" style={{ marginTop: 12 }}>{step9Success}</p> : null}

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                        <button type="button" className="asa-inline-new-btn" onClick={handleUpdateTechCentre} disabled={step9Saving}>
                          {step9Saving ? "Saving Tech Centre Update..." : step9Details?.techCentreAcknowledged ? "Update Tech Centre Status" : "Acknowledge Step 9 Handoff"}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {Number(selectedApplication.currentStep || 0) >= 11 ? (
              <div className="asa-dash-panel" style={{ marginTop: 14 }}>
                <div className="asa-panel-head"><h3>Step 11 Live Production Status</h3></div>
                {step11Loading ? (
                  <p className="helper-text">Loading Step 11 details...</p>
                ) : (
                  <div className="asa-profile-grid">
                    <div><span>Production Key Reference</span><strong>{step11Details?.productionKeyReference || "-"}</strong></div>
                    <div><span>Production Endpoint</span><strong style={{ wordBreak: "break-word" }}>{step11Details?.productionEndpoint || "-"}</strong></div>
                    <div><span>Go-live Notes</span><strong style={{ wordBreak: "break-word" }}>{step11Details?.goLiveNotes || "-"}</strong></div>
                    <div><span>Migrated At</span><strong>{formatDateTime(step11Details?.migratedAt)}</strong></div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
