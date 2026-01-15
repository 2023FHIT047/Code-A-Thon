import { useEffect, useState, useMemo } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "./firebase";
import DashboardMap from "./DashboardMap";

export default function CoordinatorDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    return onSnapshot(collection(db, "incidents"), snap => {
      setIncidents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "users"), snap => {
      setVolunteers(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => u.role === "volunteer" && u.approved)
      );
    });
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "resources"), snap => {
      setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  /* ================= AVAILABLE ================= */

  const freeVolunteers = useMemo(
    () => volunteers.filter(v => !v.busy),
    [volunteers]
  );

  const freeResources = useMemo(
    () => resources.filter(r => !r.busy),
    [resources]
  );

  /* ================= ASSIGN ================= */

  const assignVolunteer = async v => {
    await updateDoc(doc(db, "incidents", selectedIncident.id), {
      assignedVolunteerId: v.id,
      assignedVolunteerName: v.name,
      status: "Assigned"
    });

    await updateDoc(doc(db, "users", v.id), { busy: true });
    setSelectedIncident(null);
  };

  const assignResource = async r => {
    await updateDoc(doc(db, "incidents", selectedIncident.id), {
      assignedResourceIds: [
        ...(selectedIncident.assignedResourceIds || []),
        r.id
      ],
      assignedResourceNames: [
        ...(selectedIncident.assignedResourceNames || []),
        r.name
      ]
    });

    await updateDoc(doc(db, "resources", r.id), { busy: true });
    setSelectedIncident(null);
  };

  /* ================= UI ================= */

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2>🛠 Admin Panel</h2>
      </aside>

      <main style={styles.main}>
        <h2>🚨 Incidents</h2>

        <div style={styles.mapWrapper}>
          <DashboardMap
            incidents={incidents}
            onIncidentClick={setSelectedIncident}
          />
        </div>

        <div style={styles.grid}>
          {incidents.map(i => (
            <div key={i.id} style={styles.card}>
              <h4>{i.title}</h4>
              <p><b>Status:</b> {i.status}</p>
              <p><b>Severity:</b> {i.severity}</p>

              <p>
                <b>Volunteer:</b>{" "}
                {i.assignedVolunteerName || "Not Assigned"}
              </p>

              <p>
                <b>Resources:</b>{" "}
                {i.assignedResourceNames?.length
                  ? i.assignedResourceNames.join(", ")
                  : "None"}
              </p>

              <button
                style={styles.assignBtn}
                onClick={() => setSelectedIncident(i)}
              >
                Assign
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* ================= MODAL ================= */}
      {selectedIncident && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>{selectedIncident.title}</h3>

            <h4>👤 Volunteers</h4>
            {freeVolunteers.length === 0 && <p>No available volunteers</p>}
            {freeVolunteers.map(v => (
              <button
                key={v.id}
                style={styles.assignBtn}
                onClick={() => assignVolunteer(v)}
              >
                {v.name}
              </button>
            ))}

            <h4>🚑 Resources</h4>
            {freeResources.length === 0 && <p>No available resources</p>}
            {freeResources.map(r => (
              <button
                key={r.id}
                style={styles.assignBtn}
                onClick={() => assignResource(r)}
              >
                {r.name} ({r.centerName})
              </button>
            ))}

            <button
              style={styles.closeBtn}
              onClick={() => setSelectedIncident(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "Arial" },

  sidebar: {
    width: 220,
    background: "#2c3e50",
    color: "#fff",
    padding: 20
  },

  main: { flex: 1, padding: 25, background: "#f4f6f8" },

  mapWrapper: {
    height: 350,
    marginBottom: 30,
    borderRadius: 10,
    overflow: "hidden"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
    gap: 18
  },

  card: {
    background: "#fff",
    padding: 16,
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
  },

  assignBtn: {
    background: "#3498db",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
    marginTop: 8,
    display: "block"
  },

  closeBtn: {
    background: "#e74c3c",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 6,
    marginTop: 15
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },

  modal: {
    background: "#fff",
    padding: 22,
    borderRadius: 12,
    width: 420,
    maxHeight: "80vh",
    overflowY: "auto"
  }
};
