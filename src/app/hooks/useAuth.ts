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
      // Get the authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        setError(authError.message);
        setUser(null);
        setLoading(false);
        return;
      }

      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Get the user's profile from the database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
