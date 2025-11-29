/**
 * Supabase React Hooks
 *
 * Custom hooks for common Supabase operations in Client Components.
 *
 * @module lib/supabase/hooks
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './client';

/**
 * Hook to get the current user
 *
 * Usage:
 * ```javascript
 * const { user, loading, error } = useUser();
 *
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (!user) return <div>Not logged in</div>;
 *
 * return <div>Hello, {user.email}</div>;
 * ```
 *
 * @returns {Object} { user, loading, error }
 */
export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      setUser(user);
      setError(error);
      setLoading(false);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, loading, error };
}

/**
 * Hook to get the current session
 *
 * Usage:
 * ```javascript
 * const { session, loading } = useSession();
 * ```
 *
 * @returns {Object} { session, loading, error }
 */
export function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setSession(session);
      setError(error);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { session, loading, error };
}

/**
 * Hook for real-time subscriptions
 *
 * Usage:
 * ```javascript
 * const { data, loading, error } = useRealtimeSubscription({
 *   table: 'posts',
 *   filter: 'workspace_id=eq.abc123',
 *   select: '*, user_profiles(*)',
 * });
 * ```
 *
 * @param {Object} options - Subscription options
 * @param {string} options.table - Table name
 * @param {string} options.filter - Filter string (optional)
 * @param {string} options.select - Select query (default: '*')
 * @param {string} options.event - Event type (default: '*')
 * @returns {Object} { data, loading, error }
 */
export function useRealtimeSubscription({ table, filter, select = '*', event = '*' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      let query = supabase.from(table).select(select);

      if (filter) {
        const [column, operator, value] = filter.split(/[=.]/);
        query = query.eq(column, value);
      }

      const { data, error } = await query;
      setData(data || []);
      setError(error);
      setLoading(false);
    };

    fetchData();

    // Subscribe to changes
    const channel = supabase
      .channel(`${table}-realtime`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData((current) => [payload.new, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setData((current) =>
              current.map((item) => (item.id === payload.new.id ? payload.new : item))
            );
          } else if (payload.eventType === 'DELETE') {
            setData((current) => current.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, select, event, supabase]);

  return { data, loading, error };
}

/**
 * Hook for database queries with automatic refetching
 *
 * Usage:
 * ```javascript
 * const { data, loading, error, refetch } = useQuery({
 *   table: 'posts',
 *   select: '*, user_profiles(*)',
 *   filters: { workspace_id: 'abc123' },
 *   orderBy: { column: 'created_at', ascending: false },
 *   limit: 10,
 * });
 * ```
 *
 * @param {Object} options - Query options
 * @returns {Object} { data, loading, error, refetch }
 */
export function useQuery(options) {
  const {
    table,
    select = '*',
    filters = {},
    orderBy,
    limit,
    single = false,
  } = options;

  const [data, setData] = useState(single ? null : []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    let query = supabase.from(table).select(select);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    // Get single or multiple
    if (single) {
      query = query.single();
    }

    const { data, error } = await query;

    setData(data);
    setError(error);
    setLoading(false);
  }, [table, select, filters, orderBy, limit, single, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for mutations (insert, update, delete)
 *
 * Usage:
 * ```javascript
 * const { mutate, loading, error } = useMutation({
 *   table: 'posts',
 *   onSuccess: (data) => console.log('Created:', data),
 *   onError: (error) => console.error('Error:', error),
 * });
 *
 * // Insert
 * await mutate('insert', { title: 'My Post', content: '...' });
 *
 * // Update
 * await mutate('update', { id: '123', title: 'Updated' });
 *
 * // Delete
 * await mutate('delete', { id: '123' });
 * ```
 *
 * @param {Object} options - Mutation options
 * @returns {Object} { mutate, loading, error, data }
 */
export function useMutation({ table, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const supabase = createClient();

  const mutate = useCallback(
    async (operation, payload) => {
      setLoading(true);
      setError(null);

      try {
        let result;

        switch (operation) {
          case 'insert': {
            result = await supabase.from(table).insert(payload).select().single();
            break;
          }
          case 'update': {
            const { id, ...updateData } = payload;
            result = await supabase
              .from(table)
              .update(updateData)
              .eq('id', id)
              .select()
              .single();
            break;
          }
          case 'delete': {
            result = await supabase.from(table).delete().eq('id', payload.id);
            break;
          }
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }

        if (result.error) throw result.error;

        setData(result.data);
        setLoading(false);

        if (onSuccess) {
          onSuccess(result.data);
        }

        return { data: result.data, error: null };
      } catch (err) {
        setError(err);
        setLoading(false);

        if (onError) {
          onError(err);
        }

        return { data: null, error: err };
      }
    },
    [table, onSuccess, onError, supabase]
  );

  return { mutate, loading, error, data };
}

/**
 * Hook to get user's workspaces
 *
 * Usage:
 * ```javascript
 * const { workspaces, loading, error, refetch } = useWorkspaces();
 * ```
 *
 * @returns {Object} { workspaces, loading, error, refetch }
 */
export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClient();
  const { user } = useUser();

  const fetchWorkspaces = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }

    setLoading(true);

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
      .eq('user_id', user.id);

    setWorkspaces(data || []);
    setError(error);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return { workspaces, loading, error, refetch: fetchWorkspaces };
}

/**
 * Hook to check workspace access
 *
 * Usage:
 * ```javascript
 * const { hasAccess, role, loading } = useWorkspaceAccess('workspace-id');
 * ```
 *
 * @param {string} workspaceId - Workspace ID
 * @returns {Object} { hasAccess, role, loading, error }
 */
export function useWorkspaceAccess(workspaceId) {
  const [hasAccess, setHasAccess] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClient();
  const { user } = useUser();

  useEffect(() => {
    if (!user || !workspaceId) {
      setHasAccess(false);
      setRole(null);
      setLoading(false);
      return;
    }

    const checkAccess = async () => {
      const { data, error } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      setHasAccess(!!data);
      setRole(data?.role || null);
      setError(error);
      setLoading(false);
    };

    checkAccess();
  }, [workspaceId, user, supabase]);

  return { hasAccess, role, loading, error };
}

/**
 * Hook for file upload to Supabase Storage
 *
 * Usage:
 * ```javascript
 * const { upload, uploading, progress, url, error } = useFileUpload({
 *   bucket: 'media',
 *   onSuccess: (url) => console.log('Uploaded:', url),
 * });
 *
 * const handleFileChange = async (e) => {
 *   const file = e.target.files[0];
 *   await upload(file, `${userId}/${file.name}`);
 * };
 * ```
 *
 * @param {Object} options - Upload options
 * @returns {Object} { upload, uploading, progress, url, error }
 */
export function useFileUpload({ bucket, onSuccess, onError }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);
  const supabase = createClient();

  const upload = useCallback(
    async (file, path) => {
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Upload file
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

        setUrl(urlData.publicUrl);
        setProgress(100);
        setUploading(false);

        if (onSuccess) {
          onSuccess(urlData.publicUrl);
        }

        return { url: urlData.publicUrl, error: null };
      } catch (err) {
        setError(err);
        setUploading(false);

        if (onError) {
          onError(err);
        }

        return { url: null, error: err };
      }
    },
    [bucket, onSuccess, onError, supabase]
  );

  return { upload, uploading, progress, url, error };
}
