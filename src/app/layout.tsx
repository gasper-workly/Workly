import './globals.css';
import { LanguageProvider } from '@/app/context/LanguageContext';
import CapacitorStatusBar from '@/app/components/CapacitorStatusBar';
import SafeArea from '@/app/components/SafeArea';

export const metadata = {
  title: 'Workly',
  description: 'Find local help for your tasks',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <SafeArea>
          <CapacitorStatusBar />
          <LanguageProvider>
            {children}
            {/* Quick access for mobile testing (opens in-app WebView) */}
            <a
              href="/debug"
              className="fixed bottom-24 right-4 z-[10000] flex h-11 w-11 items-center justify-center rounded-full bg-black/80 text-white text-xs font-bold shadow-lg backdrop-blur"
            >
              DBG
            </a>
          </LanguageProvider>
        </SafeArea>
      </body>
    </html>
  );
}
