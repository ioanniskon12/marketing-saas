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
 * Deletes all workspace data including media files, posts, and accounts
 * NOTE: Does NOT delete posts from Facebook, only from database
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

    console.log('Starting workspace deletion:', workspaceId);

    // Step 1: Get all media files for this workspace to delete from storage
    const { data: allMedia, error: mediaFetchError } = await supabase
      .from('post_media')
      .select('file_url')
      .eq('workspace_id', workspaceId);

    if (mediaFetchError) {
      console.error('Error fetching media for deletion:', mediaFetchError);
    }

    // Step 2: Delete all media files from Supabase storage
    if (allMedia && allMedia.length > 0) {
      console.log(`Deleting ${allMedia.length} media files from storage...`);

      const filePaths = allMedia
        .map(media => {
          // Extract file path from URL
          // URL format: https://[project].supabase.co/storage/v1/object/public/media/[workspace]/[filename]
          const urlParts = media.file_url.split('/media/');
          return urlParts.length === 2 ? urlParts[1] : null;
        })
        .filter(Boolean);

      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('media')
          .remove(filePaths);

        if (storageError) {
          console.error('Error deleting media from storage:', storageError);
          // Continue anyway - we still want to delete from database
        } else {
          console.log(`Successfully deleted ${filePaths.length} files from storage`);
        }
      }
    }

    // Step 3: Delete all posts (database only - NOT from Facebook)
    // This will cascade to post_media table
    const { error: postsDeleteError } = await supabase
      .from('posts')
      .delete()
      .eq('workspace_id', workspaceId);

    if (postsDeleteError) {
      console.error('Error deleting posts:', postsDeleteError);
      throw postsDeleteError;
    }

    console.log('Successfully deleted all posts from database');

    // Step 4: Delete all social accounts
    const { error: accountsDeleteError } = await supabase
      .from('social_accounts')
      .delete()
      .eq('workspace_id', workspaceId);

    if (accountsDeleteError) {
      console.error('Error deleting social accounts:', accountsDeleteError);
      throw accountsDeleteError;
    }

    console.log('Successfully deleted all social accounts');

    // Step 5: Delete workspace (cascade will handle workspace_members and other relations)
    const { error: workspaceDeleteError } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId);

    if (workspaceDeleteError) {
      console.error('Error deleting workspace:', workspaceDeleteError);
      throw workspaceDeleteError;
    }

    console.log('Successfully deleted workspace');

    return NextResponse.json({
      message: 'Workspace and all associated data deleted successfully',
      deletedMedia: allMedia?.length || 0,
    });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json(
      { error: 'Failed to delete workspace' },
      { status: 500 }
    );
  }
}
