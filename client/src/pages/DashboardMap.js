import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // make sure this is imported

// ================= ICON FACTORY =================
const createEmojiIcon = (emoji, bg = "#e74c3c") =>
  L.divIcon({
    html: `
      <div style="
        background:${bg};
        width:36px;
        height:36px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:20px;
        color:white;
        box-shadow:0 0 6px rgba(0,0,0,0.5);
      ">${emoji}</div>
    `,
    className: "", // must be empty
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });

// ================= DASHBOARD MAP =================
export default function DashboardMap({ incidents, onIncidentClick }) {
  // assign icon based on severity
  const getIncidentIcon = (severity) => {
    if (severity === "Critical" || severity === "High") return createEmojiIcon("🚨", "#e74c3c");
    if (severity === "Medium") return createEmojiIcon("⚠️", "#f39c12");
    return createEmojiIcon("ℹ️", "#2ecc71");
  };

  return (
    <MapContainer
      center={[19.0760, 72.8777]}
      zoom={12}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {incidents.map((inc) => (
        <Marker
          key={inc.id}
          position={[inc.lat, inc.lng]}
          icon={getIncidentIcon(inc.severity)}
          eventHandlers={{
            click: () => onIncidentClick && onIncidentClick(inc)
          }}
        >
          <Popup>
            <b>{inc.title}</b>
            <br />
            Status: {inc.status}
            <br />
            Severity: {inc.severity}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
