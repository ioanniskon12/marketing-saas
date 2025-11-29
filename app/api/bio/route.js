/**
 * Link in Bio API Routes
 *
 * Manage link in bio pages and links.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';

/**
 * GET /api/bio
 * Get bio pages for workspace
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');
    const slug = searchParams.get('slug');

    // If slug provided, get public page (no auth required)
    if (slug) {
      const { data: page, error: pageError } = await supabase
        .from('bio_pages')
        .select(`
          *,
          bio_links (
            id,
            title,
            url,
            icon,
            thumbnail_url,
            is_active,
            order_index,
            clicks_count
          )
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (pageError || !page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }

      // Sort links by order
      if (page.bio_links) {
        page.bio_links.sort((a, b) => a.order_index - b.order_index);
      }

      // Increment views
      await supabase
        .from('bio_pages')
        .update({ views_count: (page.views_count || 0) + 1 })
        .eq('id', page.id);

      return NextResponse.json({ page });
    }

    // Get authenticated user's pages
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    const hasPermission = await checkPermission(supabase, user.id, workspaceId, 'posts:read');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: pages, error: pagesError } = await supabase
      .from('bio_pages')
      .select(`
        *,
        bio_links (count)
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (pagesError) throw pagesError;

    return NextResponse.json({ pages: pages || [] });
  } catch (error) {
    console.error('Error fetching bio pages:', error);
    return NextResponse.json({ error: 'Failed to fetch bio pages' }, { status: 500 });
  }
}

/**
 * POST /api/bio
 * Create new bio page
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const {
      workspace_id,
      slug,
      title,
      description,
      avatar_url,
      background_color,
      text_color,
      button_color,
      button_text_color,
    } = body;

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!workspace_id || !slug || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hasPermission = await checkPermission(supabase, user.id, workspace_id, 'posts:create');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if slug is already taken
    const { data: existing } = await supabase
      .from('bio_pages')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 400 });
    }

    const { data: page, error: insertError } = await supabase
      .from('bio_pages')
      .insert({
        workspace_id,
        slug,
        title,
        description,
        avatar_url,
        background_color,
        text_color,
        button_color,
        button_text_color,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ page });
  } catch (error) {
    console.error('Error creating bio page:', error);
    return NextResponse.json({ error: 'Failed to create bio page' }, { status: 500 });
  }
}

/**
 * PATCH /api/bio
 * Update bio page
 */
export async function PATCH(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { page_id, ...updates } = body;

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!page_id) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
    }

    // Get page to check workspace
    const { data: page } = await supabase
      .from('bio_pages')
      .select('workspace_id')
      .eq('id', page_id)
      .single();

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const hasPermission = await checkPermission(supabase, user.id, page.workspace_id, 'posts:update');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('bio_pages')
      .update(updates)
      .eq('id', page_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ page: updated });
  } catch (error) {
    console.error('Error updating bio page:', error);
    return NextResponse.json({ error: 'Failed to update bio page' }, { status: 500 });
  }
}
