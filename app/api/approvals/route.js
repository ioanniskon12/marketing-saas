/**
 * Content Approval Workflow API
 *
 * Manage post approval workflows.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';

/**
 * GET /api/approvals
 * Get approval requests for workspace
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');
    const status = searchParams.get('status');

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

    let query = supabase
      .from('post_approvals')
      .select(`
        *,
        posts (
          id,
          content,
          platforms,
          scheduled_for,
          created_at
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('submitted_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: approvals, error: approvalsError } = await query;

    if (approvalsError) throw approvalsError;

    return NextResponse.json({ approvals: approvals || [] });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
  }
}

/**
 * POST /api/approvals
 * Submit post for approval
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { post_id, workspace_id, workflow_id, comments } = body;

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!post_id || !workspace_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hasPermission = await checkPermission(supabase, user.id, workspace_id, 'posts:create');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: approval, error: insertError } = await supabase
      .from('post_approvals')
      .insert({
        post_id,
        workspace_id,
        workflow_id,
        status: 'pending',
        current_step: 0,
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
        comments,
        approvers: [],
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ approval });
  } catch (error) {
    console.error('Error creating approval:', error);
    return NextResponse.json({ error: 'Failed to create approval' }, { status: 500 });
  }
}

/**
 * PATCH /api/approvals
 * Update approval status (approve/reject)
 */
export async function PATCH(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { approval_id, action, comments } = body; // action: 'approve' or 'reject'

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!approval_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get approval
    const { data: approval } = await supabase
      .from('post_approvals')
      .select('*, posts(*)')
      .eq('id', approval_id)
      .single();

    if (!approval) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
    }

    const hasPermission = await checkPermission(
      supabase,
      user.id,
      approval.workspace_id,
      'posts:approve'
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const approvers = approval.approvers || [];
    approvers.push({
      user_id: user.id,
      action,
      comments,
      timestamp: new Date().toISOString(),
    });

    const updateData = {
      status: action === 'approve' ? 'approved' : 'rejected',
      approvers,
      completed_at: new Date().toISOString(),
    };

    // If approved, update post status
    if (action === 'approve') {
      await supabase
        .from('posts')
        .update({ status: approval.posts.scheduled_for ? 'scheduled' : 'draft' })
        .eq('id', approval.post_id);
    }

    const { data: updated, error: updateError } = await supabase
      .from('post_approvals')
      .update(updateData)
      .eq('id', approval_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ approval: updated });
  } catch (error) {
    console.error('Error updating approval:', error);
    return NextResponse.json({ error: 'Failed to update approval' }, { status: 500 });
  }
}
