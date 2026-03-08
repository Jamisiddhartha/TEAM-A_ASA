import Header from "../components/Header";
import ApplicantDetails from "../forms/ApplicantDetails.jsx";
import ContactDetails from "../forms/ContactDetails.jsx";
import ASADetailsForm from "../forms/ASADetailsForm.jsx";
import AuthenticationForm from "../forms/AuthenticationForm.jsx";
import DeclarationForm from "../forms/DeclarationForm.jsx";

function FormPage() {
  return (
    <div>
      <Header/>
      <h2>ASA Application Form</h2>

       <ApplicantDetails />
      <ContactDetails />
      <ASADetailsForm />
      <AuthenticationForm />
      <DeclarationForm />

    </div>
  );
}

export default FormPage;