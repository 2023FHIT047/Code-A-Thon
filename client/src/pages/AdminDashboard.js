import { useEffect, useState, useMemo } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import DashboardMap from "./DashboardMap";

export default function CoordinatorDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const navigate = useNavigate();

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
      setResources(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          busy: d.data().busy || false,
          centerName: d.data().centerName || "Unknown"
        }))
      );
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
  const assignVolunteer = async (v) => {
    if (!selectedIncident) return;

    await updateDoc(doc(db, "incidents", selectedIncident.id), {
      assignedVolunteerId: v.id,
      assignedVolunteerName: v.name,
      status: "Assigned"
    });

    await updateDoc(doc(db, "users", v.id), { busy: true });
    setSelectedIncident(null);
  };

  const assignResource = async (r) => {
    if (!selectedIncident) return;

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

    await updateDoc(doc(db, "resources", r.id), {
      busy: true,
      assignedIncidentId: selectedIncident.id
    });

    setSelectedIncident(null);
  };

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  /* ================= UI ================= */
  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div>
          <h2 style={styles.logo}>🧭 Coordinator</h2>
          <p style={styles.subText}>Operations Control</p>
        </div>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        <h2 style={styles.pageTitle}>🚨 Active Incidents</h2>

        <div style={styles.mapWrapper}>
          <DashboardMap
            incidents={incidents}
            onIncidentClick={setSelectedIncident}
          />
        </div>

        <div style={styles.grid}>
          {incidents.map(i => (
            <div key={i.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>{i.title}</h3>
                <span style={styles.badge}>{i.status}</span>
              </div>

              <p><b>Severity:</b> {i.severity}</p>
              <p><b>Volunteer:</b> {i.assignedVolunteerName || "Not Assigned"}</p>
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
                ⚙ Assign Resources
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL */}
      {selectedIncident && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginBottom: 14 }}>{selectedIncident.title}</h3>

            <h4>👤 Available Volunteers</h4>
            {freeVolunteers.length === 0 && (
              <p style={styles.muted}>No volunteers available</p>
            )}
            {freeVolunteers.map(v => (
              <button
                key={v.id}
                style={styles.modalBtn}
                onClick={() => assignVolunteer(v)}
              >
                {v.name}
              </button>
            ))}

            <h4 style={{ marginTop: 18 }}>🚑 Available Resources</h4>
            {freeResources.length === 0 && (
              <p style={styles.muted}>No resources available</p>
            )}
            {freeResources.map(r => (
              <button
                key={r.id}
                style={styles.modalBtn}
                onClick={() => assignResource(r)}
              >
                {r.name} <span style={styles.center}>({r.centerName})</span>
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

/* 🌿 EMERALD–SLATE THEME */
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    background: "#f0fdf4"
  },

  sidebar: {
    width: 260,
    background: "linear-gradient(180deg,#065f46,#0f766e)",
    color: "#ecfeff",
    padding: "30px 26px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "4px 0 18px rgba(0,0,0,0.3)"
  },

  logo: { marginBottom: 6 },
  subText: { fontSize: 13, opacity: 0.85 },

  logoutBtn: {
    background: "linear-gradient(135deg,#ef4444,#b91c1c)",
    border: "none",
    padding: "12px",
    borderRadius: 12,
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer"
  },

  main: {
    flex: 1,
    padding: "34px 38px"
  },

  pageTitle: {
    marginBottom: 18,
    fontSize: 22
  },

  mapWrapper: {
    height: 360,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 32,
    boxShadow: "0 16px 36px rgba(0,0,0,0.18)"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 24
  },

  card: {
    background: "#ffffff",
    padding: 20,
    borderRadius: 18,
    boxShadow: "0 14px 32px rgba(0,0,0,0.12)"
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },

  badge: {
    background: "#ccfbf1",
    color: "#065f46",
    padding: "4px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700
  },

  assignBtn: {
    marginTop: 14,
    background: "linear-gradient(135deg,#059669,#047857)",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },

  modal: {
    background: "#ffffff",
    padding: 28,
    borderRadius: 22,
    width: 440,
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 30px 60px rgba(0,0,0,0.4)"
  },

  modalBtn: {
    width: "100%",
    marginTop: 10,
    padding: "10px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    background: "#e5e7eb",
    fontWeight: 600
  },

  closeBtn: {
    marginTop: 18,
    width: "100%",
    background: "#0f172a",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: 12,
    cursor: "pointer"
  },

  muted: {
    fontSize: 13,
    color: "#475569"
  },

  center: {
    fontSize: 12,
    opacity: 0.7
  }
};
