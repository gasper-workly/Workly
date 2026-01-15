'use client';

import { useState } from 'react';
import { 
  MapPinIcon, 
  ChatBubbleLeftIcon, 
  XMarkIcon,
  WrenchScrewdriverIcon,
  HomeModernIcon,
  TruckIcon,
  SparklesIcon,
  BuildingOffice2Icon,
  CpuChipIcon,
  Cog6ToothIcon,
  UserIcon,
  SunIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import UserAvatar from './UserAvatar';
import ApproximateLocationDisplay from './ApproximateLocationDisplay';
import { useTranslation } from '@/app/hooks/useTranslation';
import type { TranslationKey } from '@/app/lib/translations';

// Category icon mapping
const CATEGORY_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'Home Maintenance & Repair': WrenchScrewdriverIcon,
  'Outdoor & Garden Work': HomeModernIcon,
  'Moving & Transport': TruckIcon,
  'Cleaning & Maintenance': SparklesIcon,
  'Construction & Renovation': BuildingOffice2Icon,
  'Technical & Installation': CpuChipIcon,
  'Vehicle Services': Cog6ToothIcon,
  'Personal Assistance': UserIcon,
  'Seasonal & Miscellaneous': SunIcon,
  'Other': ListBulletIcon,
};

export interface TaskDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  city?: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  date: string;
  price: number;
  status?: string;
  clientName?: string;
  clientId?: string;
  clientCompletedRequests?: number;
  providerName?: string;
  providerId?: string;
  providerCompletedRequests?: number;
  distance?: string;
  postedAt: string;
  imageUrl?: string;
  images?: string[];
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskDetail;
  currentUserRole: 'client' | 'provider';
  onChatClick?: () => void;
  chatButtonLabel?: string;
}

const formatPriceEur = (amount: number | undefined) => `${(amount ?? 0).toFixed(2)}€`;

const getCategoryIcon = (categoryLabel: string) => {
  return CATEGORY_ICONS[categoryLabel] || ListBulletIcon;
};

const getCategoryGroupLabel = (rawCategory: string, rawTitle: string): string => {
  const cat = (rawCategory || '').toLowerCase();
  const titleLc = (rawTitle || '').toLowerCase();
  if (cat.includes('snow') || titleLc.includes('snow')) return 'Outdoor & Garden Work';
  if (cat.includes('lawn') || cat.includes('garden') || cat.includes('yard')) return 'Outdoor & Garden Work';
  if (cat.includes('move') || titleLc.includes('move') || cat.includes('transport')) return 'Moving & Transport';
  if (cat.includes('clean')) return 'Cleaning & Maintenance';
  if (cat.includes('construct') || cat.includes('renov')) return 'Construction & Renovation';
  if (cat.includes('install') || cat.includes('tech')) return 'Technical & Installation';
  if (cat.includes('vehicle') || cat.includes('car') || cat.includes('auto')) return 'Vehicle Services';
  if (cat.includes('assist') || cat.includes('personal') || titleLc.includes('assistant')) return 'Personal Assistance';
  if (cat.includes('season') || titleLc.includes('seasonal')) return 'Seasonal & Miscellaneous';
  if (cat.includes('repair') || cat.includes('maint')) return 'Home Maintenance & Repair';
  return rawCategory || 'Home Maintenance & Repair';
};

