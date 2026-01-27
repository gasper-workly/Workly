import { createClient } from './supabase/client';
import type { Message, ChatThread, Profile, Job } from '@/types/database';

export type { Message };

export interface ChatThreadWithDetails extends ChatThread {
  job?: Job;
  client?: Profile;
  provider?: Profile;
  last_message?: Message;
}

export interface MessageWithSender extends Message {
  sender?: Profile;
}

// Get messages for a job/chat thread
export async function getMessagesForTask(jobId: string): Promise<MessageWithSender[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(*)
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return (data || []) as MessageWithSender[];
}

// Get chat threads for a user
export async function getChatThreads(userId: string): Promise<ChatThreadWithDetails[]> {
  const supabase = createClient();
  
  // Use a single query with joins instead of N+1 queries
  const { data: threads, error } = await supabase
    .from('chat_threads')
    .select(`
      *,
      job:jobs(*),
      client:profiles!chat_threads_client_id_fkey(*),
      provider:profiles!chat_threads_provider_id_fkey(*)
    `)
    .or(`client_id.eq.${userId},provider_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error fetching chat threads:', error.message, error.details, error.hint);
    return [];
  }

  if (!threads || threads.length === 0) {
    return [];
  }

  // Get last messages for all threads in one query instead of N queries
  // We fetch more than needed and filter in JS since Supabase doesn't support DISTINCT ON easily
  const jobIds = threads.map((t: { job_id: string }) => t.job_id);
  const { data: lastMessages } = await supabase
    .from('messages')
    .select('job_id, id, sender_id, content, image_url, created_at')
    .in('job_id', jobIds)
    .order('created_at', { ascending: false })
    .limit(jobIds.length * 10); // Limit to reasonable amount (10 messages per job max)

  // Group messages by job_id and get the first (most recent) for each
  const messagesByJob = new Map<string, Message>();
  lastMessages?.forEach((msg: { job_id: string; id: string; sender_id: string; content: string; image_url: string | null; created_at: string }) => {
    if (!messagesByJob.has(msg.job_id)) {
      messagesByJob.set(msg.job_id, msg as Message);
    }
  });

  // Combine threads with their last messages
  return threads.map((thread: { job_id: string }) => ({
    ...thread,
    last_message: messagesByJob.get(thread.job_id),
  })) as ChatThreadWithDetails[];
}

// Get a specific chat thread
export async function getChatThread(threadId: string): Promise<ChatThreadWithDetails | null> {
  const supabase = createClient();
  
  // First get the basic thread
  const { data: thread, error } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('id', threadId)
    .single();

  if (error || !thread) {
    console.error('Error fetching chat thread:', error);
    return null;
  }

  // Get related data separately (works better with RLS)
  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', thread.job_id)
    .single();

  const { data: client } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', thread.client_id)
    .single();

  const { data: provider } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', thread.provider_id)
    .single();

  return {
    ...thread,
    job: job || undefined,
    client: client || undefined,
    provider: provider || undefined,
  } as ChatThreadWithDetails;
}

// Get chat thread by job ID
export async function getChatThreadByJobId(jobId: string): Promise<ChatThreadWithDetails | null> {
  const supabase = createClient();
  
  // First get the basic thread
  const { data: thread, error } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('job_id', jobId)
    .single();

  if (error || !thread) {
    // Thread doesn't exist yet
    return null;
  }

  // Get related data separately
  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', thread.job_id)
    .single();

  const { data: client } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', thread.client_id)
    .single();

  const { data: provider } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', thread.provider_id)
    .single();

  return {
    ...thread,
    job: job || undefined,
    client: client || undefined,
    provider: provider || undefined,
  } as ChatThreadWithDetails;
}

// Send a message
export async function sendMessage(message: {
  job_id: string;
  sender_id: string;
  content: string;
  image_url?: string;
}): Promise<Message> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      job_id: message.job_id,
      sender_id: message.sender_id,
      content: message.content,
      image_url: message.image_url || null,
    })
    .select()
    .single();

  if (error) {
    const anyErr = error as unknown as { message?: string; details?: string; hint?: string; code?: string };
    const parts = [
      anyErr.message || 'Unknown error',
      anyErr.code ? `code=${anyErr.code}` : null,
      anyErr.details ? `details=${anyErr.details}` : null,
      anyErr.hint ? `hint=${anyErr.hint}` : null,
    ].filter(Boolean);
    throw new Error(parts.join(' | '));
  }

  return data as Message;
}

// Create a chat thread (when starting a conversation)
export async function createChatThread(thread: {
  job_id: string;
  client_id: string;
  provider_id: string;
}): Promise<ChatThread> {
  const supabase = createClient();
  
  // Check if thread already exists
  const { data: existing } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('job_id', thread.job_id)
    .single();

  if (existing) {
    return existing as ChatThread;
  }

  const { data, error } = await supabase
    .from('chat_threads')
    .insert(thread)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ChatThread;
}

// Mark messages as read
export async function markMessagesAsRead(jobId: string, userId: string): Promise<void> {
  const supabase = createClient();
  
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('job_id', jobId)
    .neq('sender_id', userId);
}

// Get unread message count for a user (total across all threads)
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient();
  
  // Get all threads where user is a participant
  const { data: threads } = await supabase
    .from('chat_threads')
    .select('job_id')
    .or(`client_id.eq.${userId},provider_id.eq.${userId}`);

  if (!threads || threads.length === 0) {
    return 0;
  }

  const jobIds = threads.map((t: { job_id: string }) => t.job_id);
  
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('job_id', jobIds)
    .neq('sender_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }

  return count || 0;
}

// Get unread message count for a specific job/thread
export async function getUnreadCountForJob(jobId: string, userId: string): Promise<number> {
  const supabase = createClient();
  
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('job_id', jobId)
    .neq('sender_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error getting unread count for job:', error);
    return 0;
  }

  return count || 0;
}

// Get unread message count from a specific sender (used for per-provider unread in client view)
export async function getUnreadCountFromSender(jobId: string, senderId: string): Promise<number> {
  const supabase = createClient();
  
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('job_id', jobId)
    .eq('sender_id', senderId)
    .eq('is_read', false);

  if (error) {
    console.error('Error getting unread count from sender:', error);
    return 0;
  }

  return count || 0;
}

// Subscribe to new messages in real-time
export function subscribeToMessages(
  jobId: string,
  callback: (message: Message) => void
) {
  const supabase = createClient();
  
  const channel = supabase
    .channel(`messages:${jobId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `job_id=eq.${jobId}`,
      },
      (payload: { new: Record<string, unknown> }) => {
        callback(payload.new as unknown as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Subscribe to chat thread updates
export function subscribeToChatThreads(
  userId: string,
  callback: (thread: ChatThread) => void
) {
  const supabase = createClient();
  
  const channel = supabase
    .channel(`threads:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_threads',
      },
      async (payload: { new: Record<string, unknown> }) => {
        const thread = payload.new as unknown as ChatThread;
        // Only notify if user is a participant
        if (thread.client_id === userId || thread.provider_id === userId) {
          callback(thread);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Legacy compatibility functions
export function markHasUnreadMessages(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hasUnreadMessages', 'true');
  }
}

export function clearUnreadMessages(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hasUnreadMessages', 'false');
  }
}

export function checkHasUnreadMessages(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('hasUnreadMessages') === 'true';
  }
  return false;
}
