'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import TaskCard from '@/app/components/TaskCard';
import { getUnreadCount } from '@/app/lib/chat';
import { getClientJobs, JobWithUsers, setJobStatus } from '@/app/lib/jobs';
import { getClientReviews } from '@/app/lib/reviews';
import { useAuth } from '@/app/hooks/useAuth';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { createReport } from '@/app/lib/reports';

// Activity item type for Recent Updates
interface ActivityItem {
  id: string;
  type: 'request_created' | 'request_assigned' | 'service_completed' | 'review_given' | 'request_cancelled';
  title: string;
  date: string;
  providerName?: string;
}

export default function ClientDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useTranslation();
  const [jobs, setJobs] = useState<JobWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [stats, setStats] = useState({ active: 0, completed: 0, messages: 0 });
  const [reportingJobId, setReportingJobId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState<ActivityItem[]>([]);
  const locale = language === 'sl' ? 'sl-SI' : 'en-US';

  // Refresh unread count (for when returning from chat)
  const refreshUnreadCount = async () => {
    if (!user) return;
    try {
      const unreadCount = await getUnreadCount(user.id);
      setStats(prev => ({ ...prev, messages: unreadCount }));
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

  // Fetch jobs and stats when user is loaded
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch client's jobs and reviews
        const [clientJobs, reviews] = await Promise.all([
          getClientJobs(user.id),
          getClientReviews(user.id),
        ]);
        setJobs(clientJobs);

        // Calculate stats
        const activeCount = clientJobs.filter(j => 
          j.status === 'open' || j.status === 'pending_confirmation' || j.status === 'confirmed' || j.status === 'in_progress'
        ).length;
        const completedCount = clientJobs.filter(j => j.status === 'completed').length;
        
        // Get unread message count
        const unreadCount = await getUnreadCount(user.id);
        
        setStats({
          active: activeCount,
          completed: completedCount,
          messages: unreadCount,
        });
        setHasUnreadMessages(unreadCount > 0);

        // Build recent activity items
        const activityItems: ActivityItem[] = [];

        for (const job of clientJobs) {
          // Job created
          activityItems.push({
            id: `job-created-${job.id}`,
            type: 'request_created',
            title: job.title,
            date: job.created_at,
          });

          // Job assigned (has provider)
          if (job.provider_id && job.provider) {
            activityItems.push({
              id: `job-assigned-${job.id}`,
              type: 'request_assigned',
              title: job.title,
              date: job.updated_at,
              providerName: job.provider.name,
            });
          }

          // Job completed
          if (job.status === 'completed') {
            activityItems.push({
              id: `job-completed-${job.id}`,
              type: 'service_completed',
              title: job.title,
              date: job.updated_at,
              providerName: job.provider?.name,
            });
          }

          // Job cancelled
          if (job.status === 'cancelled') {
            activityItems.push({
              id: `job-cancelled-${job.id}`,
              type: 'request_cancelled',
              title: job.title,
              date: job.updated_at,
            });
          }
        }

        // Add reviews as activity items
        for (const review of reviews) {
          activityItems.push({
            id: `review-${review.id}`,
            type: 'review_given',
            title: review.job?.title || 'Job',
            date: review.created_at,
            providerName: review.provider?.name,
          });
        }

        // Sort by date (newest first) and take the last 3
        activityItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentUpdates(activityItems.slice(0, 3));
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

  const handleChatClick = (jobId: string) => {
    router.push(`/dashboard/client/messages/jobs/${jobId}`);
  };

  const handleEditTask = (jobId: string) => {
    // Navigate to requests page where full edit functionality exists
    router.push(`/dashboard/client/requests?status=open`);
  };

  const handleCancelTask = async (jobId: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    
    try {
      await setJobStatus(jobId, 'cancelled');
      // Refresh jobs list
      if (user) {
        const updatedJobs = await getClientJobs(user.id);
        setJobs(updatedJobs);
      }
    } catch (error) {
      console.error('Error cancelling job:', error);
      alert('Failed to cancel request. Please try again.');
    }
  };

  const handleCompleteTask = async (jobId: string) => {
    if (!confirm('Mark this request as completed?')) return;
    
    try {
      await setJobStatus(jobId, 'completed');
      // Refresh jobs list
      if (user) {
        const updatedJobs = await getClientJobs(user.id);
        setJobs(updatedJobs);
        // Update stats
        const activeCount = updatedJobs.filter(j => 
          j.status === 'open' || j.status === 'pending_confirmation' || j.status === 'confirmed' || j.status === 'in_progress'
        ).length;
        const completedCount = updatedJobs.filter(j => j.status === 'completed').length;
        setStats(prev => ({ ...prev, active: activeCount, completed: completedCount }));
      }
    } catch (error) {
      console.error('Error completing job:', error);
      alert('Failed to complete request. Please try again.');
    }
  };

  const handleReportIssue = (jobId: string) => {
    setReportingJobId(jobId);
    setReportReason('');
  };

  const submitReport = async () => {
    if (!user || !reportingJobId) return;
    if (!reportReason.trim()) {
      alert('Please describe the issue.');
      return;
    }

    const job = jobs.find((j) => j.id === reportingJobId);

    setIsSubmittingReport(true);
    try {
      await createReport({
        reporter_id: user.id,
        reported_job_id: reportingJobId,
        reported_user_id: job?.provider_id || undefined,
        reason: reportReason.trim(),
      });

      alert(t('report.submitted'));
      setReportingJobId(null);
      setReportReason('');
    } catch (e) {
      console.error('Failed to submit report:', e);
      alert(t('report.submitFailed'));
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <DashboardLayout userRole="client" userName={t('common.loadingUser')}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Redirect if not logged in
  if (!user) {
    router.push('/login?role=client');
    return null;
  }

  // Transform jobs to task format for TaskCard
  const tasks = jobs.map(job => ({
    id: job.id,
    title: job.title,
    description: job.description || '',
    category: job.category || t('common.other'),
    location: job.location || t('common.unknown'),
    latitude: job.latitude,
    longitude: job.longitude,
    date: job.created_at,
    price: job.budget_max || job.budget_min || null,
    isNegotiable: job.is_negotiable,
    status: job.status === 'open' ? 'open' : 
            job.status === 'completed' ? 'completed' : 
            job.status === 'cancelled' ? 'cancelled' : 'open',
    postedAt: job.created_at,
    providerName: job.provider?.name,
    providerId: job.provider?.id,
    providerCompletedRequests: job.provider?.completed_requests,
  }));

  // Only show active jobs on the main dashboard. Completed/cancelled jobs belong in the Requests pages.
  const activeTasks = tasks.filter(
    (task) => task.status !== 'completed' && task.status !== 'cancelled'
  );

  return (
    <DashboardLayout
      userRole="client"
      userName={user.name}
      hasUnreadMessages={hasUnreadMessages}
      unreadMessagesCount={stats.messages}
    >
      <div 
        className="space-y-6 -mx-3 sm:-mx-4 lg:-mx-6 -my-4 -mb-28 px-4 sm:px-6 lg:px-8 pt-6 pb-32 relative min-h-screen bg-white"
      >
        {/* Greeting with Avatar */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('dashboard.greeting.hi')}, {user.name}
          </h1>
          <button
            type="button"
            onClick={() => router.push('/dashboard/client/profile')}
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

        {/* Create Request Button */}
        <button
          onClick={() => router.push('/dashboard/client/new-request')}
          className="w-full py-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          {t('dashboard.client.createRequest')}
        </button>

        {/* Stats Row with Dividers */}
        <div className="flex items-center justify-around py-3">
          <button
            onClick={() => router.push('/dashboard/client/requests?status=open')}
            className="flex-1 text-center py-2"
          >
            <p className="text-sm text-gray-500">{t('dashboard.stats.active')}</p>
            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          </button>
          <div className="w-[1.5px] h-14 bg-gray-300"></div>
          <button
            onClick={() => router.push('/dashboard/client/requests?status=completed')}
            className="flex-1 text-center py-2"
          >
            <p className="text-sm text-gray-500">{t('dashboard.stats.completed')}</p>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          </button>
          <div className="w-[1.5px] h-14 bg-gray-300"></div>
          <button
            onClick={() => router.push('/dashboard/client/messages')}
            className="flex-1 text-center py-2"
          >
            <p className="text-sm text-gray-500">{t('dashboard.stats.messages')}</p>
            <p className="text-2xl font-bold text-gray-900">{stats.messages}</p>
          </button>
        </div>

        {/* My Requests */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('dashboard.client.myRequests')}
          </h2>
          
          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <p className="text-gray-500 mb-4">{t('dashboard.client.noRequestsYet')}</p>
              <button
                onClick={() => router.push('/dashboard/client/new-request')}
                className="inline-flex items-center px-5 py-2.5 bg-violet-600 text-white rounded-full font-medium hover:bg-violet-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                {t('dashboard.client.createFirstRequest')}
              </button>
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <p className="text-gray-500 mb-4">{t('dashboard.client.noActiveRequests')}</p>
              <button
                onClick={() => router.push('/dashboard/client/new-request')}
                className="inline-flex items-center px-5 py-2.5 bg-violet-600 text-white rounded-full font-medium hover:bg-violet-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                {t('dashboard.client.createNewRequest')}
              </button>
            </div>
          ) : (
          <div className="space-y-3">
              {activeTasks.map((task) => (
                <div key={task.id} className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                <TaskCard
                  task={task}
                    currentUserId={user.id}
                    currentUserRole="client"
                  hideUserInfo
                  initiallyHideDescription
                  onChatClick={() => handleChatClick(task.id)}
                  chatButtonLabel={t('dashboard.client.viewChats')}
                  onEdit={() => handleEditTask(task.id)}
                  onCancel={() => handleCancelTask(task.id)}
                  onComplete={() => handleCompleteTask(task.id)}
                  onReport={() => handleReportIssue(task.id)}
                />
                </div>
              ))}
          </div>
          )}
        </div>

        {/* Recent Updates - Only show if there are jobs */}
        {tasks.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('dashboard.client.recentUpdates')}
          </h2>
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden">
              {recentUpdates.length === 0 ? (
                <div className="p-4">
                  <p className="text-sm text-gray-500">
                    {t('dashboard.client.noUpdatesYet')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-300">
                  {recentUpdates.map((activity) => {
                    const getActivityIcon = () => {
                      switch (activity.type) {
                        case 'request_created':
                          return <ClockIcon className="h-5 w-5 text-blue-500" />;
                        case 'request_assigned':
                          return <ChatBubbleLeftIcon className="h-5 w-5 text-violet-500" />;
                        case 'service_completed':
                          return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
                        case 'review_given':
                          return <StarIcon className="h-5 w-5 text-yellow-500" />;
                        case 'request_cancelled':
                          return <XMarkIcon className="h-5 w-5 text-red-500" />;
                      }
                    };
                    const getActivityText = () => {
                      switch (activity.type) {
                        case 'request_created':
                          return t('activity.requestCreated');
                        case 'request_assigned':
                          return `${t('activity.assignedTo')} ${activity.providerName}`;
                        case 'service_completed':
                          return `${t('activity.completedBy')} ${activity.providerName}`;
                        case 'review_given':
                          return `${t('activity.reviewed')} ${activity.providerName}`;
                        case 'request_cancelled':
                          return t('activity.requestCancelled');
                      }
                    };
                    return (
                      <div key={activity.id} className="flex items-center gap-3 p-3">
                        <div className="shrink-0">{getActivityIcon()}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-black truncate">{activity.title}</p>
                          <p className="text-xs text-gray-500">{getActivityText()}</p>
                        </div>
                        <p className="text-xs text-gray-400 shrink-0">
                          {new Date(activity.date).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Report Modal */}
        {reportingJobId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('report.title')}</h3>
                <button
                  onClick={() => {
                    if (isSubmittingReport) return;
                    setReportingJobId(null);
                    setReportReason('');
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {t('report.subtitle')}
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('report.question')}</label>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={5}
                placeholder={t('report.placeholder')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
              <div className="mt-4 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    if (isSubmittingReport) return;
                    setReportingJobId(null);
                    setReportReason('');
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  disabled={isSubmittingReport}
                >
                  {t('report.cancel')}
                </button>
                <button
                  onClick={submitReport}
                  disabled={isSubmittingReport || !reportReason.trim()}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingReport ? t('report.submitting') : t('report.submit')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 
