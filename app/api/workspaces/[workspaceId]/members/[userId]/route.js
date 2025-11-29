/**
 * Single Member API Routes
 *
 * Update or remove a specific member.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';

/**
 * PATCH /api/workspaces/[workspaceId]/members/[userId]
 * Update member role
 */
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient();
    const { workspaceId, userId } = params;

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission (admin or owner)
    const hasPermission = await checkPermission(
      supabase,
      user.id,
      workspaceId,
      'members:update'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Can't update owner
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('owner_id')
      .eq('id', workspaceId)
      .single();

    if (workspace?.owner_id === userId) {
      return NextResponse.json(
        { error: 'Cannot update workspace owner' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { role } = body;

    // Validate role
    const validRoles = ['viewer', 'contributor', 'editor', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Update member role
    const { data: member, error } = await supabase
      .from('workspace_members')
      .update({ role })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .select(`
        user_id,
        role,
        user_profiles (
          full_name,
          email
        )
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({
      member: {
        userId: member.user_id,
        name: member.user_profiles?.full_name,
        email: member.user_profiles?.email,
        role: member.role,
      },
    });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]/members/[userId]
 * Remove member from workspace
 */
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { workspaceId, userId } = params;

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission (admin or owner, or removing self)
    const isSelf = user.id === userId;
    const hasPermission = isSelf || await checkPermission(
      supabase,
      user.id,
      workspaceId,
      'members:delete'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Can't remove owner
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('owner_id')
      .eq('id', workspaceId)
      .single();

    if (workspace?.owner_id === userId) {
      return NextResponse.json(
        { error: 'Cannot remove workspace owner' },
        { status: 400 }
      );
    }

    // Remove member
    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
