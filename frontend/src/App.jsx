import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";

import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";
import FormPage from "./pages/FormPage";

function App() {
  return (
    <BrowserRouter>



      <Routes>

        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/form" element={<FormPage />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;