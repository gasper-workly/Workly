'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { isCapacitorNative } from '@/app/lib/supabase/capacitor-storage';

export default function DebugPage() {
  const [data, setData] = useState<{
    user: unknown;
    profile: unknown;
    session: unknown;
    env: unknown;
    error: string | null;
  }>({ user: null, profile: null, session: null, env: null, error: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      try {
        const env = {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          isCapacitorNative: isCapacitorNative(),
        };

        // Get session (from storage) first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (sessionError || userError) {
          setData({ user: null, profile: null, session: session ?? null, env, error: (sessionError?.message || userError?.message) ?? 'Unknown auth error' });
          setLoading(false);
          return;
        }

        if (!user) {
          setData({ user: null, profile: null, session: session ?? null, env, error: 'Not logged in' });
          setLoading(false);
          return;
        }

        // Get profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setData({
          user: {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
          },
          profile: profile,
          session: session
            ? {
                hasSession: true,
                expires_at: (session as { expires_at?: number }).expires_at ?? null,
                user: {
                  id: (session as { user?: { id?: string; email?: string } }).user?.id ?? null,
                  email: (session as { user?: { email?: string } }).user?.email ?? null,
                },
              }
            : { hasSession: false },
          env,
          error: profileError?.message || null,
        });
      } catch (err) {
        setData({ user: null, profile: null, session: null, env: { isCapacitorNative: isCapacitorNative() }, error: String(err) });
      }
      
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Info</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Environment</h2>
        <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(data.env, null, 2)}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Session (from storage)</h2>
        <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(data.session, null, 2)}
        </pre>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Auth User</h2>
        <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(data.user, null, 2)}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Profile (from database)</h2>
        <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(data.profile, null, 2)}
        </pre>
      </div>

      {data.error && (
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{data.error}</p>
        </div>
      )}

      <div className="mt-6 space-x-4">
        <a href="/logout" className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Logout
        </a>
        <a href="/login" className="bg-violet-500 text-white px-4 py-2 rounded hover:bg-violet-600">
          Go to Login
        </a>
      </div>
    </div>
  );
}

