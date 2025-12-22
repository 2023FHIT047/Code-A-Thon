import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <h2>CrisisConnect</h2>
        <div>
          <button style={styles.navBtn} onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        <h1>Integrated Community Crisis Response Platform</h1>
        <p>
          View ongoing incidents, track resources, and coordinate emergency
          response in real time.
        </p>

        <div>
          {/* ✅ VIEW MAP BUTTON */}
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/map")}
          >
            View Live Incident Map
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => navigate("/signup")}
          >
            Volunteer / Agency Login
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section style={styles.section}>
        <h2>What We Offer</h2>

        <div style={styles.features}>
          <Feature
            title="Community Incident Visibility"
            desc="Anyone can view live incidents on the public map."
          />
          <Feature
            title="Live Resource Tracking"
            desc="Track volunteers, ambulances, shelters, and supplies."
          />
          <Feature
            title="Role-Based Access"
            desc="Different dashboards for users, volunteers, and agencies."
          />
          <Feature
            title="Map-Based Dashboard"
            desc="All incidents visualized geographically in real time."
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={styles.sectionAlt}>
        <h2>How It Works</h2>
        <ol style={{ maxWidth: "700px", margin: "auto", textAlign: "left" }}>
          <li>Public users view incidents on the live map</li>
          <li>Community users log in to report incidents</li>
          <li>Admins validate and assign volunteers/resources</li>
          <li>Status updates are reflected on the map</li>
        </ol>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2>Join the Response Network</h2>
        <p>Sign up to report incidents or volunteer during emergencies.</p>
        <button
          style={styles.primaryBtn}
          onClick={() => navigate("/signup")}
        >
          Get Started
        </button>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>© 2025 CrisisConnect | Hackathon Prototype</p>
      </footer>

    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 40px",
    background: "#0d47a1",
    color: "white",
  },
  navBtn: {
    padding: "8px 15px",
    background: "white",
    color: "#0d47a1",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
  },
  hero: {
    padding: "80px 20px",
    textAlign: "center",
    background: "#e3f2fd",
  },
  section: {
    padding: "60px 20px",
    textAlign: "center",
  },
  sectionAlt: {
    padding: "60px 20px",
    background: "#f5f5f5",
    textAlign: "center",
  },
  features: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "30px",
  },
  card: {
    padding: "20px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  primaryBtn: {
    padding: "12px 20px",
    margin: "10px",
    background: "#d32f2f",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },
  secondaryBtn: {
    padding: "12px 20px",
    margin: "10px",
    background: "#1976d2",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },
  cta: {
    padding: "60px 20px",
    textAlign: "center",
    background: "#0d47a1",
    color: "white",
  },
  footer: {
    padding: "15px",
    textAlign: "center",
    background: "#eeeeee",
  },
};
