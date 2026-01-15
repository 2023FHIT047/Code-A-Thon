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
import { getAuth } from "firebase/auth";
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

  // Load Admin User
  useEffect(() => {
    const auth = getAuth();
    const u = auth.currentUser;
    if (!u) return;

    getDoc(doc(db, "users", u.uid)).then(snap => {
      setUser({ uid: u.uid, ...snap.data() });
      setLoading(false);
    });
  }, []);

  // Load Approved Volunteers
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("role", "==", "volunteer"),
      where("approved", "==", true),
      where("rejected", "==", false)
    );
    return onSnapshot(q, snap => {
      setVolunteers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // Load Pending Volunteers
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("role", "==", "volunteer"),
      where("approved", "==", false),
      where("rejected", "==", false)
    );
    return onSnapshot(q, snap => {
      setPendingVolunteers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // Load Approved Resource Managers
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("role", "==", "resource_manager"),
      where("approved", "==", true),
      where("rejected", "==", false)
    );
    return onSnapshot(q, snap => {
      setResourceManagers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // Load Pending Resource Managers
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("role", "==", "resource_manager"),
      where("approved", "==", false),
      where("rejected", "==", false)
    );
    return onSnapshot(q, snap => {
      setPendingRMs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // Load Centers
  useEffect(() => {
    const q = collection(db, "centers");
    return onSnapshot(q, snap => {
      setCenters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // Approve Volunteer or RM
  const approveUser = async (id) => {
    await updateDoc(doc(db, "users", id), { approved: true });
  };

  // Reject Volunteer or RM
  const rejectUser = async (id) => {
    await updateDoc(doc(db, "users", id), { rejected: true });
  };

  // Add Center
  const addCenter = async () => {
    if (!newCenterName.trim()) return alert("Enter center name");

    await addDoc(collection(db, "centers"), {
      name: newCenterName,
      volunteers: [],
      resourceManagers: [],
      createdAt: serverTimestamp()
    });

    setNewCenterName("");
  };

  // Assign Volunteer to Center
  const assignVolunteerToCenter = async (centerId, volunteerId) => {
    if (!volunteerId) return;

    const centerRef = doc(db, "centers", centerId);
    const centerSnap = await getDoc(centerRef);
    const currentVolunteers = centerSnap.data().volunteers || [];

    if (!currentVolunteers.includes(volunteerId)) {
      await updateDoc(centerRef, {
        volunteers: [...currentVolunteers, volunteerId]
      });
    }
  };

  // Assign Resource Manager to Center
  const assignRMToCenter = async (centerId, rmId) => {
    if (!rmId) return;

    const centerRef = doc(db, "centers", centerId);
    const centerSnap = await getDoc(centerRef);
    const currentRMs = centerSnap.data().resourceManagers || [];

    if (!currentRMs.includes(rmId)) {
      await updateDoc(centerRef, {
        resourceManagers: [...currentRMs, rmId]
      });
    }
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

        {/* Pending Volunteers */}
        <section style={styles.section}>
          <h3>⏳ Pending Volunteers</h3>
          {pendingVolunteers.length === 0 && <p>No pending volunteers.</p>}
          {pendingVolunteers.map(v => (
            <div key={v.id} style={styles.card}>
              <p>{v.name} ({v.email})</p>
              <div>
                <button onClick={() => approveUser(v.id)}>Approve ✅</button>
                <button onClick={() => rejectUser(v.id)} style={{ marginLeft: 5 }}>Reject ❌</button>
              </div>
            </div>
          ))}
        </section>

        {/* Pending Resource Managers */}
        <section style={styles.section}>
          <h3>⏳ Pending Resource Managers</h3>
          {pendingRMs.length === 0 && <p>No pending Resource Managers.</p>}
          {pendingRMs.map(rm => (
            <div key={rm.id} style={styles.card}>
              <p>{rm.name} ({rm.email})</p>
              <div>
                <button onClick={() => approveUser(rm.id)}>Approve ✅</button>
                <button onClick={() => rejectUser(rm.id)} style={{ marginLeft: 5 }}>Reject ❌</button>
              </div>
            </div>
          ))}
        </section>

        {/* Approved Volunteers */}
        <section style={styles.section}>
          <h3>👥 Volunteers</h3>
          {volunteers.length === 0 && <p>No approved volunteers found.</p>}
          {volunteers.map(v => (
            <div key={v.id} style={styles.card}>
              <p>{v.name} ({v.email})</p>
            </div>
          ))}
        </section>

        {/* Resource Managers */}
        <section style={styles.section}>
          <h3>🛠 Resource Managers</h3>
          {resourceManagers.length === 0 && <p>No Resource Managers found.</p>}
          {resourceManagers.map(rm => (
            <div key={rm.id} style={styles.card}>
              <p>{rm.name} ({rm.email})</p>
            </div>
          ))}
        </section>

        {/* Centers */}
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
          {centers.map(c => {
            const centerVols = c.volunteers || [];
            const centerRMs = c.resourceManagers || [];

            return (
              <div key={c.id} style={styles.cardColumn}>
                <p style={{ fontWeight: "bold" }}>{c.name}</p>

                {/* Assign Volunteers */}
                <div>
                  <p>Assign Volunteers:</p>
                  {volunteers.length > 0 ? (
                    <select
                      onChange={e => {
                        assignVolunteerToCenter(c.id, e.target.value);
                        e.target.value = "";
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Select Volunteer</option>
                      {volunteers.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p>No volunteers available</p>
                  )}
                  <div>
                    {centerVols.length > 0 ? (
                      centerVols.map(vId => {
                        const v = volunteers.find(vol => vol.id === vId);
                        return v ? <span key={vId} style={styles.tag}>{v.name}</span> : null;
                      })
                    ) : (
                      <span>No volunteers assigned</span>
                    )}
                  </div>
                </div>

                {/* Assign Resource Managers */}
                <div style={{ marginTop: 10 }}>
                  <p>Assign Resource Managers:</p>
                  {resourceManagers.length > 0 ? (
                    <select
                      onChange={e => {
                        assignRMToCenter(c.id, e.target.value);
                        e.target.value = "";
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Select RM</option>
                      {resourceManagers.map(rm => (
                        <option key={rm.id} value={rm.id}>{rm.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p>No Resource Managers available</p>
                  )}
                  <div>
                    {centerRMs.length > 0 ? (
                      centerRMs.map(rmId => {
                        const rm = resourceManagers.find(r => r.id === rmId);
                        return rm ? <span key={rmId} style={styles.tag}>{rm.name}</span> : null;
                      })
                    ) : (
                      <span>No RMs assigned</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Stats */}
        <section style={styles.section}>
          <h3>📊 Stats</h3>
          <p>Total Volunteers: {volunteers.length}</p>
          <p>Total Resource Managers: {resourceManagers.length}</p>
          <p>Total Centers: {centers.length}</p>
        </section>
      </main>
    </div>
  );
}

// STYLES
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
  },
  cardColumn: {
    background: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  tag: {
    display: "inline-block",
    background: "#3498db",
    color: "#fff",
    padding: "3px 8px",
    margin: "2px",
    borderRadius: 4,
    fontSize: 12
  }
};
