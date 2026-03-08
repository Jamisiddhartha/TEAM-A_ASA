function AuthenticationForm({ activeStep }) {
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
          <label className="flex items-center mb-4">
            <input
              required
              type="checkbox"
              className="w-4 h-4 text-yellow-500 rounded focus:ring-orange-400"
            />
            <span className="ml-3 text-sm font-medium">
              Applicant is authorized to submit this application
            </span>
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center mb-4">
            <input
              required
              type="checkbox"
              className="w-4 h-4 text-yellow-500 rounded focus:ring-orange-400"
            />
            <span className="ml-3 text-sm font-medium">
              All information provided is accurate and true
            </span>
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center mb-4">
            <input
              required
              type="checkbox"
              className="w-4 h-4 text-yellow-500 rounded focus:ring-orange-400"
            />
            <span className="ml-3 text-sm font-medium">
              Organization complies with data protection regulations
            </span>
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center mb-4">
            <input
              required
              type="checkbox"
              className="w-4 h-4 text-yellow-500 rounded focus:ring-orange-400"
            />
            <span className="ml-3 text-sm font-medium">
              Organization has adequate security infrastructure
            </span>
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center mb-4">
            <input
              required
              type="checkbox"
              className="w-4 h-4 text-yellow-500 rounded focus:ring-orange-400"
            />
            <span className="ml-3 text-sm font-medium">
              Organization understands the terms and conditions
            </span>
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
            Officer Name *
          </label>
          <input
            required
            type="text"
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
            placeholder="Designation"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Officer Email *
          </label>
          <input
            required
            type="email"
            placeholder="Email address"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
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
            placeholder="Phone number (numbers only)"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
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