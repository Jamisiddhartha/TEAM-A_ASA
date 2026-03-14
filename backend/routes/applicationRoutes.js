import express from "express";
import PDFDocument from "pdfkit";
import { promises as fs } from "fs";
import path from "path";
import pool from "../config/db.js";
import { STEP5_CHECKLIST_TEMPLATE, STEP5_COMPLIANCE_OPTIONS } from "../config/step5Checklist.js";

const router = express.Router();

const STEP3_APPENDICES = [
  "ASA Agreement V 6.0",
  "Invoice for payment of Initial License Fee",
  "Performance Bank Guarantee",
  "Pre-onboarding Audit Compliance Checklist",
  "Onboarding Audit Compliance Checklist",
];

const STEP4_UPLOAD_DIR = path.join(process.cwd(), "uploads", "step4");
const STEP6_UPLOAD_DIR = path.join(process.cwd(), "uploads", "step6");

function sanitizeFileName(name, fallback) {
  const safe = String(name || fallback || "document.pdf")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");
  return safe.toLowerCase().endsWith(".pdf") ? safe : `${safe}.pdf`;
}

async function savePdfDataUrl({ dataUrl, applicationId, prefix, originalName, uploadDir = STEP4_UPLOAD_DIR, publicBasePath = "/uploads/step4" }) {
  if (!dataUrl || typeof dataUrl !== "string") return null;

  const match = dataUrl.match(/^data:application\/pdf;base64,(.+)$/i);
  if (!match) {
    throw new Error("Uploaded file must be a PDF document");
  }

  const buffer = Buffer.from(match[1], "base64");
  if (!buffer.length) {
    throw new Error("Uploaded PDF is empty");
  }

  if (buffer.length > 15 * 1024 * 1024) {
    throw new Error("PDF size must be 15MB or less");
  }

  await fs.mkdir(uploadDir, { recursive: true });

  const fileName = sanitizeFileName(originalName, `${prefix}-${applicationId}.pdf`);
  const storedName = `${prefix}-${applicationId}-${Date.now()}-${fileName}`;
  const fullPath = path.join(uploadDir, storedName);
  await fs.writeFile(fullPath, buffer);

  return {
    filePath: `${publicBasePath}/${storedName}`,
    fileName,
  };
}

function toPublicFileUrl(req, filePath) {
  if (!filePath) return null;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
  return `${req.protocol}://${req.get("host")}${filePath}`;
}


function buildApplicationId(id) {
  return `ASA-${new Date().getFullYear()}-${String(id).padStart(4, "0")}`;
}

