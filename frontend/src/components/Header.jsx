import { useNavigate } from "react-router-dom";
import logo from "../assets/uidai-logo.jpg";

function Header() {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="w-full bg-white shadow-md border-b">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">

         <img
  src={logo}
  alt="UIDAI"
  className="h-10"
/>
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              UIDAI ASA Onboarding Portal
            </h1>

            <p className="text-xs text-gray-500">
              Authentication Service Agency Application
            </p>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6">

       

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}

export default Header;