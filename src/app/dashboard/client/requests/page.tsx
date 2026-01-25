'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/app/components/DashboardLayout';
import TaskCard from '@/app/components/TaskCard';
import ServiceRequestForm, { ServiceRequestData } from '@/app/components/ServiceRequestForm';
import { useAuth } from '@/app/hooks/useAuth';
import { getUnreadCount } from '@/app/lib/chat';
import { getClientJobs, setJobStatus, updateJob, type JobWithUsers } from '@/app/lib/jobs';
import { useTranslation } from '@/app/hooks/useTranslation';

type StatusTab = 'all' | 'open' | 'completed' | 'cancelled';

const OPEN_BUCKET_STATUSES: Array<JobWithUsers['status']> = [
  'open',
  'pending_confirmation',
  'confirmed',
  'in_progress',
];

function RequestsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFromUrl = searchParams.get('status') as StatusTab | null;
  
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<JobWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>(statusFromUrl || 'all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [editingJob, setEditingJob] = useState<JobWithUsers | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?role=client');
    }
  }, [authLoading, user, router]);

  // Update active tab when URL changes
  useEffect(() => {
    if (statusFromUrl && ['all', 'open', 'completed', 'cancelled'].includes(statusFromUrl)) {
      setActiveTab(statusFromUrl);
    }
  }, [statusFromUrl]);

  // Refresh unread count (for when returning from chat)
  const refreshUnreadCount = async () => {
    if (!user) return;
    try {
      const unread = await getUnreadCount(user.id);
      setUnreadMessagesCount(unread);
      setHasUnreadMessages(unread > 0);
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

  // Load jobs + unread count
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [clientJobs, unread] = await Promise.all([
          getClientJobs(user.id),
          getUnreadCount(user.id),
        ]);
        setJobs(clientJobs);
        setUnreadMessagesCount(unread);
        setHasUnreadMessages(unread > 0);
      } catch (e) {
        console.error('Error loading client requests:', e);
      } finally {
        setLoading(false);
      }
    };

    if (user) load();
  }, [user]);

  const statusCounts = useMemo(() => {
    const openCount = jobs.filter((j) => OPEN_BUCKET_STATUSES.includes(j.status)).length;
    const completedCount = jobs.filter((j) => j.status === 'completed').length;
    const cancelledCount = jobs.filter((j) => j.status === 'cancelled').length;
    return {
      all: jobs.length,
      open: openCount,
      completed: completedCount,
      cancelled: cancelledCount,
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const matchesTab = (job: JobWithUsers) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'open') return OPEN_BUCKET_STATUSES.includes(job.status);
      if (activeTab === 'completed') return job.status === 'completed';
      if (activeTab === 'cancelled') return job.status === 'cancelled';
      return true;
    };

    const list = jobs.filter(matchesTab);

    list.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [jobs, activeTab, sortOrder]);

  // Map category from request format to form format
  const mapCategoryToForm = (category: string): ServiceRequestData['category'] => {
    const categoryMap: Record<string, ServiceRequestData['category']> = {
      'Snow Removal': 'Seasonal & Miscellaneous',
      'Lawn Care': 'Outdoor & Garden Work',
      'Moving': 'Moving & Transport',
      'Gardening': 'Outdoor & Garden Work',
    };
    return categoryMap[category] || 'Other';
  };

  const handleEdit = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job && job.status === 'open') {
      setEditingJob(job);
    }
  };

  const handleEditSubmit = async (data: ServiceRequestData) => {
    if (!editingJob || !user) return;
    
    setIsSubmittingEdit(true);
    try {
      const updates = {
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        is_negotiable: data.isNegotiable,
        budget_min: data.isNegotiable ? null : (data.price ?? null),
        budget_max: data.isNegotiable ? null : (data.price ?? null),
      };

      const updated = await updateJob(editingJob.id, updates);
      if (!updated) throw new Error('Failed to update request');

      const refreshed = await getClientJobs(user.id);
      setJobs(refreshed);
      setEditingJob(null);
    } catch (error) {
      console.error('Error updating request:', error);
      alert(t('requests.updateFailed'));
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleCancel = async (jobId: string) => {
    if (!user) return;
    if (!confirm(t('requests.cancelConfirm'))) return;

    try {
      await setJobStatus(jobId, 'cancelled');
      const refreshed = await getClientJobs(user.id);
      setJobs(refreshed);
    } catch (e) {
      console.error('Error cancelling request:', e);
      alert(t('requests.cancelFailed'));
    }
  };

  const handleChat = (jobId: string) => {
    router.push(`/dashboard/client/messages/jobs/${jobId}`);
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <DashboardLayout
        userRole="client"
        userName={t('common.loadingUser')}
        hasUnreadMessages={hasUnreadMessages}
        unreadMessagesCount={unreadMessagesCount}
      >
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout
      userRole="client"
      userName={user.name}
      hasUnreadMessages={hasUnreadMessages}
      unreadMessagesCount={unreadMessagesCount}
    >
      <div 
        className="space-y-6 -mx-3 sm:-mx-4 lg:-mx-6 -my-4 -mb-28 px-3 sm:px-4 lg:px-6 pt-4 pb-32 relative min-h-screen bg-gray-50"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-black">{t('requests.title')}</h1>
          <button
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="text-sm text-violet-600 hover:text-violet-700 flex items-center space-x-1"
          >
            <span>
              {t('requests.sortBy')}{' '}
              {sortOrder === 'newest' ? t('requests.sort.newest') : t('requests.sort.oldest')}
            </span>
          </button>
        </div>

        {/* Status Filter - dropdown */}
        <div className="flex items-center">
          <select
            id="statusFilter"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as StatusTab)}
            className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            aria-label={t('requests.filter.aria')}
          >
            <option value="all">{t('status.all')} ({statusCounts.all})</option>
            <option value="open">{t('status.open')} ({statusCounts.open})</option>
            <option value="completed">{t('status.completed')} ({statusCounts.completed})</option>
            <option value="cancelled">{t('status.cancelled')} ({statusCounts.cancelled})</option>
          </select>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-black">{t('requests.empty')}</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                <TaskCard
                  task={{
                    id: job.id,
                    title: job.title,
                    description: job.description || '',
                    category: job.category || t('common.other'),
                    location: job.location || t('common.unknown'),
                    coordinates: job.latitude && job.longitude ? { lat: job.latitude, lng: job.longitude } : undefined,
                    date: job.due_date || job.created_at,
                    price: job.budget_max ?? job.budget_min ?? null,
                    isNegotiable: job.is_negotiable,
                    status: job.status,
                    postedAt: job.created_at,
                    providerName: job.provider?.name,
                    providerId: job.provider?.id,
                    providerCompletedRequests: job.provider?.completed_requests,
                  }}
                  currentUserId={user.id}
                  currentUserRole="client"
                  hideUserInfo
                  onChatClick={() => handleChat(job.id)}
                  chatButtonLabel={t('requests.chat.view')}
                  onEdit={() => handleEdit(job.id)}
                  onCancel={() => handleCancel(job.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Request Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-black">{t('requests.edit.title')}</h2>
              <button
                onClick={() => setEditingJob(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <ServiceRequestForm
              onSubmit={handleEditSubmit}
              isSubmitting={isSubmittingEdit}
              initialData={{
                title: editingJob.title,
                category: mapCategoryToForm(editingJob.category || 'Other'),
                description: editingJob.description || '',
                location: editingJob.location || '',
                latitude: editingJob.latitude ?? undefined,
                longitude: editingJob.longitude ?? undefined,
                price: editingJob.budget_max ?? editingJob.budget_min ?? null,
                isNegotiable: editingJob.is_negotiable,
              }}
              submitButtonText={t('requests.edit.submit')}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div></div>}>
      <RequestsPageContent />
    </Suspense>
  );
}