'use client';

import { useMemo, useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useAuth } from '@/app/hooks/useAuth';
import { getProviderReviews, getProviderStats, ReviewWithDetails } from '@/app/lib/reviews';
import { getProviderEarningsEvents } from '@/app/lib/orders';
import { addProviderCashEarning, getProviderCashEarningsEvents } from '@/app/lib/cash-earnings';
import { getProviderCompletedJobCategoryCounts } from '@/app/lib/jobs';
import { 
  BanknotesIcon,
  CheckCircleIcon,
  StarIcon,
  ChartBarIcon,
  UsersIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useTranslation } from '@/app/hooks/useTranslation';
import type { TranslationKey } from '@/app/lib/translations';

const CATEGORY_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-gray-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-purple-500',
];


// Helper function to get next badge goal
const getNextBadgeGoal = (
  completedTasks: number
): { target: number; descriptionKey: TranslationKey } | null => {
  if (completedTasks < 5) return { target: 5, descriptionKey: 'analytics.trust.badge1' };
  if (completedTasks < 15) return { target: 15, descriptionKey: 'analytics.trust.badge2' };
  if (completedTasks < 30) return { target: 30, descriptionKey: 'analytics.trust.badge3' };
  return null;
};

export default function ProviderAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useTranslation();
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | 'month' | 'all'>('month');
  const [earnings, setEarnings] = useState<{ dateISO: string; amountEur: number }[]>([]);
  const [newAmount, setNewAmount] = useState<string>('');
  const [newDate, setNewDate] = useState<string>(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    // datetime-local expects local time without Z, e.g. 2025-03-20T18:40
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [newNote, setNewNote] = useState<string>('');
  const [categoryCounts, setCategoryCounts] = useState<{ name: string; count: number; color: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      
      try {
        // Fetch reviews
        const providerReviews = await getProviderReviews(user.id);
        setReviews(providerReviews);
        
        // Fetch stats for average rating
        const stats = await getProviderStats(user.id);
        setAvgRating(stats.averageRating);

        // Fetch earnings from completed orders + cash earnings, merged
        const [orderEvents, cashEvents] = await Promise.all([
          getProviderEarningsEvents(user.id),
          getProviderCashEarningsEvents(user.id),
        ]);
        const merged = [...orderEvents, ...cashEvents].sort(
          (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
        );
        setEarnings(merged);

        // Fetch completed job category counts
        const counts = await getProviderCompletedJobCategoryCounts(user.id);
        setCategoryCounts(
          counts.map((c, idx) => ({
            ...c,
            color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
          }))
        );
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

  // Get recent reviews (last 3)
  const recentReviews = reviews.slice(0, 3);

  const formatEuro = (amt: number) => `€${amt.toFixed(2)}`;
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

  const totals = useMemo(() => {
    const now = new Date();
    const ms7 = 7 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const sumAll = earnings.reduce((a, e) => a + (e.amountEur || 0), 0);
    const sumMonth = earnings
      .filter(e => new Date(e.dateISO).getTime() >= startOfMonth)
      .reduce((a, e) => a + (e.amountEur || 0), 0);
    const sum7 = earnings
      .filter(e => (now.getTime() - new Date(e.dateISO).getTime()) <= ms7)
      .reduce((a, e) => a + (e.amountEur || 0), 0);
    return { sumAll, sumMonth, sum7 };
  }, [earnings]);

  const earningsForChart = useMemo(() => {
    const now = new Date();
    const ms7 = 7 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const filtered = earnings.filter(e => {
      const t = new Date(e.dateISO).getTime();
      if (timeRange === 'all') return true;
      if (timeRange === '7d') return (now.getTime() - t) <= ms7;
      // month
      return t >= startOfMonth;
    });
    const pad = (n: number) => String(n).padStart(2, '0');
    // Aggregate: by day for 7d/month; by month for all time
    const map = new Map<string, number>();
    for (const e of filtered) {
      const d = new Date(e.dateISO);
      const dayKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const monthKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      const key = timeRange === 'all' ? monthKey : dayKey;
      map.set(key, (map.get(key) || 0) + e.amountEur);
    }
    const items = Array.from(map.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([key, amount]) => {
        // Build display label date
        if (timeRange === 'all') {
          const [y, m] = key.split('-');
          const labelDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
          return {
            key,
            amount,
            label: labelDate.toLocaleDateString(language === 'sl' ? 'sl-SI' : 'en-US', {
              month: 'short',
              year: 'numeric',
            }),
          };
        }
        const labelDate = new Date(key);
        return {
          key,
          amount,
          label: labelDate.toLocaleDateString(language === 'sl' ? 'sl-SI' : 'en-US', {
            month: 'short',
            day: 'numeric',
          }),
        };
      });
    return items;
  }, [earnings, timeRange, language]);

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

  // Redirect if not logged in
  if (!user) {
    return null;
  }

  const handleAddCash = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt <= 0) return;

    (async () => {
      if (!user) return;
      const earnedAtISO = new Date(newDate).toISOString();
      const inserted = await addProviderCashEarning({
        providerId: user.id,
        amountEur: amt,
        earnedAtISO,
        note: newNote || undefined,
      });
      if (!inserted) {
        alert(t('analytics.cash.addFailed'));
        return;
      }

      // Refresh merged earnings list
      const [orderEvents, cashEvents] = await Promise.all([
        getProviderEarningsEvents(user.id),
        getProviderCashEarningsEvents(user.id),
      ]);
      const merged = [...orderEvents, ...cashEvents].sort(
        (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
      );
      setEarnings(merged);

      setNewAmount('');
      setNewNote('');
    })();
  };
  
  // Calculate progress to next badge
  const completedRequests = user?.completed_requests || 0;
  const nextBadge = getNextBadgeGoal(completedRequests);
  const badgeProgress = nextBadge 
    ? ((completedRequests % 5) / (nextBadge.target - Math.floor(completedRequests / 5) * 5)) * 100
    : 100;

  return (
    <DashboardLayout userRole="provider" userName={user?.name || t('analytics.userNameFallback')}>
      <div 
        className="max-w-7xl mx-auto -mx-3 sm:-mx-4 lg:-mx-6 -my-4 -mb-28 px-3 sm:px-4 lg:px-6 pt-4 pb-32 relative min-h-screen bg-gray-50"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-black">{t('nav.analytics')}</h1>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | 'month' | 'all')}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="7d">{t('analytics.timeRange.last7Days')}</option>
            <option value="month">{t('analytics.timeRange.thisMonth')}</option>
            <option value="all">{t('analytics.timeRange.allTime')}</option>
          </select>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4">
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">
                  {t('analytics.earnings.total')}
                </p>
                <p className="mt-1 text-2xl font-semibold text-black">
                  {formatEuro(totals.sumAll)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-8 w-8 text-violet-500" />
              <div className="ml-4">
                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">
                  {t('analytics.earnings.thisMonth')}
                </p>
                <p className="mt-1 text-2xl font-semibold text-black">{formatEuro(totals.sumMonth)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">
                  {t('analytics.earnings.last7Days')}
                </p>
                <p className="mt-1 text-2xl font-semibold text-black">{formatEuro(totals.sum7)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Chart removed per request */}

        {/* Add Cash Earning */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-6 mb-8">
          <h2 className="text-lg font-semibold text-black mb-4">{t('analytics.cash.title')}</h2>
          <form onSubmit={handleAddCash} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-black mb-1">{t('analytics.cash.amountLabel')}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder={t('analytics.cash.amountPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">{t('analytics.cash.dateTimeLabel')}</label>
              <input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-black mb-1">{t('analytics.cash.noteLabel')}</label>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder={t('analytics.cash.notePlaceholder')}
              />
            </div>
            <div>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 rounded-md bg-violet-600 text-white text-sm font-medium shadow hover:bg-violet-700"
              >
                {t('analytics.cash.addButton')}
              </button>
            </div>
          </form>
        </div>

        {/* Task Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-6">
            <h2 className="text-lg font-semibold text-black mb-4">{t('analytics.categories.title')}</h2>
            <div className="space-y-4">
              {categoryCounts.length === 0 ? (
                <div className="text-sm text-gray-500 pt-2">{t('analytics.categories.empty')}</div>
              ) : categoryCounts.map((category) => (
                <div key={category.name} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-black">
                        {(() => {
                          const key = CATEGORY_LABEL_TO_KEY[category.name];
                          return key ? t(key) : category.name;
                        })()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {tVars('analytics.categories.taskCount', { count: category.count })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${category.color} rounded-full h-2`}
                        style={{
                          width: `${Math.min(100, (category.count / Math.max(completedRequests, 1)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-6">
            <h2 className="text-lg font-semibold text-black mb-4">{t('analytics.trust.title')}</h2>
            {nextBadge ? (
              <>
                <p className="text-sm text-black mb-2">
                  {tVars('analytics.trust.unlockMessage', {
                    count: nextBadge.target - completedRequests,
                    reward: t(nextBadge.descriptionKey),
                  })}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-violet-500 rounded-full h-2"
                    style={{ width: `${badgeProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-black mb-4">
                {t('analytics.trust.maxLevel')}
              </p>
            )}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{tVars('analytics.trust.currentLabel', { count: completedRequests })}</span>
              {nextBadge && <span>{tVars('analytics.trust.nextLabel', { count: nextBadge.target })}</span>}
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-black">{t('analytics.reviews.title')}</h2>
              <div className="flex items-center">
                <span className="text-2xl font-semibold text-black mr-2">
                  {avgRating.toFixed(1)}
                </span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <StarIconSolid
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(avgRating)
                          ? 'text-yellow-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {recentReviews.length === 0 ? (
                <div className="text-sm text-gray-500 pt-4">{t('analytics.reviews.empty')}</div>
              ) : (
                recentReviews.map((review) => (
                <div key={review.id} className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-black">
                          {review.client?.name || t('analytics.reviews.anonymousClient')}
                        </span>
                        {review.job && (
                          <span className="text-xs text-violet-600">• {review.job.title}</span>
                        )}
                      </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIconSolid
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                    {review.comment && (
                  <p className="text-sm text-gray-600">{review.comment}</p>
                    )}
                  <p className="text-xs text-gray-500 mt-1">
                      {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 