import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

/* Leaflet */
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* FIX DEFAULT MARKER ICON */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function PublicMapPage() {
  const [incidents, setIncidents] = useState([]);

  /* 🔥 REALTIME INCIDENTS */
  useEffect(() => {
    return onSnapshot(collection(db, "incidents"), snap => {
      setIncidents(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(i => i.location?.lat && i.location?.lng)
      );
    });
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={[19.076, 72.8777]}   // Mumbai default
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {incidents.map(inc => (
          <Marker
            key={inc.id}
            position={[inc.location.lat, inc.location.lng]}
          >
            <Popup>
              <h4>{inc.title}</h4>
              <p>{inc.description}</p>
              <p><b>Status:</b> {inc.status}</p>
              <p><b>Severity:</b> {inc.severity}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
