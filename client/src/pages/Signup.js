import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";

/* 🔐 COORDINATOR SECRET CODE */
const COORDINATOR_SECRET_CODE = "ADMIN@123";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState("community");
  const [coordinatorCode, setCoordinatorCode] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("");
  const [error, setError] = useState("");

  const [centers, setCenters] = useState([]);
  const navigate = useNavigate();

  /* 🔄 LOAD CENTERS */
  useEffect(() => {
    const fetchCenters = async () => {
      const snap = await getDocs(collection(db, "centers"));
      setCenters(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
    };
    fetchCenters();
  }, []);

  const signup = async () => {
    try {
      setError("");

      if (!name || !email || !password || !contact) {
        return setError("Please fill all required fields.");
      }

      if (role === "coordinator" && coordinatorCode !== COORDINATOR_SECRET_CODE) {
        return setError("Invalid Coordinator Secret Code.");
      }

      if ((role === "volunteer" || role === "resourceManager") && !selectedCenter) {
        return setError("Please select a city / center.");
      }

      const res = await createUserWithEmailAndPassword(auth, email, password);

      const autoApprove = role === "community" || role === "coordinator";

      await setDoc(doc(db, "users", res.user.uid), {
        name,
        email,
        contact,
        role,
        centerId: selectedCenter || null,
        approved: autoApprove,
        rejected: false,
        createdAt: new Date()
      });

      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Create Account</h2>
        <p style={styles.subText}>Crisis Response Platform</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.field}>
          <label>Full Name</label>
          <input placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div style={styles.field}>
          <label>Email</label>
          <input type="email" placeholder="john@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div style={styles.field}>
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        <div style={styles.field}>
          <label>Contact Number</label>
          <input placeholder="9876543210" value={contact} onChange={e => setContact(e.target.value)} />
        </div>

        <div style={styles.field}>
          <label>Select Role</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="community">Community User</option>
            <option value="volunteer">Volunteer</option>
            <option value="resourceManager">Resource Manager</option>
            <option value="coordinator">Coordinator</option>
          </select>
        </div>

        {(role === "volunteer" || role === "resourceManager") && (
          <div style={styles.highlightBox}>
            <label>City / Center</label>
            <select value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)}>
              <option value="">Select Center</option>
              {centers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {role === "coordinator" && (
          <div style={{ ...styles.highlightBox, borderLeft: "4px solid #ef4444" }}>
            <label>Coordinator Secret Code</label>
            <input
              placeholder="Enter secret code"
              value={coordinatorCode}
              onChange={e => setCoordinatorCode(e.target.value)}
            />
          </div>
        )}

        <button onClick={signup} style={styles.button}>
          Create Account
        </button>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

/* 🎨 PREMIUM STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    fontFamily: "'Inter', Segoe UI, sans-serif"
  },

  card: {
    width: 420,
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(10px)",
    padding: 32,
    borderRadius: 18,
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    gap: 14
  },

  heading: {
    textAlign: "center",
    marginBottom: 2,
    fontSize: 24
  },

  subText: {
    textAlign: "center",
    fontSize: 14,
    color: "#64748b",
    marginBottom: 10
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6
  },

  highlightBox: {
    background: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    gap: 6
  },

  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    textAlign: "center"
  },

  button: {
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(37,99,235,0.4)"
  },

  footerText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 8
  },

  link: {
    color: "#2563eb",
    fontWeight: 600,
    cursor: "pointer"
  }
};
