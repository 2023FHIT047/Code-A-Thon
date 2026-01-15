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
  const [loading, setLoading] = useState(true);

  /* 🔐 GET LOGGED-IN VOLUNTEER */
  useEffect(() => {
    const auth = getAuth();
    const unsub = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser({ uid: currentUser.uid, email: currentUser.email });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /* 🚨 FETCH INCIDENTS ASSIGNED TO THIS VOLUNTEER */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "incidents"),
      where("assignedVolunteerId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setIncidents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user]);

  /* 🚑 FETCH RESOURCES ASSIGNED TO THIS VOLUNTEER */
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

  /* 🔁 UPDATE INCIDENT STATUS */
  const updateIncidentStatus = async (id, status) => {
    await updateDoc(doc(db, "incidents", id), { status });
  };

  /* 🔁 UPDATE RESOURCE STATUS */
  const updateResourceStatus = async (id, status) => {
    await updateDoc(doc(db, "resources", id), { status });
  };

  /* ✅ MARK INCIDENT COMPLETED */
  const markCompleted = async (incidentId) => {
    await updateDoc(doc(db, "incidents", incidentId), {
      status: "Completed",
      completedAt: new Date()
    });

    // Optionally, free all assigned resources
    const inc = incidents.find(i => i.id === incidentId);
    if (inc?.assignedResourceIds?.length) {
      inc.assignedResourceIds.forEach(async rId => {
        await updateDoc(doc(db, "resources", rId), { busy: false });
      });
    }

    // Free volunteer
    await updateDoc(doc(db, "users", user.uid), { busy: false });
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please login</p>;

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2>👷 Volunteer</h2>
        <p style={{ fontSize: 13 }}>{user.email}</p>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        <h2>🚨 My Assigned Incidents</h2>

        <DashboardMap incidents={incidents} resources={resources} />

        {incidents.length === 0 && (
          <p style={{ marginTop: 20 }}>No incidents assigned.</p>
        )}

        {incidents.map(inc => (
          <div key={inc.id} style={styles.card}>
            <h3>{inc.title}</h3>
            <p><b>Status:</b> {inc.status}</p>
            <p><b>Severity:</b> {inc.severity}</p>

            {/* INCIDENT STATUS */}
            <select
              value={inc.status}
              onChange={(e) =>
                updateIncidentStatus(inc.id, e.target.value)
              }
            >
              <option>Assigned</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Completed</option>
            </select>

            {/* 🚑 RESOURCES */}
            <div style={styles.resourceBox}>
              <h4>🚑 Assigned Resources</h4>

              {resources
                .filter(r => inc.assignedResourceIds?.includes(r.id))
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

              {(!inc.assignedResourceIds || inc.assignedResourceIds.length === 0) && (
                <p style={{ fontSize: 13, color: "#777" }}>
                  No resources assigned
                </p>
              )}
            </div>

            {/* ✅ ACKNOWLEDGE BUTTON */}
            {inc.status !== "Completed" && (
              <button
                style={styles.completeBtn}
                onClick={() => markCompleted(inc.id)}
              >
                ✅ Mark Task Completed
              </button>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}

/* 🎨 STYLES */
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#f4f6f8",
    fontFamily: "Arial"
  },
  sidebar: {
    width: 220,
    background: "#2c3e50",
    color: "#fff",
    padding: 20
  },
  main: {
    flex: 1,
    padding: 20
  },
  card: {
    background: "#fff",
    padding: 15,
    marginTop: 15,
    borderRadius: 8,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },
  resourceBox: {
    marginTop: 10,
    padding: 10,
    background: "#eef2f5",
    borderRadius: 6
  },
  resourceCard: {
    background: "#fff",
    padding: 8,
    marginBottom: 8,
    borderRadius: 5
  },
  completeBtn: {
    marginTop: 10,
    padding: "8px 14px",
    background: "#2ecc71",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  }
};
