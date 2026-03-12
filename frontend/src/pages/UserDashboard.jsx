import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Activity,
  BadgeCheck,
  CheckCircle,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock3,
  Eye,
  FileText,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Mail,
  Phone,
  Plus,
  Shield,
  User,
  X,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import { fetchApplications } from "../services/portalApi";
import uidaiLogo from "../assets/uidai-logo.jpg";

const onboardingSteps = [
  {
    id: 1,
    title: "Application Submission",
    description: "Submission of application form for appointment as ASA by applicant",
    action: "Submit application form with organization details",
    documents: ["Application form submitted", "Organization details verified"],
  },
  {
    id: 2,
    title: "Application ID Generation",
    description: "Generation of unique application ID",
    action: "System generates unique ASA application ID",
    documents: ["Unique application ID generated", "ID mapped to applicant profile"],
  },
  {
    id: 3,
    title: "In-Principle Approval",
    description: "Issue of In-Principle approval letter to the applicant along with list of appendices",
    action: "Review and acknowledge in-principle approval documents",
    documents: [
      "ASA Agreement V 6.0",
      "Invoice for payment of Initial License Fee",
      "Performance Bank Guarantee",
      "Pre-onboarding Audit Compliance Checklist",
      "Onboarding Audit Compliance Checklist",
    ],
  },
  {
    id: 4,
    title: "ASA Agreement Execution",
    description: "Execution of ASA agreement and submission of bank guarantee",
    timeline: "90 days from in-principle approval",
    action: "Sign ASA agreement and submit bank guarantee",
    documents: ["Signed ASA agreement uploaded", "Performance bank guarantee submitted"],
  },
  {
    id: 5,
    title: "Pre-onboarding Audit",
    description: "Undertaking Pre-onboarding Audit as per compliance check-list by CERT-IN empanelled auditor",
    timeline: "90 days from in-principle approval",
    action: "Coordinate with assigned auditor for pre-onboarding audit",
    documents: ["Audit schedule confirmed", "Pre-onboarding audit evidence uploaded"],
  },
  {
    id: 6,
    title: "Audit Report Submission & Approval",
    description: "Submission of report and artefacts and obtaining approval from UIDAI",
    timeline: "90 days from in-principle approval",
    action: "Submit audit report and artefacts for UIDAI review",
    documents: ["Audit report uploaded", "UIDAI review acknowledgement received"],
  },
  {
    id: 7,
    title: "Pre-production Access Key",
    description: "Issue of pre-production access key and mapping of entity under Pre-Production environment",
    timeline: "30 days",
    action: "Receive pre-production key and configure environment",
    documents: ["Pre-production key issued", "Environment mapping confirmation"],
  },
  {
    id: 8,
    title: "IS Audit",
    description: "Undertaking IS Audit by CERT-IN empanelled auditor and submission of report and artefacts",
    timeline: "30 days",
    action: "Complete IS audit and submit compliance report",
    documents: ["IS audit report uploaded", "Compliance artefacts submitted"],
  },
  {
    id: 9,
    title: "IS Division Approval",
    description: "Intimation of approval provided to entity and Tech Centre once approved by IS division",
    timeline: "30 days",
    action: "Receive IS division approval notification",
    documents: ["IS division approval note uploaded", "Tech Centre informed"],
  },
  {
    id: 10,
    title: "Balance License Fee Payment",
    description: "Payment of balance license fee and receipt verification",
    action: "Submit balance license fee payment receipt",
    documents: ["Balance fee payment receipt uploaded", "Payment verification completed"],
  },
  {
    id: 11,
    title: "Migration to Live Production",
    description: "Migration of entity to Live Production environment",
    action: "Entity moved to live production",
    documents: ["Go-live signoff uploaded", "Live production migration completed"],
  },
];

function getScopedApplications(applications, user) {
  if (!user) return [];
  if (user.role === "Applicant") {
    return applications.filter(
      (application) => application.createdByUserId === user.id || application.email?.toLowerCase() === user.email?.toLowerCase()
    );
  }
  return applications;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN");
}

