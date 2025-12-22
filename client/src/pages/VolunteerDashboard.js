import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";
import DashboardMap from "./DashboardMap";

export default function VolunteerDashboard() {
  const [user, setUser] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [activeSection, setActiveSection] = useState("myIncidents"); // sidebar control

  /* Get logged-in user */
  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser({ uid: currentUser.uid, email: currentUser.email });
    } else {
      // Check localStorage fallback
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) setUser(storedUser);
    }
  }, []);

  /* Fetch incidents in real-time */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "incidents"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIncidents(data);
    });

    return () => unsub();
  }, []);

  /* Update incident status */
  const updateIncidentStatus = async (id, status) => {
    await updateDoc(doc(db, "incidents", id), { status });
  };

  if (!user) return <p>Loading user info...</p>;

  /* Render sections */
  const renderSection = () => {
    let filteredIncidents = activeSection === "myIncidents"
      ? incidents.filter(inc => inc.assignedTo === user.uid)
      : incidents;

    return (
      <div style={styles.section}>
        <h3>{activeSection === "myIncidents" ? "📝 My Assigned Incidents" : "🌍 All Incidents"}</h3>
        <div style={{ marginBottom: 20 }}>
          <DashboardMap incidents={filteredIncidents} />
        </div>

        {filteredIncidents.map(inc => (
          <div key={inc.id} style={styles.card}>
            <h4>{inc.title}</h4>
            <p><b>Status:</b> {inc.status}</p>
            <p><b>Severity:</b> {inc.severity}</p>

            {inc.assignedTo === user.uid && (
              <select
                value={inc.status}
                onChange={(e) => updateIncidentStatus(inc.id, e.target.value)}
              >
                <option>Assigned</option>
                <option>Resolved</option>
              </select>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2>👷 Volunteer Panel</h2>
        <nav>
          <button style={styles.navBtn} onClick={() => setActiveSection("myIncidents")}>My Incidents</button>
          <button style={styles.navBtn} onClick={() => setActiveSection("allIncidents")}>All Incidents</button>
        </nav>
      </aside>

      {/* Main content */}
      <main style={styles.mainContent}>
        {renderSection()}
      </main>
    </div>
  );
}

/* Styles */
const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "Arial", background: "#f4f6f8" },
  sidebar: { width: "220px", background: "#34495e", color: "#fff", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" },
  navBtn: { padding: "10px 15px", margin: "5px 0", background: "#2c3e50", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", textAlign: "left" },
  mainContent: { flex: 1, padding: "20px", overflowY: "auto" },
  section: { background: "#fff", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" },
  card: { background: "#fafafa", padding: "12px", marginBottom: "12px", borderRadius: "6px", display: "grid", gap: "8px" },
};
