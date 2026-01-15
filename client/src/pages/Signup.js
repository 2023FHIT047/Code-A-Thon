import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
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
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const signup = async () => {
    try {
      setError("");

      if (!name || !email || !password || !contact) {
        return setError("All fields are required.");
      }

      /* 🔐 COORDINATOR VALIDATION */
      if (role === "coordinator" && coordinatorCode !== COORDINATOR_SECRET_CODE) {
        return setError("Invalid Coordinator Secret Code.");
      }

      // Create Auth User
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // Auto approval logic
      const autoApprove = role === "community" || role === "coordinator";

      // Save user to Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        name,
        email,
        contact,
        role,
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
        <p style={styles.subText}>Join the platform</p>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.field}>
          <label>Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div style={styles.field}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div style={styles.field}>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        <div style={styles.field}>
          <label>Contact Number</label>
          <input value={contact} onChange={e => setContact(e.target.value)} />
        </div>

        <div style={styles.field}>
          <label>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="community">Community User</option>
            <option value="volunteer">Volunteer</option>
            <option value="resourceManager">Resource Manager</option>
            <option value="coordinator">Coordinator</option>
          </select>
        </div>

        {role === "coordinator" && (
          <div style={{ ...styles.field, borderLeft: "4px solid #e74c3c", paddingLeft: 10 }}>
            <label>Coordinator Secret Code</label>
            <input
              placeholder="Enter secret code"
              value={coordinatorCode}
              onChange={e => setCoordinatorCode(e.target.value)}
            />
          </div>
        )}

        <button onClick={signup} style={styles.button}>
          Sign Up
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

/* 🎨 STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #74ebd5, #9face6)",
    fontFamily: "Segoe UI"
  },
  card: {
    width: 380,
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    gap: 14
  },
  heading: {
    textAlign: "center",
    marginBottom: 4
  },
  subText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginBottom: 10
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 4
  },
  error: {
    color: "#e74c3c",
    textAlign: "center",
    fontSize: 14
  },
  button: {
    marginTop: 10,
    padding: 12,
    borderRadius: 6,
    border: "none",
    background: "#3498db",
    color: "#fff",
    fontSize: 16,
    cursor: "pointer"
  },
  footerText: {
    textAlign: "center",
    fontSize: 14
  },
  link: {
    color: "#3498db",
    fontWeight: "bold",
    cursor: "pointer"
  }
};
