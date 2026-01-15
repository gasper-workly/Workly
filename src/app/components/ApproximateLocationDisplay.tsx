'use client';

import dynamic from 'next/dynamic';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@/app/hooks/useTranslation';

function LoadingMapFallback() {
  const { t } = useTranslation();
  return (
    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
      <span className="text-gray-500 text-sm">{t('location.loadingMap')}</span>
    </div>
  );
}

// Dynamically import the map component to avoid SSR issues with Leaflet
const FuzzyLocationMap = dynamic(() => import('./FuzzyLocationMap'), {
  ssr: false,
  loading: () => <LoadingMapFallback />,
});

interface ApproximateLocationDisplayProps {
  latitude: number;
  longitude: number;
  areaName: string;
  showMap?: boolean;
  compact?: boolean;
}

export default function ApproximateLocationDisplay({
  latitude,
  longitude,
  areaName,
  showMap = true,
  compact = false,
}: ApproximateLocationDisplayProps) {
  const { t } = useTranslation();
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPinIcon className="h-4 w-4 text-violet-500" />
        <span>{areaName}</span>
        <span className="text-xs text-gray-400">{t('location.approxAreaSuffix')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <MapPinIcon className="h-5 w-5 text-violet-600" />
        <div>
          <p className="text-sm font-medium text-gray-900">{areaName}</p>
          <p className="text-xs text-gray-500">{t('location.approximateLabel')}</p>
        </div>
      </div>
      
      {showMap && (
        <FuzzyLocationMap
          latitude={latitude}
          longitude={longitude}
          areaName={areaName}
          height="160px"
        />
      )}
    </div>
  );
}

