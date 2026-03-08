function DeclarationForm({ activeStep }) {
  if (activeStep !== 5) return null;

  return (
    <div id="step-5">
      <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Declaration Section */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Declaration & Acknowledgments
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            I hereby declare that the information provided in this application
            is true and correct to the best of my knowledge and belief:
          </p>
        </div>

        {/* Checkbox 1 */}
        <div className="md:col-span-2">
          <label className="flex items-start gap-3 mb-4">
            <input
              required
              type="checkbox"
              className="w-4 h-4 mt-1 text-yellow-500 rounded focus:ring-orange-400"
            />
            <span className="text-sm flex-1 leading-relaxed">
              I certify that the applicant is duly authorized to submit this
              application and all information provided is accurate, complete,
              and not misleading.
            </span>
          </label>
        </div>

        {/* Checkbox 2 */}
        <div className="md:col-span-2">
          <label className="flex items-start gap-3 mb-4">
            <input
              required
              type="checkbox"
              className="w-4 h-4 mt-1 text-yellow-500 rounded focus:ring-orange-400"
            />
            <span className="text-sm flex-1 leading-relaxed">
              The applicant has the necessary technical, financial, and
              operational capacity to provide the services as per the
              application requirements.
            </span>
          </label>
        </div>

        {/* Checkbox 3 */}
        <div className="md:col-span-2">
          <label className="flex items-start gap-3 mb-4">
            <input
              required
              type="checkbox"
              className="w-4 h-4 mt-1 text-yellow-500 rounded focus:ring-orange-400"
            />
            <span className="text-sm flex-1 leading-relaxed">
              The applicant agrees to comply with all applicable laws,
              regulations, and guidelines governing the services.
            </span>
          </label>
        </div>

        {/* Checkbox 4 */}
        <div className="md:col-span-2">
          <label className="flex items-start gap-3 mb-4">
            <input
              required
              type="checkbox"
              className="w-4 h-4 mt-1 text-yellow-500 rounded focus:ring-orange-400"
            />
            <span className="text-sm flex-1 leading-relaxed">
              The applicant acknowledges that false or misleading information
              may result in rejection of the application or legal action.
            </span>
          </label>
        </div>

        {/* Checkbox 5 */}
        <div className="md:col-span-2">
          <label className="flex items-start gap-3 mb-4">
            <input
              required
              type="checkbox"
              className="w-4 h-4 mt-1 text-yellow-500 rounded focus:ring-orange-400"
            />
            <span className="text-sm flex-1 leading-relaxed">
              I agree to the terms and conditions and privacy policy as
              outlined by the authority.
            </span>
          </label>
        </div>

        {/* Checkbox 6 */}
        <div className="md:col-span-2">
          <label className="flex items-start gap-3 mb-6">
            <input
              required
              type="checkbox"
              className="w-4 h-4 mt-1 text-yellow-500 rounded focus:ring-orange-400"
            />
            <span className="text-sm flex-1 leading-relaxed">
              The applicant will maintain data security and protect personal
              information in compliance with applicable data protection laws.
            </span>
          </label>
        </div>

        {/* Declarant Details */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-4">
            Declarant Details
          </h3>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Declarant Name *
          </label>
          <input
            required
            type="text"
            placeholder="Full name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
          />
        </div>

        {/* Designation */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Declarant Designation *
          </label>
          <input
            required
            type="text"
            placeholder="Designation"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Declarant Email *
          </label>
          <input
            required
            type="email"
            placeholder="Email address"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Declarant Phone *
          </label>
          <input
            required
            type="tel"
            inputMode="numeric"
            placeholder="Phone number (numbers only)"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
          />
        </div>

        {/* Date */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Date of Declaration *
          </label>
          <input
            required
            type="date"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
          />
        </div>

        {/* Signature */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Signature / Digital Signature (Description) *
          </label>
          <textarea
            required
            rows="3"
            placeholder="Enter signature details or description"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
          ></textarea>
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
          type="submit"
          className="px-8 py-3 text-white rounded-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition"
        >
          Submit Application
        </button>
      </div>
    </div>
  );
}

export default DeclarationForm;