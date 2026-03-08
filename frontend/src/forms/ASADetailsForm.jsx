function ASADetailsForm({ activeStep }) {
  if (activeStep !== 3) return null;

  return (
    <div id="step-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Proposed Location */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 mb-4">
            Proposed ASA Server Location(s)
          </h3>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            District (Primary DC)
          </label>
          <input
            required
            type="text"
            placeholder="District name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <select required className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none">
            <option value="">Select State</option>
            <option>Andhra Pradesh</option>
            <option>Arunachal Pradesh</option>
            <option>Assam</option>
            <option>Bihar</option>
            <option>Chhattisgarh</option>
            <option>Goa</option>
            <option>Gujarat</option>
            <option>Haryana</option>
            <option>Himachal Pradesh</option>
            <option>Jharkhand</option>
            <option>Karnataka</option>
            <option>Kerala</option>
            <option>Madhya Pradesh</option>
            <option>Maharashtra</option>
            <option>Manipur</option>
            <option>Meghalaya</option>
            <option>Mizoram</option>
            <option>Nagaland</option>
            <option>Odisha</option>
            <option>Punjab</option>
            <option>Rajasthan</option>
            <option>Sikkim</option>
            <option>Tamil Nadu</option>
            <option>Telangana</option>
            <option>Tripura</option>
            <option>Uttar Pradesh</option>
            <option>Uttarakhand</option>
            <option>West Bengal</option>
            <option>Andaman and Nicobar Islands</option>
            <option>Chandigarh</option>
            <option>Dadra and Nagar Haveli and Daman and Diu</option>
            <option>Lakshadweep</option>
            <option>Delhi</option>
            <option>Puducherry</option>
            <option>Ladakh</option>
            <option>Jammu and Kashmir</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <input
            type="text"
            placeholder="Country"
            defaultValue="India"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        {/* Data Centre Details */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 mb-4 mt-6">
            Primary Data Centre (DC)
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            MPOC/TPOC Name
          </label>
          <input
            required
            type="text"
            placeholder="Name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            required
            type="email"
            placeholder="Email"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Telephone/Mobile No.
          </label>
          <input
            required
            type="tel"
            placeholder="Phone number"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            placeholder="DC Address"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        {/* Disaster Recovery Centre */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 mb-4 mt-6">
            Disaster Recovery Centre (DR)
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            DR District
          </label>
          <input
            required
            type="text"
            placeholder="District"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            MPOC/TPOC Name
          </label>
          <input
            required
            type="text"
            placeholder="Name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            required
            type="email"
            placeholder="Email"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Telephone/Mobile No.
          </label>
          <input
            required
            type="tel"
            inputMode="numeric"
            placeholder="Phone number (numbers only)"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            placeholder="DR Address"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        {/* Leased Lines */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 mb-4 mt-6">
            Leased Lines Configuration
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            No. of Leased Lines at UIDAI DC
          </label>
          <select className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none">
            <option>Select option</option>
            <option>2 each at Manesar and Hebbal DC (Recommended)</option>
            <option>1 each at Manesar and Hebbal DC</option>
            <option>2 at Manesar and 1 at Hebbal DC</option>
            <option>1 at Manesar and 2 at Hebbal DC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Connectivity Type
          </label>
          <select className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none">
            <option>Select option</option>
            <option>MPLS</option>
            <option>Leased Line</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Service Provider
          </label>
          <select className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none">
            <option>Select provider</option>
            <option>BSNL/MTNL</option>
            <option>Airtel</option>
            <option>Jio</option>
            <option>Tata</option>
            <option>Vodafone-Idea Ltd</option>
            <option>Others</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Planned Leased Line Capacity (Mbps)
          </label>
          <input
            required
            type="number"
            placeholder="e.g., 20"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        {/* IP Address Whitelisting */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            IP Address(es) to be Whitelisted
          </label>
          <textarea
            placeholder="Enter IP addresses (one per line)"
            rows="4"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          ></textarea>
        </div>

        {/* Authentication Volume */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Expected Authentication Transaction Volume (per day)
          </label>
          <select className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none">
            <option>Select volume</option>
            <option>Less than 5,00,000</option>
            <option>5,00,000 - 25,00,000</option>
            <option>25,00,000 - 1,00,00,000</option>
            <option>More than 1,00,00,000</option>
          </select>
        </div>

        {/* Router Details */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 mb-4 mt-6">
            Router Configuration
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Router Make & Model
          </label>
          <input
            type="text"
            placeholder="e.g., Cisco ASR1000"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Redundant Router Location
          </label>
          <input
            type="text"
            placeholder="Specify locations"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          />
        </div>

        {/* AUA/KUA Information */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 mb-4 mt-6">
            AUA/KUA Information
          </h3>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Geographies Catered (States)
          </label>
          <textarea
            placeholder="Enter states/territories"
            rows="3"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none"
          ></textarea>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            AUA/KUA Support Type
          </label>
          <select className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200 focus:outline-none">
            <option>Select option</option>
            <option>Self as AUA/KUA only</option>
            <option>Other entities as AUA/KUA only</option>
            <option>Self as AUA/KUA and Other entities as AUA/KUA</option>
          </select>
        </div>
      </div>
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

export default ASADetailsForm;

