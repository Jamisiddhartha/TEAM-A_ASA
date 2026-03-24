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
  fetchStep4Details,
  reviewStep4Details,
  fetchStep6Details,
  reviewStep6Details,
  fetchStep7Details,
  issueStep7Details,
  fetchAuditors,
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


const FORM_PAYLOAD_SECTIONS = [
  {
    title: "Applicant Details",
    fields: [["applicantName", "Applicant Name"], ["registrationNumber", "Registration / Incorporation No."], ["licenseNumber", "License Number"], ["registeredOfficeAddress", "Registered Office Address"], ["correspondenceAddress", "Correspondence Address"], ["gstnNumber", "GSTN Number"], ["tanNumber", "TAN Number"], ["applicantCategory", "Applicant Category"]],
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

  const [step4Loading, setStep4Loading] = useState(false);
  const [step4Saving, setStep4Saving] = useState(false);
  const [step4Error, setStep4Error] = useState("");
  const [step4Details, setStep4Details] = useState(null);
  const [step4Decision, setStep4Decision] = useState("approved");
  const [step4ReviewRemarks, setStep4ReviewRemarks] = useState("");
  const [auditors, setAuditors] = useState([]);
  const [step5AssignedAuditorId, setStep5AssignedAuditorId] = useState("");
  const [step6Loading, setStep6Loading] = useState(false);
  const [step6Saving, setStep6Saving] = useState(false);
  const [step6Error, setStep6Error] = useState("");
  const [step6Details, setStep6Details] = useState(null);
  const [step6Decision, setStep6Decision] = useState("approved");
  const [step6ReviewRemarks, setStep6ReviewRemarks] = useState("");
  const [step7Loading, setStep7Loading] = useState(false);
  const [step7Saving, setStep7Saving] = useState(false);
  const [step7Error, setStep7Error] = useState("");
  const [step7Details, setStep7Details] = useState(null);
  const [step7Form, setStep7Form] = useState({
    accessKeyReference: "",
    accessKeyValue: "",
    mappedEntityName: "",
    mappingReference: "",
    preprodEndpoint: "",
    ipWhitelist: "",
    issueNotes: "",
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
    fetchAuditors().then((rows) => setAuditors(rows || [])).catch(() => setAuditors([]));
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

  async function openStep4Workflow(app) {
    setModalMode("step4");
    setShowIssueViewDetails(false);
    setSelectedApplication(app);
    setStep4Loading(true);
    setStep4Error("");
    setStep4Details(null);
    setStep4Decision("approved");
    setStep4ReviewRemarks("");
    setStep5AssignedAuditorId("");

    try {
      const appId = Number(app.id);
      if (!Number.isFinite(appId)) {
        setStep4Error("Invalid application id for Step 4.");
        return;
      }

      const details = await fetchStep4Details(appId);
      setStep4Details(details || null);
      setStep4ReviewRemarks(details?.reviewRemarks || "");
      setStep5AssignedAuditorId(details?.assignedAuditorUserId ? String(details.assignedAuditorUserId) : "");
    } catch {
      setStep4Error("Unable to load Step 4 details right now.");
    } finally {
      setStep4Loading(false);
    }
  }
  async function openStep6Workflow(app) {
    setModalMode("step6");
    setShowIssueViewDetails(false);
    setSelectedApplication(app);
    setStep6Loading(true);
    setStep6Error("");
    setStep6Details(null);
    setStep6Decision("approved");
    setStep6ReviewRemarks("");

    try {
      const details = await fetchStep6Details(app.id);
      setStep6Details(details || null);
      setStep6ReviewRemarks(details?.reviewRemarks || "");
    } catch {
      setStep6Error("Unable to load Step 6 details right now.");
    } finally {
      setStep6Loading(false);
    }
  }

  async function openStep7Workflow(app) {
    setModalMode("step7");
    setShowIssueViewDetails(false);
    setSelectedApplication(app);
    setStep7Loading(true);
    setStep7Saving(false);
    setStep7Error("");
    setStep7Details(null);
    setStep7Form({
      accessKeyReference: "",
      accessKeyValue: "",
      mappedEntityName: app.organizationName || "",
      mappingReference: "",
      preprodEndpoint: "",
      ipWhitelist: "",
      issueNotes: "",
    });

    try {
      const details = await fetchStep7Details(app.id);
      setStep7Details(details || null);
      setStep7Form({
        accessKeyReference: details?.accessKeyReference || "",
        accessKeyValue: details?.accessKeyValue || "",
        mappedEntityName: details?.mappedEntityName || app.organizationName || "",
        mappingReference: details?.mappingReference || "",
        preprodEndpoint: details?.preprodEndpoint || "",
        ipWhitelist: details?.ipWhitelist || "",
        issueNotes: details?.issueNotes || "",
      });
    } catch {
      setStep7Error("Unable to load Step 7 details right now.");
    } finally {
      setStep7Loading(false);
    }
  }


  async function openStep10Workflow(app) {
    setModalMode("step10");
    setShowIssueViewDetails(false);
    setSelectedApplication(app);
    setStep10Loading(true);
    setStep10Saving(false);
    setStep10Error("");
    setStep10Details(null);
    setStep10Decision("approved");
    setStep10ReviewRemarks("");

    try {
      const details = await fetchStep10Details(app.id);
      setStep10Details(details || null);
      setStep10ReviewRemarks(details?.reviewRemarks || "");
    } catch {
      setStep10Error("Unable to load Step 10 details right now.");
    } finally {
      setStep10Loading(false);
    }
  }

  async function openStep11Workflow(app) {
    setModalMode("step11");
    setShowIssueViewDetails(false);
    setSelectedApplication(app);
    setStep11Loading(true);
    setStep11Saving(false);
    setStep11Error("");
    setStep11Details(null);
    setStep11Form({
      productionKeyReference: "",
      productionKeyValue: "",
      productionEndpoint: "",
      productionEnvironmentDetails: "",
      goLiveNotes: "",
    });

    try {
      const details = await fetchStep11Details(app.id);
      setStep11Details(details || null);
      setStep11Form({
        productionKeyReference: details?.productionKeyReference || "",
        productionKeyValue: details?.productionKeyValue || "",
        productionEndpoint: details?.productionEndpoint || "",
        productionEnvironmentDetails: details?.productionEnvironmentDetails || "",
        goLiveNotes: details?.goLiveNotes || "",
      });
    } catch {
      setStep11Error("Unable to load Step 11 details right now.");
    } finally {
      setStep11Loading(false);
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

  async function handleStep4Review() {
    if (!selectedApplication) return;
    if (!step4Details?.submittedAt) {
      setStep4Error("Applicant has not submitted Step 4 yet.");
      return;
    }

    try {
      setStep4Saving(true);
      setStep4Error("");

      const appId = Number(selectedApplication.id);
      if (!Number.isFinite(appId)) {
        setStep4Error("Invalid application id for Step 4 review.");
        return;
      }

      const response = await reviewStep4Details(appId, {
        reviewedByUserId: user?.id || null,
        decision: step4Decision,
        reviewRemarks: step4ReviewRemarks.trim() || null,
        assignedAuditorUserId: step4Decision === "approved" && step5AssignedAuditorId ? Number(step5AssignedAuditorId) : null,
      });

      await loadAdminApplications();
      const updated = response?.application;
      if (updated) {
        setSelectedApplication((prev) => (prev ? { ...prev, ...updated } : prev));
      }

      const details = await fetchStep4Details(appId);
      setStep4Details(details || null);
    } catch (err) {
      setStep4Error(err?.response?.data?.message || "Failed to review Step 4.");
    } finally {
      setStep4Saving(false);
    }
  }
  async function handleStep6Review() {
    if (!selectedApplication) return;
    if (!step6Details?.submittedAt) {
      setStep6Error("Auditor has not submitted Step 6 yet.");
      return;
    }

    try {
      setStep6Saving(true);
      setStep6Error("");

      const appId = Number(selectedApplication.id);
      if (!Number.isFinite(appId)) {
        setStep6Error("Invalid application id for Step 6 review.");
        return;
      }

      const response = await reviewStep6Details(appId, {
        reviewedByUserId: user?.id || null,
        decision: step6Decision,
        reviewRemarks: step6ReviewRemarks.trim() || null,
      });

      await loadAdminApplications();
      const updated = response?.application;
      if (updated) {
        setSelectedApplication((prev) => (prev ? { ...prev, ...updated } : prev));
      }

      const details = await fetchStep6Details(appId);
      setStep6Details(details || null);
    } catch (err) {
      setStep6Error(err?.response?.data?.message || "Failed to review Step 6.");
    } finally {
      setStep6Saving(false);
    }
  }

  async function handleStep7Issue() {
    if (!selectedApplication) return;

    if (!step7Form.accessKeyReference.trim() || !step7Form.accessKeyValue.trim() || !step7Form.mappingReference.trim()) {
      setStep7Error("Enter the access key reference, access key value, and mapping reference.");
      return;
    }

    try {
      setStep7Saving(true);
      setStep7Error("");

      const appId = Number(selectedApplication.id);
      if (!Number.isFinite(appId)) {
        setStep7Error("Invalid application id for Step 7 issuance.");
        return;
      }

      const response = await issueStep7Details(appId, {
        issuedByUserId: user?.id || null,
        accessKeyReference: step7Form.accessKeyReference.trim(),
        accessKeyValue: step7Form.accessKeyValue.trim(),
        mappedEntityName: step7Form.mappedEntityName.trim() || selectedApplication.organizationName || null,
        mappingReference: step7Form.mappingReference.trim(),
        preprodEndpoint: step7Form.preprodEndpoint.trim() || null,
        ipWhitelist: step7Form.ipWhitelist.trim() || null,
        issueNotes: step7Form.issueNotes.trim() || null,
      });

      await loadAdminApplications();
      const updated = response?.application;
      if (updated) {
        setSelectedApplication((prev) => (prev ? { ...prev, ...updated } : prev));
      }

      const details = await fetchStep7Details(appId);
      setStep7Details(details || null);
      setStep7Form({
        accessKeyReference: details?.accessKeyReference || "",
        accessKeyValue: details?.accessKeyValue || "",
        mappedEntityName: details?.mappedEntityName || selectedApplication.organizationName || "",
        mappingReference: details?.mappingReference || "",
        preprodEndpoint: details?.preprodEndpoint || "",
        ipWhitelist: details?.ipWhitelist || "",
        issueNotes: details?.issueNotes || "",
      });
    } catch (err) {
      setStep7Error(err?.response?.data?.message || "Failed to issue Step 7 access.");
    } finally {
      setStep7Saving(false);
    }
  }


  async function handleStep10Review() {
    if (!selectedApplication) return;
    if (!step10Details?.submittedAt) {
      setStep10Error("Applicant has not submitted Step 10 yet.");
      return;
    }

    try {
      setStep10Saving(true);
      setStep10Error("");

      const response = await reviewStep10Details(selectedApplication.id, {
        reviewedByUserId: user?.id || null,
        decision: step10Decision,
        reviewRemarks: step10ReviewRemarks.trim() || null,
      });

      await loadAdminApplications();
      const updated = response?.application;
      if (updated) {
        setSelectedApplication((prev) => (prev ? { ...prev, ...updated } : prev));
      }

      const details = await fetchStep10Details(selectedApplication.id);
      setStep10Details(details || null);
    } catch (err) {
      setStep10Error(err?.response?.data?.message || "Failed to review Step 10.");
    } finally {
      setStep10Saving(false);
    }
  }

  async function handleStep11Issue() {
    if (!selectedApplication) return;
    if (!step11Form.productionKeyReference.trim() || !step11Form.productionKeyValue.trim() || !step11Form.productionEndpoint.trim()) {
      setStep11Error("Enter the production key reference, production key value, and production endpoint.");
      return;
    }

    try {
      setStep11Saving(true);
      setStep11Error("");

      const response = await issueStep11Details(selectedApplication.id, {
        issuedByUserId: user?.id || null,
        productionKeyReference: step11Form.productionKeyReference.trim(),
        productionKeyValue: step11Form.productionKeyValue.trim(),
        productionEndpoint: step11Form.productionEndpoint.trim(),
        productionEnvironmentDetails: step11Form.productionEnvironmentDetails.trim() || null,
        goLiveNotes: step11Form.goLiveNotes.trim() || null,
      });

      await loadAdminApplications();
      const updated = response?.application;
      if (updated) {
        setSelectedApplication((prev) => (prev ? { ...prev, ...updated } : prev));
      }

      const details = await fetchStep11Details(selectedApplication.id);
      setStep11Details(details || null);
      setStep11Form({
        productionKeyReference: details?.productionKeyReference || "",
        productionKeyValue: details?.productionKeyValue || "",
        productionEndpoint: details?.productionEndpoint || "",
        productionEnvironmentDetails: details?.productionEnvironmentDetails || "",
        goLiveNotes: details?.goLiveNotes || "",
      });
    } catch (err) {
      setStep11Error(err?.response?.data?.message || "Failed to issue Step 11 production access.");
    } finally {
      setStep11Saving(false);
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
    setStep4Error("");
    setStep4Details(null);
    setStep4Decision("approved");
    setStep4ReviewRemarks("");
    setStep5AssignedAuditorId("");
    setStep6Error("");
    setStep6Details(null);
    setStep6Decision("approved");
    setStep6ReviewRemarks("");
    setStep7Error("");
    setStep7Details(null);
    setStep7Form({
      accessKeyReference: "",
      accessKeyValue: "",
      mappedEntityName: "",
      mappingReference: "",
      preprodEndpoint: "",
      ipWhitelist: "",
      issueNotes: "",
    });
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
                    <p>Open an application and move it through Step 3, Step 4, or Step 6 review depending on its current stage.</p>
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
                          onClick={() => (Number(item.currentStep || 0) >= 11 ? openStep11Workflow(item) : Number(item.currentStep || 0) >= 10 ? openStep10Workflow(item) : Number(item.currentStep || 0) >= 7 ? openStep7Workflow(item) : Number(item.currentStep || 0) >= 6 ? openStep6Workflow(item) : Number(item.currentStep || 0) >= 4 ? openStep4Workflow(item) : openStep3Workflow(item))}
                        >
                          <Send size={15} />
                          {Number(item.currentStep || 0) >= 11 ? "Issue Step 11" : Number(item.currentStep || 0) >= 10 ? "Review Step 10" : Number(item.currentStep || 0) >= 8 ? "Step 7 Issued" : Number(item.currentStep || 0) >= 7 ? "Issue Step 7" : Number(item.currentStep || 0) >= 6 ? "Review Step 6" : Number(item.currentStep || 0) >= 5 ? "Step 4 Reviewed" : Number(item.currentStep || 0) >= 4 ? "Review Step 4" : "Issue Step 3"}
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
                <h3>{modalMode === "issue" ? "Issue Step 3: In-Principle Approval Letter" : modalMode === "step4" ? "Review Step 4 Submission" : modalMode === "step6" ? "Review Step 6 Submission" : modalMode === "step7" ? "Issue Step 7 Pre-production Access" : modalMode === "step10" ? "Review Step 10 Final License Fee Payment" : modalMode === "step11" ? "Issue Step 11 Live Production Access" : "Applicant Full Details"}</h3>
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
                  {renderPayloadSections(selectedApplication.submittedForm)}
                </div>
              </>
            ) : modalMode === "step4" ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <p className="helper-text" style={{ marginTop: 0 }}>
                    Review the Step 4 submission and open full applicant details when needed.
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
                      {renderPayloadSections(selectedApplication.submittedForm)}
                    </div>
                  </div>
                ) : (
                  <div className="asa-modal-grid">
                    <div><span>APPLICATION ID</span><p>{selectedApplication.applicationId || "-"}</p></div>
                    <div><span>CURRENT STEP</span><p>{selectedApplication.currentStep || "-"}</p></div>
                    <div><span>ORGANIZATION</span><p>{selectedApplication.organizationName || "-"}</p></div>
                    <div><span>APPLICANT NAME</span><p>{selectedApplication.applicantName || "-"}</p></div>
                    <div><span>EMAIL</span><p>{selectedApplication.email || "-"}</p></div>
                    <div><span>MOBILE</span><p>{selectedApplication.mobile || "-"}</p></div>
                  </div>
                )}

                <div className="asa-dash-panel" style={{ marginTop: 14 }}>
                  <div className="asa-panel-head">
                    <h3>Step 4 Submission Details</h3>
                  </div>

                  {step4Loading ? (
                    <p className="helper-text">Loading Step 4 details...</p>
                  ) : (
                    <>
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
                          <strong>{step4Details?.submittedAt ? new Date(step4Details.submittedAt).toLocaleString("en-IN") : "-"}</strong>
                        </div>
                        <div>
                          <span>Current Review Status</span>
                          <strong>{step4Details?.reviewStatus || "pending"}</strong>
                        </div>
                        <div>
                          <span>Previous Review Remarks</span>
                          <strong>{step4Details?.reviewRemarks || "-"}</strong>
                        </div>
                      </div>

                      {!step4Details?.submittedAt ? (
                        <p className="helper-text" style={{ marginTop: 12 }}>Applicant has not submitted Step 4 yet.</p>
                      ) : (
                        <>
                          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                            <label style={{ display: "grid", gap: 8 }}>
                              <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Decision</span>
                              <select
                                value={step4Decision}
                                onChange={(e) => setStep4Decision(e.target.value)}
                                className="asa-flow-select"
                                disabled={step4Saving}
                              >
                                <option value="approved">Approve (move to Step 5)</option>
                                <option value="rejected">Reject (send for resubmission)</option>
                              </select>
                            </label>

                            {step4Decision === "approved" ? (
                              <label style={{ display: "grid", gap: 8 }}>
                                <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Assign Auditor For Step 5</span>
                                <select
                                  value={step5AssignedAuditorId}
                                  onChange={(e) => setStep5AssignedAuditorId(e.target.value)}
                                  className="asa-flow-select"
                                  disabled={step4Saving}
                                >
                                  <option value="">Keep unassigned for now</option>
                                  {auditors.map((auditor) => (
                                    <option key={auditor.id} value={auditor.id}>
                                      {auditor.fullname} ({auditor.email})
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ) : null}

                            <label style={{ display: "grid", gap: 8 }}>
                              <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Review Remarks</span>
                              <textarea
                                value={step4ReviewRemarks}
                                onChange={(e) => setStep4ReviewRemarks(e.target.value)}
                                placeholder="Add Step 4 review remarks"
                                style={{
                                  width: "100%",
                                  minHeight: 96,
                                  borderRadius: 12,
                                  padding: 12,
                                  border: "1px solid rgba(255,230,0,0.25)",
                                  background: "#121218",
                                  color: "#fff",
                                }}
                                disabled={step4Saving}
                              />
                            </label>
                          </div>

                          {step4Error ? <p className="error-banner" style={{ marginTop: 12 }}>{step4Error}</p> : null}

                          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                            <button
                              type="button"
                              className="asa-inline-new-btn"
                              onClick={handleStep4Review}
                              disabled={step4Saving}
                            >
                              {step4Saving ? "Submitting Review..." : "Submit Step 4 Review"}
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : modalMode === "step7" ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <p className="helper-text" style={{ marginTop: 0 }}>
                    Issue the Step 7 pre-production access key and complete the pre-production mapping handoff.
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
                      {renderPayloadSections(selectedApplication.submittedForm)}
                    </div>
                  </div>
                ) : (
                  <div className="asa-modal-grid">
                    <div><span>APPLICATION ID</span><p>{selectedApplication.applicationId || "-"}</p></div>
                    <div><span>CURRENT STEP</span><p>{selectedApplication.currentStep || "-"}</p></div>
                    <div><span>ORGANIZATION</span><p>{selectedApplication.organizationName || "-"}</p></div>
                    <div><span>APPLICANT NAME</span><p>{selectedApplication.applicantName || "-"}</p></div>
                    <div><span>EMAIL</span><p>{selectedApplication.email || "-"}</p></div>
                    <div><span>MOBILE</span><p>{selectedApplication.mobile || "-"}</p></div>
                  </div>
                )}

                <div className="asa-dash-panel" style={{ marginTop: 14 }}>
                  <div className="asa-panel-head">
                    <h3>Step 7 Access Details</h3>
                  </div>

                  {step7Loading ? (
                    <p className="helper-text">Loading Step 7 details...</p>
                  ) : (
                    <>
                      <div className="asa-profile-grid">
                        <div>
                          <span>Issued By</span>
                          <strong>{step7Details?.issuedByName || "-"}</strong>
                        </div>
                        <div>
                          <span>Issued At</span>
                          <strong>{step7Details?.issuedAt ? new Date(step7Details.issuedAt).toLocaleString("en-IN") : "-"}</strong>
                        </div>
                        <div>
                          <span>Existing Key Ref</span>
                          <strong>{step7Details?.accessKeyReference || "-"}</strong>
                        </div>
                        <div>
                          <span>Existing Mapping Ref</span>
                          <strong>{step7Details?.mappingReference || "-"}</strong>
                        </div>
                      </div>

                      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                        <label style={{ display: "grid", gap: 8 }}>
                          <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Access Key Reference</span>
                          <input type="text" value={step7Form.accessKeyReference} onChange={(e) => setStep7Form((prev) => ({ ...prev, accessKeyReference: e.target.value }))} className="asa-flow-select" placeholder="Enter UIDAI key reference or document number" disabled={step7Saving} />
                        </label>

                        <label style={{ display: "grid", gap: 8 }}>
                          <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Access Key Value</span>
                          <textarea value={step7Form.accessKeyValue} onChange={(e) => setStep7Form((prev) => ({ ...prev, accessKeyValue: e.target.value }))} placeholder="Paste the pre-production access key or token issued to the applicant" style={{ width: "100%", minHeight: 96, borderRadius: 12, padding: 12, border: "1px solid rgba(255,230,0,0.25)", background: "#121218", color: "#fff" }} disabled={step7Saving} />
                        </label>

                        <label style={{ display: "grid", gap: 8 }}>
                          <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Mapped Entity Name</span>
                          <input type="text" value={step7Form.mappedEntityName} onChange={(e) => setStep7Form((prev) => ({ ...prev, mappedEntityName: e.target.value }))} className="asa-flow-select" placeholder="Entity name mapped in pre-production" disabled={step7Saving} />
                        </label>

                        <label style={{ display: "grid", gap: 8 }}>
                          <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Mapping Reference</span>
                          <input type="text" value={step7Form.mappingReference} onChange={(e) => setStep7Form((prev) => ({ ...prev, mappingReference: e.target.value }))} className="asa-flow-select" placeholder="Enter mapping id / tech centre reference" disabled={step7Saving} />
                        </label>

                        <label style={{ display: "grid", gap: 8 }}>
                          <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Pre-production Endpoint</span>
                          <input type="text" value={step7Form.preprodEndpoint} onChange={(e) => setStep7Form((prev) => ({ ...prev, preprodEndpoint: e.target.value }))} className="asa-flow-select" placeholder="Optional endpoint / environment URL" disabled={step7Saving} />
                        </label>

                        <label style={{ display: "grid", gap: 8 }}>
                          <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>IP Whitelist / Network Notes</span>
                          <textarea value={step7Form.ipWhitelist} onChange={(e) => setStep7Form((prev) => ({ ...prev, ipWhitelist: e.target.value }))} placeholder="Optional IP ranges, network notes, or routing instructions" style={{ width: "100%", minHeight: 80, borderRadius: 12, padding: 12, border: "1px solid rgba(255,230,0,0.25)", background: "#121218", color: "#fff" }} disabled={step7Saving} />
                        </label>

                        <label style={{ display: "grid", gap: 8 }}>
                          <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Issue Notes</span>
                          <textarea value={step7Form.issueNotes} onChange={(e) => setStep7Form((prev) => ({ ...prev, issueNotes: e.target.value }))} placeholder="Optional handoff notes for the applicant and next audit stage" style={{ width: "100%", minHeight: 96, borderRadius: 12, padding: 12, border: "1px solid rgba(255,230,0,0.25)", background: "#121218", color: "#fff" }} disabled={step7Saving} />
                        </label>
                      </div>

                      {step7Error ? <p className="error-banner" style={{ marginTop: 12 }}>{step7Error}</p> : null}

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                        <button
                          type="button"
                          className="asa-inline-new-btn"
                          onClick={handleStep7Issue}
                          disabled={step7Saving}
                        >
                          {step7Saving ? "Issuing Step 7..." : step7Details?.issuedAt ? "Reissue Step 7 Access" : "Issue Step 7 Access"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : modalMode === "step11" ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <p className="helper-text" style={{ marginTop: 0 }}>
                    Issue the live production credentials and environment details after Step 10 approval.
                  </p>
                  <button type="button" className="asa-inline-new-btn" onClick={() => setShowIssueViewDetails((prev) => !prev)}>
                    <Eye size={15} />
                    {showIssueViewDetails ? "Hide Details" : "View Details"}
                  </button>
                </div>

                {showIssueViewDetails ? (
                  <div className="asa-dash-panel" style={{ marginTop: 12 }}>
                    <div className="asa-panel-head"><h3>Applicant Full Details</h3></div>
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
                  <div className="asa-panel-head"><h3>Step 11 Production Details</h3></div>
                  {step11Loading ? (
                    <p className="helper-text">Loading Step 11 details...</p>
                  ) : (
                    <>
                      <div className="asa-profile-grid">
                        <div><span>Issued By</span><strong>{step11Details?.issuedByName || "-"}</strong></div>
                        <div><span>Migrated At</span><strong>{step11Details?.migratedAt ? new Date(step11Details.migratedAt).toLocaleString("en-IN") : "-"}</strong></div>
                        <div><span>Existing Key Ref</span><strong>{step11Details?.productionKeyReference || "-"}</strong></div>
                        <div><span>Existing Endpoint</span><strong>{step11Details?.productionEndpoint || "-"}</strong></div>
                      </div>

                      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                        <label style={{ display: "grid", gap: 8 }}>
                          <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Production Key Reference</span>
                          <input type="text" value={step11Form.productionKeyReference} onChange={(e) => setStep11Form((prev) => ({ ...prev, productionKeyReference: e.target.value }))} className="asa-flow-select" placeholder="Enter production key reference" disabled={step11Saving} />
                        </label>
                        <label style={{ display: "grid", gap: 8 }}>
                          <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Production Key Value</span>
                          <textarea value={step11Form.productionKeyValue} onChange={(e) => setStep11Form((prev) => ({ ...prev, productionKeyValue: e.target.value }))} placeholder="Paste the production key or token" style={{ width: "100%", minHeight: 96, borderRadius: 12, padding: 12, border: "1px solid rgba(255,230,0,0.25)", background: "#121218", color: "#fff" }} disabled={step11Saving} />
                        </label>
                        <label style={{ display: "grid", gap: 8 }}>
                          <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Production Endpoint</span>
                          <input type="text" value={step11Form.productionEndpoint} onChange={(e) => setStep11Form((prev) => ({ ...prev, productionEndpoint: e.target.value }))} className="asa-flow-select" placeholder="Enter live production endpoint" disabled={step11Saving} />
                        </label>
                        <label style={{ display: "grid", gap: 8 }}>
                          <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Environment Details</span>
                          <textarea value={step11Form.productionEnvironmentDetails} onChange={(e) => setStep11Form((prev) => ({ ...prev, productionEnvironmentDetails: e.target.value }))} placeholder="Add production environment details" style={{ width: "100%", minHeight: 80, borderRadius: 12, padding: 12, border: "1px solid rgba(255,230,0,0.25)", background: "#121218", color: "#fff" }} disabled={step11Saving} />
                        </label>
                        <label style={{ display: "grid", gap: 8 }}>
                          <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Go-live Notes</span>
                          <textarea value={step11Form.goLiveNotes} onChange={(e) => setStep11Form((prev) => ({ ...prev, goLiveNotes: e.target.value }))} placeholder="Optional go-live instructions for the applicant" style={{ width: "100%", minHeight: 96, borderRadius: 12, padding: 12, border: "1px solid rgba(255,230,0,0.25)", background: "#121218", color: "#fff" }} disabled={step11Saving} />
                        </label>
                      </div>

                      {step11Error ? <p className="error-banner" style={{ marginTop: 12 }}>{step11Error}</p> : null}
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                        <button type="button" className="asa-inline-new-btn" onClick={handleStep11Issue} disabled={step11Saving}>
                          {step11Saving ? "Issuing Step 11..." : step11Details?.migratedAt ? "Reissue Step 11 Access" : "Issue Step 11 Access"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : modalMode === "step10" ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <p className="helper-text" style={{ marginTop: 0 }}>
                    Review the Step 10 final license fee payment proof and decide whether to move the application to live migration.
                  </p>
                  <button type="button" className="asa-inline-new-btn" onClick={() => setShowIssueViewDetails((prev) => !prev)}>
                    <Eye size={15} />
                    {showIssueViewDetails ? "Hide Details" : "View Details"}
                  </button>
                </div>

                {showIssueViewDetails ? (
                  <div className="asa-dash-panel" style={{ marginTop: 12 }}>
                    <div className="asa-panel-head"><h3>Applicant Full Details</h3></div>
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
                  <div className="asa-panel-head"><h3>Step 10 Payment Details</h3></div>
                  {step10Loading ? (
                    <p className="helper-text">Loading Step 10 details...</p>
                  ) : (
                    <>
                      <div className="asa-profile-grid">
                        <div><span>Payment Reference</span><strong>{step10Details?.paymentReference || "-"}</strong></div>
                        <div><span>Transaction ID</span><strong>{step10Details?.transactionId || "-"}</strong></div>
                        <div><span>Receipt PDF</span><strong>{step10Details?.receiptFileUrl ? <a href={step10Details.receiptFileUrl} target="_blank" rel="noreferrer">Download PDF</a> : "-"}</strong></div>
                        <div><span>Submitted At</span><strong>{step10Details?.submittedAt ? new Date(step10Details.submittedAt).toLocaleString("en-IN") : "-"}</strong></div>
                        <div><span>Payment Remarks</span><strong>{step10Details?.paymentRemarks || "-"}</strong></div>
                        <div><span>Current Review Status</span><strong>{step10Details?.reviewStatus || "pending"}</strong></div>
                        <div><span>Previous Review Remarks</span><strong>{step10Details?.reviewRemarks || "-"}</strong></div>
                      </div>

                      {!step10Details?.submittedAt ? (
                        <p className="helper-text" style={{ marginTop: 12 }}>Applicant has not submitted Step 10 yet.</p>
                      ) : step10Details?.reviewStatus === "approved" ? (
                        <p className="helper-text" style={{ marginTop: 12 }}>Step 10 has already been approved and the application is ready for Step 11.</p>
                      ) : (
                        <>
                          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                            <label style={{ display: "grid", gap: 8 }}>
                              <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Decision</span>
                              <select value={step10Decision} onChange={(e) => setStep10Decision(e.target.value)} className="asa-flow-select" disabled={step10Saving}>
                                <option value="approved">Approve (move to Step 11)</option>
                                <option value="rejected">Reject (send for resubmission)</option>
                              </select>
                            </label>
                            <label style={{ display: "grid", gap: 8 }}>
                              <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Review Remarks</span>
                              <textarea value={step10ReviewRemarks} onChange={(e) => setStep10ReviewRemarks(e.target.value)} placeholder="Add Step 10 review remarks" style={{ width: "100%", minHeight: 96, borderRadius: 12, padding: 12, border: "1px solid rgba(255,230,0,0.25)", background: "#121218", color: "#fff" }} disabled={step10Saving} />
                            </label>
                          </div>

                          {step10Error ? <p className="error-banner" style={{ marginTop: 12 }}>{step10Error}</p> : null}
                          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                            <button type="button" className="asa-inline-new-btn" onClick={handleStep10Review} disabled={step10Saving}>
                              {step10Saving ? "Submitting Review..." : "Submit Step 10 Review"}
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : modalMode === "step6" ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <p className="helper-text" style={{ marginTop: 0 }}>
                    Review the Step 6 audit report and artefacts, then approve or reject the submission.
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
                      {renderPayloadSections(selectedApplication.submittedForm)}
                    </div>
                  </div>
                ) : (
                  <div className="asa-modal-grid">
                    <div><span>APPLICATION ID</span><p>{selectedApplication.applicationId || "-"}</p></div>
                    <div><span>CURRENT STEP</span><p>{selectedApplication.currentStep || "-"}</p></div>
                    <div><span>ORGANIZATION</span><p>{selectedApplication.organizationName || "-"}</p></div>
                    <div><span>APPLICANT NAME</span><p>{selectedApplication.applicantName || "-"}</p></div>
                    <div><span>EMAIL</span><p>{selectedApplication.email || "-"}</p></div>
                    <div><span>MOBILE</span><p>{selectedApplication.mobile || "-"}</p></div>
                  </div>
                )}

                <div className="asa-dash-panel" style={{ marginTop: 14 }}>
                  <div className="asa-panel-head">
                    <h3>Step 6 Submission Details</h3>
                  </div>

                  {step6Loading ? (
                    <p className="helper-text">Loading Step 6 details...</p>
                  ) : (
                    <>
                      <div className="asa-profile-grid">
                        <div>
                          <span>Audit Report Ref</span>
                          <strong>{step6Details?.auditReportRef || "-"}</strong>
                        </div>
                        <div>
                          <span>Audit Report PDF</span>
                          <strong>{step6Details?.auditReportFileUrl ? <a href={step6Details.auditReportFileUrl} target="_blank" rel="noreferrer">Download PDF</a> : "-"}</strong>
                        </div>
                        <div>
                          <span>Artefacts Ref</span>
                          <strong>{step6Details?.artefactsRef || "-"}</strong>
                        </div>
                        <div>
                          <span>Artefacts PDF</span>
                          <strong>{step6Details?.artefactsFileUrl ? <a href={step6Details.artefactsFileUrl} target="_blank" rel="noreferrer">Download PDF</a> : "-"}</strong>
                        </div>
                        <div>
                          <span>Submission Remarks</span>
                          <strong>{step6Details?.submissionRemarks || "-"}</strong>
                        </div>
                        <div>
                          <span>Submitted At</span>
                          <strong>{step6Details?.submittedAt ? new Date(step6Details.submittedAt).toLocaleString("en-IN") : "-"}</strong>
                        </div>
                        <div>
                          <span>Current Review Status</span>
                          <strong>{step6Details?.reviewStatus || "pending"}</strong>
                        </div>
                        <div>
                          <span>Previous Review Remarks</span>
                          <strong>{step6Details?.reviewRemarks || "-"}</strong>
                        </div>
                      </div>

                      {!step6Details?.submittedAt ? (
                        <p className="helper-text" style={{ marginTop: 12 }}>Auditor has not submitted Step 6 yet.</p>
                      ) : step6Details?.reviewStatus === "approved" ? (
                        <p className="helper-text" style={{ marginTop: 12 }}>Step 6 has already been approved and the application is ready for Step 7.</p>
                      ) : (
                        <>
                          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                            <label style={{ display: "grid", gap: 8 }}>
                              <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Decision</span>
                              <select
                                value={step6Decision}
                                onChange={(e) => setStep6Decision(e.target.value)}
                                className="asa-flow-select"
                                disabled={step6Saving}
                              >
                                <option value="approved">Approve (move to Step 7)</option>
                                <option value="rejected">Reject (send for resubmission)</option>
                              </select>
                            </label>

                            <label style={{ display: "grid", gap: 8 }}>
                              <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9c9c9" }}>Review Remarks</span>
                              <textarea
                                value={step6ReviewRemarks}
                                onChange={(e) => setStep6ReviewRemarks(e.target.value)}
                                placeholder="Add Step 6 review remarks"
                                style={{
                                  width: "100%",
                                  minHeight: 96,
                                  borderRadius: 12,
                                  padding: 12,
                                  border: "1px solid rgba(255,230,0,0.25)",
                                  background: "#121218",
                                  color: "#fff",
                                }}
                                disabled={step6Saving}
                              />
                            </label>
                          </div>

                          {step6Error ? <p className="error-banner" style={{ marginTop: 12 }}>{step6Error}</p> : null}

                          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                            <button
                              type="button"
                              className="asa-inline-new-btn"
                              onClick={handleStep6Review}
                              disabled={step6Saving}
                            >
                              {step6Saving ? "Submitting Review..." : "Submit Step 6 Review"}
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}
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
                      {renderPayloadSections(selectedApplication.submittedForm)}
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












