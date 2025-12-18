import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function DashboardMap({ incidents }) {
  return (
    <MapContainer
      center={[19.2183, 72.9781]}
      zoom={12}
      style={{ height: "450px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {incidents.map((incident) => (
        <Marker
          key={incident.id}
          position={[incident.lat, incident.lng]}
        >
          <Popup>
            <b>{incident.type}</b> <br />
            Severity: {incident.severity} <br />
            Status: {incident.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
