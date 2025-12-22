import { useEffect, useState } from "react";
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
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [approvedVolunteers, setApprovedVolunteers] = useState([]);
  const [activeSection, setActiveSection] = useState("incidents"); // sidebar control
  const [selectedIncident, setSelectedIncident] = useState(null); // map click

  /* 🔥 FETCH INCIDENTS (REALTIME) */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "incidents"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIncidents(data);
    });
    return () => unsub();
  }, []);

  /* 👥 FETCH VOLUNTEERS */
  useEffect(() => {
    const loadVolunteers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      setPendingVolunteers(
        users.filter(u => u.role === "volunteer" && !u.approved && !u.rejected)
      );

      setApprovedVolunteers(
        users.filter(u => u.role === "volunteer" && u.approved)
      );
    };
    loadVolunteers();
  }, []);

  /* 🔁 UPDATE INCIDENT */
  const updateIncident = async (id, data) => {
    await updateDoc(doc(db, "incidents", id), data);
  };

  /* ✅ APPROVE VOLUNTEER */
  const approveVolunteer = async (id) => {
    await updateDoc(doc(db, "users", id), { approved: true });
    setPendingVolunteers(pendingVolunteers.filter(v => v.id !== id));
  };

  /* ❌ REJECT VOLUNTEER */
  const rejectVolunteer = async (id) => {
    await updateDoc(doc(db, "users", id), { rejected: true });
    setPendingVolunteers(pendingVolunteers.filter(v => v.id !== id));
  };

  /* 🎯 RENDER SECTIONS */
  const renderSection = () => {
    switch (activeSection) {
      case "incidents":
        return (
          <div style={styles.section}>
            <h3>🚨 Incidents</h3>
            <div style={{ marginBottom: 20 }}>
              <DashboardMap
                incidents={incidents}
                onIncidentClick={(inc) => setSelectedIncident(inc)}
              />
            </div>
            {incidents.map(inc => (
              <div key={inc.id} style={styles.card}>
                <h4>{inc.title}</h4>
                <p><b>Status:</b> {inc.status}</p>
                <p><b>Severity:</b> {inc.severity}</p>
              </div>
            ))}
          </div>
        );

      case "pending":
        return (
          <div style={styles.section}>
            <h3>👥 Pending Volunteers</h3>
            {pendingVolunteers.length === 0 && <p>No pending approvals</p>}
            {pendingVolunteers.map(v => (
              <div key={v.id} style={styles.volCard}>
                <span>{v.email}</span>
                <div>
                  <button style={styles.approveBtn} onClick={() => approveVolunteer(v.id)}>Approve</button>
                  <button style={styles.rejectBtn} onClick={() => rejectVolunteer(v.id)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        );

      case "approved":
        return (
          <div style={styles.section}>
            <h3>✅ Approved Volunteers</h3>
            {approvedVolunteers.length === 0 && <p>No approved volunteers yet.</p>}
            {approvedVolunteers.map(v => (
              <div key={v.id} style={styles.volCard}>
                <span>{v.email}</span>
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
        <h2>🛠 Admin Panel</h2>
        <nav>
          <button style={styles.navBtn} onClick={() => setActiveSection("incidents")}>Incidents</button>
          <button style={styles.navBtn} onClick={() => setActiveSection("pending")}>Pending Volunteers</button>
          <button style={styles.navBtn} onClick={() => setActiveSection("approved")}>Approved Volunteers</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {renderSection()}
      </main>

      {/* Modal for assigning volunteer */}
      {selectedIncident && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Assign Volunteer to: {selectedIncident.title}</h3>
            {approvedVolunteers.length === 0 && <p>No approved volunteers yet.</p>}
            {approvedVolunteers.map(v => (
              <div key={v.id} style={styles.volCard}>
                <span>{v.email}</span>
                <button
                  style={styles.approveBtn}
                  onClick={async () => {
                    await updateIncident(selectedIncident.id, {
                      assignedTo: v.id,
                      status: "Assigned"
                    });
                    setSelectedIncident(null);
                  }}
                >
                  Assign
                </button>
              </div>
            ))}
            <button style={styles.rejectBtn} onClick={() => setSelectedIncident(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* 🎨 STYLES */
const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "Arial", background: "#f4f6f8" },
  sidebar: { width: "220px", background: "#2c3e50", color: "#fff", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" },
  navBtn: { padding: "10px 15px", margin: "5px 0", background: "#34495e", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", textAlign: "left" },
  mainContent: { flex: 1, padding: "20px", overflowY: "auto" },
  section: { background: "#fff", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" },
  card: { background: "#fafafa", padding: "12px", marginBottom: "12px", borderRadius: "6px", display: "grid", gap: "8px" },
  volCard: { display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #ddd" },
  approveBtn: { background: "#28a745", color: "#fff", border: "none", padding: "6px 12px", marginRight: "8px", cursor: "pointer", borderRadius: "4px" },
  rejectBtn: { background: "#dc3545", color: "#fff", border: "none", padding: "6px 12px", cursor: "pointer", borderRadius: "4px" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "#fff", padding: "20px", borderRadius: "8px", minWidth: "300px", maxHeight: "80vh", overflowY: "auto" }
};
