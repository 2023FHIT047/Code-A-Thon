import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import DashboardMap from "./DashboardMap";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "incidents"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIncidents(data);
    });

    return () => unsub();
  }, []);

  return (
    <div style={{ padding: "15px" }}>
      
      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h2>Incident Dashboard</h2>

        <button
          onClick={() => navigate("/report")}
          style={{
            padding: "10px 15px",
            background: "#d32f2f",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px"
          }}
        >
          + Report Incident
        </button>
      </div>

      {/* MAP */}
      <DashboardMap incidents={incidents} />
    </div>
  );
}
