import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";

function LocationSelector({ setLocation }) {
  useMapEvents({
    click(e) {
      setLocation({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });
  return null;
}

export default function MapView({ location, setLocation }) {
  return (
    <MapContainer
      center={[19.2183, 72.9781]}
      zoom={12}
      style={{ height: "400px", borderRadius: "8px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      <LocationSelector setLocation={setLocation} />

      {location && (
        <Marker position={[location.lat, location.lng]}>
          <Popup>Selected Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
