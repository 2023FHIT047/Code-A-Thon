import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";
import DashboardMap from "./DashboardMap";

export default function VolunteerDashboard() {
  const [user, setUser] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeSection, setActiveSection] = useState("myIncidents");

  /* 🔐 Get logged-in volunteer */
  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser({ uid: currentUser.uid, email: currentUser.email });
    } else {
      const stored = JSON.parse(localStorage.getItem("user"));
      if (stored) setUser(stored);
    }
  }, []);

  /* 🔥 Fetch incidents */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "incidents"), (snap) => {
      setIncidents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* 🚑 Fetch resources assigned to this volunteer */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "resources"),
      where("assignedVolunteerId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user]);

  /* 🔁 Update incident status */
  const updateIncidentStatus = async (id, status) => {
    await updateDoc(doc(db, "incidents", id), { status });
  };

  /* 🔁 Update resource status */
  const updateResourceStatus = async (id, status) => {
    await updateDoc(doc(db, "resources", id), { status });
  };

  if (!user) return <p>Loading...</p>;

  const myIncidents = incidents.filter(i => i.assignedTo === user.uid);

  /* 📦 Render Section */
  const renderSection = () => (
    <div style={styles.section}>
      <h3>📝 My Assigned Incidents</h3>

      <DashboardMap incidents={myIncidents} resources={resources} />

      {myIncidents.map(inc => (
        <div key={inc.id} style={styles.card}>
          <h4>{inc.title}</h4>
          <p><b>Status:</b> {inc.status}</p>
          <p><b>Severity:</b> {inc.severity}</p>

          <select
            value={inc.status}
            onChange={(e) => updateIncidentStatus(inc.id, e.target.value)}
          >
            <option>Assigned</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>

          {/* 🚑 Assigned Resources */}
          <div style={styles.resourceBox}>
            <h5>🚑 Assigned Resources</h5>

            {resources
              .filter(r => r.assignedIncidentId === inc.id)
              .map(r => (
                <div key={r.id} style={styles.resourceCard}>
                  <p><b>{r.type}</b></p>
                  <p>Status: {r.status}</p>

                  <select
                    value={r.status}
                    onChange={(e) =>
                      updateResourceStatus(r.id, e.target.value)
                    }
                  >
                    <option>Dispatched</option>
                    <option>Reached</option>
                    <option>In Use</option>
                    <option>Released</option>
                  </select>
                </div>
              ))}

            {resources.filter(r => r.assignedIncidentId === inc.id).length === 0 && (
              <p style={{ fontSize: 13, color: "#777" }}>No resources assigned</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2>👷 Volunteer</h2>
        <button style={styles.navBtn} onClick={() => setActiveSection("myIncidents")}>
          My Incidents
        </button>
      </aside>

      {/* Main */}
      <main style={styles.main}>{renderSection()}</main>
    </div>
  );
}

/* 🎨 Styles */
const styles = {
  container: { display: "flex", minHeight: "100vh", background: "#f4f6f8" },
  sidebar: {
    width: 220,
    background: "#2c3e50",
    color: "#fff",
    padding: 20,
  },
  navBtn: {
    width: "100%",
    padding: 10,
    background: "#34495e",
    border: "none",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
  },
  main: { flex: 1, padding: 20 },
  section: {
    background: "#fff",
    padding: 20,
    borderRadius: 8,
  },
  card: {
    background: "#fafafa",
    padding: 15,
    marginTop: 15,
    borderRadius: 6,
  },
  resourceBox: {
    marginTop: 10,
    padding: 10,
    background: "#eef2f5",
    borderRadius: 6,
  },
  resourceCard: {
    background: "#fff",
    padding: 8,
    marginBottom: 8,
    borderRadius: 5,
  },
};
