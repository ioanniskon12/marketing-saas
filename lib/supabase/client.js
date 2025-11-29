/**
 * Supabase Browser Client
 *
 * This client is used in Client Components and browser-side code.
 * It uses @supabase/ssr for Next.js 14 App Router compatibility.
 *
 * @module lib/supabase/client
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for browser-side operations
 *
 * Usage in Client Components:
 * ```javascript
 * 'use client';
 * import { createClient } from '@/lib/supabase/client';
 *
 * export default function MyComponent() {
 *   const supabase = createClient();
 *
 *   const handleSignIn = async () => {
 *     const { data, error } = await supabase.auth.signInWithPassword({
 *       email: 'user@example.com',
 *       password: 'password'
 *     });
 *   };
 * }
 * ```
 *
 * @returns {Object} Supabase browser client instance
 */
export function createClient() {
  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    }
  );
}

/**
 * Hook-like function to get current user
 *
 * Usage:
 * ```javascript
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log('Logged in as:', user.email);
 * }
 * ```
 *
 * @returns {Promise<Object|null>} Current user or null
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }

  return user;
}

/**
 * Get current session
 *
 * @returns {Promise<Object|null>} Current session or null
 */
export async function getCurrentSession() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return session;
}

/**
 * Sign out user
 *
 * @returns {Promise<Object>} Supabase response
 */
export async function signOut() {
  const supabase = createClient();
  return await supabase.auth.signOut();
}
