function ASADetailsForm({ activeStep, setActiveStep }) {

  if (activeStep !== 3) return null;

  return (

<form
onSubmit={(e)=>{
e.preventDefault();
setActiveStep(4);
}}
className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md"
>

<h2 className="text-xl font-semibold text-yellow-500 mb-6">
ASA DETAILS
</h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">


{/* Proposed Location */}

<div className="md:col-span-2">
<h3 className="text-lg font-semibold text-gray-700 mb-4">
Proposed ASA Server Location(s)
</h3>
</div>


<div className="md:col-span-2">
<label className="block text-sm font-medium mb-1">
District (Primary DC) <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="text"
placeholder="District name"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


<div>
<label className="block text-sm font-medium mb-1">
State <span className="text-red-500 font-bold">*</span>
</label>

<select
required
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
>

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
<option>Delhi</option>

</select>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Country <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="text"
defaultValue="India"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


{/* Primary Data Centre */}

<div className="md:col-span-2 mt-6">
<h3 className="text-lg font-semibold text-gray-700 mb-4">
Primary Data Centre (DC)
</h3>
</div>


<div>
<label className="block text-sm font-medium mb-1">
MPOC/TPOC Name <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="text"
placeholder="Name"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Email Address <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="email"
pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
placeholder="Email"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Telephone/Mobile No. <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="tel"
pattern="[0-9]{10}"
maxLength="10"
inputMode="numeric"
placeholder="10 digit mobile number"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Address <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="text"
placeholder="DC Address"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


{/* Disaster Recovery */}

<div className="md:col-span-2 mt-6">
<h3 className="text-lg font-semibold text-gray-700 mb-4">
Disaster Recovery Centre (DR)
</h3>
</div>


<div>
<label className="block text-sm font-medium mb-1">
DR District <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="text"
placeholder="District"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


<div>
<label className="block text-sm font-medium mb-1">
MPOC/TPOC Name <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="text"
placeholder="Name"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


{/* Leased Lines */}

<div className="md:col-span-2 mt-6">
<h3 className="text-lg font-semibold text-gray-700 mb-4">
Leased Lines Configuration
</h3>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Planned Leased Line Capacity (Mbps) <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="number"
min="1"
placeholder="e.g., 20"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


{/* Authentication Volume */}

<div className="md:col-span-2">
<label className="block text-sm font-medium mb-1">
Expected Authentication Transaction Volume (per day) <span className="text-red-500 font-bold">*</span>
</label>

<select
required
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
>

<option value="">Select volume</option>
<option>Less than 5,00,000</option>
<option>5,00,000 - 25,00,000</option>
<option>25,00,000 - 1,00,00,000</option>
<option>More than 1,00,00,000</option>

</select>
</div>

</div>


{/* Buttons */}

<div className="flex justify-between mt-10">

<button
type="button"
onClick={()=>setActiveStep(2)}
className="px-6 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600"
>
Previous
</button>

<button
type="submit"
className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-md hover:bg-yellow-600"
>
Next
</button>

</div>

</form>

  );
}

export default ASADetailsForm;