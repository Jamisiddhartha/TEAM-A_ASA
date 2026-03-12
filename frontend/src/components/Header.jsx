import { Link, useNavigate } from "react-router-dom";
import uidaiLogo from "../assets/uidai-logo.jpg";

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="w-full bg-white border-b shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-screen-xl mx-auto px-8 py-3 flex items-center">
        <div className="flex items-center gap-3">
          <img src={uidaiLogo} className="h-10" alt="UIDAI" />
          <div>
            <h1 className="text-xl font-semibold">
              <span style={{ color: "#FFE600" }}>UIDAI</span> Portal
            </h1>
            <p className="text-xs text-gray-500">ASA Onboarding</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center ml-auto gap-6 text-sm text-gray-700">
          <Link to="/" className="hover:text-yellow-400 cursor-pointer">Home</Link>
          <a href="#" className="hover:text-orange-500 cursor-pointer">About</a>
          <a href="#" className="hover:text-orange-500 cursor-pointer">Onboarding Process</a>
          <a href="#" className="hover:text-orange-500 cursor-pointer">Guidelines</a>
        </nav>

        <div className="hidden md:flex items-center gap-4 ml-6">
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-md font-semibold text-black"
            style={{ background: "#FFE600" }}
          >
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border bg-gray-300 border-gray-400 rounded-md hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;



