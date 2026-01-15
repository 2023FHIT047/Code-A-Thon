import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaMapMarkedAlt, FaUsers, FaBoxOpen, FaCogs } from "react-icons/fa";

/* Fix Leaflet Icon Issue */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

/* Custom CountUp Hook */
function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 50);
    const interval = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 50);
    return () => clearInterval(interval);
  }, [target, duration]);
  return count;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [volunteers, setVolunteers] = useState(0);
  const [resources, setResources] = useState(0);

  /* Fetch incidents */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "incidents"), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setIncidents(data);
    });

    const unsubVolunteers = onSnapshot(collection(db, "volunteers"), snap => {
      setVolunteers(snap.size);
    });

    const unsubResources = onSnapshot(collection(db, "resources"), snap => {
      setResources(snap.size);
    });

    return () => {
      unsub();
      unsubVolunteers();
      unsubResources();
    };
  }, []);

  const incidentCount = useCountUp(incidents.length);
  const volunteerCount = useCountUp(volunteers);
  const resourceCount = useCountUp(resources);

  return (
    <div className="font-poppins">
      {/* FULL SCREEN MAP */}
      {showMap && (
        <div style={styles.mapOverlay}>
          <button style={styles.closeBtn} onClick={() => setShowMap(false)}>✖ Close Map</button>
          <MapContainer center={[20, 78]} zoom={5} style={{ height: "100vh", width: "100vw" }}>
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

      {!showMap && (
        <>
          {/* NAVBAR */}
          <nav style={styles.nav}>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem" }}>CrisisConnect</h1>
            <div>
              <button style={styles.navBtn} onClick={() => navigate("/login")}>Login</button>
              <button style={styles.navBtnPrimary} onClick={() => navigate("/signup")}>Signup</button>
            </div>
          </nav>

          {/* HERO */}
          <section style={styles.hero}>
            <div style={styles.heroContent}>
              <h1 style={styles.heroTitle}>Stay Safe. Respond Fast.</h1>
              <p style={styles.heroSubtitle}>
                Integrated community crisis response platform. View live incidents, track resources, and coordinate volunteers in real-time.
              </p>
              <div style={styles.heroBtnGroup}>
                <button style={styles.heroBtnPrimary} onClick={() => setShowMap(true)}>View Live Map</button>
                <button style={styles.heroBtnSecondary} onClick={() => navigate("/signup")}>Join as Volunteer</button>
              </div>
            </div>

            {/* STATS COUNTERS */}
            <div style={styles.statsSection}>
              <div style={styles.statCard}>
                <h2>{incidentCount}</h2>
                <p>Incidents Reported</p>
              </div>
              <div style={styles.statCard}>
                <h2>{volunteerCount}</h2>
                <p>Active Volunteers</p>
              </div>
              <div style={styles.statCard}>
                <h2>{resourceCount}</h2>
                <p>Resources Tracked</p>
              </div>
            </div>
          </section>

          {/* FEATURES */}
          <section style={styles.featuresSection}>
            <h2 style={styles.featuresTitle}>Our Features</h2>
            <div style={styles.featuresGrid}>
              <Feature icon={<FaMapMarkedAlt />} title="Live Incident Map" desc="Real-time visibility of all reported incidents." />
              <Feature icon={<FaUsers />} title="Volunteer Coordination" desc="Efficiently assign and manage volunteers." />
              <Feature icon={<FaBoxOpen />} title="Resource Tracking" desc="Monitor ambulances, shelters, and medical supplies." />
              <Feature icon={<FaCogs />} title="Admin Control" desc="Centralized dashboard for decision-making." />
            </div>
          </section>

          {/* FOOTER */}
          <footer style={styles.footer}>
            <p>© 2026 CrisisConnect | Hackathon Prototype</p>
            <div style={styles.socialLinks}>
              <a href="#" style={styles.social}>Facebook</a>
              <a href="#" style={styles.social}>Twitter</a>
              <a href="#" style={styles.social}>LinkedIn</a>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

/* FEATURE CARD */
function Feature({ icon, title, desc }) {
  return (
    <div style={styles.featureCard}>
      <div style={{ fontSize: "2rem", color: "#1976d2", marginBottom: "15px" }}>{icon}</div>
      <h3 style={{ marginBottom: "8px" }}>{title}</h3>
      <p style={{ color: "#555" }}>{desc}</p>
    </div>
  );
}

/* STYLES */
const styles = {
  nav: { display: "flex", justifyContent: "space-between", padding: "20px 50px", position: "sticky", top: 0, zIndex: 1000, background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", alignItems: "center" },
  navBtn: { padding: "10px 20px", marginRight: "10px", borderRadius: "25px", border: "1px solid #1976d2", background: "white", color: "#1976d2", cursor: "pointer", fontWeight: "600", transition: "all 0.3s" },
  navBtnPrimary: { padding: "10px 20px", borderRadius: "25px", border: "none", background: "#1976d2", color: "white", cursor: "pointer", fontWeight: "600", transition: "all 0.3s" },
  hero: { padding: "120px 20px 60px 20px", textAlign: "center", background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)", color: "white", clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" },
  heroContent: { maxWidth: "700px", margin: "0 auto", textAlign: "center" },
  heroTitle: { fontSize: "3rem", fontWeight: "700", marginBottom: "20px" },
  heroSubtitle: { fontSize: "1.2rem", lineHeight: "1.8" },
  heroBtnGroup: { marginTop: "30px", display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" },
  heroBtnPrimary: { padding: "15px 35px", background: "#d32f2f", borderRadius: "50px", border: "none", color: "white", fontWeight: "600", cursor: "pointer", transition: "all 0.3s" },
  heroBtnSecondary: { padding: "15px 35px", background: "transparent", borderRadius: "50px", border: "2px solid white", color: "white", fontWeight: "600", cursor: "pointer", transition: "all 0.3s" },
  statsSection: { display: "flex", justifyContent: "center", gap: "40px", marginTop: "50px", flexWrap: "wrap" },
  statCard: { background: "rgba(255,255,255,0.15)", padding: "30px 50px", borderRadius: "20px", textAlign: "center", backdropFilter: "blur(10px)" },
  featuresSection: { padding: "80px 20px", textAlign: "center", background: "#f5f5f5" },
  featuresTitle: { fontSize: "2rem", marginBottom: "40px", color: "#0d47a1" },
  featuresGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "30px" },
  featureCard: { background: "white", padding: "30px 20px", borderRadius: "20px", boxShadow: "0 8px 25px rgba(0,0,0,0.1)", transition: "all 0.3s", cursor: "pointer" },
  footer: { padding: "50px 20px", textAlign: "center", background: "#0d47a1", color: "white" },
  socialLinks: { display: "flex", justifyContent: "center", gap: "15px", marginTop: "10px" },
  social: { color: "white", textDecoration: "none", fontWeight: "600", transition: "all 0.3s" },
  mapOverlay: { position: "fixed", inset: 0, zIndex: 9999, background: "#000" },
  closeBtn: { position: "absolute", top: 15, right: 15, zIndex: 10000, padding: "10px 15px", background: "#d32f2f", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
};
