import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FormPage from "./pages/FormPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AuditorDashboard from "./pages/AuditorDashboard";
import ISDivisionDashboard from "./pages/ISDivisionDashboard";
import TechCentreDashboard from "./pages/TechCentreDashboard";
import ApplicationSuccess from "./pages/ApplicationSuccess";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/dashboard/auditor" element={<AuditorDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/is-division" element={<ISDivisionDashboard />} />
        <Route path="/dashboard/tech-centre" element={<TechCentreDashboard />} />
        <Route path="/application-success" element={<ApplicationSuccess />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
