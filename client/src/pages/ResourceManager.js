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

  /* ADD RESOURCE STATES */
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Ambulance");

  /* 🔐 GET LOGGED-IN USER */
  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const loadUser = async () => {
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      setUser({ uid: currentUser.uid, ...snap.data() });
      setLoading(false);
    };

    loadUser();
  }, []);

  /* 🚑 FETCH RESOURCES */
  useEffect(() => {
    if (!user?.centerId) return;

    const q = query(
      collection(db, "resources"),
      where("centerId", "==", user.centerId)
    );

    const unsub = onSnapshot(q, snap => {
      setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user]);

  /* 🔁 UPDATE RESOURCE STATUS */
  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "resources", id), { status });
  };

  /* ➕ ADD RESOURCE */
  const addResource = async () => {
    if (!name) return alert("Enter resource name");

    await addDoc(collection(db, "resources"), {
      name,
      type,
      status: "Available",
      centerId: user.centerId,
      createdAt: serverTimestamp()
    });

    setName("");
    setType("Ambulance");
    setShowAdd(false);
  };

  if (loading) return <p>Loading Resource Manager Panel...</p>;

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2>🏥 Resource Center</h2>
        <p>{user.centerId}</p>

        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
          ➕ Add Resource
        </button>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        <h2>🚑 Resource Management</h2>

        {resources.length === 0 && <p>No resources found.</p>}

        {resources.map(r => (
          <div key={r.id} style={styles.card}>
            <div>
              <h4>{icon(r.type)} {r.name}</h4>
              <p><b>Type:</b> {r.type}</p>
              <p><b>Status:</b> {statusBadge(r.status)}</p>

              {r.assignedIncident && (
                <p>📍 Incident: {r.assignedIncident}</p>
              )}
            </div>

            <select
              value={r.status}
              onChange={(e) => updateStatus(r.id, e.target.value)}
            >
              <option>Available</option>
              <option>Assigned</option>
              <option>Busy</option>
            </select>
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
              <option>Other</option>
            </select>

            <div style={{ display: "flex", gap: 10 }}>
              <button style={styles.saveBtn} onClick={addResource}>
                Save
              </button>
              <button style={styles.cancelBtn} onClick={() => setShowAdd(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* 🔹 ICONS */
const icon = (type) => {
  if (type === "Ambulance") return "🚑";
  if (type === "Fire Truck") return "🚒";
  if (type === "Police") return "🚓";
  return "🛠️";
};

/* 🔹 STATUS BADGE */
const statusBadge = (status) => {
  const color =
    status === "Available" ? "#2ecc71"
    : status === "Assigned" ? "#f39c12"
    : "#e74c3c";

  return (
    <span style={{
      background: color,
      color: "#fff",
      padding: "4px 8px",
      borderRadius: 4,
      fontSize: 12
    }}>
      {status}
    </span>
  );
};

/* 🎨 STYLES */
const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "Arial" },

  sidebar: {
    width: 240,
    background: "#2c3e50",
    color: "#fff",
    padding: 20
  },

  addBtn: {
    marginTop: 20,
    padding: 10,
    width: "100%",
    border: "none",
    borderRadius: 6,
    background: "#1abc9c",
    color: "#fff",
    cursor: "pointer"
  },

  main: {
    flex: 1,
    padding: 25,
    background: "#f4f6f8"
  },

  card: {
    background: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    display: "flex",
    justifyContent: "space-between",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  modal: {
    background: "#fff",
    padding: 20,
    borderRadius: 8,
    width: 300,
    display: "grid",
    gap: 10
  },

  saveBtn: {
    background: "#2ecc71",
    color: "#fff",
    border: "none",
    padding: 8,
    borderRadius: 4
  },

  cancelBtn: {
    background: "#e74c3c",
    color: "#fff",
    border: "none",
    padding: 8,
    borderRadius: 4
  }
};
