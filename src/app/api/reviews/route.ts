import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, clientId: clientIdFromBody, providerId, rating, comment } = body ?? {};

    if (!jobId || !providerId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Try to get user from cookies first (web), then from Authorization header (Capacitor)
    let supabase = await createClient();
    let { data: authData, error: authErr } = await supabase.auth.getUser();
    
    // If cookie auth failed, try Authorization header (for Capacitor apps)
    if (authErr || !authData?.user) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // Create a client with the user's token
        const supabaseWithToken = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: { Authorization: `Bearer ${token}` }
            }
          }
        );
        const tokenAuthResult = await supabaseWithToken.auth.getUser(token);
        if (tokenAuthResult.data?.user) {
          authData = tokenAuthResult.data;
          authErr = null;
          supabase = supabaseWithToken;
        }
      }
    }
    
    if (authErr || !authData?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const clientId = authData.user.id;
    if (clientIdFromBody && clientIdFromBody !== clientId) {
      return NextResponse.json({ error: 'Client mismatch' }, { status: 403 });
    }

    const { data: job, error: jobErr } = await supabase
      .from('jobs')
      .select('id, client_id, status')
      .eq('id', jobId)
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if client owns the job
    if (job.client_id !== clientId) {
      return NextResponse.json(
        { error: 'Only the client who requested the job can review it' },
        { status: 403 }
      );
    }

    // Check if review already exists for this job+client (schema unique constraint is job_id + client_id)
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('job_id', jobId)
      .eq('client_id', clientId)
      .maybeSingle();
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this job.' },
        { status: 400 }
      );
    }

    // Mark job as completed and assign the provider who completed it
    // This triggers the DB function to increment completed_requests for both users
    if (job.status !== 'completed') {
      const { error: completeJobErr } = await supabase
        .from('jobs')
        .update({ status: 'completed', provider_id: providerId })
        .eq('id', jobId);

      if (completeJobErr) {
        return NextResponse.json({ error: completeJobErr.message }, { status: 500 });
      }
    }

    // Review == completion: also complete the relevant order so provider earnings update.
    // Pick the most recent active order for this job/provider.
    const { data: activeOrder } = await supabase
      .from('orders')
      .select('id, status')
      .eq('job_id', jobId)
      .eq('provider_id', providerId)
      .in('status', ['accepted', 'paid', 'in_progress'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeOrder?.id) {
      await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', activeOrder.id);
    }

    const { data: review, error: reviewErr } = await supabase
      .from('reviews')
      .insert({
        job_id: jobId,
        client_id: clientId,
        provider_id: providerId,
        rating,
        comment: comment || null,
      })
      .select()
      .single();

    if (reviewErr || !review) {
      return NextResponse.json({ error: reviewErr?.message ?? 'Failed to create review' }, { status: 500 });
    }
    
    return NextResponse.json(review, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create review';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

