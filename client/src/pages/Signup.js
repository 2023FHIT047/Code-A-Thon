import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState("community");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const signup = async () => {
    try {
      if (!name || !email || !password || !contact) {
        return setError("Please fill all the fields.");
      }

      // 1️⃣ Create user in Firebase Auth
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // 2️⃣ Save additional info in Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        name,
        email,
        contact,
        role,
        approved: role === "community", // auto-approve community users
        rejected: false,
        createdAt: new Date(),
      });

      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div style={styles.box}>
      <h2>Sign Up</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="Full Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <input
        placeholder="Contact Number"
        type="tel"
        value={contact}
        onChange={e => setContact(e.target.value)}
      />

      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="community">Community User</option>
        <option value="volunteer">Volunteer</option>
      </select>

      <button onClick={signup} style={styles.button}>Create Account</button>
    </div>
  );
}

const styles = {
  box: {
    maxWidth: 350,
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
    background: "#28a745",
    color: "#fff",
    cursor: "pointer",
    fontSize: 16
  }
};
