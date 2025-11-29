/**
 * Supabase Middleware
 *
 * This middleware handles authentication for the Next.js 14 App Router.
 * It refreshes the auth session and protects routes based on authentication status.
 *
 * @module lib/supabase/middleware
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

/**
 * Update the user's session and handle route protection
 *
 * This function:
 * 1. Creates a Supabase client with middleware-compatible cookie handling
 * 2. Refreshes the user's authentication session
 * 3. Protects routes based on authentication status
 * 4. Redirects unauthenticated users from protected routes
 * 5. Redirects authenticated users from auth pages
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<NextResponse>} Next.js response object
 */
export async function updateSession(request) {
  // Create a response that will be modified with updated cookies
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on both request and response
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: This refreshes the auth session
  // Must be called to ensure the auth state is up to date
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Get the current pathname
  const pathname = request.nextUrl.pathname;

  // Define route patterns
  const protectedRoutes = [
    '/dashboard',
    '/calendar',
    '/analytics',
    '/content',
    '/scheduler',
    '/settings',
    '/team',
    '/inbox',
    '/library',
  ];

  const authRoutes = [
    '/login',
    '/forgot-password',
    '/reset-password',
  ];

  const publicRoutes = [
    '/',
    '/pricing',
    '/features',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
  ];

  // Check if the current route matches any pattern
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // Handle route protection
  if (isProtectedRoute && !user) {
    // User is not authenticated, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Preserve the original destination for post-login redirect
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    // User is already authenticated, redirect to dashboard
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Handle API routes separately (no redirects)
  if (pathname.startsWith('/api')) {
    // For API routes, just return the response with updated session
    return supabaseResponse;
  }

  // Allow access to public routes
  if (isPublicRoute || pathname.startsWith('/_next') || pathname.startsWith('/static')) {
    return supabaseResponse;
  }

  // Return the response with refreshed session
  return supabaseResponse;
}

/**
 * Check if a route requires authentication
 *
 * @param {string} pathname - Route pathname
 * @returns {boolean} True if route requires authentication
 */
export function isProtectedRoute(pathname) {
  const protectedPatterns = [
    /^\/dashboard/,
    /^\/calendar/,
    /^\/analytics/,
    /^\/content/,
    /^\/scheduler/,
    /^\/settings/,
    /^\/team/,
    /^\/inbox/,
    /^\/library/,
  ];

  return protectedPatterns.some(pattern => pattern.test(pathname));
}

/**
 * Check if a route is an auth page
 *
 * @param {string} pathname - Route pathname
 * @returns {boolean} True if route is an auth page
 */
export function isAuthRoute(pathname) {
  const authPatterns = [
    /^\/login/,
    /^\/forgot-password/,
    /^\/reset-password/,
  ];

  return authPatterns.some(pattern => pattern.test(pathname));
}

/**
 * Check if a route is public
 *
 * @param {string} pathname - Route pathname
 * @returns {boolean} True if route is public
 */
export function isPublicRoute(pathname) {
  const publicPatterns = [
    /^\/$/,
    /^\/pricing/,
    /^\/features/,
    /^\/about/,
    /^\/contact/,
    /^\/terms/,
    /^\/privacy/,
    /^\/blog/,
    /^\/_next/,
    /^\/static/,
    /^\/favicon/,
  ];

  return publicPatterns.some(pattern => pattern.test(pathname));
}
