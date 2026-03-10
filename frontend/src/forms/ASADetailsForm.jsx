function ASADetailsForm({ activeStep, formData, handleInputChange }) {
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
            name="dcDistrict"
            value={formData.dcDistrict || ""}
            onChange={handleInputChange}
            placeholder="District name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <select 
            required 
            name="dcState"
            value={formData.dcState || ""}
            onChange={handleInputChange}
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          >
            <option value="">Select State</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            <option value="Assam">Assam</option>
            <option value="Bihar">Bihar</option>
            <option value="Chhattisgarh">Chhattisgarh</option>
            <option value="Goa">Goa</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Haryana">Haryana</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Kerala">Kerala</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Manipur">Manipur</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Odisha">Odisha</option>
            <option value="Punjab">Punjab</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Telangana">Telangana</option>
            <option value="Tripura">Tripura</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Uttarakhand">Uttarakhand</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
            <option value="Chandigarh">Chandigarh</option>
            <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
            <option value="Lakshadweep">Lakshadweep</option>
            <option value="Delhi">Delhi</option>
            <option value="Puducherry">Puducherry</option>
            <option value="Ladakh">Ladakh</option>
            <option value="Jammu and Kashmir">Jammu and Kashmir</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <input
            type="text"
            name="dcCountry"
            value={formData.dcCountry || "India"}
            onChange={handleInputChange}
            placeholder="Country"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
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
            name="dcContactName"
            value={formData.dcContactName || ""}
            onChange={handleInputChange}
            placeholder="Name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            required
            type="email"
            name="dcContactEmail"
            value={formData.dcContactEmail || ""}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Telephone/Mobile No.
          </label>
          <input
            required
            type="tel"
            name="dcContactMobile"
            value={formData.dcContactMobile || ""}
            onChange={handleInputChange}
            placeholder="Phone number"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            name="dcAddress"
            value={formData.dcAddress || ""}
            onChange={handleInputChange}
            placeholder="DC Address"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
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
            name="drDistrict"
            value={formData.drDistrict || ""}
            onChange={handleInputChange}
            placeholder="District"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            MPOC/TPOC Name
          </label>
          <input
            required
            type="text"
            name="drContactName"
            value={formData.drContactName || ""}
            onChange={handleInputChange}
            placeholder="Name"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            required
            type="email"
            name="drContactEmail"
            value={formData.drContactEmail || ""}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
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
            name="drContactMobile"
            value={formData.drContactMobile || ""}
            onChange={handleInputChange}
            placeholder="Phone number (numbers only)"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
          <label className="block text-sm font-medium mb-1 mt-4">Address</label>
          <input
            type="text"
            name="drAddress"
            value={formData.drAddress || ""}
            onChange={handleInputChange}
            placeholder="DR Address"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
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
          <select 
            name="leasedLinesDC"
            value={formData.leasedLinesDC || ""}
            onChange={handleInputChange}
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          >
            <option value="">Select option</option>
            <option value="2 each at Manesar and Hebbal DC">2 each at Manesar and Hebbal DC (Recommended)</option>
            <option value="1 each at Manesar and Hebbal DC">1 each at Manesar and Hebbal DC</option>
            <option value="2 at Manesar and 1 at Hebbal DC">2 at Manesar and 1 at Hebbal DC</option>
            <option value="1 at Manesar and 2 at Hebbal DC">1 at Manesar and 2 at Hebbal DC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Connectivity Type
          </label>
          <select 
            name="connectivityType"
            value={formData.connectivityType || ""}
            onChange={handleInputChange}
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          >
            <option value="">Select option</option>
            <option value="MPLS">MPLS</option>
            <option value="Leased Line">Leased Line</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Service Provider
          </label>
          <select 
            name="serviceProvider"
            value={formData.serviceProvider || ""}
            onChange={handleInputChange}
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          >
            <option value="">Select provider</option>
            <option value="BSNL/MTNL">BSNL/MTNL</option>
            <option value="Airtel">Airtel</option>
            <option value="Jio">Jio</option>
            <option value="Tata">Tata</option>
            <option value="Vodafone-Idea Ltd">Vodafone-Idea Ltd</option>
            <option value="Others">Others</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Planned Leased Line Capacity (Mbps)
          </label>
          <input
            required
            type="number"
            name="capacityMbps"
            value={formData.capacityMbps || ""}
            onChange={handleInputChange}
            placeholder="e.g., 20"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        {/* IP Address Whitelisting */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            IP Address(es) to be Whitelisted
          </label>
          <textarea
            name="ipAddresses"
            value={formData.ipAddresses || ""}
            onChange={handleInputChange}
            placeholder="Enter IP addresses (one per line)"
            rows="4"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          ></textarea>
        </div>

        {/* Authentication Volume */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Expected Authentication Transaction Volume (per day)
          </label>
          <select 
            name="expectedVolume"
            value={formData.expectedVolume || ""}
            onChange={handleInputChange}
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          >
            <option value="">Select volume</option>
            <option value="Less than 5,00,000">Less than 5,00,000</option>
            <option value="5,00,000 - 25,00,000">5,00,000 - 25,00,000</option>
            <option value="25,00,000 - 1,00,00,000">25,00,000 - 1,00,00,000</option>
            <option value="More than 1,00,00,000">More than 1,00,00,000</option>
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
            name="routerModel"
            value={formData.routerModel || ""}
            onChange={handleInputChange}
            placeholder="e.g., Cisco ASR1000"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Redundant Router Location
          </label>
          <input
            type="text"
            name="routerLocation"
            value={formData.routerLocation || ""}
            onChange={handleInputChange}
            placeholder="Specify locations"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
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
            name="geographies"
            value={formData.geographies || ""}
            onChange={handleInputChange}
            placeholder="Enter states/territories"
            rows="3"
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          ></textarea>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            AUA/KUA Support Type
          </label>
          <select 
            name="auaSupportType"
            value={formData.auaSupportType || ""}
            onChange={handleInputChange}
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all duration-200"
          >
            <option value="">Select option</option>
            <option value="Self as AUA/KUA only">Self as AUA/KUA only</option>
            <option value="Other entities as AUA/KUA only">Other entities as AUA/KUA only</option>
            <option value="Self and Others">Self as AUA/KUA and Other entities as AUA/KUA</option>
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

