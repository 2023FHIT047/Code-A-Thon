// src/Login.js
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import "./styles.css";

export default function Login() {
  const navigate = useNavigate();

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    navigate("/dashboard");
  };

  return (
    <div className="container">
      <div className="card" style={{ textAlign: "center" }}>
        <h1>Crisis Response Platform</h1>
        <p>Login to report incidents and help your community</p>
        <button onClick={login}>Login with Google</button>
      </div>
    </div>
  );
}

