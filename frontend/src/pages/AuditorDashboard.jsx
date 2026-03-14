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
  Save,
  Send,
  Shield,
  User,
  X,
} from "lucide-react";
import {
  fetchApplications,
  fetchAdminStep2Applications,
  fetchStep4Details,
  fetchStep5Details,
  fetchStep6Details,
  saveStep5Progress,
  submitStep5Audit,
  submitStep6Details,
} from "../services/portalApi";
import uidaiLogo from "../assets/uidai-logo.jpg";
import { getDashboardPathByRole, normalizeRole } from "../utils/roleRoutes";

const COMPLIANCE_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "compliant", label: "Compliant" },
  { value: "non_compliant", label: "Non-Compliant" },
  { value: "not_applicable", label: "Not Applicable" },
];

const FORM_PAYLOAD_SECTIONS = [
  {
    title: "Applicant Details",
    fields: [["typeOfApplicant", "Type of Applicant"], ["applicantName", "Applicant Name"], ["registrationNumber", "Registration / Incorporation No."], ["licenseNumber", "License Number"], ["registeredOfficeAddress", "Registered Office Address"], ["correspondenceAddress", "Correspondence Address"], ["gstnNumber", "GSTN Number"], ["tanNumber", "TAN Number"], ["applicantCategory", "Applicant Category"]],
  },
  {
    title: "Contact And Governance Details",
    groups: [
      { title: "Key Managerial Personnel (KMP)", fields: [["kmpName", "KMP Name"], ["kmpDesignation", "Full Designation"], ["officialEmail", "Official Email Address"], ["mobileNumber", "Mobile Number"]] },
      { title: "Chief Information Security Officer (CISO)", fields: [["cisoName", "CISO Name"], ["cisoDesignation", "Full Designation"], ["cisoEmail", "Official Email Address"], ["cisoMobile", "Mobile Number"]] },
      { title: "Management And Technical Contacts", fields: [["mpocName", "MPOC Name"], ["mpocDesignation", "MPOC Designation"], ["mpocEmail", "MPOC Email"], ["mpocMobile", "MPOC Mobile"], ["tpocName", "TPOC Name"], ["tpocDesignation", "TPOC Designation"], ["tpocEmail", "TPOC Email"], ["tpocMobile", "TPOC Mobile"]] },
      { title: "Grievance Redressal Details", fields: [["websiteUrl", "Website URL"], ["grievanceEmail", "Email Address"], ["helpdeskNumber", "Helpdesk Number"], ["grievanceOfficerName", "Grievance Officer Name"], ["grievanceOfficerMobile", "Officer Mobile"], ["grievanceOfficerEmail", "Officer Email ID"]] },
    ],
  },
  {
    title: "ASA Infrastructure And Connectivity",
    groups: [
      { title: "Proposed ASA Server Location(s)", fields: [["primaryDistrict", "District (Primary DC)"], ["primaryState", "State"], ["primaryCountry", "Country"]] },
      { title: "Primary And DR Data Centres", fields: [["primaryDcContactName", "Primary MPOC/TPOC Name"], ["primaryDcEmail", "Primary Email Address"], ["primaryDcPhone", "Primary Telephone / Mobile No."], ["primaryDcAddress", "Primary Address"], ["drDistrict", "DR District"], ["drContactName", "DR MPOC/TPOC Name"], ["drEmail", "DR Email Address"], ["drPhone", "DR Telephone / Mobile No."], ["drAddress", "DR Address"]] },
      { title: "Leased Lines And Routing", fields: [["leasedLineCount", "Leased Lines at UIDAI DC"], ["connectivityType", "Connectivity Type"], ["serviceProvider", "Service Provider"], ["leasedLineCapacity", "Leased Line Capacity (Mbps)"], ["whitelistedIps", "Whitelisted IP Address(es)"], ["expectedAuthVolume", "Expected Authentication Volume"], ["routerMakeModel", "Router Make & Model"], ["redundantRouterLocation", "Redundant Router Location"]] },
      { title: "AUA/KUA Information", fields: [["geographiesCatered", "Geographies Catered"], ["auaKuaSupportType", "AUA/KUA Support Type"]] },
    ],
  },
  {
    title: "Authentication And Authorization",
    groups: [
      { title: "Authentication Requirements", fields: [["declarationAuthorized", "Applicant is authorized to submit this application"], ["declarationAccurate", "All information provided is accurate and true"], ["declarationCompliant", "Organization complies with data protection regulations"], ["declarationSecurity", "Organization has adequate security infrastructure"], ["declarationTerms", "Organization understands the terms and conditions"]] },
      { title: "Authorized Officer Details", fields: [["officerName", "Officer Name"], ["officerDesignation", "Officer Designation"], ["officerEmail", "Officer Email"], ["officerPhone", "Officer Phone"]] },
    ],
  },
  {
    title: "Declaration",
    groups: [
      { title: "Declaration Checklist", fields: [["declarationTruthful", "Information furnished is true and correct"], ["declarationCapacity", "Applicant will fulfil operational and audit obligations"], ["declarationLawCompliance", "Applicant will abide by Aadhaar Act and UIDAI directions"], ["declarationFalseInfo", "False information may lead to rejection or legal action"], ["declarationTermsPrivacy", "UIDAI may rely on the digitally authenticated signature"], ["declarationDataSecurity", "Applicant will maintain infrastructure and security safeguards"]] },
      { title: "Signatory Details", fields: [["declarantName", "Declarant Name"], ["declarantDesignation", "Full Designation"], ["declarantEmail", "Declarant Email"], ["declarantPhone", "Declarant Phone"], ["declarationDate", "Declaration Date"], ["declarationPlace", "Declaration Place"], ["signatureTypedName", "Typed Signature Name"], ["authorizedSignatoryName", "Authorized Signatory Name"], ["signatureDescription", "Signature Description"], ["signatureAuthenticated", "Signature Authenticated"], ["signatureAuthenticatedAt", "Authenticated At"], ["signatureAuthMode", "Authentication Mode"], ["signatureDataUrl", "Signature"]] },
    ],
  },
];

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN");
}

