'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ChatBubbleLeftIcon, 
  ChartBarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { getUnreadCount } from '@/app/lib/chat';
import { useTranslation } from '@/app/hooks/useTranslation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'client' | 'provider';
  userName: string;
  hideMobileNav?: boolean;
  backgroundClassName?: string;
  mainBackgroundClassName?: string;
  contentClassName?: string;
  hasUnreadMessages?: boolean;
  unreadMessagesCount?: number;
}

export default function DashboardLayout({
  children,
  userRole,
  userName,
  hideMobileNav = false,
  backgroundClassName = 'bg-gray-50',
  mainBackgroundClassName = 'bg-gray-50',
  contentClassName = 'max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 min-h-full',
  hasUnreadMessages = false,
  unreadMessagesCount,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [fetchedUnreadCount, setFetchedUnreadCount] = useState<number>(0);

  // If the page doesn't supply a count, fetch it so the badge is accurate across all dashboard pages.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (typeof unreadMessagesCount === 'number') return;
      if (!user?.id) return;
      try {
        const c = await getUnreadCount(user.id);
        if (!cancelled) setFetchedUnreadCount(c);
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, unreadMessagesCount]);

  const effectiveUnreadCount =
    typeof unreadMessagesCount === 'number'
      ? unreadMessagesCount
      : fetchedUnreadCount || (hasUnreadMessages ? 1 : 0);

  const badgeText = effectiveUnreadCount > 9 ? '+9' : String(effectiveUnreadCount);

  const navigation = {
    client: [
      { name: t('nav.dashboard'), href: '/dashboard/client', icon: HomeIcon, key: 'nav.dashboard' as const },
      { name: t('nav.myRequests'), href: '/dashboard/client/requests', icon: ChartBarIcon, key: 'nav.myRequests' as const },
      { name: t('nav.messages'), href: '/dashboard/client/messages', icon: ChatBubbleLeftIcon, key: 'nav.messages' as const },
      { name: t('nav.profile'), href: '/dashboard/client/profile', icon: UserIcon, key: 'nav.profile' as const },
    ],
    provider: [
      { name: t('nav.dashboard'), href: '/dashboard/provider', icon: HomeIcon, key: 'nav.dashboard' as const },
      { name: t('nav.messages'), href: '/dashboard/provider/messages', icon: ChatBubbleLeftIcon, key: 'nav.messages' as const },
      { name: t('nav.analytics'), href: '/dashboard/provider/analytics', icon: ChartBarIcon, key: 'nav.analytics' as const },
      { name: t('nav.profile'), href: '/dashboard/provider/profile', icon: UserIcon, key: 'nav.profile' as const },
    ],
  };

  const currentNavItems = navigation[userRole];

  return (
    <div className={`min-h-screen flex flex-col ${backgroundClassName} safe-area-top safe-area-x`}>
      {/* Side Navigation (Desktop) */}
      <nav className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-56 md:flex-col">
        <div className="flex flex-col flex-grow bg-white pt-6 border-r border-gray-200">
          <div className="flex-grow flex flex-col">
            <div className="flex-1 space-y-1 px-3">
              {currentNavItems.map((item) => {
                const isActive = pathname === item.href;
                const showNotification = item.key === 'nav.messages' && effectiveUnreadCount > 0 && !isActive;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-violet-100 text-violet-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="relative mr-3">
                      <item.icon className="h-5 w-5" />
                      {showNotification && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 bg-violet-600 text-white text-[10px] font-bold rounded-full">
                          {badgeText}
                        </span>
                      )}
                    </div>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main
        className={`flex-1 md:pl-56 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-0 overflow-y-auto ${mainBackgroundClassName}`}
      >
        <div className={contentClassName}>{children}</div>
      </main>

      {/* Bottom Navigation Bar (Mobile) */}
      {!hideMobileNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-[9999] safe-area-x"
          // Move nav content upward above the iPhone home indicator curve.
          // We do this inline because `.safe-area-bottom` in globals.css overrides Tailwind `pb-*` utilities.
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}
        >
          <div className="flex justify-around py-2 px-2">
            {currentNavItems.map((item) => {
              const isActive = pathname === item.href;
              const showNotification = item.key === 'nav.messages' && effectiveUnreadCount > 0 && !isActive;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex flex-col items-center py-1.5 px-4 text-xs transition-colors ${
                    isActive
                      ? 'text-violet-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="relative">
                    <item.icon className={`h-7 w-7 ${isActive ? 'fill-violet-100' : ''}`} />
                    {showNotification && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 bg-violet-600 text-white text-[10px] font-bold rounded-full">
                        {badgeText}
                      </span>
                    )}
                  </div>
                  <span className="mt-1">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
} 