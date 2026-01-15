'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/DashboardLayout';
import UserAvatar from '@/app/components/UserAvatar';
import { useAuth } from '@/app/hooks/useAuth';
import { getChatThreads, clearUnreadMessages, getUnreadCountForJob, ChatThreadWithDetails } from '@/app/lib/chat';
import { useTranslation } from '@/app/hooks/useTranslation';

type ConversationItem = {
  threadId: string;
  jobId: string;
  jobTitle: string;
  jobStatus: string;
  clientName: string;
  clientId: string;
  clientCompletedRequests: number;
  clientAvatarUrl?: string;
  lastMessage?: string;
  lastMessageAt: string;
  unreadCount: number;
};

export default function ProviderMessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Clear unread messages flag when viewing messages
  useEffect(() => {
    clearUnreadMessages();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      
      try {
        const threads = await getChatThreads(user.id);
        
        // Fetch unread counts for all threads in parallel
        const unreadCounts = await Promise.all(
          threads.map(thread => getUnreadCountForJob(thread.job_id, user.id))
        );
        
        // Transform threads to conversation items with real unread counts
        const items: ConversationItem[] = threads.map((thread: ChatThreadWithDetails, index: number) => ({
          threadId: thread.id,
          jobId: thread.job_id,
          jobTitle: thread.job?.title || 'Untitled Job',
          jobStatus: thread.job?.status || 'open',
          clientName: thread.client?.name || 'Client',
          clientId: thread.client_id,
          clientCompletedRequests: thread.client?.completed_requests || 0,
          clientAvatarUrl: thread.client?.avatar_url || undefined,
          lastMessage: thread.last_message?.content,
          lastMessageAt: thread.last_message_at,
          unreadCount: unreadCounts[index],
        }));
        
        setConversations(items);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      load();
    }
  }, [user]);

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

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending_confirmation':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'open':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleThreadClick = (threadId: string) => {
    router.push(`/dashboard/provider/messages/${threadId}`);
  };

  // Show loading state
  if (authLoading) {
    return (
      <DashboardLayout userRole="provider" userName="Loading...">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Redirect if not logged in
  if (!user) {
    router.push('/login?role=provider');
    return null;
  }

  return (
    <DashboardLayout userRole="provider" userName={user.name}>
      <div 
        className="space-y-6 -mx-3 sm:-mx-4 lg:-mx-6 -my-4 -mb-28 px-3 sm:px-4 lg:px-6 pt-4 pb-32 relative min-h-screen bg-gray-50"
      >
        {/* Messages List */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-black">{t('messages.provider.title')}</h2>
          </div>
          <div className="divide-y divide-gray-300">
            {loading ? (
              <div className="p-6 text-center text-black">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600 mx-auto mb-2"></div>
                {t('common.loading')}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500 mb-2">{t('messages.provider.empty.title')}</p>
                <p className="text-sm text-gray-400">
                  {t('messages.provider.empty.subtitle')}
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
              <button
                  key={conv.threadId}
                  onClick={() => handleThreadClick(conv.threadId)}
                className="relative w-full p-4 text-left hover:bg-gray-50 focus:outline-none transition-colors duration-200"
              >
                <p className="absolute top-4 right-4 text-xs text-gray-500">
                  {formatDate(conv.lastMessageAt)}
                </p>
                <div className="flex items-start gap-3">
                  <UserAvatar
                      name={conv.clientName}
                    role="client"
                      completedRequests={conv.clientCompletedRequests}
                    size="sm"
                    imageUrl={conv.clientAvatarUrl}
                  />
                  <div className="flex-1 min-w-0 pr-20">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-black truncate">
                        {conv.clientName}
                      </p>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className="text-sm text-violet-600 truncate flex-1 min-w-0">
                        {conv.jobTitle}
                      </p>
                    </div>
                      {conv.lastMessage && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{conv.lastMessage}</p>
                      )}
                    <div className="mt-1 flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(conv.jobStatus)}`}>
                          {conv.jobStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs leading-none font-semibold bg-violet-600 text-white shadow-sm">
                    {conv.unreadCount > 9 ? '+9 new' : `${conv.unreadCount} new`}
                  </span>
                )}
              </button>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 
