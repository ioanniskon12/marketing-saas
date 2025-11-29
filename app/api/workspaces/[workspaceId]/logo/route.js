/**
 * Workspace Logo Upload API
 *
 * POST - Upload workspace logo
 * DELETE - Delete workspace logo
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';

/**
 * POST /api/workspaces/[workspaceId]/logo
 * Upload workspace logo
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
      'workspace:update'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPG, PNG, WEBP, or SVG image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Delete old logo if exists
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('logo_url')
      .eq('id', workspaceId)
      .single();

    if (workspace?.logo_url && workspace.logo_url.includes('workspace-logos')) {
      const oldPath = workspace.logo_url.split('/workspace-logos/')[1];
      if (oldPath) {
        await supabase.storage
          .from('workspace-logos')
          .remove([oldPath]);
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${workspaceId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to storage
    console.log('[Logo Upload] Uploading to storage:', fileName);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('workspace-logos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Logo Upload] Storage upload error:', uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    console.log('[Logo Upload] Upload successful:', uploadData);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('workspace-logos')
      .getPublicUrl(uploadData.path);

    console.log('[Logo Upload] Public URL:', publicUrl);

    // Update workspace with logo URL
    console.log('[Logo Upload] Updating workspace in database...');
    const { data: updatedWorkspace, error: updateError } = await supabase
      .from('workspaces')
      .update({ logo_url: publicUrl })
      .eq('id', workspaceId)
      .select()
      .single();

    if (updateError) {
      console.error('[Logo Upload] Database update error:', updateError);
      return NextResponse.json(
        { error: `Database update failed: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.log('[Logo Upload] Database updated successfully:', updatedWorkspace);

    return NextResponse.json({
      message: 'Logo uploaded successfully',
      logo_url: publicUrl,
      workspace: {
        id: updatedWorkspace.id,
        name: updatedWorkspace.name,
        logo_url: updatedWorkspace.logo_url,
      },
    });

  } catch (error) {
    console.error('Error uploading logo:', error);
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]/logo
 * Delete workspace logo
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

    // Check permission
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

    // Get workspace logo
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('logo_url')
      .eq('id', workspaceId)
      .single();

    // Delete from storage if it's stored there
    if (workspace?.logo_url && workspace.logo_url.includes('workspace-logos')) {
      const path = workspace.logo_url.split('/workspace-logos/')[1];
      if (path) {
        await supabase.storage
          .from('workspace-logos')
          .remove([path]);
      }
    }

    // Remove logo URL from workspace
    const { error: updateError } = await supabase
      .from('workspaces')
      .update({ logo_url: null })
      .eq('id', workspaceId);

    if (updateError) throw updateError;

    return NextResponse.json({
      message: 'Logo deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting logo:', error);
    return NextResponse.json(
      { error: 'Failed to delete logo' },
      { status: 500 }
    );
  }
}
