'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Order, getOrdersForThread, acceptOrder, declineOrder } from '@/app/lib/orders';

export default function ProviderChatPage() {
  const router = useRouter();
  const params = useParams<{ threadId: string }>();
  const threadId = params?.threadId;
  const { user, loading: authLoading } = useAuth();

  const [thread, setThread] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
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
          senderName: 'User', // Will be fetched properly
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
      // Message will be added via subscription
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  }, [user, thread]);

  // Show loading state
  if (authLoading || loading) {
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

  // Thread not found
  if (!thread || !job) {
    return (
      <DashboardLayout userRole="provider" userName={user.name}>
        <div className="max-w-3xl mx-auto p-4">
          <div className="text-center text-gray-500">
            <p>Conversation not found</p>
            <button 
              onClick={() => router.push('/dashboard/provider/messages')}
              className="mt-4 text-violet-600 hover:text-violet-700"
            >
              ← Back to messages
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Get client info from thread or job
  const clientName = thread.client?.name || job.client?.name || 'Client';
  const clientId = thread.client_id || job.client_id;
  const clientCompletedRequests = thread.client?.completed_requests || job.client?.completed_requests || 0;

  return (
    <DashboardLayout
      userRole="provider"
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
          currentUserRole="provider"
          currentUserCompletedRequests={user.completed_requests}
          otherUserId={clientId}
          otherUserName={clientName}
          otherUserRole="client"
          otherUserCompletedRequests={clientCompletedRequests}
          otherUserImageUrl={thread.client?.avatar_url || job.client?.avatar_url}
          orders={orders}
          onBack={() => router.back()}
          onTaskClick={() => setShowTaskModal(true)}
          onAcceptOrder={async (orderId) => {
            const updated = await acceptOrder(orderId);
            if (updated) {
              setOrders(prev => prev.map(o => (o.id === updated.id ? { ...o, status: updated.status } : o)));
            }
          }}
          onDeclineOrder={async (orderId) => {
            const updated = await declineOrder(orderId);
            if (updated) {
              setOrders(prev => prev.map(o => (o.id === updated.id ? { ...o, status: updated.status } : o)));
            }
          }}
        />
      </div>
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
            clientName: clientName,
            clientId: clientId,
            clientCompletedRequests: clientCompletedRequests,
            postedAt: job.created_at,
          }}
          currentUserRole="provider"
          onChatClick={() => setShowTaskModal(false)}
        />
      )}
    </DashboardLayout>
  );
}
