import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";
import MapView from "./MapView";
import { useNavigate } from "react-router-dom";

export default function ReportIncident() {
  const navigate = useNavigate();
  const [type, setType] = useState("Fire");
  const [severity, setSeverity] = useState("Medium");
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false); // NEW

  const submitIncident = async () => {
    if (!location) {
      alert("Please select a location on the map!");
      return;
    }

    try {
      setLoading(true); // START LOADING

      await addDoc(collection(db, "incidents"), {
        type,
        severity,
        lat: location.lat,
        lng: location.lng,
        status: "reported",
        createdAt: new Date(),
      });

      alert("Incident reported successfully");
      navigate("/dashboard");
    } catch (err) {
      alert("Error submitting incident: " + err.message);
    } finally {
      setLoading(false); // STOP LOADING
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Report Incident</h2>

        <label>Incident Type</label>
        <select onChange={(e) => setType(e.target.value)} value={type}>
          <option>Fire</option>
          <option>Flood</option>
          <option>Accident</option>
          <option>Medical</option>
        </select>

        <label>Severity</label>
        <select onChange={(e) => setSeverity(e.target.value)} value={severity}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <label>Select Location on Map</label>
        <MapView location={location} setLocation={setLocation} />

        <button 
          onClick={submitIncident} 
          style={{ marginTop: "10px" }} 
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
}
