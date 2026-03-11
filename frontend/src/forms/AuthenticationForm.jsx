const inputClass = "w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40";
const labelClass = "mb-2 block text-sm font-semibold text-[#2e2e38]";
const checkWrapClass = "flex items-start gap-4 rounded-2xl border border-[#e4e0d6] bg-[#fbfaf6] px-4 py-4";

function AuthenticationForm({ activeStep, formData, onFieldChange }) {
  if (activeStep !== 4) return null;

  return (
    <div id="step-4">
      <div className="mb-8 flex flex-col gap-2 border-b border-[#e4e0d6] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6c6c73]">Section 4</p>
        <h3 className="text-xl font-bold text-[#1f1f1f]">Authentication And Authorization</h3>
        <p className="text-sm text-[#5f6368]">Confirm organizational readiness and provide the authorized officer responsible for this submission.</p>
      </div>

      <div className="space-y-8">
        <section className="rounded-[24px] border border-[#e4e0d6] bg-[#fbfaf6] p-6">
          <h4 className="mb-5 text-lg font-semibold text-[#2e2e38]">Authentication Requirements</h4>
          <div className="space-y-4">
            <label className={checkWrapClass}><input required type="checkbox" checked={formData.declarationAuthorized} onChange={(e) => onFieldChange("declarationAuthorized", e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#2e2e38] text-[#ffe600] focus:ring-[#ffe600]" /><span className="text-sm font-medium text-[#2e2e38]">Applicant is authorized to submit this application</span></label>
            <label className={checkWrapClass}><input required type="checkbox" checked={formData.declarationAccurate} onChange={(e) => onFieldChange("declarationAccurate", e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#2e2e38] text-[#ffe600] focus:ring-[#ffe600]" /><span className="text-sm font-medium text-[#2e2e38]">All information provided is accurate and true</span></label>
            <label className={checkWrapClass}><input required type="checkbox" checked={formData.declarationCompliant} onChange={(e) => onFieldChange("declarationCompliant", e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#2e2e38] text-[#ffe600] focus:ring-[#ffe600]" /><span className="text-sm font-medium text-[#2e2e38]">Organization complies with data protection regulations</span></label>
            <label className={checkWrapClass}><input required type="checkbox" checked={formData.declarationSecurity} onChange={(e) => onFieldChange("declarationSecurity", e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#2e2e38] text-[#ffe600] focus:ring-[#ffe600]" /><span className="text-sm font-medium text-[#2e2e38]">Organization has adequate security infrastructure</span></label>
            <label className={checkWrapClass}><input required type="checkbox" checked={formData.declarationTerms} onChange={(e) => onFieldChange("declarationTerms", e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#2e2e38] text-[#ffe600] focus:ring-[#ffe600]" /><span className="text-sm font-medium text-[#2e2e38]">Organization understands the terms and conditions</span></label>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e4e0d6] bg-[#fbfaf6] p-6">
          <h4 className="mb-5 text-lg font-semibold text-[#2e2e38]">Authorized Officer Details</h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div><label className={labelClass}>Officer Name *</label><input required type="text" value={formData.officerName} onChange={(e) => onFieldChange("officerName", e.target.value)} placeholder="Full name of authorized officer" className={inputClass} /></div>
            <div><label className={labelClass}>Officer Designation *</label><input required type="text" value={formData.officerDesignation} onChange={(e) => onFieldChange("officerDesignation", e.target.value)} placeholder="Designation" className={inputClass} /></div>
            <div><label className={labelClass}>Officer Email *</label><input required type="email" value={formData.officerEmail} onChange={(e) => onFieldChange("officerEmail", e.target.value)} placeholder="Email address" className={inputClass} /></div>
            <div><label className={labelClass}>Officer Phone *</label><input required type="tel" inputMode="numeric" value={formData.officerPhone} onChange={(e) => onFieldChange("officerPhone", e.target.value)} placeholder="Phone number" className={inputClass} /></div>
          </div>
        </section>
      </div>

      <div className="mt-10 flex justify-between border-t border-[#e4e0d6] pt-6">
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("changeStep", { detail: activeStep - 1 }))} className="rounded-2xl bg-[#8a8a90] px-8 py-3 font-semibold text-white transition hover:bg-[#6c6c73]">Previous</button>
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("changeStep", { detail: activeStep + 1 }))} className="rounded-2xl bg-[#2e2e38] px-8 py-3 font-semibold text-[#ffe600] shadow-lg transition hover:bg-[#1f1f1f]">Next</button>
      </div>
    </div>
  );
}

export default AuthenticationForm;
