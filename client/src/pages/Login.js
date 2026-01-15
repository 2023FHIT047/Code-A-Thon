import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) {
        setError("User profile not found.");
        return;
      }

      const { role } = userSnap.data();

      localStorage.setItem("user", JSON.stringify({ uid: user.uid, email: user.email, role }));

      switch (role) {
        case "coordinator":
          navigate("/CoordinatorDashboard");
          break;
        case "volunteer":
          navigate("/VolunteerDashboard");
          break;
        case "resource_manager":
          navigate("/ResourceManagerDashboard");
          break;
        case "community":
          navigate("/CommunityDashboard");
          break;
        case "admin":
          navigate("/Admin");
          break;
        default:
          setError("User role is not recognized.");
      }
    } catch (err) {
      if (err.code === "auth/wrong-password") setError("Incorrect password.");
      else if (err.code === "auth/user-not-found") setError("User not found.");
      else setError("Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ===== Inline CSS Styles ===== */
  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f8fafc",
      padding: "20px",
      fontFamily: "Inter, sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: "380px",
      background: "#ffffff",
      padding: "32px",
      borderRadius: "10px",
      boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
    },
    title: {
      fontSize: "24px",
      fontWeight: 600,
      marginBottom: "12px",
      color: "#1e293b",
    },
    error: {
      color: "#e74c3c",
      marginBottom: "8px",
      fontSize: "14px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      marginTop: "12px",
    },
    input: {
      padding: "14px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "15px",
      outline: "none",
      transition: "border-color 0.2s",
    },
    inputFocus: {
      borderColor: "#3754ff",
    },
    button: {
      padding: "14px",
      background: "#3754ff",
      color: "#fff",
      fontSize: "16px",
      fontWeight: 500,
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "background 0.2s",
    },
    buttonHover: {
      background: "#2b3dbf",
    },
    footer: {
      marginTop: "18px",
      fontSize: "14px",
      color: "#475569",
    },
    link: {
      color: "#3754ff",
      fontWeight: "bold",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>CrisisLink Login</h1>

        {error && <div style={styles.error}>{error}</div>}

        <form
          style={styles.form}
          onSubmit={handleLogin}
        >
          <input
            style={styles.input}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.footer}>
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
