import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase"; // your firebase config

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        setError("User data not found!");
        return;
      }

      const userData = userDoc.data();
      const role = userData.role || "community"; // default to community

      // Save user info in localStorage
      localStorage.setItem("user", JSON.stringify({
        uid: user.uid,
        email: user.email,
        role: role
      }));

      // Navigate based on role
      if (role === "admin") navigate("/AdminDashboard");
      else if (role === "volunteer") navigate("/VolunteerDashboard");
      else navigate("/CommunityDashboard");

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Login</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", alignItems: "center", marginTop: 50, fontFamily: "Arial" },
  form: { display: "flex", flexDirection: "column", width: 300, gap: 10 },
  input: { padding: 8, fontSize: 16, borderRadius: 4, border: "1px solid #ccc" },
  button: { padding: 10, fontSize: 16, borderRadius: 4, border: "none", background: "#28a745", color: "#fff", cursor: "pointer" },
};
