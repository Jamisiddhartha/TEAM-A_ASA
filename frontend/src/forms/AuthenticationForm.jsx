function AuthenticationForm({ activeStep, setActiveStep }) {

  if (activeStep !== 4) return null;

  return (

<form
onSubmit={(e)=>{
e.preventDefault();
setActiveStep(5);
}}
className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md"
>

<h2 className="text-xl font-semibold text-yellow-500 mb-6">
AUTHENTICATION
</h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">


{/* Authentication Checkboxes */}

<div className="md:col-span-2">
<h3 className="text-lg font-semibold text-gray-700 mb-4">
Authentication Requirements <span className="text-red-500 font-bold">*</span>
</h3>

<p className="text-sm text-gray-600 mb-4">
Please confirm the following authentication criteria:
</p>
</div>


<div className="md:col-span-2 flex items-center">
<input required type="checkbox" className="mr-3"/>
<span className="text-sm">
Applicant is authorized to submit this application
</span>
</div>


<div className="md:col-span-2 flex items-center">
<input required type="checkbox" className="mr-3"/>
<span className="text-sm">
All information provided is accurate and true
</span>
</div>


<div className="md:col-span-2 flex items-center">
<input required type="checkbox" className="mr-3"/>
<span className="text-sm">
Organization complies with data protection regulations
</span>
</div>


<div className="md:col-span-2 flex items-center">
<input required type="checkbox" className="mr-3"/>
<span className="text-sm">
Organization has adequate security infrastructure
</span>
</div>


<div className="md:col-span-2 flex items-center">
<input required type="checkbox" className="mr-3"/>
<span className="text-sm">
Organization understands the terms and conditions
</span>
</div>



{/* Authorized Officer */}

<div className="md:col-span-2 mt-6">
<h3 className="text-lg font-semibold text-gray-700 mb-4">
Authorized Officer Details
</h3>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Officer Name <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="text"
placeholder="Full name of authorized officer"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Officer Designation <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="text"
placeholder="Designation"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Officer Email <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="email"
pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
placeholder="Email address"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Officer Phone <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="tel"
pattern="[0-9]{10}"
maxLength="10"
inputMode="numeric"
placeholder="10 digit phone number"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>

</div>


{/* Navigation Buttons */}

<div className="flex justify-between mt-10">

<button
type="button"
onClick={()=>setActiveStep(3)}
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

export default AuthenticationForm;