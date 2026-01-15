'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/DashboardLayout';
import UserAvatar from '@/app/components/UserAvatar';
import { useAuth } from '@/app/hooks/useAuth';
import { getProviderReviews, getProviderStats, ReviewWithDetails } from '@/app/lib/reviews';
import { createClient } from '@/app/lib/supabase/client';
import { createReport } from '@/app/lib/reports';
import { StarIcon as StarIconSolid, ArrowLeftIcon, MapPinIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import type { Profile } from '@/types/database';
import { useTranslation } from '@/app/hooks/useTranslation';

export default function PublicProviderProfilePage() {
  const params = useParams<{ providerId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const providerId = params?.providerId || '';

  const [provider, setProvider] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!providerId) return;
      
      try {
        const supabase = createClient();
        
        // Fetch provider profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', providerId)
          .eq('role', 'provider')
          .single();
        
        if (profileError || !profileData) {
          console.error('Error fetching provider:', profileError);
          setLoading(false);
          return;
        }
        
        setProvider(profileData as Profile);
        
        // Fetch reviews
        const providerReviews = await getProviderReviews(providerId);
        setReviews(providerReviews);
        
        // Fetch stats for average rating
        const stats = await getProviderStats(providerId);
        setAvgRating(stats.averageRating);
      } catch (error) {
        console.error('Error loading provider data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (providerId) {
      load();
    }
  }, [providerId]);

  const handleSubmitReport = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!reportReason.trim()) {
      alert(t('providerProfile.reportAlerts.missingReason'));
      return;
    }

    setIsSubmittingReport(true);
    try {
      await createReport({
        reporter_id: user.id,
        reported_user_id: providerId,
        reason: reportReason.trim(),
      });

      alert(t('providerProfile.reportAlerts.submitted'));
      setShowReportModal(false);
      setReportReason('');
    } catch (error) {
      alert(t('providerProfile.reportAlerts.failed'));
      console.error('Report submission error:', error);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const content = (
    <div className="max-w-3xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 text-black"
            aria-label="Back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-black">{t('providerProfile.title')}</h1>
        </div>

        {/* Main info */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-5 flex flex-col items-center gap-3">
          {provider && (
            <UserAvatar
              imageUrl={provider.avatar_url}
              name={provider.name}
              role="provider"
              completedRequests={provider.completed_requests || 0}
              size="lg"
            />
          )}
          <div className="text-center">
            <p className="text-lg font-semibold text-black">{provider?.name || 'Provider'}</p>
          </div>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-black">{avgRating.toFixed(1)}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIconSolid
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(avgRating) ? 'text-yellow-400' : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-black">
              {(provider?.completed_requests || 0)}{' '}
              {(provider?.completed_requests || 0) === 1
                ? t('providerProfile.jobsDoneSingular')
                : t('providerProfile.jobsDonePlural')}
            </div>
          </div>
          {provider?.bio && (
            <p className="mt-2 text-sm text-black text-center">{provider.bio}</p>
          )}
          <button
            onClick={() => {
              if (!user) {
                router.push('/login');
                return;
              }
              setShowReportModal(true);
            }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <ExclamationTriangleIcon className="h-4 w-4" />
            {t('providerProfile.reportButton')}
          </button>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-300">
            <h2 className="text-base font-semibold text-black">{t('providerProfile.reviewsTitle')}</h2>
          </div>
          <div className="divide-y divide-gray-300">
            {reviews.length === 0 ? (
              <div className="p-5 text-sm text-black">{t('providerProfile.noReviews')}</div>
            ) : (
              reviews.map((review: ReviewWithDetails) => (
                <div key={review.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-black">
                          {review.client?.name || 'Anonymous Client'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.job && (
                        <p className="text-xs text-violet-600 mb-1">{review.job.title}</p>
                      )}
                      <div className="flex items-center mb-2">
                        <div className="flex mr-2">
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
                      {review.comment ? (
                        <p className="mt-1 text-sm text-gray-700 italic">"{review.comment}"</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  {t('providerProfile.reportModal.title')}
                </h3>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 text-black"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {t('providerProfile.reportModal.subtitlePrefix')}{' '}
                {provider?.name || 'this provider'}.
              </p>

              <div className="mb-4">
                <label htmlFor="reportReason" className="block text-sm font-medium text-black mb-2">
                  {t('providerProfile.reportModal.reasonLabel')}
                </label>
                <textarea
                  id="reportReason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder={t('providerProfile.reportModal.placeholder')}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-black placeholder-gray-400"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isSubmittingReport}
                >
                  {t('providerProfile.reportModal.cancel')}
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={isSubmittingReport || !reportReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingReport ? t('report.submitting') : t('providerProfile.reportModal.submit')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );

  if (user) {
    return (
      <DashboardLayout userRole={user.role} userName={user.name}>
        {content}
      </DashboardLayout>
    );
  }

  // Guest view (no auth)
  return <main className="min-h-screen bg-violet-50">{content}</main>;
}


