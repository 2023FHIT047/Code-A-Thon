import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";
import CommunityDashboard from "./pages/CommunityDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import ResourceManagerDashboard from "./pages/ResourceManager"
import MapView from "./pages/MapView"
import "./pages/styles.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/CommunityDashboard" element={<CommunityDashboard />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/ResourceManagerDashboard" element={<ResourceManagerDashboard />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/VolunteerDashboard" element={<VolunteerDashboard />} />
        <Route path="/map" element={<MapView />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
