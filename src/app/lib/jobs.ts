import { createClient } from './supabase/client';
import type { Job, JobStatus, Profile } from '@/types/database';

export type { JobStatus };

export interface JobWithUsers extends Job {
  client?: Profile;
  provider?: Profile;
}

// Get a job by ID
export async function getJobById(jobId: string): Promise<JobWithUsers | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      client:profiles!jobs_client_id_fkey(*),
      provider:profiles!jobs_provider_id_fkey(*)
    `)
    .eq('id', jobId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as JobWithUsers;
}

// Get all jobs (for providers to browse)
export async function getAllJobs(filters?: {
  status?: JobStatus;
  category?: string;
  search?: string;
}): Promise<JobWithUsers[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('jobs')
    .select(`
      *,
      client:profiles!jobs_client_id_fkey(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  return (data || []) as JobWithUsers[];
}

// Get jobs for a specific client
export async function getClientJobs(clientId: string): Promise<JobWithUsers[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      provider:profiles!jobs_provider_id_fkey(*)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client jobs:', error);
    return [];
  }

  return (data || []) as JobWithUsers[];
}

// Get jobs assigned to a specific provider
export async function getProviderJobs(providerId: string): Promise<JobWithUsers[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      client:profiles!jobs_client_id_fkey(*)
    `)
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching provider jobs:', error);
    return [];
  }

  return (data || []) as JobWithUsers[];
}

export async function getProviderCompletedJobCategoryCounts(providerId: string): Promise<
  { name: string; count: number }[]
> {
  const supabase = createClient();

  // Prefer an RPC (if present) so this can work even when `jobs` isn't publicly readable via RLS.
  // Safe fallback: if RPC doesn't exist, we do the normal SELECT below.
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'get_provider_completed_job_category_counts',
      { provider_id: providerId }
    );
    if (!rpcError && Array.isArray(rpcData)) {
      type RpcRow = { name: string; count: number };
      const rows = rpcData as RpcRow[];
      return rows
        .filter((r) => typeof r?.name === 'string' && typeof r?.count === 'number')
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    }
  } catch {
    // ignore, fall back to SELECT
  }

  const { data, error } = await supabase
    .from('jobs')
    .select('category')
    .eq('provider_id', providerId)
    .eq('status', 'completed');

  if (error) {
    console.error('Error fetching completed job categories:', error);
    return [];
  }

  const counts = new Map<string, number>();
  type CompletedJobCategoryRow = { category: string | null };
  for (const row of (data as CompletedJobCategoryRow[] | null) || []) {
    const name = row.category || 'Other';
    counts.set(name, (counts.get(name) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// Create a new job
export async function createJob(job: {
  client_id: string;
  title: string;
  description?: string;
  category?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  budget_min?: number;
  budget_max?: number;
  is_negotiable?: boolean;
  images?: string[];
  due_date?: string;
}): Promise<Job> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('jobs')
    .insert(job)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Job;
}

// Update job status
export async function setJobStatus(jobId: string, status: JobStatus): Promise<Job | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    console.error('Error updating job status:', error);
    return null;
  }

  return data as Job;
}

// Complete a job and assign the provider who completed it
export async function completeJob(jobId: string, providerId: string): Promise<Job | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('jobs')
    .update({ 
      status: 'completed' as JobStatus,
      provider_id: providerId 
    })
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    console.error('Error completing job:', error);
    return null;
  }

  return data as Job;
}

// Assign a provider to a job
export async function assignProvider(jobId: string, providerId: string): Promise<Job | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('jobs')
    .update({ 
      provider_id: providerId,
      status: 'pending_confirmation' 
    })
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    console.error('Error assigning provider:', error);
    return null;
}

  return data as Job;
}

// Real-time: notify when the set of open jobs might have changed.
// We trigger for:
// - INSERT with status=open (new job posted)
// - UPDATE where old.status=open OR new.status=open (job opened/closed/assigned/etc.)
export function subscribeToOpenJobs(onChange: () => void): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel('jobs:open')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'jobs' },
      (payload: { new?: Record<string, unknown>; old?: Record<string, unknown> }) => {
        const nextStatus = (payload.new as { status?: string } | undefined)?.status;
        const prevStatus = (payload.old as { status?: string } | undefined)?.status;

        // New open job
        if (nextStatus === 'open') {
          onChange();
          return;
        }

        // Open job changed to something else (assigned/completed/etc.)
        if (prevStatus === 'open') {
          onChange();
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Update a job
export async function updateJob(jobId: string, updates: Partial<Pick<Job, 
  'title' | 'description' | 'category' | 'location' | 'latitude' | 'longitude' | 
  'budget_min' | 'budget_max' | 'is_negotiable' | 'due_date' | 'status'
>>): Promise<Job | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    console.error('Error updating job:', error);
    return null;
  }

  return data as Job;
}

// Delete a job
export async function deleteJob(jobId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId);

  if (error) {
    console.error('Error deleting job:', error);
    return false;
  }

  return true;
}

// Get open jobs near a location (for providers)
export async function getNearbyJobs(
  latitude: number, 
  longitude: number, 
  radiusKm: number = 50
): Promise<JobWithUsers[]> {
  const supabase = createClient();
  
  // Simple bounding box filter (for more accurate results, use PostGIS)
  const latDelta = radiusKm / 111; // ~111km per degree latitude
  const lonDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));
  
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      client:profiles!jobs_client_id_fkey(*)
    `)
    .eq('status', 'open')
    .gte('latitude', latitude - latDelta)
    .lte('latitude', latitude + latDelta)
    .gte('longitude', longitude - lonDelta)
    .lte('longitude', longitude + lonDelta)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching nearby jobs:', error);
    return [];
}

  return (data || []) as JobWithUsers[];
}
