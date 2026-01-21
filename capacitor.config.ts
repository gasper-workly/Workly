import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'si.workly.app',
  appName: 'Workly',
  webDir: 'out',
  server: {
    // Load the app from your deployed Vercel URL
    url: 'https://worklyprod.vercel.app',
    cleartext: false
  },
  // Android specific settings
  android: {
    allowMixedContent: false,
    backgroundColor: '#7c3aed' // Violet color for splash
  },
  // iOS specific settings
  ios: {
    backgroundColor: '#7c3aed',
    contentInset: 'always',
    scrollEnabled: false
  }
};

export default config;