const CATEGORY_LABEL_TO_KEY: Record<string, TranslationKey> = {
  'Home Maintenance & Repair': 'category.homeMaintenance',
  'Outdoor & Garden Work': 'category.outdoorGarden',
  'Moving & Transport': 'category.movingTransport',
  'Cleaning & Maintenance': 'category.cleaningMaintenance',
  'Construction & Renovation': 'category.constructionRenovation',
  'Technical & Installation': 'category.technicalInstallation',
  'Vehicle Services': 'category.vehicleServices',
  'Personal Assistance': 'category.personalAssistance',
  'Seasonal & Miscellaneous': 'category.seasonalMisc',
  'Other': 'common.other',
};

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  currentUserRole,
  onChatClick,
  chatButtonLabel,
}: TaskDetailModalProps) {
  if (!isOpen) {
    return null;
  }

  const { t } = useTranslation();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const {
    title,
    price,
    category,
    description,
    imageUrl,
    images,
    clientName,
    clientCompletedRequests,
    providerName,
    providerCompletedRequests,
    location,
    city = 'Ljubljana',
    postalCode = '1000',
    coordinates,
  } = task;

  const counterpartName = currentUserRole === 'provider' ? clientName : providerName;
  const counterpartCompleted = currentUserRole === 'provider' ? clientCompletedRequests : providerCompletedRequests;
  const counterpartRole = currentUserRole === 'provider' ? 'client' : 'provider';

  const locationLabel = location || `${city} ${postalCode}`.trim();
  const categoryLabel = getCategoryGroupLabel(category, title);
  const translatedCategoryLabel = t(CATEGORY_LABEL_TO_KEY[categoryLabel] || 'common.other');

  return (
    <div className="fixed inset-0 z-[10050]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-100 transition-opacity duration-200"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-md sm:max-w-2xl my-6 sm:my-10 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
          <div className="p-4 sm:p-5 pb-6 max-h-[85vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-black">{title}</h3>
            <p className="mt-1 text-violet-700 font-semibold">{formatPriceEur(price)}</p>
            <div className="mt-2 text-sm text-black">
              {(() => {
                const CategoryIcon = getCategoryIcon(categoryLabel);
                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">
                    <CategoryIcon className="h-4 w-4" />
                    {translatedCategoryLabel}
                  </span>
                );
              })()}
            </div>
            <p className="mt-3 text-black whitespace-pre-line">{description}</p>

            <div className="mt-4">
              <div className="text-sm font-medium text-black mb-1">{t('jobDetail.photos')}</div>
              {Array.isArray(images) && images.length > 0 ? (
                <div className="w-full rounded-xl bg-gray-50 overflow-hidden">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {images.slice(0, 6).map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setLightboxSrc(src)}
                        className="aspect-video bg-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        aria-label={t('jobDetail.openPhoto')}
                      >
                        <img src={src} alt="Service photo" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                  {imageUrl ? (
                    <button
                      type="button"
                      onClick={() => setLightboxSrc(imageUrl)}
                      className="w-full h-full focus:outline-none focus:ring-2 focus:ring-violet-500"
                      aria-label={t('jobDetail.openPhoto')}
                    >
                      <img src={imageUrl} alt="Service photo" className="w-full h-full object-cover" />
                    </button>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      {t('jobDetail.noPhotos')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {(counterpartName || typeof counterpartCompleted === 'number') && (
              <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={counterpartName || ''}
                    role={counterpartRole}
                    completedRequests={counterpartCompleted || 0}
                    size="sm"
                    showInfo
                  />
                  <div>
                    <p className="text-sm font-medium text-black">{counterpartName || 'Client'}</p>
                    {typeof counterpartCompleted === 'number' && (
                      <p className="text-xs text-gray-500">
                        {t('jobDetail.completedRequestsLabel')}: {counterpartCompleted}
                      </p>
                    )}
                  </div>
                </div>
                {onChatClick && (
                  <button
                    onClick={onChatClick}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 w-full sm:w-auto"
                  >
                    <ChatBubbleLeftIcon className="h-5 w-5 mr-1.5" />
                    {chatButtonLabel || t('jobDetail.chatNow')}
                  </button>
                )}
              </div>
            )}

            <div className="mt-5">
              {coordinates?.lat != null && coordinates?.lng != null ? (
                <ApproximateLocationDisplay
                  latitude={coordinates.lat}
                  longitude={coordinates.lng}
                  areaName={locationLabel || t('jobDetail.locationApproxArea')}
                  showMap
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPinIcon className="h-5 w-5 text-violet-600" />
                  <span>{locationLabel || t('jobDetail.locationApproxNotAvailable')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox for full-size photo */}
      {lightboxSrc && (
        <div className="fixed inset-0 z-[10060]">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setLightboxSrc(null)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative max-w-5xl w-full max-h-[85vh]">
              <button
                type="button"
                aria-label={t('jobDetail.closePhoto')}
                onClick={() => setLightboxSrc(null)}
                className="absolute -top-10 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <img
                src={lightboxSrc}
                alt="Full size photo"
                className="w-full h-full max-h-[85vh] object-contain rounded-xl bg-black"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
