'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/app/components/DashboardLayout';
import ChatInterface from '@/app/components/ChatInterface';
import TaskDetailModal from '@/app/components/TaskDetailModal';
import { useAuth } from '@/app/hooks/useAuth';
import { 
  getChatThread, 
  getMessagesForTask, 
  sendMessage, 
  subscribeToMessages,
  markMessagesAsRead,
  Message 
} from '@/app/lib/chat';
import { getJobById } from '@/app/lib/jobs';
import { createReview } from '@/app/lib/reviews';
import { Order, getOrdersForThread, markOrderPaid, completeOrder } from '@/app/lib/orders';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

export default function ClientChatPage() {
  const router = useRouter();
  const params = useParams<{ threadId: string }>();
  const threadId = params?.threadId;
  const { user, loading: authLoading, refresh: refreshAuth } = useAuth();

  const [thread, setThread] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Load chat data
  useEffect(() => {
    const loadData = async () => {
      if (!threadId || !user) return;
      
      try {
        // Get the chat thread
        const chatThread = await getChatThread(threadId);
        if (!chatThread) {
          console.error('Thread not found');
          setLoading(false);
          return;
        }
        setThread(chatThread);

        // Get the job details
        const jobData = await getJobById(chatThread.job_id);
        setJob(jobData);

        // Get messages for this job
        const jobMessages = await getMessagesForTask(chatThread.job_id);
        
        // Transform messages for ChatInterface
        const transformedMessages = jobMessages.map(msg => ({
          id: msg.id,
          senderId: msg.sender_id,
          senderName: msg.sender?.name || 'User',
          content: msg.content,
          imageUrl: msg.image_url,
          timestamp: msg.created_at,
        }));
        setMessages(transformedMessages);

        // Mark messages as read
        await markMessagesAsRead(chatThread.job_id, user.id);

        // Get orders for this thread
        const threadOrders = await getOrdersForThread(chatThread.job_id);
        // Transform orders for ChatInterface
        const transformedOrders = threadOrders.map(order => ({
          id: order.id,
          threadId: chatThread.id,
          taskId: order.job_id,
          clientId: order.client_id,
          providerId: order.provider_id,
          title: order.title,
          location: order.location || '',
          dateTimeISO: order.date_time || new Date().toISOString(),
          priceEur: order.price_eur,
          status: order.status,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
        }));
        setOrders(transformedOrders as Order[]);
      } catch (error) {
        console.error('Error loading chat data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && threadId) {
      loadData();
    }
  }, [threadId, user]);

  // Subscribe to new messages
  useEffect(() => {
    if (!thread?.job_id) return;

    const unsubscribe = subscribeToMessages(thread.job_id, (newMessage: Message) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === newMessage.id)) return prev;
        
        return [...prev, {
          id: newMessage.id,
          senderId: newMessage.sender_id,
          senderName: 'User',
          content: newMessage.content,
          imageUrl: newMessage.image_url,
          timestamp: newMessage.created_at,
        }];
      });
    });

    return () => unsubscribe();
  }, [thread?.job_id]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (content: string, imageUrl?: string) => {
    if (!user || !thread) return;

    try {
      await sendMessage({
        job_id: thread.job_id,
        sender_id: user.id,
        content,
        image_url: imageUrl,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  }, [user, thread]);

  // Handle submitting a review
  const handleSubmitReview = async () => {
    if (!user || !thread || !job) return;

    try {
      // Submit review via API (which will mark job as complete)
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          clientId: user.id,
          providerId: thread.provider_id,
          rating: reviewRating,
          comment: reviewText || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }

      // Refresh job data to get updated status
      const updatedJob = await getJobById(job.id);
      if (updatedJob) {
        setJob(updatedJob);
      }

      setShowReviewModal(false);
      setReviewRating(5);
      setReviewText('');
      // Refresh auth profile so completed_requests updates in the UI after DB trigger runs
      await refreshAuth();
      alert('Review submitted successfully! The job has been marked as completed.');
      // Ensure any cached data/UI is refreshed
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to submit review');
    }
  };

  // Show loading state
  if (authLoading || loading) {
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

  // Thread not found
  if (!thread || !job) {
    return (
      <DashboardLayout userRole="client" userName={user.name}>
        <div className="max-w-3xl mx-auto p-4">
          <div className="text-center text-gray-500">
            <p>Conversation not found</p>
            <button 
              onClick={() => router.push('/dashboard/client/messages')}
              className="mt-4 text-violet-600 hover:text-violet-700"
            >
              ← Back to messages
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Get provider info from thread or job
  const providerName = thread.provider?.name || job.provider?.name || 'Provider';
  const providerId = thread.provider_id || job.provider_id;
  const providerCompletedRequests = thread.provider?.completed_requests || job.provider?.completed_requests || 0;
  const providerPhone = thread.provider?.phone || job.provider?.phone;

  return (
    <DashboardLayout
      userRole="client"
      userName={user.name}
      hideMobileNav
      backgroundClassName="bg-gradient-to-b from-violet-600 via-violet-700 to-indigo-800"
      mainBackgroundClassName="bg-gradient-to-b from-violet-600 via-violet-700 to-indigo-800"
      contentClassName="w-full px-0 py-0 min-h-full"
    >
      <div className="w-full">
        <ChatInterface
          taskId={job.id}
          taskTitle={job.title}
          taskDescription={job.description || ''}
          taskStatus={job.status === 'completed' ? 'completed' : 'open'}
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUserId={user.id}
          currentUserName={user.name}
          currentUserRole="client"
          currentUserCompletedRequests={user.completed_requests}
          otherUserId={providerId}
          otherUserName={providerName}
          otherUserRole="provider"
          otherUserCompletedRequests={providerCompletedRequests}
          otherUserImageUrl={thread.provider?.avatar_url || job.provider?.avatar_url}
          otherUserPhone={providerPhone}
          orders={orders}
          onBack={() => router.back()}
          onTaskClick={() => setShowTaskModal(true)}
          onMarkTaskCompleted={
            job.status === 'open'
              ? () => {
                  setShowReviewModal(true);
                }
              : undefined
          }
          onPayOrder={async (orderId) => {
            const updated = await markOrderPaid(orderId);
            if (updated) {
              setOrders(prev => prev.map(o => (o.id === updated.id ? { ...o, status: updated.status } : o)));
            }
          }}
          onCompleteOrder={async (orderId) => {
            const updated = await completeOrder(orderId);
            if (updated) {
              setOrders(prev => prev.map(o => (o.id === updated.id ? { ...o, status: updated.status } : o)));
            }
          }}
        />
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[10050]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-5">
              <h3 className="text-lg font-semibold text-black">Write a review</h3>
              <p className="mt-1 text-sm text-black">For {providerName}</p>
              <div className="mt-3">
                <label className="block text-sm font-medium text-black mb-1">Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(n => {
                    const filled = n <= reviewRating;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewRating(n)}
                        aria-label={`Rate ${n}`}
                        className="p-0.5"
                      >
                        {filled ? (
                          <StarIconSolid className="h-6 w-6 text-yellow-400" />
                        ) : (
                          <StarIconOutline className="h-6 w-6 text-gray-300" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-black mb-1">Comment (optional)</label>
                <textarea
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this provider…"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-3 py-2 rounded-md border border-gray-200 text-sm text-black hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="px-4 py-2 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskModal && job && (
        <TaskDetailModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          task={{
            id: job.id,
            title: job.title,
            description: job.description || '',
            category: job.category || 'General',
            location: job.location || 'Approximate area',
            coordinates:
              job.latitude != null && job.longitude != null
                ? { lat: job.latitude, lng: job.longitude }
                : undefined,
            date: job.due_date || job.created_at,
            price: job.budget_max || job.budget_min || 0,
            status: job.status === 'completed' ? 'completed' : 'open',
            images: job.images || [],
            providerName: providerName,
            providerId: providerId,
            providerCompletedRequests: providerCompletedRequests,
            postedAt: job.created_at,
          }}
          currentUserRole="client"
          onChatClick={() => setShowTaskModal(false)}
        />
      )}
    </DashboardLayout>
  );
}
