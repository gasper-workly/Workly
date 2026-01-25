import { createBrowserClient } from '@supabase/ssr'
import { capacitorStorage } from './capacitor-storage'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: capacitorStorage,
        persistSession: true,
        detectSessionInUrl: true,
      }
    }
  )
}

