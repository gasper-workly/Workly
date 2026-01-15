'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import {
  WrenchScrewdriverIcon,
  HomeModernIcon,
  TruckIcon,
  SparklesIcon,
  BuildingOffice2Icon,
  CpuChipIcon,
  Cog6ToothIcon,
  UserIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import LocationPicker, { LocationData } from './LocationPicker';
import { useTranslation } from '@/app/hooks/useTranslation';

interface ServiceRequestFormProps {
  onSubmit: (data: ServiceRequestData) => void;
  isSubmitting?: boolean;
  initialData?: Partial<ServiceRequestData>;
  submitButtonText?: string;
}

export interface ServiceRequestData {
  title: string;
  category:
    | 'Home Maintenance & Repair'
    | 'Outdoor & Garden Work'
    | 'Moving & Transport'
    | 'Cleaning & Maintenance'
    | 'Construction & Renovation'
    | 'Technical & Installation'
    | 'Vehicle Services'
    | 'Personal Assistance'
    | 'Seasonal & Miscellaneous'
    | 'Other';
  description: string;
  // Location data
  location: string; // Area name (public)
  latitude?: number; // Fuzzy latitude (public)
  longitude?: number; // Fuzzy longitude (public)
  exactLatitude?: number; // Exact latitude (private)
  exactLongitude?: number; // Exact longitude (private)
  exactAddress?: string; // Exact address (private)
  // Price
  price: number | null;
  isNegotiable: boolean;
  images?: File[];
}

const CATEGORY_OPTIONS: { label: ServiceRequestData['category']; icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element }[] = [
  { label: 'Home Maintenance & Repair', icon: WrenchScrewdriverIcon },
  { label: 'Outdoor & Garden Work', icon: HomeModernIcon },
  { label: 'Moving & Transport', icon: TruckIcon },
  { label: 'Cleaning & Maintenance', icon: SparklesIcon },
  { label: 'Construction & Renovation', icon: BuildingOffice2Icon },
  { label: 'Technical & Installation', icon: CpuChipIcon },
  { label: 'Vehicle Services', icon: Cog6ToothIcon },
  { label: 'Personal Assistance', icon: UserIcon },
  { label: 'Seasonal & Miscellaneous', icon: SunIcon },
  { label: 'Other', icon: SparklesIcon },
];

