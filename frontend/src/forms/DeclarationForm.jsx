import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Eraser, PenTool, ShieldCheck } from "lucide-react";

const inputClass = "w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40";
const labelClass = "mb-2 block text-sm font-semibold text-[#2e2e38]";
const checkWrapClass = "flex items-start gap-4 rounded-2xl border border-[#e4e0d6] bg-[#fbfaf6] px-4 py-4";
const undertakingClauses = [
  "to abide by the provisions of the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016 (\"Aadhaar Act\") and the regulations made thereunder;",
  "to facilitate, on receipt of in-principle approval from UIDAI, audit as per UIDAI Compliance Checklist for onboarding the ASA and submit all compliance related documents attached as annexure before signing the ASA Agreement;",
  "to fulfil all requirements with respect to use of the Aadhaar Authentication facility as per the Aadhaar (Authentication and Offline Verification) Regulations, 2021 including financial and technical requirements defined in Schedule A;",
  "to set up and maintain within the territory of India, at all times, requisite infrastructure including servers, databases and related systems for use of Aadhaar Authentication facilities, capable of handling authentication transactions of AUA or KUA and their Sub-AUAs or Sub-KUAs with minimum additional capacity of 25%, maintaining logs and white listed IP addresses;",
  "to ensure carrying out of audit of its own operations and systems, as required under the Aadhaar Act, the regulations made thereunder and the ASA Agreement;",
  "to ensure roles, responsibilities and code of conduct of ASA, as required under the Aadhaar Act, the regulations made thereunder and the ASA Agreement;",
  "to inform UIDAI forthwith of any change in the name, address and other particulars of the applicant and contact person as furnished in this application form.",
];

