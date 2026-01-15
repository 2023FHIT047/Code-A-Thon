import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { db } from "./firebase";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [volunteers, setVolunteers] = useState([]);
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [resourceManagers, setResourceManagers] = useState([]);
  const [pendingRMs, setPendingRMs] = useState([]);
  const [centers, setCenters] = useState([]);
  const [newCenterName, setNewCenterName] = useState("");

  /* ================= AUTH ================= */
  useEffect(() => {
    const auth = getAuth();
    const u = auth.currentUser;
    if (!u) return;

    getDoc(doc(db, "users", u.uid)).then(snap => {
      setUser({ uid: u.uid, ...snap.data() });
      setLoading(false);
    });
  }, []);

  const logout = async () => {
    await signOut(getAuth());
    localStorage.clear();
    window.location.href = "/login";
  };

  /* ================= USERS ================= */
  useEffect(() => {
    return onSnapshot(
      query(
        collection(db, "users"),
        where("role", "==", "volunteer"),
        where("approved", "==", true),
        where("rejected", "==", false)
      ),
      snap => setVolunteers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  useEffect(() => {
    return onSnapshot(
      query(
        collection(db, "users"),
        where("role", "==", "volunteer"),
        where("approved", "==", false),
        where("rejected", "==", false)
      ),
      snap => setPendingVolunteers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  useEffect(() => {
    return onSnapshot(
      query(
        collection(db, "users"),
        where("role", "==", "resource_manager"),
        where("approved", "==", true),
        where("rejected", "==", false)
      ),
      snap => setResourceManagers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  useEffect(() => {
    return onSnapshot(
      query(
        collection(db, "users"),
        where("role", "==", "resource_manager"),
        where("approved", "==", false),
        where("rejected", "==", false)
      ),
      snap => setPendingRMs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  /* ================= CENTERS ================= */
  useEffect(() => {
    return onSnapshot(collection(db, "centers"), snap =>
      setCenters(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const approveUser = id => updateDoc(doc(db, "users", id), { approved: true });
  const rejectUser = id => updateDoc(doc(db, "users", id), { rejected: true });

  const addCenter = async () => {
    if (!newCenterName.trim()) return;
    await addDoc(collection(db, "centers"), {
      name: newCenterName,
      volunteers: [],
      resourceManagers: [],
      createdAt: serverTimestamp()
    });
    setNewCenterName("");
  };

  const assignVolunteerToCenter = async (centerId, volunteerId) => {
    if (!volunteerId) return;
    const ref = doc(db, "centers", centerId);
    const snap = await getDoc(ref);
    const list = snap.data().volunteers || [];
    if (!list.includes(volunteerId)) {
      await updateDoc(ref, { volunteers: [...list, volunteerId] });
    }
  };

  const assignRMToCenter = async (centerId, rmId) => {
    if (!rmId) return;
    const ref = doc(db, "centers", centerId);
    const snap = await getDoc(ref);
    const list = snap.data().resourceManagers || [];
    if (!list.includes(rmId)) {
      await updateDoc(ref, { resourceManagers: [...list, rmId] });
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading Admin Dashboard...</p>;

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div>
          <h2 style={styles.logo}>👑 Admin Panel</h2>
          <p style={styles.email}>{user.name}</p>
        </div>
        <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        <h2 style={styles.pageTitle}>Dashboard Overview</h2>

        <div style={styles.statsGrid}>
          <Stat label="Volunteers" value={volunteers.length} />
          <Stat label="Resource Managers" value={resourceManagers.length} />
          <Stat label="Centers" value={centers.length} />
        </div>

        <Section title="⏳ Pending Volunteers">
          {pendingVolunteers.map(v => (
            <UserCard key={v.id} user={v} onApprove={() => approveUser(v.id)} onReject={() => rejectUser(v.id)} />
          ))}
          {!pendingVolunteers.length && <Muted />}
        </Section>

        <Section title="⏳ Pending Resource Managers">
          {pendingRMs.map(rm => (
            <UserCard key={rm.id} user={rm} onApprove={() => approveUser(rm.id)} onReject={() => rejectUser(rm.id)} />
          ))}
          {!pendingRMs.length && <Muted />}
        </Section>

        <Section title="🏙 Centers">
          <div style={styles.addRow}>
            <input
              style={styles.input}
              placeholder="New Center Name"
              value={newCenterName}
              onChange={e => setNewCenterName(e.target.value)}
            />
            <button style={styles.primaryBtn} onClick={addCenter}>Add</button>
          </div>

          {centers.map(c => (
            <div key={c.id} style={styles.centerCard}>
              <h4>{c.name}</h4>
              <AssignBox label="Volunteers" options={volunteers} assigned={c.volunteers} onAssign={id => assignVolunteerToCenter(c.id, id)} />
              <AssignBox label="Resource Managers" options={resourceManagers} assigned={c.resourceManagers} onAssign={id => assignRMToCenter(c.id, id)} />
            </div>
          ))}
        </Section>
      </main>
    </div>
  );
}

/* ================= COMPONENTS ================= */

const Section = ({ title, children }) => (
  <section style={styles.section}>
    <h3>{title}</h3>
    {children}
  </section>
);

const UserCard = ({ user, onApprove, onReject }) => (
  <div style={styles.card}>
    <div>
      <b>{user.name}</b>
      <p style={styles.muted}>{user.email}</p>
    </div>
    <div>
      <button style={styles.approveBtn} onClick={onApprove}>Approve</button>
      <button style={styles.rejectBtn} onClick={onReject}>Reject</button>
    </div>
  </div>
);

const AssignBox = ({ label, options, assigned = [], onAssign }) => (
  <div style={{ marginTop: 10 }}>
    <p><b>{label}</b></p>
    <select style={styles.select} onChange={e => { onAssign(e.target.value); e.target.value = ""; }}>
      <option value="">Assign {label}</option>
      {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
    <div>
      {assigned?.length
        ? assigned.map(id => <span key={id} style={styles.tag}>{id}</span>)
        : <span style={styles.muted}>None assigned</span>}
    </div>
  </div>
);

const Stat = ({ label, value }) => (
  <div style={styles.statCard}>
    <h2>{value}</h2>
    <p>{label}</p>
  </div>
);

const Muted = () => <p style={styles.muted}>No records found</p>;

/* ================= NEW PALETTE ================= */

const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },

  sidebar: {
    width: 260,
    background: "linear-gradient(180deg,#1e3a8a,#3b82f6)",
    color: "#fff",
    padding: 28,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "4px 0 20px rgba(0,0,0,0.25)"
  },

  logo: { marginBottom: 6 },
  email: { fontSize: 13, color: "#c7d2fe" },

  logoutBtn: {
    background: "linear-gradient(135deg,#f472b6,#f97316)",
    border: "none",
    padding: 12,
    borderRadius: 10,
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer"
  },

  main: { flex: 1, padding: 36, background: "#f9fafb" },
  pageTitle: { marginBottom: 20 },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 18,
    marginBottom: 30
  },

  statCard: {
    background: "#fff",
    padding: 22,
    borderRadius: 16,
    textAlign: "center",
    boxShadow: "0 12px 30px rgba(59,130,246,0.15)"
  },

  section: {
    background: "#fff",
    padding: 22,
    borderRadius: 18,
    marginBottom: 32,
    boxShadow: "0 15px 40px rgba(0,0,0,0.08)"
  },

  card: {
    display: "flex",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    background: "#f3f4f6",
    marginTop: 10
  },

  approveBtn: {
    background: "#6366f1",
    border: "none",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 8,
    marginRight: 6
  },

  rejectBtn: {
    background: "#f43f5e",
    border: "none",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 8
  },

  addRow: { display: "flex", gap: 12, marginBottom: 14 },
  input: { padding: 10, borderRadius: 10, border: "1px solid #cbd5e1" },
  select: { padding: 8, borderRadius: 8, border: "1px solid #cbd5e1" },

  primaryBtn: {
    background: "linear-gradient(135deg,#f472b6,#fb7185)",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 10
  },

  centerCard: {
    background: "#f3f4f6",
    padding: 16,
    borderRadius: 14,
    marginTop: 14
  },

  tag: {
    display: "inline-block",
    background: "#e0e7ff",
    color: "#4338ca",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    margin: 4
  },

  muted: { color: "#6b7280", fontSize: 13 }
};
