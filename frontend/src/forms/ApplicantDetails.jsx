// since we are using the file directly in the browser via Live Server
// and loading React from a CDN, we can't use ES module imports here.
// Babel will transpile the JSX but it won't resolve `import` statements.
// instead grab what we need from the global `React` object.
/* eslint-disable */
// @ts-nocheck
import ContactDetails from "./ContactDetails";
import ASADetailsForm from "./ASADetailsForm";
import AuthenticationForm from "./AuthenticationForm";
import DeclarationForm from "./DeclarationForm";
import { useState, useEffect } from "react";

function ApplicationForm() {
  const [activeStep, setActiveStep] = useState(1);
  
  // validate required fields inside a step container with id="step-N"
  function validateStep(step) {
    const container = document.getElementById(`step-${step}`);
    if (!container) return [];
    const requiredEls = container.querySelectorAll('[required]');
    const missing = [];
    for (let el of requiredEls) {
      const val = el.value.trim();
      if (val === '') {
        // find the associated label
        const label = el.previousElementSibling;
        if (label && label.tagName === 'LABEL') {
          missing.push(label.textContent.trim());
        } else {
          missing.push('Unknown required field');
        }
        el.focus();
        break;
      }
      // validate phone/tel fields: must contain only numbers
      if (el.type === 'tel' && val !== '') {
        if (!/^\d+$/.test(val)) {
          const label = el.previousElementSibling;
          const fieldName = (label && label.tagName === 'LABEL') 
            ? label.textContent.trim() 
            : 'Phone field';
          missing.push(`${fieldName} - Invalid entry (numbers only)`);
          el.focus();
          break;
        }
      }
    }
    return missing;
  }

  function changeStep(target) {
    if (target === activeStep) return;
    // moving forward: validate current step
    if (target > activeStep) {
      const missing = validateStep(activeStep);
      if (missing.length > 0) {
        alert(`Please fill the following required fields before proceeding:\n- ${missing.join('\n- ')}`);
        return;
      }
    }
    setActiveStep(target);
  }

  // listen for changeStep events dispatched by child components
  useEffect(() => {
    const handler = (e) => {
      if (e && e.detail) changeStep(e.detail);
    };
    window.addEventListener('changeStep', handler);
    return () => window.removeEventListener('changeStep', handler);
  }, [activeStep]);
 
  // @ts-ignore
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 rounded-2xl shadow-xl p-6 h-fit sticky top-4">
          <h2 className="text-white text-xl font-bold mb-8">Application Form</h2>
          <nav className="space-y-2">
            {[
              { step: 1, label: 'Applicant Details' },
              { step: 2, label: 'Contact Details' },
              { step: 3, label: 'ASA Form' },
              { step: 4, label: 'Authentication' },
              { step: 5, label: 'Declaration' }
            ].map((item) => (
              <button
                key={item.step}
                onClick={() => setActiveStep(item.step)}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${
                  activeStep === item.step
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg'
                    : activeStep > item.step
                    ? 'bg-blue-700 text-white hover:bg-blue-600'
                    : 'bg-blue-700 text-blue-200 hover:bg-blue-600 cursor-not-allowed opacity-60'
                }`}
                disabled={activeStep < item.step}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  activeStep === item.step
                    ? 'bg-white text-orange-500'
                    : activeStep > item.step
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-blue-300'
                }`}>
                  {item.step}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          
          {/* Progress Bar */}
          <div className="mt-8 pt-6 border-t border-blue-700">
            <p className="text-blue-200 text-xs font-semibold mb-2">PROGRESS</p>
            <div className="w-full bg-blue-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(activeStep / 5) * 100}%` }}
              ></div>
            </div>
            <p className="text-blue-200 text-xs mt-2">{activeStep} of 5 completed</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Step Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {["Applicant Details", "Contact Details", "ASA Form", "Authentication", "Declaration"][activeStep - 1]}
            </h1>
            <p className="text-gray-600 mt-2">Step {activeStep} of 5</p>
          </div>

          {/* Form Container */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-10">
          {activeStep === 1 && (
            <div id="step-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">APPLICANT DETAILS</h2>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type of Applicant */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Type of Applicant *
                  </label>
                  <select required className="w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200">
                    <option>Please Select</option>
                    <option>Government</option>
                    <option>Private</option>
                  </select>
                </div>

                {/* Applicant Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Applicant Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Applicant Name"
                    className="w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
                  />
                </div>

                {/* Registration No */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Registration / Incorporation No. *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Registration Number"
                    className="w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
                  />
                </div>

                {/* License Number */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    License Number *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="License Number"
                    className="w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
                  />
                </div>

                {/* Registered Office Address */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Registered Office Address *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Registered office address"
                    className="w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
                  />
                </div>

                {/* Correspondence Address */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Correspondence Address
                  </label>
                  <input
                    type="text"
                    placeholder="Correspondence address"
                    className="w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
                  />
                </div>

                {/* GSTN */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    GSTN Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="GSTN number"
                    className="w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
                  />
                </div>

                {/* TAN */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    TAN Number
                  </label>
                  <input
                    type="text"
                    placeholder="TAN number"
                    className="w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="mt-6">
                <label className="block text-sm font-medium mb-1">
                  Category of Applicant
                </label>
                <select className="w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200">
                  <option value="">Select Category</option>
                  <option>
                    Category 1: Ministry/Department of Central or State Government
                  </option>
                  <option>
                    Category 2: Authority constituted under Central or State Act
                  </option>
                  <option>
                    Category 3: Any other entity of national importance
                  </option>
                  <option>
                    Category 4: Company registered under Companies Act, 2013
                  </option>
                  <option>
                    Category 5: An AUA or a KUA
                  </option>
                </select>
              </div>

              {/* Prev/Next Buttons */}
              <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => activeStep > 1 && setActiveStep(activeStep - 1)}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeStep === 1
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                      : 'bg-gray-400 text-white hover:bg-gray-500'
                  }`}
                  disabled={activeStep === 1}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('changeStep', { detail: activeStep + 1 }))}
                  className={`px-8 py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                    activeStep === 5
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                  }`}
                >
                  {activeStep === 5 ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          )}
          {activeStep === 2 && <ContactDetails activeStep={activeStep} />}
          {activeStep === 3 && <ASADetailsForm activeStep={activeStep} />}
          {activeStep === 4 && <AuthenticationForm activeStep={activeStep} />}
          {activeStep === 5 && <DeclarationForm activeStep={activeStep} />}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ApplicationForm;