function DeclarationForm({ activeStep, formData, onFieldChange, submitting }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [isSigned, setIsSigned] = useState(Boolean(formData.signatureDataUrl));

  const storedUser = getStoredUser();
  const expectedSignerName = storedUser?.fullname || formData.authorizedSignatoryName || formData.applicantName;
  const expectedSignerEmail = storedUser?.email || formData.officialEmail;
  const expectedSignerPhone = storedUser?.mobile || formData.mobileNumber;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    context.lineWidth = 2.2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#1f1f1f";

    clearCanvas(context, canvas);

    if (formData.signatureDataUrl) {
      const image = new Image();
      image.onload = () => {
        clearCanvas(context, canvas);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        setIsSigned(true);
      };
      image.src = formData.signatureDataUrl;
    }
  }, [formData.signatureDataUrl]);

  useEffect(() => {
    if (!formData.declarantEmail && expectedSignerEmail) {
      onFieldChange("declarantEmail", expectedSignerEmail);
    }
    if (!formData.declarantPhone && expectedSignerPhone) {
      onFieldChange("declarantPhone", expectedSignerPhone);
    }
  }, [expectedSignerEmail, expectedSignerPhone, formData.declarantEmail, formData.declarantPhone, onFieldChange]);

  function pointerPosition(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const source = event.touches?.[0] || event;
    return {
      x: source.clientX - rect.left,
      y: source.clientY - rect.top,
    };
  }

  function startDrawing(event) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const { x, y } = pointerPosition(event);
    drawingRef.current = true;
    context.beginPath();
    context.moveTo(x, y);
    event.preventDefault();
  }

  function draw(event) {
    const canvas = canvasRef.current;
    if (!canvas || !drawingRef.current) return;
    const context = canvas.getContext("2d");
    const { x, y } = pointerPosition(event);
    context.lineTo(x, y);
    context.stroke();
    setIsSigned(true);
    event.preventDefault();
  }

  function endDrawing() {
    const canvas = canvasRef.current;
    if (!canvas || !drawingRef.current) return;
    drawingRef.current = false;
    onFieldChange("signatureDataUrl", canvas.toDataURL("image/png"));
  }

  function handleClearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    clearCanvas(context, canvas);
    setIsSigned(false);
    onFieldChange("signatureDataUrl", "");
    onFieldChange("signatureAuthenticated", false);
    onFieldChange("signatureAuthenticatedAt", "");
    onFieldChange("signatureAuthMode", "");
    onFieldChange("signatureDescription", "");
    onFieldChange("declarantName", "");
  }

  function handleAuthenticateSignature() {
    const typedName = formData.signatureTypedName.trim();
    const expectedName = expectedSignerName?.trim();

    if (!isSigned) {
      alert("Please sign in the signature space before authenticating the declaration.");
      return;
    }

    if (!typedName) {
      alert("Please enter the authorised signatory name for authentication.");
      return;
    }

    if (!expectedName) {
      alert("The applicant or logged-in user name is missing, so the signature cannot be authenticated yet.");
      return;
    }

    if (normalizeName(typedName) !== normalizeName(expectedName)) {
      alert("The signatory name entered for authentication must match the logged-in applicant or authorised signatory name.");
      return;
    }

    if (!formData.declarantDesignation.trim()) {
      alert("Please enter the full designation of the authorised signatory before authentication.");
      return;
    }

    if (!formData.declarationPlace.trim()) {
      alert("Please enter the place of declaration before authentication.");
      return;
    }

    const timestamp = new Date().toISOString();
    onFieldChange("declarantName", expectedName);
    onFieldChange("authorizedSignatoryName", expectedName);
    onFieldChange("signatureAuthenticated", true);
    onFieldChange("signatureAuthenticatedAt", timestamp);
    onFieldChange("signatureAuthMode", "Drawn signature verified against applicant signatory name");
    onFieldChange("signatureDescription", `Authenticated signature of ${expectedName} captured on ${new Date(timestamp).toLocaleString("en-IN")}`);

    if (!formData.declarantEmail && expectedSignerEmail) {
      onFieldChange("declarantEmail", expectedSignerEmail);
    }
    if (!formData.declarantPhone && expectedSignerPhone) {
      onFieldChange("declarantPhone", expectedSignerPhone);
    }

    alert("Signature authenticated. The authorised signatory name has been filled automatically.");
  }

  if (activeStep !== 5) return null;

  return (
    <div id="step-5">
      <div className="mb-8 flex flex-col gap-2 border-b border-[#e4e0d6] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6c6c73]">Section 5</p>
        <h3 className="text-xl font-bold text-[#1f1f1f]">Declaration And Final Submission</h3>
        <p className="text-sm text-[#5f6368]">The declaration block below now follows the UIDAI circular wording and requires an authenticated authorised-signatory signature before final submission.</p>
      </div>

      <div className="space-y-8">
        <section className="rounded-[24px] border border-[#e4e0d6] bg-[#fbfaf6] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-lg font-semibold text-[#2e2e38]">Declarations And Undertakings</h4>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5f6368]">This section uses the declaration language you shared from the circular and maps it into the ASA application submission flow.</p>
            </div>
            <div className="rounded-2xl bg-[#2e2e38] px-4 py-3 text-[#ffe600]">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck size={16} />
                UIDAI Format
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[22px] border border-[#ece6d7] bg-white p-6">
            <p className="text-sm leading-7 text-[#2e2e38]">
              It is hereby declared that the information furnished in this application form is true and correct to the best of its knowledge and that no material particulars or information have been concealed or withheld, and that the
              <span className="mx-2 inline-flex min-w-[220px] rounded-lg border-b-2 border-dashed border-[#2e2e38] px-2 py-1 font-semibold text-[#1f1f1f]">
                {formData.applicantName || "Name of applicant"}
              </span>
              hereby undertakes:
            </p>

            <div className="mt-5 space-y-4">
              {undertakingClauses.map((clause, index) => (
                <div key={clause} className="flex gap-3 text-sm leading-7 text-[#2e2e38]">
                  <span className="mt-1 font-semibold text-[#1f1f1f]">({String.fromCharCode(97 + index)})</span>
                  <p>{clause}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 rounded-[20px] border border-[#efe8d6] bg-[#fcfbf7] p-5 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#6c6c73]">Signature block</p>
                <p className="mt-2 text-sm font-semibold text-[#1f1f1f]">Signature with stamp or seal of authorised signatory</p>
              </div>
              <div className="space-y-3 text-sm text-[#2e2e38]">
                <p><span className="font-semibold">Name:</span> {formData.declarantName || "Will auto-fill after signature authentication"}</p>
                <p><span className="font-semibold">Full designation:</span> {formData.declarantDesignation || "To be completed"}</p>
                <p><span className="font-semibold">Date:</span> {formData.declarationDate || "To be selected"}</p>
                <p><span className="font-semibold">Place:</span> {formData.declarationPlace || "To be entered"}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className={checkWrapClass}><input required type="checkbox" checked={formData.declarationTruthful} onChange={(e) => onFieldChange("declarationTruthful", e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#2e2e38] text-[#ffe600] focus:ring-[#ffe600]" /><span className="text-sm leading-relaxed text-[#2e2e38]">I confirm that the information furnished in the application form is true and correct and that no material particulars have been concealed or withheld.</span></label>
            <label className={checkWrapClass}><input required type="checkbox" checked={formData.declarationCapacity} onChange={(e) => onFieldChange("declarationCapacity", e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#2e2e38] text-[#ffe600] focus:ring-[#ffe600]" /><span className="text-sm leading-relaxed text-[#2e2e38]">I confirm that the applicant entity will fulfil the operational, technical, infrastructure and audit obligations stated in this declaration.</span></label>
            <label className={checkWrapClass}><input required type="checkbox" checked={formData.declarationLawCompliance} onChange={(e) => onFieldChange("declarationLawCompliance", e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#2e2e38] text-[#ffe600] focus:ring-[#ffe600]" /><span className="text-sm leading-relaxed text-[#2e2e38]">I agree that the applicant shall abide by the Aadhaar Act, the applicable regulations, the ASA Agreement and UIDAI directions.</span></label>
            <label className={checkWrapClass}><input required type="checkbox" checked={formData.declarationFalseInfo} onChange={(e) => onFieldChange("declarationFalseInfo", e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#2e2e38] text-[#ffe600] focus:ring-[#ffe600]" /><span className="text-sm leading-relaxed text-[#2e2e38]">I understand that any false or misleading information may lead to rejection, revocation, forfeiture or legal action.</span></label>
            <label className={checkWrapClass}><input required type="checkbox" checked={formData.declarationTermsPrivacy} onChange={(e) => onFieldChange("declarationTermsPrivacy", e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#2e2e38] text-[#ffe600] focus:ring-[#ffe600]" /><span className="text-sm leading-relaxed text-[#2e2e38]">I authorise UIDAI to rely on this digitally authenticated signature and the signatory details captured in this portal submission.</span></label>
            <label className={checkWrapClass}><input required type="checkbox" checked={formData.declarationDataSecurity} onChange={(e) => onFieldChange("declarationDataSecurity", e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#2e2e38] text-[#ffe600] focus:ring-[#ffe600]" /><span className="text-sm leading-relaxed text-[#2e2e38]">I confirm that the applicant will maintain infrastructure, logs, white-listed IP controls and information security safeguards as required by UIDAI.</span></label>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e4e0d6] bg-[#fbfaf6] p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-[#2e2e38]">Authorised Signature Authentication</h4>
              <p className="mt-2 text-sm text-[#5f6368]">Sign in the declaration space, enter the authorised signatory name, and authenticate it. On successful verification, the name field is filled automatically.</p>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${formData.signatureAuthenticated ? "bg-[#e7f6e7] text-[#1d5f2f]" : "bg-[#fff7cc] text-[#6e5d00]"}`}>
              <BadgeCheck size={16} />
              {formData.signatureAuthenticated ? "Signature Authenticated" : "Authentication Pending"}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[24px] border border-[#e4e0d6] bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#2e2e38]">
                  <PenTool size={16} />
                  Signature Space
                </div>
                <button type="button" onClick={handleClearSignature} className="inline-flex items-center gap-2 rounded-xl border border-[#d9d5cc] px-3 py-2 text-sm font-semibold text-[#2e2e38] transition hover:bg-[#f7f5ef]">
                  <Eraser size={14} />
                  Clear
                </button>
              </div>

              <div className="mt-4 overflow-hidden rounded-[22px] border-2 border-dashed border-[#d9d5cc] bg-[#fcfbf7] p-3">
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={220}
                  className="h-[220px] w-full touch-none rounded-[18px] bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={endDrawing}
                />
              </div>
              <p className="mt-3 text-xs text-[#6c6c73]">Use mouse or touch to sign inside the box. If you clear the signature, authentication will reset.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Name Used For Signature Authentication *</label>
                <input
                  required
                  type="text"
                  value={formData.signatureTypedName}
                  onChange={(e) => {
                    onFieldChange("signatureTypedName", e.target.value);
                    if (formData.signatureAuthenticated) {
                      onFieldChange("signatureAuthenticated", false);
                      onFieldChange("signatureAuthenticatedAt", "");
                      onFieldChange("signatureAuthMode", "");
                      onFieldChange("signatureDescription", "");
                      onFieldChange("declarantName", "");
                    }
                  }}
                  placeholder={expectedSignerName || "Enter authorised signatory name"}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Authorised Signatory Name *</label>
                <input required readOnly type="text" value={formData.declarantName} placeholder="Will auto-fill after authentication" className={`${inputClass} bg-[#f2f1ec]`} />
              </div>
              <div>
                <label className={labelClass}>Full Designation *</label>
                <input required type="text" value={formData.declarantDesignation} onChange={(e) => onFieldChange("declarantDesignation", e.target.value)} placeholder="Full designation" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Declarant Email *</label>
                <input required type="email" value={formData.declarantEmail} onChange={(e) => onFieldChange("declarantEmail", e.target.value)} placeholder="Email address" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Declarant Phone *</label>
                <input required type="tel" inputMode="numeric" value={formData.declarantPhone} onChange={(e) => onFieldChange("declarantPhone", e.target.value)} placeholder="Phone number" className={inputClass} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Date *</label>
                  <input required type="date" value={formData.declarationDate} onChange={(e) => onFieldChange("declarationDate", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Place *</label>
                  <input required type="text" value={formData.declarationPlace} onChange={(e) => onFieldChange("declarationPlace", e.target.value)} placeholder="Place" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Authentication Notes</label>
                <textarea readOnly rows="3" value={formData.signatureDescription} placeholder="Authentication details will appear here" className={`${inputClass} bg-[#f2f1ec]`} />
              </div>
              <input type="text" required readOnly value={formData.signatureAuthenticated ? "verified" : ""} className="sr-only" tabIndex="-1" aria-hidden="true" />
              <button type="button" onClick={handleAuthenticateSignature} className="w-full rounded-2xl bg-[#2e2e38] px-5 py-3 font-semibold text-[#ffe600] shadow-lg transition hover:bg-[#1f1f1f]">
                Authenticate Signature
              </button>
              {formData.signatureAuthenticatedAt && (
                <p className="rounded-2xl border border-[#d7ead7] bg-[#eef8ee] px-4 py-3 text-sm text-[#1d5f2f]">
                  Authenticated on {new Date(formData.signatureAuthenticatedAt).toLocaleString("en-IN")} using {formData.signatureAuthMode}.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-10 flex justify-between border-t border-[#e4e0d6] pt-6">
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("changeStep", { detail: activeStep - 1 }))} className="rounded-2xl bg-[#8a8a90] px-8 py-3 font-semibold text-white transition hover:bg-[#6c6c73]">Previous</button>
        <button type="submit" disabled={submitting} className="rounded-2xl bg-[#2e2e38] px-8 py-3 font-semibold text-[#ffe600] shadow-lg transition hover:bg-[#1f1f1f] disabled:cursor-not-allowed disabled:opacity-70">{submitting ? "Submitting..." : "Submit Application"}</button>
      </div>
    </div>
  );
}

function clearCanvas(context, canvas) {
  context.fillStyle = "#ffffff";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export default DeclarationForm;
