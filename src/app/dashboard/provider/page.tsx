'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/DashboardLayout';
import TaskCard from '@/app/components/TaskCard';
import { createChatThread, getUnreadCount, subscribeToUnreadMessagesForUser } from '@/app/lib/chat';
import { getAllJobs, getProviderJobs, JobWithUsers } from '@/app/lib/jobs';
import { getProviderStats } from '@/app/lib/reviews';
import { getProviderTotalEarningsEur } from '@/app/lib/orders';
import { useAuth } from '@/app/hooks/useAuth';
import { useTranslation } from '@/app/hooks/useTranslation';
import type { TranslationKey } from '@/app/lib/translations';
import { 
  BanknotesIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  MapPinIcon,
  ChevronDownIcon,
  ListBulletIcon,
  WrenchScrewdriverIcon,
  HomeModernIcon,
  TruckIcon,
  SparklesIcon,
  BuildingOffice2Icon,
  CpuChipIcon,
  Cog6ToothIcon,
  UserIcon as UserOutlineIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Map job category to category id
function getCategoryId(category: string | null): string {
  if (!category) return 'other';
  const cat = category.toLowerCase();

  if (cat.includes('home maintenance') || cat.includes('repair')) return 'home_maintenance';
  if (cat.includes('outdoor') || cat.includes('garden')) return 'outdoor_garden';
  if (cat.includes('moving') || cat.includes('transport')) return 'moving_transport';
  if (cat.includes('cleaning') || cat.includes('maintenance')) return 'cleaning';
  if (cat.includes('construction') || cat.includes('renovation')) return 'construction';
  if (cat.includes('technical') || cat.includes('installation')) return 'technical';
  if (cat.includes('vehicle')) return 'vehicle';
  if (cat.includes('personal') || cat.includes('assistance')) return 'personal';
  if (cat.includes('seasonal') || cat.includes('miscellaneous')) return 'seasonal';
  return 'other';
}

// Job categories list with icons
const JOB_CATEGORIES: { id: string; labelKey: TranslationKey; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'home_maintenance', labelKey: 'category.homeMaintenance', icon: WrenchScrewdriverIcon },
  { id: 'outdoor_garden', labelKey: 'category.outdoorGarden', icon: HomeModernIcon },
  { id: 'moving_transport', labelKey: 'category.movingTransport', icon: TruckIcon },
  { id: 'cleaning', labelKey: 'category.cleaningMaintenance', icon: SparklesIcon },
  { id: 'construction', labelKey: 'category.constructionRenovation', icon: BuildingOffice2Icon },
  { id: 'technical', labelKey: 'category.technicalInstallation', icon: CpuChipIcon },
  { id: 'vehicle', labelKey: 'category.vehicleServices', icon: Cog6ToothIcon },
  { id: 'personal', labelKey: 'category.personalAssistance', icon: UserOutlineIcon },
  { id: 'seasonal', labelKey: 'category.seasonalMisc', icon: SunIcon },
  { id: 'other', labelKey: 'common.other', icon: ListBulletIcon },
];

// Calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function ProviderDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [availableJobs, setAvailableJobs] = useState<JobWithUsers[]>([]);
  const [myJobs, setMyJobs] = useState<JobWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'distance'>('date');
  const [maxDistance, setMaxDistance] = useState<string>('any');
  const [isJobsOpen, setIsJobsOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [providerLocation, setProviderLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [stats, setStats] = useState({
    completedTasks: 0,
    rating: 0,
    totalEarnings: 0,
    activeChats: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?role=provider');
    }
  }, [authLoading, user, router]);

  // Get provider's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setProviderLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Ljubljana if geolocation fails
          setProviderLocation({ lat: 46.0569, lng: 14.5058 });
        }
      );
    } else {
      setProviderLocation({ lat: 46.0569, lng: 14.5058 });
    }
  }, []);

  // Refresh unread count (for when returning from chat)
  const refreshUnreadCount = async () => {
    if (!user) return;
    try {
      const unreadCount = await getUnreadCount(user.id);
      setStats(prev => ({ ...prev, activeChats: unreadCount }));
      setHasUnreadMessages(unreadCount > 0);
    } catch (e) {
      // ignore
    }
  };

  // Refresh unread count when page becomes visible or regains focus
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshUnreadCount();
      }
    };
    const handleFocus = () => refreshUnreadCount();
    
    // Also refresh immediately on mount (catches back navigation)
    refreshUnreadCount();
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user]);

  // Real-time: update dashboard unread messages stat immediately when a new message arrives.
  useEffect(() => {
    if (!user?.id) return;
    let disposed = false;
    let unsubscribe: (() => void) | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const trigger = () => {
      if (disposed) return;
      if (timer) return;
      timer = setTimeout(async () => {
        timer = null;
        await refreshUnreadCount();
      }, 250);
    };

    (async () => {
      try {
        unsubscribe = await subscribeToUnreadMessagesForUser(user.id, trigger);
      } catch {
        // ignore
      }
    })();

    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id]);

  // Fetch jobs and stats
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch all open jobs
        const allJobs = await getAllJobs({ status: 'open' });
        setAvailableJobs(allJobs);

        // Fetch provider's own jobs
        const providerJobs = await getProviderJobs(user.id);
        setMyJobs(providerJobs);

        // Get provider stats
        const reviewStats = await getProviderStats(user.id);
        
        // Calculate completed tasks
        const completedCount = providerJobs.filter(j => j.status === 'completed').length;
        
        // Get unread messages
        const unreadCount = await getUnreadCount(user.id);
        
        // Calculate earnings from completed orders
        const totalEarnings = await getProviderTotalEarningsEur(user.id);

        setStats({
          completedTasks: user.completed_requests || completedCount,
          rating: reviewStats.averageRating,
          totalEarnings: Math.round(totalEarnings * 100) / 100,
          activeChats: unreadCount,
        });
        setHasUnreadMessages(unreadCount > 0);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Filter and sort tasks
  const filteredJobs = availableJobs
    .filter(job => {
      // Category filter
      const categoryMatch = selectedCategory === 'all' || getCategoryId(job.category) === selectedCategory;
      
      // Distance filter (only if provider location is available and job has coordinates)
      let distanceMatch = true;
      if (maxDistance !== 'any' && providerLocation && job.latitude && job.longitude) {
        const distance = calculateDistance(
          providerLocation.lat,
          providerLocation.lng,
          job.latitude,
          job.longitude
        );
        distanceMatch = distance <= parseFloat(maxDistance);
      }
      
      return categoryMatch && distanceMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (b.budget_max || b.budget_min || 0) - (a.budget_max || a.budget_min || 0);
        case 'distance':
          if (!providerLocation) return 0;
          const distA = a.latitude && a.longitude 
            ? calculateDistance(providerLocation.lat, providerLocation.lng, a.latitude, a.longitude)
            : Infinity;
          const distB = b.latitude && b.longitude
            ? calculateDistance(providerLocation.lat, providerLocation.lng, b.latitude, b.longitude)
            : Infinity;
          return distA - distB;
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const handleChatClick = async (jobId: string) => {
    if (!user) return;

    const job = availableJobs.find(j => j.id === jobId);
    if (!job || !job.client) return;

    try {
    // Create or find existing chat thread
      const chatThread = await createChatThread({
        job_id: job.id,
        client_id: job.client_id,
        provider_id: user.id,
      });

      // Navigate to the chat thread
        router.push(`/dashboard/provider/messages/${chatThread.id}`);
    } catch (error) {
        console.error('Error creating chat thread:', error);
      alert(t('provider.startChatFailed'));
    }
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

  // Transform jobs for TaskCard
  const tasks = filteredJobs.map(job => {
    const distance = providerLocation && job.latitude && job.longitude
      ? calculateDistance(providerLocation.lat, providerLocation.lng, job.latitude, job.longitude)
      : null;

    return {
      id: job.id,
      title: job.title,
      description: job.description || '',
      category: job.category || t('common.other'),
      location: job.location || t('common.unknown'),
      coordinates:
        job.latitude != null && job.longitude != null
          ? { lat: job.latitude, lng: job.longitude }
          : undefined,
      date: job.created_at,
      price: job.budget_max || job.budget_min || null,
      isNegotiable: job.is_negotiable,
      status: job.status,
      postedAt: job.created_at,
      clientName: job.client?.name || t('common.client'),
      clientId: job.client_id,
      clientCompletedRequests: job.client?.completed_requests || 0,
      distance: distance ? `${distance.toFixed(1)} km` : undefined,
      images: job.images || [],
      imageUrl: (job.images && job.images.length > 0) ? job.images[0] : undefined,
    };
  });

  return (
    <DashboardLayout
      userRole="provider"
      userName={user.name}
      hasUnreadMessages={hasUnreadMessages}
      unreadMessagesCount={stats.activeChats}
    >
      <div 
        className="space-y-6 -mx-3 sm:-mx-4 lg:-mx-6 -my-4 -mb-28 px-3 sm:px-4 lg:px-6 pt-4 pb-32 relative min-h-screen bg-gray-50"
      >
        {/* Greeting with Avatar (matches client dashboard header) */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              {t('dashboard.greeting.hi')}, {user.name}
            </h1>
            <button
              type="button"
              onClick={() => router.push('/dashboard/provider/profile')}
              className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              aria-label="Open profile"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          </div>

          <p className="mt-1 text-black flex items-center">
            <MapPinIcon className="h-5 w-5 text-violet-500 mr-1" />
            {providerLocation ? t('provider.location.nearYou') : t('provider.location.getting')}
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-3">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              <div className="ml-4">
                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">
                  {t('dashboard.stats.completed')}
                </p>
                <p className="mt-1 text-xl font-semibold text-black">
                  {stats.completedTasks}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-3">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">
                {t('dashboard.stats.rating')}
              </p>
              <div className="mt-1 flex items-center justify-center gap-1">
                <span className="text-xl font-semibold text-black">
                  {stats.rating > 0 ? stats.rating.toFixed(1) : '-'}
                </span>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIconSolid
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(stats.rating)
                          ? 'text-yellow-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-3">
            <div className="flex items-center">
              <BanknotesIcon className="h-6 w-6 text-green-500" />
              <div className="ml-4">
                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">
                  {t('dashboard.stats.earnings')}
                </p>
                <p className="mt-1 text-xl font-semibold text-black">
                  €{stats.totalEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-3">
            <div className="flex items-center">
              <ChatBubbleLeftIcon className="h-6 w-6 text-violet-500" />
              <div className="ml-4">
                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">
                  {t('dashboard.stats.messages')}
                </p>
                <p className="mt-1 text-xl font-semibold text-black">
                  {stats.activeChats}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-black mb-1">{t('provider.filters.category')}</label>
              <button
                type="button"
                onClick={() => setIsJobsOpen((v) => !v)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-left text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 flex items-center justify-between"
              >
                <span className="inline-flex items-center gap-2">
                  {selectedCategory === 'all' ? (
                    <ListBulletIcon className="h-4 w-4 text-violet-600" />
                  ) : (
                    (() => {
                      const found = JOB_CATEGORIES.find(c => c.id === selectedCategory);
                      const Icon = found ? found.icon : ListBulletIcon;
                      return <Icon className="h-4 w-4 text-violet-600" />;
                    })()
                  )}
                  <span className="truncate">
                    {selectedCategory === 'all'
                      ? t('provider.filters.allCategories')
                      : t(JOB_CATEGORIES.find(c => c.id === selectedCategory)?.labelKey || 'common.other')}
                  </span>
                </span>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </button>
              {isJobsOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] max-h-64 overflow-auto">
                  <button
                    onClick={() => { setSelectedCategory('all'); setIsJobsOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-black hover:bg-violet-50 ${selectedCategory === 'all' ? 'bg-violet-50' : ''}`}
                  >
                    <ListBulletIcon className="h-4 w-4 text-violet-600" />
                    {t('provider.filters.allCategories')}
                  </button>
                  {JOB_CATEGORIES.map(({ id, labelKey, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => { setSelectedCategory(id); setIsJobsOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-black hover:bg-violet-50 ${selectedCategory === id ? 'bg-violet-50' : ''}`}
                    >
                      <Icon className="h-4 w-4 text-violet-600" />
                      <span className="truncate">{t(labelKey)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1">
              <label htmlFor="maxDistance" className="block text-sm font-medium text-black mb-1">
                {t('provider.filters.maxDistance')}
              </label>
              <select
                id="maxDistance"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="any">{t('provider.filters.anyDistance')}</option>
                <option value="1">1 km</option>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="20">20 km</option>
                <option value="50">50 km</option>
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="sortBy" className="block text-sm font-medium text-black mb-1">
                {t('provider.filters.sortBy')}
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'distance')}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="date">{t('provider.filters.sort.mostRecent')}</option>
                <option value="price">{t('provider.filters.sort.highestPrice')}</option>
                <option value="distance">{t('provider.filters.sort.nearest')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Available Requests */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-black">
              {t('provider.availableRequests')} ({tasks.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-300">
            {tasks.length > 0 ? (
              tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                  currentUserId={user.id}
                currentUserRole="provider"
                onChatClick={() => handleChatClick(task.id)}
                  chatButtonLabel={t('provider.contactClient')}
              />
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-2">{t('provider.noAvailableRequests')}</p>
                <p className="text-sm text-gray-400">
                  {selectedCategory !== 'all' || maxDistance !== 'any' 
                    ? t('provider.tryAdjustingFilters') 
                    : t('provider.checkBackLater')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 
