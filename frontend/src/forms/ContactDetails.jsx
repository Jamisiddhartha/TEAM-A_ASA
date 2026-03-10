function ContactDetails({ activeStep, formData, handleInputChange }) {
  if (activeStep !== 2) return null;

  return (
    <div id="step-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Managerial Personnel (KMP) */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 mb-4">
            Key Managerial Personnel (KMP)
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">KMP Name</label>
          <input
            required
            type="text"
            name="kmpName"
            value={formData.kmpName || ""}
            onChange={handleInputChange}
            placeholder="Name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Full Designation
          </label>
          <input
            type="text"
            name="kmpDesignation"
            value={formData.kmpDesignation || ""}
            onChange={handleInputChange}
            placeholder="Full designation"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Official Email Address
          </label>
          <input
            required
            type="email"
            name="kmpEmail"
            value={formData.kmpEmail || ""}
            onChange={handleInputChange}
            placeholder="Email address"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Mobile Number
          </label>
          <input
            required
            type="tel"
            name="kmpMobile"
            value={formData.kmpMobile || ""}
            onChange={handleInputChange}
            placeholder="Mobile number"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Chief Information Security Officer (CISO) */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 mb-4 mt-6">
            Chief Information Security Officer (CISO)
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">CISO Name</label>
          <input
            required
            type="text"
            name="cisoName"
            value={formData.cisoName || ""}
            onChange={handleInputChange}
            placeholder="Name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Full Designation
          </label>
          <input
            type="text"
            name="cisoDesignation"
            value={formData.cisoDesignation || ""}
            onChange={handleInputChange}
            placeholder="Full designation"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Official Email Address
          </label>
          <input
            required
            type="email"
            name="cisoEmail"
            value={formData.cisoEmail || ""}
            onChange={handleInputChange}
            placeholder="Email address"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Mobile Number
          </label>
          <input
            required
            type="tel"
            name="cisoMobile"
            value={formData.cisoMobile || ""}
            onChange={handleInputChange}
            placeholder="Mobile number"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Management Point of Contact (MPOC) */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 mb-4 mt-6">
            Management Point of Contact (MPOC)
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">MPOC Name</label>
          <input
            required
            type="text"
            name="mpocName"
            value={formData.mpocName || ""}
            onChange={handleInputChange}
            placeholder="Name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Full Designation
          </label>
          <input
            type="text"
            name="mpocDesignation"
            value={formData.mpocDesignation || ""}
            onChange={handleInputChange}
            placeholder="Full designation"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Official Email Address
          </label>
          <input
            required
            type="email"
            name="mpocEmail"
            value={formData.mpocEmail || ""}
            onChange={handleInputChange}
            placeholder="Email address"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Mobile Number
          </label>
          <input
            required
            type="tel"
            name="mpocMobile"
            value={formData.mpocMobile || ""}
            onChange={handleInputChange}
            placeholder="Mobile number"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Technical Point of Contact (TPOC) */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 mb-4 mt-6">
            Technical Point of Contact (TPOC)
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">TPOC Name</label>
          <input
            type="text"
            name="tpocName"
            value={formData.tpocName || ""}
            onChange={handleInputChange}
            placeholder="Name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Full Designation
          </label>
          <input
            type="text"
            name="tpocDesignation"
            value={formData.tpocDesignation || ""}
            onChange={handleInputChange}
            placeholder="Full designation"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Official Email Address
          </label>
          <input
            type="email"
            name="tpocEmail"
            value={formData.tpocEmail || ""}
            onChange={handleInputChange}
            placeholder="Email address"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Mobile Number
          </label>
          <input
            type="tel"
            name="tpocMobile"
            value={formData.tpocMobile || ""}
            onChange={handleInputChange}
            placeholder="Mobile number"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Grievance Redressal */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 mb-4 mt-6">
            Grievance Redressal Details
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Website URL</label>
          <input
            required
            type="url"
            name="grievanceUrl"
            value={formData.grievanceUrl || ""}
            onChange={handleInputChange}
            placeholder="Website URL"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            required
            type="email"
            name="grievanceEmail"
            value={formData.grievanceEmail || ""}
            onChange={handleInputChange}
            placeholder="Grievance email"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Helpdesk Number
          </label>
          <input
            type="tel"
            name="grievanceHelpdesk"
            value={formData.grievanceHelpdesk || ""}
            onChange={handleInputChange}
            placeholder="Helpdesk number"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Designated Grievance Officer Name
          </label>
          <input
            required
            type="text"
            name="grievanceOfficerName"
            value={formData.grievanceOfficerName || ""}
            onChange={handleInputChange}
            placeholder="Officer name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Grievance Officer Mobile No. *
          </label>
          <input
            required
            type="tel"
            inputMode="numeric"
            name="grievanceOfficerMobile"
            value={formData.grievanceOfficerMobile || ""}
            onChange={handleInputChange}
            placeholder="Officer mobile (numbers only)"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Grievance Officer E-Mail ID
          </label>
          <input
            required
            type="email"
            name="grievanceOfficerEmail"
            value={formData.grievanceOfficerEmail || ""}
            onChange={handleInputChange}
            placeholder="Officer email"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>
      </div>
    {/* Navigation Buttons */}
<div className="flex justify-between mt-10 pt-6 border-t border-gray-200">

  <button
    type="button"
    onClick={() =>
      window.dispatchEvent(
        new CustomEvent("changeStep", { detail: activeStep - 1 })
      )
    }
    className="px-8 py-3 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition"
  >
    Previous
  </button>

  <button
    type="button"
    onClick={() =>
      window.dispatchEvent(
        new CustomEvent("changeStep", { detail: activeStep + 1 })
      )
    }
    className="px-8 py-3 text-white rounded-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transition"
  >
    Next
  </button>

    </div>
    </div>
  );
}

/* Navigation Buttons */
<div className="flex justify-between mt-10 pt-6 border-t border-gray-200">

  <button
    type="button"
    onClick={() =>
      window.dispatchEvent(
        new CustomEvent("changeStep", { detail: activeStep - 1 })
      )
    }
    className="px-8 py-3 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition"
  >
    Previous
  </button>

  <button
    type="button"
    onClick={() =>
      window.dispatchEvent(
        new CustomEvent("changeStep", { detail: activeStep + 1 })
      )
    }
    className="px-8 py-3 text-white rounded-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transition"
  >
    Next
  </button>

</div>

export default ContactDetails;