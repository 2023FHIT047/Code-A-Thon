import { useNavigate } from "react-router-dom";
import MapView from "./MapView";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h2>Live Incident Dashboard</h2>

      <div className="card">
        <MapView />
      </div>

      <div className="card" style={{ textAlign: "right" }}>
        <button onClick={() => navigate("/report")}>
          + Report New Incident
        </button>
      </div>
    </div>
  );
}
