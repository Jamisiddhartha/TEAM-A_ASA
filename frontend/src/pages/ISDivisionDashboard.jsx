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
  fetchStep8Details,
  fetchStep9Details,
  issueStep9Details,
  reviewStep8Details,
} from "../services/portalApi";
import uidaiLogo from "../assets/uidai-logo.jpg";
import { getDashboardPathByRole, normalizeRole } from "../utils/roleRoutes";

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN");
}

export default function ISDivisionDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalMode, setModalMode] = useState("step8");
  const [showDetails, setShowDetails] = useState(false);
  const [step8Loading, setStep8Loading] = useState(false);
  const [step8Saving, setStep8Saving] = useState(false);
  const [step8Error, setStep8Error] = useState("");
  const [step8Details, setStep8Details] = useState(null);
  const [step8Decision, setStep8Decision] = useState("approved");
  const [step8ReviewRemarks, setStep8ReviewRemarks] = useState("");
  const [step9Loading, setStep9Loading] = useState(false);
  const [step9Saving, setStep9Saving] = useState(false);
  const [step9Error, setStep9Error] = useState("");
  const [step9Details, setStep9Details] = useState(null);
  const [step9Form, setStep9Form] = useState({
    approvalReference: "",
    approvalNote: "",
    notifiedApplicant: true,
    notifiedTechCentre: true,
  });

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
      setApplications(rows || []);
    } catch {
      setError("Unable to load IS division dashboard data right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  const reviewQueue = useMemo(
    () => applications.filter((app) => Number(app.currentStep || 0) >= 8 && Number(app.currentStep || 0) <= 9),
    [applications]
  );

  const stats = useMemo(() => {
    const total = reviewQueue.length;
    const step8Review = reviewQueue.filter((app) => Number(app.currentStep || 0) === 8).length;
    const step9Ready = reviewQueue.filter((app) => Number(app.currentStep || 0) >= 9).length;
    return { total, step8Review, step9Ready };
  }, [reviewQueue]);

  async function openStep8Workflow(app) {
    setSelectedApplication(app);
    setModalMode("step8");
    setShowDetails(false);
    setStep8Loading(true);
    setStep8Saving(false);
    setStep8Error("");
    setStep8Details(null);
    setStep8Decision("approved");
    setStep8ReviewRemarks("");

    try {
      const details = await fetchStep8Details(app.id);
      setStep8Details(details || null);
      setStep8ReviewRemarks(details?.reviewRemarks || "");
    } catch {
      setStep8Error("Unable to load Step 8 details right now.");
    } finally {
      setStep8Loading(false);
    }
  }

  async function openStep9Workflow(app) {
    setSelectedApplication(app);
    setModalMode("step9");
    setShowDetails(false);
    setStep9Loading(true);
    setStep9Saving(false);
    setStep9Error("");
    setStep9Details(null);
    setStep9Form({
      approvalReference: "",
      approvalNote: "",
      notifiedApplicant: true,
      notifiedTechCentre: true,
    });

    try {
      const details = await fetchStep9Details(app.id);
      setStep9Details(details || null);
      setStep9Form({
        approvalReference: details?.approvalReference || "",
        approvalNote: details?.approvalNote || "",
        notifiedApplicant: details?.notifiedApplicant ?? true,
        notifiedTechCentre: details?.notifiedTechCentre ?? true,
      });
    } catch {
      setStep9Error("Unable to load Step 9 details right now.");
    } finally {
      setStep9Loading(false);
    }
  }

  async function handleStep8Review() {
    if (!selectedApplication) return;
    if (!step8Details?.submittedAt) {
      setStep8Error("Auditor has not submitted Step 8 yet.");
      return;
    }

    try {
      setStep8Saving(true);
      setStep8Error("");
      const response = await reviewStep8Details(selectedApplication.id, {
        reviewedByUserId: user?.id || null,
        decision: step8Decision,
        reviewRemarks: step8ReviewRemarks.trim() || null,
      });

      await loadApplications();
      const updated = response?.application;
      if (updated) {
        setSelectedApplication((prev) => (prev ? { ...prev, ...updated } : prev));
      }

      const refreshed = await fetchStep8Details(selectedApplication.id);
      setStep8Details(refreshed || null);
      if (step8Decision === "approved") {
        const step9 = await fetchStep9Details(selectedApplication.id).catch(() => null);
        setStep9Details(step9 || null);
      }
    } catch (err) {
      setStep8Error(err?.response?.data?.message || "Failed to review Step 8.");
    } finally {
      setStep8Saving(false);
    }
  }

  async function handleStep9Issue() {
    if (!selectedApplication) return;
    if (!step9Form.approvalReference.trim()) {
      setStep9Error("Enter the approval reference before issuing Step 9.");
      return;
    }

    try {
      setStep9Saving(true);
      setStep9Error("");
      const response = await issueStep9Details(selectedApplication.id, {
        approvedByUserId: user?.id || null,
        approvalReference: step9Form.approvalReference.trim(),
        approvalNote: step9Form.approvalNote.trim() || null,
        notifiedApplicant: step9Form.notifiedApplicant,
        notifiedTechCentre: step9Form.notifiedTechCentre,
      });

      await loadApplications();
      const updated = response?.application;
      if (updated) {
        setSelectedApplication((prev) => (prev ? { ...prev, ...updated } : prev));
      }

      const refreshed = await fetchStep9Details(selectedApplication.id);
      setStep9Details(refreshed || null);
      setStep9Form({
        approvalReference: refreshed?.approvalReference || "",
        approvalNote: refreshed?.approvalNote || "",
        notifiedApplicant: refreshed?.notifiedApplicant ?? true,
        notifiedTechCentre: refreshed?.notifiedTechCentre ?? true,
      });
    } catch (err) {
      setStep9Error(err?.response?.data?.message || "Failed to issue Step 9 approval.");
    } finally {
      setStep9Saving(false);
    }
  }

  function closeWorkflow() {
    setSelectedApplication(null);
    setModalMode("step8");
    setShowDetails(false);
    setStep8Loading(false);
    setStep8Saving(false);
    setStep8Error("");
    setStep8Details(null);
    setStep8Decision("approved");
    setStep8ReviewRemarks("");
    setStep9Loading(false);
    setStep9Saving(false);
    setStep9Error("");
    setStep9Details(null);
    setStep9Form({
      approvalReference: "",
      approvalNote: "",
      notifiedApplicant: true,
      notifiedTechCentre: true,
    });
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!["is division", "is_division", "is-division", "isdivision"].includes(role)) {
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
                <p>IS DIVISION</p>
              </div>
            </div>

            <nav className="asa-dash-nav">
              <button type="button" className={`asa-dash-nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
                <LayoutDashboard size={19} />Dashboard
              </button>
              <button type="button" className={`asa-dash-nav-item ${activeTab === "queue" ? "active" : ""}`} onClick={() => setActiveTab("queue")}>
                <FileText size={19} />Review Queue
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
                <span>IS Division Dashboard</span>
              </div>
            </div>
          </header>

          <main className="asa-dash-content">
            {error ? <p className="error-banner">{error}</p> : null}
            {loading ? <div className="loading-screen">Loading IS division dashboard...</div> : null}

            {!loading && activeTab === "dashboard" ? (
              <>
                <div className="asa-page-head asa-dashboard-head">
                  <div className="asa-dash-headline">
                    <h1>Welcome, {user.fullname || "IS Division"}</h1>
                    <p>Review Step 8 IS audit submissions and issue final approval for Step 9.</p>
                  </div>
                </div>

                <section className="asa-dash-metrics">
                  <article className="asa-metric-card">
                    <div className="asa-metric-icon orange"><Activity size={20} /></div>
                    <strong>{stats.total}</strong>
                    <p>Total Step 8-9 Cases</p>
                  </article>
                  <article className="asa-metric-card">
                    <div className="asa-metric-icon"><ClipboardCheck size={20} /></div>
                    <strong>{stats.step8Review}</strong>
                    <p>Step 8 Under Review</p>
                  </article>
                  <article className="asa-metric-card">
                    <div className="asa-metric-icon"><Send size={20} /></div>
                    <strong>{stats.step9Ready}</strong>
                    <p>Step 9 Ready</p>
                  </article>
                </section>
              </>
            ) : null}

            {!loading && activeTab === "queue" ? (
              <section className="asa-applications-page">
                <div className="asa-page-head">
                  <div>
                    <h2>IS Review Queue</h2>
                    <p>Move approved Step 8 cases into final approval and notification for Step 9.</p>
                  </div>
                </div>

                <div className="asa-app-list-wrap">
                  {reviewQueue.length === 0 ? (
                    <p className="helper-text">No Step 8 or Step 9 items are waiting right now.</p>
                  ) : (
                    reviewQueue.map((item) => (
                      <article key={item.id} className="asa-app-list-row">
                        <div className="asa-app-left">
                          <div className="asa-app-doc"><FileText size={22} /></div>
                          <div>
                            <h4>{item.organizationName || "Organization"}</h4>
                            <p>{item.applicationId || "-"}</p>
                          </div>
                        </div>

                        <div className="asa-app-right">
                          <small>{item.overallStatus || "-"}</small>
                        </div>

                        <button type="button" className="asa-icon-action" onClick={() => setSelectedApplication(item)} aria-label="View item">
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          className="asa-inline-new-btn"
                          onClick={() => (Number(item.currentStep || 0) >= 9 ? openStep9Workflow(item) : openStep8Workflow(item))}
                        >
                          <Send size={15} />
                          {Number(item.currentStep || 0) >= 9 ? "Issue Step 9" : "Review Step 8"}
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
                    <strong>{user.role || "IS Division"}</strong>
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
                <h3>{modalMode === "step9" ? "Issue Step 9 Final Approval" : "Review Step 8 IS Audit"}</h3>
              </div>
              <button type="button" className="asa-icon-action" onClick={closeWorkflow}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <p className="helper-text" style={{ marginTop: 0 }}>
                {modalMode === "step9" ? "Issue the final approval and notify the applicant plus tech centre." : "Review the submitted IS audit report, compliance checklist, and audit artefacts."}
              </p>
              <button type="button" className="asa-inline-new-btn" onClick={() => setShowDetails((prev) => !prev)}>
                <Eye size={15} />
                {showDetails ? "Hide Details" : "View Details"}
              </button>
            </div>

            {showDetails ? (
              <div className="asa-dash-panel" style={{ marginTop: 12 }}>
                <div className="asa-panel-head">
                  <h3>Application Snapshot</h3>
                </div>
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

            {modalMode === "step9" ? (
              <div className="asa-dash-panel" style={{ marginTop: 14 }}>
                <div className="asa-panel-head">
                  <h3>Step 9 Final Approval</h3>
                </div>

                {step9Loading ? (
                  <p className="helper-text">Loading Step 9 details...</p>
                ) : (
                  <>
                    <div className="asa-profile-grid">
                      <div>
                        <span>Existing Approval Ref</span>
                        <strong>{step9Details?.approvalReference || "-"}</strong>
                      </div>
                      <div>
                        <span>Approved By</span>
                        <strong>{step9Details?.approvedByName || "-"}</strong>
                      </div>
                      <div>
                        <span>Issued At</span>
                        <strong>{formatDateTime(step9Details?.issuedAt)}</strong>
                      </div>
                      <div>
                        <span>Approval Note</span>
                        <strong>{step9Details?.approvalNote || "-"}</strong>
                      </div>
                    </div>

                    <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                      <label style={{ display: "grid", gap: 8 }}>
                        <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Approval Reference</span>
                        <input type="text" className="asa-flow-select" value={step9Form.approvalReference} onChange={(event) => setStep9Form((current) => ({ ...current, approvalReference: event.target.value }))} placeholder="Enter final approval reference / intimation id" disabled={step9Saving} />
                      </label>

                      <label style={{ display: "grid", gap: 8 }}>
                        <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Approval Note</span>
                        <textarea value={step9Form.approvalNote} onChange={(event) => setStep9Form((current) => ({ ...current, approvalNote: event.target.value }))} placeholder="Add final approval remarks for the applicant and tech centre." style={{ width: "100%", minHeight: 96, borderRadius: 12, padding: 12, border: "1px solid rgba(255,230,0,0.25)", background: "#121218", color: "#fff" }} disabled={step9Saving} />
                      </label>

                      <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <input type="checkbox" checked={step9Form.notifiedApplicant} onChange={(event) => setStep9Form((current) => ({ ...current, notifiedApplicant: event.target.checked }))} disabled={step9Saving} />
                        <span>Applicant notified</span>
                      </label>

                      <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <input type="checkbox" checked={step9Form.notifiedTechCentre} onChange={(event) => setStep9Form((current) => ({ ...current, notifiedTechCentre: event.target.checked }))} disabled={step9Saving} />
                        <span>Tech Centre notified</span>
                      </label>
                    </div>

                    {step9Error ? <p className="error-banner" style={{ marginTop: 12 }}>{step9Error}</p> : null}

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                      <button type="button" className="asa-inline-new-btn" onClick={handleStep9Issue} disabled={step9Saving}>
                        {step9Saving ? "Issuing Step 9..." : step9Details?.issuedAt ? "Reissue Step 9 Approval" : "Issue Step 9 Approval"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="asa-dash-panel" style={{ marginTop: 14 }}>
                <div className="asa-panel-head">
                  <h3>Step 8 IS Audit Submission</h3>
                </div>

                {step8Loading ? (
                  <p className="helper-text">Loading Step 8 details...</p>
                ) : (
                  <>
                    <div className="asa-profile-grid">
                      <div>
                        <span>IS Audit Report Ref</span>
                        <strong>{step8Details?.isAuditReportRef || "-"}</strong>
                      </div>
                      <div>
                        <span>Compliance Checklist Ref</span>
                        <strong>{step8Details?.complianceChecklistRef || "-"}</strong>
                      </div>
                      <div>
                        <span>Artefacts Ref</span>
                        <strong>{step8Details?.artefactsRef || "-"}</strong>
                      </div>
                      <div>
                        <span>Submitted At</span>
                        <strong>{formatDateTime(step8Details?.submittedAt)}</strong>
                      </div>
                      <div>
                        <span>Audit Report PDF</span>
                        <strong>{step8Details?.isAuditReportFileUrl ? <a href={step8Details.isAuditReportFileUrl} target="_blank" rel="noreferrer">Download PDF</a> : "-"}</strong>
                      </div>
                      <div>
                        <span>Compliance Checklist PDF</span>
                        <strong>{step8Details?.complianceChecklistFileUrl ? <a href={step8Details.complianceChecklistFileUrl} target="_blank" rel="noreferrer">Download PDF</a> : "-"}</strong>
                      </div>
                      <div>
                        <span>Artefacts PDF</span>
                        <strong>{step8Details?.artefactsFileUrl ? <a href={step8Details.artefactsFileUrl} target="_blank" rel="noreferrer">Download PDF</a> : "-"}</strong>
                      </div>
                      <div>
                        <span>Submission Remarks</span>
                        <strong>{step8Details?.submissionRemarks || "-"}</strong>
                      </div>
                    </div>

                    {!step8Details?.submittedAt ? (
                      <p className="helper-text" style={{ marginTop: 12 }}>Auditor has not submitted Step 8 yet.</p>
                    ) : step8Details?.reviewStatus === "approved" ? (
                      <p className="helper-text" style={{ marginTop: 12 }}>Step 8 has already been approved and is ready for Step 9.</p>
                    ) : (
                      <>
                        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                          <label style={{ display: "grid", gap: 8 }}>
                            <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Decision</span>
                            <select value={step8Decision} onChange={(event) => setStep8Decision(event.target.value)} className="asa-flow-select" disabled={step8Saving}>
                              <option value="approved">Approve (move to Step 9)</option>
                              <option value="rejected">Reject (send for resubmission)</option>
                            </select>
                          </label>

                          <label style={{ display: "grid", gap: 8 }}>
                            <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Review Remarks</span>
                            <textarea value={step8ReviewRemarks} onChange={(event) => setStep8ReviewRemarks(event.target.value)} placeholder="Add Step 8 review remarks" style={{ width: "100%", minHeight: 96, borderRadius: 12, padding: 12, border: "1px solid rgba(255,230,0,0.25)", background: "#121218", color: "#fff" }} disabled={step8Saving} />
                          </label>
                        </div>

                        {step8Error ? <p className="error-banner" style={{ marginTop: 12 }}>{step8Error}</p> : null}

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                          <button type="button" className="asa-inline-new-btn" onClick={handleStep8Review} disabled={step8Saving}>
                            {step8Saving ? "Submitting Review..." : "Submit Step 8 Review"}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
