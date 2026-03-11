const inputClass = "w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40";
const labelClass = "mb-2 block text-sm font-semibold text-[#2e2e38]";
const sectionTitleClass = "text-xl font-bold text-[#1f1f1f]";

function ContactDetails({ activeStep, formData, onFieldChange }) {
  if (activeStep !== 2) return null;

  return (
    <div id="step-2">
      <div className="mb-8 flex flex-col gap-2 border-b border-[#e4e0d6] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6c6c73]">Section 2</p>
        <h3 className={sectionTitleClass}>Contact And Governance Details</h3>
        <p className="text-sm text-[#5f6368]">Define the primary operational contacts, security owners, and grievance redressal points for the ASA application.</p>
      </div>

      <div className="space-y-8">
        <section className="rounded-[24px] border border-[#e4e0d6] bg-[#fbfaf6] p-6">
          <h4 className="mb-5 text-lg font-semibold text-[#2e2e38]">Key Managerial Personnel (KMP)</h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div><label className={labelClass}>KMP Name</label><input required type="text" value={formData.kmpName} onChange={(e) => onFieldChange("kmpName", e.target.value)} placeholder="Name" className={inputClass} /></div>
            <div><label className={labelClass}>Full Designation</label><input type="text" value={formData.kmpDesignation} onChange={(e) => onFieldChange("kmpDesignation", e.target.value)} placeholder="Full designation" className={inputClass} /></div>
            <div><label className={labelClass}>Official Email Address</label><input required type="email" value={formData.officialEmail} onChange={(e) => onFieldChange("officialEmail", e.target.value)} placeholder="Email address" className={inputClass} /></div>
            <div><label className={labelClass}>Mobile Number</label><input required type="tel" value={formData.mobileNumber} onChange={(e) => onFieldChange("mobileNumber", e.target.value)} placeholder="Mobile number" className={inputClass} /></div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e4e0d6] bg-[#fbfaf6] p-6">
          <h4 className="mb-5 text-lg font-semibold text-[#2e2e38]">Chief Information Security Officer (CISO)</h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div><label className={labelClass}>CISO Name</label><input required type="text" value={formData.cisoName} onChange={(e) => onFieldChange("cisoName", e.target.value)} placeholder="Name" className={inputClass} /></div>
            <div><label className={labelClass}>Full Designation</label><input type="text" value={formData.cisoDesignation} onChange={(e) => onFieldChange("cisoDesignation", e.target.value)} placeholder="Full designation" className={inputClass} /></div>
            <div><label className={labelClass}>Official Email Address</label><input required type="email" value={formData.cisoEmail} onChange={(e) => onFieldChange("cisoEmail", e.target.value)} placeholder="Email address" className={inputClass} /></div>
            <div><label className={labelClass}>Mobile Number</label><input required type="tel" value={formData.cisoMobile} onChange={(e) => onFieldChange("cisoMobile", e.target.value)} placeholder="Mobile number" className={inputClass} /></div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e4e0d6] bg-[#fbfaf6] p-6">
          <h4 className="mb-5 text-lg font-semibold text-[#2e2e38]">Management And Technical Contacts</h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div><label className={labelClass}>MPOC Name</label><input required type="text" value={formData.mpocName} onChange={(e) => onFieldChange("mpocName", e.target.value)} placeholder="Name" className={inputClass} /></div>
            <div><label className={labelClass}>MPOC Designation</label><input type="text" value={formData.mpocDesignation} onChange={(e) => onFieldChange("mpocDesignation", e.target.value)} placeholder="Full designation" className={inputClass} /></div>
            <div><label className={labelClass}>MPOC Email</label><input required type="email" value={formData.mpocEmail} onChange={(e) => onFieldChange("mpocEmail", e.target.value)} placeholder="Email address" className={inputClass} /></div>
            <div><label className={labelClass}>MPOC Mobile</label><input required type="tel" value={formData.mpocMobile} onChange={(e) => onFieldChange("mpocMobile", e.target.value)} placeholder="Mobile number" className={inputClass} /></div>
            <div><label className={labelClass}>TPOC Name</label><input type="text" value={formData.tpocName} onChange={(e) => onFieldChange("tpocName", e.target.value)} placeholder="Name" className={inputClass} /></div>
            <div><label className={labelClass}>TPOC Designation</label><input type="text" value={formData.tpocDesignation} onChange={(e) => onFieldChange("tpocDesignation", e.target.value)} placeholder="Full designation" className={inputClass} /></div>
            <div><label className={labelClass}>TPOC Email</label><input type="email" value={formData.tpocEmail} onChange={(e) => onFieldChange("tpocEmail", e.target.value)} placeholder="Email address" className={inputClass} /></div>
            <div><label className={labelClass}>TPOC Mobile</label><input type="tel" value={formData.tpocMobile} onChange={(e) => onFieldChange("tpocMobile", e.target.value)} placeholder="Mobile number" className={inputClass} /></div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e4e0d6] bg-[#fbfaf6] p-6">
          <h4 className="mb-5 text-lg font-semibold text-[#2e2e38]">Grievance Redressal Details</h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div><label className={labelClass}>Website URL</label><input required type="url" value={formData.websiteUrl} onChange={(e) => onFieldChange("websiteUrl", e.target.value)} placeholder="Website URL" className={inputClass} /></div>
            <div><label className={labelClass}>Email Address</label><input required type="email" value={formData.grievanceEmail} onChange={(e) => onFieldChange("grievanceEmail", e.target.value)} placeholder="Grievance email" className={inputClass} /></div>
            <div><label className={labelClass}>Helpdesk Number</label><input type="tel" value={formData.helpdeskNumber} onChange={(e) => onFieldChange("helpdeskNumber", e.target.value)} placeholder="Helpdesk number" className={inputClass} /></div>
            <div><label className={labelClass}>Grievance Officer Name</label><input required type="text" value={formData.grievanceOfficerName} onChange={(e) => onFieldChange("grievanceOfficerName", e.target.value)} placeholder="Officer name" className={inputClass} /></div>
            <div><label className={labelClass}>Officer Mobile</label><input required type="tel" inputMode="numeric" value={formData.grievanceOfficerMobile} onChange={(e) => onFieldChange("grievanceOfficerMobile", e.target.value)} placeholder="Officer mobile" className={inputClass} /></div>
            <div><label className={labelClass}>Officer E-Mail ID</label><input required type="email" value={formData.grievanceOfficerEmail} onChange={(e) => onFieldChange("grievanceOfficerEmail", e.target.value)} placeholder="Officer email" className={inputClass} /></div>
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

export default ContactDetails;
