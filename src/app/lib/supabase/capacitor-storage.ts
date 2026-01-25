import { Preferences } from '@capacitor/preferences';

/**
 * Custom storage adapter for Supabase that uses Capacitor Preferences.
 * This ensures auth sessions persist even when the app is closed on mobile devices.
 */
export const capacitorStorage = {
  async getItem(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  },
  async setItem(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  },
  async removeItem(key: string): Promise<void> {
    await Preferences.remove({ key });
  },
};
