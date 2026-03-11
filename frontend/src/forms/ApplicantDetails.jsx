import { ClipboardList, FileCheck, Fingerprint, Landmark, ShieldCheck } from "lucide-react";
import ContactDetails from "./ContactDetails";
import ASADetailsForm from "./ASADetailsForm";
import AuthenticationForm from "./AuthenticationForm";
import DeclarationForm from "./DeclarationForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitApplicationForm } from "../services/portalApi";
import { initialApplicationFormData } from "./applicationFormData";

const LAST_SUBMITTED_APPLICATION_KEY = "lastSubmittedApplication";

const steps = [
  { step: 1, label: "Applicant Details", shortLabel: "Applicant", icon: Landmark },
  { step: 2, label: "Contact Details", shortLabel: "Contacts", icon: ClipboardList },
  { step: 3, label: "ASA Form", shortLabel: "ASA Setup", icon: FileCheck },
  { step: 4, label: "Authentication", shortLabel: "Auth", icon: Fingerprint },
  { step: 5, label: "Declaration", shortLabel: "Declaration", icon: ShieldCheck },
];

function ApplicationForm() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState(initialApplicationFormData);
  const [submitting, setSubmitting] = useState(false);

  function updateField(name, value) {
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function validateStep(step) {
    const container = document.getElementById(`step-${step}`);
    if (!container) return [];
    const requiredEls = container.querySelectorAll("[required]");
    const missing = [];

    for (const el of requiredEls) {
      const value = el.type === "checkbox" ? el.checked : el.value?.trim();
      if (!value) {
        const label = el.previousElementSibling;
        missing.push(label && label.tagName === "LABEL" ? label.textContent.trim() : "Required field");
        el.focus();
        break;
      }

      if (el.type === "tel" && value && !/^\d+$/.test(el.value.trim())) {
        const label = el.previousElementSibling;
        const fieldName = label && label.tagName === "LABEL" ? label.textContent.trim() : "Phone field";
        missing.push(`${fieldName} - Invalid entry (numbers only)`);
        el.focus();
        break;
      }
    }

    return missing;
  }

  function changeStep(target) {
    if (target === activeStep) return;
    if (target > activeStep) {
      const missing = validateStep(activeStep);
      if (missing.length > 0) {
        alert(`Please fill the following required fields before proceeding:\n- ${missing.join("\n- ")}`);
        return;
      }
    }
    setActiveStep(target);
  }

  useEffect(() => {
    const handler = (e) => {
      if (e && e.detail) changeStep(e.detail);
    };
    window.addEventListener("changeStep", handler);
    return () => window.removeEventListener("changeStep", handler);
  }, [activeStep]);

  async function handleSubmitApplication(event) {
    event.preventDefault();
    const missing = validateStep(5);
    if (missing.length > 0) {
      alert(`Please fill the following required fields before submitting:\n- ${missing.join("\n- ")}`);
      return;
    }

    try {
      setSubmitting(true);
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      const response = await submitApplicationForm({
        userId: parsedUser?.id || null,
        formData,
      });

      if (response?.application) {
        sessionStorage.setItem(LAST_SUBMITTED_APPLICATION_KEY, JSON.stringify(response.application));
      }

      navigate("/application-success", {
        state: {
          application: response?.application || null,
        },
      });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit ASA application form");
    } finally {
      setSubmitting(false);
    }
  }

  const progressWidth = `${((activeStep - 1) / (steps.length - 1)) * 100}%`;

  return (
    <form onSubmit={handleSubmitApplication} className="min-h-screen bg-[linear-gradient(180deg,#f7f5ef_0%,#ece8dd_100%)] px-4 py-8 md:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 overflow-hidden rounded-[32px] border border-black/10 bg-[linear-gradient(135deg,#2e2e38_0%,#1f1f1f_100%)] shadow-2xl">
          <div className="flex flex-col gap-6 px-6 py-8 md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ffe600]">EY Styled Application Flow</p>
                <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">ASA Application Form</h1>
                <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
                  Complete the onboarding application through five guided stages. Each step is saved in one continuous workflow before being pushed into the ASA portal dashboard.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Current Stage</p>
                <p className="mt-2 text-lg font-semibold">Step {activeStep} of {steps.length}</p>
                <p className="text-sm text-[#ffe600]">{steps[activeStep - 1].label}</p>
              </div>
            </div>

            <div className="rounded-[28px] bg-white px-4 py-6 shadow-xl md:px-8">
              <div className="relative hidden md:block">
                <div className="absolute left-[6%] right-[6%] top-8 h-1 rounded-full bg-[#d9d5cc]"></div>
                <div className="absolute left-[6%] top-8 h-1 rounded-full bg-[#ffe600] transition-all duration-500" style={{ width: `calc(${progressWidth} * 0.88)` }}></div>
                <div className="grid grid-cols-5 gap-4">
                  {steps.map((item) => {
                    const Icon = item.icon;
                    const state = activeStep === item.step ? "active" : activeStep > item.step ? "done" : "upcoming";
                    return (
                      <button
                        key={item.step}
                        type="button"
                        onClick={() => changeStep(item.step)}
                        disabled={activeStep < item.step}
                        className="group flex flex-col items-center text-center"
                      >
                        <div
                          className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
                            state === "active"
                              ? "border-[#ffe600] bg-[#2e2e38] text-[#ffe600] shadow-lg"
                              : state === "done"
                                ? "border-[#ffe600] bg-[#ffe600] text-[#1f1f1f]"
                                : "border-[#d9d5cc] bg-white text-[#8a8a90]"
                          } ${activeStep < item.step ? "cursor-not-allowed" : "hover:-translate-y-1"}`}
                        >
                          <Icon size={24} strokeWidth={2.1} />
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              state === "upcoming" ? "bg-[#d9d5cc] text-[#2e2e38]" : "bg-[#2e2e38] text-[#ffe600]"
                            }`}
                          >
                            {item.step}
                          </span>
                          <span className={`text-sm font-semibold ${state === "upcoming" ? "text-[#6c6c73]" : "text-[#1f1f1f]"}`}>
                            {item.shortLabel}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:hidden">
                <div className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-[#6c6c73]">
                  <span>Progress</span>
                  <span>{activeStep}/{steps.length}</span>
                </div>
                <div className="h-2 rounded-full bg-[#d9d5cc]">
                  <div className="h-2 rounded-full bg-[#ffe600] transition-all duration-500" style={{ width: `${(activeStep / steps.length) * 100}%` }}></div>
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-black/10 bg-[#f7f5ef] px-4 py-3">
                  {(() => {
                    const ActiveIcon = steps[activeStep - 1].icon;
                    return <ActiveIcon size={22} className="text-[#2e2e38]" />;
                  })()}
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6c6c73]">Current Step</p>
                    <p className="text-sm font-semibold text-[#1f1f1f]">{steps[activeStep - 1].label}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#1f1f1f]">{steps[activeStep - 1].label}</h2>
            <p className="mt-2 text-sm text-[#5f6368]">Fill in the required details carefully. EY colors are used across the form for a cleaner enterprise application experience.</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-[#6c6c73]">Completion</p>
            <p className="mt-1 text-lg font-bold text-[#1f1f1f]">{Math.round((activeStep / steps.length) * 100)}%</p>
          </div>
        </div>

        <div className="rounded-[30px] border border-black/10 bg-white/95 p-6 shadow-xl md:p-10">
          {activeStep === 1 && (
            <div id="step-1">
              <div className="mb-8 flex flex-col gap-2 border-b border-[#e4e0d6] pb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6c6c73]">Section 1</p>
                <h3 className="text-2xl font-bold text-[#1f1f1f]">Applicant Details</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">Type of Applicant *</label>
                  <select required value={formData.typeOfApplicant} onChange={(e) => updateField("typeOfApplicant", e.target.value)} className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40">
                    <option value="">Please Select</option>
                    <option>Government</option>
                    <option>Private</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">Applicant Name *</label>
                  <input required type="text" value={formData.applicantName} onChange={(e) => updateField("applicantName", e.target.value)} placeholder="Applicant Name" className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">Registration / Incorporation No. *</label>
                  <input required type="text" value={formData.registrationNumber} onChange={(e) => updateField("registrationNumber", e.target.value)} placeholder="Registration Number" className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">License Number *</label>
                  <input required type="text" value={formData.licenseNumber} onChange={(e) => updateField("licenseNumber", e.target.value)} placeholder="License Number" className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">Registered Office Address *</label>
                  <input required type="text" value={formData.registeredOfficeAddress} onChange={(e) => updateField("registeredOfficeAddress", e.target.value)} placeholder="Registered office address" className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">Correspondence Address</label>
                  <input type="text" value={formData.correspondenceAddress} onChange={(e) => updateField("correspondenceAddress", e.target.value)} placeholder="Correspondence address" className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">GSTN Registration Number</label>
                  <input type="text" value={formData.gstnNumber} onChange={(e) => updateField("gstnNumber", e.target.value)} placeholder="GSTN number" className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">TAN Number</label>
                  <input type="text" value={formData.tanNumber} onChange={(e) => updateField("tanNumber", e.target.value)} placeholder="TAN number" className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40" />
                </div>
              </div>
              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">Category of Applicant</label>
                <select value={formData.applicantCategory} onChange={(e) => updateField("applicantCategory", e.target.value)} className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40">
                  <option value="">Select Category</option>
                  <option>Category 1: Ministry/Department of Central or State Government</option>
                  <option>Category 2: Authority constituted under Central or State Act</option>
                  <option>Category 3: Any other entity of national importance</option>
                  <option>Category 4: Company registered under Companies Act, 2013</option>
                  <option>Category 5: An AUA or a KUA</option>
                </select>
              </div>
              <div className="mt-10 flex justify-between border-t border-[#e4e0d6] pt-6">
                <button type="button" onClick={() => activeStep > 1 && setActiveStep(activeStep - 1)} className={`rounded-2xl px-8 py-3 font-semibold transition ${activeStep === 1 ? "cursor-not-allowed bg-[#d9d5cc] text-[#8a8a90] opacity-60" : "bg-[#8a8a90] text-white hover:bg-[#6c6c73]"}`} disabled={activeStep === 1}>Previous</button>
                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("changeStep", { detail: activeStep + 1 }))} className="rounded-2xl bg-[#2e2e38] px-8 py-3 font-semibold text-[#ffe600] shadow-lg transition hover:bg-[#1f1f1f]">Next</button>
              </div>
            </div>
          )}
          {activeStep === 2 && <ContactDetails activeStep={activeStep} formData={formData} onFieldChange={updateField} />}
          {activeStep === 3 && <ASADetailsForm activeStep={activeStep} formData={formData} onFieldChange={updateField} />}
          {activeStep === 4 && <AuthenticationForm activeStep={activeStep} formData={formData} onFieldChange={updateField} />}
          {activeStep === 5 && <DeclarationForm activeStep={activeStep} formData={formData} onFieldChange={updateField} submitting={submitting} />}
        </div>
      </div>
    </form>
  );
}

export default ApplicationForm;
