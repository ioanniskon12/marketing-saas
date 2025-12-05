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
          result = await publishToFacebook(post, account, supabase);
        } else if (account.platform === 'instagram') {
          result = await publishToInstagram(post, account, supabase);
        } else if (account.platform === 'twitter') {
          result = await publishToTwitter(post, account, supabase);
        } else if (account.platform === 'youtube') {
          result = await publishToYouTube(post, account, supabase);
        } else if (account.platform === 'linkedin') {
          result = await publishToLinkedIn(post, account, supabase);
        } else if (account.platform === 'tiktok') {
          result = await publishToTikTok(post, account, supabase);
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

async function publishToFacebook(post, account, supabase) {
  try {
    let pageAccessToken = account.access_token;
    const pageId = account.platform_account_id;

    if (!pageAccessToken || !pageId) {
      return { success: false, error: 'Missing Facebook credentials' };
    }

    // Check if token needs refresh (Facebook Page tokens are long-lived but can expire)
    const tokenExpiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null;
    const isExpired = tokenExpiresAt && tokenExpiresAt < new Date();

    if (isExpired && account.refresh_token) {
      console.log('Facebook token expired, refreshing...');
      try {
        const { refreshAccessToken } = await import('@/lib/oauth/config');
        const tokenData = await refreshAccessToken('facebook', account.refresh_token);
        pageAccessToken = tokenData.access_token;

        const expiresAt = tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null;

        await supabase
          .from('social_accounts')
          .update({
            access_token: pageAccessToken,
            token_expires_at: expiresAt,
            refresh_token: tokenData.refresh_token || account.refresh_token,
          })
          .eq('id', account.id);

        console.log('Facebook token refreshed successfully');
      } catch (refreshError) {
        console.error('Failed to refresh Facebook token:', refreshError);
        return {
          success: false,
          error: 'Facebook token expired and refresh failed. Please reconnect your Facebook account.',
        };
      }
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

async function publishToInstagram(post, account, supabase) {
  try {
    let accessToken = account.access_token;
    const instagramAccountId = account.platform_account_id;

    if (!accessToken || !instagramAccountId) {
      return { success: false, error: 'Missing Instagram credentials' };
    }

    // Check if token needs refresh
    const tokenExpiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null;
    const isExpired = tokenExpiresAt && tokenExpiresAt < new Date();

    if (isExpired && account.refresh_token) {
      console.log('Instagram token expired, refreshing...');
      try {
        const { refreshAccessToken } = await import('@/lib/oauth/config');
        const tokenData = await refreshAccessToken('instagram', account.refresh_token);
        accessToken = tokenData.access_token;

        const expiresAt = tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null;

        await supabase
          .from('social_accounts')
          .update({
            access_token: accessToken,
            token_expires_at: expiresAt,
            refresh_token: tokenData.refresh_token || account.refresh_token,
          })
          .eq('id', account.id);

        console.log('Instagram token refreshed successfully');
      } catch (refreshError) {
        console.error('Failed to refresh Instagram token:', refreshError);
        return {
          success: false,
          error: 'Instagram token expired and refresh failed. Please reconnect your Instagram account.',
        };
      }
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

async function publishToTwitter(post, account, supabase) {
  try {
    let accessToken = account.access_token;
    const userId = account.platform_account_id;

    if (!accessToken) {
      return { success: false, error: 'Missing Twitter credentials' };
    }

    // Check if token needs refresh
    const tokenExpiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null;
    const isExpired = tokenExpiresAt && tokenExpiresAt < new Date();

    if (isExpired && account.refresh_token) {
      console.log('Twitter token expired, refreshing...');
      try {
        const { refreshAccessToken } = await import('@/lib/oauth/config');
        const tokenData = await refreshAccessToken('twitter', account.refresh_token);
        accessToken = tokenData.access_token;

        const expiresAt = tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null;

        await supabase
          .from('social_accounts')
          .update({
            access_token: accessToken,
            token_expires_at: expiresAt,
            refresh_token: tokenData.refresh_token || account.refresh_token,
          })
          .eq('id', account.id);

        console.log('Twitter token refreshed successfully');
      } catch (refreshError) {
        console.error('Failed to refresh Twitter token:', refreshError);
        return {
          success: false,
          error: 'Twitter token expired and refresh failed. Please reconnect your Twitter account.',
        };
      }
    }

    // Prepare tweet text
    let tweetText = post.content || '';

    // Add hashtags
    if (post.hashtags && post.hashtags.length > 0) {
      const hashtagString = post.hashtags.map(tag => `#${tag}`).join(' ');
      tweetText = tweetText + '\n\n' + hashtagString;
    }

    // Twitter character limit
    if (tweetText.length > 280) {
      return {
        success: false,
        error: `Tweet text exceeds 280 characters (${tweetText.length} characters)`
      };
    }

    console.log('Publishing to Twitter:', {
      userId,
      textLength: tweetText.length,
      hasMedia: post.post_media && post.post_media.length > 0,
      mediaCount: post.post_media?.length || 0
    });

    // Get media if available
    const media = post.post_media || [];
    const imageMedia = media.filter(m => m.media_type === 'image');

    let mediaIds = [];

    // Upload media if present (Twitter allows up to 4 images)
    if (imageMedia.length > 0) {
      if (imageMedia.length > 4) {
        return {
          success: false,
          error: 'Twitter allows maximum 4 images per tweet'
        };
      }

      console.log('Uploading', imageMedia.length, 'images to Twitter');

      for (const mediaItem of imageMedia) {
        try {
          // Download image first
          const imageResponse = await fetch(mediaItem.file_url);
          if (!imageResponse.ok) {
            throw new Error(`Failed to download image: ${imageResponse.statusText}`);
          }

          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');

          // Upload to Twitter using v1.1 media upload endpoint
          const uploadResponse = await fetch(
            'https://upload.twitter.com/1.1/media/upload.json',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                media_data: base64Image,
              }),
            }
          );

          const uploadData = await uploadResponse.json();

          if (uploadData.errors) {
            console.error('Twitter media upload error:', uploadData.errors);
            return {
              success: false,
              error: uploadData.errors[0]?.message || 'Failed to upload media',
            };
          }

          if (uploadData.media_id_string) {
            mediaIds.push(uploadData.media_id_string);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          return { success: false, error: `Media upload failed: ${error.message}` };
        }
      }
    }

    // Create tweet using v2 API
    const tweetPayload = {
      text: tweetText,
    };

    // Add media if uploaded
    if (mediaIds.length > 0) {
      tweetPayload.media = {
        media_ids: mediaIds,
      };
    }

    const tweetResponse = await fetch(
      'https://api.twitter.com/2/tweets',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tweetPayload),
      }
    );

    const tweetData = await tweetResponse.json();

    if (tweetData.errors) {
      console.error('Twitter API error:', tweetData.errors);
      return {
        success: false,
        error: tweetData.errors[0]?.message || 'Twitter API error',
      };
    }

    if (tweetData.data && tweetData.data.id) {
      const tweetId = tweetData.data.id;
      return {
        success: true,
        postId: tweetId,
        postUrl: `https://twitter.com/user/status/${tweetId}`,
      };
    }

    return { success: false, error: 'Unknown error publishing to Twitter' };

  } catch (error) {
    console.error('Error publishing to Twitter:', error);
    return { success: false, error: error.message };
  }
}

async function publishToYouTube(post, account, supabase) {
  try {
    let accessToken = account.access_token;

    if (!accessToken) {
      return { success: false, error: 'Missing YouTube credentials' };
    }

    // Check if token needs refresh (YouTube tokens expire after 1 hour)
    const tokenExpiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null;
    const isExpired = tokenExpiresAt && tokenExpiresAt < new Date();

    if (isExpired && account.refresh_token) {
      console.log('YouTube token expired, refreshing...');
      try {
        const { refreshAccessToken } = await import('@/lib/oauth/config');
        const tokenData = await refreshAccessToken('youtube', account.refresh_token);
        accessToken = tokenData.access_token;

        // Update the token in the database
        const expiresAt = tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null;

        await supabase
          .from('social_accounts')
          .update({
            access_token: accessToken,
            token_expires_at: expiresAt,
            refresh_token: tokenData.refresh_token || account.refresh_token,
          })
          .eq('id', account.id);

        console.log('YouTube token refreshed successfully');
      } catch (refreshError) {
        console.error('Failed to refresh YouTube token:', refreshError);
        return {
          success: false,
          error: 'YouTube token expired and refresh failed. Please reconnect your YouTube account.',
        };
      }
    }

    // YouTube requires video content - check if we have a video
    const media = post.post_media || [];
    const videoMedia = media.filter(m => m.media_type === 'video');

    if (videoMedia.length === 0) {
      return {
        success: false,
        error: 'YouTube requires a video file. Please add a video to this post.',
      };
    }

    if (videoMedia.length > 1) {
      return {
        success: false,
        error: 'YouTube only supports one video per upload.',
      };
    }

    // Prepare video metadata
    let title = post.content ? post.content.substring(0, 100) : 'Video Upload';
    let description = post.content || '';

    // Add hashtags to description
    if (post.hashtags && post.hashtags.length > 0) {
      const hashtagString = post.hashtags.map(tag => `#${tag}`).join(' ');
      description = description + '\n\n' + hashtagString;
    }

    console.log('Publishing to YouTube:', {
      hasVideo: true,
      title: title.substring(0, 50) + '...',
    });

    // Download video first
    const videoUrl = videoMedia[0].file_url;
    const videoResponse = await fetch(videoUrl);

    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' });

    // Step 1: Create upload request
    const metadata = {
      snippet: {
        title: title,
        description: description,
        tags: post.hashtags || [],
        categoryId: '22', // People & Blogs category
      },
      status: {
        privacyStatus: 'public', // or 'private' or 'unlisted'
      },
    };

    // YouTube upload requires resumable upload
    // Step 1: Initialize upload
    const initResponse = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'video/*',
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!initResponse.ok) {
      const error = await initResponse.text();
      console.error('YouTube init error:', error);
      return {
        success: false,
        error: `Failed to initialize upload: ${error}`,
      };
    }

    // Get upload URL from location header
    const uploadUrl = initResponse.headers.get('Location');

    if (!uploadUrl) {
      return {
        success: false,
        error: 'Failed to get upload URL from YouTube',
      };
    }

    // Step 2: Upload video data
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'video/*',
      },
      body: videoBlob,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error('YouTube upload error:', error);
      return {
        success: false,
        error: `Failed to upload video: ${error}`,
      };
    }

    const uploadData = await uploadResponse.json();

    if (uploadData.id) {
      return {
        success: true,
        postId: uploadData.id,
        postUrl: `https://www.youtube.com/watch?v=${uploadData.id}`,
      };
    }

    return { success: false, error: 'Unknown error uploading to YouTube' };

  } catch (error) {
    console.error('Error publishing to YouTube:', error);
    return { success: false, error: error.message };
  }
}

