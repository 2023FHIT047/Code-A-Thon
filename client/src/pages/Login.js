import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const auth = getAuth();

    try {
      // Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Fetch user document from Firestore
      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (!userSnap.exists()) {
        setError("User profile not found.");
        return;
      }

      const userData = userSnap.data();
      const role = userData.role;

      // Save user session
      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: user.uid,
          email: user.email,
          role: role
        })
      );

      // Role-based navigation
      if (role === "coordinator") navigate("/CoordinatorDashboard");
      else if (role === "volunteer") navigate("/VolunteerDashboard");
      else if (role === "resourceManager") navigate("/ResourceManagerDashboard");
      else navigate("/CommunityDashboard");

    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Welcome Back</h2>
        <p style={styles.subText}>Login to your account</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.field}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        <p style={styles.footerText}>
          Don’t have an account?{" "}
          <span
            style={styles.link}
            onClick={() => navigate("/signup")}
          >
            Sign Up
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
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    fontFamily: "Segoe UI"
  },
  card: {
    width: 360,
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
    color: "#666",
    fontSize: 14,
    marginBottom: 10
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12
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
    background: "#667eea",
    color: "#fff",
    fontSize: 16,
    cursor: "pointer"
  },
  footerText: {
    textAlign: "center",
    fontSize: 14
  },
  link: {
    color: "#667eea",
    fontWeight: "bold",
    cursor: "pointer"
  }
};
