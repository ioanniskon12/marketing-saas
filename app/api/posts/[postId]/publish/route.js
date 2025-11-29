import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const supabase = await createClient();
    const { postId } = params;
    const id = postId;

    console.log('Publishing post with ID:', id);

    // Get the post with media
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*, workspace_id, post_media(*)')
      .eq('id', id)
      .single();

    console.log('Post query result:', { post, postError });

    if (postError || !post) {
      console.error('Post not found:', { id, postError });
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Get social accounts for this post
    const accountIds = Array.isArray(post.platforms) ? post.platforms : [];

    if (accountIds.length === 0) {
      return NextResponse.json(
        { error: 'No accounts selected for this post' },
        { status: 400 }
      );
    }

    const { data: accounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('*')
      .in('id', accountIds);

    console.log('Found accounts:', accounts?.map(a => ({
      id: a.id,
      platform: a.platform,
      platform_account_id: a.platform_account_id,
      platform_display_name: a.platform_display_name,
      account_type: a.account_type,
      token_preview: a.access_token?.substring(0, 20) + '...'
    })));

    if (accountsError || !accounts || accounts.length === 0) {
      return NextResponse.json(
        { error: 'Social accounts not found' },
        { status: 404 }
      );
    }

    const platformPosts = {};
    const errors = [];

    // Publish to each platform
    for (const account of accounts) {
      try {
        let result;

        if (account.platform === 'facebook') {
          result = await publishToFacebook(post, account);
        } else if (account.platform === 'instagram') {
          result = await publishToInstagram(post, account);
        } else {
          errors.push(`Platform ${account.platform} not supported yet`);
          continue;
        }

        if (result.success) {
          platformPosts[account.id] = {
            platform: account.platform,
            platform_post_id: result.postId,
            post_url: result.postUrl,
            published_at: new Date().toISOString(),
          };
        } else {
          errors.push(`${account.platform}: ${result.error}`);
        }
      } catch (error) {
        console.error(`Error publishing to ${account.platform}:`, error);
        errors.push(`${account.platform}: ${error.message}`);
      }
    }

    // Update post with platform post data
    const updateData = {
      platform_posts: platformPosts,
      status: Object.keys(platformPosts).length > 0 ? 'published' : 'failed',
      published_at: Object.keys(platformPosts).length > 0 ? new Date().toISOString() : null,
      error_message: errors.length > 0 ? errors.join('; ') : null,
    };

    const { error: updateError } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating post:', updateError);
    }

    return NextResponse.json({
      success: Object.keys(platformPosts).length > 0,
      platformPosts,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error in publish route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish post' },
      { status: 500 }
    );
  }
}

async function publishToFacebook(post, account) {
  try {
    const pageAccessToken = account.access_token;
    const pageId = account.platform_account_id;

    if (!pageAccessToken || !pageId) {
      return { success: false, error: 'Missing Facebook credentials' };
    }

    // Prepare the post message
    let message = post.content || '';

    // Add hashtags
    if (post.hashtags && post.hashtags.length > 0) {
      const hashtagString = post.hashtags.map(tag => `#${tag}`).join(' ');
      message = message + '\n\n' + hashtagString;
    }

    console.log('Publishing to Facebook:', {
      pageId,
      hasMedia: post.post_media && post.post_media.length > 0,
      mediaCount: post.post_media?.length || 0
    });

    // Get media if available
    const media = post.post_media || [];
    const imageMedia = media.filter(m => m.media_type === 'image');

    let response, data;

    // Case 1: Single image post
    if (imageMedia.length === 1) {
      console.log('Publishing single image post');
      const params = new URLSearchParams({
        access_token: pageAccessToken,
        message: message,
        url: imageMedia[0].file_url,
      });

      response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/photos`,
        {
          method: 'POST',
          body: params,
        }
      );

      data = await response.json();
    }
    // Case 2: Multiple images (carousel/album)
    else if (imageMedia.length > 1) {
      console.log('Publishing multiple images as album');

      // First, upload all photos unpublished
      const photoIds = [];
      for (const mediaItem of imageMedia) {
        const params = new URLSearchParams({
          access_token: pageAccessToken,
          url: mediaItem.file_url,
          published: 'false',
        });

        const photoResponse = await fetch(
          `https://graph.facebook.com/v18.0/${pageId}/photos`,
          {
            method: 'POST',
            body: params,
          }
        );

        const photoData = await photoResponse.json();
        if (photoData.id) {
          photoIds.push({ media_fbid: photoData.id });
        }
      }

      // Now publish all photos together with the message
      const params = new URLSearchParams({
        access_token: pageAccessToken,
        message: message,
        attached_media: JSON.stringify(photoIds),
      });

      response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        {
          method: 'POST',
          body: params,
        }
      );

      data = await response.json();
    }
    // Case 3: Text-only post (no images)
    else {
      console.log('Publishing text-only post');
      const params = new URLSearchParams({
        access_token: pageAccessToken,
        message: message,
      });

      response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        {
          method: 'POST',
          body: params,
        }
      );

      data = await response.json();
    }

    if (data.error) {
      console.error('Facebook API error:', data.error);
      return {
        success: false,
        error: data.error.message || 'Facebook API error',
      };
    }

    if (data.id || data.post_id) {
      const postId = data.id || data.post_id;
      return {
        success: true,
        postId: postId,
        postUrl: `https://facebook.com/${postId}`,
      };
    }

    return { success: false, error: 'Unknown error' };

  } catch (error) {
    console.error('Error publishing to Facebook:', error);
    return { success: false, error: error.message };
  }
}

async function publishToInstagram(post, account) {
  // Instagram publishing will be implemented later
  return {
    success: false,
    error: 'Instagram publishing not yet implemented',
  };
}
