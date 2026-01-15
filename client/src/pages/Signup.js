import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, collection, getDocs, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";

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
      if (!name || !email || !password || !contact)
        return setError("Please fill all required fields.");

      if (role === "coordinator" && coordinatorCode !== COORDINATOR_SECRET_CODE)
        return setError("Invalid Coordinator Secret Code.");

      if ((role === "volunteer" || role === "resourceManager") && !selectedCenter)
        return setError("Please select a city / center.");

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
        createdAt: new Date(),
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

        <InputField label="Full Name" placeholder="John Doe" value={name} onChange={setName} />
        <InputField label="Email" placeholder="john@email.com" type="email" value={email} onChange={setEmail} />
        <InputField label="Password" placeholder="••••••••" type="password" value={password} onChange={setPassword} />
        <InputField label="Contact Number" placeholder="9876543210" value={contact} onChange={setContact} />

        <div style={styles.field}>
          <label style={styles.label}>Select Role</label>
          <select
            style={styles.select}
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="community">Community User</option>
            <option value="volunteer">Volunteer</option>
            <option value="resourceManager">Resource Manager</option>
            <option value="coordinator">Coordinator</option>
          </select>
        </div>

        {(role === "volunteer" || role === "resourceManager") && (
          <div style={styles.highlightBox}>
            <label style={styles.label}>City / Center</label>
            <select
              style={styles.select}
              value={selectedCenter}
              onChange={e => setSelectedCenter(e.target.value)}
            >
              <option value="">Select Center</option>
              {centers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {role === "coordinator" && (
          <div style={{ ...styles.highlightBox, borderLeft: "4px solid #ef4444" }}>
            <label style={styles.label}>Coordinator Secret Code</label>
            <input
              style={styles.input}
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

/* =================== SUB-COMPONENT =================== */
function InputField({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        style={styles.input}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

/* =================== STYLES =================== */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    fontFamily: "'Inter', Segoe UI, sans-serif",
    padding: "20px"
  },
  card: {
    width: 450,
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(15px)",
    padding: 40,
    borderRadius: 20,
    boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    transition: "all 0.3s ease-in-out",
  },
  heading: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: 700,
    color: "#111827",
  },
  subText: {
    textAlign: "center",
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 10,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "12px 15px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: 14,
    transition: "0.3s",
    fontWeight: 500,
    color: "#111827",
  },
  inputFocus: {
    borderColor: "#2563eb",
    boxShadow: "0 0 8px rgba(37,99,235,0.3)",
  },
  select: {
    padding: "12px 15px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: 14,
    fontWeight: 500,
    color: "#111827",
    outline: "none",
    transition: "0.3s",
  },
  highlightBox: {
    background: "rgba(243, 244, 246,0.7)",
    padding: 14,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    transition: "0.3s",
  },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    textAlign: "center",
    fontWeight: 500,
  },
  button: {
    marginTop: 12,
    padding: "14px 0",
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 12px 28px rgba(37,99,235,0.35)",
    transition: "0.3s",
  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 10,
    color: "#6b7280",
  },
  link: {
    color: "#2563eb",
    fontWeight: 600,
    cursor: "pointer",
  },
};