function toStatusLabel(application) {
  if (!application?.overallStatus) return "Submitted";
  if (application.currentStep >= 11) return "Approved";
  return "Submitted";
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const saved = sessionStorage.getItem("dashboardTab");
    const allowed = ["dashboard", "applications", "flow", "profile"];
    if (saved && allowed.includes(saved)) {
      sessionStorage.removeItem("dashboardTab");
      return saved;
    }
    return "dashboard";
  });
  const [selectedAppId, setSelectedAppId] = useState("");
  const [expandedStep, setExpandedStep] = useState(2);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
      .then((rows) => setApplications(rows || []))
      .catch(() => setError("Unable to load dashboard data right now."))
      .finally(() => setLoading(false));
  }, []);

  const scoped = useMemo(() => getScopedApplications(applications, user), [applications, user]);

  useEffect(() => {
    if (!selectedAppId && scoped.length > 0) {
      setSelectedAppId(scoped[0].id);
    }
  }, [scoped, selectedAppId]);

  const selectedApplication = useMemo(() => {
    if (!selectedAppId) return scoped[0] || null;
    return scoped.find((app) => String(app.id) === String(selectedAppId)) || scoped[0] || null;
  }, [scoped, selectedAppId]);

  const metrics = useMemo(() => {
    const total = scoped.length;
    const approved = scoped.filter((item) => item.currentStep >= 11).length;
    const inProgress = scoped.filter((item) => item.currentStep > 1 && item.currentStep < 11).length;
    const pendingReview = Math.max(total - approved - inProgress, 0);
    return { total, approved, inProgress, pendingReview };
  }, [scoped]);

  const latestApplication = useMemo(() => {
    if (scoped.length === 0) return null;
    return [...scoped].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0];
  }, [scoped]);

  const completionCount = selectedApplication?.currentStep || 1;
  const displayName = user?.fullname || user?.email?.split("@")?.[0] || "Applicant";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  if (!user) {
    return <Navigate to="/login" replace />;
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
                <p>ASA ONBOARDING</p>
              </div>
            </div>

            <nav className="asa-dash-nav">
              <button type="button" className={`asa-dash-nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
                <LayoutDashboard size={19} />Dashboard
              </button>
              <button type="button" className={`asa-dash-nav-item ${activeTab === "applications" ? "active" : ""}`} onClick={() => setActiveTab("applications")}>
                <FileText size={19} />My Applications
              </button>
              <button type="button" className={`asa-dash-nav-item ${activeTab === "flow" ? "active" : ""}`} onClick={() => setActiveTab("flow")}>
                <GitBranch size={19} />Onboarding Flow
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
                <span>Unique Identification Authority of India</span>
              </div>
            </div>
          </header>

          <main className="asa-dash-content">
            {error ? <p className="error-banner">{error}</p> : null}
            {loading ? <div className="loading-screen">Loading dashboard...</div> : null}

            {!loading && activeTab === "dashboard" ? (
              <>
                <div className="asa-page-head asa-dashboard-head">
                  <div className="asa-dash-headline">
                    <h1>Welcome back, {displayName}</h1>
                    <p>Here&apos;s your ASA onboarding overview</p>
                  </div>
                  <button type="button" className="asa-inline-new-btn" onClick={() => navigate("/form")}>
                    <Plus size={16} />
                    New Application
                  </button>
                </div>

                <section className="asa-dash-metrics">
                  <button
                    type="button"
                    className="asa-metric-card asa-metric-card-click"
                    onClick={() => setActiveTab("applications")}
                    aria-label="Open My Applications"
                  >
                    <div className="asa-metric-icon orange"><ClipboardList size={20} /></div>
                    <strong>{metrics.total}</strong>
                    <p>Total Applications</p>
                  </button>
                  <article className="asa-metric-card">
                    <div className="asa-metric-icon"><Activity size={20} /></div>
                    <strong>{metrics.inProgress}</strong>
                    <p>In Progress</p>
                  </article>
                  <article className="asa-metric-card">
                    <div className="asa-metric-icon"><BadgeCheck size={20} /></div>
                    <strong>{metrics.approved}</strong>
                    <p>Approved (Live)</p>
                  </article>
                  <article className="asa-metric-card">
                    <div className="asa-metric-icon"><Clock3 size={20} /></div>
                    <strong>{metrics.pendingReview}</strong>
                    <p>Pending Review</p>
                  </article>
                </section>

                <section className="asa-dash-panels">
                  <article className="asa-dash-panel">
                    <div className="asa-panel-head">
                      <h3>Recent Applications</h3>
                    </div>

                    {latestApplication ? (
                      <button
                        type="button"
                        className="asa-recent-item asa-recent-item-click"
                        onClick={() => {
                          setSelectedAppId(latestApplication.id);
                          setExpandedStep(latestApplication.currentStep || 1);
                          setActiveTab("flow");
                        }}
                        aria-label="Open recent application"
                      >
                        <div>
                          <strong>{latestApplication.organizationName || "Organization"}</strong>
                          <p>{latestApplication.applicationId}</p>
                        </div>
                        <span>Step {latestApplication.currentStep || 1}/11</span>
                      </button>
                    ) : (
                      <p className="helper-text">No application found. Click New Application to create one.</p>
                    )}
                  </article>

                  <article className="asa-dash-panel">
                    <h3>11-Step Onboarding Process</h3>
                    <div className="asa-step-mini-list">
                      {onboardingSteps.map((step) => (
                        <div key={step.id} className="asa-step-mini-item">
                          <span>{step.id}</span>
                          <p>{step.title}</p>
                          {step.timeline ? <em>{step.timeline.includes("90") ? "90 days" : "30 days"}</em> : <em />}
                        </div>
                      ))}
                    </div>
                  </article>
                </section>
              </>
            ) : null}

            {!loading && activeTab === "applications" ? (
              <section className="asa-applications-page">
                <div className="asa-page-head">
                  <div>
                    <h2>My Applications</h2>
                    <p>Manage your ASA onboarding applications</p>
                  </div>
                  <button type="button" className="asa-inline-new-btn" onClick={() => navigate("/form")}>
                    <Plus size={16} />
                    New Application
                  </button>
                </div>

                <div className="asa-app-list-wrap">
                  {scoped.length === 0 ? (
                    <p className="helper-text">No applications found. Create your first one from New Application.</p>
                  ) : (
                    scoped.map((item) => (
                      <article key={item.id} className="asa-app-list-row">
                        <div className="asa-app-left">
                          <div className="asa-app-doc"><FileText size={22} /></div>
                          <div>
                            <h4>{item.organizationName || "Organization"}</h4>
                            <p>{item.applicationId || "-"} • {item.applicantName || "Applicant"}</p>
                          </div>
                        </div>

                        <div className="asa-app-right">
                          <span className="asa-status-pill">{toStatusLabel(item)}</span>
                          <small>Step {item.currentStep || 1}/11</small>
                        </div>

                        <button
                          type="button"
                          className="asa-icon-action"
                          onClick={() => {
                            setSelectedAppId(item.id);
                            setShowDetailsModal(true);
                          }}
                          aria-label="View application details"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          className="asa-icon-action"
                          onClick={() => {
                            setSelectedAppId(item.id);
                            setActiveTab("flow");
                          }}
                          aria-label="Open onboarding flow"
                        >
                          <ArrowRight size={18} />
                        </button>
                      </article>
                    ))
                  )}
                </div>
              </section>
            ) : null}

            {!loading && activeTab === "flow" ? (
              <section>
                <div className="asa-page-head asa-flow-head">
                  <div>
                    <h2>Onboarding Flow</h2>
                    <p>Track your ASA onboarding through all 11 steps</p>
                  </div>
                  <div className="asa-flow-controls">
                    <button type="button" className="asa-light-btn" onClick={() => setShowDetailsModal(true)}>
                      <Eye size={16} />
                      View Details
                    </button>
                    <select
                      className="asa-flow-select"
                      value={selectedApplication?.id || ""}
                      onChange={(e) => setSelectedAppId(e.target.value)}
                    >
                      {scoped.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.applicationId} - {item.organizationName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedApplication ? (
                  <article className="asa-flow-summary">
                    <div className="asa-flow-summary-top">
                      <div className="asa-app-left">
                        <div className="asa-app-doc"><FileText size={22} /></div>
                        <div>
                          <h4>{selectedApplication.organizationName || "Organization"}</h4>
                          <p>{selectedApplication.applicationId || "-"}</p>
                        </div>
                      </div>
                      <div className="asa-flow-progress-numbers">
                        <strong>{selectedApplication.currentStep || 1}/11</strong>
                        <span>STEPS COMPLETED</span>
                      </div>
                    </div>
                    <div className="asa-flow-track">
                      <div style={{ width: `${Math.max(((selectedApplication.currentStep || 1) / 11) * 100, 2)}%` }} />
                    </div>
                    <small>{Math.round(((selectedApplication.currentStep || 1) / 11) * 100)}% complete</small>
                  </article>
                ) : null}

                <div className="asa-flow-list">
                  {onboardingSteps.map((step, idx) => {
                    const isCurrent = step.id === (selectedApplication?.currentStep || 1);
                    const isDone = step.id < (selectedApplication?.currentStep || 1);
                    const isExpanded = expandedStep === step.id;

                    return (
                      <div key={step.id}>
                        <article className={`asa-flow-step ${isCurrent ? "current" : ""}`}>
                          <div className="asa-flow-step-row">
                            <div className="asa-flow-step-icon"><FileText size={20} /></div>
                            <div className="asa-flow-step-body">
                              <div className="asa-flow-step-title-row">
                                <h4>Step {step.id}: {step.title}</h4>
                                <div className="asa-flow-pill-row">
                                  <span className="asa-pill-muted">{isDone ? "Completed" : "Pending"}</span>
                                  {isCurrent ? <span className="asa-pill-current">Current</span> : null}
                                </div>
                              </div>
                              <p>{step.description}</p>
                            </div>
                            <button type="button" className="asa-flow-expand" onClick={() => setExpandedStep(isExpanded ? null : step.id)}>
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </div>

                          {isExpanded ? (
                            <div className="asa-flow-expanded">
                              <div>
                                <span>DESCRIPTION</span>
                                <p>{step.description}</p>
                              </div>
                              <div>
                                <span>REQUIRED ACTION</span>
                                <p>{step.action}</p>
                              </div>
                              <div>
                                <span>REQUIRED DOCUMENTS</span>
                                <ul className="asa-flow-check-list">
                                  {step.documents.map((doc) => (
                                    <li key={doc}>
                                      <CheckCircle size={13} />
                                      <span>{doc}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="asa-flow-dates">
                                <div>
                                  <span>STARTED</span>
                                  <p>{isDone || isCurrent ? "Started" : "Not started"}</p>
                                </div>
                                <div>
                                  <span>COMPLETED</span>
                                  <p>{isDone ? "Completed" : "Pending"}</p>
                                </div>
                              </div>
                              {step.timeline ? <small>Timeline: {step.timeline}</small> : null}
                            </div>
                          ) : null}
                        </article>
                        {idx < onboardingSteps.length - 1 ? (
                          <div className="asa-flow-arrow">
                            <ArrowDown size={16} />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
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
                    <strong>{user.role || "Applicant"}</strong>
                  </div>
                </div>
              </section>
            ) : null}
          </main>
        </section>
      </div>

      {showDetailsModal && selectedApplication ? (
        <div className="asa-modal-backdrop" onClick={() => setShowDetailsModal(false)}>
          <div className="asa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="asa-modal-head">
              <div className="asa-modal-title">
                <div className="asa-app-doc"><FileText size={20} /></div>
                <h3>Application Details</h3>
              </div>
              <button type="button" className="asa-icon-action" onClick={() => setShowDetailsModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="asa-modal-grid">
              <div>
                <span><FileText size={14} /> APPLICATION ID</span>
                <p>{selectedApplication.applicationId || "-"}</p>
              </div>
              <div>
                <span><Building2 size={14} /> ORGANIZATION</span>
                <p>{selectedApplication.organizationName || "-"}</p>
              </div>
              <div>
                <span><User size={14} /> CONTACT PERSON</span>
                <p>{selectedApplication.applicantName || "-"}</p>
              </div>
              <div>
                <span><Mail size={14} /> EMAIL</span>
                <p>{selectedApplication.email || "-"}</p>
              </div>
              <div>
                <span><Phone size={14} /> PHONE</span>
                <p>{selectedApplication.mobile || "-"}</p>
              </div>
              <div>
                <span><Calendar size={14} /> SUBMITTED ON</span>
                <p>{formatDate(selectedApplication.createdAt)}</p>
              </div>
            </div>

            <div className="asa-modal-progress">
              <div>
                <small>CURRENT STATUS</small>
                <span className="asa-status-pill">{toStatusLabel(selectedApplication)}</span>
              </div>
              <div className="asa-modal-progress-right">
                <small>PROGRESS</small>
                <strong>Step {selectedApplication.currentStep || 1}/11</strong>
              </div>
            </div>
            <div className="asa-flow-track"><div style={{ width: `${Math.max(((selectedApplication.currentStep || 1) / 11) * 100, 2)}%` }} /></div>

            <button
              type="button"
              className="asa-modal-cta"
              onClick={() => {
                setShowDetailsModal(false);
                setActiveTab("flow");
              }}
            >
              View Onboarding Flow
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

































