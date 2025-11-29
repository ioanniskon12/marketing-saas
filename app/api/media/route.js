/**
 * Media Library API
 *
 * GET - Fetch all media for current workspace
 * POST - Upload media to workspace library
 * PATCH - Update media details (rename)
 * DELETE - Delete media from library
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/media
 * Fetch all media for the current workspace
 */
export async function GET(request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const mediaType = searchParams.get('type'); // 'image', 'video', or null for all

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this workspace
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Access denied to this workspace' },
        { status: 403 }
      );
    }

    // Build media query - fetch all media for workspace (including library-only media without post)
    let mediaQuery = supabase
      .from('post_media')
      .select(`
        id,
        file_url,
        file_name,
        file_size,
        mime_type,
        thumbnail_url,
        width,
        height,
        duration,
        created_at,
        post_id,
        posts (
          id,
          content,
          status,
          scheduled_for,
          platforms,
          workspace_id
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    // Apply media type filter if specified
    if (mediaType === 'image') {
      mediaQuery = mediaQuery.like('mime_type', 'image/%');
    } else if (mediaType === 'video') {
      mediaQuery = mediaQuery.like('mime_type', 'video/%');
    }

    const { data: media, error: mediaError } = await mediaQuery;

    if (mediaError) {
      console.error('Error fetching media:', mediaError);
      throw mediaError;
    }

    // Format the response
    const formattedMedia = (media || []).map(item => ({
      id: item.id,
      file_url: item.file_url,
      file_name: item.file_name,
      file_size: item.file_size,
      mime_type: item.mime_type,
      thumbnail_url: item.thumbnail_url,
      width: item.width,
      height: item.height,
      duration: item.duration,
      created_at: item.created_at,
      post: item.posts ? {
        id: item.posts.id,
        content: item.posts.content,
        status: item.posts.status,
        scheduled_for: item.posts.scheduled_for,
        platforms: item.posts.platforms,
      } : null,
    }));

    // Calculate statistics
    const stats = {
      total: formattedMedia.length,
      images: formattedMedia.filter(m => m.mime_type?.startsWith('image/')).length,
      videos: formattedMedia.filter(m => m.mime_type?.startsWith('video/')).length,
      total_size: formattedMedia.reduce((sum, m) => sum + (m.file_size || 0), 0),
    };

    return NextResponse.json({
      media: formattedMedia,
      stats,
    });

  } catch (error) {
    console.error('Error in GET /api/media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/media
 * Upload media files to workspace library
 */
export async function POST(request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const workspaceId = formData.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this workspace
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Access denied to this workspace' },
        { status: 403 }
      );
    }

    // Get all files from form data
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedMedia = [];
    const errors = [];

    // Process each file
    for (const file of files) {
      try {
        // Validate file type
        const validTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif',
          'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
        ];

        if (!validTypes.includes(file.type)) {
          errors.push(`${file.name}: Invalid file type`);
          continue;
        }

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
          errors.push(`${file.name}: File too large (max 50MB)`);
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${workspaceId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          errors.push(`${file.name}: ${uploadError.message}`);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(uploadData.path);

        // Determine media type
        const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

        // Create post_media entry (without post_id for library uploads)
        const { data: mediaEntry, error: insertError } = await supabase
          .from('post_media')
          .insert({
            workspace_id: workspaceId,
            post_id: null, // Library upload, not attached to a post yet
            media_type: mediaType,
            file_url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            display_order: 0,
          })
          .select()
          .single();

        if (insertError) {
          errors.push(`${file.name}: Failed to save to database - ${insertError.message}`);
          // Try to clean up uploaded file
          await supabase.storage.from('media').remove([fileName]);
          continue;
        }

        uploadedMedia.push(mediaEntry);
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        errors.push(`${file.name}: ${fileError.message}`);
      }
    }

    return NextResponse.json({
      message: `Successfully uploaded ${uploadedMedia.length} of ${files.length} files`,
      uploaded: uploadedMedia,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error in POST /api/media:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/media
 * Update media details (rename file)
 */
export async function PATCH(request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { mediaId, fileName, workspaceId } = body;

    if (!mediaId || !fileName || !workspaceId) {
      return NextResponse.json(
        { error: 'Media ID, file name, and workspace ID are required' },
        { status: 400 }
      );
    }

    // Verify user has access to this workspace
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Access denied to this workspace' },
        { status: 403 }
      );
    }

    // Update media file name
    const { data: updatedMedia, error: updateError } = await supabase
      .from('post_media')
      .update({ file_name: fileName })
      .eq('id', mediaId)
      .eq('workspace_id', workspaceId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating media:', updateError);
      throw updateError;
    }

    return NextResponse.json({
      message: 'Media updated successfully',
      media: updatedMedia,
    });

  } catch (error) {
    console.error('Error in PATCH /api/media:', error);
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/media
 * Delete media from library and storage
 */
export async function DELETE(request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');
    const workspaceId = searchParams.get('workspaceId');

    if (!mediaId || !workspaceId) {
      return NextResponse.json(
        { error: 'Media ID and workspace ID are required' },
        { status: 400 }
      );
    }

    // Verify user has access to this workspace
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Access denied to this workspace' },
        { status: 403 }
      );
    }

    // Get media details to find storage path
    const { data: media, error: mediaError } = await supabase
      .from('post_media')
      .select('file_url')
      .eq('id', mediaId)
      .eq('workspace_id', workspaceId)
      .single();

    if (mediaError || !media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // Extract file path from URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/media/[workspace]/[filename]
    const urlParts = media.file_url.split('/media/');
    if (urlParts.length === 2) {
      const filePath = urlParts[1];

      // Delete from storage
      await supabase.storage
        .from('media')
        .remove([filePath]);
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('post_media')
      .delete()
      .eq('id', mediaId)
      .eq('workspace_id', workspaceId);

    if (deleteError) {
      console.error('Error deleting media:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({
      message: 'Media deleted successfully',
    });

  } catch (error) {
    console.error('Error in DELETE /api/media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