function groupChecklist(items = []) {
  const grouped = new Map();
  for (const item of items) {
    const key = `${item.sectionCode}-${item.sectionTitle}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        sectionCode: item.sectionCode,
        sectionTitle: item.sectionTitle,
        items: [],
      });
    }
    grouped.get(key).items.push(item);
  }
  return Array.from(grouped.values());
}

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function AuditorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [submittedForm, setSubmittedForm] = useState(null);
  const [step4Details, setStep4Details] = useState(null);
  const [step5Details, setStep5Details] = useState(null);
  const [step5Loading, setStep5Loading] = useState(false);
  const [step5Saving, setStep5Saving] = useState(false);
  const [step5Error, setStep5Error] = useState("");
  const [step5Success, setStep5Success] = useState("");
  const [step6Details, setStep6Details] = useState(null);
  const [step6Submitting, setStep6Submitting] = useState(false);
  const [step6Error, setStep6Error] = useState("");
  const [step6Success, setStep6Success] = useState("");
  const [step6Files, setStep6Files] = useState({
    auditReportFileData: "",
    auditReportFileName: "",
    artefactsFileData: "",
    artefactsFileName: "",
  });

  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  async function loadApplications() {
    setLoading(true);
    setError("");
    try {
      const rows = await fetchApplications(user);
      setApplications(rows || []);
    } catch {
      setError("Unable to load auditor dashboard data right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  const role = normalizeRole(user?.role);
  const auditQueue = useMemo(
    () => applications.filter((app) => Number(app.currentStep || 0) >= 5 && Number(app.currentStep || 0) <= 6),
    [applications]
  );

  const stats = useMemo(() => {
    const total = auditQueue.length;
    const active = auditQueue.filter((app) => Number(app.currentStep || 0) === 5).length;
    const movedToStep6 = auditQueue.filter((app) => Number(app.currentStep || 0) >= 6).length;
    return { total, active, movedToStep6 };
  }, [auditQueue]);

  const step5Sections = useMemo(() => groupChecklist(step5Details?.items || []), [step5Details]);
  const isAssignedElsewhere =
    step5Details?.assignedAuditorUserId && Number(step5Details.assignedAuditorUserId) !== Number(user?.id);
  const isSubmitted = step5Details?.auditStatus === "submitted";
  const isReadOnly = Boolean(isAssignedElsewhere || isSubmitted);
  const step6ReviewStatus = step6Details?.reviewStatus || "pending";
  const isStep6ReadOnly = Boolean(isAssignedElsewhere || ["under_review", "approved"].includes(step6ReviewStatus));
  const canShowStep6 = Boolean(selectedApplication && Number(selectedApplication.currentStep || 0) >= 6);

  const renderPayloadValue = (key, value) => {
    const textValue = String(value ?? "-");

    if (key === "signatureDataUrl" && textValue.startsWith("data:image/")) {
      return (
        <div style={{ display: "grid", gap: 8 }}>
          <strong>Signature captured</strong>
          <img
            src={textValue}
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

    return <strong style={{ wordBreak: "break-word" }}>{textValue}</strong>;
  };

  const renderPayloadFields = (payload, fields = []) => {
    const available = fields.filter(([key]) => payload && Object.prototype.hasOwnProperty.call(payload, key));
    if (available.length === 0) return null;

    return (
      <div className="asa-profile-grid">
        {available.map(([key, label]) => (
          <div key={key}>
            <span>{label}</span>
            {renderPayloadValue(key, payload[key])}
          </div>
        ))}
      </div>
    );
  };

  const renderPayloadSections = (payload) => {
    if (!payload || Object.keys(payload).length === 0) {
      return <p className="helper-text">No detailed form payload found for this application.</p>;
    }

    return (
      <div style={{ display: "grid", gap: 14 }}>
        {FORM_PAYLOAD_SECTIONS.map((section) => {
          const hasDirectFields = section.fields?.some(([key]) => Object.prototype.hasOwnProperty.call(payload, key));
          const hasGroups = section.groups?.some((group) => group.fields.some(([key]) => Object.prototype.hasOwnProperty.call(payload, key)));
          if (!hasDirectFields && !hasGroups) return null;

          return (
            <section key={section.title} className="asa-dash-panel" style={{ marginTop: 0 }}>
              <div className="asa-panel-head">
                <h3>{section.title}</h3>
              </div>
              {hasDirectFields ? renderPayloadFields(payload, section.fields) : null}
              {hasGroups ? section.groups.map((group) => {
                const groupContent = renderPayloadFields(payload, group.fields);
                if (!groupContent) return null;
                return (
                  <div key={group.title} style={{ marginTop: 12 }}>
                    <h4 style={{ margin: "0 0 10px", color: "#f5f5f5", fontSize: 16 }}>{group.title}</h4>
                    {groupContent}
                  </div>
                );
              }) : null}
            </section>
          );
        })}
      </div>
    );
  };

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  async function openStep5Workspace(application) {
    setSelectedApplication(application);
    setShowViewDetails(false);
    setSubmittedForm(null);
    setStep4Details(null);
    setStep5Details(null);
    setStep6Details(null);
    setStep5Loading(true);
    setStep5Error("");
    setStep5Success("");
    setStep6Error("");
    setStep6Success("");
    try {
      const [details, adminApps, step4, step6] = await Promise.all([
        fetchStep5Details(application.id),
        fetchAdminStep2Applications(),
        fetchStep4Details(application.id).catch(() => null),
        Number(application.currentStep || 0) >= 6 ? fetchStep6Details(application.id).catch(() => null) : Promise.resolve(null),
      ]);
      setStep5Details(details || null);
      setStep4Details(step4 || null);
      setStep6Details(step6 || null);
      setStep6Files({
        auditReportFileData: "",
        auditReportFileName: step6?.auditReportFileName || "",
        artefactsFileData: "",
        artefactsFileName: step6?.artefactsFileName || "",
      });
      const matched = (adminApps || []).find((item) => Number(item.id) === Number(application.id));
      setSubmittedForm(matched?.submittedForm || null);
    } catch {
      setStep5Error("Unable to load audit workspace right now.");
      setStep5Details(null);
      setSubmittedForm(null);
      setStep4Details(null);
      setStep6Details(null);
    } finally {
      setStep5Loading(false);
    }
  }

  function closeStep5Workspace() {
    setSelectedApplication(null);
    setShowViewDetails(false);
    setSubmittedForm(null);
    setStep4Details(null);
    setStep5Details(null);
    setStep6Details(null);
    setStep5Loading(false);
    setStep5Saving(false);
    setStep5Error("");
    setStep5Success("");
    setStep6Submitting(false);
    setStep6Error("");
    setStep6Success("");
    setStep6Files({
      auditReportFileData: "",
      auditReportFileName: "",
      artefactsFileData: "",
      artefactsFileName: "",
    });
  }

  function updateChecklistItem(controlNo, field, value) {
    setStep5Details((current) => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.map((item) =>
          item.controlNo === controlNo ? { ...item, [field]: value } : item
        ),
      };
    });
  }

  async function handleSaveStep5() {
    if (!selectedApplication || !step5Details) return;
    setStep5Saving(true);
    setStep5Error("");
    setStep5Success("");
    try {
      const response = await saveStep5Progress(selectedApplication.id, {
        updatedByUserId: user?.id,
        auditorSummary: step5Details.auditorSummary || null,
        applicantSummary: step5Details.applicantSummary || null,
        items: step5Details.items,
      });
      setStep5Details(response.step5 || null);
      setStep5Success(response.message || "Step 5 progress saved.");
      await loadApplications();
    } catch (err) {
      setStep5Error(err?.response?.data?.message || "Failed to save Step 5 progress.");
    } finally {
      setStep5Saving(false);
    }
  }

  async function handleSubmitStep5() {
    if (!selectedApplication || !step5Details) return;
    setStep5Saving(true);
    setStep5Error("");
    setStep5Success("");
    try {
      const response = await submitStep5Audit(selectedApplication.id, {
        submittedByUserId: user?.id,
        auditorSummary: step5Details.auditorSummary || null,
        applicantSummary: step5Details.applicantSummary || null,
      });
      setStep5Details(response.step5 || null);
      setStep5Success(response.message || "Step 5 submitted successfully.");
      await loadApplications();
      setSelectedApplication((prev) => (prev ? { ...prev, currentStep: 6 } : prev));
      const refreshedStep6 = await fetchStep6Details(selectedApplication.id).catch(() => null);
      setStep6Details(refreshedStep6 || null);
      setStep6Files((prev) => ({
        ...prev,
        auditReportFileName: refreshedStep6?.auditReportFileName || "",
        artefactsFileName: refreshedStep6?.artefactsFileName || "",
      }));
    } catch (err) {
      setStep5Error(err?.response?.data?.message || "Failed to submit Step 5.");
    } finally {
      setStep5Saving(false);
    }
  }

  async function handleStep6FileChange(event, kind) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setStep6Error("Only PDF files are allowed for Step 6.");
      return;
    }

    try {
      setStep6Error("");
      const dataUrl = await readFileAsDataUrl(file);
      if (kind === "report") {
        setStep6Files((prev) => ({ ...prev, auditReportFileData: dataUrl, auditReportFileName: file.name }));
      } else {
        setStep6Files((prev) => ({ ...prev, artefactsFileData: dataUrl, artefactsFileName: file.name }));
      }
    } catch {
      setStep6Error("Unable to read selected PDF file.");
    }
  }

  async function handleSubmitStep6() {
    if (!selectedApplication || !step6Details) return;

    const hasAuditReport = Boolean(step6Files.auditReportFileData || step6Details.auditReportFileUrl);
    const hasArtefacts = Boolean(step6Files.artefactsFileData || step6Details.artefactsFileUrl);

    if (!hasAuditReport || !hasArtefacts) {
      setStep6Error("Upload both the audit report PDF and artefacts PDF.");
      return;
    }

    try {
      setStep6Submitting(true);
      setStep6Error("");
      setStep6Success("");

      const response = await submitStep6Details(selectedApplication.id, {
        submittedByAuditorUserId: user?.id,
        auditReportRef: step6Details.auditReportRef?.trim() || null,
        artefactsRef: step6Details.artefactsRef?.trim() || null,
        submissionRemarks: step6Details.submissionRemarks?.trim() || null,
        auditReportFileData: step6Files.auditReportFileData || null,
        auditReportFileName: step6Files.auditReportFileName || null,
        artefactsFileData: step6Files.artefactsFileData || null,
        artefactsFileName: step6Files.artefactsFileName || null,
      });

      const refreshed = response?.step6 || null;
      setStep6Details(refreshed);
      setStep6Files({
        auditReportFileData: "",
        auditReportFileName: refreshed?.auditReportFileName || step6Files.auditReportFileName,
        artefactsFileData: "",
        artefactsFileName: refreshed?.artefactsFileName || step6Files.artefactsFileName,
      });
      setStep6Success(response?.message || "Step 6 submitted successfully.");
      await loadApplications();
    } catch (err) {
      setStep6Error(err?.response?.data?.message || "Failed to submit Step 6.");
    } finally {
      setStep6Submitting(false);
    }
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role !== "auditor") return <Navigate to={getDashboardPathByRole(user?.role)} replace />;

  return (
    <>
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
                    <p>Complete Step 5 audits and submit Step 6 reports for admin review.</p>
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
                    <strong>{stats.active}</strong>
                    <p>Step 5 In Progress</p>
                  </article>
                  <article className="asa-metric-card">
                    <div className="asa-metric-icon"><Activity size={20} /></div>
                    <strong>{stats.movedToStep6}</strong>
                    <p>Step 6 Pending</p>
                  </article>
                </section>
              </>
            ) : null}

            {!loading && activeTab === "queue" ? (
              <section className="asa-applications-page">
                <div className="asa-page-head">
                  <div>
                    <h2>Step 5 And Step 6 Queue</h2>
                    <p>Open an application, complete the checklist, then submit the final audit report and artefacts.</p>
                  </div>
                </div>

                <div className="asa-app-list-wrap">
                  {auditQueue.length === 0 ? (
                    <p className="helper-text">No applications are currently available in Step 5 or Step 6.</p>
                  ) : (
                    auditQueue.map((item) => (
                      <article key={item.id} className="asa-app-list-row">
                        <div className="asa-app-left">
                          <div className="asa-app-doc"><FileText size={22} /></div>
                          <div>
                            <h4>{item.organizationName || "Organization"}</h4>
                            <p>{item.applicationId || "-"} Ã¢â‚¬Â¢ {item.applicantName || "Applicant"}</p>
                          </div>
                        </div>

                        <div className="asa-app-right">
                          <span className="asa-status-pill">Step {item.currentStep || "-"}</span>
                          <small>{item.email || "-"}</small>
                        </div>

                        <button
                          type="button"
                          className="asa-inline-new-btn"
                          onClick={() => openStep5Workspace(item)}
                        >
                          <Eye size={15} />
                          {Number(item.currentStep || 0) >= 6 ? "Open Step 6" : "Open Step 5"}
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
                    <strong>{user.role || "Auditor"}</strong>
                  </div>
                </div>
              </section>
            ) : null}
          </main>
        </section>
      </div>

      {selectedApplication ? (
        <div className="asa-modal-backdrop" onClick={closeStep5Workspace}>
          <div className="asa-modal asa-admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="asa-modal-head">
              <div className="asa-modal-title">
                <div className="asa-app-doc"><FileText size={20} /></div>
                <h3>{canShowStep6 ? "Step 6: Audit Report Submission & Approval" : "Step 5: Pre-onboarding Audit"}</h3>
              </div>
              <button type="button" className="asa-icon-action" onClick={closeStep5Workspace}>
                <X size={18} />
              </button>
            </div>


            {step5Loading ? <p className="helper-text" style={{ marginTop: 12 }}>Loading Step 5 checklist...</p> : null}
            {step5Error ? <p className="error-banner" style={{ marginTop: 12 }}>{step5Error}</p> : null}

            {!step5Loading && step5Details ? (
              <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <p className="helper-text" style={{ marginTop: 0 }}>
                    Review the Step 5 checklist with the original application payload and Step 4 submission side by side when needed.
                  </p>
                  <button
                    type="button"
                    className="asa-inline-new-btn"
                    onClick={() => setShowViewDetails((prev) => !prev)}
                  >
                    <Eye size={15} />
                    {showViewDetails ? "Hide Details" : "View Details"}
                  </button>
                </div>

                {showViewDetails ? (
                  <section className="asa-dash-panel" style={{ marginTop: 0 }}>
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
                      {renderPayloadSections(submittedForm)}
                    </div>

                    <div className="asa-dash-panel" style={{ marginTop: 12 }}>
                      <div className="asa-panel-head">
                        <h3>Step 4 Submission Details</h3>
                      </div>
                      <div className="asa-profile-grid">
                        <div>
                          <span>ASA Agreement Ref</span>
                          <strong>{step4Details?.asaAgreementRef || "-"}</strong>
                        </div>
                        <div>
                          <span>Signed ASA Agreement</span>
                          <strong>
                            {step4Details?.asaAgreementFileUrl ? (
                              <a href={step4Details.asaAgreementFileUrl} target="_blank" rel="noreferrer">Download PDF</a>
                            ) : "-"}
                          </strong>
                        </div>
                        <div>
                          <span>PBG Ref</span>
                          <strong>{step4Details?.pbgRef || "-"}</strong>
                        </div>
                        <div>
                          <span>Performance Bank Guarantee</span>
                          <strong>
                            {step4Details?.pbgFileUrl ? (
                              <a href={step4Details.pbgFileUrl} target="_blank" rel="noreferrer">Download PDF</a>
                            ) : "-"}
                          </strong>
                        </div>
                        <div>
                          <span>Applicant Remarks</span>
                          <strong>{step4Details?.remarks || "-"}</strong>
                        </div>
                        <div>
                          <span>Submitted At</span>
                          <strong>{step4Details?.submittedAt ? formatDateTime(step4Details.submittedAt) : "-"}</strong>
                        </div>
                        <div>
                          <span>Review Status</span>
                          <strong>{step4Details?.reviewStatus || "pending"}</strong>
                        </div>
                        <div>
                          <span>Admin Review Remarks</span>
                          <strong>{step4Details?.reviewRemarks || "-"}</strong>
                        </div>
                      </div>
                    </div>
                  </section>
                ) : null}

                <section className="asa-dash-panel" style={{ marginTop: 0 }}>
                  <div className="asa-panel-head">
                    <h3>Audit Overview</h3>
                  </div>
                  <div className="asa-profile-grid">
                    <div>
                      <span>Status</span>
                      <strong>{step5Details.auditStatus?.replace(/_/g, " ") || "pending"}</strong>
                    </div>
                    <div>
                      <span>Assigned Auditor</span>
                      <strong>{step5Details.assignedAuditorName || "Not assigned"}</strong>
                    </div>
                    <div>
                      <span>Started At</span>
                      <strong>{formatDateTime(step5Details.startedAt)}</strong>
                    </div>
                    <div>
                      <span>Submitted At</span>
                      <strong>{formatDateTime(step5Details.submittedAt)}</strong>
                    </div>
                    <div>
                      <span>Compliant</span>
                      <strong>{step5Details.summary?.compliant ?? 0}</strong>
                    </div>
                    <div>
                      <span>Non-Compliant</span>
                      <strong>{step5Details.summary?.non_compliant ?? 0}</strong>
                    </div>
                    <div>
                      <span>Not Applicable</span>
                      <strong>{step5Details.summary?.not_applicable ?? 0}</strong>
                    </div>
                    <div>
                      <span>Pending</span>
                      <strong>{step5Details.summary?.pending ?? 0}</strong>
                    </div>
                  </div>
                  {isAssignedElsewhere ? (
                    <p className="helper-text" style={{ marginTop: 12 }}>This checklist is assigned to another auditor, so it is currently read-only for you.</p>
                  ) : null}
                </section>

                <section className="asa-dash-panel" style={{ marginTop: 0 }}>
                  <div className="asa-panel-head">
                    <h3>Audit Notes</h3>
                  </div>
                  <div style={{ display: "grid", gap: 12 }}>
                    <label style={{ display: "grid", gap: 8 }}>
                      <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Auditor Summary</span>
                      <textarea
                        value={step5Details.auditorSummary || ""}
                        onChange={(event) => setStep5Details((current) => ({ ...current, auditorSummary: event.target.value }))}
                        disabled={isReadOnly || step5Saving}
                        placeholder="Summarize the current audit status, key findings, and overall readiness."
                        style={{ width: "100%", minHeight: 96, borderRadius: 12, padding: 12, border: "1px solid rgba(255,230,0,0.25)", background: "#121218", color: "#fff" }}
                      />
                    </label>
                    <label style={{ display: "grid", gap: 8 }}>
                      <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>ASA Management Summary</span>
                      <textarea
                        value={step5Details.applicantSummary || ""}
                        onChange={(event) => setStep5Details((current) => ({ ...current, applicantSummary: event.target.value }))}
                        disabled={isReadOnly || step5Saving}
                        placeholder="Record the management response, commitments, or supporting notes from the ASA entity."
                        style={{ width: "100%", minHeight: 96, borderRadius: 12, padding: 12, border: "1px solid rgba(255,230,0,0.25)", background: "#121218", color: "#fff" }}
                      />
                    </label>
                  </div>
                </section>

                <section className="asa-dash-panel" style={{ marginTop: 0 }}>
                  <div className="asa-panel-head">
                    <h3>Checklist Sections</h3>
                  </div>
                  <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                    {step5Sections.map((section) => (
                      <div
                        key={`summary-${section.sectionCode}`}
                        style={{
                          border: "1px solid rgba(255,230,0,0.18)",
                          borderRadius: 14,
                          padding: 14,
                          background: "linear-gradient(135deg, rgba(255,230,0,0.10), rgba(255,255,255,0.03))",
                          display: "grid",
                          gap: 4,
                        }}
                      >
                        <span style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffe600" }}>
                          Section {section.sectionCode}
                        </span>
                        <strong style={{ fontSize: 17, lineHeight: 1.35, color: "rgba(12, 16, 28, 0.82)" }}>{section.sectionTitle}</strong>
                        <small style={{ color: "#cfcfcf" }}>{section.items.length} controls</small>
                      </div>
                    ))}
                  </div>
                </section>
                {step5Sections.map((section) => (
                  <section key={`${section.sectionCode}-${section.sectionTitle}`} className="asa-dash-panel" style={{ marginTop: 0 }}>
                    <div className="asa-panel-head">
                      <h3>{section.sectionCode}. {section.sectionTitle}</h3>
                    </div>
                    <div style={{ display: "grid", gap: 12 }}>
                      {section.items.map((item) => (
                        <article key={item.controlNo} style={{ border: "1px solid rgba(255,230,0,0.16)", borderRadius: 16, padding: 16, background: "rgba(255,255,255,0.02)", display: "grid", gap: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                            <div style={{ display: "grid", gap: 6, flex: 1, minWidth: 280 }}>
                              <strong style={{ fontSize: 20, color: "#f8f8f8", lineHeight: 1.35 }}>{item.controlNo}. {item.shortTitle}</strong>
                              <p style={{ margin: 0, color: "#cfcfcf", lineHeight: 1.55 }}>{item.controlDescription}</p>
                            </div>
                            <label style={{ display: "grid", gap: 8, minWidth: 220 }}>
                              <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Compliance Status</span>
                              <select
                                className="asa-flow-select"
                                value={item.complianceStatus || "pending"}
                                disabled={isReadOnly || step5Saving}
                                onChange={(event) => updateChecklistItem(item.controlNo, "complianceStatus", event.target.value)}
                              >
                                {COMPLIANCE_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </label>
                          </div>

                          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                            <label style={{ display: "grid", gap: 8 }}>
                              <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Auditor Observation</span>
                              <textarea
                                value={item.auditorObservation || ""}
                                disabled={isReadOnly || step5Saving}
                                onChange={(event) => updateChecklistItem(item.controlNo, "auditorObservation", event.target.value)}
                                placeholder="Capture evidence reviewed, checks performed, and findings for this control."
                                style={{ width: "100%", minHeight: 110, borderRadius: 12, padding: 12, border: "1px solid rgba(255,230,0,0.2)", background: "#121218", color: "#fff" }}
                              />
                            </label>
                            <label style={{ display: "grid", gap: 8 }}>
                              <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>ASA Management Comment</span>
                              <textarea
                                value={item.asaManagementComment || ""}
                                disabled={isReadOnly || step5Saving}
                                onChange={(event) => updateChecklistItem(item.controlNo, "asaManagementComment", event.target.value)}
                                placeholder="Record management response, remediation commitment, or clarifications."
                                style={{ width: "100%", minHeight: 110, borderRadius: 12, padding: 12, border: "1px solid rgba(255,230,0,0.2)", background: "#121218", color: "#fff" }}
                              />
                            </label>
                          </div>

                          <label style={{ display: "grid", gap: 8 }}>
                            <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Evidence Reference</span>
                            <input
                              type="text"
                              value={item.evidenceReference || ""}
                              disabled={isReadOnly || step5Saving}
                              onChange={(event) => updateChecklistItem(item.controlNo, "evidenceReference", event.target.value)}
                              placeholder="Link or note the evidence source, folder path, or supporting reference."
                              className="asa-flow-select"
                            />
                          </label>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}

                {step5Success ? <p className="helper-text">{step5Success}</p> : null}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" className="asa-inline-new-btn" onClick={handleSaveStep5} disabled={isReadOnly || step5Saving}>
                    <Save size={15} />
                    {step5Saving ? "Saving..." : "Save Step 5 Progress"}
                  </button>
                  <button type="button" className="asa-inline-new-btn" onClick={handleSubmitStep5} disabled={isReadOnly || step5Saving}>
                    <Send size={15} />
                    {isSubmitted ? "Step 5 Submitted" : step5Saving ? "Submitting..." : "Submit Step 5"}
                  </button>
                </div>

                {canShowStep6 && step6Details ? (
                  <section className="asa-dash-panel" style={{ marginTop: 0 }}>
                    <div className="asa-panel-head">
                      <h3>Step 6 Submission Workspace</h3>
                    </div>
                    <div className="asa-profile-grid">
                      <div>
                        <span>Review Status</span>
                        <strong>{step6ReviewStatus.replace(/_/g, " ")}</strong>
                      </div>
                      <div>
                        <span>Assigned Auditor</span>
                        <strong>{step6Details.assignedAuditorName || step5Details.assignedAuditorName || "Not assigned"}</strong>
                      </div>
                      <div>
                        <span>Submitted At</span>
                        <strong>{formatDateTime(step6Details.submittedAt)}</strong>
                      </div>
                      <div>
                        <span>Reviewed At</span>
                        <strong>{formatDateTime(step6Details.reviewedAt)}</strong>
                      </div>
                    </div>

                    {step6ReviewStatus === "rejected" ? <p className="helper-text" style={{ marginTop: 12 }}>Admin has rejected the previous Step 6 submission. Update the files or remarks below and resubmit.</p> : null}
                    {isStep6ReadOnly ? <p className="helper-text" style={{ marginTop: 12 }}>Step 6 is currently read-only while it is under review or already approved.</p> : null}

                    <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
                      <label style={{ display: "grid", gap: 8 }}>
                        <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Audit Report Reference</span>
                        <input type="text" className="asa-flow-select" value={step6Details.auditReportRef || ""} disabled={isStep6ReadOnly || step6Submitting} onChange={(event) => setStep6Details((current) => ({ ...current, auditReportRef: event.target.value }))} placeholder="Enter the final audit report reference, document number, or version." />
                      </label>

                      <label style={{ display: "grid", gap: 8 }}>
                        <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Audit Report PDF</span>
                        <input type="file" accept="application/pdf" disabled={isStep6ReadOnly || step6Submitting} onChange={(event) => handleStep6FileChange(event, "report")} />
                        <small className="helper-text" style={{ marginTop: 0 }}>{step6Files.auditReportFileName ? `Selected: ${step6Files.auditReportFileName}` : "PDF only, max 15 MB"}</small>
                        {step6Details.auditReportFileUrl ? <a href={step6Details.auditReportFileUrl} target="_blank" rel="noreferrer" className="asa-step4-secondary-link">Download current audit report</a> : null}
                      </label>

                      <label style={{ display: "grid", gap: 8 }}>
                        <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Artefacts Reference</span>
                        <input type="text" className="asa-flow-select" value={step6Details.artefactsRef || ""} disabled={isStep6ReadOnly || step6Submitting} onChange={(event) => setStep6Details((current) => ({ ...current, artefactsRef: event.target.value }))} placeholder="Enter the artefacts pack reference, folder name, or bundle id." />
                      </label>

                      <label style={{ display: "grid", gap: 8 }}>
                        <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Artefacts PDF</span>
                        <input type="file" accept="application/pdf" disabled={isStep6ReadOnly || step6Submitting} onChange={(event) => handleStep6FileChange(event, "artefacts")} />
                        <small className="helper-text" style={{ marginTop: 0 }}>{step6Files.artefactsFileName ? `Selected: ${step6Files.artefactsFileName}` : "PDF only, max 15 MB"}</small>
                        {step6Details.artefactsFileUrl ? <a href={step6Details.artefactsFileUrl} target="_blank" rel="noreferrer" className="asa-step4-secondary-link">Download current artefacts pack</a> : null}
                      </label>

                      <label style={{ display: "grid", gap: 8 }}>
                        <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Submission Remarks</span>
                        <textarea
                          value={step6Details.submissionRemarks || ""}
                          disabled={isStep6ReadOnly || step6Submitting}
                          onChange={(event) => setStep6Details((current) => ({ ...current, submissionRemarks: event.target.value }))}
                          placeholder="Summarize what is included in the final audit report and the attached artefacts."
                          style={{ width: "100%", minHeight: 110, borderRadius: 12, padding: 12, border: "1px solid rgba(255,230,0,0.2)", background: "#121218", color: "#fff" }}
                        />
                      </label>

                      <div className="asa-profile-grid">
                        <div>
                          <span>Admin Review Remarks</span>
                          <strong>{step6Details.reviewRemarks || "-"}</strong>
                        </div>
                        <div>
                          <span>Reviewed By</span>
                          <strong>{step6Details.reviewedByName || "-"}</strong>
                        </div>
                      </div>
                    </div>

                    {step6Error ? <p className="error-banner" style={{ marginTop: 12 }}>{step6Error}</p> : null}
                    {step6Success ? <p className="helper-text" style={{ marginTop: 12 }}>{step6Success}</p> : null}

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                      <button type="button" className="asa-inline-new-btn" onClick={handleSubmitStep6} disabled={isStep6ReadOnly || step6Submitting}>
                        <Send size={15} />
                        {step6Submitting ? "Submitting..." : step6ReviewStatus === "rejected" ? "Resubmit Step 6" : "Submit Step 6"}
                      </button>
                    </div>
                  </section>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

