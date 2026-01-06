import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";

/* 🔐 CHANGE THIS ADMIN CODE */
const ADMIN_SECRET_CODE = "ADMIN@123";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState("community");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const signup = async () => {
    try {
      setError("");

      if (!name || !email || !password || !contact) {
        return setError("All fields are required.");
      }

      /* 🔐 ADMIN VALIDATION */
      if (role === "admin" && adminCode !== ADMIN_SECRET_CODE) {
        return setError("Invalid Admin Secret Code.");
      }

      // 1️⃣ Create Auth User
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // 2️⃣ Role-based approval
      const autoApprove = role === "community" || role === "admin";

      // 3️⃣ Save to Firestore
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
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div style={styles.box}>
      <h2>📝 Sign Up</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <input placeholder="Contact Number" value={contact} onChange={e => setContact(e.target.value)} />

      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="community">Community User</option>
        <option value="volunteer">Volunteer</option>
        <option value="resourceManager">Resource Manager</option>
        <option value="admin">Admin</option>
      </select>

      {/* 🔐 ADMIN CODE FIELD */}
      {role === "admin" && (
        <input
          placeholder="Admin Secret Code"
          value={adminCode}
          onChange={e => setAdminCode(e.target.value)}
        />
      )}

      <button onClick={signup} style={styles.button}>
        Create Account
      </button>
    </div>
  );
}

/* 🎨 STYLES */
const styles = {
  box: {
    maxWidth: 380,
    margin: "100px auto",
    display: "grid",
    gap: 10,
    padding: 20,
    border: "1px solid #ccc",
    borderRadius: 8,
    fontFamily: "Arial"
  },
  button: {
    padding: 10,
    borderRadius: 4,
    border: "none",
    background: "#3498db",
    color: "#fff",
    cursor: "pointer",
    fontSize: 16
  }
};
