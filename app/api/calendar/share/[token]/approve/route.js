/**
 * Calendar Share Approval API
 *
 * POST /api/calendar/share/[token]/approve
 * Approve or reject a shared calendar post (public, no authentication required)
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendApprovalReceivedEmail } from '@/lib/email/shareNotifications';

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
 * POST /api/calendar/share/[token]/approve
 * Add an approval/rejection for a shared calendar post
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
    const { postId, approved, approverName, approverEmail, feedback } = body;

    // Validate required fields
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Approval status (approved) must be a boolean' },
        { status: 400 }
      );
    }

    if (!approverName || approverName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Approver name is required' },
        { status: 400 }
      );
    }

    if (!approverEmail || !isValidEmail(approverEmail)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Validate feedback length if provided
    if (feedback && feedback.length > 2000) {
      return NextResponse.json(
        { error: 'Feedback must be less than 2000 characters' },
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

    // Check if permission level allows approvals
    if (calendarShare.permission_level !== 'approve') {
      return NextResponse.json(
        { error: 'Approvals are not allowed for this calendar share' },
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
    const sanitizedName = sanitizeInput(approverName.trim());
    const sanitizedEmail = sanitizeInput(approverEmail.trim().toLowerCase());
    const sanitizedFeedback = feedback ? sanitizeInput(feedback.trim()) : null;

    // Check if this approver has already submitted an approval for this post
    const { data: existingApproval } = await supabase
      .from('calendar_share_approvals')
      .select('id')
      .eq('calendar_share_id', calendarShare.id)
      .eq('post_id', postId)
      .eq('approver_email', sanitizedEmail)
      .single();

    if (existingApproval) {
      return NextResponse.json(
        { error: 'You have already submitted an approval for this post' },
        { status: 409 }
      );
    }

    // Insert approval
    const { data: newApproval, error: approvalError } = await supabase
      .from('calendar_share_approvals')
      .insert({
        calendar_share_id: calendarShare.id,
        post_id: postId,
        approver_name: sanitizedName,
        approver_email: sanitizedEmail,
        approved,
        feedback: sanitizedFeedback,
      })
      .select()
      .single();

    if (approvalError) {
      console.error('Error creating approval:', approvalError);
      throw approvalError;
    }

    // Get visitor information for activity log
    const visitorIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const visitorDevice = request.headers.get('user-agent') || 'unknown';
    const visitorCountry = request.headers.get('x-vercel-ip-country') ||
                          request.headers.get('cf-ipcountry') ||
                          null;

    // Log approval activity
    await supabase
      .from('calendar_share_activity')
      .insert({
        calendar_share_id: calendarShare.id,
        activity_type: 'approve',
        visitor_ip: visitorIp,
        visitor_device: visitorDevice,
        visitor_country: visitorCountry,
        metadata: {
          post_id: postId,
          approver_name: sanitizedName,
          approved,
          approval_id: newApproval.id,
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

        await sendApprovalReceivedEmail(
          ownerEmail,
          {
            approverName: sanitizedName,
            approverEmail: sanitizedEmail,
            approved,
            feedback: sanitizedFeedback,
            postContent: post.content || '',
            createdAt: newApproval.created_at,
          },
          calendarShare.title
        );
      }
    } catch (emailError) {
      // Log but don't fail the request if email fails
      console.error('Error sending approval notification email:', emailError);
    }

    return NextResponse.json({
      success: true,
      approval: newApproval,
      message: approved
        ? 'Post approved successfully'
        : 'Post rejection submitted successfully',
    });

  } catch (error) {
    console.error('Error in POST /api/calendar/share/[token]/approve:', error);
    return NextResponse.json(
      { error: 'Failed to submit approval' },
      { status: 500 }
    );
  }
}