function mapApplication(row) {
  return {
    id: row.id,
    applicationId: row.application_id,
    organizationName: row.organization_name,
    applicantName: row.applicant_name,
    email: row.email,
    mobile: row.mobile,
    organizationType: row.organization_type,
    integrationModel: row.integration_model,
    currentStep: row.current_step,
    overallStatus: row.overall_status,
    environmentStatus: row.environment_status,
    applicationSummary: row.application_summary,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}


function mapAdminApplication(row) {
  return {
    ...mapApplication(row),
    submittedForm: row.submitted_form || null,
  };
}
function buildStep5Summary(items = []) {
  return items.reduce(
    (summary, item) => {
      summary.total += 1;
      const key = item.compliance_status || "pending";
      if (Object.prototype.hasOwnProperty.call(summary, key)) {
        summary[key] += 1;
      } else {
        summary.pending += 1;
      }
      return summary;
    },
    { total: 0, pending: 0, compliant: 0, non_compliant: 0, not_applicable: 0 }
  );
}

async function ensureStep5Setup(applicationId, assignedAuditorUserId = null) {
  await pool.query(
    `INSERT INTO application_step5_actions (application_id, assigned_auditor_user_id)
     VALUES ($1, $2)
     ON CONFLICT (application_id)
     DO UPDATE SET assigned_auditor_user_id = COALESCE(EXCLUDED.assigned_auditor_user_id, application_step5_actions.assigned_auditor_user_id),
                   updated_at = NOW()`,
    [applicationId, assignedAuditorUserId || null]
  );

  for (const item of STEP5_CHECKLIST_TEMPLATE) {
    await pool.query(
      `INSERT INTO application_step5_checklist_items (
         application_id, control_no, section_code, section_title, short_title, control_description
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (application_id, control_no)
       DO NOTHING`,
      [applicationId, item.controlNo, item.sectionCode, item.sectionTitle, item.shortTitle, item.controlDescription]
    );
  }
}

async function loadStep5Audit(applicationId) {
  await ensureStep5Setup(applicationId);

  const actionResult = await pool.query(
    `SELECT s5.*, u.fullname AS assigned_auditor_name, u.email AS assigned_auditor_email
     FROM application_step5_actions s5
     LEFT JOIN users u ON u.id = s5.assigned_auditor_user_id
     WHERE s5.application_id = $1
     LIMIT 1`,
    [applicationId]
  );

  const checklistResult = await pool.query(
    `SELECT *
     FROM application_step5_checklist_items
     WHERE application_id = $1
     ORDER BY control_no ASC`,
    [applicationId]
  );

  const action = actionResult.rows[0] || null;
  const items = checklistResult.rows;
  return { action, items, summary: buildStep5Summary(items) };
}

function mapStep5Details(step5) {
  const { action, items, summary } = step5;
  return {
    applicationId: action?.application_id || null,
    assignedAuditorUserId: action?.assigned_auditor_user_id || null,
    assignedAuditorName: action?.assigned_auditor_name || null,
    assignedAuditorEmail: action?.assigned_auditor_email || null,
    auditStatus: action?.audit_status || "pending",
    auditorSummary: action?.auditor_summary || "",
    applicantSummary: action?.applicant_summary || "",
    startedAt: action?.started_at || null,
    submittedAt: action?.submitted_at || null,
    summary,
    items: items.map((item) => ({
      controlNo: item.control_no,
      sectionCode: item.section_code,
      sectionTitle: item.section_title,
      shortTitle: item.short_title,
      controlDescription: item.control_description,
      complianceStatus: item.compliance_status,
      auditorObservation: item.auditor_observation || "",
      asaManagementComment: item.asa_management_comment || "",
      evidenceReference: item.evidence_reference || "",
      updatedByUserId: item.updated_by_user_id || null,
      updatedAt: item.updated_at,
    })),
  };
}

async function loadStep6Submission(applicationId) {
  const result = await pool.query(
    `SELECT s6.*, ua.fullname AS submitted_by_auditor_name, ua.email AS submitted_by_auditor_email,
            ur.fullname AS reviewed_by_name, ur.email AS reviewed_by_email,
            s5.assigned_auditor_user_id,
            aa.fullname AS assigned_auditor_name,
            aa.email AS assigned_auditor_email
     FROM application_step6_actions s6
     LEFT JOIN users ua ON ua.id = s6.submitted_by_auditor_user_id
     LEFT JOIN users ur ON ur.id = s6.reviewed_by_user_id
     LEFT JOIN application_step5_actions s5 ON s5.application_id = s6.application_id
     LEFT JOIN users aa ON aa.id = s5.assigned_auditor_user_id
     WHERE s6.application_id = $1
     LIMIT 1`,
    [applicationId]
  );

  return result.rows[0] || null;
}

function mapStep6Details(row, req) {
  if (!row) {
    return {
      applicationId: null,
      assignedAuditorUserId: null,
      assignedAuditorName: null,
      assignedAuditorEmail: null,
      submittedByAuditorUserId: null,
      submittedByAuditorName: null,
      submittedByAuditorEmail: null,
      auditReportRef: null,
      artefactsRef: null,
      auditReportFileUrl: null,
      auditReportFileName: null,
      artefactsFileUrl: null,
      artefactsFileName: null,
      submissionRemarks: "",
      reviewStatus: "pending",
      reviewRemarks: "",
      reviewedByUserId: null,
      reviewedByName: null,
      reviewedByEmail: null,
      submittedAt: null,
      reviewedAt: null,
      createdAt: null,
      updatedAt: null,
    };
  }

  return {
    applicationId: row.application_id,
    assignedAuditorUserId: row.assigned_auditor_user_id || null,
    assignedAuditorName: row.assigned_auditor_name || null,
    assignedAuditorEmail: row.assigned_auditor_email || null,
    submittedByAuditorUserId: row.submitted_by_auditor_user_id || null,
    submittedByAuditorName: row.submitted_by_auditor_name || null,
    submittedByAuditorEmail: row.submitted_by_auditor_email || null,
    auditReportRef: row.audit_report_ref || null,
    artefactsRef: row.artefacts_ref || null,
    auditReportFileUrl: toPublicFileUrl(req, row.audit_report_file_path),
    auditReportFileName: row.audit_report_file_name || null,
    artefactsFileUrl: toPublicFileUrl(req, row.artefacts_file_path),
    artefactsFileName: row.artefacts_file_name || null,
    submissionRemarks: row.submission_remarks || "",
    reviewStatus: row.review_status || "pending",
    reviewRemarks: row.review_remarks || "",
    reviewedByUserId: row.reviewed_by_user_id || null,
    reviewedByName: row.reviewed_by_name || null,
    reviewedByEmail: row.reviewed_by_email || null,
    submittedAt: row.submitted_at || null,
    reviewedAt: row.reviewed_at || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}

function formatDate(value) {
  if (!value) return "____________________";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function dataUrlToBuffer(dataUrl) {
  if (!dataUrl || !dataUrl.startsWith("data:image/")) {
    return null;
  }

  const base64 = dataUrl.split(",")[1];
  return base64 ? Buffer.from(base64, "base64") : null;
}

function renderWrappedClause(doc, prefix, text) {
  const startX = doc.x;
  const availableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const prefixWidth = doc.widthOfString(prefix);
  doc.font("Helvetica-Bold").text(prefix, startX, doc.y, { continued: true });
  doc.font("Helvetica").text(` ${text}`, { width: availableWidth - prefixWidth - 8 });
  doc.moveDown(0.45);
}

function buildDeclarationPdf({ application, payload, res }) {
  const applicantName = payload.applicantName || application.applicant_name || "__________________________";
  const signatoryName = payload.declarantName || payload.authorizedSignatoryName || applicantName;
  const designation = payload.declarantDesignation || "____________________";
  const place = payload.declarationPlace || "____________________";
  const declarationDate = formatDate(payload.declarationDate || application.created_at);
  const signatureBuffer = dataUrlToBuffer(payload.signatureDataUrl);
  const clauses = [
    'to abide by the provisions of the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016 ("Aadhaar Act") and the regulations made thereunder;',
    "to facilitate, on receipt of in-principle approval from UIDAI, audit as per UIDAI Compliance Checklist for onboarding the ASA and submit all compliance related documents attached as annexure before signing the ASA Agreement;",
    "to fulfil all requirements with respect to use of the Aadhaar Authentication facility as per the Aadhaar (Authentication and Offline Verification) Regulations, 2021 including financial and technical requirement defined in Schedule A;",
    "to set up and maintain within the territory of India, at all times, requisite infrastructure including servers, databases and related systems for use of Aadhaar Authentication facilities, capable of handling Authentication transactions of AUA or KUA and their Sub-AUAs or Sub-KUAs per month with minimum additional capacity of 25%, maintaining logs and white listed IP Address(es);",
    "to ensure carrying out of audit of its own operations and systems, as required under the Aadhaar Act, the regulations made thereunder and the ASA Agreement;",
    "to ensure roles, responsibilities and code of conduct of ASA, as required under the Aadhaar Act, the regulations made thereunder and the ASA agreement;",
    "to inform UIDAI forthwith of any change in the name, address and other particulars of the applicant and contact person as furnished in this application form.",
  ];

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${application.application_id || `ASA-${application.id}`}-declaration.pdf"`);
  doc.pipe(res);

  doc.fontSize(18).font("Helvetica-Bold").text("ASA Declaration and Undertaking", { align: "center" });
  doc.moveDown(0.35);
  doc.fontSize(10).font("Helvetica").fillColor("#444444").text(`Application ID: ${application.application_id || "Pending"}`, { align: "center" });
  doc.fillColor("#000000");
  doc.moveDown(1.2);

  doc.fontSize(11).font("Helvetica").text("Declarations and Undertakings:");
  doc.moveDown(0.5);
  doc.text(
    "It is hereby declared that the information furnished in this application form is true and correct to the best of its knowledge and that no material particulars or information have been concealed or withheld, and that the",
    { align: "justify" }
  );
  doc.moveDown(0.35);
  doc.font("Helvetica-Bold").text(applicantName, { underline: true });
  doc.font("Helvetica").text("hereby undertakes:", { continued: false });
  doc.moveDown(0.7);

  clauses.forEach((clause, index) => {
    renderWrappedClause(doc, `(${String.fromCharCode(97 + index)})`, clause);
  });

  doc.moveDown(0.7);
  doc.font("Helvetica-Bold").text("Signature with stamp/seal of authorised signatory");
  doc.moveDown(0.4);

  const signatureBoxX = doc.x;
  const signatureBoxY = doc.y;
  const signatureBoxWidth = 220;
  const signatureBoxHeight = 80;
  doc.rect(signatureBoxX, signatureBoxY, signatureBoxWidth, signatureBoxHeight).stroke("#777777");

  if (signatureBuffer) {
    try {
      doc.image(signatureBuffer, signatureBoxX + 8, signatureBoxY + 8, { fit: [signatureBoxWidth - 16, signatureBoxHeight - 16], align: "center", valign: "center" });
    } catch {
      doc.fontSize(10).font("Helvetica-Oblique").fillColor("#666666").text("Signature image captured in portal", signatureBoxX + 12, signatureBoxY + 30, { width: signatureBoxWidth - 24, align: "center" });
      doc.fillColor("#000000");
    }
  } else {
    doc.fontSize(10).font("Helvetica-Oblique").fillColor("#666666").text("No signature image available", signatureBoxX + 12, signatureBoxY + 30, { width: signatureBoxWidth - 24, align: "center" });
    doc.fillColor("#000000");
  }

  doc.moveDown(5.5);
  doc.fontSize(11).font("Helvetica");
  doc.text(`Name: ${signatoryName}`);
  doc.moveDown(0.35);
  doc.text(`Full designation: ${designation}`);
  doc.moveDown(0.35);
  doc.text(`Date: ${declarationDate}`);
  doc.moveDown(0.35);
  doc.text(`Place: ${place}`);
  doc.moveDown(1.4);

  doc.fontSize(10).font("Helvetica-Bold").text("Portal authentication record");
  doc.moveDown(0.35);
  doc.font("Helvetica").text(`Signature authenticated: ${payload.signatureAuthenticated ? "Yes" : "No"}`);
  doc.text(`Authentication method: ${payload.signatureAuthMode || "Portal signature verification"}`);
  doc.text(`Authenticated at: ${payload.signatureAuthenticatedAt ? new Date(payload.signatureAuthenticatedAt).toLocaleString("en-IN") : "Not available"}`);
  doc.text(`Applicant email: ${payload.declarantEmail || application.email || "Not available"}`);
  doc.text(`Applicant phone: ${payload.declarantPhone || application.mobile || "Not available"}`);

  doc.end();
}


router.get("/", async (req, res) => {
  try {
    const role = String(req.query.role || "").toLowerCase();
    const userId = Number(req.query.userId || 0);
    const email = String(req.query.email || "").trim().toLowerCase();

    let result;
    if (role === "applicant") {
      if (!userId && !email) {
        return res.status(400).json({ message: "Applicant filter requires userId or email" });
      }

      if (userId && email) {
        result = await pool.query(
          `
            SELECT *
            FROM applications
            WHERE created_by_user_id = $1 OR LOWER(TRIM(email)) = $2
            ORDER BY created_at DESC
          `,
          [userId, email]
        );
      } else if (userId) {
        result = await pool.query(
          `
            SELECT *
            FROM applications
            WHERE created_by_user_id = $1
            ORDER BY created_at DESC
          `,
          [userId]
        );
      } else {
        result = await pool.query(
          `
            SELECT *
            FROM applications
            WHERE LOWER(TRIM(email)) = $1
            ORDER BY created_at DESC
          `,
          [email]
        );
      }
    } else {
      result = await pool.query("SELECT * FROM applications ORDER BY created_at DESC");
    }

    res.json({ applications: result.rows.map((row) => mapApplication(row)) });
  } catch {
    res.status(500).json({ message: "Failed to load applications" });
  }
});

router.get("/admin/step2", async (_req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT a.*, s.payload AS submitted_form
        FROM applications a
        LEFT JOIN application_form_submissions s ON s.application_id = a.id
        WHERE a.current_step >= 2
        ORDER BY a.updated_at DESC, a.created_at DESC
      `
    );

    res.json({ applications: result.rows.map((row) => mapAdminApplication(row)) });
  } catch {
    res.status(500).json({ message: "Failed to load admin applications" });
  }
});

router.get("/meta/auditors", async (_req, res) => {
  try {
    const result = await pool.query("SELECT id, fullname, email FROM users WHERE LOWER(TRIM(role)) = 'auditor' ORDER BY fullname ASC, email ASC");
    res.json({ auditors: result.rows });
  } catch {
    res.status(500).json({ message: "Failed to load auditors" });
  }
});

router.get("/:id/step5", async (req, res) => {
  try {
    const applicationResult = await pool.query("SELECT id FROM applications WHERE id = $1", [req.params.id]);
    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const step5 = await loadStep5Audit(req.params.id);
    res.json({ step5: mapStep5Details(step5) });
  } catch {
    res.status(500).json({ message: "Failed to load Step 5 details" });
  }
});

router.post("/:id/step5/assign", async (req, res) => {
  const { assignedAuditorUserId } = req.body || {};

  try {
    const applicationResult = await pool.query("SELECT * FROM applications WHERE id = $1", [req.params.id]);
    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const app = applicationResult.rows[0];
    if (Number(app.current_step || 0) < 5) {
      return res.status(400).json({ message: "Step 5 assignment is available only after Step 4 approval" });
    }

    if (assignedAuditorUserId) {
      const auditorResult = await pool.query("SELECT id FROM users WHERE id = $1 AND LOWER(TRIM(role)) = 'auditor' LIMIT 1", [assignedAuditorUserId]);
      if (auditorResult.rows.length === 0) {
        return res.status(400).json({ message: "Selected auditor does not exist" });
      }
    }

    await ensureStep5Setup(req.params.id, assignedAuditorUserId || null);
    const step5 = await loadStep5Audit(req.params.id);
    res.json({ message: "Step 5 auditor assignment saved", step5: mapStep5Details(step5) });
  } catch {
    res.status(500).json({ message: "Failed to assign auditor for Step 5" });
  }
});

router.post("/:id/step5/save", async (req, res) => {
  const { updatedByUserId, auditorSummary, applicantSummary, items } = req.body || {};

  if (!updatedByUserId) {
    return res.status(400).json({ message: "Step 5 save requires the auditor user id" });
  }

  try {
    const applicationResult = await pool.query("SELECT * FROM applications WHERE id = $1", [req.params.id]);
    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const app = applicationResult.rows[0];
    if (Number(app.current_step || 0) < 5) {
      return res.status(400).json({ message: "Step 5 is not available for this application yet" });
    }

    await ensureStep5Setup(req.params.id);
    const actionResult = await pool.query("SELECT * FROM application_step5_actions WHERE application_id = $1 LIMIT 1", [req.params.id]);
    const action = actionResult.rows[0];
    if (action?.assigned_auditor_user_id && Number(action.assigned_auditor_user_id) !== Number(updatedByUserId)) {
      return res.status(403).json({ message: "This Step 5 audit is assigned to another auditor" });
    }
    if (action?.audit_status === "submitted") {
      return res.status(400).json({ message: "Step 5 has already been submitted" });
    }

    if (Array.isArray(items)) {
      for (const item of items) {
        const controlNo = Number(item.controlNo);
        const status = String(item.complianceStatus || "pending").toLowerCase();
        if (!Number.isFinite(controlNo)) continue;
        if (!STEP5_COMPLIANCE_OPTIONS.includes(status)) {
          return res.status(400).json({ message: `Invalid compliance status for control ${controlNo}` });
        }

        await pool.query(
          "UPDATE application_step5_checklist_items SET compliance_status = $1, auditor_observation = $2, asa_management_comment = $3, evidence_reference = $4, updated_by_user_id = $5, updated_at = NOW() WHERE application_id = $6 AND control_no = $7",
          [status, item.auditorObservation || null, item.asaManagementComment || null, item.evidenceReference || null, updatedByUserId, req.params.id, controlNo]
        );
      }
    }

    await pool.query(
      "UPDATE application_step5_actions SET assigned_auditor_user_id = COALESCE(assigned_auditor_user_id, $1), audit_status = CASE WHEN audit_status = 'submitted' THEN audit_status ELSE 'in_progress' END, auditor_summary = COALESCE($2, auditor_summary), applicant_summary = COALESCE($3, applicant_summary), started_at = COALESCE(started_at, NOW()), updated_at = NOW() WHERE application_id = $4",
      [updatedByUserId, auditorSummary || null, applicantSummary || null, req.params.id]
    );

    await pool.query(
      "UPDATE applications SET current_step = GREATEST(current_step, 5), overall_status = 'Step 5 Audit In Progress', environment_status = 'Step 5: Pre-onboarding Audit', application_summary = COALESCE($1, application_summary) WHERE id = $2",
      [auditorSummary ? `Step 5 in progress: ${auditorSummary}` : "Step 5 audit checklist is in progress.", req.params.id]
    );

    const step5 = await loadStep5Audit(req.params.id);
    res.json({ message: "Step 5 progress saved", step5: mapStep5Details(step5) });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Failed to save Step 5 progress" });
  }
});

router.post("/:id/step5/submit", async (req, res) => {
  const { submittedByUserId, auditorSummary, applicantSummary } = req.body || {};

  if (!submittedByUserId) {
    return res.status(400).json({ message: "Step 5 submission requires the auditor user id" });
  }

  try {
    const applicationResult = await pool.query("SELECT * FROM applications WHERE id = $1", [req.params.id]);
    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const app = applicationResult.rows[0];
    if (Number(app.current_step || 0) < 5) {
      return res.status(400).json({ message: "Step 5 is not available for this application yet" });
    }

    await ensureStep5Setup(req.params.id);
    const step5 = await loadStep5Audit(req.params.id);
    if (step5.action?.assigned_auditor_user_id && Number(step5.action.assigned_auditor_user_id) !== Number(submittedByUserId)) {
      return res.status(403).json({ message: "This Step 5 audit is assigned to another auditor" });
    }
    if (step5.summary.pending > 0) {
      return res.status(400).json({ message: "Complete all Step 5 checklist controls before submission" });
    }

    await pool.query(
      "UPDATE application_step5_actions SET assigned_auditor_user_id = COALESCE(assigned_auditor_user_id, $1), audit_status = 'submitted', auditor_summary = COALESCE($2, auditor_summary), applicant_summary = COALESCE($3, applicant_summary), started_at = COALESCE(started_at, NOW()), submitted_at = NOW(), updated_at = NOW() WHERE application_id = $4",
      [submittedByUserId, auditorSummary || null, applicantSummary || null, req.params.id]
    );

    const counts = step5.summary;
    await pool.query(
      "UPDATE applications SET current_step = GREATEST(current_step, 6), overall_status = 'Step 5 Audit Submitted', environment_status = 'Step 6: Audit Report Submission & Approval', application_summary = $1 WHERE id = $2",
      [`Step 5 submitted with ${counts.compliant} compliant, ${counts.non_compliant} non-compliant, and ${counts.not_applicable} not-applicable controls.`, req.params.id]
    );

    const refreshed = await loadStep5Audit(req.params.id);
    res.json({ message: "Step 5 submitted successfully and application moved to Step 6", step5: mapStep5Details(refreshed) });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Failed to submit Step 5" });
  }
});
router.get("/:id/step6", async (req, res) => {
  try {
    const applicationResult = await pool.query(
      `SELECT a.id, a.current_step, s5.assigned_auditor_user_id
       FROM applications a
       LEFT JOIN application_step5_actions s5 ON s5.application_id = a.id
       WHERE a.id = $1
       LIMIT 1`,
      [req.params.id]
    );

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const row = applicationResult.rows[0];
    const step6 = await loadStep6Submission(req.params.id);
    const mapped = mapStep6Details(step6, req);
    if (!step6) {
      mapped.applicationId = Number(req.params.id);
      mapped.assignedAuditorUserId = row.assigned_auditor_user_id || null;
    }

    res.json({ step6: mapped });
  } catch {
    res.status(500).json({ message: "Failed to load Step 6 details" });
  }
});

router.post("/:id/step6/submit", async (req, res) => {
  const {
    submittedByAuditorUserId,
    auditReportRef,
    artefactsRef,
    submissionRemarks,
    auditReportFileData,
    auditReportFileName,
    artefactsFileData,
    artefactsFileName,
  } = req.body || {};

  if (!submittedByAuditorUserId) {
    return res.status(400).json({ message: "Step 6 submission requires the auditor user id" });
  }

  try {
    const appResult = await pool.query(
      `SELECT a.*, s5.assigned_auditor_user_id
       FROM applications a
       LEFT JOIN application_step5_actions s5 ON s5.application_id = a.id
       WHERE a.id = $1
       LIMIT 1`,
      [req.params.id]
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const app = appResult.rows[0];
    if (Number(app.current_step || 0) < 6) {
      return res.status(400).json({ message: "Step 6 is available only after Step 5 submission" });
    }

    if (app.assigned_auditor_user_id && Number(app.assigned_auditor_user_id) !== Number(submittedByAuditorUserId)) {
      return res.status(403).json({ message: "This Step 6 submission is assigned to another auditor" });
    }

    const existing = await loadStep6Submission(req.params.id);
    if (existing?.review_status === "approved") {
      return res.status(400).json({ message: "Step 6 has already been approved" });
    }
    if (existing?.review_status === "under_review") {
      return res.status(400).json({ message: "Step 6 is already under admin review" });
    }

    let auditReportPath = existing?.audit_report_file_path || null;
    let auditReportStoredName = existing?.audit_report_file_name || null;
    let artefactsPath = existing?.artefacts_file_path || null;
    let artefactsStoredName = existing?.artefacts_file_name || null;

    if (auditReportFileData) {
      const saved = await savePdfDataUrl({
        dataUrl: auditReportFileData,
        applicationId: req.params.id,
        prefix: "step6-audit-report",
        originalName: auditReportFileName,
        uploadDir: STEP6_UPLOAD_DIR,
        publicBasePath: "/uploads/step6",
      });
      auditReportPath = saved.filePath;
      auditReportStoredName = saved.fileName;
    }

    if (artefactsFileData) {
      const saved = await savePdfDataUrl({
        dataUrl: artefactsFileData,
        applicationId: req.params.id,
        prefix: "step6-artefacts",
        originalName: artefactsFileName,
        uploadDir: STEP6_UPLOAD_DIR,
        publicBasePath: "/uploads/step6",
      });
      artefactsPath = saved.filePath;
      artefactsStoredName = saved.fileName;
    }

    if (!auditReportPath || !artefactsPath) {
      return res.status(400).json({ message: "Upload both the audit report PDF and artefacts PDF for Step 6" });
    }

    await pool.query(
      `INSERT INTO application_step6_actions (
         application_id,
         submitted_by_auditor_user_id,
         audit_report_ref,
         artefacts_ref,
         audit_report_file_path,
         audit_report_file_name,
         artefacts_file_path,
         artefacts_file_name,
         submission_remarks,
         review_status,
         review_remarks,
         reviewed_by_user_id,
         submitted_at,
         reviewed_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'under_review',NULL,NULL,NOW(),NULL)
       ON CONFLICT (application_id)
       DO UPDATE SET
         submitted_by_auditor_user_id = EXCLUDED.submitted_by_auditor_user_id,
         audit_report_ref = EXCLUDED.audit_report_ref,
         artefacts_ref = EXCLUDED.artefacts_ref,
         audit_report_file_path = EXCLUDED.audit_report_file_path,
         audit_report_file_name = EXCLUDED.audit_report_file_name,
         artefacts_file_path = EXCLUDED.artefacts_file_path,
         artefacts_file_name = EXCLUDED.artefacts_file_name,
         submission_remarks = EXCLUDED.submission_remarks,
         review_status = 'under_review',
         review_remarks = NULL,
         reviewed_by_user_id = NULL,
         submitted_at = NOW(),
         reviewed_at = NULL,
         updated_at = NOW()`,
      [
        req.params.id,
        submittedByAuditorUserId,
        auditReportRef || null,
        artefactsRef || null,
        auditReportPath,
        auditReportStoredName,
        artefactsPath,
        artefactsStoredName,
        submissionRemarks || null,
      ]
    );

    await pool.query(
      `UPDATE applications
       SET current_step = GREATEST(current_step, 6),
           overall_status = 'Step 6 Report Submitted',
           environment_status = 'Step 6 Under Review',
           application_summary = $1
       WHERE id = $2`,
      [submissionRemarks ? `Step 6 submitted by auditor: ${submissionRemarks}` : 'Step 6 audit report and artefacts submitted for admin review.', req.params.id]
    );

    const refreshed = await loadStep6Submission(req.params.id);
    res.json({ message: "Step 6 submitted successfully and is now under review", step6: mapStep6Details(refreshed, req) });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Failed to submit Step 6" });
  }
});

router.post("/:id/step6/review", async (req, res) => {
  const { reviewedByUserId, decision, reviewRemarks } = req.body || {};

  if (!reviewedByUserId || !decision || !["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ message: "Step 6 review requires reviewer and valid decision" });
  }

  try {
    const appResult = await pool.query("SELECT * FROM applications WHERE id = $1 LIMIT 1", [req.params.id]);
    if (appResult.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const step6 = await loadStep6Submission(req.params.id);
    if (!step6?.submitted_at) {
      return res.status(400).json({ message: "Auditor has not submitted Step 6 yet" });
    }

    await pool.query(
      `UPDATE application_step6_actions
       SET review_status = $1,
           review_remarks = $2,
           reviewed_by_user_id = $3,
           reviewed_at = NOW(),
           updated_at = NOW()
       WHERE application_id = $4`,
      [decision, reviewRemarks || null, reviewedByUserId, req.params.id]
    );

    const nextStep = decision === "approved" ? 7 : 6;
    const overallStatus = decision === "approved" ? "Step 6 Approved" : "Step 6 Rejected";
    const environmentStatus = decision === "approved" ? "Step 7: Pre-production Access Key" : "Step 6 Resubmission Required";
    const summary = reviewRemarks
      ? `Step 6 ${decision} by admin: ${reviewRemarks}`
      : decision === "approved"
        ? "Step 6 approved by admin."
        : "Step 6 rejected by admin and sent back to the auditor.";

    const appUpdate = await pool.query(
      `UPDATE applications
       SET current_step = GREATEST(CASE WHEN $1 = 'approved' THEN 7 ELSE current_step END, $2),
           overall_status = $3,
           environment_status = $4,
           application_summary = $5
       WHERE id = $6
       RETURNING *`,
      [decision, nextStep, overallStatus, environmentStatus, summary, req.params.id]
    );

    const refreshed = await loadStep6Submission(req.params.id);
    res.json({
      message: decision === "approved" ? "Step 6 approved and application moved to Step 7" : "Step 6 rejected and sent back for resubmission",
      application: mapApplication(appUpdate.rows[0]),
      step6: mapStep6Details(refreshed, req),
    });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Failed to review Step 6" });
  }
});
router.post("/:id/in-principle-approval", async (req, res) => {
  const { remarks, appendices, issuedByUserId } = req.body || {};

  try {
    const current = await pool.query("SELECT * FROM applications WHERE id = $1", [req.params.id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const application = current.rows[0];

    if (Number(application.current_step || 0) < 2) {
      return res.status(400).json({ message: "Application is not yet eligible for in-principle approval" });
    }

    const selectedAppendices =
      Array.isArray(appendices) && appendices.length > 0 ? appendices : STEP3_APPENDICES;
    const result = await pool.query(
      `
        UPDATE applications
        SET current_step = GREATEST(current_step, 4),
            overall_status = $1,
            environment_status = $2,
            application_summary = COALESCE($3, application_summary)
        WHERE id = $4
        RETURNING *
      `,
      [
        "In-Principle Approval Issued",
        "Step 4: ASA Agreement Execution",
        remarks ? `Step 3 issued by admin: ${remarks}` : null,
        req.params.id,
      ]
    );

    await pool.query(
      `
        INSERT INTO application_step3_actions (application_id, issued_by_user_id, remarks, appendices)
        VALUES ($1, $2, $3, $4::jsonb)
        ON CONFLICT (application_id)
        DO UPDATE SET
          issued_by_user_id = EXCLUDED.issued_by_user_id,
          remarks = EXCLUDED.remarks,
          appendices = EXCLUDED.appendices,
          issued_at = NOW(),
          updated_at = NOW()
      `,
      [req.params.id, issuedByUserId || null, remarks || null, JSON.stringify(selectedAppendices)]
    );

    res.json({
      message: "Step 3 in-principle approval letter issued",
      application: mapApplication(result.rows[0]),
      step3: {
        issuedByUserId: issuedByUserId || null,
        remarks: remarks || null,
        appendices: selectedAppendices,
      },
    });
  } catch {
    res.status(500).json({ message: "Failed to issue in-principle approval" });
  }
});

router.get("/:id/in-principle-approval", async (req, res) => {
  try {
    const action = await pool.query(
      `
        SELECT application_id, issued_by_user_id, remarks, appendices, issued_at, created_at, updated_at
        FROM application_step3_actions
        WHERE application_id = $1
        LIMIT 1
      `,
      [req.params.id]
    );

    if (action.rows.length === 0) {
      return res.json({
        step3: {
          applicationId: Number(req.params.id),
          issuedByUserId: null,
          remarks: null,
          appendices: STEP3_APPENDICES,
          issuedAt: null,
        },
      });
    }

    const row = action.rows[0];
    res.json({
      step3: {
        applicationId: row.application_id,
        issuedByUserId: row.issued_by_user_id,
        remarks: row.remarks,
        appendices: row.appendices || STEP3_APPENDICES,
        issuedAt: row.issued_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch {
    res.status(500).json({ message: "Failed to load in-principle approval details" });
  }
});

router.get("/:id/step4", async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT application_id, submitted_by_user_id, asa_agreement_ref, pbg_ref,
               asa_agreement_file_path, asa_agreement_file_name,
               pbg_file_path, pbg_file_name,
               remarks, review_status, review_remarks, reviewed_by_user_id,
               submitted_at, reviewed_at, created_at, updated_at
        FROM application_step4_actions
        WHERE application_id = $1
        LIMIT 1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.json({
        step4: {
          applicationId: Number(req.params.id),
          asaAgreementRef: null,
          pbgRef: null,
          remarks: null,
          asaAgreementFileUrl: null,
          asaAgreementFileName: null,
          pbgFileUrl: null,
          pbgFileName: null,
          reviewStatus: "pending",
          reviewRemarks: null,
          submittedAt: null,
          reviewedAt: null,
        },
      });
    }

    const row = result.rows[0];
    res.json({
      step4: {
        applicationId: row.application_id,
        submittedByUserId: row.submitted_by_user_id,
        asaAgreementRef: row.asa_agreement_ref,
        pbgRef: row.pbg_ref,
        remarks: row.remarks,
        asaAgreementFileUrl: toPublicFileUrl(req, row.asa_agreement_file_path),
        asaAgreementFileName: row.asa_agreement_file_name,
        pbgFileUrl: toPublicFileUrl(req, row.pbg_file_path),
        pbgFileName: row.pbg_file_name,
        reviewStatus: row.review_status,
        reviewRemarks: row.review_remarks,
        reviewedByUserId: row.reviewed_by_user_id,
        submittedAt: row.submitted_at,
        reviewedAt: row.reviewed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch {
    res.status(500).json({ message: "Failed to load Step 4 details" });
  }
});

router.post("/:id/step4/submit", async (req, res) => {
  const {
    submittedByUserId,
    asaAgreementRef,
    pbgRef,
    remarks,
    asaAgreementFileData,
    asaAgreementFileName,
    pbgFileData,
    pbgFileName,
  } = req.body || {};

  if (!submittedByUserId) {
    return res.status(400).json({ message: "Step 4 requires applicant user id" });
  }

  try {
    const appResult = await pool.query("SELECT * FROM applications WHERE id = $1", [req.params.id]);
    if (appResult.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const app = appResult.rows[0];
    if (Number(app.current_step || 0) < 4) {
      return res.status(400).json({ message: "Step 4 cannot be submitted before Step 3 issuance" });
    }

    const existingResult = await pool.query(
      `
        SELECT asa_agreement_file_path, asa_agreement_file_name, pbg_file_path, pbg_file_name
        FROM application_step4_actions
        WHERE application_id = $1
        LIMIT 1
      `,
      [req.params.id]
    );

    const existing = existingResult.rows[0] || {};

    let asaAgreementFilePath = existing.asa_agreement_file_path || null;
    let asaAgreementStoredName = existing.asa_agreement_file_name || null;
    let pbgFilePath = existing.pbg_file_path || null;
    let pbgStoredName = existing.pbg_file_name || null;

    if (asaAgreementFileData) {
      const saved = await savePdfDataUrl({
        dataUrl: asaAgreementFileData,
        applicationId: req.params.id,
        prefix: "asa-agreement",
        originalName: asaAgreementFileName,
      });
      asaAgreementFilePath = saved.filePath;
      asaAgreementStoredName = saved.fileName;
    }

    if (pbgFileData) {
      const saved = await savePdfDataUrl({
        dataUrl: pbgFileData,
        applicationId: req.params.id,
        prefix: "pbg",
        originalName: pbgFileName,
      });
      pbgFilePath = saved.filePath;
      pbgStoredName = saved.fileName;
    }

    if (!asaAgreementFilePath || !pbgFilePath) {
      return res.status(400).json({ message: "Upload both Signed ASA Agreement PDF and Performance Bank Guarantee PDF" });
    }

    await pool.query(
      `
        INSERT INTO application_step4_actions (
          application_id,
          submitted_by_user_id,
          asa_agreement_ref,
          pbg_ref,
          asa_agreement_file_path,
          asa_agreement_file_name,
          pbg_file_path,
          pbg_file_name,
          remarks,
          review_status,
          review_remarks,
          reviewed_by_user_id,
          submitted_at,
          reviewed_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',NULL,NULL,NOW(),NULL)
        ON CONFLICT (application_id)
        DO UPDATE SET
          submitted_by_user_id = EXCLUDED.submitted_by_user_id,
          asa_agreement_ref = EXCLUDED.asa_agreement_ref,
          pbg_ref = EXCLUDED.pbg_ref,
          asa_agreement_file_path = EXCLUDED.asa_agreement_file_path,
          asa_agreement_file_name = EXCLUDED.asa_agreement_file_name,
          pbg_file_path = EXCLUDED.pbg_file_path,
          pbg_file_name = EXCLUDED.pbg_file_name,
          remarks = EXCLUDED.remarks,
          review_status = 'pending',
          review_remarks = NULL,
          reviewed_by_user_id = NULL,
          submitted_at = NOW(),
          reviewed_at = NULL,
          updated_at = NOW()
      `,
      [
        req.params.id,
        submittedByUserId,
        asaAgreementRef || null,
        pbgRef || null,
        asaAgreementFilePath,
        asaAgreementStoredName,
        pbgFilePath,
        pbgStoredName,
        remarks || null,
      ]
    );

    const updateResult = await pool.query(
      `
        UPDATE applications
        SET current_step = GREATEST(current_step, 4),
            overall_status = $1,
            environment_status = $2,
            application_summary = COALESCE($3, application_summary)
        WHERE id = $4
        RETURNING *
      `,
      [
        "Step 4 Documents Submitted",
        "Step 4 Review Pending",
        remarks ? `Step 4 submitted by applicant: ${remarks}` : null,
        req.params.id,
      ]
    );

    res.json({
      message: "Step 4 documents submitted successfully",
      application: mapApplication(updateResult.rows[0]),
    });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Failed to submit Step 4" });
  }
});
router.post("/:id/step4/review", async (req, res) => {
  const { reviewedByUserId, decision, reviewRemarks, assignedAuditorUserId } = req.body || {};

  if (!reviewedByUserId || !decision || !["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ message: "Step 4 review requires reviewer and valid decision" });
  }

  try {
    const appResult = await pool.query("SELECT * FROM applications WHERE id = $1", [req.params.id]);
    if (appResult.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const step4Result = await pool.query(
      "SELECT * FROM application_step4_actions WHERE application_id = $1 LIMIT 1",
      [req.params.id]
    );

    if (step4Result.rows.length === 0) {
      return res.status(400).json({ message: "Step 4 has not been submitted by applicant yet" });
    }


    const currentStep4 = step4Result.rows[0];
    if (!currentStep4.asa_agreement_file_path || !currentStep4.pbg_file_path) {
      return res.status(400).json({ message: "Step 4 documents are incomplete. Applicant must upload both required PDFs." });
    }
    await pool.query(
      `
        UPDATE application_step4_actions
        SET review_status = $1,
            review_remarks = $2,
            reviewed_by_user_id = $3,
            reviewed_at = NOW(),
            updated_at = NOW()
        WHERE application_id = $4
      `,
      [decision, reviewRemarks || null, reviewedByUserId, req.params.id]
    );

    const approved = decision === "approved";
    const updateResult = await pool.query(
      `
        UPDATE applications
        SET current_step = CASE WHEN $1 THEN GREATEST(current_step, 5) ELSE GREATEST(current_step, 4) END,
            overall_status = $2,
            environment_status = $3,
            application_summary = COALESCE($4, application_summary)
        WHERE id = $5
        RETURNING *
      `,
      [
        approved,
        approved ? "Step 4 Approved" : "Step 4 Rejected - Resubmission Required",
        approved ? "Step 5: Pre-onboarding Audit" : "Step 4 Resubmission Pending",
        reviewRemarks
          ? `Step 4 ${decision} by admin: ${reviewRemarks}`
          : `Step 4 ${decision} by admin`,
        req.params.id,
      ]
    );

    res.json({
      message: approved ? "Step 4 approved and moved to Step 5" : "Step 4 rejected and sent for resubmission",
      application: mapApplication(updateResult.rows[0]),
    });
  } catch {
    res.status(500).json({ message: "Failed to review Step 4" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM applications WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ application: mapApplication(result.rows[0]) });
  } catch {
    res.status(500).json({ message: "Failed to load application" });
  }
});

router.get("/:id/declaration-pdf", async (req, res) => {
  try {
    const applicationResult = await pool.query("SELECT * FROM applications WHERE id = $1", [req.params.id]);
    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const formResult = await pool.query("SELECT payload FROM application_form_submissions WHERE application_id = $1", [req.params.id]);
    if (formResult.rows.length === 0) {
      return res.status(404).json({ message: "No saved form submission found for this application" });
    }

    buildDeclarationPdf({
      application: applicationResult.rows[0],
      payload: formResult.rows[0].payload,
      res,
    });
  } catch {
    res.status(500).json({ message: "Failed to generate declaration PDF" });
  }
});

router.post("/", async (req, res) => {
  const { organizationName, applicantName, email, mobile, organizationType, integrationModel, applicationSummary, userId } = req.body;

  if (!organizationName || !applicantName || !email || !mobile || !organizationType || !integrationModel) {
    return res.status(400).json({ message: "Missing required application fields" });
  }

  try {
    if (userId) {
      const existing = await pool.query(
        `SELECT id FROM applications WHERE created_by_user_id = $1 OR LOWER(TRIM(email)) = LOWER(TRIM($2)) LIMIT 1`,
        [userId, email]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: "You have already created an application. One user can apply only once." });
      }
    }

    const insertResult = await pool.query(
      `
        INSERT INTO applications (
          organization_name,
          applicant_name,
          email,
          mobile,
          organization_type,
          integration_model,
          current_step,
          overall_status,
          environment_status,
          application_summary,
          created_by_user_id
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *
      `,
      [
        organizationName,
        applicantName,
        email,
        mobile,
        organizationType,
        integrationModel,
        2,
        "Application ID Generated",
        "Documentation Intake",
        applicationSummary || "Application created from the ASA onboarding portal.",
        userId || null,
      ]
    );

    const inserted = insertResult.rows[0];
    const applicationId = buildApplicationId(inserted.id);
    const updateResult = await pool.query("UPDATE applications SET application_id = $1 WHERE id = $2 RETURNING *", [applicationId, inserted.id]);

    res.status(201).json({ application: mapApplication(updateResult.rows[0]) });
  } catch {
    res.status(500).json({ message: "Failed to create application" });
  }
});

router.post("/form-submission", async (req, res) => {
  const { userId, formData } = req.body;

  if (!formData?.applicantName || !formData?.typeOfApplicant || !formData?.officialEmail || !formData?.mobileNumber) {
    return res.status(400).json({ message: "Missing required ASA application form fields" });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID is required to submit application form" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingForUser = await client.query(
      `
        SELECT id
        FROM applications
        WHERE created_by_user_id = $1
           OR LOWER(TRIM(email)) = LOWER(TRIM($2))
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [userId, formData.officialEmail]
    );

    if (existingForUser.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "You have already submitted an application. One user can apply only once." });
    }

    const applicationInsert = await client.query(
      `
        INSERT INTO applications (
          organization_name,
          applicant_name,
          email,
          mobile,
          organization_type,
          integration_model,
          current_step,
          overall_status,
          environment_status,
          application_summary,
          created_by_user_id
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *
      `,
      [
        formData.applicantName,
        formData.applicantName,
        formData.officialEmail,
        formData.mobileNumber,
        formData.typeOfApplicant,
        formData.connectivityType || "Application Form Submission",
        2,
        "Application ID Generated",
        "Documentation Intake",
        `Original 5-step ASA form submitted by ${formData.applicantName}`,
        userId || null,
      ]
    );

    const inserted = applicationInsert.rows[0];
    const applicationId = buildApplicationId(inserted.id);
    const updatedApplication = await client.query("UPDATE applications SET application_id = $1 WHERE id = $2 RETURNING *", [applicationId, inserted.id]);

    await client.query(
      `
        INSERT INTO application_form_submissions (application_id, submitted_by_user_id, payload)
        VALUES ($1, $2, $3::jsonb)
      `,
      [inserted.id, userId || null, JSON.stringify(formData)]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "ASA application form submitted successfully",
      application: mapApplication(updatedApplication.rows[0]),
    });
  } catch {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "Failed to submit ASA application form" });
  } finally {
    client.release();
  }
});

