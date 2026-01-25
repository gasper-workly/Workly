import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { capacitorStorage, isCapacitorNative } from './capacitor-storage'

// Keep separate singletons for native vs web to avoid "locking in" the wrong one on cold start.
let nativeSupabase: SupabaseClient | null = null;
let webSupabase: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  // Only create in browser environment
  if (typeof window === 'undefined') {
    // Return a new instance for SSR (won't be persisted)
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Native (Capacitor/WebView): use supabase-js which correctly supports custom storage adapters
  if (isCapacitorNative()) {
    if (!nativeSupabase) {
      nativeSupabase = createSupabaseJsClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            storage: capacitorStorage,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        }
      );
      console.log('[SupabaseClient] Created supabase-js native client');
    }
    return nativeSupabase;
  }

  // Web: use @supabase/ssr browser client (works well with Next.js)
  if (!webSupabase) {
    webSupabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    console.log('[SupabaseClient] Created @supabase/ssr web client');
  }

  return webSupabase;
}

