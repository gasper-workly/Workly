import { createClient } from './supabase/client';
import type { Report, ReportStatus, Profile, Job } from '@/types/database';

export type { Report, ReportStatus };

export interface ReportWithDetails extends Report {
  reporter?: Profile;
  reported_user?: Profile;
  reported_job?: Job;
  resolver?: Profile;
}

// Create a new report
export async function createReport(input: {
  reporter_id: string;
  reported_user_id?: string;
  reported_job_id?: string;
  reason: string;
  description?: string;
}): Promise<Report> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: input.reporter_id,
      reported_user_id: input.reported_user_id || null,
      reported_job_id: input.reported_job_id || null,
      reason: input.reason,
      description: input.description || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Report;
}

// Get all reports (admin only)
export async function getAllReports(filters?: {
  status?: ReportStatus;
}): Promise<ReportWithDetails[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(*),
      reported_user:profiles!reports_reported_user_id_fkey(*),
      reported_job:jobs!reports_reported_job_id_fkey(*),
      resolver:profiles!reports_resolved_by_fkey(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }

  return (data || []) as ReportWithDetails[];
}

// Get reports by user (their own reports)
export async function getUserReports(userId: string): Promise<ReportWithDetails[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      reported_user:profiles!reports_reported_user_id_fkey(*),
      reported_job:jobs!reports_reported_job_id_fkey(*)
    `)
    .eq('reporter_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user reports:', error);
    return [];
  }

  return (data || []) as ReportWithDetails[];
}

// Update report status (admin only)
export async function updateReportStatus(
  reportId: string,
  adminId: string,
  status: ReportStatus,
  adminNotes?: string
): Promise<Report | null> {
  const supabase = createClient();
  
  const updates: {
    status: ReportStatus;
    admin_notes?: string;
    resolved_by?: string;
    resolved_at?: string;
  } = { status };

  if (adminNotes) {
    updates.admin_notes = adminNotes;
  }

  if (status === 'resolved' || status === 'dismissed') {
    updates.resolved_by = adminId;
    updates.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', reportId)
    .select()
    .single();

  if (error) {
    console.error('Error updating report:', error);
    return null;
  }

  return data as Report;
}

// Get report by ID
export async function getReportById(reportId: string): Promise<ReportWithDetails | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(*),
      reported_user:profiles!reports_reported_user_id_fkey(*),
      reported_job:jobs!reports_reported_job_id_fkey(*),
      resolver:profiles!reports_resolved_by_fkey(*)
    `)
    .eq('id', reportId)
    .single();

  if (error) {
    console.error('Error fetching report:', error);
    return null;
  }

  return data as ReportWithDetails;
}

// Get pending reports count (for admin dashboard)
export async function getPendingReportsCount(): Promise<number> {
  const supabase = createClient();
  
  const { count, error } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) {
    console.error('Error getting pending reports count:', error);
    return 0;
  }

  return count || 0;
}

// Suspend a user (admin only)
export async function suspendUser(userId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_suspended: true })
    .eq('id', userId);

  if (error) {
    console.error('Error suspending user:', error);
    return false;
  }

  return true;
}

// Unsuspend a user (admin only)
export async function unsuspendUser(userId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_suspended: false })
    .eq('id', userId);

  if (error) {
    console.error('Error unsuspending user:', error);
    return false;
  }

  return true;
}

