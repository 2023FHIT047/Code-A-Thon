import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* 🔧 FIX LEAFLET ICON ISSUE */
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

  /* 🔥 FETCH INCIDENTS */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "incidents"), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setIncidents(data);
    });
    return () => unsub();
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>

      {/* ================= FULL SCREEN MAP ================= */}
      {showMap && (
        <div style={styles.mapOverlay}>
          <button style={styles.closeBtn} onClick={() => setShowMap(false)}>
            ✖ Close Map
          </button>

          <MapContainer
            center={[20, 78]}
            zoom={5}
            style={{ height: "100vh", width: "100vw" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {incidents.map(inc => (
              <Marker key={inc.id} position={[inc.lat, inc.lng]}>
                <Popup>
                  <b>{inc.title}</b><br />
                  Status: {inc.status}<br />
                  Severity: {inc.severity}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* ================= NORMAL LANDING PAGE ================= */}
      {!showMap && (
        <>
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
                Volunteer / Agency Signup
              </button>
            </div>
          </section>

          {/* FEATURES */}
          <section style={styles.section}>
            <h2>What We Offer</h2>
            <div style={styles.features}>
              <Feature title="Live Incident Map" desc="Public real-time incident visibility" />
              <Feature title="Volunteer Coordination" desc="Assign helpers efficiently" />
              <Feature title="Resource Tracking" desc="Ambulances, shelters, supplies" />
              <Feature title="Admin Control" desc="Centralized decision making" />
            </div>
          </section>

          {/* FOOTER */}
          <footer style={styles.footer}>
            © 2025 CrisisConnect | Hackathon Prototype
          </footer>
        </>
      )}
    </div>
  );
}

/* ================= FEATURE CARD ================= */
function Feature({ title, desc }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

/* ================= STYLES ================= */
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
    background: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  primaryBtn: {
    padding: "12px 20px",
    background: "#d32f2f",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    margin: "10px",
  },
  secondaryBtn: {
    padding: "12px 20px",
    background: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    margin: "10px",
  },
  footer: {
    padding: "15px",
    textAlign: "center",
    background: "#eeeeee",
  },

  /* MAP OVERLAY */
  mapOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "#000",
  },
  closeBtn: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10000,
    padding: "10px 15px",
    background: "#d32f2f",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
