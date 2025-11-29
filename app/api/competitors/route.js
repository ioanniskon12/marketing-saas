/**
 * Competitors API Routes
 *
 * Manage competitor tracking.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';

/**
 * GET /api/competitors
 * Get competitors for workspace with recent snapshots
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(
      supabase,
      user.id,
      workspaceId,
      'analytics:read'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get competitors
    const { data: competitors, error: competitorsError } = await supabase
      .from('competitors')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (competitorsError) throw competitorsError;

    // Get latest snapshot for each competitor
    const competitorsWithData = await Promise.all(
      (competitors || []).map(async (competitor) => {
        const { data: snapshots } = await supabase
          .from('competitor_snapshots')
          .select('*')
          .eq('competitor_id', competitor.id)
          .order('snapshot_date', { ascending: false })
          .limit(2);

        const latest = snapshots?.[0];
        const previous = snapshots?.[1];

        return {
          ...competitor,
          latestSnapshot: latest || null,
          previousSnapshot: previous || null,
        };
      })
    );

    return NextResponse.json({
      competitors: competitorsWithData,
    });
  } catch (error) {
    console.error('Error fetching competitors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitors' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/competitors
 * Add new competitor to track
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const {
      workspace_id,
      name,
      description,
      platform,
      platform_username,
      profile_url,
      avatar_url,
    } = body;

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!workspace_id || !name || !platform || !platform_username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(
      supabase,
      user.id,
      workspace_id,
      'analytics:create'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Insert competitor
    const { data: competitor, error: insertError } = await supabase
      .from('competitors')
      .insert({
        workspace_id,
        name,
        description,
        platform,
        platform_username,
        profile_url,
        avatar_url,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      competitor,
    });
  } catch (error) {
    console.error('Error adding competitor:', error);
    return NextResponse.json(
      { error: 'Failed to add competitor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/competitors
 * Remove competitor
 */
export async function DELETE(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const competitorId = searchParams.get('competitor_id');

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!competitorId) {
      return NextResponse.json(
        { error: 'Competitor ID is required' },
        { status: 400 }
      );
    }

    // Get competitor to check workspace
    const { data: competitor } = await supabase
      .from('competitors')
      .select('workspace_id')
      .eq('id', competitorId)
      .single();

    if (!competitor) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(
      supabase,
      user.id,
      competitor.workspace_id,
      'analytics:delete'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Delete competitor
    const { error: deleteError } = await supabase
      .from('competitors')
      .delete()
      .eq('id', competitorId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting competitor:', error);
    return NextResponse.json(
      { error: 'Failed to delete competitor' },
      { status: 500 }
    );
  }
}
