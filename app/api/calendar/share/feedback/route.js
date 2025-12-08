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

    // Get all post plan shares for this workspace with full post data
    const { data: shares, error: sharesError } = await supabase
      .from('post_plan_shares')
      .select(`
        id,
        share_token,
        title,
        description,
        client_name,
        expires_at,
        permission,
        view_count,
        created_at,
        is_active,
        post_plan_share_items(
          id,
          post_id,
          post:posts(
            id,
            content,
            platforms,
            scheduled_for,
            status,
            post_media(id, file_url, thumbnail_url, mime_type, media_type)
          )
        ),
        post_plan_share_feedback(
          id,
          post_id,
          feedback_type,
          reaction,
          comment,
          approved,
          author_name,
          author_email,
          created_at
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (sharesError) {
      console.error('Error fetching shares:', sharesError);
      return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 });
    }

    // Transform data for the feedback page
    const sharesWithFeedback = (shares || []).map((share) => {
      const feedback = share.post_plan_share_feedback || [];
      const items = share.post_plan_share_items || [];

      // Build posts map for quick lookup
      const postsMap = {};
      items.forEach(item => {
        if (item.post) {
          postsMap[item.post.id] = item.post;
        }
      });

      // Separate feedback into comments and approvals with post data
      const comments = feedback
        .filter(f => f.feedback_type === 'comment')
        .map(f => ({
          id: f.id,
          post_id: f.post_id,
          post: postsMap[f.post_id] || null,
          comment: f.comment,
          author_name: f.author_name || 'Anonymous',
          author_email: f.author_email,
          created_at: f.created_at
        }));

      const approvals = feedback
        .filter(f => f.feedback_type === 'approval')
        .map(f => ({
          id: f.id,
          post_id: f.post_id,
          post: postsMap[f.post_id] || null,
          approved: f.approved,
          feedback: f.comment,
          approver_name: f.author_name || 'Anonymous',
          approver_email: f.author_email,
          created_at: f.created_at
        }));

      // Calculate stats
      const stats = {
        totalComments: comments.length,
        totalApprovals: approvals.filter(a => a.approved).length,
        totalRejections: approvals.filter(a => !a.approved).length,
        viewCount: share.view_count || 0,
        totalPosts: items.length,
      };

      return {
        id: share.id,
        token: share.share_token,
        title: share.title,
        description: share.description,
        client_name: share.client_name,
        expires_at: share.expires_at,
        permission: share.permission,
        is_active: share.is_active,
        created_at: share.created_at,
        comments,
        approvals,
        posts: Object.values(postsMap),
        stats,
        isExpired: share.expires_at ? new Date(share.expires_at) < new Date() : false,
      };
    });

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
