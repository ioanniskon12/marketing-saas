/**
 * Single Post API Routes
 *
 * Operations for a specific post.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';

/**
 * GET /api/posts/[postId]
 * Get a specific post
 */
export async function GET(request, { params }) {
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

    // Get post with media
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_media (*)
      `)
      .eq('id', postId)
      .single();

    if (error || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(
      supabase,
      user.id,
      post.workspace_id,
      'posts:read'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/posts/[postId]
 * Update a post
 */
export async function PATCH(request, { params }) {
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

    // Get existing post
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check permission (must be owner OR have editor+ role)
    const isOwner = existingPost.created_by === user.id;
    const canUpdate = isOwner || await checkPermission(
      supabase,
      user.id,
      existingPost.workspace_id,
      'posts:update'
    );

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      content,
      scheduled_for,
      platforms,
      status,
      media
    } = body;

    // Build update object
    const updateData = {};
    if (content !== undefined) updateData.content = content;
    if (scheduled_for !== undefined) updateData.scheduled_for = scheduled_for;
    if (platforms !== undefined) updateData.platforms = platforms;
    if (status !== undefined) updateData.status = status;

    console.log('PATCH update data:', { postId, updateData, original_scheduled_for: existingPost.scheduled_for });

    // Update post
    const { data: post, error: updateError } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();

    console.log('PATCH result:', { updated_post: post });

    if (updateError) throw updateError;

    // Update media if provided
    if (media !== undefined) {
      // Delete existing media
      await supabase
        .from('post_media')
        .delete()
        .eq('post_id', postId);

      // Insert new media
      if (media.length > 0) {
        const mediaInserts = media.map((item, index) => ({
          post_id: postId,
          workspace_id: existingPost.workspace_id,
          media_type: item.media_type,
          file_url: item.file_url,
          thumbnail_url: item.thumbnail_url,
          file_size: item.file_size,
          mime_type: item.mime_type,
          width: item.width,
          height: item.height,
          duration: item.duration,
          display_order: index,
          alt_text: item.alt_text,
        }));

        const { error: mediaError } = await supabase
          .from('post_media')
          .insert(mediaInserts);

        if (mediaError) throw mediaError;
      }
    }

    // Update on Facebook if post was already published (check published_at instead of status)
    if (existingPost.published_at && existingPost.platform_posts && content !== undefined) {
      // platform_posts is a JSON object with account IDs as keys
      for (const [accountId, platformData] of Object.entries(existingPost.platform_posts)) {
        if (platformData.platform === 'facebook' && platformData.platform_post_id) {
          try {
            // Get the access token from social_accounts
            const { data: account } = await supabase
              .from('social_accounts')
              .select('access_token')
              .eq('id', accountId)
              .single();

            if (!account || !account.access_token) {
              console.error('Facebook account or access token not found');
              continue;
            }

            const accessToken = account.access_token;
            const fbPostId = platformData.platform_post_id;

            console.log('Updating Facebook post:', fbPostId, 'with content:', content);

            // Call Facebook Graph API to update the post
            // Note: Facebook only allows updating the message, not media
            const response = await fetch(
              `https://graph.facebook.com/v18.0/${fbPostId}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  message: content,
                  access_token: accessToken,
                }),
              }
            );

            const data = await response.json();

            if (!response.ok) {
              console.error('Failed to update Facebook post:', data);
              // Don't throw - continue with database update even if Facebook update fails
            } else {
              console.log('Successfully updated Facebook post');
            }
          } catch (fbError) {
            console.error('Error updating Facebook post:', fbError);
            // Don't throw - continue with database update
          }
        }
      }
    }

    // Fetch complete post with media
    const { data: completePost, error: fetchCompleteError } = await supabase
      .from('posts')
      .select(`
        *,
        post_media (*)
      `)
      .eq('id', postId)
      .single();

    if (fetchCompleteError) throw fetchCompleteError;

    return NextResponse.json({ post: completePost });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[postId]
 * Delete a post
 * Query param: deleteFromFacebook=true to also delete from Facebook
 */
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { postId } = params;

    // Check if we should delete from Facebook
    const { searchParams } = new URL(request.url);
    const deleteFromFacebook = searchParams.get('deleteFromFacebook') === 'true';

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get existing post
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check permission (must be owner OR have editor+ role)
    const isOwner = existingPost.created_by === user.id;
    const canDelete = isOwner || await checkPermission(
      supabase,
      user.id,
      existingPost.workspace_id,
      'posts:delete'
    );

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Delete from Facebook if requested and post was published
    if (deleteFromFacebook && existingPost.status === 'published' && existingPost.platform_posts) {
      // platform_posts is a JSON object with account IDs as keys
      for (const [accountId, platformData] of Object.entries(existingPost.platform_posts)) {
        if (platformData.platform === 'facebook' && platformData.platform_post_id) {
          try {
            // Get the access token from social_accounts
            const { data: account } = await supabase
              .from('social_accounts')
              .select('access_token')
              .eq('id', accountId)
              .single();

            if (!account || !account.access_token) {
              console.error('Facebook account or access token not found');
              continue;
            }

            const accessToken = account.access_token;
            const fbPostId = platformData.platform_post_id;

            console.log('Deleting Facebook post:', fbPostId);

            // Call Facebook Graph API to delete the post
            const response = await fetch(
              `https://graph.facebook.com/v18.0/${fbPostId}?access_token=${accessToken}`,
              {
                method: 'DELETE',
              }
            );

            const data = await response.json();

            if (!response.ok) {
              console.error('Failed to delete from Facebook:', data);
              // Don't throw - continue with database deletion even if Facebook deletion fails
            } else {
              console.log('Successfully deleted from Facebook');
            }
          } catch (fbError) {
            console.error('Error deleting from Facebook:', fbError);
            // Don't throw - continue with database deletion
          }
        }
      }
    }

    // Delete post (cascade will handle media and analytics)
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;

    return NextResponse.json({
      message: deleteFromFacebook ? 'Post deleted from calendar and Facebook' : 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
