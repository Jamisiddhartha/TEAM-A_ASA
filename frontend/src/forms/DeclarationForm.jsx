import { useNavigate } from "react-router-dom";

function DeclarationForm({ activeStep, setActiveStep }) {

  const navigate = useNavigate();

  if (activeStep !== 5) return null;

  return (

<form
onSubmit={(e)=>{
e.preventDefault();
alert("Application Submitted Successfully");
navigate("/");
}}
className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md"
>

<h2 className="text-xl font-semibold text-yellow-500 mb-6">
DECLARATION
</h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">


{/* Declaration Section */}

<div className="md:col-span-2">
<h3 className="text-lg font-semibold text-gray-700 mb-4">
Declaration & Acknowledgments <span className="text-red-500 font-bold">*</span>
</h3>

<p className="text-sm text-gray-600 mb-6">
I hereby declare that the information provided in this application
is true and correct to the best of my knowledge and belief.
</p>
</div>


{/* Checkboxes */}

<div className="md:col-span-2 flex items-start gap-3">
<input required type="checkbox" className="mt-1"/>
<span className="text-sm">
I certify that the applicant is authorized to submit this application.
</span>
</div>

<div className="md:col-span-2 flex items-start gap-3">
<input required type="checkbox" className="mt-1"/>
<span className="text-sm">
The information provided in this application is accurate and complete.
</span>
</div>

<div className="md:col-span-2 flex items-start gap-3">
<input required type="checkbox" className="mt-1"/>
<span className="text-sm">
The applicant has the required operational and technical capacity.
</span>
</div>

<div className="md:col-span-2 flex items-start gap-3">
<input required type="checkbox" className="mt-1"/>
<span className="text-sm">
The applicant agrees to comply with all applicable regulations.
</span>
</div>

<div className="md:col-span-2 flex items-start gap-3">
<input required type="checkbox" className="mt-1"/>
<span className="text-sm">
False information may result in rejection or legal action.
</span>
</div>

<div className="md:col-span-2 flex items-start gap-3">
<input required type="checkbox" className="mt-1"/>
<span className="text-sm">
The applicant agrees to maintain data security and privacy.
</span>
</div>


{/* Declarant Details */}

<div className="md:col-span-2 mt-6">
<h3 className="text-lg font-semibold text-gray-700 mb-4">
Declarant Details
</h3>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Declarant Name <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="text"
placeholder="Full name"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Declarant Designation <span className="text-red-500 font-bold">*</span>
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
Declarant Email <span className="text-red-500 font-bold">*</span>
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
Declarant Phone <span className="text-red-500 font-bold">*</span>
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


<div className="md:col-span-2">
<label className="block text-sm font-medium mb-1">
Date of Declaration <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="date"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


<div className="md:col-span-2">
<label className="block text-sm font-medium mb-1">
Signature / Digital Signature <span className="text-red-500 font-bold">*</span>
</label>

<textarea
required
rows="3"
placeholder="Enter signature details"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
></textarea>
</div>

</div>


{/* Navigation Buttons */}

<div className="flex justify-between mt-10">

<button
type="button"
onClick={()=>setActiveStep(4)}
className="px-6 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600"
>
Previous
</button>

<button
type="submit"
className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
>
Submit Application
</button>

</div>

</form>

  );
}

export default DeclarationForm;