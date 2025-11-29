/**
 * Supabase Server Client
 *
 * This client is used in Server Components, Server Actions, and Route Handlers.
 * It properly handles cookies for authentication in Next.js 14 App Router.
 *
 * @module lib/supabase/server
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Create a Supabase client for server-side operations
 *
 * Usage in Server Components:
 * ```javascript
 * import { createClient } from '@/lib/supabase/server';
 *
 * export default async function ServerComponent() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('posts').select('*');
 *   return <div>{JSON.stringify(data)}</div>;
 * }
 * ```
 *
 * Usage in Server Actions:
 * ```javascript
 * 'use server';
 * import { createClient } from '@/lib/supabase/server';
 *
 * export async function createPost(formData) {
 *   const supabase = await createClient();
 *   const { data, error } = await supabase
 *     .from('posts')
 *     .insert({ title: formData.get('title') });
 *   return { data, error };
 * }
 * ```
 *
 * Usage in Route Handlers:
 * ```javascript
 * import { createClient } from '@/lib/supabase/server';
 * import { NextResponse } from 'next/server';
 *
 * export async function GET() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('posts').select('*');
 *   return NextResponse.json(data);
 * }
 * ```
 *
 * @returns {Promise<Object>} Supabase server client instance
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            // console.log('Cookie set error (expected in Server Components):', error.message);
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase admin client with service role key
 *
 * ⚠️ WARNING: This client bypasses RLS policies. Use with extreme caution!
 * Only use this for administrative operations that require elevated permissions.
 *
 * Usage:
 * ```javascript
 * import { createAdminClient } from '@/lib/supabase/server';
 *
 * export async function deleteUserData(userId) {
 *   const supabase = createAdminClient();
 *   await supabase.from('user_profiles').delete().eq('id', userId);
 * }
 * ```
 *
 * @returns {Object} Supabase admin client instance
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Get the current authenticated user from server-side
 *
 * @returns {Promise<Object|null>} Current user or null
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Get the current session from server-side
 *
 * @returns {Promise<Object|null>} Current session or null
 */
export async function getCurrentSession() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  return session;
}

/**
 * Check if user is authenticated
 *
 * @returns {Promise<boolean>} True if authenticated
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Require authentication (throws if not authenticated)
 *
 * Usage:
 * ```javascript
 * export async function MyServerComponent() {
 *   const user = await requireAuth();
 *   // user is guaranteed to exist here
 * }
 * ```
 *
 * @returns {Promise<Object>} Current user
 * @throws {Error} If user is not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  return user;
}

/**
 * Get user's workspaces
 *
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise<Array>} User's workspaces
 */
export async function getUserWorkspaces(userId = null) {
  const supabase = await createClient();

  // If no userId provided, get current user
  if (!userId) {
    const user = await getCurrentUser();
    if (!user) return [];
    userId = user.id;
  }

  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      workspace_id,
      role,
      workspaces (
        id,
        name,
        slug,
        logo_url,
        subscription_plan
      )
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching workspaces:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if user has access to workspace
 *
 * @param {string} workspaceId - Workspace ID
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise<boolean>} True if user has access
 */
export async function hasWorkspaceAccess(workspaceId, userId = null) {
  const supabase = await createClient();

  if (!userId) {
    const user = await getCurrentUser();
    if (!user) return false;
    userId = user.id;
  }

  const { data, error } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  return !error && !!data;
}

/**
 * Get user's role in workspace
 *
 * @param {string} workspaceId - Workspace ID
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise<string|null>} User's role or null
 */
export async function getUserWorkspaceRole(workspaceId, userId = null) {
  const supabase = await createClient();

  if (!userId) {
    const user = await getCurrentUser();
    if (!user) return null;
    userId = user.id;
  }

  const { data, error } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  return data.role;
}
