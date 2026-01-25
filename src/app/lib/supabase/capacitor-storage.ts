import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// Cache the native check result
let isNativeResult: boolean | null = null;

/**
 * Check if we're running inside a Capacitor native app
 */
export const isCapacitorNative = (): boolean => {
  // Return cached result if available
  if (isNativeResult !== null) {
    return isNativeResult;
  }
  
  try {
    if (typeof window === 'undefined') {
      isNativeResult = false;
      return false;
    }
    
    // Check multiple ways to detect Capacitor native environment
    const capacitorCheck = Capacitor.isNativePlatform();
    const windowCheck = !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
    
    isNativeResult = capacitorCheck || windowCheck;
    
    // Debug logging (visible in Android Studio logcat)
    console.log('[CapacitorStorage] isNative check:', {
      capacitorCheck,
      windowCheck,
      result: isNativeResult,
      platform: Capacitor.getPlatform(),
    });
    
    return isNativeResult;
  } catch (error) {
    console.log('[CapacitorStorage] isNative error:', error);
    isNativeResult = false;
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
      if (isCapacitorNative()) {
        const { value } = await Preferences.get({ key });
        console.log('[CapacitorStorage] getItem (native):', key, value ? 'found' : 'null');
        return value;
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
      if (isCapacitorNative()) {
        await Preferences.set({ key, value });
        console.log('[CapacitorStorage] setItem (native):', key);
        return;
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