async function publishToLinkedIn(post, account, supabase) {
  try {
    let accessToken = account.access_token;

    if (!accessToken) {
      return { success: false, error: 'Missing LinkedIn credentials' };
    }

    // Check if token needs refresh
    const tokenExpiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null;
    const isExpired = tokenExpiresAt && tokenExpiresAt < new Date();

    if (isExpired && account.refresh_token) {
      console.log('LinkedIn token expired, refreshing...');
      try {
        const { refreshAccessToken } = await import('@/lib/oauth/config');
        const tokenData = await refreshAccessToken('linkedin', account.refresh_token);
        accessToken = tokenData.access_token;

        const expiresAt = tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null;

        await supabase
          .from('social_accounts')
          .update({
            access_token: accessToken,
            token_expires_at: expiresAt,
            refresh_token: tokenData.refresh_token || account.refresh_token,
          })
          .eq('id', account.id);

        console.log('LinkedIn token refreshed successfully');
      } catch (refreshError) {
        console.error('Failed to refresh LinkedIn token:', refreshError);
        return {
          success: false,
          error: 'LinkedIn token expired and refresh failed. Please reconnect your LinkedIn account.',
        };
      }
    }

    // Get user's LinkedIn URN (person ID)
    const personUrn = account.platform_account_id;

    if (!personUrn) {
      return { success: false, error: 'Missing LinkedIn person URN' };
    }

    // Prepare post content
    let postText = post.content || '';

    // Add hashtags
    if (post.hashtags && post.hashtags.length > 0) {
      const hashtagString = post.hashtags.map(tag => `#${tag}`).join(' ');
      postText = postText + '\n\n' + hashtagString;
    }

    console.log('Publishing to LinkedIn:', {
      personUrn,
      textLength: postText.length,
      hasMedia: post.post_media && post.post_media.length > 0,
      mediaCount: post.post_media?.length || 0
    });

    // Get media if available
    const media = post.post_media || [];
    const imageMedia = media.filter(m => m.media_type === 'image');

    let shareContent;

    // Case 1: Post with images
    if (imageMedia.length > 0) {
      // LinkedIn requires registering assets first
      const assetUrns = [];

      for (const mediaItem of imageMedia) {
        try {
          // Step 1: Register the upload
          const registerResponse = await fetch(
            'https://api.linkedin.com/v2/assets?action=registerUpload',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                registerUploadRequest: {
                  recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                  owner: `urn:li:person:${personUrn}`,
                  serviceRelationships: [
                    {
                      relationshipType: 'OWNER',
                      identifier: 'urn:li:userGeneratedContent',
                    },
                  ],
                },
              }),
            }
          );

          if (!registerResponse.ok) {
            const error = await registerResponse.text();
            console.error('LinkedIn asset registration error:', error);
            continue;
          }

          const registerData = await registerResponse.json();
          const uploadUrl = registerData.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl;
          const asset = registerData.value?.asset;

          if (!uploadUrl || !asset) {
            console.error('Missing upload URL or asset from LinkedIn');
            continue;
          }

          // Step 2: Download the image
          const imageResponse = await fetch(mediaItem.file_url);
          if (!imageResponse.ok) {
            console.error('Failed to download image for LinkedIn');
            continue;
          }

          const imageBuffer = await imageResponse.arrayBuffer();

          // Step 3: Upload the image to LinkedIn
          const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
            body: Buffer.from(imageBuffer),
          });

          if (!uploadResponse.ok) {
            const error = await uploadResponse.text();
            console.error('LinkedIn image upload error:', error);
            continue;
          }

          assetUrns.push(asset);
        } catch (error) {
          console.error('Error uploading image to LinkedIn:', error);
        }
      }

      if (assetUrns.length > 0) {
        shareContent = {
          author: `urn:li:person:${personUrn}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: postText,
              },
              shareMediaCategory: 'IMAGE',
              media: assetUrns.map(urn => ({
                status: 'READY',
                media: urn,
              })),
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        };
      }
    }

    // Case 2: Text-only post
    if (!shareContent) {
      shareContent = {
        author: `urn:li:person:${personUrn}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: postText,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };
    }

    // Create the post
    const postResponse = await fetch(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(shareContent),
      }
    );

    if (!postResponse.ok) {
      const error = await postResponse.text();
      console.error('LinkedIn post error:', error);
      return {
        success: false,
        error: `Failed to post to LinkedIn: ${error}`,
      };
    }

    // Get post ID from response header
    const postId = postResponse.headers.get('X-RestLi-Id');

    if (postId) {
      return {
        success: true,
        postId: postId,
        postUrl: `https://www.linkedin.com/feed/update/${postId}/`,
      };
    }

    return { success: false, error: 'Unknown error posting to LinkedIn' };

  } catch (error) {
    console.error('Error publishing to LinkedIn:', error);
    return { success: false, error: error.message };
  }
}

