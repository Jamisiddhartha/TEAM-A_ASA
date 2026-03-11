import express from "express";
import PDFDocument from "pdfkit";
import pool from "../config/db.js";

const router = express.Router();

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

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM applications ORDER BY created_at DESC");
    res.json({ applications: result.rows.map((row) => mapApplication(row)) });
  } catch {
    res.status(500).json({ message: "Failed to load applications" });
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
  const { organizationName, applicantName, email, mobile, organizationType, integrationModel, applicationSummary } = req.body;

  if (!organizationName || !applicantName || !email || !mobile || !organizationType || !integrationModel) {
    return res.status(400).json({ message: "Missing required application fields" });
  }

  try {
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
          application_summary
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
      `,
      [organizationName, applicantName, email, mobile, organizationType, integrationModel, 2, "Application ID Generated", "Documentation Intake", applicationSummary || "Application created from the ASA onboarding portal."]
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

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

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
