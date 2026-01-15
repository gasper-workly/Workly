import { createClient } from './supabase/server';
import type { Profile } from '@/types/database';

// Helper function to get user on server side (for server components)
export async function getServerUser(): Promise<Profile | null> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return profile as Profile;
}

