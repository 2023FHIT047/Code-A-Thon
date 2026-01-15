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
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ADD RESOURCE */
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Ambulance");

  /* ASSIGN */
  const [selectedIncident, setSelectedIncident] = useState("");

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

  /* 🚨 LOAD OPEN INCIDENTS */
  useEffect(() => {
    if (!user?.centerId) return;

    const q = query(
      collection(db, "incidents"),
      where("centerId", "==", user.centerId),
      where("status", "==", "Open")
    );

    return onSnapshot(q, snap => {
      setIncidents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  /* ➕ ADD RESOURCE */
  const addResource = async () => {
    if (!name) return alert("Enter resource name");

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

  /* 📌 ASSIGN RESOURCE */
  const assignResource = async (resourceId) => {
    if (!selectedIncident) {
      alert("Select an incident");
      return;
    }

    await updateDoc(doc(db, "resources", resourceId), {
      status: "Assigned",
      assignedIncident: selectedIncident
    });

    setSelectedIncident("");
  };

  /* 🔁 UPDATE STATUS */
  const updateStatus = async (id, status) => {
    const data = { status };
    if (status === "Available") data.assignedIncident = null;
    await updateDoc(doc(db, "resources", id), data);
  };

  if (loading) return <p>Loading Resource Manager...</p>;

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
        <h2>🚑 Resource Dashboard</h2>

        {resources.map(r => (
          <div key={r.id} style={styles.card}>
            <div>
              <h4>{icon(r.type)} {r.name}</h4>
              <p>Status: {badge(r.status)}</p>
              {r.assignedIncident && (
                <p>📍 Incident: {r.assignedIncident}</p>
              )}
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              {r.status === "Available" && (
                <>
                  <select
                    value={selectedIncident}
                    onChange={e => setSelectedIncident(e.target.value)}
                  >
                    <option value="">Select Incident</option>
                    {incidents.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.title || i.id}
                      </option>
                    ))}
                  </select>

                  <button onClick={() => assignResource(r.id)}>
                    📌 Assign
                  </button>
                </>
              )}

              <select
                value={r.status}
                onChange={e => updateStatus(r.id, e.target.value)}
              >
                <option>Available</option>
                <option>Assigned</option>
                <option>Busy</option>
              </select>
            </div>
          </div>
        ))}
      </main>

      {/* ADD MODAL */}
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
            <button onClick={addResource}>Save</button>
            <button onClick={() => setShowAdd(false)}>Cancel</button>
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
      s === "Assigned" ? "#f39c12" : "#e74c3c"
  }}>
    {s}
  </span>
);

const styles = {
  container: { display: "flex", minHeight: "100vh" },
  sidebar: { width: 240, background: "#2c3e50", color: "#fff", padding: 20 },
  addBtn: { marginTop: 20, padding: 10, width: "100%" },
  main: { flex: 1, padding: 25, background: "#f4f6f8" },
  card: {
    background: "#fff",
    padding: 15,
    marginBottom: 15,
    display: "flex",
    justifyContent: "space-between",
    borderRadius: 8
  },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", justifyContent: "center", alignItems: "center"
  },
  modal: { background: "#fff", padding: 20, borderRadius: 8, width: 300 }
};
