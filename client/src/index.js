import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";
import ReportIncident from "./pages/ReportIncident";
import VolunteerDashboard from "./pages/VolunteerDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import "./pages/styles.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/map" element={<Dashboard />} />
        <Route path="/report" element={<ReportIncident />} />
        <Route path="/dashboard" element={<LandingPage />} />
        <Route path="/VolunteerDashboard" element={<VolunteerDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