async function publishToTikTok(post, account, supabase) {
  try {
    let accessToken = account.access_token;

    if (!accessToken) {
      return { success: false, error: 'Missing TikTok credentials' };
    }

    // Check if token needs refresh
    const tokenExpiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null;
    const isExpired = tokenExpiresAt && tokenExpiresAt < new Date();

    if (isExpired && account.refresh_token) {
      console.log('TikTok token expired, refreshing...');
      try {
        const { refreshAccessToken } = await import('@/lib/oauth/config');
        const tokenData = await refreshAccessToken('tiktok', account.refresh_token);
        accessToken = tokenData.access_token;

        const expiresAt = tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null;

        await supabase
          .from('social_accounts')
          .update({
            access_token: accessToken,
            token_expires_at: expiresAt,
            refresh_token: tokenData.refresh_token || account.refresh_token,
          })
          .eq('id', account.id);

        console.log('TikTok token refreshed successfully');
      } catch (refreshError) {
        console.error('Failed to refresh TikTok token:', refreshError);
        return {
          success: false,
          error: 'TikTok token expired and refresh failed. Please reconnect your TikTok account.',
        };
      }
    }

    // TikTok requires video content
    const media = post.post_media || [];
    const videoMedia = media.filter(m => m.media_type === 'video');

    if (videoMedia.length === 0) {
      return {
        success: false,
        error: 'TikTok requires a video file. Please add a video to this post.',
      };
    }

    const openId = account.platform_account_id;

    if (!openId) {
      return { success: false, error: 'Missing TikTok user ID' };
    }

    // Prepare caption
    let caption = post.content || '';

    // Add hashtags
    if (post.hashtags && post.hashtags.length > 0) {
      const hashtagString = post.hashtags.map(tag => `#${tag}`).join(' ');
      caption = caption + ' ' + hashtagString;
    }

    // TikTok caption limit is 150 characters
    if (caption.length > 150) {
      caption = caption.substring(0, 147) + '...';
    }

    console.log('Publishing to TikTok:', {
      openId,
      captionLength: caption.length,
      hasVideo: true,
    });

    // Download the video
    const videoUrl = videoMedia[0].file_url;
    const videoResponse = await fetch(videoUrl);

    if (!videoResponse.ok) {
      return {
        success: false,
        error: `Failed to download video: ${videoResponse.statusText}`,
      };
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    const videoSize = videoBuffer.byteLength;

    // Step 1: Initialize upload
    const initResponse = await fetch(
      'https://open.tiktokapis.com/v2/post/publish/video/init/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_info: {
            title: caption,
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: videoSize,
            chunk_size: videoSize, // Single chunk upload
            total_chunk_count: 1,
          },
        }),
      }
    );

    if (!initResponse.ok) {
      const error = await initResponse.text();
      console.error('TikTok init error:', error);
      return {
        success: false,
        error: `Failed to initialize TikTok upload: ${error}`,
      };
    }

    const initData = await initResponse.json();

    if (initData.error?.code) {
      return {
        success: false,
        error: initData.error.message || 'TikTok API error',
      };
    }

    const uploadUrl = initData.data?.upload_url;
    const publishId = initData.data?.publish_id;

    if (!uploadUrl || !publishId) {
      return {
        success: false,
        error: 'Failed to get upload URL from TikTok',
      };
    }

    // Step 2: Upload video
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Range': `bytes 0-${videoSize - 1}/${videoSize}`,
      },
      body: Buffer.from(videoBuffer),
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error('TikTok upload error:', error);
      return {
        success: false,
        error: `Failed to upload video to TikTok: ${error}`,
      };
    }

    // Return success with publish ID
    // Note: TikTok videos go through processing and may not be immediately available
    return {
      success: true,
      postId: publishId,
      postUrl: `https://www.tiktok.com/@${account.platform_username}`,
    };

  } catch (error) {
    console.error('Error publishing to TikTok:', error);
    return { success: false, error: error.message };
  }
}
