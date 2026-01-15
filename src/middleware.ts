import { NextResponse } from 'next/server';

export function middleware() {
  // MVP: keep middleware minimal.
  // Next.js middleware runs on the Edge Runtime, and Supabase SSR pulls in Node APIs
  // which can break Vercel builds.
  // Auth/role redirects are handled at the page level instead.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
