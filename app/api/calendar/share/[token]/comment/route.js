/**
 * Calendar Share Comment API
 *
 * POST /api/calendar/share/[token]/comment
 * Add a comment to a shared calendar post (public, no authentication required)
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendNewCommentEmail } from '@/lib/email/shareNotifications';

/**
 * Sanitize input to prevent XSS
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * POST /api/calendar/share/[token]/comment
 * Add a comment to a shared calendar post
 */
export async function POST(request, { params }) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: 'Share token is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { postId, authorName, authorEmail, comment } = body;

    // Validate required fields
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    if (!authorName || authorName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Author name is required' },
        { status: 400 }
      );
    }

    if (!authorEmail || !isValidEmail(authorEmail)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    // Validate comment length
    if (comment.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be less than 2000 characters' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Query calendar share by token
    const { data: calendarShare, error: shareError } = await supabase
      .from('calendar_shares')
      .select('*')
      .eq('share_token', token)
      .eq('is_active', true)
      .single();

    if (shareError || !calendarShare) {
      return NextResponse.json(
        { error: 'Calendar share not found or has been deactivated' },
        { status: 404 }
      );
    }

    // Check if share has expired
    if (calendarShare.expires_at) {
      const expiryDate = new Date(calendarShare.expires_at);
      const now = new Date();

      if (expiryDate < now) {
        return NextResponse.json(
          { error: 'This calendar share has expired' },
          { status: 410 }
        );
      }
    }

    // Check if permission level allows comments
    if (!['comment', 'approve'].includes(calendarShare.permission_level)) {
      return NextResponse.json(
        { error: 'Comments are not allowed for this calendar share' },
        { status: 403 }
      );
    }

    // Verify post exists and belongs to this workspace
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .eq('workspace_id', calendarShare.workspace_id)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found in this calendar' },
        { status: 404 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(authorName.trim());
    const sanitizedEmail = sanitizeInput(authorEmail.trim().toLowerCase());
    const sanitizedComment = sanitizeInput(comment.trim());

    // Insert comment
    const { data: newComment, error: commentError } = await supabase
      .from('calendar_share_comments')
      .insert({
        calendar_share_id: calendarShare.id,
        post_id: postId,
        author_name: sanitizedName,
        author_email: sanitizedEmail,
        comment: sanitizedComment,
        is_resolved: false,
      })
      .select()
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      throw commentError;
    }

    // Get visitor information for activity log
    const visitorIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const visitorDevice = request.headers.get('user-agent') || 'unknown';
    const visitorCountry = request.headers.get('x-vercel-ip-country') ||
                          request.headers.get('cf-ipcountry') ||
                          null;

    // Log comment activity
    await supabase
      .from('calendar_share_activity')
      .insert({
        calendar_share_id: calendarShare.id,
        activity_type: 'comment',
        visitor_ip: visitorIp,
        visitor_device: visitorDevice,
        visitor_country: visitorCountry,
        metadata: {
          post_id: postId,
          author_name: sanitizedName,
          comment_id: newComment.id,
        },
      });

    // Send email notification to workspace owner
    try {
      // Get workspace owner email
      const { data: workspace } = await supabase
        .from('workspaces')
        .select(`
          id,
          workspace_members!inner (
            user_id,
            role,
            users!inner (
              email
            )
          )
        `)
        .eq('id', calendarShare.workspace_id)
        .eq('workspace_members.role', 'owner')
        .single();

      if (workspace && workspace.workspace_members?.[0]?.users?.email) {
        const ownerEmail = workspace.workspace_members[0].users.email;

        await sendNewCommentEmail(
          ownerEmail,
          {
            authorName: sanitizedName,
            authorEmail: sanitizedEmail,
            comment: sanitizedComment,
            postContent: post.content || '',
            createdAt: newComment.created_at,
          },
          calendarShare.title
        );
      }
    } catch (emailError) {
      // Log but don't fail the request if email fails
      console.error('Error sending comment notification email:', emailError);
    }

    return NextResponse.json({
      success: true,
      comment: newComment,
      message: 'Comment added successfully',
    });

  } catch (error) {
    console.error('Error in POST /api/calendar/share/[token]/comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
