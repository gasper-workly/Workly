'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPinIcon, MapIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues with Leaflet
const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Loading map...</span>
    </div>
  ),
});

export interface LocationData {
  // Fuzzy data (public - shown to providers)
  fuzzyLatitude: number;
  fuzzyLongitude: number;
  areaName: string; // e.g., "Ljubljana - Center"
  
  // Exact data (private - only shared in chat)
  exactLatitude: number;
  exactLongitude: number;
  exactAddress: string;
}

interface LocationPickerProps {
  value?: Partial<LocationData>;
  onChange: (location: LocationData) => void;
}

// Fuzz coordinates to ~1km radius (round to 2 decimal places)
function fuzzCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  return {
    lat: Math.round(lat * 100) / 100,
    lng: Math.round(lng * 100) / 100,
  };
}

// Reverse geocode to get area name
async function getAreaName(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lng}&zoom=14`);
    const data = await response.json();
    
    if (data.address) {
      const addr = data.address;
      const city = addr.city || addr.town || addr.village || addr.municipality || '';
      const district = addr.suburb || addr.neighbourhood || addr.district || '';
      
      if (city && district) {
        return `${city} - ${district}`;
      } else if (city) {
        return city;
      } else if (addr.county) {
        return addr.county;
      }
    }
    return 'Unknown area';
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Unknown area';
  }
}

// Get full address from coordinates
async function getFullAddress(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lng}&zoom=18`);
    const data = await response.json();
    return data.display_name || `${lat}, ${lng}`;
  } catch (error) {
    return `${lat}, ${lng}`;
  }
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [showMap, setShowMap] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(
    value?.exactLatitude && value?.exactLongitude
      ? { lat: value.exactLatitude, lng: value.exactLongitude }
      : null
  );
  const [areaName, setAreaName] = useState(value?.areaName || '');

  // Handle location selection from map
  const handleLocationSelect = useCallback(async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    
    // Get fuzzy coordinates
    const fuzzy = fuzzCoordinates(lat, lng);
    
    // Get area name and full address
    const [area, address] = await Promise.all([
      getAreaName(lat, lng),
      getFullAddress(lat, lng),
    ]);
    
    setAreaName(area);
    
    onChange({
      fuzzyLatitude: fuzzy.lat,
      fuzzyLongitude: fuzzy.lng,
      areaName: area,
      exactLatitude: lat,
      exactLongitude: lng,
      exactAddress: address,
    });
  }, [onChange]);

  // Use current location
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await handleLocationSelect(latitude, longitude);
        setIsLocating(false);
        setShowMap(true);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please select on the map.');
        setIsLocating(false);
        setShowMap(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-black">
        Location
      </label>
      
      {/* Location display and buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center px-4 py-2 border border-violet-300 rounded-md shadow-sm text-sm font-medium text-violet-600 bg-white hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50"
        >
          <MapPinIcon className="h-5 w-5 mr-2" />
          {isLocating ? 'Getting location...' : 'Use Current Location'}
        </button>
        
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
        >
          <MapIcon className="h-5 w-5 mr-2" />
          {showMap ? 'Hide Map' : 'Select on Map'}
        </button>
      </div>

      {/* Selected location display */}
      {areaName && (
        <div className="bg-violet-50 border border-violet-200 rounded-md p-3">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-violet-600" />
            <div>
              <p className="text-sm font-medium text-violet-900">{areaName}</p>
              <p className="text-xs text-violet-600">
                Approximate location shown to providers (~1km radius)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      {showMap && (
        <div className="rounded-lg overflow-hidden border border-gray-300">
          <LocationPickerMap
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
          />
          <p className="text-xs text-gray-500 p-2 bg-gray-50">
            Click on the map to select a location. Only the approximate area will be shown to providers.
          </p>
        </div>
      )}
    </div>
  );
}

