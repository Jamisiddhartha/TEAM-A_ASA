import { ClipboardList, FileCheck, Fingerprint, Landmark, Paperclip, ShieldCheck, Trash2 } from "lucide-react";
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

  const [activeUploadField, setActiveUploadField] = useState("");
  function updateField(name, value) {
    setFormData((current) => ({ ...current, [name]: value }));
  }
  async function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  function showUploadField(fieldName) {
    setActiveUploadField(fieldName);
  }

  function renderUploadField({ isVisible, fileName, fileDataUrl, helperText, onChange, onDelete }) {
    if (!isVisible && !fileName) {
      return null;
    }

    return (
      <div className="mt-1">
        {fileName ? (
          <div className="flex items-center gap-2">
            <a
              href={fileDataUrl || "#"}
              download={fileName}
              className="inline-flex min-w-0 max-w-full items-center gap-1.5 text-[12px] font-semibold leading-none text-[#ffe600] transition hover:text-[#fff3a0]"
              title={fileName}
            >
              <Paperclip size={12} />
              <span className="truncate">{fileName}</span>
            </a>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center justify-center text-[#ffe600] transition hover:text-[#fff3a0]"
              aria-label={`Delete ${fileName}`}
              title="Remove file"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ) : (
          <>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d9d5cc] bg-[#fcfbf7] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#2e2e38] transition hover:border-[#ffe600] hover:bg-[#fffce0]">
              <Paperclip size={14} />
              <span>Upload Document</span>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={onChange} className="sr-only" />
            </label>
            <p className="mt-2 text-[11px] leading-5 text-[#5f6368]">{helperText}</p>
          </>
        )}
      </div>
    );
  }
  async function handleFileUpload(event, nameField, dataField) {
    const file = event.target.files?.[0];
    if (!file) {
      updateField(nameField, "");
      updateField(dataField, "");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setFormData((current) => ({
        ...current,
        [nameField]: file.name,
        [dataField]: dataUrl,
      }));
    } catch {
      alert("Unable to read the selected file. Please try again.");
      event.target.value = "";
      updateField(nameField, "");
      updateField(dataField, "");
    }
  }

  function getFieldLabel(element) {
    const explicitLabel = element.parentElement?.querySelector("label");
    const wrappedLabel = element.closest("label");
    const labelText = explicitLabel?.textContent || wrappedLabel?.textContent || element.getAttribute("placeholder") || "This field";
    return labelText.replace(/\s*\*\s*/g, " ").replace(/\s+/g, " ").trim();
  }

  function getValidationId(element) {
    if (!element.dataset.validationId) {
      element.dataset.validationId = `${element.id || element.type || "field"}-${Math.random().toString(36).slice(2, 9)}`;
    }
    return element.dataset.validationId;
  }

  function getValidationMessage(element, options = {}) {
    const { enforceRequired = false } = options;
    const label = getFieldLabel(element).toLowerCase();
    if (element.type === "file") {
      if (enforceRequired && element.required && !element.files?.length) {
        return "Please attach a file.";
      }
      return "";
    }


    if (element.disabled || element.readOnly || element.type === "hidden" || element.classList.contains("sr-only")) {
      return "";
    }

    if (element.type === "checkbox") {
      if (enforceRequired && element.required && !element.checked) {
        return "Please confirm this field.";
      }
      return "";
    }

    const value = element.value?.trim() || "";

    if (enforceRequired && element.required && !value) {
      return element.tagName === "SELECT" ? "Please select an option." : "This field is required.";
    }

    if (!value) {
      return "";
    }

    if (element.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Enter a valid email address.";
    }

    if (element.type === "tel" && !/^\d+$/.test(value)) {
      return "Enter numbers only.";
    }

    if (element.type === "url") {
      try {
        const parsedUrl = new URL(value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`);
        const hostname = parsedUrl.hostname || "";
        const isLocalhost = hostname === "localhost";
        const isIpv4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(hostname);
        if ((!hostname.includes(".") && !isLocalhost && !isIpv4) || /[^a-zA-Z0-9.-]/.test(hostname)) {
          return "Enter a valid website URL.";
        }
      } catch {
        return "Enter a valid website URL.";
      }
    }

    if (element.type === "number" && Number.isNaN(Number(value))) {
      return "Enter numbers only.";
    }

    const lettersOnlyField = /name|designation|district|state|country|place/.test(label) && !/address|email|website|url/.test(label);
    if (lettersOnlyField && /[^a-zA-Z.\s]/.test(value)) {
      return label.includes("name") ? "Enter name only (letters)." : "Enter letters only.";
    }

    if (label.includes("ip address")) {
      const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const isValidIpv4 = (ip) => /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(ip);
      const hasInvalidIp = lines.length === 0 || lines.some((line) => !isValidIpv4(line) || line.startsWith("10.") || line.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[0-1])\./.test(line) || line === "127.0.0.1");
      if (hasInvalidIp) {
        return "Enter valid public IP address(es), one per line.";
      }
    }

    if (label.includes("address") && !label.includes("ip address")) {
      const hasLetter = /[a-zA-Z]/.test(value);
      if (!hasLetter || value.length < 5) {
        return "Enter a valid address.";
      }
    }

    if (label.includes("gstn")) {
      if (!/^\d+$/.test(value)) {
        return "Enter numbers only.";
      }
    }

    if (label.includes("tan")) {
      if (!/^\d+$/.test(value)) {
        return "Enter numbers only.";
      }
    }

    if (label.includes("registration") || label.includes("incorporation")) {
      if (!/^\d+$/.test(value)) {
        return "Enter numbers only.";
      }
    }

    if (label.includes("license")) {
      if (!/^\d+$/.test(value)) {
        return "Enter numbers only.";
      }
    }

    if (label.includes("router make") || label.includes("model")) {
      if (!/(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9.\-/\s]+$/.test(value)) {
        return "Enter a valid router make and model.";
      }
    }

    if (label.includes("location")) {
      if (!/[a-zA-Z]/.test(value) || /[^a-zA-Z0-9,\-./\s]/.test(value)) {
        return "Enter a valid location.";
      }
    }

    return "";
  }

  function syncFieldValidation(element, options = {}) {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)) {
      return "";
    }

    const validationId = getValidationId(element);
    const anchor = element.type === "checkbox" ? element.closest("label") || element : element;
    const container = anchor?.parentElement || element.parentElement || element;
    let errorNode = container.querySelector(`.asa-field-error[data-validation-id="${validationId}"]`);
    const message = getValidationMessage(element, options);

    if (message) {
      if (!errorNode) {
        errorNode = document.createElement("p");
        errorNode.className = "asa-field-error";
        errorNode.dataset.validationId = validationId;
        anchor.insertAdjacentElement("afterend", errorNode);
      }
      errorNode.textContent = message;
      element.classList.add("asa-field-invalid");
      element.setAttribute("aria-invalid", "true");
    } else {
      if (errorNode) {
        errorNode.remove();
      }
      element.classList.remove("asa-field-invalid");
      element.removeAttribute("aria-invalid");
    }

    return message;
  }

  function handleFieldValidation(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) {
      return;
    }

    const hasValue = target.type === "checkbox" ? target.checked : Boolean(target.value?.trim());
    const enforceRequired = event.type !== "input" || hasValue;
    syncFieldValidation(target, { enforceRequired });
  }

  function validateStep(step) {
    const container = document.getElementById(`step-${step}`);
    if (!container) return [];
    const fields = container.querySelectorAll("input, select, textarea");
    const missing = [];

    for (const el of fields) {
      const message = syncFieldValidation(el, { enforceRequired: true });
      if (message) {
        missing.push(`${getFieldLabel(el)} - ${message}`);
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

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("formStepChanged", { detail: activeStep }));
  }, [activeStep]);

  async function handleSubmitApplication(event) {
    event.preventDefault();
    for (let step = 1; step <= steps.length; step += 1) {
      const missing = validateStep(step);
      if (missing.length > 0) {
        setActiveStep(step);
        alert(`Please fill the following required fields before submitting:\n- ${missing.join("\n- ")}`);
        return;
      }
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
      const missingFields = error.response?.data?.fields;
      if (Array.isArray(missingFields) && missingFields.length > 0) {
        alert(`Please fill the following required fields before submitting:\n- ${missingFields.join("\n- ")}`);
        return;
      }
      alert(error.response?.data?.message || "Failed to submit ASA Application Portal");
    } finally {
      setSubmitting(false);
    }
  }

  const completedStepCount = activeStep - 1;
  const progressWidth = `${(completedStepCount / (steps.length - 1)) * 100}%`;
  const completionPercent = Math.round((completedStepCount / steps.length) * 100);

  return (
    <form
      onSubmit={handleSubmitApplication}
      onInput={handleFieldValidation}
      onBlur={handleFieldValidation}
      onChange={handleFieldValidation}
      className="min-h-screen bg-[linear-gradient(180deg,#f7f5ef_0%,#ece8dd_100%)] px-4 py-8 md:px-6"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="asa-form-hero mb-6 overflow-hidden rounded-[32px] border border-black/10 bg-[linear-gradient(135deg,#2e2e38_0%,#1f1f1f_100%)] shadow-2xl">
          <div className="asa-form-hero-inner flex flex-col gap-6 px-6 py-8 md:px-10">            <div className="flex items-center justify-between">
              <h1 className="mt-1 text-3xl font-bold text-white md:text-4xl">ASA Application Portal</h1>
            </div>

            <div className="asa-form-progress-row flex flex-col gap-3 md:flex-row md:items-stretch">
              <div className="asa-form-stepper rounded-[28px] border border-white/10 bg-[#1f1f24]/95 px-4 py-6 shadow-xl md:flex-1 md:px-8">
              <div className="relative hidden md:block">
                <div className="absolute left-[6%] right-[6%] top-8 h-1 rounded-full bg-white/20"></div>
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
                        className="group flex flex-col items-center bg-transparent p-0 text-center shadow-none border-0 outline-none appearance-none"
                      >
                        <div
                          className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
                            state === "active"
                              ? "border-[#ffe600] bg-[#2e2e38] text-[#ffe600] shadow-lg"
                              : state === "done"
                                ? "border-[#ffe600] bg-[#ffe600] text-[#1f1f1f]"
                                : "border-white/15 bg-[#2b2b32] text-white/55"
                          } ${activeStep < item.step ? "cursor-not-allowed" : "hover:-translate-y-1"}`}
                        >
                          <Icon size={24} strokeWidth={2.1} />
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              state === "upcoming" ? "bg-white/80 text-[#1f1f1f]" : "bg-[#ffe600] text-[#1f1f1f]"
                            }`}
                          >
                            {item.step}
                          </span>
                          <span className={`text-sm font-semibold ${state === "upcoming" ? "text-white/78" : "text-white"}` }>
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
                  <div className="h-2 rounded-full bg-[#ffe600] transition-all duration-500" style={{ width: `${(completedStepCount / steps.length) * 100}%` }}></div>
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
              </div>              </div>

              <div className="asa-form-stage-card rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white md:w-[220px]">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Current Stage</p>
                <p className="mt-2 text-lg font-semibold">Step {activeStep} of {steps.length}</p>
                <p className="text-sm text-[#ffe600]">{steps[activeStep - 1].label}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#1f1f1f]">{steps[activeStep - 1].label}</h2>
            <p className="mt-2 text-sm text-[#5f6368]">Fill in the required details carefully. EY colors are used across the form for a cleaner enterprise application experience.</p>
          </div>
          <div className="asa-form-completion-card rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-[#6c6c73]">Completion</p>
            <p className="mt-1 text-lg font-bold text-[#1f1f1f]">{completionPercent}%</p>
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
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">Applicant Name *</label>
                  <input required type="text" value={formData.applicantName} onFocus={() => showUploadField("")} onChange={(e) => updateField("applicantName", e.target.value)} placeholder="Applicant Name" className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">Registration / Incorporation No. *</label>
                  <input required type="text" value={formData.registrationNumber} onFocus={() => showUploadField("registration")} onChange={(e) => updateField("registrationNumber", e.target.value)} placeholder="Registration Number" className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40" />
                  {renderUploadField({
                    isVisible: activeUploadField === "registration",
                    fileName: formData.registrationDocumentName,
                    fileDataUrl: formData.registrationDocumentDataUrl,
                    helperText: "Please attach a copy of the registration or incorporation document, if applicable.",
                    onChange: (e) => handleFileUpload(e, "registrationDocumentName", "registrationDocumentDataUrl"),
                    onDelete: () => { updateField("registrationDocumentName", ""); updateField("registrationDocumentDataUrl", ""); },
                  })}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">License Number *</label>
                  <input required type="text" value={formData.licenseNumber} onFocus={() => showUploadField("license")} onChange={(e) => updateField("licenseNumber", e.target.value)} placeholder="License Number" className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40" />
                  {renderUploadField({
                    isVisible: activeUploadField === "license",
                    fileName: formData.licenseDocumentName,
                    fileDataUrl: formData.licenseDocumentDataUrl,
                    helperText: "Please attach a copy of the license document, if applicable.",
                    onChange: (e) => handleFileUpload(e, "licenseDocumentName", "licenseDocumentDataUrl"),
                    onDelete: () => { updateField("licenseDocumentName", ""); updateField("licenseDocumentDataUrl", ""); },
                  })}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">Registered Office Address *</label>
                  <input required type="text" value={formData.registeredOfficeAddress} onFocus={() => showUploadField("")} onChange={(e) => updateField("registeredOfficeAddress", e.target.value)} placeholder="Registered office address" className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">Correspondence Address</label>
                  <input type="text" value={formData.correspondenceAddress} onFocus={() => showUploadField("correspondence")} onBlur={() => showUploadField("")} onChange={(e) => updateField("correspondenceAddress", e.target.value)} placeholder="Correspondence address" className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40" />
                  {activeUploadField === "correspondence" ? <p className="mt-2 text-xs leading-relaxed text-[#5f6368]">Use this only if it is different from the registered office address.</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">GSTN Registration Number</label>
                  <input type="text" value={formData.gstnNumber} onFocus={() => showUploadField("gstn")} onChange={(e) => updateField("gstnNumber", e.target.value)} placeholder="GSTN number" className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40" />
                  {renderUploadField({
                    isVisible: activeUploadField === "gstn",
                    fileName: formData.gstnDocumentName,
                    fileDataUrl: formData.gstnDocumentDataUrl,
                    helperText: "Please attach a copy of the GSTN registration document, if applicable.",
                    onChange: (e) => handleFileUpload(e, "gstnDocumentName", "gstnDocumentDataUrl"),
                    onDelete: () => { updateField("gstnDocumentName", ""); updateField("gstnDocumentDataUrl", ""); },
                  })}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">TAN Number</label>
                  <input type="text" value={formData.tanNumber} onFocus={() => showUploadField("tan")} onChange={(e) => updateField("tanNumber", e.target.value)} placeholder="TAN number" className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40" />
                  {renderUploadField({
                    isVisible: activeUploadField === "tan",
                    fileName: formData.tanDocumentName,
                    fileDataUrl: formData.tanDocumentDataUrl,
                    helperText: "Please attach a copy of the TAN document, if applicable.",
                    onChange: (e) => handleFileUpload(e, "tanDocumentName", "tanDocumentDataUrl"),
                    onDelete: () => { updateField("tanDocumentName", ""); updateField("tanDocumentDataUrl", ""); },
                  })}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e38]">Category of Applicant</label>
                  <select value={formData.applicantCategory} onFocus={() => showUploadField("")} onChange={(e) => updateField("applicantCategory", e.target.value)} className="w-full rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-3.5 text-[#1f1f1f] outline-none transition focus:border-[#ffe600] focus:ring-2 focus:ring-[#ffe600]/40">
                    <option value="">Select Category</option>
                    <option>Category 1: Ministry/Department of Central or State Government</option>
                    <option>Category 2: Authority constituted under Central or State Act</option>
                    <option>Category 3: Any other entity of national importance</option>
                    <option>Category 4: Company registered under Companies Act, 2013</option>
                    <option>Category 5: An AUA or a KUA</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-[#d9d5cc] bg-[#fcfbf7] p-4">
                <p className="text-sm font-semibold text-[#2e2e38]">Board Resolution / Authorization Document</p>
                <p className="mt-2 text-xs leading-relaxed text-[#5f6368]">
                  Please attach the certified copy of the board resolution, minutes, or other valid letter/instrument of authorization
                  citing approval for submitting the application form, signing the Authentication Service Agency Agreement, and doing
                  other acts in relation to the same.
                </p>
                <div className="mt-3">
                  {renderUploadField({
                    isVisible: true,
                    fileName: formData.authorizationDocumentName,
                    fileDataUrl: formData.authorizationDocumentDataUrl,
                    helperText: "Attach the certified copy of the authorization document.",
                    onChange: (e) => handleFileUpload(e, "authorizationDocumentName", "authorizationDocumentDataUrl"),
                    onDelete: () => { updateField("authorizationDocumentName", ""); updateField("authorizationDocumentDataUrl", ""); },
                  })}
                </div>
              </div>
              <div className="mt-10 flex justify-between border-t border-[#e4e0d6] pt-6">
                <button
                  type="button"
                  onClick={() => changeStep(activeStep - 1)}
                  disabled={activeStep === 1}
                  className="rounded-2xl bg-[#8a8a90] px-8 py-3 font-semibold text-white transition hover:bg-[#6c6c73] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => changeStep(activeStep + 1)}
                  className="rounded-2xl bg-[#2e2e38] px-8 py-3 font-semibold text-[#ffe600] shadow-lg transition hover:bg-[#1f1f1f]"
                >
                  Next
                </button>
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



























































