'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Ensures iOS status bar does NOT overlay the WebView (prevents content sitting under notch/time).
 * Safe to include in web builds: it no-ops unless running on a native platform.
 */
export default function CapacitorStatusBar() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Prevent WebView content from rendering under the status bar / notch.
    void StatusBar.setOverlaysWebView({ overlay: false });

    // Optional: make sure status bar text is readable (dark text on light bg, light text on dark bg).
    void StatusBar.setStyle({ style: Style.Light });
  }, []);

  return null;
}

