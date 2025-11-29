/**
 * Workspace Members API Routes
 *
 * Manage team members in a workspace.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';

/**
 * GET /api/workspaces/[workspaceId]/members
 * Get all members of a workspace
 */
export async function GET(request, { params }) {
  try {
    const supabase = await createClient();
    const { workspaceId } = params;

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is member of workspace
    const hasPermission = await checkPermission(
      supabase,
      user.id,
      workspaceId,
      'members:read'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get workspace members
    const { data: members, error } = await supabase
      .from('workspace_members')
      .select('user_id, role, created_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Get workspace owner
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('owner_id')
      .eq('id', workspaceId)
      .single();

    // Format response with basic info (user details will be fetched client-side if needed)
    const formattedMembers = members.map(member => ({
      userId: member.user_id,
      name: 'User',
      email: '',
      avatarUrl: null,
      role: member.role,
      isOwner: member.user_id === workspace?.owner_id,
      joinedAt: member.created_at,
    }));

    return NextResponse.json({
      members: formattedMembers,
      count: formattedMembers.length,
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces/[workspaceId]/members
 * Add a member to workspace
 */
export async function POST(request, { params }) {
  try {
    const supabase = await createClient();
    const { workspaceId } = params;

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
      'members:create'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, role = 'viewer' } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['viewer', 'contributor', 'editor', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // For now, return an error - this feature needs proper user management setup
    return NextResponse.json(
      { error: 'Adding members is not yet supported. Please contact support.' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { error: 'Failed to add member' },
      { status: 500 }
    );
  }
}
