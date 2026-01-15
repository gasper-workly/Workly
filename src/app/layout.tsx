import './globals.css';
import { LanguageProvider } from '@/app/context/LanguageContext';

export const metadata = {
  title: 'Woorkly',
  description: 'Find local help for your tasks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
