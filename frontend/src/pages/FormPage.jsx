import { Link } from "react-router-dom";
import Header from "../components/Header";
import ApplicantDetails from "../forms/ApplicantDetails.jsx";

function FormPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">ASA Application Form</h2>
            <p className="text-sm text-gray-500">
              Complete your original multi-step form and submit your ASA application details.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-lg font-semibold text-black"
            style={{ background: "#FFE600" }}
          >
            Go To Dashboard
          </Link>
        </div>
      </div>

      <ApplicantDetails />
    </div>
  );
}

export default FormPage;


