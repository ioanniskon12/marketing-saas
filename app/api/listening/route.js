/**
 * Social Listening API Routes
 *
 * Monitor mentions, hashtags, and keywords across social platforms.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';

/**
 * GET /api/listening
 * Get social listening mentions for workspace
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');
    const keywordId = searchParams.get('keyword_id');
    const platform = searchParams.get('platform');
    const sentiment = searchParams.get('sentiment');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    const hasPermission = await checkPermission(supabase, user.id, workspaceId, 'analytics:read');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    let query = supabase
      .from('listening_mentions')
      .select(`
        *,
        listening_keywords (
          keyword,
          type
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('published_at', { ascending: false })
      .limit(100);

    if (keywordId) {
      query = query.eq('keyword_id', keywordId);
    }

    if (platform) {
      query = query.eq('platform', platform);
    }

    if (sentiment) {
      query = query.eq('sentiment', sentiment);
    }

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: mentions, error: mentionsError } = await query;

    if (mentionsError) throw mentionsError;

    // Get keyword statistics
    const { data: keywords } = await supabase
      .from('listening_keywords')
      .select(`
        *,
        listening_mentions (count)
      `)
      .eq('workspace_id', workspaceId)
      .eq('is_active', true);

    return NextResponse.json({
      mentions: mentions || [],
      keywords: keywords || [],
    });
  } catch (error) {
    console.error('Error fetching listening data:', error);
    return NextResponse.json({ error: 'Failed to fetch listening data' }, { status: 500 });
  }
}

/**
 * POST /api/listening
 * Add new keyword to track
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { workspace_id, keyword, type, platforms } = body;

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!workspace_id || !keyword || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hasPermission = await checkPermission(supabase, user.id, workspace_id, 'analytics:create');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: keywordData, error: insertError } = await supabase
      .from('listening_keywords')
      .insert({
        workspace_id,
        keyword,
        type,
        platforms: platforms || [],
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ keyword: keywordData });
  } catch (error) {
    console.error('Error creating keyword:', error);
    return NextResponse.json({ error: 'Failed to create keyword' }, { status: 500 });
  }
}

/**
 * PATCH /api/listening
 * Mark mention as read/flagged
 */
export async function PATCH(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { mention_id, is_read, is_flagged } = body;

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!mention_id) {
      return NextResponse.json({ error: 'Mention ID is required' }, { status: 400 });
    }

    // Get mention to check workspace
    const { data: mention } = await supabase
      .from('listening_mentions')
      .select('workspace_id')
      .eq('id', mention_id)
      .single();

    if (!mention) {
      return NextResponse.json({ error: 'Mention not found' }, { status: 404 });
    }

    const hasPermission = await checkPermission(supabase, user.id, mention.workspace_id, 'analytics:update');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const updates = {};
    if (is_read !== undefined) updates.is_read = is_read;
    if (is_flagged !== undefined) updates.is_flagged = is_flagged;

    const { data: updated, error: updateError } = await supabase
      .from('listening_mentions')
      .update(updates)
      .eq('id', mention_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ mention: updated });
  } catch (error) {
    console.error('Error updating mention:', error);
    return NextResponse.json({ error: 'Failed to update mention' }, { status: 500 });
  }
}
