"use client";

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// CDN Linkleri ile turbopack ikon hatasını engelleme
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  latitude?: number;
  longitude?: number;
}

export default function MapView({ latitude, longitude }: MapViewProps) {
  // Eğer ilan için koordinat girilmemişse haritayı hiç gösterme
  if (!latitude || !longitude) return null;

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      style={{ height: '350px', width: '100%' }}
      className="rounded-xl border border-gray-200 z-0 relative"
      scrollWheelZoom={false} // Kullanıcı sayfayı kaydırırken harita zoomlanmasın
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} />
    </MapContainer>
  );
}