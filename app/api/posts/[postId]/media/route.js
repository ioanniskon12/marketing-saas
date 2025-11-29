/**
 * Post Media API Routes
 *
 * Handles media operations for individual posts
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/posts/[postId]/media
 * Add media to a post
 */
export async function POST(request, { params }) {
  try {
    const supabase = await createClient();
    const { postId } = params;

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
    const { media } = body;

    if (!media || !Array.isArray(media) || media.length === 0) {
      return NextResponse.json(
        { error: 'Media array is required' },
        { status: 400 }
      );
    }

    // Get post to verify ownership and get workspace_id
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, workspace_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Add media to post
    const mediaInserts = media.map((item) => ({
      post_id: postId,
      workspace_id: post.workspace_id,
      media_type: item.media_type || 'image',
      file_url: item.file_url,
      thumbnail_url: item.thumbnail_url,
      file_size: item.file_size,
      mime_type: item.mime_type,
      width: item.width,
      height: item.height,
      duration: item.duration,
      display_order: item.display_order || 0,
      alt_text: item.alt_text,
    }));

    const { error: insertError } = await supabase
      .from('post_media')
      .insert(mediaInserts);

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      message: 'Media added to post',
    });
  } catch (error) {
    console.error('Error adding media to post:', error);
    return NextResponse.json(
      { error: 'Failed to add media to post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[postId]/media
 * Delete all media from a post
 */
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { postId } = params;

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete all media for the post
    const { error: deleteError } = await supabase
      .from('post_media')
      .delete()
      .eq('post_id', postId);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Media deleted from post',
    });
  } catch (error) {
    console.error('Error deleting media from post:', error);
    return NextResponse.json(
      { error: 'Failed to delete media from post' },
      { status: 500 }
    );
  }
}
