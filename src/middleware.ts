import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - important for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/dashboard']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Check if user is accessing wrong dashboard (client accessing provider or vice versa)
  if (isProtectedPath && user) {
    // Get the user's actual role from the profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role || 'client'
    const currentPath = request.nextUrl.pathname

    // If user is trying to access a dashboard that's not their role, redirect them
    if (currentPath.startsWith('/dashboard/client') && userRole !== 'client' && userRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${userRole}`
      return NextResponse.redirect(url)
    }
    
    if (currentPath.startsWith('/dashboard/provider') && userRole !== 'provider' && userRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${userRole}`
      return NextResponse.redirect(url)
    }

    if (currentPath.startsWith('/dashboard/admin') && userRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${userRole}`
      return NextResponse.redirect(url)
    }
  }

  // Allow logout and debug pages to work without redirect
  if (request.nextUrl.pathname === '/logout' || request.nextUrl.pathname === '/debug') {
    return supabaseResponse
  }

  // Redirect logged-in users away from auth pages to their correct dashboard
  const authPaths = ['/login', '/signup']
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPath && user) {
    // Get user role from the profiles table (not user_metadata)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'client'
    const url = request.nextUrl.clone()
    url.pathname = `/dashboard/${role}`
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
