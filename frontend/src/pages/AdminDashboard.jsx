import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Activity,
  ClipboardList,
  Eye,
  FileText,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Shield,
  User,
  X,
  Send,
  Download,
} from "lucide-react";
import {
  fetchAdminStep2Applications,
  fetchInPrincipleApproval,
  issueInPrincipleApproval,
  getInPrincipleApprovalLetterPdfUrl,
} from "../services/portalApi";
import uidaiLogo from "../assets/uidai-logo.jpg";
import { getDashboardPathByRole, normalizeRole } from "../utils/roleRoutes";

const STEP3_APPENDICES = [
  "ASA Agreement V 6.0",
  "Invoice for payment of Initial License Fee",
  "Performance Bank Guarantee",
  "Pre-onboarding Audit Compliance Checklist",
  "Onboarding Audit Compliance Checklist",
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalMode, setModalMode] = useState("details");
  const [showIssueViewDetails, setShowIssueViewDetails] = useState(false);
  const [issuingId, setIssuingId] = useState(null);

  const [step3Loading, setStep3Loading] = useState(false);
  const [step3Saving, setStep3Saving] = useState(false);
  const [step3Error, setStep3Error] = useState("");
  const [step3Remarks, setStep3Remarks] = useState("");
  const [step3Appendices, setStep3Appendices] = useState(STEP3_APPENDICES);

  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const role = normalizeRole(user?.role);

  async function loadAdminApplications() {
    setLoading(true);
    setError("");
    try {
      const rows = await fetchAdminStep2Applications();
      setApplications(rows || []);
    } catch {
      setError("Unable to load admin dashboard data right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminApplications();
  }, []);

  const step2Ready = useMemo(() => applications.filter((app) => Number(app.currentStep || 0) >= 2), [applications]);

  const stats = useMemo(() => {
    const total = step2Ready.length;
    const inPrinciplePending = step2Ready.filter((app) => Number(app.currentStep || 0) === 2).length;
    const underOnboarding = step2Ready.filter((app) => Number(app.currentStep || 0) > 2 && Number(app.currentStep || 0) < 11).length;
    const completed = step2Ready.filter((app) => Number(app.currentStep || 0) >= 11).length;
    return { total, inPrinciplePending, underOnboarding, completed };
  }, [step2Ready]);

  async function openStep3Workflow(app) {
    setModalMode("issue");
    setShowIssueViewDetails(false);
    setSelectedApplication(app);
    setStep3Loading(true);
    setStep3Error("");
    setStep3Remarks("");
    setStep3Appendices(STEP3_APPENDICES);

    try {
      const step3 = await fetchInPrincipleApproval(app.id);
      setStep3Remarks(step3?.remarks || "");
      setStep3Appendices(
        Array.isArray(step3?.appendices) && step3.appendices.length > 0
          ? step3.appendices
          : STEP3_APPENDICES
      );
    } catch {
      setStep3Error("Unable to load Step 3 details right now.");
    } finally {
      setStep3Loading(false);
    }
  }

  function openApplicantDetails(app) {
    setModalMode("details");
    setShowIssueViewDetails(false);
    setSelectedApplication(app);
  }

  function toggleAppendix(appendix) {
    setStep3Appendices((prev) =>
      prev.includes(appendix) ? prev.filter((item) => item !== appendix) : [...prev, appendix]
    );
  }

  async function handleIssueStep3(app) {
    if (!app) return;
    if (!step3Appendices.length) {
      setStep3Error("Select at least one appendix before issuing Step 3.");
      return;
    }

    try {
      setStep3Saving(true);
      setStep3Error("");
      setIssuingId(app.id);

      await issueInPrincipleApproval(app.id, {
        remarks: step3Remarks.trim() || null,
        appendices: step3Appendices,
        issuedByUserId: user?.id || null,
      });

      await loadAdminApplications();
      setSelectedApplication((prev) => (prev ? { ...prev, currentStep: Math.max(Number(prev.currentStep || 0), 4) } : prev));
      alert(`Step 3 In-Principle Approval Letter issued for ${app.applicationId}.`);
    } catch (err) {
      setStep3Error(err?.response?.data?.message || "Failed to issue Step 3 approval letter");
    } finally {
      setIssuingId(null);
      setStep3Saving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function closeStep3Workflow() {
    setSelectedApplication(null);
    setModalMode("details");
    setShowIssueViewDetails(false);
    setStep3Error("");
    setStep3Remarks("");
    setStep3Appendices(STEP3_APPENDICES);
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to={getDashboardPathByRole(user?.role)} replace />;

  const renderPayloadValue = (key, value) => {
    const text = String(value ?? "-");

    if (key === "signatureDataUrl" && text.startsWith("data:image/")) {
      return (
        <div style={{ display: "grid", gap: 8 }}>
          <strong>Signature captured</strong>
          <img
            src={text}
            alt="Applicant signature"
            style={{
              width: "100%",
              maxWidth: 260,
              maxHeight: 120,
              objectFit: "contain",
              borderRadius: 10,
              border: "1px solid rgba(255,230,0,0.25)",
              background: "rgba(0,0,0,0.25)",
              padding: 6,
            }}
          />
        </div>
      );
    }

    if (text.length > 140) {
      return <strong style={{ wordBreak: "break-word" }}>{text.slice(0, 140)}...</strong>;
    }

    return <strong style={{ wordBreak: "break-word" }}>{text}</strong>;
  };

  return (
    <>
      <div className="asa-dash-layout">
        <aside className="asa-dash-sidebar">
          <div>
            <div className="asa-dash-brand">
              <div className="asa-dash-brand-icon"><Shield size={20} /></div>
              <div>
                <h2>UIDAI Portal</h2>
                <p>ADMIN WORKSPACE</p>
              </div>
            </div>

            <nav className="asa-dash-nav">
              <button type="button" className={`asa-dash-nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
                <LayoutDashboard size={19} />Dashboard
              </button>
              <button type="button" className={`asa-dash-nav-item ${activeTab === "applications" ? "active" : ""}`} onClick={() => setActiveTab("applications")}>
                <FileText size={19} />Step-2 Applications
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
                <span>Admin Dashboard</span>
              </div>
            </div>
          </header>

          <main className="asa-dash-content">
            {error ? <p className="error-banner">{error}</p> : null}
            {loading ? <div className="loading-screen">Loading admin dashboard...</div> : null}

            {!loading && activeTab === "dashboard" ? (
              <>
                <div className="asa-page-head asa-dashboard-head">
                  <div className="asa-dash-headline">
                    <h1>Welcome, {user.fullname || "Admin"}</h1>
                    <p>Applicant full details are visible once Step 2 (Application ID generation) is completed.</p>
                  </div>
                </div>

                <section className="asa-dash-metrics">
                  <article className="asa-metric-card">
                    <div className="asa-metric-icon orange"><ClipboardList size={20} /></div>
                    <strong>{stats.total}</strong>
                    <p>Total Step-2+ Applications</p>
                  </article>
                  <article className="asa-metric-card">
                    <div className="asa-metric-icon"><Eye size={20} /></div>
                    <strong>{stats.inPrinciplePending}</strong>
                    <p>Step 3 Pending</p>
                  </article>
                  <article className="asa-metric-card">
                    <div className="asa-metric-icon"><GitBranch size={20} /></div>
                    <strong>{stats.underOnboarding}</strong>
                    <p>Under Onboarding</p>
                  </article>
                  <article className="asa-metric-card">
                    <div className="asa-metric-icon"><Activity size={20} /></div>
                    <strong>{stats.completed}</strong>
                    <p>Completed</p>
                  </article>
                </section>
              </>
            ) : null}

            {!loading && activeTab === "applications" ? (
              <section className="asa-applications-page">
                <div className="asa-page-head">
                  <div>
                    <h2>Applications</h2>
                    <p>Open an application and issue the In-Principle Approval Letter.</p>
                  </div>
                </div>

                <div className="asa-app-list-wrap">
                  {step2Ready.length === 0 ? (
                    <p className="helper-text">No Step-2 applications available yet.</p>
                  ) : (
                    step2Ready.map((item) => (
                      <article key={item.id} className="asa-app-list-row">
                        <div className="asa-app-left">
                          <div className="asa-app-doc"><FileText size={22} /></div>
                          <div>
                            <h4>{item.organizationName || "Organization"}</h4>
                            <p>{item.applicationId || "-"}</p>
                          </div>
                        </div>

                        <div className="asa-app-right">
                          <small>{item.email || "-"}</small>
                        </div>

                        <button
                          type="button"
                          className="asa-icon-action"
                          onClick={() => openApplicantDetails(item)}
                          aria-label="View full applicant details"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          className="asa-inline-new-btn"
                          onClick={() => openStep3Workflow(item)}
                        >
                          <Send size={15} />
                          {Number(item.currentStep || 0) >= 4 ? "Issued" : "Issue"}
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
                    <strong>{user.role || "Admin"}</strong>
                  </div>
                </div>
              </section>
            ) : null}
          </main>
        </section>
      </div>

      {selectedApplication ? (
        <div className="asa-modal-backdrop" onClick={closeStep3Workflow}>
          <div className="asa-modal asa-admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="asa-modal-head">
              <div className="asa-modal-title">
                <div className="asa-app-doc"><FileText size={20} /></div>
                <h3>{modalMode === "issue" ? "Issue Step 3: In-Principle Approval Letter" : "Applicant Full Details"}</h3>
              </div>
              <button type="button" className="asa-icon-action" onClick={closeStep3Workflow}>
                <X size={18} />
              </button>
            </div>

            {modalMode === "details" ? (
              <>
                <div className="asa-modal-grid">
                  <div><span>APPLICATION ID</span><p>{selectedApplication.applicationId || "-"}</p></div>
                  <div><span>CURRENT STEP</span><p>{selectedApplication.currentStep || "-"}</p></div>
                  <div><span>ORGANIZATION</span><p>{selectedApplication.organizationName || "-"}</p></div>
                  <div><span>APPLICANT NAME</span><p>{selectedApplication.applicantName || "-"}</p></div>
                  <div><span>EMAIL</span><p>{selectedApplication.email || "-"}</p></div>
                  <div><span>MOBILE</span><p>{selectedApplication.mobile || "-"}</p></div>
                </div>

                <div className="asa-dash-panel" style={{ marginTop: 14 }}>
                  <div className="asa-panel-head">
                    <h3>Submitted Form Payload</h3>
                  </div>
                  <div className="asa-profile-grid">
                    {selectedApplication.submittedForm && Object.keys(selectedApplication.submittedForm).length > 0 ? (
                      Object.entries(selectedApplication.submittedForm).map(([key, value]) => (
                        <div key={key}>
                          <span>{key}</span>
                          {renderPayloadValue(key, value)}
                        </div>
                      ))
                    ) : (
                      <p className="helper-text">No detailed form payload found for this application.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <p className="helper-text" style={{ marginTop: 0 }}>
                    Select appendices, add notes if needed, and issue Step 3.
                  </p>
                  <button
                    type="button"
                    className="asa-inline-new-btn"
                    onClick={() => setShowIssueViewDetails((prev) => !prev)}
                  >
                    <Eye size={15} />
                    {showIssueViewDetails ? "Hide Details" : "View Details"}
                  </button>
                </div>

                {showIssueViewDetails ? (
                  <div className="asa-dash-panel" style={{ marginTop: 12 }}>
                    <div className="asa-panel-head">
                      <h3>Applicant Full Details</h3>
                    </div>
                    <div className="asa-modal-grid">
                      <div><span>APPLICATION ID</span><p>{selectedApplication.applicationId || "-"}</p></div>
                      <div><span>CURRENT STEP</span><p>{selectedApplication.currentStep || "-"}</p></div>
                      <div><span>ORGANIZATION</span><p>{selectedApplication.organizationName || "-"}</p></div>
                      <div><span>APPLICANT NAME</span><p>{selectedApplication.applicantName || "-"}</p></div>
                      <div><span>EMAIL</span><p>{selectedApplication.email || "-"}</p></div>
                      <div><span>MOBILE</span><p>{selectedApplication.mobile || "-"}</p></div>
                    </div>

                    <div className="asa-dash-panel" style={{ marginTop: 12 }}>
                      <div className="asa-panel-head">
                        <h3>Submitted Form Payload</h3>
                      </div>
                      <div className="asa-profile-grid">
                        {selectedApplication.submittedForm && Object.keys(selectedApplication.submittedForm).length > 0 ? (
                          Object.entries(selectedApplication.submittedForm).map(([key, value]) => (
                            <div key={key}>
                              <span>{key}</span>
                              {renderPayloadValue(key, value)}
                            </div>
                          ))
                        ) : (
                          <p className="helper-text">No detailed form payload found for this application.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="asa-dash-panel" style={{ marginTop: 14 }}>
                  <div className="asa-panel-head">
                    <h3>Step 3: In-Principle Approval Letter</h3>
                  </div>

                  {step3Loading ? (
                    <p className="helper-text">Loading Step 3 details...</p>
                  ) : (
                    <>
                      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                        {STEP3_APPENDICES.map((appendix) => (
                          <label
                            key={appendix}
                            style={{
                              display: "flex",
                              gap: 10,
                              alignItems: "flex-start",
                              border: "1px solid rgba(255,230,0,0.2)",
                              borderRadius: 10,
                              padding: "10px 12px",
                              background: "rgba(255,230,0,0.05)",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={step3Appendices.includes(appendix)}
                              onChange={() => toggleAppendix(appendix)}
                              style={{ marginTop: 2 }}
                            />
                            <span style={{ color: "#f8f8f8", fontSize: 14, lineHeight: 1.45 }}>{appendix}</span>
                          </label>
                        ))}
                      </div>

                      <div style={{ marginTop: 14 }}>
                        <label style={{ display: "grid", gap: 8 }}>
                          <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>
                            Remarks (optional)
                          </span>
                          <textarea
                            value={step3Remarks}
                            onChange={(e) => setStep3Remarks(e.target.value)}
                            placeholder="Add approval notes for this Step 3 issue."
                            style={{
                              width: "100%",
                              minHeight: 96,
                              borderRadius: 12,
                              padding: 12,
                              border: "1px solid rgba(255,230,0,0.25)",
                              background: "#121218",
                              color: "#fff",
                            }}
                          />
                        </label>
                      </div>

                      {step3Error ? <p className="error-banner" style={{ marginTop: 12 }}>{step3Error}</p> : null}

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                        {Number(selectedApplication.currentStep || 0) >= 4 ? (
                          <a
                            href={getInPrincipleApprovalLetterPdfUrl(selectedApplication.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="asa-inline-new-btn"
                          >
                            <Download size={15} />
                            Download Step 3 Letter
                          </a>
                        ) : null}

                        <button
                          type="button"
                          className="asa-inline-new-btn"
                          onClick={() => handleIssueStep3(selectedApplication)}
                          disabled={step3Saving || issuingId === selectedApplication.id}
                        >
                          <Send size={15} />
                          {step3Saving || issuingId === selectedApplication.id ? "Issuing Step 3..." : "Issue Step 3 Approval Letter"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

