import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("community");
  const navigate = useNavigate();

  const signup = async () => {
    const res = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", res.user.uid), {
      email,
      role,
      approved: role === "community", // auto-approve community
    });

    navigate("/login");
  };

  return (
    <div style={styles.box}>
      <h2>Sign Up</h2>

      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

      <select onChange={e => setRole(e.target.value)}>
        <option value="community">Community User</option>
        <option value="volunteer">Volunteer</option>
      </select>

      <button onClick={signup}>Create Account</button>
    </div>
  );
}

const styles = {
  box: {
    maxWidth: 300,
    margin: "100px auto",
    display: "grid",
    gap: 10
  }
};
