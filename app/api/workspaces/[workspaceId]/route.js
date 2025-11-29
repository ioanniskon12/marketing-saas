/**
 * Single Workspace API Routes
 *
 * Operations for a specific workspace.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';

/**
 * GET /api/workspaces/[workspaceId]
 * Get a specific workspace
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

    // Get workspace with membership info
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select(`
        *,
        workspace_members!inner (
          role,
          created_at
        )
      `)
      .eq('id', workspaceId)
      .eq('workspace_members.user_id', user.id)
      .single();

    if (error || !workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        logo_url: workspace.logo_url,
        logo_size: workspace.logo_size,
        ownerId: workspace.owner_id,
        subscriptionPlan: workspace.subscription_plan,
        subscriptionStatus: workspace.subscription_status,
        role: workspace.workspace_members[0]?.role,
        createdAt: workspace.created_at,
        memberSince: workspace.workspace_members[0]?.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/workspaces/[workspaceId]
 * Update a workspace
 */
export async function PATCH(request, { params }) {
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
      'workspace:update'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, logo_url, logo_size } = body;

    // Validate input
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = { name };
    if (logo_url !== undefined) {
      updateData.logo_url = logo_url || null;
    }
    if (logo_size !== undefined) {
      if (!['small', 'medium', 'large'].includes(logo_size)) {
        return NextResponse.json(
          { error: 'Invalid logo size. Must be: small, medium, or large' },
          { status: 400 }
        );
      }
      updateData.logo_size = logo_size;
    }

    // Update workspace
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .update(updateData)
      .eq('id', workspaceId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        logo_url: workspace.logo_url,
        logo_size: workspace.logo_size,
        updatedAt: workspace.updated_at,
      },
    });
  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to update workspace' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]
 * Delete a workspace (owner only)
 */
export async function DELETE(request, { params }) {
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

    // Check if user is owner
    const hasPermission = await checkPermission(
      supabase,
      user.id,
      workspaceId,
      'workspace:delete'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Only workspace owner can delete workspace' },
        { status: 403 }
      );
    }

    // Delete workspace (cascade will handle members)
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId);

    if (error) throw error;

    return NextResponse.json({
      message: 'Workspace deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json(
      { error: 'Failed to delete workspace' },
      { status: 500 }
    );
  }
}
