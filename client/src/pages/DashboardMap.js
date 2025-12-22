import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function DashboardMap({ incidents, onIncidentClick }) {
  return (
    <MapContainer center={[19.0760, 72.8777]} zoom={12} style={{ height: "400px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {incidents.map(inc => (
        <Marker
          key={inc.id}
          position={[inc.lat, inc.lng]}
          eventHandlers={{
            click: () => onIncidentClick(inc)
          }}
        >
          <Popup>
            <b>{inc.title}</b><br/>
            Status: {inc.status}<br/>
            Severity: {inc.severity}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
