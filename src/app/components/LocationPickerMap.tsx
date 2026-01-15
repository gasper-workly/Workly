'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerMapProps {
  selectedLocation: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function LocationPickerMap({
  selectedLocation,
  onLocationSelect,
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center (Ljubljana, Slovenia) - can be changed
    const defaultCenter: [number, number] = [46.0569, 14.5058];
    const initialCenter = selectedLocation
      ? [selectedLocation.lat, selectedLocation.lng] as [number, number]
      : defaultCenter;

    // Create map
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: true,
    });

    // Add tile layer (CartoDB Voyager - colorful style)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Handle click to select location
    map.on('click', (e: L.LeafletMouseEvent) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker and circle when location changes
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    // Remove existing marker and circle
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    if (selectedLocation) {
      // Calculate fuzzy coordinates
      const fuzzyLat = Math.round(selectedLocation.lat * 100) / 100;
      const fuzzyLng = Math.round(selectedLocation.lng * 100) / 100;

      // Add fuzzy circle (~1km radius)
      circleRef.current = L.circle([fuzzyLat, fuzzyLng], {
        radius: 1000, // 1km
        color: '#7c3aed',
        fillColor: '#7c3aed',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(mapRef.current);

      // Add marker at exact location (for user reference while selecting)
      const customIcon = L.divIcon({
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: #7c3aed;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
        `,
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: customIcon,
      }).addTo(mapRef.current);

      // Pan to selected location
      mapRef.current.setView([selectedLocation.lat, selectedLocation.lng], 14);
    }
  }, [selectedLocation, isMapReady]);

  return (
    <div
      ref={mapContainerRef}
      className="h-64 w-full"
      style={{ minHeight: '256px' }}
    />
  );
}