export default router;










function buildInPrincipleApprovalLetterPdf({ application, step3, res }) {
  const issuedAt = step3?.issued_at || new Date();
  const remarks = step3?.remarks || "No additional remarks provided.";
  const appendices =
    Array.isArray(step3?.appendices) && step3.appendices.length > 0
      ? step3.appendices
      : STEP3_APPENDICES;

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=\"" + (application.application_id || ("ASA-" + application.id)) + "-in-principle-approval-letter.pdf\""
  );
  doc.pipe(res);

  doc.fontSize(18).font("Helvetica-Bold").text("In-Principle Approval Letter", { align: "center" });
  doc.moveDown(0.4);
  doc.fontSize(10).font("Helvetica").fillColor("#444444").text("UIDAI ASA Onboarding Portal", { align: "center" });
  doc.fillColor("#000000");
  doc.moveDown(1.1);

  doc.fontSize(11).font("Helvetica");
  doc.text("Date: " + formatDate(issuedAt));
  doc.moveDown(0.5);
  doc.text("To,");
  doc.text(application.applicant_name || "Applicant");
  doc.text(application.organization_name || "Organization");
  doc.moveDown(0.8);

  doc
    .font("Helvetica-Bold")
    .text("Subject: In-Principle Approval for ASA Onboarding (" + (application.application_id || "Pending") + ")");
  doc.moveDown(0.7);

  doc
    .font("Helvetica")
    .text(
      "This is to inform you that your application for ASA onboarding has been granted in-principle approval, subject to compliance with UIDAI terms, timelines, and submission of required documents.",
      { align: "justify" }
    );
  doc.moveDown(0.8);

  doc.font("Helvetica-Bold").text("Application Details");
  doc.moveDown(0.3);
  doc.font("Helvetica").text("Application ID: " + (application.application_id || "-"));
  doc.text("Applicant Name: " + (application.applicant_name || "-"));
  doc.text("Organization: " + (application.organization_name || "-"));
  doc.text("Official Email: " + (application.email || "-"));
  doc.text("Official Mobile: " + (application.mobile || "-"));
  doc.moveDown(0.8);

  doc.font("Helvetica-Bold").text("Appendices Issued");
  doc.moveDown(0.3);
  appendices.forEach((item, index) => {
    doc.font("Helvetica").text((index + 1) + ". " + item);
  });
  doc.moveDown(0.8);

  doc.font("Helvetica-Bold").text("Admin Remarks");
  doc.moveDown(0.3);
  doc.font("Helvetica").text(remarks, { align: "justify" });
  doc.moveDown(1.2);

  doc.font("Helvetica").text("For UIDAI Onboarding Administration");
  doc.moveDown(1.4);
  doc.text("Authorized Signatory");
  doc.moveDown(0.4);
  doc.text("Issued on: " + formatDate(issuedAt));

  doc.end();
}

router.get("/:id/in-principle-approval-letter-pdf", async (req, res) => {
  try {
    const applicationResult = await pool.query("SELECT * FROM applications WHERE id = $1", [req.params.id]);
    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const step3Result = await pool.query(
      `
        SELECT application_id, issued_by_user_id, remarks, appendices, issued_at, created_at, updated_at
        FROM application_step3_actions
        WHERE application_id = $1
        LIMIT 1
      `,
      [req.params.id]
    );

    if (step3Result.rows.length === 0) {
      return res.status(400).json({ message: "In-principle approval letter has not been issued yet" });
    }

    buildInPrincipleApprovalLetterPdf({
      application: applicationResult.rows[0],
      step3: step3Result.rows[0],
      res,
    });
  } catch {
    res.status(500).json({ message: "Failed to generate in-principle approval letter PDF" });
  }
});



















