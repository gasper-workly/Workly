'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface FuzzyLocationMapProps {
  latitude: number;
  longitude: number;
  areaName?: string;
  height?: string;
  interactive?: boolean;
}

export default function FuzzyLocationMap({
  latitude,
  longitude,
  areaName,
  height = '200px',
  interactive = false,
}: FuzzyLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 13,
      zoomControl: interactive,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
    });

    // Add tile layer (CartoDB Voyager - colorful style)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Add fuzzy circle (~1km radius)
    L.circle([latitude, longitude], {
      radius: 1000, // 1km
      color: '#7c3aed',
      fillColor: '#7c3aed',
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(map);

    // Add area name label if provided
    if (areaName) {
      const label = L.divIcon({
        html: `
          <div style="
            background: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            color: #7c3aed;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            white-space: nowrap;
          ">${areaName}</div>
        `,
        className: 'area-label',
        iconSize: [100, 20],
        iconAnchor: [50, -10],
      });

      L.marker([latitude, longitude], { icon: label }).addTo(map);
    }

    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, areaName, interactive]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full rounded-lg overflow-hidden"
      style={{ height, minHeight: height }}
    />
  );
}

