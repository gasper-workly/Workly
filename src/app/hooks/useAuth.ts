'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { useTranslation } from '@/app/hooks/useTranslation';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'provider' | 'admin';
  language: 'en' | 'sl';
  phone?: string;
  avatar_url?: string;
  bio?: string;
  specialties?: string[];
  completed_requests: number;
  is_verified: boolean;
  created_at: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language: currentLanguage, setLanguage } = useTranslation();

  const fetchUser = async () => {
    const supabase = createClient();
    
    try {
      console.log('[useAuth] Starting fetchUser...');
      
      // First try to get session from storage (doesn't make network call)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('[useAuth] getSession result:', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        error: sessionError?.message 
      });
      
      if (sessionError) {
        console.log('[useAuth] Session error:', sessionError.message);
        setError(sessionError.message);
        setUser(null);
        setLoading(false);
        return;
      }

      // If no session in storage, user is not logged in
      if (!session?.user) {
        console.log('[useAuth] No session found, user not logged in');
        setUser(null);
        setLoading(false);
        return;
      }

      // We have a session in storage; use it immediately to avoid "logout" on slow network.
      const sessionUser = session.user;

      // Try to verify/refresh with the server, but don't force logout on transient failures.
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      console.log('[useAuth] getUser result:', { 
        hasUser: !!authUser, 
        error: authError?.message 
      });
      
      if (authError) {
        console.log('[useAuth] Auth error (keeping session user, will retry later):', authError.message);
        setError(authError.message);
        // Continue with session user and fetch profile; token refresh may happen shortly after startup.
      }

      const effectiveAuthUser = authUser ?? sessionUser;

      // Get the user's profile from the database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', effectiveAuthUser.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setUser(null);
        setLoading(false);
        return;
      }

      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as 'client' | 'provider' | 'admin',
        language: profile.language === 'en' ? 'en' : 'sl',
        phone: profile.phone || undefined,
        avatar_url: profile.avatar_url || undefined,
        bio: profile.bio || undefined,
        specialties: profile.specialties || undefined,
        completed_requests: profile.completed_requests,
        is_verified: profile.is_verified,
        created_at: profile.created_at,
      });

      // Sync UI language with the account preference (persists across devices)
      const preferred = profile.language === 'en' ? 'en' : 'sl';
      if (preferred !== currentLanguage) {
        setLanguage(preferred);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // Listen for auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: unknown, session: unknown) => {
      if (session) {
        fetchUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    error,
    refresh: fetchUser,
  };
}
