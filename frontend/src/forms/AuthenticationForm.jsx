function AuthenticationForm({ activeStep, formData, handleInputChange }) {
  if (activeStep !== 4) return null;

  return (
    <div id="step-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authentication Checkboxes Section */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 mb-4">
            Authentication Requirements
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Please confirm the following authentication criteria:
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center space-x-3 cursor-pointer mb-2">
            <input
              type="checkbox"
              name="authYes"
              checked={formData.authYes || false}
              onChange={handleInputChange}
              className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
            />
            <span className="text-gray-700">Yes</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              name="authNo"
              checked={formData.authNo || false}
              onChange={handleInputChange}
              className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
            />
            <span className="text-gray-700">No</span>
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center space-x-3 cursor-pointer mb-2">
            <input
              type="checkbox"
              name="authDemographic"
              checked={formData.authDemographic || false}
              onChange={handleInputChange}
              className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500 mt-1"
            />
            <span className="text-gray-700">Demographic</span>
          </label>
          <label className="flex items-start space-x-3 cursor-pointer mb-2">
            <input
              type="checkbox"
              name="authOTP"
              checked={formData.authOTP || false}
              onChange={handleInputChange}
              className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500 mt-1"
            />
            <span className="text-gray-700">OTP</span>
          </label>
          <label className="flex items-start space-x-3 cursor-pointer mb-2">
            <input
              type="checkbox"
              name="authFingerprint"
              checked={formData.authFingerprint || false}
              onChange={handleInputChange}
              className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500 mt-1"
            />
            <span className="text-gray-700">Fingerprint</span>
          </label>
          <label className="flex items-start space-x-3 cursor-pointer mb-2">
            <input
              type="checkbox"
              name="authIris"
              checked={formData.authIris || false}
              onChange={handleInputChange}
              className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500 mt-1"
            />
            <span className="text-gray-700">Iris</span>
          </label>
          <label className="flex items-start space-x-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              name="authFace"
              checked={formData.authFace || false}
              onChange={handleInputChange}
              className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500 mt-1"
            />
            <span className="text-gray-700">Face</span>
          </label>
        </div>

        {/* Authorized Officer Details */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 mb-4 mt-6">
            Authorized Officer Details
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Application Details
          </label>
          <textarea
            required
            name="appDetails"
            value={formData.appDetails || ""}
            onChange={handleInputChange}
            placeholder="Briefly describe the applications/services requiring Aadhaar authentication"
            rows="4"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Officer Name *
          </label>
          <input
            required
            type="text"
            name="officerName"
            value={formData.officerName || ""}
            onChange={handleInputChange}
            placeholder="Full name of authorized officer"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Officer Designation *
          </label>
          <input
            required
            type="text"
            name="officerDesignation"
            value={formData.officerDesignation || ""}
            onChange={handleInputChange}
            placeholder="Designation"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Officer Email *
          </label>
          <input
            required
            type="email"
            name="officerEmail"
            value={formData.officerEmail || ""}
            onChange={handleInputChange}
            placeholder="Email address"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Officer Phone *
          </label>
          <input
            required
            type="tel"
            inputMode="numeric"
            name="officerPhone"
            value={formData.officerPhone || ""}
            onChange={handleInputChange}
            placeholder="Phone number (numbers only)"
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
          className="px-8 py-3 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition-all duration-200"
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
          className="px-8 py-3 text-white rounded-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all duration-200"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AuthenticationForm;