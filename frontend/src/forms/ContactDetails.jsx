function ContactDetails({ activeStep, setActiveStep }) {

  if (activeStep !== 2) return null;

  return (

<form
  onSubmit={(e)=>{
    e.preventDefault();
    setActiveStep(3);
  }}
  className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md"
>

<h2 className="text-xl font-semibold text-yellow-500 mb-6">
CONTACT DETAILS
</h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">


{/* KMP */}

<div className="md:col-span-2">
<h3 className="text-lg font-semibold text-gray-700 mb-4">
Key Managerial Personnel (KMP)
</h3>
</div>

<div>
<label className="block text-sm font-medium mb-1">
KMP Name <span className="text-red-500 font-bold">*</span>
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
Full Designation <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="text"
placeholder="Full designation"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Official Email Address <span className="text-red-500 font-bold">*</span>
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
Mobile Number <span className="text-red-500 font-bold">*</span>
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


{/* CISO */}

<div className="md:col-span-2 mt-6">
<h3 className="text-lg font-semibold text-gray-700 mb-4">
Chief Information Security Officer (CISO)
</h3>
</div>

<div>
<label className="block text-sm font-medium mb-1">
CISO Name <span className="text-red-500 font-bold">*</span>
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
Full Designation <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="text"
placeholder="Full designation"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Official Email Address <span className="text-red-500 font-bold">*</span>
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
Mobile Number <span className="text-red-500 font-bold">*</span>
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


{/* MPOC */}

<div className="md:col-span-2 mt-6">
<h3 className="text-lg font-semibold text-gray-700 mb-4">
Management Point of Contact (MPOC)
</h3>
</div>

<div>
<label className="block text-sm font-medium mb-1">
MPOC Name <span className="text-red-500 font-bold">*</span>
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
Full Designation <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="text"
placeholder="Full designation"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Official Email Address <span className="text-red-500 font-bold">*</span>
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
Mobile Number <span className="text-red-500 font-bold">*</span>
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


{/* Grievance */}

<div className="md:col-span-2 mt-6">
<h3 className="text-lg font-semibold text-gray-700 mb-4">
Grievance Redressal Details
</h3>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Website URL <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="url"
placeholder="Website URL"
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
placeholder="Grievance email"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Helpdesk Number <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="tel"
pattern="[0-9]{10}"
maxLength="10"
inputMode="numeric"
placeholder="10 digit helpdesk number"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>


<div>
<label className="block text-sm font-medium mb-1">
Grievance Officer Name <span className="text-red-500 font-bold">*</span>
</label>

<input
required
type="text"
placeholder="Officer name"
className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-yellow-400"
/>
</div>

</div>


{/* Buttons */}

<div className="flex justify-between mt-10">

<button
type="button"
onClick={()=>setActiveStep(1)}
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

export default ContactDetails;