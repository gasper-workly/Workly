'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useAuth } from '@/app/hooks/useAuth';
import { getChatThreads, clearUnreadMessages, getUnreadCountForJob, ChatThreadWithDetails } from '@/app/lib/chat';
import { useTranslation } from '@/app/hooks/useTranslation';

type JobGroup = {
  jobId: string;
  jobTitle: string;
  providerCount: number;
  lastMessageAt: string;
  unreadCount: number;
};

export default function ClientMessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useTranslation();
  const [jobGroups, setJobGroups] = useState<JobGroup[]>([]);
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
        
        // Group threads by job_id
        const groupedByJob: Record<string, ChatThreadWithDetails[]> = {};
        for (const thread of threads) {
          const jobId = thread.job_id;
          if (!groupedByJob[jobId]) {
            groupedByJob[jobId] = [];
          }
          groupedByJob[jobId].push(thread);
        }
        
        // Create job groups - each thread represents a unique provider who contacted about this job
        const jobEntries = Object.entries(groupedByJob);
        
        // Fetch unread counts for all jobs in parallel
        const unreadCounts = await Promise.all(
          jobEntries.map(([jobId]) => getUnreadCountForJob(jobId, user.id))
        );
        
        const groups: JobGroup[] = jobEntries.map(([jobId, jobThreads], index) => {
          // Get job title from first thread
          const jobTitle = jobThreads[0]?.job?.title || 'Untitled Job';
          
          // Get the most recent last_message_at
          const lastMessageAt = jobThreads.reduce((latest, thread) => {
            const threadDate = new Date(thread.last_message_at);
            return threadDate > latest ? threadDate : latest;
          }, new Date(0)).toISOString();
          
          return {
            jobId,
            jobTitle,
            providerCount: jobThreads.length, // Number of providers who messaged
            lastMessageAt,
            unreadCount: unreadCounts[index],
          };
        });
        
        // Sort by last message time (most recent first)
        groups.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        
        setJobGroups(groups);
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

  const handleJobClick = (jobId: string) => {
    router.push(`/dashboard/client/messages/jobs/${jobId}`);
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
        {/* Messages grouped by Job */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-black">{t('messages.byRequest.title')}</h2>
          </div>
          <div className="divide-y divide-gray-300">
            {loading ? (
              <div className="p-6 text-center text-black">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600 mx-auto mb-2"></div>
                {t('common.loading')}
              </div>
            ) : jobGroups.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500 mb-2">{t('messages.byRequest.empty.title')}</p>
                <p className="text-sm text-gray-400">
                  {t('messages.byRequest.empty.subtitle')}
                </p>
              </div>
            ) : (
              jobGroups.map((group) => (
                <button
                  key={group.jobId}
                  onClick={() => handleJobClick(group.jobId)}
                  className="w-full p-4 text-left hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-black truncate">
                        {group.jobTitle}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {group.providerCount}{' '}
                        {group.providerCount === 1
                          ? t('messages.byRequest.providersInterestedSingular')
                          : t('messages.byRequest.providersInterested')}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <span className="text-xs text-gray-400">
                        {new Date(group.lastMessageAt).toLocaleDateString()}
                      </span>
                      {group.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs leading-none font-semibold bg-violet-600 text-white shadow-sm">
                          {group.unreadCount > 9 ? '+9 new' : `${group.unreadCount} new`}
                        </span>
                      )}
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
