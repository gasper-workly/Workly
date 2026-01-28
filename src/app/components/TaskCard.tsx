'use client';

import { useEffect, useState } from 'react';
import { 
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  XMarkIcon,
  MapPinIcon,
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
import ApproximateLocation from './ApproximateLocation';
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

interface TaskCardProps {
  task: {
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
    price: number | null;
    isNegotiable?: boolean;
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
  };
  currentUserId: string;
  currentUserRole: 'client' | 'provider';
  hideUserInfo?: boolean;
  onChatClick?: () => void;
  chatButtonLabel?: string;
  onEdit?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  onReport?: () => void;
  initiallyHideDescription?: boolean;
}

export default function TaskCard({
  task,
  currentUserId,
  currentUserRole,
  hideUserInfo,
  onChatClick,
  chatButtonLabel,
  onEdit,
  onCancel,
  onComplete,
  onReport,
  initiallyHideDescription,
}: TaskCardProps) {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // iOS Safari/WebView often scrolls the page behind fixed overlays unless we lock body scroll.
  useEffect(() => {
    if (!isModalOpen) return;
    if (typeof document === 'undefined') return;

    document.documentElement.classList.add('modal-open');

    const body = document.body;
    const html = document.documentElement;

    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;
    const prevHtmlOverflow = html.style.overflow;

    const scrollY = window.scrollY || 0;

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    html.style.overflow = 'hidden';

    return () => {
      document.documentElement.classList.remove('modal-open');

      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      html.style.overflow = prevHtmlOverflow;

      window.scrollTo(0, scrollY);
    };
  }, [isModalOpen]);

  const {
    id,
    title,
    description,
    category,
    location,
    city = 'Ljubljana',
    postalCode = '1000',
    coordinates,
    date,
    price,
    isNegotiable,
    status = 'open',
    clientName,
    clientId,
    clientCompletedRequests,
    providerName,
    providerId,
    providerCompletedRequests,
    distance,
    postedAt,
    imageUrl,
    images,
  } = task;

  // Determine if the current user can perform various actions
  const canEdit = currentUserRole === 'client' && status === 'open';
  const canCancel = currentUserRole === 'client' && status === 'open';
  const canComplete = currentUserRole === 'client' && status === 'open';
  const canReport = status === 'completed';

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatPriceEur = (amount: number | null | undefined, negotiable?: boolean) => {
    if (negotiable) return t('form.request.negotiableLabel');
    if (amount === null || amount === undefined) return t('task.priceTbd');
    return `${Math.round(amount)} €`;
  };

  // Map raw category/title to grouped label (e.g., snow -> Outdoor & Garden Work)
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

  // Get the icon component for a category
  const getCategoryIcon = (categoryLabel: string) => {
    return CATEGORY_ICONS[categoryLabel] || ListBulletIcon;
  };

  const categoryLabel = getCategoryGroupLabel(category, title);
  const CategoryIcon = getCategoryIcon(categoryLabel);
  const translatedCategoryLabel = t(CATEGORY_LABEL_TO_KEY[categoryLabel] || 'common.other');

  // Get status display class
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className={`flex items-start justify-between ${currentUserRole === 'provider' ? '' : ''}`}>
            <div className="w-full min-w-0">
              <div className={`flex items-center ${'justify-between gap-3'}`}>
                <h3 className={`text-lg font-medium text-black ${currentUserRole === 'provider' ? 'whitespace-nowrap' : 'truncate'}`}>{title}</h3>
                <p className="shrink-0 text-lg font-semibold text-violet-600 whitespace-nowrap">{formatPriceEur(price, isNegotiable)}</p>
              </div>
              {/* Provider compact meta row (only provider name) */}
              <div className="mt-1 text-sm text-gray-600">
                {currentUserRole === 'provider' ? (
                  <span>{t('common.client')}: {clientName || t('common.client')}</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <CategoryIcon className="h-4 w-4 text-violet-600 flex-shrink-0" />
                    <span className="truncate">{translatedCategoryLabel}</span>
                  </span>
                )}
              </div>
              {/* Client: view description button */}
              {currentUserRole !== 'provider' && (
                <button
                  type="button"
                  onClick={() => setIsDescriptionVisible((v) => !v)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full hover:bg-violet-100"
                >
                  <EyeIcon className="h-4 w-4" />
                  {isDescriptionVisible ? t('task.hideDescription') : t('task.viewDescription')}
                </button>
              )}
            </div>
          </div>

          {/* Client: description expands below when button is used */}
          {currentUserRole !== 'provider' && isDescriptionVisible && (
            <p className="mt-3 text-sm text-black">
              {description}
            </p>
          )}

          {/* Provider compact: hide location map block; show View more */}
          {currentUserRole === 'provider' && (
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  // Count views when providers open the detailed view
                  if (typeof window !== 'undefined' && id) {
                    const key = `task_views_${id}`;
                    const current = Number(window.localStorage.getItem(key) || '0');
                    window.localStorage.setItem(key, String(current + 1));
                  }
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:text-violet-800"
              >
                {t('task.viewMore')} <span aria-hidden>→</span>
              </button>
            </div>
          )}

          {/* Description below location for provider (if ever needed) */}
          {currentUserRole === 'provider' && isDescriptionVisible && (
            <p className="mt-2 text-sm text-black">
              {description}
            </p>
          )}

          {/* User Info (optional) */}
          {!hideUserInfo && (
            <div className="mt-4 flex items-center gap-4">
              <UserAvatar
                name={currentUserRole === 'client' ? (providerName || '') : (clientName || '')}
                role={currentUserRole === 'client' ? 'provider' : 'client'}
                completedRequests={
                  currentUserRole === 'client'
                    ? providerCompletedRequests || 0
                    : clientCompletedRequests || 0
                }
                size="sm"
              />
              <div>
                <p className="text-sm font-medium text-black">
                  {currentUserRole === 'client' ? providerName : clientName}
                </p>
                <p className="text-xs text-gray-500">
                  Posted {formatDate(postedAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentUserRole !== 'provider' && (
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                status === 'open' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-gray-50 text-gray-600 border-gray-200'
              }`}
            >
              {status.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </span>
          )}
          {(currentUserRole !== 'provider') && (canEdit || canCancel || canComplete || canReport) && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <EllipsisHorizontalIcon className="h-5 w-5" />
              </button>
              {showActions && (
                <div className="absolute left-0 mt-1 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu">
                    {canEdit && onEdit && (
                      <button
                        onClick={() => {
                          onEdit();
                          setShowActions(false);
                        }}
                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
                      >
                        Edit Request
                      </button>
                    )}
                    {canCancel && onCancel && (
                      <button
                        onClick={() => {
                          onCancel();
                          setShowActions(false);
                        }}
                        className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                      >
                        Cancel Request
                      </button>
                    )}
                    {canComplete && onComplete && (
                      <button
                        onClick={() => {
                          onComplete();
                          setShowActions(false);
                        }}
                        className="block w-full px-4 py-2 text-sm text-left text-green-600 hover:bg-green-50"
                      >
                        Mark as Completed
                      </button>
                    )}
                    {canReport && onReport && (
                      <button
                        onClick={() => {
                          onReport();
                          setShowActions(false);
                        }}
                        className="block w-full px-4 py-2 text-sm text-left text-orange-600 hover:bg-orange-50"
                      >
                        Report Issue
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {onChatClick && currentUserRole !== 'provider' && (
          <button
            onClick={onChatClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full text-white bg-violet-600 hover:bg-violet-700 transition-colors"
          >
            <ChatBubbleLeftIcon className="h-4 w-4" />
            {chatButtonLabel || 'View chats'}
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>

      {/* Modal overlay for provider */}
      {currentUserRole === 'provider' && isModalOpen && (
        <div className="fixed inset-0 z-[10050] overscroll-contain">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-100 transition-opacity duration-200"
            onClick={() => setIsModalOpen(false)}
            onTouchMove={(e) => e.preventDefault()}
          />
          <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
            <div
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-md sm:max-w-2xl my-6 sm:my-10 bg-white rounded-2xl shadow-xl transform transition-transform duration-200 ease-out scale-100"
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
              <div className="p-4 sm:p-6 pb-6 h-[85vh] overflow-y-auto ios-scroll overscroll-contain">
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-violet-600 font-semibold text-lg">{formatPriceEur(price, isNegotiable)}</p>
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                    <CategoryIcon className="h-4 w-4 text-violet-600" />
                    {categoryLabel}
                  </span>
                </div>
                <p className="mt-4 text-gray-700">{description}</p>

                {/* Photo below description */}
                <div className="mt-5">
                  <div className="text-sm font-medium text-gray-700 mb-2">{t('jobDetail.photos')}</div>
                  {Array.isArray(images) && images.length > 0 ? (
                    <div className="w-full rounded-xl overflow-hidden bg-gray-50">
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
                        <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                          {t('jobDetail.noPhotos')}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Chat + Client profile */}
                <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={clientName || ''}
                      role={'client'}
                      completedRequests={clientCompletedRequests || 0}
                      size="sm"
                      showInfo
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{clientName}</p>
                      {typeof clientCompletedRequests === 'number' && (
                        <p className="text-xs text-gray-500">Completed requests: {clientCompletedRequests}</p>
                      )}
                    </div>
                  </div>
                  {onChatClick && (
                    <button
                      onClick={onChatClick}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full text-white bg-violet-600 hover:bg-violet-700 transition-colors w-full sm:w-auto"
                    >
                      <ChatBubbleLeftIcon className="h-4 w-4" />
                      {chatButtonLabel || 'Contact Client'}
                    </button>
                  )}
                </div>

                {/* Location + Map at bottom */}
                <div className="mt-6">
                  {coordinates?.lat != null && coordinates?.lng != null ? (
                    <ApproximateLocationDisplay
                      latitude={coordinates.lat}
                      longitude={coordinates.lng}
                      areaName={location || `${city || ''} ${postalCode || ''}`.trim() || 'Approximate area'}
                      showMap
                    />
                  ) : (
                    <div className="text-sm text-gray-500">Approximate location not available.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for full-size photo */}
      {currentUserRole === 'provider' && isModalOpen && lightboxSrc && (
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