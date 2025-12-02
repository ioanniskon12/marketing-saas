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
  try {
    const accessToken = account.access_token;
    const instagramAccountId = account.platform_account_id;

    if (!accessToken || !instagramAccountId) {
      return { success: false, error: 'Missing Instagram credentials' };
    }

    // Prepare caption
    let caption = post.content || '';

    // Add hashtags
    if (post.hashtags && post.hashtags.length > 0) {
      const hashtagString = post.hashtags.map(tag => `#${tag}`).join(' ');
      caption = caption + '\n\n' + hashtagString;
    }

    console.log('Publishing to Instagram:', {
      instagramAccountId,
      hasMedia: post.post_media && post.post_media.length > 0,
      mediaCount: post.post_media?.length || 0
    });

    // Get media if available
    const media = post.post_media || [];
    const imageMedia = media.filter(m => m.media_type === 'image');

    let containerId;

    // Case 1: Single image post
    if (imageMedia.length === 1) {
      console.log('Creating single Instagram image post');

      // Step 1: Create media container
      const createParams = new URLSearchParams({
        image_url: imageMedia[0].file_url,
        caption: caption,
        access_token: accessToken,
      });

      const createResponse = await fetch(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
        {
          method: 'POST',
          body: createParams,
        }
      );

      const createData = await createResponse.json();

      if (createData.error) {
        console.error('Instagram create container error:', createData.error);
        return {
          success: false,
          error: createData.error.message || 'Instagram API error',
        };
      }

      containerId = createData.id;
    }
    // Case 2: Multiple images (carousel)
    else if (imageMedia.length > 1 && imageMedia.length <= 10) {
      console.log('Creating Instagram carousel with', imageMedia.length, 'images');

      // Step 1: Create media containers for each image
      const containerIds = [];
      for (const mediaItem of imageMedia) {
        const itemParams = new URLSearchParams({
          image_url: mediaItem.file_url,
          is_carousel_item: 'true',
          access_token: accessToken,
        });

        const itemResponse = await fetch(
          `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
          {
            method: 'POST',
            body: itemParams,
          }
        );

        const itemData = await itemResponse.json();
        if (itemData.id) {
          containerIds.push(itemData.id);
        } else if (itemData.error) {
          console.error('Instagram carousel item error:', itemData.error);
          return {
            success: false,
            error: itemData.error.message || 'Failed to create carousel item',
          };
        }
      }

      // Step 2: Create carousel container
      const carouselParams = new URLSearchParams({
        media_type: 'CAROUSEL',
        children: containerIds.join(','),
        caption: caption,
        access_token: accessToken,
      });

      const carouselResponse = await fetch(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
        {
          method: 'POST',
          body: carouselParams,
        }
      );

      const carouselData = await carouselResponse.json();

      if (carouselData.error) {
        console.error('Instagram carousel container error:', carouselData.error);
        return {
          success: false,
          error: carouselData.error.message || 'Failed to create carousel',
        };
      }

      containerId = carouselData.id;
    }
    // Case 3: Text-only or unsupported
    else {
      return {
        success: false,
        error: imageMedia.length > 10
          ? 'Instagram allows maximum 10 images in a carousel'
          : 'Instagram requires at least one image',
      };
    }

    // Final step: Publish the container
    console.log('Publishing Instagram container:', containerId);
    const publishParams = new URLSearchParams({
      creation_id: containerId,
      access_token: accessToken,
    });

    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
      {
        method: 'POST',
        body: publishParams,
      }
    );

    const publishData = await publishResponse.json();

    if (publishData.error) {
      console.error('Instagram publish error:', publishData.error);
      return {
        success: false,
        error: publishData.error.message || 'Failed to publish to Instagram',
      };
    }

    if (publishData.id) {
      return {
        success: true,
        postId: publishData.id,
        postUrl: `https://www.instagram.com/p/${publishData.id}/`,
      };
    }

    return { success: false, error: 'Unknown error publishing to Instagram' };

  } catch (error) {
    console.error('Error publishing to Instagram:', error);
    return { success: false, error: error.message };
  }
}
