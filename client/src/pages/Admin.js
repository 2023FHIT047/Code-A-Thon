import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [volunteers, setVolunteers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [newCenterName, setNewCenterName] = useState("");

  /* 🔐 LOAD ADMIN USER */
  useEffect(() => {
    const auth = getAuth();
    const u = auth.currentUser;
    if (!u) return;

    getDoc(doc(db, "users", u.uid)).then(snap => {
      setUser({ uid: u.uid, ...snap.data() });
      setLoading(false);
    });
  }, []);

  /* 👥 LOAD VOLUNTEERS */
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "Volunteer"));
    return onSnapshot(q, snap => {
      setVolunteers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  /* 🏙 LOAD CENTERS */
  useEffect(() => {
    const q = collection(db, "centers");
    return onSnapshot(q, snap => {
      setCenters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  /* ✅ APPROVE VOLUNTEER */
  const approveVolunteer = async (id) => {
    await updateDoc(doc(db, "users", id), { approved: true });
  };

  /* ➕ ADD CENTER */
  const addCenter = async () => {
    if (!newCenterName.trim()) return alert("Enter center name");

    await addDoc(collection(db, "centers"), {
      name: newCenterName,
      createdAt: serverTimestamp()
    });

    setNewCenterName("");
  };

  if (loading) return <p>Loading Admin Dashboard...</p>;

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2>👑 Admin Panel</h2>
        <p>Welcome, {user.name || "Admin"}</p>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        <h2>📊 Dashboard</h2>

        {/* VOLUNTEERS */}
        <section style={styles.section}>
          <h3>👥 Volunteers</h3>
          {volunteers.length === 0 && <p>No volunteers found.</p>}
          {volunteers.map(v => (
            <div key={v.id} style={styles.card}>
              <p>{v.name || "Unnamed"} ({v.email})</p>
              <p>Status: {v.approved ? "✅ Approved" : "⏳ Pending"}</p>
              {!v.approved && (
                <button onClick={() => approveVolunteer(v.id)}>Approve</button>
              )}
            </div>
          ))}
        </section>

        {/* CENTERS */}
        <section style={styles.section}>
          <h3>🏙 Centers / Cities</h3>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input
              placeholder="New Center Name"
              value={newCenterName}
              onChange={e => setNewCenterName(e.target.value)}
            />
            <button onClick={addCenter}>Add Center</button>
          </div>
          {centers.length === 0 && <p>No centers found.</p>}
          {centers.map(c => (
            <div key={c.id} style={styles.card}>
              <p>{c.name}</p>
            </div>
          ))}
        </section>

        {/* STATS */}
        <section style={styles.section}>
          <h3>📊 Stats</h3>
          <p>Total Volunteers: {volunteers.length}</p>
          <p>Total Centers: {centers.length}</p>
        </section>
      </main>
    </div>
  );
}

/* STYLES */
const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" },
  sidebar: { width: 240, background: "#2c3e50", color: "#fff", padding: 20 },
  main: { flex: 1, padding: 25, background: "#f4f6f8" },
  section: { marginBottom: 30 },
  card: {
    background: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }
};
