import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function CommunityDashboard() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("report");
  const [incidents, setIncidents] = useState([]);
  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    severity: "Low",
    lat: null,
    lng: null,
  });
  const [loading, setLoading] = useState(false);

  // Get logged-in user
  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) setUser({ uid: currentUser.uid, email: currentUser.email });
    else {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) setUser(storedUser);
    }
  }, []);

  // Fetch incidents
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "incidents"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIncidents(data);
    });
    return () => unsub();
  }, []);

  // Submit new incident
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || newIncident.lat === null || newIncident.lng === null) {
      alert("Please select a location on the map.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "incidents"), {
        ...newIncident,
        status: "Pending",
        reportedBy: user.uid,
      });
      setNewIncident({ title: "", description: "", severity: "Low", lat: null, lng: null });
      alert("Incident reported successfully!");
    } catch (err) {
      alert("Error reporting incident: " + err.message);
    }
    setLoading(false);
  };

  if (!user) return <p>Loading user info...</p>;

  const myReports = incidents.filter(inc => inc.reportedBy === user.uid);

  // Component for selecting location by clicking on map
  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        setNewIncident({ ...newIncident, lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return newIncident.lat && newIncident.lng ? <Marker position={[newIncident.lat, newIncident.lng]} /> : null;
  };

  const renderSection = () => {
    switch (activeSection) {
      case "report":
        return (
          <div style={styles.section}>
            <h3>🚨 Report a New Incident</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="text"
                placeholder="Title"
                value={newIncident.title}
                onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={newIncident.description}
                onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                required
              />
              <select
                value={newIncident.severity}
                onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>

              <p>
                {newIncident.lat && newIncident.lng
                  ? `Selected Location: (${newIncident.lat.toFixed(4)}, ${newIncident.lng.toFixed(4)})`
                  : "Click on the map to select location"}
              </p>

              <MapContainer center={[20, 78]} zoom={5} style={{ height: 300, marginBottom: 10 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationSelector />
              </MapContainer>

              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? "Reporting..." : "Report Incident"}
              </button>
            </form>
          </div>
        );

      case "myReports":
        return (
          <div style={styles.section}>
            <h3>📝 My Reported Incidents</h3>
            <MapContainer center={[20, 78]} zoom={5} style={{ height: 300, marginBottom: 10 }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {myReports.map(inc => (
                <Marker key={inc.id} position={[inc.lat, inc.lng]}>
                  <Popup>{inc.title} - {inc.status}</Popup>
                </Marker>
              ))}
            </MapContainer>
            {myReports.map(inc => (
              <div key={inc.id} style={styles.card}>
                <h4>{inc.title}</h4>
                <p>{inc.description}</p>
                <p><b>Status:</b> {inc.status}</p>
                <p><b>Severity:</b> {inc.severity}</p>
              </div>
            ))}
          </div>
        );

      case "allIncidents":
        return (
          <div style={styles.section}>
            <h3>🌍 All Incidents</h3>
            <MapContainer center={[20, 78]} zoom={5} style={{ height: 300, marginBottom: 10 }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {incidents.map(inc => (
                <Marker key={inc.id} position={[inc.lat, inc.lng]}>
                  <Popup>{inc.title} - {inc.status}</Popup>
                </Marker>
              ))}
            </MapContainer>
            {incidents.map(inc => (
              <div key={inc.id} style={styles.card}>
                <h4>{inc.title}</h4>
                <p>{inc.description}</p>
                <p><b>Status:</b> {inc.status}</p>
                <p><b>Severity:</b> {inc.severity}</p>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2>🏘 Community Panel</h2>
        <nav>
          <button style={styles.navBtn} onClick={() => setActiveSection("report")}>Report Incident</button>
          <button style={styles.navBtn} onClick={() => setActiveSection("myReports")}>My Reports</button>
          <button style={styles.navBtn} onClick={() => setActiveSection("allIncidents")}>All Incidents</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {renderSection()}
      </main>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "Arial", background: "#f4f6f8" },
  sidebar: { width: "220px", background: "#16a085", color: "#fff", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" },
  navBtn: { padding: "10px 15px", margin: "5px 0", background: "#1abc9c", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", textAlign: "left" },
  mainContent: { flex: 1, padding: "20px", overflowY: "auto" },
  section: { background: "#fff", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", marginBottom: "20px" },
  card: { background: "#fafafa", padding: "12px", marginBottom: "12px", borderRadius: "6px", display: "grid", gap: "8px" },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  button: { padding: 10, background: "#16a085", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" },
};
