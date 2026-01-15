import { createClient } from './supabase/client';
import type { Order, OrderStatus, Profile, Job } from '@/types/database';

export type { OrderStatus };

export interface OrderWithDetails extends Order {
  job?: Job;
  client?: Profile;
  provider?: Profile;
}

export interface EarningsEvent {
  dateISO: string;
  amountEur: number;
}

// For backward compatibility with existing code
export type { Order };

// Get orders for a specific job/thread
export async function getOrdersForThread(jobId: string): Promise<OrderWithDetails[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      job:jobs(*),
      client:profiles!orders_client_id_fkey(*),
      provider:profiles!orders_provider_id_fkey(*)
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return (data || []) as OrderWithDetails[];
}

// Get orders for a client
export async function getClientOrders(clientId: string): Promise<OrderWithDetails[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      job:jobs(*),
      provider:profiles!orders_provider_id_fkey(*)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client orders:', error);
    return [];
  }

  return (data || []) as OrderWithDetails[];
}

// Get orders for a provider
export async function getProviderOrders(providerId: string): Promise<OrderWithDetails[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      job:jobs(*),
      client:profiles!orders_client_id_fkey(*)
    `)
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching provider orders:', error);
    return [];
  }

  return (data || []) as OrderWithDetails[];
}

// Get completed orders for a provider (used for earnings)
export async function getProviderCompletedOrders(providerId: string): Promise<OrderWithDetails[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      job:jobs(*),
      client:profiles!orders_client_id_fkey(*)
    `)
    .eq('provider_id', providerId)
    .eq('status', 'completed')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching provider completed orders:', error);
    return [];
  }

  return (data || []) as OrderWithDetails[];
}

// Sum of completed-order earnings for a provider
export async function getProviderTotalEarningsEur(providerId: string): Promise<number> {
  const completed = await getProviderCompletedOrders(providerId);
  return completed.reduce((sum, o) => sum + (o.price_eur || 0), 0);
}

// Earnings events for charts (date = order updated_at when it was completed)
export async function getProviderEarningsEvents(providerId: string): Promise<EarningsEvent[]> {
  const completed = await getProviderCompletedOrders(providerId);
  return completed.map((o) => ({
    dateISO: o.updated_at || o.created_at,
    amountEur: o.price_eur || 0,
  }));
}

// Create a new order (provider creates an offer)
export async function createOrder(input: {
  job_id: string;
  client_id: string;
  provider_id: string;
  title: string;
  location?: string;
  date_time?: string;
  price_eur: number;
}): Promise<Order> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('orders')
    .insert({
      job_id: input.job_id,
      client_id: input.client_id,
      provider_id: input.provider_id,
      title: input.title,
      location: input.location || null,
      date_time: input.date_time || null,
      price_eur: input.price_eur,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Order;
}

// Update order status
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    return null;
  }

  return data as Order;
}

// Accept an order (client accepts provider's offer)
export async function acceptOrder(orderId: string): Promise<Order | null> {
  return updateOrderStatus(orderId, 'accepted');
}

// Decline an order
export async function declineOrder(orderId: string): Promise<Order | null> {
  return updateOrderStatus(orderId, 'declined');
}

// Mark order as paid (and start work)
export async function markOrderPaid(orderId: string, stripePaymentIntentId?: string): Promise<Order | null> {
  const supabase = createClient();
  
  const updates: { status: OrderStatus; stripe_payment_intent_id?: string } = {
    status: 'paid',
  };
  
  if (stripePaymentIntentId) {
    updates.stripe_payment_intent_id = stripePaymentIntentId;
  }
  
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error marking order as paid:', error);
    return null;
  }

  // Also update to in_progress
  return updateOrderStatus(orderId, 'in_progress');
}

// Complete an order
export async function completeOrder(orderId: string): Promise<Order | null> {
  return updateOrderStatus(orderId, 'completed');
}

// Cancel an order
export async function cancelOrder(orderId: string): Promise<Order | null> {
  return updateOrderStatus(orderId, 'cancelled');
}

// Get order by ID
export async function getOrderById(orderId: string): Promise<OrderWithDetails | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      job:jobs(*),
      client:profiles!orders_client_id_fkey(*),
      provider:profiles!orders_provider_id_fkey(*)
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data as OrderWithDetails;
}

// Subscribe to order updates in real-time
export function subscribeToOrders(
  jobId: string,
  callback: (order: Order) => void
) {
  const supabase = createClient();
  
  const channel = supabase
    .channel(`orders:${jobId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `job_id=eq.${jobId}`,
      },
      (payload) => {
        callback(payload.new as Order);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
