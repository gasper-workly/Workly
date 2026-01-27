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
import { getUnreadCount, subscribeToUnreadMessagesForUser } from '@/app/lib/chat';
import { getUnreadReviewsCount } from '@/app/lib/reviews';
import { useTranslation } from '@/app/hooks/useTranslation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'client' | 'provider';
  userName: string;
  hideMobileNav?: boolean;
  disableMainScroll?: boolean;
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
  disableMainScroll = false,
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
  const [fetchedUnreadReviewsCount, setFetchedUnreadReviewsCount] = useState<number>(0);

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

  // Real-time: refresh unread messages badge when a new relevant message arrives.
  useEffect(() => {
    if (typeof unreadMessagesCount === 'number') return; // page supplies its own count
    if (!user?.id) return;

    let disposed = false;
    let unsubscribe: (() => void) | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const refresh = () => {
      if (disposed) return;
      if (timer) return; // debounce bursty inserts
      timer = setTimeout(async () => {
        timer = null;
        try {
          const c = await getUnreadCount(user.id);
          if (!disposed) setFetchedUnreadCount(c);
        } catch {
          // ignore
        }
      }, 250);
    };

    (async () => {
      try {
        unsubscribe = await subscribeToUnreadMessagesForUser(user.id, refresh);
      } catch {
        // ignore
      }
    })();

    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id, unreadMessagesCount]);

  // Provider-only: unread reviews count (badge on Profile tab)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user?.id) return;
      if (userRole !== 'provider') return;
      try {
        const c = await getUnreadReviewsCount(user.id);
        if (!cancelled) setFetchedUnreadReviewsCount(c);
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, userRole, pathname]);

  const effectiveUnreadCount =
    typeof unreadMessagesCount === 'number'
      ? unreadMessagesCount
      : fetchedUnreadCount || (hasUnreadMessages ? 1 : 0);

  const badgeText = effectiveUnreadCount > 9 ? '+9' : String(effectiveUnreadCount);

  const effectiveUnreadReviewsCount = userRole === 'provider' ? fetchedUnreadReviewsCount : 0;
  const reviewsBadgeText =
    effectiveUnreadReviewsCount > 9 ? '+9' : String(effectiveUnreadReviewsCount);

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
    <div className={`h-screen flex flex-col overflow-hidden ${backgroundClassName} safe-area-top safe-area-x`}>
      {/* Side Navigation (Desktop) */}
      <nav className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-56 md:flex-col">
        <div className="flex flex-col flex-grow bg-white pt-6 border-r border-gray-200">
          <div className="flex-grow flex flex-col">
            <div className="flex-1 space-y-1 px-3">
              {currentNavItems.map((item) => {
                const isActive = pathname === item.href;
                const showMessagesNotification =
                  item.key === 'nav.messages' && effectiveUnreadCount > 0 && !isActive;
                const showReviewsNotification =
                  userRole === 'provider' &&
                  item.key === 'nav.profile' &&
                  effectiveUnreadReviewsCount > 0 &&
                  !isActive;
                const showNotification = showMessagesNotification || showReviewsNotification;
                const notificationText = showMessagesNotification
                  ? badgeText
                  : showReviewsNotification
                    ? reviewsBadgeText
                    : '';
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
                          {notificationText}
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
        className={`workly-scroll-root flex-1 md:pl-56 ${
          disableMainScroll ? 'pb-0' : 'pb-[calc(5.5rem+env(safe-area-inset-bottom))]'
        } md:pb-0 ${
          disableMainScroll ? 'overflow-hidden' : 'overflow-y-auto'
        } overscroll-contain ios-scroll ${mainBackgroundClassName}`}
      >
        <div
          className={`${contentClassName} ${
            disableMainScroll ? 'h-full flex flex-col min-h-0' : ''
          }`}
        >
          {children}
        </div>
      </main>

      {/* Bottom Navigation Bar (Mobile) */}
      {!hideMobileNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-[9999] safe-area-x"
          // Move nav content upward above the iPhone home indicator curve.
          // We do this inline because `.safe-area-bottom` in globals.css overrides Tailwind `pb-*` utilities.
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.25rem)' }}
        >
          <div className="flex justify-around py-2 px-2">
            {currentNavItems.map((item) => {
              const isActive = pathname === item.href;
              const showMessagesNotification =
                item.key === 'nav.messages' && effectiveUnreadCount > 0 && !isActive;
              const showReviewsNotification =
                userRole === 'provider' &&
                item.key === 'nav.profile' &&
                effectiveUnreadReviewsCount > 0 &&
                !isActive;
              const showNotification = showMessagesNotification || showReviewsNotification;
              const notificationText = showMessagesNotification
                ? badgeText
                : showReviewsNotification
                  ? reviewsBadgeText
                  : '';
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
                        {notificationText}
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