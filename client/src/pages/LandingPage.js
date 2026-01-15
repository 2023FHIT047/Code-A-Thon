import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 🔧 Fix Leaflet marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function LandingPage() {
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const [incidents, setIncidents] = useState([]);

  // 🔥 Fetch incidents from Firestore
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

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <h2>CrisisConnect</h2>
        <button style={styles.navBtn} onClick={() => navigate("/login")}>
          Login
        </button>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        <h1>Integrated Community Crisis Response Platform</h1>
        <p>
          View ongoing incidents, track resources, and coordinate emergency
          response in real time.
        </p>

        <div>
          <button
            style={styles.primaryBtn}
            onClick={() => setShowMap(true)}
          >
            View Live Incident Map
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => navigate("/signup")}
          >
            Volunteer / Agency Login
          </button>
        </div>
      </section>

      {/* 🗺️ LIVE MAP SECTION */}
      {showMap && (
        <section style={styles.mapSection}>
          <h2>🌍 Live Reported Incidents</h2>

          <MapContainer
            center={[20, 78]}
            zoom={5}
            style={{ height: "450px", width: "100%", borderRadius: "10px" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {incidents.map((inc) =>
              inc.lat && inc.lng ? (
                <Marker key={inc.id} position={[inc.lat, inc.lng]}>
                  <Popup>
                    <b>{inc.title}</b><br />
                    {inc.description}<br />
                    <b>Severity:</b> {inc.severity}<br />
                    <b>Status:</b> {inc.status}
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>

          {incidents.length === 0 && (
            <p style={{ marginTop: 10 }}>No incidents reported yet.</p>
          )}
        </section>
      )}

      {/* FEATURES */}
      <section style={styles.section}>
        <h2>What We Offer</h2>
        <div style={styles.features}>
          <Feature title="Community Incident Visibility" desc="Anyone can view live incidents on the public map." />
          <Feature title="Live Resource Tracking" desc="Track volunteers, ambulances, shelters, and supplies." />
          <Feature title="Role-Based Access" desc="Different dashboards for users, volunteers, and agencies." />
          <Feature title="Map-Based Dashboard" desc="All incidents visualized geographically in real time." />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>© 2025 CrisisConnect | Hackathon Prototype</p>
      </footer>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

/* 🎨 Styles */
const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 40px",
    background: "#0d47a1",
    color: "white",
  },
  navBtn: {
    padding: "8px 15px",
    background: "white",
    color: "#0d47a1",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  hero: {
    padding: "80px 20px",
    textAlign: "center",
    background: "#e3f2fd",
  },
  mapSection: {
    padding: "40px 20px",
    textAlign: "center",
    background: "#f4f6f8",
  },
  section: {
    padding: "60px 20px",
    textAlign: "center",
  },
  features: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "30px",
  },
  card: {
    padding: "20px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  primaryBtn: {
    padding: "12px 20px",
    margin: "10px",
    background: "#d32f2f",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "12px 20px",
    margin: "10px",
    background: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  footer: {
    padding: "15px",
    textAlign: "center",
    background: "#eeeeee",
  },
};
