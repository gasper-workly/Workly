'use client';

import type { PropsWithChildren } from 'react';

export default function SafeArea({ children }: PropsWithChildren) {
  // Provides safe-area CSS variables via `.safe-area` without forcing padding globally.
  // Also provides a consistent background so iOS doesn't show the WebView/body background
  // (often black in dark mode) during boot/login transitions.
  return <div className="safe-area min-h-screen bg-gray-50">{children}</div>;
}

