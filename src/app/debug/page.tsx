'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';

export default function DebugPage() {
  const [data, setData] = useState<{
    user: unknown;
    profile: unknown;
    error: string | null;
  }>({ user: null, profile: null, error: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          setData({ user: null, profile: null, error: userError.message });
          setLoading(false);
          return;
        }

        if (!user) {
          setData({ user: null, profile: null, error: 'Not logged in' });
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
          error: profileError?.message || null,
        });
      } catch (err) {
        setData({ user: null, profile: null, error: String(err) });
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

