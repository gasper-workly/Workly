'use client';

import type { PropsWithChildren } from 'react';

export default function SafeArea({ children }: PropsWithChildren) {
  return <div className="safe-area min-h-screen">{children}</div>;
}

