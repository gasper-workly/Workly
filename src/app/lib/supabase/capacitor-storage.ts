import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

/**
 * Check if we're running inside a Capacitor native app
 */
const isNative = (): boolean => {
  try {
    return typeof window !== 'undefined' && Capacitor.isNativePlatform();
  } catch {
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
    if (isNative()) {
      const { value } = await Preferences.get({ key });
      return value;
    }
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  async setItem(key: string, value: string): Promise<void> {
    if (isNative()) {
      await Preferences.set({ key, value });
    } else if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  async removeItem(key: string): Promise<void> {
    if (isNative()) {
      await Preferences.remove({ key });
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};
