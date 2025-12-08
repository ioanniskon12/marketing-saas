import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Use service role key to bypass RLS for public share access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

export async function GET(request, { params }) {
  try {
    const { token } = await params;
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Load share details
    const { data: share, error: shareError } = await supabase
      .from('post_plan_shares')
      .select('*')
      .eq('share_token', token)
      .eq('is_active', true)
      .single();

    if (shareError) {
      if (shareError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
      throw shareError;
    }

    // Check expiration
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This share link has expired' }, { status: 410 });
    }

    // Check password if required
    if (share.password_hash) {
      if (!password) {
        return NextResponse.json({
          passwordRequired: true,
          title: share.title
        }, { status: 200 });
      }

      // Simple password check (compare plain text with stored password)
      if (password !== share.password_hash) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
      }
    }

    // Update view count
    await supabase
      .from('post_plan_shares')
      .update({
        view_count: (share.view_count || 0) + 1,
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', share.id);

    // Load share items with posts
    const { data: items, error: itemsError } = await supabase
      .from('post_plan_share_items')
      .select(`
        *,
        post:posts(
          id,
          content,
          platforms,
          scheduled_for,
          status,
          post_media(id, file_url, thumbnail_url, mime_type, media_type)
        )
      `)
      .eq('share_id', share.id)
      .order('position');

    if (itemsError) throw itemsError;

    // Extract posts from items
    const posts = items
      .filter(item => item.post)
      .map(item => item.post);

    // Load feedback
    const { data: feedback } = await supabase
      .from('post_plan_share_feedback')
      .select('*')
      .eq('share_id', share.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      share: {
        id: share.id,
        title: share.title,
        description: share.description,
        client_name: share.client_name,
        permission: share.permission,
        show_analytics: share.show_analytics,
        expires_at: share.expires_at,
        created_at: share.created_at
      },
      posts,
      feedback: feedback || []
    });
  } catch (error) {
    console.error('Error fetching shared plan:', error);
    return NextResponse.json({ error: 'Failed to load plan' }, { status: 500 });
  }
}

// Handle feedback submission (reactions, comments, approvals)
export async function POST(request, { params }) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { feedbackType, postId, reaction, comment, approved, authorName, password } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Verify share exists and is active
    const { data: share, error: shareError } = await supabase
      .from('post_plan_shares')
      .select('id, is_active, password_hash, permission')
      .eq('share_token', token)
      .eq('is_active', true)
      .single();

    if (shareError || !share) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Verify password if required
    if (share.password_hash && password !== share.password_hash) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Insert feedback
    const feedbackData = {
      share_id: share.id,
      post_id: postId || null,
      feedback_type: feedbackType,
      author_name: authorName || 'Anonymous'
    };

    if (feedbackType === 'reaction') {
      feedbackData.reaction = reaction;
    } else if (feedbackType === 'comment') {
      feedbackData.comment = comment;
    } else if (feedbackType === 'approval') {
      // Rejection requires a comment, approval does not
      if (!approved && (!comment || !comment.trim())) {
        return NextResponse.json({ error: 'Comment is required when requesting changes' }, { status: 400 });
      }
      feedbackData.approved = approved;
      if (comment && comment.trim()) {
        feedbackData.comment = comment;
      }
    }

    const { data: newFeedback, error: feedbackError } = await supabase
      .from('post_plan_share_feedback')
      .insert(feedbackData)
      .select()
      .single();

    if (feedbackError) throw feedbackError;

    return NextResponse.json({ success: true, feedback: newFeedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

// Handle feedback deletion (for reactions toggle)
export async function DELETE(request, { params }) {
  try {
    const { token } = await params;
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const reaction = searchParams.get('reaction');
    const password = searchParams.get('password');

    if (!token || !postId || !reaction) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Verify share exists
    const { data: share, error: shareError } = await supabase
      .from('post_plan_shares')
      .select('id, is_active, password_hash')
      .eq('share_token', token)
      .eq('is_active', true)
      .single();

    if (shareError || !share) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Verify password if required
    if (share.password_hash && password !== share.password_hash) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the reaction
    await supabase
      .from('post_plan_share_feedback')
      .delete()
      .eq('share_id', share.id)
      .eq('post_id', postId)
      .eq('reaction', reaction);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reaction:', error);
    return NextResponse.json({ error: 'Failed to delete reaction' }, { status: 500 });
  }
}
