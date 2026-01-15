'use client';

import { useEffect, useState } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);

interface ApproximateLocationProps {
  city: string;
  postalCode: string;
  distance?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  className?: string;
  showHeader?: boolean;
}

export default function ApproximateLocation({
  city,
  postalCode,
  distance,
  coordinates,
  className = '',
  showHeader = true,
}: ApproximateLocationProps) {
  const [isClient, setIsClient] = useState(false);
  const [canRenderMap, setCanRenderMap] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Ensure Leaflet CSS is loaded on the client without importing the CSS module
    if (typeof document !== 'undefined' && !document.querySelector('link[data-leaflet]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.setAttribute('data-leaflet', 'true');
      document.head.appendChild(link);
    }
    // Defer map render by a tick to ensure container is in the DOM
    const id = requestAnimationFrame(() => setCanRenderMap(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={`space-y-2 ${className}`}>
      {showHeader && (
        <div className="flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-violet-500 flex-shrink-0" />
          <div>
            <p className="text-sm text-black">Approximate location: {city}, {postalCode}</p>
          </div>
        </div>
      )}
      
      {coordinates && isClient && canRenderMap && (
        <div className="relative z-0 w-full max-w-[160px] sm:max-w-[180px] aspect-square rounded-lg overflow-hidden border border-violet-300 mx-auto sm:mx-0">
          <MapContainer
            center={[coordinates.lat, coordinates.lng]}
            zoom={12}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            zoomControl={false}
            attributionControl={false}
            style={{
              height: '100%',
              width: '100%',
              zIndex: 0,
              filter: 'none'
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <Circle
              center={[coordinates.lat, coordinates.lng]}
              radius={1000} // 1km radius
              pathOptions={{
                color: '#a78bfa',
                fillColor: '#a78bfa',
                fillOpacity: 0.25,
              }}
            />
          </MapContainer>
          {/* remove pastel overlay for higher contrast */}
        </div>
      )}
    </div>
  );
} 