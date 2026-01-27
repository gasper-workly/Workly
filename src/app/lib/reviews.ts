import { createClient } from './supabase/client';
import type { Review, Profile, Job } from '@/types/database';

export type { Review };

export interface ReviewWithDetails extends Review {
  job?: Job;
  client?: Profile;
  provider?: Profile;
}

// Unread review count for provider (based on profiles.last_seen_reviews_at)
export async function getUnreadReviewsCount(providerId: string): Promise<number> {
  const supabase = createClient();

  // Fetch last seen timestamp
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('last_seen_reviews_at')
    .eq('id', providerId)
    .single();

  if (profileError) {
    console.error('Error fetching last_seen_reviews_at:', profileError);
    return 0;
  }

  const lastSeen = (profile as { last_seen_reviews_at?: string | null })?.last_seen_reviews_at ?? null;
  if (!lastSeen) return 0;

  const { count, error } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('provider_id', providerId)
    .gt('created_at', lastSeen);

  if (error) {
    console.error('Error fetching unread reviews count:', error);
    return 0;
  }

  return count || 0;
}

// Mark reviews as seen for provider (updates profiles.last_seen_reviews_at)
export async function markReviewsSeen(providerId: string): Promise<void> {
  const supabase = createClient();
  const nowIso = new Date().toISOString();

  const { error } = await supabase
    .from('profiles')
    .update({ last_seen_reviews_at: nowIso })
    .eq('id', providerId);

  if (error) {
    console.error('Error marking reviews seen:', error);
  }
}

// Create a new review
export async function createReview(input: {
  job_id: string;
  client_id: string;
  provider_id: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const supabase = createClient();
  
  // Check if review already exists for this job
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('job_id', input.job_id)
    .eq('client_id', input.client_id)
    .single();

  if (existing) {
    throw new Error('You have already reviewed this job.');
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      job_id: input.job_id,
      client_id: input.client_id,
      provider_id: input.provider_id,
      rating: input.rating,
      comment: input.comment || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Review;
}

// Get reviews for a provider
export async function getProviderReviews(providerId: string): Promise<ReviewWithDetails[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      job:jobs(*),
      client:profiles!reviews_client_id_fkey(*)
    `)
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching provider reviews:', error);
    return [];
  }

  return (data || []) as ReviewWithDetails[];
}

// Get review for a specific job
export async function getJobReview(jobId: string): Promise<Review | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('job_id', jobId)
    .single();

  if (error) {
    // No review exists
    return null;
  }

  return data as Review;
}

// Get all reviews by a client
export async function getClientReviews(clientId: string): Promise<ReviewWithDetails[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      job:jobs(*),
      provider:profiles!reviews_provider_id_fkey(*)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client reviews:', error);
    return [];
  }

  return (data || []) as ReviewWithDetails[];
}

// Calculate average rating for a provider
export function getAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

// Get provider stats (total reviews, average rating)
export async function getProviderStats(providerId: string): Promise<{
  totalReviews: number;
  averageRating: number;
}> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('provider_id', providerId);

  if (error || !data || data.length === 0) {
    return { totalReviews: 0, averageRating: 0 };
  }

  const totalReviews = data.length;
  const averageRating = getAverageRating(data as Review[]);

  return { totalReviews, averageRating };
}

// Update a review (only if client owns it)
export async function updateReview(
  reviewId: string,
  clientId: string,
  updates: { rating?: number; comment?: string }
): Promise<Review | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .eq('client_id', clientId) // Ensure ownership
    .select()
    .single();

  if (error) {
    console.error('Error updating review:', error);
    return null;
  }

  return data as Review;
}

// Delete a review (only if client owns it)
export async function deleteReview(reviewId: string, clientId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('client_id', clientId); // Ensure ownership

  if (error) {
    console.error('Error deleting review:', error);
    return false;
  }

  return true;
}
