import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import DashboardMap from "./DashboardMap";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // 🔥 REAL-TIME INCIDENT FETCH
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "incidents"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIncidents(data);
    });

    return () => unsub();
  }, []);

  // 🔎 SEARCH FILTER
  const filteredIncidents = incidents.filter((i) =>
    i.title?.toLowerCase().includes(search.toLowerCase())
  );

  // 📊 STATS
  const total = incidents.length;
  const pending = incidents.filter(i => i.status === "Pending").length;
  const resolved = incidents.filter(i => i.status === "Resolved").length;

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <h2>🚨 Incident Dashboard</h2>

        <button
          onClick={() => navigate("/report")}
          style={styles.reportBtn}
        >
          + Report Incident
        </button>
      </div>

      {/* STATS */}
      <div style={styles.stats}>
        <StatCard label="Total Incidents" value={total} />
        <StatCard label="Pending" value={pending} color="#f57c00" />
        <StatCard label="Resolved" value={resolved} color="#388e3c" />
      </div>

      {/* SEARCH */}
      <input
        style={styles.search}
        placeholder="Search incident..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* MAP */}
      <div style={styles.mapWrapper}>
        <DashboardMap incidents={filteredIncidents} />
      </div>

    </div>
  );
}

/* 📦 STAT CARD */
function StatCard({ label, value, color }) {
  return (
    <div style={{ ...styles.card, borderLeft: `6px solid ${color || "#1976d2"}` }}>
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  );
}

/* 🎨 STYLES */
const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    background: "#f4f6f8",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  reportBtn: {
    padding: "10px 15px",
    background: "#d32f2f",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },
  card: {
    background: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  search: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  mapWrapper: {
    height: "500px",
    background: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
};
