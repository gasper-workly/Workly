'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Configures iOS status bar for full-screen WebView with CSS-based safe area handling.
 */
export default function CapacitorStatusBar() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Let the WebView be full screen (go under status bar/home indicator).
    // CSS env(safe-area-inset-*) will handle padding content away from unsafe regions.
    void StatusBar.setOverlaysWebView({ overlay: true });

    // Dark content (dark text/icons) for light backgrounds
    void StatusBar.setStyle({ style: Style.Dark });
  }, []);

  return null;
}
