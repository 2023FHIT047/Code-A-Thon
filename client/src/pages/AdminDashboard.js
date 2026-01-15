import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function AdminDashboard() {
  const [volunteers, setVolunteers] = useState([]);
  const [resources, setResources] = useState([]);
  const [centers, setCenters] = useState([]);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    // Load Volunteers
    return onSnapshot(collection(db, "users"), snap => {
      setVolunteers(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => u.role?.toLowerCase() === "volunteer")
      );
    });
  }, []);

  useEffect(() => {
    // Load Resources
    return onSnapshot(collection(db, "resources"), snap => {
      setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  useEffect(() => {
    // Load Centers
    return onSnapshot(collection(db, "centers"), snap => {
      setCenters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  /* ================= VOLUNTEER ACTIONS ================= */

  const approveVolunteer = async (v) => {
    await updateDoc(doc(db, "users", v.id), { approved: true });
  };

  const rejectVolunteer = async (v) => {
    await updateDoc(doc(db, "users", v.id), { approved: false, rejected: true });
  };

  /* ================= UI ================= */

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2>🏥 Admin Panel</h2>
        <h3>Centers</h3>
        {centers.map(c => (
          <p key={c.id}>{c.name}</p>
        ))}
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        <h2>👤 Volunteers</h2>

        {volunteers.length === 0 && <p>No volunteers registered yet</p>}

        <div style={styles.grid}>
          {volunteers.map(v => (
            <div key={v.id} style={styles.card}>
              <p><b>Name:</b> {v.name}</p>
              <p><b>Email:</b> {v.email}</p>
              <p><b>Contact:</b> {v.contact}</p>
              <p><b>Center:</b> {centers.find(c => c.id === v.centerId)?.name || "Unknown"}</p>
              <p>
                <b>Status:</b>{" "}
                {v.approved ? "Approved ✅" : v.rejected ? "Rejected ❌" : "Pending ⏳"}
              </p>

              {!v.approved && !v.rejected && (
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button style={styles.approveBtn} onClick={() => approveVolunteer(v)}>
                    Approve
                  </button>
                  <button style={styles.rejectBtn} onClick={() => rejectVolunteer(v)}>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: 40 }}>🚑 Resources</h2>
        <div style={styles.grid}>
          {resources.map(r => (
            <div key={r.id} style={styles.card}>
              <p><b>Name:</b> {r.name}</p>
              <p><b>Type:</b> {r.type}</p>
              <p><b>Status:</b> {r.status}</p>
              <p><b>Center:</b> {centers.find(c => c.id === r.centerId)?.name || "Unknown"}</p>
            </div>
          ))}
        </div>
      </main>
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

  approveBtn: {
    background: "#2ecc71",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer"
  },

  rejectBtn: {
    background: "#e74c3c",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer"
  }
};
