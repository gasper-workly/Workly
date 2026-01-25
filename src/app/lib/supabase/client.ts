import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { capacitorStorage, isCapacitorNative } from './capacitor-storage'

// Singleton instance - ensures consistent session state across the app
let supabaseInstance: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  // Return existing instance if available (singleton pattern)
  if (supabaseInstance) {
    return supabaseInstance;
  }

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
    supabaseInstance = createSupabaseJsClient(
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

    console.log('[SupabaseClient] Using supabase-js native client');
    return supabaseInstance;
  }

  // Web: use @supabase/ssr browser client (works well with Next.js)
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  console.log('[SupabaseClient] Using @supabase/ssr browser client');

  return supabaseInstance;
}

