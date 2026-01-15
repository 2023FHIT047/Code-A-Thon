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
import { getAuth } from "firebase/auth";
import { db } from "./firebase";

export default function ResourceManagerDashboard() {
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ADD RESOURCE */
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
      centerId: user.centerId,
      assignedIncident: null,
      createdAt: serverTimestamp()
    });

    setName("");
    setType("Ambulance");
    setShowAdd(false);
  };

  /* 🔁 UPDATE STATUS */
  const updateStatus = async (id, newStatus) => {
    const data = { status: newStatus };
    if (newStatus === "Available") data.assignedIncident = null;
    await updateDoc(doc(db, "resources", id), data);
  };

  if (loading) return <p>Loading Resource Manager...</p>;

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2>🏥 Resource Center</h2>
        <p>Center: {user.centerId}</p>
        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
          ➕ Add Resource
        </button>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        <h2>🚑 Resource Dashboard</h2>

        {resources.length === 0 && <p>No resources found.</p>}

        {resources.map(r => (
          <div key={r.id} style={styles.card}>
            <div>
              <h4>{icon(r.type)} {r.name}</h4>
              <p>Status: {badge(r.status)}</p>
              {r.assignedIncident && (
                <p>📍 Assigned Incident: {r.assignedIncident}</p>
              )}
            </div>

            <div>
              <select
                value={r.status}
                onChange={e => updateStatus(r.id, e.target.value)}
              >
                <option>Available</option>
                <option>Busy</option>
                <option>Under Maintenance</option>
              </select>
            </div>
          </div>
        ))}
      </main>

      {/* ADD RESOURCE MODAL */}
      {showAdd && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>➕ Add Resource</h3>
            <input
              placeholder="Resource Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <select value={type} onChange={e => setType(e.target.value)}>
              <option>Ambulance</option>
              <option>Fire Truck</option>
              <option>Police</option>
              <option>Rescue Van</option>
            </select>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button onClick={addResource}>Save</button>
              <button onClick={() => setShowAdd(false)}>Cancel</button>
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
  t === "Police" ? "🚓" : "🛠️";

const badge = s => (
  <span style={{
    padding: "4px 8px",
    borderRadius: 4,
    color: "#fff",
    background:
      s === "Available" ? "#2ecc71" :
      s === "Busy" ? "#e74c3c" :
      s === "Under Maintenance" ? "#95a5a6" : "#7f8c8d"
  }}>
    {s}
  </span>
);

/* STYLES */
const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" },
  sidebar: { width: 240, background: "#2c3e50", color: "#fff", padding: 20 },
  addBtn: { marginTop: 20, padding: 10, width: "100%", cursor: "pointer" },
  main: { flex: 1, padding: 25, background: "#f4f6f8" },
  card: {
    background: "#fff",
    padding: 15,
    marginBottom: 15,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", justifyContent: "center", alignItems: "center"
  },
  modal: { background: "#fff", padding: 20, borderRadius: 8, width: 300, display: "flex", flexDirection: "column", gap: 10 }
};
