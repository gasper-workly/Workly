'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isCapacitorNative } from '@/app/lib/supabase/capacitor-storage';
import { createClient } from '@/app/lib/supabase/client';
import { loadCachedProfile } from '@/app/lib/authProfileCache';

function normalizeRole(role: unknown): 'client' | 'provider' | null {
  return role === 'client' || role === 'provider' ? role : null;
}

export default function AuthBootOverlay() {
  const router = useRouter();
  const pathname = usePathname();

  const [booting, setBooting] = useState(() => isCapacitorNative());

  useEffect(() => {
    // Only for the mobile app (Capacitor). Web should behave normally.
    if (!isCapacitorNative()) return;

    let cancelled = false;

    const run = async () => {
      try {
        // Only show the overlay briefly on routes where users commonly "see login".
        const shouldAutoRedirect =
          pathname === '/' || pathname === '/login';

        if (!shouldAutoRedirect) {
          setBooting(false);
          return;
        }

        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          setBooting(false);
          return;
        }

        // Resolve role quickly (DB first, fallback cached)
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', session.user.id)
          .single();

        const roleFromDb = normalizeRole(profile?.role);
        if (roleFromDb) {
          router.replace(`/dashboard/${roleFromDb}`);
          return;
        }

        const cached = await loadCachedProfile(session.user.id);
        const roleFromCache = normalizeRole(cached?.role);
        if (roleFromCache) {
          router.replace(`/dashboard/${roleFromCache}`);
          return;
        }

        // As a last resort, default to client dashboard.
        router.replace('/dashboard/client');
      } finally {
        if (!cancelled) setBooting(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!booting) return null;

  // Full-screen overlay to avoid flashing the login form on cold start
  return (
    <div className="fixed inset-0 z-[10001] flex flex-col items-center justify-center bg-violet-600">
      <img src="/workly-logo.png" alt="Workly" className="h-28 w-auto drop-shadow" />
      <div className="mt-5 h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
    </div>
  );
}

