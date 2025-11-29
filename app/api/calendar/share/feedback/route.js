import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's workspace
    const { data: membership } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
    }

    const workspaceId = membership.workspace_id;

    // Get all calendar shares for this workspace
    const { data: shares, error: sharesError } = await supabase
      .from('calendar_shares')
      .select(`
        id,
        token,
        title,
        expires_at,
        can_comment,
        can_approve,
        view_count,
        created_at,
        posts:calendar_share_posts(post_id)
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (sharesError) {
      console.error('Error fetching shares:', sharesError);
      return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 });
    }

    // For each share, get comments, approvals, and activity
    const sharesWithFeedback = await Promise.all(
      shares.map(async (share) => {
        // Get comments
        const { data: comments } = await supabase
          .from('calendar_share_comments')
          .select('*')
          .eq('share_id', share.id)
          .order('created_at', { ascending: false });

        // Get approvals
        const { data: approvals } = await supabase
          .from('calendar_share_approvals')
          .select('*')
          .eq('share_id', share.id)
          .order('created_at', { ascending: false });

        // Get activity count
        const { data: activities } = await supabase
          .from('calendar_share_activity')
          .select('id')
          .eq('share_id', share.id);

        // Calculate stats
        const stats = {
          totalComments: comments?.length || 0,
          totalApprovals: approvals?.filter(a => a.approved).length || 0,
          totalRejections: approvals?.filter(a => !a.approved).length || 0,
          totalActivities: activities?.length || 0,
          viewCount: share.view_count || 0,
        };

        return {
          ...share,
          comments: comments || [],
          approvals: approvals || [],
          stats,
          isExpired: share.expires_at ? new Date(share.expires_at) < new Date() : false,
        };
      })
    );

    return NextResponse.json({
      success: true,
      shares: sharesWithFeedback,
    });

  } catch (error) {
    console.error('Error in feedback API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
