function ContactDetails({ activeStep }) {
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
            placeholder="Name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Full Designation
          </label>
          <input
            type="text"
            placeholder="Full designation"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Official Email Address
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
            Mobile Number
          </label>
          <input
            required
            type="tel"
            placeholder="Mobile number"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
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
            placeholder="Name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Full Designation
          </label>
          <input
            type="text"
            placeholder="Full designation"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Official Email Address
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
            Mobile Number
          </label>
          <input
            required
            type="tel"
            placeholder="Mobile number"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
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
            placeholder="Name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Full Designation
          </label>
          <input
            type="text"
            placeholder="Full designation"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Official Email Address
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
            Mobile Number
          </label>
          <input
            required
            type="tel"
            placeholder="Mobile number"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
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
            placeholder="Name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Full Designation
          </label>
          <input
            type="text"
            placeholder="Full designation"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Official Email Address
          </label>
          <input
            type="email"
            placeholder="Email address"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Mobile Number
          </label>
          <input
            type="tel"
            placeholder="Mobile number"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
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
            placeholder="Website URL"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            required
            type="email"
            placeholder="Grievance email"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Helpdesk Number
          </label>
          <input
            type="tel"
            placeholder="Helpdesk number"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Designated Grievance Officer Name
          </label>
          <input
            required
            type="text"
            placeholder="Officer name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
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
            placeholder="Officer mobile (numbers only)"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Grievance Officer E-Mail ID
          </label>
          <input
            required
            type="email"
            placeholder="Officer email"
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