const inputClass = "w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40";
const labelClass = "mb-2 block text-sm font-semibold text-[#2e2e38]";
const sectionTitleClass = "text-xl font-bold text-[#1f1f1f]";

function ASADetailsForm({ activeStep, formData, onFieldChange }) {
  if (activeStep !== 3) return null;

  return (
    <div id="step-3">
      <div className="mb-8 flex flex-col gap-2 border-b border-[#e4e0d6] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6c6c73]">Section 3</p>
        <h3 className={sectionTitleClass}>ASA Infrastructure And Connectivity</h3>
        <p className="text-sm text-[#5f6368]">Capture data centre locations, network configuration, routing, and expected authentication volumes.</p>
      </div>

      <div className="space-y-8">
        <section className="rounded-[24px] border border-[#e4e0d6] bg-[#fbfaf6] p-6">
          <h4 className="mb-5 text-lg font-semibold text-[#2e2e38]">Proposed ASA Server Location(s)</h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2"><label className={labelClass}>District (Primary DC)</label><input required type="text" value={formData.primaryDistrict} onChange={(e) => onFieldChange("primaryDistrict", e.target.value)} placeholder="District name" className={inputClass} /></div>
            <div><label className={labelClass}>State</label><select required value={formData.primaryState} onChange={(e) => onFieldChange("primaryState", e.target.value)} className={inputClass}><option value="">Select State</option><option>Andhra Pradesh</option><option>Arunachal Pradesh</option><option>Assam</option><option>Bihar</option><option>Chhattisgarh</option><option>Goa</option><option>Gujarat</option><option>Haryana</option><option>Himachal Pradesh</option><option>Jharkhand</option><option>Karnataka</option><option>Kerala</option><option>Madhya Pradesh</option><option>Maharashtra</option><option>Manipur</option><option>Meghalaya</option><option>Mizoram</option><option>Nagaland</option><option>Odisha</option><option>Punjab</option><option>Rajasthan</option><option>Sikkim</option><option>Tamil Nadu</option><option>Telangana</option><option>Tripura</option><option>Uttar Pradesh</option><option>Uttarakhand</option><option>West Bengal</option><option>Andaman and Nicobar Islands</option><option>Chandigarh</option><option>Dadra and Nagar Haveli and Daman and Diu</option><option>Lakshadweep</option><option>Delhi</option><option>Puducherry</option><option>Ladakh</option><option>Jammu and Kashmir</option></select></div>
            <div><label className={labelClass}>Country</label><input type="text" value={formData.primaryCountry} onChange={(e) => onFieldChange("primaryCountry", e.target.value)} placeholder="Country" className={inputClass} /></div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e4e0d6] bg-[#fbfaf6] p-6">
          <h4 className="mb-5 text-lg font-semibold text-[#2e2e38]">Primary And DR Data Centres</h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div><label className={labelClass}>Primary MPOC/TPOC Name</label><input required type="text" value={formData.primaryDcContactName} onChange={(e) => onFieldChange("primaryDcContactName", e.target.value)} placeholder="Name" className={inputClass} /></div>
            <div><label className={labelClass}>Primary Email Address</label><input required type="email" value={formData.primaryDcEmail} onChange={(e) => onFieldChange("primaryDcEmail", e.target.value)} placeholder="Email" className={inputClass} /></div>
            <div><label className={labelClass}>Primary Telephone/Mobile No.</label><input required type="tel" value={formData.primaryDcPhone} onChange={(e) => onFieldChange("primaryDcPhone", e.target.value)} placeholder="Phone number" className={inputClass} /></div>
            <div><label className={labelClass}>Primary Address</label><input type="text" value={formData.primaryDcAddress} onChange={(e) => onFieldChange("primaryDcAddress", e.target.value)} placeholder="DC Address" className={inputClass} /></div>
            <div><label className={labelClass}>DR District</label><input required type="text" value={formData.drDistrict} onChange={(e) => onFieldChange("drDistrict", e.target.value)} placeholder="District" className={inputClass} /></div>
            <div><label className={labelClass}>DR MPOC/TPOC Name</label><input required type="text" value={formData.drContactName} onChange={(e) => onFieldChange("drContactName", e.target.value)} placeholder="Name" className={inputClass} /></div>
            <div><label className={labelClass}>DR Email Address</label><input required type="email" value={formData.drEmail} onChange={(e) => onFieldChange("drEmail", e.target.value)} placeholder="Email" className={inputClass} /></div>
            <div><label className={labelClass}>DR Telephone/Mobile No.</label><input required type="tel" inputMode="numeric" value={formData.drPhone} onChange={(e) => onFieldChange("drPhone", e.target.value)} placeholder="Phone number" className={inputClass} /></div>
            <div className="md:col-span-2"><label className={labelClass}>DR Address</label><input type="text" value={formData.drAddress} onChange={(e) => onFieldChange("drAddress", e.target.value)} placeholder="DR Address" className={inputClass} /></div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e4e0d6] bg-[#fbfaf6] p-6">
          <h4 className="mb-5 text-lg font-semibold text-[#2e2e38]">Leased Lines And Routing</h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div><label className={labelClass}>No. of Leased Lines at UIDAI DC</label><select value={formData.leasedLineCount} onChange={(e) => onFieldChange("leasedLineCount", e.target.value)} className={inputClass}><option value="">Select option</option><option>2 each at Manesar and Hebbal DC (Recommended)</option><option>1 each at Manesar and Hebbal DC</option><option>2 at Manesar and 1 at Hebbal DC</option><option>1 at Manesar and 2 at Hebbal DC</option></select></div>
            <div><label className={labelClass}>Connectivity Type</label><select value={formData.connectivityType} onChange={(e) => onFieldChange("connectivityType", e.target.value)} className={inputClass}><option value="">Select option</option><option>MPLS</option><option>Leased Line</option></select></div>
            <div><label className={labelClass}>Service Provider</label><select value={formData.serviceProvider} onChange={(e) => onFieldChange("serviceProvider", e.target.value)} className={inputClass}><option value="">Select provider</option><option>BSNL/MTNL</option><option>Airtel</option><option>Jio</option><option>Tata</option><option>Vodafone-Idea Ltd</option><option>Others</option></select></div>
            <div><label className={labelClass}>Planned Leased Line Capacity (Mbps)</label><input required type="number" value={formData.leasedLineCapacity} onChange={(e) => onFieldChange("leasedLineCapacity", e.target.value)} placeholder="e.g., 20" className={inputClass} /></div>
            <div className="md:col-span-2"><label className={labelClass}>IP Address(es) to be Whitelisted</label><textarea value={formData.whitelistedIps} onChange={(e) => onFieldChange("whitelistedIps", e.target.value)} placeholder="Enter IP addresses (one per line)" rows="4" className={inputClass}></textarea></div>
            <div className="md:col-span-2"><label className={labelClass}>Expected Authentication Transaction Volume (per day)</label><select value={formData.expectedAuthVolume} onChange={(e) => onFieldChange("expectedAuthVolume", e.target.value)} className={inputClass}><option value="">Select volume</option><option>Less than 5,00,000</option><option>5,00,000 - 25,00,000</option><option>25,00,000 - 1,00,00,000</option><option>More than 1,00,00,000</option></select></div>
            <div><label className={labelClass}>Router Make & Model</label><input type="text" value={formData.routerMakeModel} onChange={(e) => onFieldChange("routerMakeModel", e.target.value)} placeholder="e.g., Cisco ASR1000" className={inputClass} /></div>
            <div><label className={labelClass}>Redundant Router Location</label><input type="text" value={formData.redundantRouterLocation} onChange={(e) => onFieldChange("redundantRouterLocation", e.target.value)} placeholder="Specify locations" className={inputClass} /></div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e4e0d6] bg-[#fbfaf6] p-6">
          <h4 className="mb-5 text-lg font-semibold text-[#2e2e38]">AUA/KUA Information</h4>
          <div className="grid grid-cols-1 gap-6">
            <div><label className={labelClass}>Geographies Catered (States)</label><textarea value={formData.geographiesCatered} onChange={(e) => onFieldChange("geographiesCatered", e.target.value)} placeholder="Enter states/territories" rows="3" className={inputClass}></textarea></div>
            <div><label className={labelClass}>AUA/KUA Support Type</label><select value={formData.auaKuaSupportType} onChange={(e) => onFieldChange("auaKuaSupportType", e.target.value)} className={inputClass}><option value="">Select option</option><option>Self as AUA/KUA only</option><option>Other entities as AUA/KUA only</option><option>Self as AUA/KUA and Other entities as AUA/KUA</option></select></div>
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

export default ASADetailsForm;
