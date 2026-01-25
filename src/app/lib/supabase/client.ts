import { createBrowserClient, SupabaseClient } from '@supabase/ssr'
import { capacitorStorage } from './capacitor-storage'

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

  // Create singleton instance for browser
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: capacitorStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    }
  );

  return supabaseInstance;
}

