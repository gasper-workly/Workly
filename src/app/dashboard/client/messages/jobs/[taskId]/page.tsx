'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/app/components/DashboardLayout';
import UserAvatar from '@/app/components/UserAvatar';
import { useAuth } from '@/app/hooks/useAuth';
import { getChatThreads, getUnreadCountFromSender, ChatThreadWithDetails } from '@/app/lib/chat';
import { useTranslation } from '@/app/hooks/useTranslation';

type ProviderThread = {
  threadId: string;
  providerId: string;
  providerName: string;
  providerCompletedRequests: number;
  providerAvatarUrl?: string;
  lastMessage?: string;
  lastMessageAt: string;
  unreadCount: number;
};

export default function ClientJobConversationsPage() {
  const router = useRouter();
  const params = useParams<{ taskId: string }>();
  const taskId = params?.taskId as string;
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useTranslation();
  const [jobTitle, setJobTitle] = useState('');
  const [threads, setThreads] = useState<ProviderThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user || !taskId) return;
      
      try {
        const allThreads = await getChatThreads(user.id);
        // Filter threads for this specific job
        const filtered = allThreads.filter((thread) => thread.job_id === taskId);
        
        if (filtered.length > 0) {
          setJobTitle(filtered[0]?.job?.title || t('messages.job.untitledJob'));
        }
        
        // Fetch unread counts for each provider in parallel
        const unreadCounts = await Promise.all(
          filtered.map((thread) => getUnreadCountFromSender(thread.job_id, thread.provider_id))
        );
        
        // Map to provider threads with unread counts
        const mapped: ProviderThread[] = filtered.map((thread, index) => ({
          threadId: thread.id,
          providerId: thread.provider_id,
          providerName: thread.provider?.name || t('messages.job.providerFallback'),
          providerCompletedRequests: thread.provider?.completed_requests || 0,
          providerAvatarUrl: thread.provider?.avatar_url,
          lastMessage: thread.last_message?.content,
          lastMessageAt: thread.last_message_at,
          unreadCount: unreadCounts[index],
        }));
        
        // Sort by last message time (most recent first)
        mapped.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        
        setThreads(mapped);
      } catch (error) {
        console.error('Error loading job conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && taskId) {
      load();
    }
  }, [user, taskId]);

  const openThread = (threadId: string) => {
    router.push(`/dashboard/client/messages/${threadId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'sl' ? 'sl-SI' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Show loading state
  if (authLoading) {
    return (
      <DashboardLayout userRole="client" userName="Loading...">
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

  return (
    <DashboardLayout userRole="client" userName={user.name}>
      <div 
        className="space-y-6 -mx-3 sm:-mx-4 lg:-mx-6 -my-4 -mb-28 px-3 sm:px-4 lg:px-6 pt-4 pb-32 relative min-h-screen bg-gray-50"
      >
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-300">
            <button
              onClick={() => router.back()}
              className="text-sm text-violet-600 hover:text-violet-700 mb-2"
            >
              {t('messages.job.back')}
            </button>
            <h2 className="text-lg font-semibold text-black">{jobTitle || t('messages.job.conversationsTitle')}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {threads.length}{' '}
              {threads.length === 1
                ? t('messages.job.providersMessagedSingular')
                : t('messages.job.providersMessaged')}
            </p>
          </div>
          <div className="divide-y divide-gray-300">
            {loading ? (
              <div className="p-6 text-center text-black">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600 mx-auto mb-2"></div>
                {t('common.loading')}
              </div>
            ) : threads.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>{t('messages.job.empty.title')}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {t('messages.job.empty.subtitle')}
                </p>
              </div>
            ) : (
              threads.map((thread) => (
                <button
                  key={thread.threadId}
                  onClick={() => openThread(thread.threadId)}
                  className="w-full p-4 text-left hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      name={thread.providerName}
                      role="provider"
                      completedRequests={thread.providerCompletedRequests}
                      size="sm"
                      imageUrl={thread.providerAvatarUrl}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-black truncate">{thread.providerName}</p>
                          {thread.lastMessage && (
                            <p className="text-sm text-gray-600 truncate mt-1">{thread.lastMessage}</p>
                          )}
                          <p className="text-xs text-violet-600 mt-1">
                            {thread.providerCompletedRequests}{' '}
                            {thread.providerCompletedRequests === 1
                              ? t('common.completedRequestsSingular')
                              : t('common.completedRequestsPlural')}
                          </p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1.5">
                          <p className="text-xs text-gray-500">
                            {formatDate(thread.lastMessageAt)}
                          </p>
                          {thread.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs leading-none font-semibold bg-violet-600 text-white shadow-sm">
                              {thread.unreadCount > 9 ? '+9 new' : `${thread.unreadCount} new`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
