/**
 * Posts API Routes
 *
 * CRUD operations for scheduled posts.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions/rbac';

/**
 * GET /api/posts
 * Get all posts for a workspace
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate workspace
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(
      supabase,
      user.id,
      workspaceId,
      'posts:read'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Build query
    let query = supabase
      .from('posts')
      .select(`
        *,
        post_media (*)
      `)
      .eq('workspace_id', workspaceId)
      .order('scheduled_for', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (startDate && endDate) {
      query = query
        .gte('scheduled_for', startDate)
        .lte('scheduled_for', endDate);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      posts: posts || [],
      count: posts?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts
 * Create a new post
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

    // Parse request body
    const body = await request.json();
    const {
      workspace_id,
      content,
      content_type = 'feed',
      scheduled_for,
      platforms,
      media,
      hashtags,
      status = 'draft',
      platform_data,
      post_now = false,
    } = body;

    // Validate input
    if (!workspace_id) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Get content from platform_data if not provided directly
    let postContent = content;
    if ((!content || content.trim() === '') && platform_data) {
      // Get content from the first platform's data
      const firstPlatformKey = Object.keys(platform_data)[0];
      if (firstPlatformKey && platform_data[firstPlatformKey]?.content) {
        postContent = platform_data[firstPlatformKey].content;
      }
    }

    if (!postContent || postContent.trim() === '') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // For scheduled posts, platforms are required. For drafts, they can be added later.
    if (status !== 'draft' && (!platforms || platforms.length === 0)) {
      return NextResponse.json(
        { error: 'At least one platform is required for scheduled posts' },
        { status: 400 }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(
      supabase,
      user.id,
      workspace_id,
      'posts:create'
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get media and hashtags from platform_data if not provided directly
    let postMedia = media;
    let postHashtags = hashtags;
    if (platform_data) {
      const firstPlatformKey = Object.keys(platform_data)[0];
      if (firstPlatformKey) {
        if (!media && platform_data[firstPlatformKey]?.media) {
          postMedia = platform_data[firstPlatformKey].media;
        }
        if (!hashtags && platform_data[firstPlatformKey]?.hashtags) {
          postHashtags = platform_data[firstPlatformKey].hashtags;
        }
      }
    }

    // Determine scheduled_for and status based on post_now
    let finalScheduledFor = scheduled_for;
    let finalStatus = status;

    if (post_now) {
      // Set to current time so it shows in calendar
      finalScheduledFor = new Date().toISOString();
      // Set to 'publishing' - the publish endpoint will change it to 'published' on success
      finalStatus = 'publishing';
    }

    // Create post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        workspace_id,
        created_by: user.id,
        content: postContent,
        content_type,
        scheduled_for: finalScheduledFor || null,
        platforms: platforms || [],
        hashtags: postHashtags || [],
        status: finalStatus,
      })
      .select()
      .single();

    if (postError) throw postError;

    // Add media if provided
    if (postMedia && postMedia.length > 0) {
      // Only insert media that's not from library (new uploads)
      // Media from library already exists in post_media table
      const newMedia = postMedia.filter(item => !item.from_library && !item.media_id);

      if (newMedia.length > 0) {
        const mediaInserts = newMedia.map((item, index) => ({
          post_id: post.id,
          workspace_id,
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

      // For media from library, update the post_id to link it to this post
      const libraryMedia = postMedia.filter(item => item.from_library && item.media_id);

      if (libraryMedia.length > 0) {
        for (const item of libraryMedia) {
          const { error: updateError } = await supabase
            .from('post_media')
            .update({ post_id: post.id, display_order: item.display_order })
            .eq('id', item.media_id)
            .eq('workspace_id', workspace_id);

          if (updateError) throw updateError;
        }
      }
    }

    // Fetch complete post with media
    const { data: completePost, error: fetchError } = await supabase
      .from('posts')
      .select(`
        *,
        post_media (*)
      `)
      .eq('id', post.id)
      .single();

    if (fetchError) throw fetchError;

    // If post_now is true, publish immediately
    // Force recompile
    if (post_now) {
      try {
        // Construct publish URL - use localhost for dev, production URL for Vercel
        const host = request.headers.get('host');
        const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
        const protocol = isLocalhost ? 'http' : 'https';
        const publishUrl = `${protocol}://${host}/api/posts/${post.id}/publish`;
        console.log('Publishing to URL:', publishUrl);
        console.log('Post ID:', post.id);

        // Forward cookies from the original request
        const cookie = request.headers.get('cookie');
        const headers = {
          'Content-Type': 'application/json',
        };
        if (cookie) {
          headers['cookie'] = cookie;
        }

        const publishResponse = await fetch(publishUrl, {
          method: 'POST',
          headers,
        });

        console.log('Publish response status:', publishResponse.status);
        console.log('Publish response ok:', publishResponse.ok);

        const publishResult = await publishResponse.json();
        console.log('Publish result:', publishResult);

        if (!publishResult.success) {
          console.error('Publish error:', publishResult.errors);
        }

        // Return the post with publish result
        return NextResponse.json({
          post: completePost,
          publishResult,
        }, { status: 201 });
      } catch (publishError) {
        console.error('Error publishing post:', publishError);
        // Still return success for post creation even if publish failed
        return NextResponse.json({
          post: completePost,
          publishError: publishError.message,
        }, { status: 201 });
      }
    }

    return NextResponse.json({
      post: completePost,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
