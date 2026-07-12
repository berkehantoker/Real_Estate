"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Marker ikonları - CDN linkleri
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapSelectorProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
}

// Koordinat değiştiğinde haritayı yeniden mount etmeden kaydırır
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom(), { animate: false });
  return null;
}

function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function DraggableMarker({ latitude, longitude, onLocationChange }: MapSelectorProps) {
  if (!latitude || !longitude) return null;
  return (
    <Marker
      position={[latitude, longitude]}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const position = marker.getLatLng();
          onLocationChange(position.lat, position.lng);
        },
      }}
    />
  );
}

export default function MapSelector({ latitude, longitude, onLocationChange }: MapSelectorProps) {
  const centerLat = latitude || 39.92077;
  const centerLng = longitude || 32.85411;

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={latitude ? 15 : 5}
      style={{ height: '350px', width: '100%' }}
      className="rounded-xl border border-gray-200 z-0 relative"
    >
      <ChangeView center={[centerLat, centerLng]} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onLocationChange={onLocationChange} />
      <DraggableMarker latitude={latitude} longitude={longitude} onLocationChange={onLocationChange} />
    </MapContainer>
  );
}