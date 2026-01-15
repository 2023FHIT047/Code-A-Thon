import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { db } from "./firebase";

export default function ResourceManagerDashboard() {
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Ambulance");

  /* 🔐 LOAD USER */
  useEffect(() => {
    const auth = getAuth();
    const u = auth.currentUser;
    if (!u) return;

    getDoc(doc(db, "users", u.uid)).then(snap => {
      setUser({ uid: u.uid, ...snap.data() });
      setLoading(false);
    });
  }, []);

  /* 🚑 LOAD RESOURCES */
  useEffect(() => {
    if (!user?.centerId) return;

    const q = query(
      collection(db, "resources"),
      where("centerId", "==", user.centerId)
    );

    return onSnapshot(q, snap => {
      setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  /* ➕ ADD RESOURCE */
  const addResource = async () => {
    if (!name.trim()) return alert("Enter resource name");

    await addDoc(collection(db, "resources"), {
      name,
      type,
      status: "Available",
      busy: false,
      centerId: user.centerId,
      assignedIncident: null,
      assignedVolunteerId: null,
      createdAt: serverTimestamp()
    });

    setName("");
    setType("Ambulance");
    setShowAdd(false);
  };

  /* 🔁 UPDATE STATUS */
  const updateStatus = async (id, status) => {
    const data = {
      status,
      busy: status !== "Available"
    };

    if (status === "Available") {
      data.assignedIncident = null;
      data.assignedVolunteerId = null;
    }

    await updateDoc(doc(db, "resources", id), data);
  };

  /* 🚪 LOGOUT */
  const logout = async () => {
    await signOut(getAuth());
    window.location.href = "/";
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div>
          <h2 style={styles.logo}>🏥 Resource Hub</h2>
          <p style={styles.subText}>Center</p>
          <p style={styles.center}>{user.centerId}</p>

          <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
            ➕ Add Resource
          </button>
        </div>

        <button style={styles.logoutBtn} onClick={logout}>
          🚪 Logout
        </button>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        <h2 style={styles.heading}>🚑 Resources</h2>

        {resources.length === 0 && (
          <p style={styles.empty}>No resources available.</p>
        )}

        {resources.map(r => (
          <div key={r.id} style={styles.card}>
            <div>
              <h4>{icon(r.type)} {r.name}</h4>
              <p>Status: {badge(r.status)}</p>
              {r.assignedIncident && (
                <p style={styles.small}>📍 Incident: {r.assignedIncident}</p>
              )}
            </div>

            <select
              value={r.status}
              style={styles.select}
              onChange={e => updateStatus(r.id, e.target.value)}
            >
              <option>Available</option>
              <option>Busy</option>
              <option>Under Maintenance</option>
            </select>
          </div>
        ))}
      </main>

      {/* MODAL */}
      {showAdd && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>➕ Add Resource</h3>

            <input
              placeholder="Resource Name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={styles.input}
            />

            <select
              value={type}
              onChange={e => setType(e.target.value)}
              style={styles.input}
            >
              <option>Ambulance</option>
              <option>Fire Truck</option>
              <option>Police</option>
              <option>Rescue Van</option>
            </select>

            <div style={styles.modalActions}>
              <button style={styles.saveBtn} onClick={addResource}>
                Save
              </button>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* HELPERS */
const icon = t =>
  t === "Ambulance" ? "🚑" :
  t === "Fire Truck" ? "🚒" :
  t === "Police" ? "🚓" :
  t === "Rescue Van" ? "🚐" : "🛠️";

const badge = s => (
  <span style={{
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    color: "#fff",
    background:
      s === "Available" ? "#14b8a6" :
      s === "Busy" ? "#ef4444" :
      s === "Under Maintenance" ? "#64748b" : "#94a3b8"
  }}>
    {s}
  </span>
);

/* 🎨 STYLES (NEW COLOR COMBINATION) */
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    background: "#f8fafc"
  },

  sidebar: {
    width: 260,
    background: "linear-gradient(180deg, #1f2933, #111827)",
    color: "#fff",
    padding: 26,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },

  logo: {
    color: "#2dd4bf",
    marginBottom: 6
  },

  subText: {
    fontSize: 12,
    opacity: 0.7
  },

  center: {
    fontSize: 14,
    marginBottom: 22
  },

  addBtn: {
    width: "100%",
    padding: 11,
    borderRadius: 10,
    border: "none",
    background: "#2dd4bf",
    color: "#042f2e",
    fontWeight: 700,
    cursor: "pointer"
  },

  logoutBtn: {
    padding: 11,
    borderRadius: 10,
    border: "none",
    background: "#ef4444",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer"
  },

  main: {
    flex: 1,
    padding: 32
  },

  heading: {
    marginBottom: 22,
    color: "#0f172a"
  },

  empty: {
    color: "#64748b"
  },

  card: {
    background: "#ffffff",
    padding: 18,
    marginBottom: 16,
    borderRadius: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)"
  },

  small: {
    fontSize: 13,
    color: "#475569"
  },

  select: {
    padding: 8,
    borderRadius: 8,
    border: "1px solid #cbd5e1"
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  modal: {
    background: "#ffffff",
    padding: 22,
    borderRadius: 16,
    width: 320,
    display: "flex",
    flexDirection: "column",
    gap: 12
  },

  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #94a3b8"
  },

  modalActions: {
    display: "flex",
    gap: 10,
    marginTop: 12
  },

  saveBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#14b8a6",
    color: "#042f2e",
    fontWeight: 700,
    cursor: "pointer"
  },

  cancelBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#cbd5e1",
    fontWeight: 700,
    cursor: "pointer"
  }
};
