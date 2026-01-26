import { capacitorStorage } from '@/app/lib/supabase/capacitor-storage';
import type { AuthUser } from '@/app/hooks/useAuth';

const PREFIX = 'workly:profile:';

export async function loadCachedProfile(userId: string): Promise<AuthUser | null> {
  try {
    const raw = await capacitorStorage.getItem(`${PREFIX}${userId}`);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function saveCachedProfile(user: AuthUser): Promise<void> {
  try {
    await capacitorStorage.setItem(`${PREFIX}${user.id}`, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export async function clearCachedProfile(userId: string): Promise<void> {
  try {
    await capacitorStorage.removeItem(`${PREFIX}${userId}`);
  } catch {
    // ignore
  }
}
