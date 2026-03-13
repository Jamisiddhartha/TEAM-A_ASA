import express from "express";
import PDFDocument from "pdfkit";
import pool from "../config/db.js";

const router = express.Router();

const STEP3_APPENDICES = [
  "ASA Agreement V 6.0",
  "Invoice for payment of Initial License Fee",
  "Performance Bank Guarantee",
  "Pre-onboarding Audit Compliance Checklist",
  "Onboarding Audit Compliance Checklist",
];

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








