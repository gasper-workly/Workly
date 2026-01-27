'use client';

import type { PropsWithChildren } from 'react';

export default function SafeArea({ children }: PropsWithChildren) {
  // Provides safe-area CSS variables via `.safe-area` without forcing padding globally.
  // Background is handled by <body> so iOS safe areas inherit correctly from the body background.
  return <div className="safe-area min-h-screen">{children}</div>;
}

