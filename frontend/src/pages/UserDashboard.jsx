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
import { fetchApplications, getInPrincipleApprovalLetterPdfUrl, fetchStep4Details, submitStep4Details } from "../services/portalApi";
import uidaiLogo from "../assets/uidai-logo.jpg";
import { getDashboardPathByRole, normalizeRole } from "../utils/roleRoutes";

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

const ASA_AGREEMENT_TEMPLATE_URL = "/ASA_Agreement_UIDAI_Template.pdf";
const PBG_TEMPLATE_URL = "/Performance_Bank_Guarantee_ASA_Template.pdf";

function getScopedApplications(applications, user) {
  if (!user) return [];
  if (String(user.role || "").toLowerCase() === "applicant") {
    const mine = applications.filter(
      (application) => application.createdByUserId === user.id || application.email?.toLowerCase() === user.email?.toLowerCase()
    );

    if (mine.length <= 1) return mine;

    return [...mine]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 1);
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
  const [showStep4Modal, setShowStep4Modal] = useState(false);

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
  const [step4Details, setStep4Details] = useState(null);
  const [step4Loading, setStep4Loading] = useState(false);
  const [step4Submitting, setStep4Submitting] = useState(false);
  const [step4Error, setStep4Error] = useState("");
  const [step4Success, setStep4Success] = useState("");
  const [step4Form, setStep4Form] = useState({ asaAgreementRef: "", pbgRef: "", remarks: "" });
  const [step4Files, setStep4Files] = useState({
    asaAgreementFileData: "",
    asaAgreementFileName: "",
    pbgFileData: "",
    pbgFileName: "",
  });

  useEffect(() => {
    fetchApplications(user)
      .then((rows) => setApplications(rows || []))
      .catch(() => setError("Unable to load dashboard data right now."))
      .finally(() => setLoading(false));
  }, [user]);

  const scoped = useMemo(() => getScopedApplications(applications, user), [applications, user]);

  useEffect(() => {
    if (!selectedAppId && scoped.length > 0) {
      setSelectedAppId(scoped[0].id);
    }
  }, [scoped, selectedAppId]);


  useEffect(() => {
    setShowStep4Modal(false);
  }, [selectedAppId]);
  const selectedApplication = useMemo(() => {
    if (!selectedAppId) return scoped[0] || null;
    return scoped.find((app) => String(app.id) === String(selectedAppId)) || scoped[0] || null;
  }, [scoped, selectedAppId]);
  useEffect(() => {
    if (!selectedApplication || Number(selectedApplication.currentStep || 0) < 4) {
      setStep4Details(null);
      setStep4Error("");
      setStep4Success("");
      return;
    }

    let alive = true;
    setStep4Loading(true);
    setStep4Error("");

    const appId = Number(selectedApplication.id);
    if (!Number.isFinite(appId)) {
      setStep4Loading(false);
      setStep4Error("Invalid application id for Step 4.");
      return;
    }

    fetchStep4Details(appId)
      .then((details) => {
        if (!alive) return;
        setStep4Details(details || null);
        setStep4Form({
          asaAgreementRef: details?.asaAgreementRef || "",
          pbgRef: details?.pbgRef || "",
          remarks: details?.remarks || "",
        });
        setStep4Files({
          asaAgreementFileData: "",
          asaAgreementFileName: details?.asaAgreementFileName || "",
          pbgFileData: "",
          pbgFileName: details?.pbgFileName || "",
        });
      })
      .catch(() => {
        if (!alive) return;
        setStep4Error("Unable to load Step 4 details right now.");
      })
      .finally(() => {
        if (!alive) return;
        setStep4Loading(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedApplication]);

  const metrics = useMemo(() => {
    const total = scoped.length;
    const approved = scoped.filter((item) => item.currentStep >= 11).length;
    const inProgress = scoped.filter((item) => item.currentStep > 1 && item.currentStep < 11).length;
    const pendingReview = Math.max(total - approved - inProgress, 0);
    return { total, approved, inProgress, pendingReview };
  }, [scoped]);


  const displayName = user?.fullname || user?.email?.split("@")?.[0] || "User";
  const roleNormalized = normalizeRole(user?.role || "Applicant");
  const isApplicant = roleNormalized === "applicant";
  const appListTitle = isApplicant ? "My Applications" : "All Applications";
  const appListSubtitle = isApplicant ? "Manage your ASA onboarding applications" : "Monitor and review submitted ASA onboarding applications";
  const hasExistingApplication = isApplicant && scoped.length > 0;
  const hasStep4Submission = Boolean(step4Details?.submittedAt);
  const step4ReviewStatus = step4Details?.reviewStatus || "pending";
  const startedSteps = useMemo(() => {
    if (!selectedApplication) return [];
    const currentStep = Number(selectedApplication.currentStep || 0);
    const overallStatus = String(selectedApplication.overallStatus || "").toLowerCase();
    const effectiveStep = overallStatus.includes("application id generated") && currentStep <= 2 ? 3 : currentStep;
    return onboardingSteps.filter((step) => step.id <= effectiveStep);
  }, [selectedApplication]);

  const dashboardUpdates = useMemo(() => {
    if (!selectedApplication) {
      return [
        {
          title: "Application Pending",
          status: "No Application",
          tone: "pending",
          message: "Start your ASA onboarding application to receive step-by-step updates here.",
        },
      ];
    }

    const currentStep = Number(selectedApplication.currentStep || 0);
    const overallStatus = String(selectedApplication.overallStatus || "");
    const applicationIdGenerated = overallStatus.toLowerCase().includes("application id generated");
    const effectiveStep = applicationIdGenerated && currentStep <= 2 ? 3 : currentStep;
    const updates = [
      {
        title: "Latest Update",
        status: effectiveStep >= 11 ? "Approved" : "In Progress",
        tone: effectiveStep >= 11 ? "success" : "progress",
        message:
          effectiveStep >= 11
            ? "Your application has completed the ASA onboarding journey."
            : `Your application is currently moving through Step ${effectiveStep || 1}.`,
      },
    ];

    if (effectiveStep < 3) {
      updates.push({
        title: "Step 3: In-Principle Approval",
        status: "Queued",
        tone: "pending",
        message: "Step 3 will begin after the application ID is generated.",
      });
    } else if (effectiveStep === 3) {
      updates.push({
        title: "Step 3: In-Principle Approval",
        status: "Under Process",
        tone: "review",
        message: "UIDAI is currently processing your in-principle approval.",
      });
    } else {
      updates.push({
        title: "Step 3: In-Principle Approval",
        status: "Approved",
        tone: "success",
        message: "Your in-principle approval has been completed and the next step is active.",
      });
    }

    if (currentStep >= 4) {
      let step4Status = "Action Needed";
      let step4Tone = "warning";
      let step4Message = "Upload the signed ASA Agreement and Performance Bank Guarantee documents.";

      if (step4ReviewStatus === "approved") {
        step4Status = "Approved";
        step4Tone = "success";
        step4Message = "Step 4 has been reviewed and approved by UIDAI.";
      } else if (step4ReviewStatus === "rejected") {
        step4Status = "Rejected";
        step4Tone = "warning";
        step4Message = "Step 4 was rejected. Please review the remarks and resubmit the required files.";
      } else if (step4Details?.submittedAt) {
        step4Status = "Under Review";
        step4Tone = "review";
        step4Message = "Your Step 4 submission is under review by the admin team.";
      }

      updates.push({
        title: "Step 4: ASA Agreement + PBG",
        status: step4Status,
        tone: step4Tone,
        message: step4Message,
      });
    }

    if (overallStatus) {
      updates.push({
        title: "Portal Status",
        status: "Live Update",
        tone: "progress",
        message: overallStatus,
      });
    }

    return updates;
  }, [selectedApplication, step4Details, step4ReviewStatus]);


  useEffect(() => {
    if (showStep4Modal && Number(selectedApplication?.currentStep || 0) < 4) {
      setShowStep4Modal(false);
    }
  }, [showStep4Modal, selectedApplication]);

  async function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function handleStep4FileChange(event, kind) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setStep4Error("Only PDF files are allowed for Step 4.");
      return;
    }

    try {
      setStep4Error("");
      const dataUrl = await readFileAsDataUrl(file);
      if (kind === "asa") {
        setStep4Files((prev) => ({ ...prev, asaAgreementFileData: dataUrl, asaAgreementFileName: file.name }));
      } else {
        setStep4Files((prev) => ({ ...prev, pbgFileData: dataUrl, pbgFileName: file.name }));
      }
    } catch {
      setStep4Error("Unable to read selected PDF file.");
    }
  }

  async function handleSubmitStep4() {
    if (!selectedApplication || !user?.id) return;

    const hasAgreementPdf = Boolean(step4Files.asaAgreementFileData || step4Details?.asaAgreementFileUrl);
    const hasPbgPdf = Boolean(step4Files.pbgFileData || step4Details?.pbgFileUrl);

    if (!hasAgreementPdf || !hasPbgPdf) {
      setStep4Error("Upload both Signed ASA Agreement PDF and Performance Bank Guarantee PDF.");
      return;
    }

    try {
      setStep4Submitting(true);
      setStep4Error("");
      setStep4Success("");

      const appId = Number(selectedApplication.id);
      if (!Number.isFinite(appId)) {
        setStep4Error("Invalid application id for Step 4 submission.");
        return;
      }

      const response = await submitStep4Details(appId, {
        submittedByUserId: user.id,
        asaAgreementRef: step4Form.asaAgreementRef.trim() || null,
        pbgRef: step4Form.pbgRef.trim() || null,
        remarks: step4Form.remarks.trim() || null,
        asaAgreementFileData: step4Files.asaAgreementFileData || null,
        asaAgreementFileName: step4Files.asaAgreementFileName || null,
        pbgFileData: step4Files.pbgFileData || null,
        pbgFileName: step4Files.pbgFileName || null,
      });

      const nextApplication = response?.application || null;
      setStep4Success("Step 4 details submitted successfully. Awaiting admin review.");

      if (nextApplication) {
        setApplications((prev) =>
          prev.map((item) => (String(item.id) === String(nextApplication.id) ? nextApplication : item))
        );
      }

      const refreshed = await fetchStep4Details(appId);
      setStep4Details(refreshed || null);
      setStep4Files({
        asaAgreementFileData: "",
        asaAgreementFileName: refreshed?.asaAgreementFileName || step4Files.asaAgreementFileName,
        pbgFileData: "",
        pbgFileName: refreshed?.pbgFileName || step4Files.pbgFileName,
      });
    } catch (err) {
      setStep4Error(err?.response?.data?.message || "Failed to submit Step 4 details.");
    } finally {
      setStep4Submitting(false);
    }
  }

  function getStepStatus(stepId) {
    const currentStep = Number(selectedApplication?.currentStep || 0);
    const overallStatus = String(selectedApplication?.overallStatus || "").toLowerCase();
    const applicationIdGenerated = overallStatus.includes("application id generated");

    if (stepId === 2 && applicationIdGenerated) return "Completed";
    if (stepId === 3 && applicationIdGenerated && currentStep <= 2) return "In Progress";
    if (stepId < currentStep) return "Completed";
    if (stepId === currentStep) return "In Progress";
    return "Pending";
  }

  function getStepStatusTone(stepId) {
    const currentStep = Number(selectedApplication?.currentStep || 0);
    const overallStatus = String(selectedApplication?.overallStatus || "").toLowerCase();

    if (stepId === 2 && (stepId < currentStep || overallStatus.includes("application id generated"))) return "success";
    if (stepId === 3 && (stepId < currentStep || stepId === currentStep)) return stepId < currentStep ? "success" : "review";

    if (stepId === 4) {
      if (step4ReviewStatus === "approved") return "success";
      if (step4ReviewStatus === "rejected") return "warning";
      if (step4Details?.submittedAt) return "review";
      if (stepId === currentStep) return "warning";
    }

    if (stepId < currentStep) return "success";
    if (stepId === currentStep) return "progress";
    return "pending";
  }

  function openStartedStep(stepId) {
    if (!selectedApplication) return;

    if (stepId === 2) {
      setShowStep4Modal(false);
      navigate("/application-success", { state: { application: selectedApplication } });
      return;
    }

    if (stepId === 4) {
      setShowStep4Modal(true);
      return;
    }

    setShowStep4Modal(false);
    setExpandedStep(stepId);
    setActiveTab("flow");
  }
  function renderStep4Section() {
    if (!selectedApplication) {
      return <p className="helper-text">No application found.</p>;
    }

    if (Number(selectedApplication.currentStep || 1) < 4) {
      return <p className="helper-text">Step 4 will appear here once your application reaches that stage.</p>;
    }

    return (
      <>
        <div className="asa-panel-head asa-step4-header">
          <div>
            <h3>Step 4: ASA Agreement + PBG Submission</h3>
            <p>Download the official templates, complete both documents, and upload the signed PDFs for UIDAI review.</p>
          </div>
        </div>

        {step4Loading ? (
          <p className="helper-text">Loading Step 4 details...</p>
        ) : (
          <div className="asa-step4-card">
            <div className="asa-step4-status-grid">
              <div className="asa-step4-status-item">
                <span>Review Status</span>
                <strong>{step4ReviewStatus.toUpperCase()}</strong>
              </div>
              <div className="asa-step4-status-item">
                <span>Submitted At</span>
                <strong>{step4Details?.submittedAt ? formatDate(step4Details.submittedAt) : "-"}</strong>
              </div>
              <div className="asa-step4-status-item">
                <span>Admin Remarks</span>
                <strong>{step4Details?.reviewRemarks || "-"}</strong>
              </div>
            </div>

            <div className="asa-step4-template-row">
              <a href={ASA_AGREEMENT_TEMPLATE_URL} target="_blank" rel="noreferrer" className="asa-step4-template-link">
                <FileText size={15} />
                <span>ASA Agreement Template</span>
              </a>
              <a href={PBG_TEMPLATE_URL} target="_blank" rel="noreferrer" className="asa-step4-template-link">
                <FileText size={15} />
                <span>Bank Guarantee Template</span>
              </a>
            </div>

            <div className="asa-step4-upload-grid">
              <section className="asa-step4-upload-card">
                <div className="asa-step4-upload-head">
                  <h4>ASA Agreement</h4>
                  <p>Upload the signed agreement PDF.</p>
                </div>
                <input
                  type="text"
                  value={step4Form.asaAgreementRef}
                  onChange={(e) => setStep4Form((prev) => ({ ...prev, asaAgreementRef: e.target.value }))}
                  placeholder="Reference / document number (optional)"
                  className="asa-flow-select"
                  disabled={step4Submitting || (hasStep4Submission && step4ReviewStatus === "approved")}
                />
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleStep4FileChange(e, "asa")}
                  className="asa-flow-select"
                  disabled={step4Submitting || (hasStep4Submission && step4ReviewStatus === "approved")}
                />
                <small className="asa-step4-file-note">
                  {step4Files.asaAgreementFileName ? `Selected: ${step4Files.asaAgreementFileName}` : "PDF only, max 15 MB"}
                </small>
                {step4Details?.asaAgreementFileUrl ? (
                  <a href={step4Details.asaAgreementFileUrl} target="_blank" rel="noreferrer" className="asa-step4-secondary-link">
                    Download current ASA Agreement
                  </a>
                ) : null}
              </section>

              <section className="asa-step4-upload-card">
                <div className="asa-step4-upload-head">
                  <h4>Performance Bank Guarantee</h4>
                  <p>Upload the final bank guarantee PDF.</p>
                </div>
                <input
                  type="text"
                  value={step4Form.pbgRef}
                  onChange={(e) => setStep4Form((prev) => ({ ...prev, pbgRef: e.target.value }))}
                  placeholder="Reference / guarantee number (optional)"
                  className="asa-flow-select"
                  disabled={step4Submitting || (hasStep4Submission && step4ReviewStatus === "approved")}
                />
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleStep4FileChange(e, "pbg")}
                  className="asa-flow-select"
                  disabled={step4Submitting || (hasStep4Submission && step4ReviewStatus === "approved")}
                />
                <small className="asa-step4-file-note">
                  {step4Files.pbgFileName ? `Selected: ${step4Files.pbgFileName}` : "PDF only, max 15 MB"}
                </small>
                {step4Details?.pbgFileUrl ? (
                  <a href={step4Details.pbgFileUrl} target="_blank" rel="noreferrer" className="asa-step4-secondary-link">
                    Download current Bank Guarantee
                  </a>
                ) : null}
              </section>
            </div>

            <div className="asa-step4-remarks">
              <label className="asa-step4-remarks-label" htmlFor="step4-remarks">Remarks for admin</label>
              <textarea
                id="step4-remarks"
                value={step4Form.remarks}
                onChange={(e) => setStep4Form((prev) => ({ ...prev, remarks: e.target.value }))}
                placeholder="Add any context, references, or submission notes (optional)"
                className="asa-step4-remarks-input"
                disabled={step4Submitting || (hasStep4Submission && step4ReviewStatus === "approved")}
              />
            </div>

            {step4Error ? <p className="error-banner" style={{ marginTop: 10 }}>{step4Error}</p> : null}
            {step4Success ? <p className="helper-text" style={{ marginTop: 10 }}>{step4Success}</p> : null}

            <div className="asa-step4-actions">
              <button
                type="button"
                className="asa-inline-new-btn"
                onClick={handleSubmitStep4}
                disabled={step4Submitting || (hasStep4Submission && step4ReviewStatus === "approved")}
              >
                {step4Submitting ? "Submitting Step 4..." : hasStep4Submission ? "Resubmit Step 4" : "Submit Step 4"}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roleNormalized !== "applicant") {
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
                <p>ASA ONBOARDING</p>
              </div>
            </div>

            <nav className="asa-dash-nav">
              <button type="button" className={`asa-dash-nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
                <LayoutDashboard size={19} />Dashboard
              </button>
              <button type="button" className={`asa-dash-nav-item ${activeTab === "applications" ? "active" : ""}`} onClick={() => setActiveTab("applications")}>
                <FileText size={19} />{appListTitle}
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
                    <p>{isApplicant ? "ASA onboarding overview" : "Review and manage ASA onboarding progress"}</p>
                  </div>
                  <button
                    type="button"
                    className="asa-inline-new-btn"
                    onClick={() => {
                      if (!isApplicant) {
                        setActiveTab("applications");
                        return;
                      }
                      if (hasExistingApplication) {
                        setActiveTab("applications");
                        return;
                      }
                      navigate("/form");
                    }}
                    disabled={isApplicant && hasExistingApplication}
                    title={isApplicant && hasExistingApplication ? "One user can apply for only one application" : undefined}
                  >
                    <Plus size={16} />
                    {isApplicant ? (hasExistingApplication ? "Application Submitted" : "New Application") : "Review Applications"}
                  </button>
                </div>

                <section className="asa-dash-metrics">
                  <button
                    type="button"
                    className="asa-metric-card asa-metric-card-click"
                    onClick={() => setActiveTab("applications")}
                    aria-label="Open applications"
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

                <section className="asa-dash-panels asa-dashboard-grid">
                  <article className="asa-dash-panel asa-dashboard-updates">
                    <div className="asa-panel-head">
                      <div>
                        <h3>Application Updates</h3>
                        <p className="asa-dashboard-panel-copy">Track the latest status, approvals, reviews, and rejections for your application.</p>
                      </div>
                    </div>
                    <div className="asa-update-list">
                      {dashboardUpdates.map((item) => (
                        <article key={`${item.title}-${item.status}`} className={`asa-update-card ${item.tone}`}>
                          <div className="asa-update-top">
                            <strong>{item.title}</strong>
                            <span className={`asa-update-pill ${item.tone}`}>{item.status}</span>
                          </div>
                          <p>{item.message}</p>
                        </article>
                      ))}
                    </div>
                  </article>

                  <article className="asa-dash-panel asa-dashboard-process">
                    <div className="asa-panel-head">
                      <div>
                        <h3>11-Step Onboarding Process</h3>
                        <p className="asa-dashboard-panel-copy">Reference the full onboarding journey and its expected timelines.</p>
                      </div>
                    </div>
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
                    <h2>{appListTitle}</h2>
                    <p>{appListSubtitle}</p>
                  </div>
                  <button
                    type="button"
                    className="asa-inline-new-btn"
                    onClick={() => {
                      if (!isApplicant) {
                        setActiveTab("applications");
                        return;
                      }
                      if (hasExistingApplication) {
                        setActiveTab("applications");
                        return;
                      }
                      navigate("/form");
                    }}
                    disabled={isApplicant && hasExistingApplication}
                    title={isApplicant && hasExistingApplication ? "One user can apply for only one application" : undefined}
                  >
                    <Plus size={16} />
                    {isApplicant ? (hasExistingApplication ? "Application Submitted" : "New Application") : "Review Applications"}
                  </button>
                </div>

                <div className="asa-app-list-wrap">
                  {scoped.length === 0 ? (
                    <p className="helper-text">{isApplicant ? "No applications found." : "No applications are available right now."}</p>
                  ) : (
                    scoped.map((item) => (
                      <article key={item.id} className="asa-app-list-row" style={{ alignItems: "center" }}>
                        <div className="asa-app-left">
                          <div className="asa-app-doc"><FileText size={22} /></div>
                          <div>
                            <h4>{item.organizationName || "Organization"}</h4>
                            <p>{item.applicationId || "-"} - {item.applicantName || "Applicant"}</p>
                          </div>
                        </div>

                        <div className="asa-app-right">
                          <span className="asa-status-pill">{toStatusLabel(item)}</span>
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

                {isApplicant && selectedApplication ? (
                  <div className="asa-applications-workspace">
                    <article className="asa-dash-panel">
                      <div className="asa-panel-head">
                        <div>
                          <h3>Started Steps</h3>
                          <p className="asa-started-steps-copy">Only the steps already started for this application appear here.</p>
                        </div>
                      </div>

                      <div className="asa-started-steps-grid">
                        {startedSteps.map((step) => (
                          <article
                            key={step.id}
                            className={`asa-started-step-card ${step.id === Number(selectedApplication.currentStep || 0) ? "current" : ""}`}
                          >
                            <button
                              type="button"
                              className="asa-started-step-trigger"
                              onClick={() => openStartedStep(step.id)}
                            >
                              <div className="asa-started-step-top">
                                <div>
                                  <span className="asa-started-step-kicker">STEP {step.id}</span>
                                  <h4>{step.title}</h4>
                                </div>
                                <span className={`asa-started-step-pill ${getStepStatusTone(step.id)}`}>{getStepStatus(step.id)}</span>
                              </div>
                              <p>{step.description}</p>
                              <small>
                                {step.id === 2
                                  ? "Open success dashboard"
                                  : step.id === 4
                                    ? "Open ASA Agreement + PBG Submission"
                                    : "Open this onboarding step"}
                              </small>
                            </button>
                          </article>
                        ))}
                      </div>
                    </article>
                  </div>
                ) : null}
              </section>
            ) : null}

            {!loading && activeTab === "flow" ? (
              <section>
                <div className="asa-page-head asa-flow-head">
                  <div>
                    <h2>Onboarding Flow</h2>
                    <p>{isApplicant ? "Track your ASA onboarding through all 11 steps" : "Track and review onboarding progress across all 11 steps"}</p>
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
                    const rawCurrentStep = Number(selectedApplication?.currentStep || 1);
                    const overallStatus = String(selectedApplication?.overallStatus || "").toLowerCase();
                    const applicationIdGenerated = overallStatus.includes("application id generated");
                    const flowCurrentStep = applicationIdGenerated && rawCurrentStep <= 2 ? 3 : rawCurrentStep;
                    const isCurrent = step.id === flowCurrentStep;
                    const isDone = step.id < flowCurrentStep;
                    const isStep2Generated = step.id === 2 && applicationIdGenerated;
                    const isCompletedStep = isDone || isStep2Generated;
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
                                  <span className={`asa-pill-muted asa-pill-progress ${getStepStatusTone(step.id)}`}>{getStepStatus(step.id)}</span>
                                  {isCurrent ? <span className="asa-pill-current">Current</span> : null}
                                </div>
                              </div>
                              <p>{step.description}</p>
                            </div>
                            <button
                              type="button"
                              className="asa-flow-expand"
                              onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                              aria-label="Toggle step details"
                            >
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
                              {step.id === 3 && Number(selectedApplication?.currentStep || 0) >= 4 ? (
                                <a
                                  href={getInPrincipleApprovalLetterPdfUrl(selectedApplication.id)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="asa-inline-new-btn"
                                  style={{ width: "fit-content" }}
                                >
                                  <FileText size={14} />
                                  Download In-Principle Approval Letter
                                </a>
                              ) : null}

                              <div className="asa-flow-dates">
                                <div>
                                  <span>STARTED</span>
                                  <p>{isCompletedStep || isCurrent ? "Started" : "Not started"}</p>
                                </div>
                                <div>
                                  <span>COMPLETED</span>
                                  <p>{isCompletedStep ? "Completed" : "Pending"}</p>
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

      {showStep4Modal && selectedApplication && Number(selectedApplication.currentStep || 0) >= 4 ? (
        <div className="asa-modal-backdrop" onClick={() => setShowStep4Modal(false)}>
          <div className="asa-modal asa-step4-modal" onClick={(e) => e.stopPropagation()}>
            <div className="asa-modal-head">
              <div className="asa-modal-title">
                <div className="asa-app-doc"><FileText size={20} /></div>
                <h3>Step 4: ASA Agreement + PBG Submission</h3>
              </div>
              <button type="button" className="asa-icon-action" onClick={() => setShowStep4Modal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="asa-step4-modal-body">
              {renderStep4Section()}
            </div>
          </div>
        </div>
      ) : null}
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























































































