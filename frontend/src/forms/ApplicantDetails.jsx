import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import uidaiLogo from "../assets/uidai-logo.jpg";

import ContactDetails from "./ContactDetails";
import ASADetailsForm from "./ASADetailsForm";
import AuthenticationForm from "./AuthenticationForm";
import DeclarationForm from "./DeclarationForm";

function ApplicationForm() {

  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {

    const parentHeader = document.querySelector("div.w-full.bg-white.shadow-md.border-b");

    if (parentHeader) {
      parentHeader.style.display = "none";
    }

  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* HEADER */}

      <header className="fixed top-0 left-0 w-full bg-white border-b shadow-sm z-50">
        <div className="max-w-screen-xl mx-auto px-8 py-3 flex items-center">

          <div className="flex items-center gap-3">
            <img src={uidaiLogo} className="h-10" alt="uidai" />

            <div>
              <h1 className="text-xl font-semibold">
                <span className="text-yellow-500">UIDAI</span> Portal
              </h1>
              <p className="text-xs text-gray-500">ASA Onboarding</p>
            </div>
          </div>

          <div className="ml-auto">
            <Link
              to="/login"
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-red-600"
            >
              Logout
            </Link>
          </div>

        </div>
      </header>


      {/* MAIN */}

      <div className="flex flex-1 pt-10 pb-12">


        {/* SIDEBAR */}

        <div className="w-72 bg-black text-white p-6">

          <h2 className="text-2xl font-bold text-yellow-400 mb-10">
            Application Portal
          </h2>

          <ul className="space-y-4">

            {/* STEP 1 */}

            <li
              className={`p-2 rounded ${activeStep >= 1
                ? "cursor-pointer bg-yellow-500 text-black"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
              }`}
              onClick={() => activeStep >= 1 && setActiveStep(1)}
            >
              1. Applicant Details
            </li>

            {/* STEP 2 */}

            <li
              className={`p-2 rounded ${activeStep >= 2
                ? "cursor-pointer bg-yellow-500 text-black"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
              }`}
              onClick={() => activeStep >= 2 && setActiveStep(2)}
            >
              2. Contact Details
            </li>

            {/* STEP 3 */}

            <li
              className={`p-2 rounded ${activeStep >= 3
                ? "cursor-pointer bg-yellow-500 text-black"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
              }`}
              onClick={() => activeStep >= 3 && setActiveStep(3)}
            >
              3. ASA Form
            </li>

            {/* STEP 4 */}

            <li
              className={`p-2 rounded ${activeStep >= 4
                ? "cursor-pointer bg-yellow-500 text-black"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
              }`}
              onClick={() => activeStep >= 4 && setActiveStep(4)}
            >
              4. Authentication
            </li>

            {/* STEP 5 */}

            <li
              className={`p-2 rounded ${activeStep >= 5
                ? "cursor-pointer bg-yellow-500 text-black"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
              }`}
              onClick={() => activeStep >= 5 && setActiveStep(5)}
            >
              5. Declaration
            </li>

          </ul>

        </div>


        {/* FORM AREA */}

        <div className="flex-1 p-10 overflow-y-auto">


          {/* CENTER WRAPPER */}

          <div className="max-w-5xl mx-auto">

            <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
              ASA Application Form
            </h1>


            {/* STEP PROGRESS */}

            <div className="mb-10 justify-center">
              <div className="flex items-center justify-center">

                {[1,2,3,4,5].map((step) => (

                  <div key={step} className="flex items-center">

                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full font-bold
                      ${activeStep >= step ? "bg-yellow-500 text-black" : "bg-gray-300 text-gray-600"}`}
                    >
                      {step}
                    </div>

                    {step !== 5 && (
                      <div
                        className={`w-24 h-1 mx-2 ${activeStep > step ? "bg-yellow-500" : "bg-gray-300"}`}
                      ></div>
                    )}

                  </div>

                ))}

              </div>
            </div>


            {/* PROGRESS BAR */}

            <div className="mb-6">

              <div className="flex justify-between mb-1 text-sm font-medium px-1">

                <span>
                  {
                    [
                      "Applicant Details",
                      "Contact Details",
                      "ASA Form",
                      "Authentication",
                      "Declaration"
                    ][activeStep - 1]
                  }
                </span>

                <span>{(activeStep - 1) * 20}%</span>

              </div>

              <div className="w-full bg-gray-300 rounded-full h-3">

                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(activeStep - 1) * 20}%` }}
                ></div>

              </div>

            </div>

          </div>


          {/* STEP 1 FORM */}

          {activeStep === 1 && (

            <form
              onSubmit={(e)=>{
                e.preventDefault();
                setActiveStep(2);
              }}
              className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md"
            >

              <h2 className="text-xl font-semibold text-yellow-500 mb-6">
                APPLICANT DETAILS
              </h2>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                <div>
                  <label className="block text-sm font-medium mb-1">
                    Type of Applicant <span className="text-red-500 font-bold">*</span>
                  </label>

                  <select required className="w-full border p-2 rounded-md">
                    <option value="">Please Select</option>
                    <option>Government</option>
                    <option>Private</option>
                  </select>
                </div>


                <div>
                  <label className="block text-sm font-medium mb-1">
                    Applicant Name <span className="text-red-500 font-bold">*</span>
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="Applicant Name"
                    className="w-full border p-2 rounded-md"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium mb-1">
                    Registration / Incorporation No. <span className="text-red-500 font-bold">*</span>
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="Registration Number"
                    className="w-full border p-2 rounded-md"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium mb-1">
                    License Number <span className="text-red-500 font-bold">*</span>
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="License Number"
                    className="w-full border p-2 rounded-md"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium mb-1">
                    Registered Office Address <span className="text-red-500 font-bold">*</span>
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="Registered office address"
                    className="w-full border p-2 rounded-md"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium mb-1">
                    Correspondence Address <span className="text-red-500 font-bold">*</span>
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="Correspondence address"
                    className="w-full border p-2 rounded-md"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium mb-1">
                    GSTN Registration Number <span className="text-red-500 font-bold">*</span>
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="GSTN number"
                    className="w-full border p-2 rounded-md"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium mb-1">
                    TAN Number <span className="text-red-500 font-bold">*</span>
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="TAN number"
                    className="w-full border p-2 rounded-md"
                  />
                </div>

              </div>


              <div className="mt-6">

                <label className="block text-sm font-medium mb-1">
                  Category of Applicant <span className="text-red-500 font-bold">*</span>
                </label>

                <select required className="w-full border p-2 rounded-md">

                  <option value="">Select Category</option>

                  <option>Category 1: Ministry/Department of Central or State Government</option>
                  <option>Category 2: Authority constituted under Central or State Act</option>
                  <option>Category 3: Any other entity of national importance</option>
                  <option>Category 4: Company registered under Companies Act, 2013</option>
                  <option>Category 5: An AUA or a KUA</option>

                </select>

              </div>


              <div className="flex justify-between mt-8">

                <button
                  type="button"
                  disabled
                  className="px-6 py-2 bg-gray-300 rounded-md opacity-50 cursor-not-allowed"
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

          )}


          <ContactDetails activeStep={activeStep} setActiveStep={setActiveStep} />
          <ASADetailsForm activeStep={activeStep} setActiveStep={setActiveStep} />
          <AuthenticationForm activeStep={activeStep} setActiveStep={setActiveStep} />
          <DeclarationForm activeStep={activeStep} setActiveStep={setActiveStep} />

        </div>

      </div>


      {/* FOOTER */}

      <footer className="fixed bottom-0 left-0 w-full bg-white border-t py-4">

        <div className="max-w-screen-xl mx-auto px-8 flex items-center justify-between text-sm text-gray-500">

          <div className="flex items-center gap-2">
            <img src={uidaiLogo} className="h-6" />
            <span>UIDAI ASA Portal</span>
          </div>

          <div className="flex gap-6">
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>

        </div>

      </footer>

    </div>
  );
}

export default ApplicationForm;