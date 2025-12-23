import { useEffect, useState, useMemo } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDocs
} from "firebase/firestore";
import { db } from "./firebase";
import DashboardMap from "./DashboardMap";

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeTab, setActiveTab] = useState("incidents");
  const [selectedIncident, setSelectedIncident] = useState(null);

  /* 🔥 Load incidents in realtime */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "incidents"), snap => {
      setIncidents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  /* 👥 Load users */
  useEffect(() => {
    const loadUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    loadUsers();
  }, []);

  /* 🚑 Load resources */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "resources"), snap => {
      setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  /* LOCK SCROLL WHEN MODAL OPEN */
  useEffect(() => {
    document.body.style.overflow = selectedIncident ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [selectedIncident]);

  /* DERIVED DATA */
  const pendingVolunteers = useMemo(
    () => users.filter(u => u.role === "volunteer" && !u.approved && !u.rejected),
    [users]
  );

  const approvedVolunteers = useMemo(
    () => users.filter(u => u.role === "volunteer" && u.approved),
    [users]
  );

  const availableResources = useMemo(
    () => resources.filter(r => r.status === "Available"),
    [resources]
  );

  /* HELPERS */
  const updateIncident = (id, data) =>
    updateDoc(doc(db, "incidents", id), data);

  const approveVolunteer = id =>
    updateDoc(doc(db, "users", id), { approved: true });

  const rejectVolunteer = id =>
    updateDoc(doc(db, "users", id), { rejected: true });

  const getUserById = uid => users.find(u => u.id === uid);

  /* ================= UI SECTIONS ================= */
  const renderContent = () => {
    switch (activeTab) {
      case "incidents":
        return (
          <>
            <h2>🚨 Incident Management</h2>

            <div style={styles.mapWrapper}>
              <DashboardMap
                incidents={incidents}
                resources={resources}
                onIncidentClick={setSelectedIncident}
              />
            </div>

            <div style={styles.grid}>
              {incidents.map(inc => {
                const reporter = getUserById(inc.reportedBy);
                const volunteer = getUserById(inc.assignedVolunteer);

                return (
                  <div key={inc.id} style={styles.card}>
                    <h4>🚨 {inc.title}</h4>

                    <div style={styles.badges}>
                      <span style={badge(inc.severity)}>⚠️ {inc.severity}</span>
                      <span style={badge(inc.status)}>🔄 {inc.status}</span>
                    </div>

                    <p><b>Description:</b> {inc.description}</p>
                    <p><b>Location:</b> {inc.lat}, {inc.lng}</p>

                    <p>
                      <b>Reported By:</b> {reporter ? `${reporter.name} (${reporter.email}, ${reporter.contact})` : "Unknown"}
                    </p>
                    <p>
                      <b>Assigned Volunteer:</b> {volunteer ? `${volunteer.name} (${volunteer.email}, ${volunteer.contact})` : "None"}
                    </p>
                    <p>
                      <b>Assigned Resources:</b> {inc.assignedResources?.length ? inc.assignedResources.join(", ") : "None"}
                    </p>

                    {inc.photoURL && (
                      <img src={inc.photoURL} alt="incident" style={{ width: "100%", borderRadius: 6, marginTop: 8 }} />
                    )}

                    <button
                      style={styles.assignBtn}
                      onClick={() => setSelectedIncident(inc)}
                    >
                      📌 Assign Volunteer / Resource
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        );

      case "volunteers":
        return (
          <>
            <h2>👥 Volunteer Approval</h2>

            {pendingVolunteers.length === 0 && <p>✅ No pending volunteers</p>}

            {pendingVolunteers.map(v => (
              <div key={v.id} style={styles.listItem}>
                <span>👤 {v.name} ({v.email}, {v.contact})</span>
                <div>
                  <button style={styles.approveBtn} onClick={() => approveVolunteer(v.id)}>✅ Approve</button>
                  <button style={styles.rejectBtn} onClick={() => rejectVolunteer(v.id)}>❌ Reject</button>
                </div>
              </div>
            ))}
          </>
        );

      case "resources":
        return (
          <>
            <h2>🚑 Resource Management</h2>

            {resources.map(r => (
              <div key={r.id} style={styles.listItem}>
                <span>🚑 <b>{r.name}</b> ({r.type})</span>

                <select
                  value={r.status}
                  onChange={(e) =>
                    updateDoc(doc(db, "resources", r.id), {
                      status: e.target.value
                    })
                  }
                >
                  <option>Available</option>
                  <option>Assigned</option>
                  <option>Busy</option>
                </select>
              </div>
            ))}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h1>🛠 Admin Panel</h1>
        <SidebarBtn label="🚨 Incidents" tab="incidents" />
        <SidebarBtn label="👥 Volunteers" tab="volunteers" />
        <SidebarBtn label="🚑 Resources" tab="resources" />
      </aside>

      {/* MAIN */}
      <main style={styles.main}>{renderContent()}</main>

      {/* ASSIGN MODAL */}
      {selectedIncident && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>📍 {selectedIncident.title}</h3>

            <div style={{ marginBottom: 10 }}>
              <p><b>Description:</b> {selectedIncident.description}</p>
              <p><b>Location:</b> {selectedIncident.lat}, {selectedIncident.lng}</p>
              <p>
                <b>Reported By:</b> {getUserById(selectedIncident.reportedBy)
                  ? `${getUserById(selectedIncident.reportedBy).name} (${getUserById(selectedIncident.reportedBy).email}, ${getUserById(selectedIncident.reportedBy).contact})`
                  : "Unknown"}
              </p>
              <p>
                <b>Assigned Volunteer:</b> {getUserById(selectedIncident.assignedVolunteer)
                  ? `${getUserById(selectedIncident.assignedVolunteer).name} (${getUserById(selectedIncident.assignedVolunteer).email}, ${getUserById(selectedIncident.assignedVolunteer).contact})`
                  : "None"}
              </p>
              <p>
                <b>Assigned Resources:</b> {selectedIncident.assignedResources?.length
                  ? selectedIncident.assignedResources.join(", ")
                  : "None"}
              </p>
              {selectedIncident.photoURL && (
                <img src={selectedIncident.photoURL} alt="incident" style={{ width: "100%", borderRadius: 6, marginTop: 8 }} />
              )}
            </div>

            <h4>👤 Assign Volunteer</h4>
            {approvedVolunteers.map(v => (
              <div key={v.id} style={styles.listItem}>
                {v.name} ({v.email}, {v.contact})
                <button
                  style={styles.assignBtn}
                  onClick={async () => {
                    await updateIncident(selectedIncident.id, {
                      assignedVolunteer: v.id,
                      status: "Assigned"
                    });
                    setSelectedIncident(null);
                  }}
                >
                  📌 Assign
                </button>
              </div>
            ))}

            <h4>🚑 Assign Resource</h4>
            {availableResources.map(r => (
              <div key={r.id} style={styles.listItem}>
                🚑 {r.name}
                <button
                  style={styles.assignBtn}
                  onClick={async () => {
                    await updateDoc(doc(db, "resources", r.id), {
                      status: "Assigned",
                      assignedIncident: selectedIncident.id
                    });
                    await updateIncident(selectedIncident.id, {
                      assignedResources: [
                        ...(selectedIncident.assignedResources || []),
                        r.id
                      ]
                    });
                    setSelectedIncident(null);
                  }}
                >
                  📌 Assign
                </button>
              </div>
            ))}

            <button style={styles.rejectBtn} onClick={() => setSelectedIncident(null)}>❌ Close</button>
          </div>
        </div>
      )}
    </div>
  );

  function SidebarBtn({ label, tab }) {
    return (
      <button
        onClick={() => setActiveTab(tab)}
        style={{
          ...styles.navBtn,
          background: activeTab === tab ? "#1abc9c" : "#34495e"
        }}
      >
        {label}
      </button>
    );
  }
}

/* ================= STYLES ================= */
const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "Arial" },
  sidebar: { width: 240, background: "#2c3e50", color: "#fff", padding: 20 },
  navBtn: { width: "100%", padding: 12, marginBottom: 10, border: "none", color: "#fff", borderRadius: 6, cursor: "pointer", textAlign: "left" },
  main: { flex: 1, padding: 25, background: "#f4f6f8", overflowY: "auto" },
  mapWrapper: { height: 400, marginBottom: 20, position: "relative", zIndex: 1 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 15 },
  card: { background: "#fff", padding: 15, borderRadius: 8, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" },
  listItem: { display: "flex", justifyContent: "space-between", padding: 12, background: "#fff", borderRadius: 6, marginBottom: 10 },
  assignBtn: { background: "#3498db", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer" },
  approveBtn: { background: "#2ecc71", color: "#fff", border: "none", padding: "6px 12px", marginRight: 8, borderRadius: 4 },
  rejectBtn: { background: "#e74c3c", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 4 },
  badges: { display: "flex", gap: 10, margin: "8px 0" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 },
  modal: { background: "#fff", padding: 20, borderRadius: 8, width: 420, maxHeight: "80vh", overflowY: "auto" }
};

const badge = value => ({
  padding: "4px 8px",
  borderRadius: 4,
  background:
    value === "Critical" || value === "High"
      ? "#e74c3c"
      : value === "Medium"
      ? "#f39c12"
      : "#2ecc71",
  color: "#fff",
  fontSize: 12
});
