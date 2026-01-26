'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/app/components/DashboardLayout';
import UserAvatar from '@/app/components/UserAvatar';
import { useAuth } from '@/app/hooks/useAuth';
import { getProviderReviews, getProviderStats, ReviewWithDetails } from '@/app/lib/reviews';
import { getProviderTotalEarningsEur } from '@/app/lib/orders';
import { logout, updateProfile } from '@/app/lib/auth';
import { uploadAvatarAndGetPublicUrl } from '@/app/lib/avatars';
import { clearCachedProfile } from '@/app/lib/authProfileCache';
import { 
  BanknotesIcon,
  CheckCircleIcon,
  StarIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  CheckIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useTranslation } from '@/app/hooks/useTranslation';
import type { TranslationKey } from '@/app/lib/translations';

type SortMode = 'newest' | 'highest' | 'lowest';

function ProviderProfilePageContent() {
  const searchParams = useSearchParams();
  const startEditing = searchParams.get('edit') === '1';
  const { user, loading: authLoading, refresh: refreshAuth } = useAuth();
  const { t, language } = useTranslation();
  const [isEditing, setIsEditing] = useState(startEditing);
  const [newImage, setNewImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [avgRating, setAvgRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const router = useRouter();

  const handleLogout = async () => {
    if (!user) return;
    const ok = confirm('Log out?');
    if (!ok) return;
    try {
      await logout();
    } finally {
      await clearCachedProfile(user.id);
      router.replace('/login?role=provider');
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?role=provider');
    }
  }, [authLoading, user, router]);
  const [showSpecialtiesDropdown, setShowSpecialtiesDropdown] = useState(false);
  // Local state for editable fields
  const [editableData, setEditableData] = useState({
    name: '',
    bio: '',
    phone: '',
    specialties: [] as string[],
    imageUrl: '',
  });

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      
      try {
        // Initialize editable data from user
        setEditableData({
          name: user.name,
          bio: user.bio || '',
          phone: user.phone || '',
          specialties: user.specialties || [],
          imageUrl: user.avatar_url || '',
        });
        
        // Fetch reviews
        const providerReviews = await getProviderReviews(user.id);
        setReviews(providerReviews);
        
        // Fetch stats for average rating
        const stats = await getProviderStats(user.id);
        setAvgRating(stats.averageRating);

        // Fetch earnings from completed orders
        const earnings = await getProviderTotalEarningsEur(user.id);
        setTotalEarnings(Math.round(earnings * 100) / 100);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
        }
    };
    
    if (user) {
    load();
    }
  }, [user]);

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortMode === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortMode === 'highest') return (b.rating || 0) - (a.rating || 0);
    return (a.rating || 0) - (b.rating || 0);
  });

  const tVars = (key: TranslationKey, vars: Record<string, string | number>) => {
    let s = t(key);
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
    return s;
  };

  const CATEGORY_LABEL_TO_KEY: Partial<Record<string, TranslationKey>> = {
    'Home Maintenance & Repair': 'category.homeMaintenance',
    'Outdoor & Garden Work': 'category.outdoorGarden',
    'Moving & Transport': 'category.movingTransport',
    'Cleaning & Maintenance': 'category.cleaningMaintenance',
    'Construction & Renovation': 'category.constructionRenovation',
    'Technical & Installation': 'category.technicalInstallation',
    'Vehicle Services': 'category.vehicleServices',
    'Personal Assistance': 'category.personalAssistance',
    'Seasonal & Miscellaneous': 'category.seasonalMisc',
    Other: 'common.other',
  };

  // Level/Progress helpers
  const getLevelInfo = (completed: number) => {
    if (completed >= 30) {
      return {
        level: 4,
        labelKey: 'providerProfilePage.level.expert' as const,
        base: 30,
        next: null as number | null,
        remaining: 0,
        progress: 1,
      };
    }
    if (completed >= 15) {
      const base = 15;
      const next = 30;
      return {
        level: 3,
        labelKey: 'providerProfilePage.level.trusted' as const,
        base,
        next,
        remaining: Math.max(0, next - completed),
        progress: Math.min(1, (completed - base) / (next - base)),
      };
    }
    if (completed >= 5) {
      const base = 5;
      const next = 15;
      return {
        level: 2,
        labelKey: 'providerProfilePage.level.verified' as const,
        base,
        next,
        remaining: Math.max(0, next - completed),
        progress: Math.min(1, (completed - base) / (next - base)),
      };
    }
    const base = 0;
    const next = 5;
    return {
      level: 1,
      labelKey: 'providerProfilePage.level.new' as const,
      base,
      next,
      remaining: Math.max(0, next - completed),
      progress: Math.min(1, (completed - base) / (next - base)),
    };
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <DashboardLayout userRole="provider" userName={t('common.loadingUser')}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  const levelInfo = getLevelInfo(user.completed_requests || 0);
  const ringSize = 96;
  const ringStroke = 8;
  const radius = (ringSize - ringStroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * levelInfo.progress;
  const gap = circumference - dash;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      // In a real app, you would upload the image to storage here
      // For now, we'll just create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setEditableData(prev => ({ ...prev, imageUrl: previewUrl }));
    }
  };

  const handleSave = async () => {
    try {
      if (!user) return;

      // Build updates object - only include avatar_url if we have a new image
      const updates: { name: string; phone?: string; bio?: string; avatar_url?: string; specialties?: string[] } = {
        name: editableData.name,
      };
      
      if (editableData.phone) updates.phone = editableData.phone;
      if (editableData.bio) updates.bio = editableData.bio;
      updates.specialties = editableData.specialties;

      // Upload new avatar if selected
      if (newImage) {
        try {
          const avatarUrl = await uploadAvatarAndGetPublicUrl({ userId: user.id, file: newImage });
          updates.avatar_url = avatarUrl;
        } catch (uploadError: unknown) {
          const message = uploadError instanceof Error ? uploadError.message : t('common.unknown');
          console.error('Avatar upload failed:', uploadError);
          alert(tVars('providerProfilePage.alerts.avatarUploadFailed', { message }));
          return;
        }
      }

      await updateProfile(updates);
      await refreshAuth();

      setNewImage(null);
      setIsEditing(false);
      // Remove edit flag from URL
      router.replace('/dashboard/provider/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(t('providerProfilePage.alerts.saveFailed'));
    }
  };

  return (
    <DashboardLayout userRole="provider" userName={user.name}>
      <div 
        className="space-y-6 -mx-3 sm:-mx-4 lg:-mx-6 -my-4 -mb-28 px-3 sm:px-4 lg:px-6 pt-4 pb-32 relative min-h-screen bg-gray-50"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-black">{t('providerProfilePage.title')}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 border border-red-200"
            >
              Log out
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                className="inline-flex items-center px-3 py-1.5 rounded-md bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700"
              >
                {t('providerProfilePage.actions.done')}
              </button>
            )}
            <button
              onClick={() => router.push('/dashboard/provider/settings')}
              className="inline-flex items-center justify-center p-2 border border-gray-200 rounded-full shadow-sm text-violet-600 bg-white hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              aria-label={t('providerProfilePage.actions.openSettings')}
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden">
          {/* Top strip with avatar and quick info (copied from client profile) */}
          <div className="bg-violet-50/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-300">
            <div className="flex items-center gap-4">
              <div className="group relative">
                <UserAvatar
                  imageUrl={editableData.imageUrl || user.avatar_url}
                  name={user.name}
                  role="provider"
                  completedRequests={user.completed_requests || 0}
                  size="lg"
                  showInfo
                />
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {t('providerProfilePage.actions.changePhoto')}
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-base font-semibold text-black">{user.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {tVars('providerProfilePage.topline', { count: user.completed_requests || 0 })}
                </p>
              </div>
            </div>
            <div className="text-sm text-right text-gray-600">
              <p className="font-medium text-black">{t('providerProfilePage.profileLabel')}</p>
              <p className="mt-0.5">
                {t('providerProfilePage.memberSince')}{' '}
                {new Date(user.created_at).toLocaleDateString(language === 'sl' ? 'sl-SI' : 'en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Details grid */}
          <div className="px-6 py-5 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold text-violet-700 bg-violet-50">
                  {t('providerProfilePage.sections.details')}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-black">{t('providerProfilePage.fields.fullName')}</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editableData.name}
                    onChange={(e) => setEditableData((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                ) : (
                  <p className="mt-1 text-black">{user.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-black">{t('providerProfilePage.fields.email')}</label>
                <p className="mt-1 text-black">{user.email}</p>
              </div>
              {(isEditing || editableData.phone) && (
                <div>
                  <label className="block text-sm font-medium text-black">{t('providerProfilePage.fields.telephoneOptional')}</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editableData.phone}
                      onChange={(e) => setEditableData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      placeholder={t('providerProfilePage.fields.telephonePlaceholder')}
                    />
                  ) : (
                    <p className="mt-1 text-black">
                      {editableData.phone || user.phone || t('providerProfilePage.fields.notProvided')}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold text-violet-700 bg-violet-50">
                  {t('providerProfilePage.sections.about')}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-black">{t('providerProfilePage.fields.bio')}</label>
                {isEditing ? (
                  <textarea
                    value={editableData.bio}
                    onChange={(e) => setEditableData((prev) => ({ ...prev, bio: e.target.value }))}
                    maxLength={200}
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    placeholder={t('providerProfilePage.fields.bioPlaceholder')}
                  />
                ) : (
                  <p className="mt-1 text-black">
                    {editableData.bio || user.bio || t('providerProfilePage.fields.bioNotProvided')}
                  </p>
                )}
                {isEditing && (
                  <p className="mt-1 text-sm text-black">
                    {tVars('providerProfilePage.fields.charactersRemaining', { count: 200 - editableData.bio.length })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Preferences (provider-only) */}
          <div className="px-6 pb-6">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold text-violet-700 bg-violet-50">
                  {t('providerProfilePage.sections.preferences')}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-black">{t('providerProfilePage.fields.categoriesYouCanDo')}</label>
                {isEditing ? (
                  <div className="mt-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowSpecialtiesDropdown((v) => !v)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-left text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 flex items-center justify-between bg-white"
                      >
                        <span className="truncate text-sm">{t('providerProfilePage.actions.choose')}</span>
                        <ChevronDownIcon className="h-4 w-4 text-gray-500 ml-2" />
                      </button>
                      {showSpecialtiesDropdown && (
                        <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] max-h-56 overflow-auto">
                          {[
                            'Home Maintenance & Repair',
                            'Outdoor & Garden Work',
                            'Moving & Transport',
                            'Cleaning & Maintenance',
                            'Construction & Renovation',
                            'Technical & Installation',
                            'Vehicle Services',
                            'Personal Assistance',
                            'Seasonal & Miscellaneous',
                            'Other',
                          ].map((specialty) => {
                            const selected = editableData.specialties.includes(specialty);
                            const key = CATEGORY_LABEL_TO_KEY[specialty];
                            const label = key ? t(key) : specialty;
                            return (
                              <button
                                key={specialty}
                                type="button"
                                onClick={() =>
                                  setEditableData((prev) => ({
                                    ...prev,
                                    specialties: selected
                                      ? prev.specialties.filter((s) => s !== specialty)
                                      : [...prev.specialties, specialty],
                                  }))
                                }
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-violet-50 text-black ${
                                  selected ? 'bg-violet-50' : ''
                                }`}
                              >
                                <span>{label}</span>
                                {selected && <CheckIcon className="h-4 w-4 text-violet-600" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {editableData.specialties.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {editableData.specialties.map((specialty, index) => {
                          const key = CATEGORY_LABEL_TO_KEY[specialty];
                          const label = key ? t(key) : specialty;
                          return (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800"
                          >
                            {label}
                          </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  editableData.specialties.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {editableData.specialties.map((specialty, index) => {
                        const key = CATEGORY_LABEL_TO_KEY[specialty];
                        const label = key ? t(key) : specialty;
                        return (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800"
                        >
                          {label}
                        </span>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress (above stats/average rating) */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 sm:p-5">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative" style={{ width: ringSize, height: ringSize }}>
              <svg width={ringSize} height={ringSize}>
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  stroke="#E5E7EB"
                  strokeWidth={ringStroke}
                  fill="none"
                />
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  stroke={levelInfo.level >= 3 ? '#F59E0B' : '#8B5CF6'}
                  strokeWidth={ringStroke}
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${gap}`}
                  transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                  fill="none"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-semibold text-black">
                    {tVars('providerProfilePage.level.shortLabel', { level: levelInfo.level })}
                  </div>
                  <div className="text-[11px] text-gray-500">{Math.round(levelInfo.progress * 100)}%</div>
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-black">
                {levelInfo.next
                  ? tVars('providerProfilePage.level.lineWithNext', {
                      level: levelInfo.level,
                      label: t(levelInfo.labelKey),
                      completed: user.completed_requests || 0,
                      next: levelInfo.next,
                    })
                  : tVars('providerProfilePage.level.lineMax', {
                      level: levelInfo.level,
                      label: t(levelInfo.labelKey),
                      completed: user.completed_requests || 0,
                    })}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {levelInfo.next
                  ? tVars('providerProfilePage.level.reachNext', {
                      remaining: levelInfo.remaining,
                      nextLevel: levelInfo.level + 1,
                    })
                  : t('providerProfilePage.level.topLevel')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4">
            <div className="flex items-center">
              <StarIcon className="h-10 w-10 text-yellow-400" />
              <div className="ml-4">
                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">
                  {t('providerProfilePage.stats.averageRating')}
                </p>
                <div className="mt-1 flex items-center">
                  <span className="text-2xl font-semibold text-black mr-2">
                    {avgRating}
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIconSolid
                        key={i}
                        className={`h-6 w-6 ${
                          i < Math.floor(avgRating)
                            ? 'text-yellow-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">
                  {t('providerProfilePage.stats.tasksCompleted')}
                </p>
                <p className="mt-1 text-2xl font-semibold text-black">
                  {user.completed_requests || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4">
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">
                  {t('providerProfilePage.stats.totalEarnings')}
                </p>
                <p className="mt-1 text-2xl font-semibold text-black">
                  €{totalEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-300 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">{t('providerProfilePage.reviews.title')}</h2>
            <div className="text-sm">
              <label className="mr-2 text-black">{t('providerProfilePage.reviews.sortLabel')}</label>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="rounded-md border border-gray-300 px-2 py-1 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="newest">{t('providerProfilePage.reviews.sort.newest')}</option>
                <option value="highest">{t('providerProfilePage.reviews.sort.highest')}</option>
                <option value="lowest">{t('providerProfilePage.reviews.sort.lowest')}</option>
              </select>
            </div>
          </div>
          <div className="divide-y divide-gray-300">
            {sortedReviews.length === 0 ? (
              <div className="p-6 text-black">{t('providerProfilePage.reviews.empty')}</div>
            ) : (
              sortedReviews.map((review: ReviewWithDetails) => (
                <div key={review.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-black">
                            {review.client?.name || t('providerProfilePage.reviews.anonymousClient')}
                          </span>
                          {review.job && (
                            <span className="text-xs text-violet-600">
                              • {review.job.title}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString(language === 'sl' ? 'sl-SI' : 'en-US')}
                        </span>
                      </div>
                      <div className="flex items-center mb-2">
                        <div className="flex mr-2">
                          {[...Array(5)].map((_, i) => (
                            <StarIconSolid
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment ? (
                        <p className="mt-1 text-sm text-gray-600 italic">
                          &quot;{review.comment}&quot;
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ProviderProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div></div>}>
      <ProviderProfilePageContent />
    </Suspense>
  );
}