import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { db } from "./firebase";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* 🔧 FIX LEAFLET ICONS */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

export default function CommunityDashboard() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("report");
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    severity: "Low",
    lat: null,
    lng: null
  });

  /* 🔐 AUTH */
  useEffect(() => {
    const auth = getAuth();
    const u = auth.currentUser;
    if (u) setUser({ uid: u.uid, email: u.email });
  }, []);

  const logout = async () => {
    await signOut(getAuth());
    localStorage.clear();
    window.location.href = "/login";
  };

  /* 🚨 INCIDENTS */
  useEffect(() => {
    return onSnapshot(collection(db, "incidents"), snap => {
      setIncidents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const myReports = incidents.filter(i => i.reportedBy === user?.uid);

  /* ➕ SUBMIT */
  const submitIncident = async e => {
    e.preventDefault();
    if (!newIncident.lat || !newIncident.lng) {
      alert("Please select a location on the map");
      return;
    }

    setLoading(true);
    await addDoc(collection(db, "incidents"), {
      ...newIncident,
      status: "Pending",
      reportedBy: user.uid
    });

    setNewIncident({
      title: "",
      description: "",
      severity: "Low",
      lat: null,
      lng: null
    });

    setLoading(false);
    alert("Incident reported successfully");
  };

  /* 🗺 MAP PICKER */
  const LocationPicker = () => {
    useMapEvents({
      click(e) {
        setNewIncident({
          ...newIncident,
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      }
    });

    return newIncident.lat ? (
      <Marker position={[newIncident.lat, newIncident.lng]} />
    ) : null;
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div>
          <h2 style={styles.logo}>🏘 Community</h2>
          <p style={styles.email}>{user.email}</p>

          <nav style={styles.nav}>
            <button
              style={{
                ...styles.navBtn,
                ...(active === "report" && styles.navActive)
              }}
              onClick={() => setActive("report")}
            >
              🚨 Report Incident
            </button>

            <button
              style={{
                ...styles.navBtn,
                ...(active === "my" && styles.navActive)
              }}
              onClick={() => setActive("my")}
            >
              📝 My Reports
            </button>

            <button
              style={{
                ...styles.navBtn,
                ...(active === "all" && styles.navActive)
              }}
              onClick={() => setActive("all")}
            >
              🌍 All Incidents
            </button>
          </nav>
        </div>

        <button style={styles.logoutBtn} onClick={logout}>
          🚪 Logout
        </button>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        {active === "report" && (
          <div style={styles.card}>
            <h3>🚨 Report New Incident</h3>

            <form onSubmit={submitIncident} style={styles.form}>
              <input
                placeholder="Incident Title"
                value={newIncident.title}
                onChange={e =>
                  setNewIncident({ ...newIncident, title: e.target.value })
                }
                required
              />

              <textarea
                placeholder="Description"
                value={newIncident.description}
                onChange={e =>
                  setNewIncident({
                    ...newIncident,
                    description: e.target.value
                  })
                }
                required
              />

              <select
                value={newIncident.severity}
                onChange={e =>
                  setNewIncident({
                    ...newIncident,
                    severity: e.target.value
                  })
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>

              <MapContainer center={[20, 78]} zoom={5} style={styles.map}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker />
              </MapContainer>

              <button style={styles.primaryBtn} disabled={loading}>
                {loading ? "Submitting..." : "Submit Incident"}
              </button>
            </form>
          </div>
        )}

        {(active === "my" || active === "all") && (
          <div style={styles.card}>
            <h3>{active === "my" ? "📝 My Reports" : "🌍 All Incidents"}</h3>

            <MapContainer center={[20, 78]} zoom={5} style={styles.map}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {(active === "my" ? myReports : incidents).map(inc => (
                <Marker key={inc.id} position={[inc.lat, inc.lng]}>
                  <Popup>
                    <b>{inc.title}</b><br />
                    Status: {inc.status}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {(active === "my" ? myReports : incidents).map(inc => (
              <div key={inc.id} style={styles.incident}>
                <h4>{inc.title}</h4>
                <p>{inc.description}</p>
                <span style={styles.badge}>{inc.status}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* 🌅 SUNSET–PURPLE THEME */
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    background: "#faf5ff"
  },

  sidebar: {
    width: 260,
    background: "linear-gradient(180deg,#6d28d9,#db2777)",
    color: "#fff",
    padding: 26,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },

  logo: { marginBottom: 6, fontSize: 22 },
  email: { fontSize: 13, opacity: 0.9 },

  nav: { marginTop: 30, display: "grid", gap: 12 },

  navBtn: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "none",
    background: "rgba(255,255,255,0.18)",
    color: "#fff",
    fontWeight: 600,
    textAlign: "left",
    cursor: "pointer"
  },

  navActive: {
    background: "#f9a8d4",
    color: "#4a044e",
    fontWeight: 700
  },

  logoutBtn: {
    padding: 12,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg,#ef4444,#be123c)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer"
  },

  main: { flex: 1, padding: 34 },

  card: {
    background: "#ffffff",
    padding: 26,
    borderRadius: 20,
    boxShadow: "0 25px 50px rgba(0,0,0,0.15)"
  },

  form: { display: "grid", gap: 14 },

  primaryBtn: {
    background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
    padding: 14,
    borderRadius: 14,
    border: "none",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer"
  },

  map: {
    height: 340,
    borderRadius: 16,
    overflow: "hidden"
  },

  incident: {
    background: "#fdf4ff",
    padding: 16,
    borderRadius: 14,
    marginTop: 14
  },

  badge: {
    display: "inline-block",
    marginTop: 6,
    padding: "6px 14px",
    borderRadius: 999,
    background: "#ede9fe",
    color: "#5b21b6",
    fontSize: 12,
    fontWeight: 700
  }
};