const CATEGORY_TO_KEY: Record<ServiceRequestData['category'], any> = {
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

export default function ServiceRequestForm({ 
  onSubmit, 
  isSubmitting = false, 
  initialData,
  submitButtonText
}: ServiceRequestFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ServiceRequestData>({
    title: initialData?.title || '',
    category: initialData?.category || 'Home Maintenance & Repair',
    description: initialData?.description || '',
    location: initialData?.location || '',
    latitude: initialData?.latitude,
    longitude: initialData?.longitude,
    exactLatitude: initialData?.exactLatitude,
    exactLongitude: initialData?.exactLongitude,
    exactAddress: initialData?.exactAddress,
    price: initialData?.price ?? 0,
    isNegotiable: initialData?.isNegotiable ?? false,
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    // Cleanup preview URLs when component unmounts / previews change
    return () => {
      for (const url of imagePreviews) {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      }
    };
  }, [imagePreviews]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Allow multiple picks; cap at 5 images total to keep it lightweight
    setFormData((prev) => {
      const existing = prev.images || [];
      const combined = [...existing, ...files].slice(0, 5);
      return { ...prev, images: combined };
    });

    setImagePreviews((prev) => {
      const newPreviews = files.map((f) => URL.createObjectURL(f));
      return [...prev, ...newPreviews].slice(0, 5);
    });

    // Allow re-selecting the same file
    e.target.value = '';
  };

  const removeImageAt = (idx: number) => {
    setFormData((prev) => {
      const arr = [...(prev.images || [])];
      arr.splice(idx, 1);
      return { ...prev, images: arr };
    });

    setImagePreviews((prev) => {
      const arr = [...prev];
      const removed = arr[idx];
      if (removed?.startsWith('blob:')) URL.revokeObjectURL(removed);
      arr.splice(idx, 1);
      return arr;
    });
  };

  const handleLocationChange = (locationData: LocationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData.areaName,
      latitude: locationData.fuzzyLatitude,
      longitude: locationData.fuzzyLongitude,
      exactLatitude: locationData.exactLatitude,
      exactLongitude: locationData.exactLongitude,
      exactAddress: locationData.exactAddress,
    }));
    setLocationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate location is selected
    if (!formData.latitude || !formData.longitude) {
      setLocationError(t('form.request.locationError'));
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-black">
          {t('form.request.titleLabel')}
        </label>
        <input
          type="text"
          id="title"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={t('form.request.titlePlaceholder')}
        />
      </div>

      {/* Category (dropdown style with icons) */}
      <div className="relative">
        <label className="block text-sm font-medium text-black">
          {t('form.request.categoryLabel')}
        </label>
        <button
          type="button"
          onClick={() => setIsCategoryOpen(v => !v)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-left text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 flex items-center justify-between"
          aria-haspopup="listbox"
          aria-expanded={isCategoryOpen}
        >
          <span className="inline-flex items-center gap-2">
            {(() => {
              const found = CATEGORY_OPTIONS.find(o => o.label === formData.category);
              const Icon = found ? found.icon : SparklesIcon;
              return <Icon className="h-5 w-5 text-violet-600" />;
            })()}
            <span className="truncate">{t(CATEGORY_TO_KEY[formData.category])}</span>
          </span>
          <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
          </svg>
        </button>
        {isCategoryOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-violet-200 bg-white shadow-md max-h-64 overflow-auto">
            {CATEGORY_OPTIONS.map(({ label, icon: Icon }) => {
              const isSelected = formData.category === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, category: label });
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-black hover:bg-violet-50 ${isSelected ? 'bg-violet-50' : ''}`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <Icon className="h-5 w-5 text-violet-600" />
                  <span className="truncate">{t(CATEGORY_TO_KEY[label])}</span>
                </button>
              );
            })}
          </div>
        )}
        <input type="hidden" name="category" value={formData.category} />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-black">
          {t('form.request.descriptionLabel')}
        </label>
        <textarea
          id="description"
          required
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={t('form.request.descriptionPlaceholder')}
        />
      </div>

      {/* Location Picker */}
      <div>
        <LocationPicker
          value={{
            fuzzyLatitude: formData.latitude,
            fuzzyLongitude: formData.longitude,
            areaName: formData.location,
            exactLatitude: formData.exactLatitude,
            exactLongitude: formData.exactLongitude,
            exactAddress: formData.exactAddress,
          }}
          onChange={handleLocationChange}
        />
        {locationError && (
          <p className="mt-1 text-sm text-red-600">{locationError}</p>
        )}
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-black mb-2">
          {t('form.request.priceLabel')} (€)
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="number"
              id="price"
              required={!formData.isNegotiable}
              min="0"
              step="0.01"
              disabled={formData.isNegotiable}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder={formData.isNegotiable ? t('form.request.negotiableLabel') : ''}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="negotiable"
              checked={formData.isNegotiable}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  isNegotiable: e.target.checked,
                  price: e.target.checked ? null : (formData.price || 0),
                });
              }}
              className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            <label htmlFor="negotiable" className="ml-2 text-sm font-medium text-black cursor-pointer">
              {t('form.request.negotiableLabel')}
            </label>
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-black">
          {t('form.request.photosLabel')} (optional)
        </label>
        <div className="mt-1 flex items-center space-x-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 border border-violet-300 rounded-md shadow-sm text-sm font-medium text-violet-600 bg-white hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
          >
            {t('form.request.photosAdd')}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImagesChange}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>
        {imagePreviews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
            {imagePreviews.map((src, idx) => (
              <div key={src} className="relative aspect-square rounded-lg overflow-hidden border border-violet-200">
                <Image src={src} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImageAt(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full hover:bg-red-600"
                  aria-label={t('form.request.photosRemove')}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t('common.loading') : (submitButtonText || t('form.request.submitCreate'))}
      </button>
    </form>
  );
} 
