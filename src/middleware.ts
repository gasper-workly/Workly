import { NextResponse, type NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // MVP: keep middleware minimal.\n+  // Next.js middleware runs on the Edge Runtime, and Supabase SSR pulls in Node APIs\n+  // which can break Vercel builds.\n+  // Auth/role redirects are handled at the page level instead.\n+  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
