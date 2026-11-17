import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MiniMapaLojaProps {
  latitude: number;
  longitude: number;
  nomeLoja: string;
  distanciaKm?: number | null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default function MiniMapaLoja({
  latitude,
  longitude,
  nomeLoja,
  distanciaKm,
}: MiniMapaLojaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false,
      preferCanvas: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const icon = L.divIcon({
      className: 'mini-map-pin-wrap',
      html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#006375;border:3px solid #ffffff;transform:rotate(-45deg);box-shadow:0 3px 8px rgba(15,23,42,0.35);"></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    });

    const marker = L.marker([latitude, longitude], { icon }).addTo(map);
    const labelDist =
      distanciaKm != null ? `<br/><small>A ${distanciaKm.toFixed(1)} km de você</small>` : '';
    marker.bindPopup(`<strong>${escapeHtml(nomeLoja)}</strong>${labelDist}`);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, nomeLoja, distanciaKm]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 170, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 14 }}>
      <div
        ref={containerRef}
        aria-label={`Mapa interativo com a localização de ${nomeLoja}`}
        style={{ width: '100%', height: '100%' }}
      />
      {distanciaKm != null && (
        <span
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            zIndex: 500,
            background: '#ffffff',
            padding: '3px 10px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#0f172a',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)',
            pointerEvents: 'none',
          }}
        >
          A {distanciaKm.toFixed(1)} km de você
        </span>
      )}
    </div>
  );
}
