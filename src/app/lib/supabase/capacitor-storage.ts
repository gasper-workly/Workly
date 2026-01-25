import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// Cache the native check result, but never "stick" on false (Capacitor can become available slightly later on cold start)
let isNativeResult: boolean | null = null;

/**
 * Check if we're running inside a Capacitor native app
 */
export const isCapacitorNative = (): boolean => {
  // If we've ever detected native, keep it sticky.
  if (isNativeResult === true) return true;
  
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    
    // Check multiple ways to detect Capacitor native environment
    const capacitorCheck = Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'web';
    const windowCheck = !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
    
    const result = capacitorCheck || windowCheck;
    // Only cache true; if false, allow re-check next time.
    if (result) isNativeResult = true;
    
    // Debug logging (visible in Android Studio logcat)
    console.log('[CapacitorStorage] isNative check:', {
      capacitorCheck,
      windowCheck,
      result,
      platform: Capacitor.getPlatform(),
    });
    
    return result;
  } catch (error) {
    console.log('[CapacitorStorage] isNative error:', error);
    return false;
  }
};

/**
 * Custom storage adapter for Supabase that uses Capacitor Preferences on native,
 * and falls back to localStorage on web/SSR.
 * This ensures auth sessions persist even when the app is closed on mobile devices.
 */
export const capacitorStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      // Prefer native Preferences if it works (even if detection is flaky early)
      if (isCapacitorNative()) {
        const { value } = await Preferences.get({ key });
        console.log('[CapacitorStorage] getItem (native):', key, value ? 'found' : 'null');
        return value;
      } else {
        // Best-effort: try Preferences anyway; on some cold starts detection can be false briefly
        try {
          const { value } = await Preferences.get({ key });
          if (value != null) {
            console.log('[CapacitorStorage] getItem (native-fallback):', key, 'found');
            return value;
          }
        } catch {
          // ignore
        }
      }
      if (typeof window !== 'undefined') {
        const value = localStorage.getItem(key);
        console.log('[CapacitorStorage] getItem (localStorage):', key, value ? 'found' : 'null');
        return value;
      }
      return null;
    } catch (error) {
      console.error('[CapacitorStorage] getItem error:', key, error);
      // Fallback to localStorage on error
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    }
  },
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      // Always prefer native Preferences when possible
      if (isCapacitorNative()) {
        await Preferences.set({ key, value });
        console.log('[CapacitorStorage] setItem (native):', key);
        return;
      } else {
        try {
          await Preferences.set({ key, value });
          console.log('[CapacitorStorage] setItem (native-fallback):', key);
          // If this worked, mark native as true for the rest of the session
          isNativeResult = true;
          return;
        } catch {
          // ignore
        }
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
        console.log('[CapacitorStorage] setItem (localStorage):', key);
      }
    } catch (error) {
      console.error('[CapacitorStorage] setItem error:', key, error);
      // Fallback to localStorage on error
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    }
  },
  
  async removeItem(key: string): Promise<void> {
    try {
      if (isCapacitorNative()) {
        await Preferences.remove({ key });
        console.log('[CapacitorStorage] removeItem (native):', key);
        return;
      } else {
        try {
          await Preferences.remove({ key });
          console.log('[CapacitorStorage] removeItem (native-fallback):', key);
          isNativeResult = true;
          return;
        } catch {
          // ignore
        }
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
        console.log('[CapacitorStorage] removeItem (localStorage):', key);
      }
    } catch (error) {
      console.error('[CapacitorStorage] removeItem error:', key, error);
      // Fallback to localStorage on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    }
  },
};
