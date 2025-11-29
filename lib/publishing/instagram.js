/**
 * Instagram Publishing Module
 *
 * Handles publishing posts to Instagram via the Instagram Graph API
 */

import { refreshAccessToken } from '@/lib/oauth/config';

/**
 * Publish content to Instagram
 */
export async function publishToInstagram(account, content, media = []) {
  try {
    // Verify account has valid token
    let accessToken = account.access_token;

    // Check if token needs refresh
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      const tokenData = await refreshAccessToken('instagram', account.refresh_token);
      accessToken = tokenData.access_token;
    }

    // Instagram requires media
    if (media.length === 0) {
      throw new Error('Instagram posts require at least one image or video');
    }

    // Get Instagram Business Account ID
    const igAccountId = await getInstagramBusinessAccountId(accessToken);

    let mediaContainerIds = [];

    // Create media containers for each media item
    for (const mediaItem of media) {
      const containerResponse = await createMediaContainer(
        igAccountId,
        accessToken,
        mediaItem.url,
        content,
        mediaItem.type
      );
      mediaContainerIds.push(containerResponse.id);
    }

    // Publish the post
    let publishResponse;
    if (mediaContainerIds.length === 1) {
      // Single media post
      publishResponse = await publishMedia(igAccountId, accessToken, mediaContainerIds[0]);
    } else {
      // Carousel post (multiple media)
      publishResponse = await publishCarousel(igAccountId, accessToken, mediaContainerIds, content);
    }

    return {
      success: true,
      platformPostId: publishResponse.id,
      platform: 'instagram',
      publishedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Instagram publishing error:', error);
    return {
      success: false,
      platform: 'instagram',
      error: error.message,
    };
  }
}

/**
 * Get Instagram Business Account ID from access token
 */
async function getInstagramBusinessAccountId(accessToken) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to get Instagram account');
  }

  // Get the first page's Instagram Business Account
  const pageId = data.data[0]?.id;
  if (!pageId) {
    throw new Error('No Facebook page found');
  }

  const igResponse = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
  );

  const igData = await igResponse.json();

  if (!igResponse.ok || !igData.instagram_business_account) {
    throw new Error('No Instagram Business Account found');
  }

  return igData.instagram_business_account.id;
}

/**
 * Create media container
 */
async function createMediaContainer(igAccountId, accessToken, mediaUrl, caption, mediaType) {
  const isVideo = mediaType === 'video';

  const params = new URLSearchParams({
    access_token: accessToken,
    [isVideo ? 'video_url' : 'image_url']: mediaUrl,
    caption: caption || '',
    media_type: isVideo ? 'VIDEO' : 'IMAGE',
  });

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${igAccountId}/media`,
    {
      method: 'POST',
      body: params,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to create media container');
  }

  return data;
}

/**
 * Publish carousel (multiple media)
 */
async function publishCarousel(igAccountId, accessToken, containerIds, caption) {
  const params = new URLSearchParams({
    access_token: accessToken,
    media_type: 'CAROUSEL',
    caption: caption || '',
    children: containerIds.join(','),
  });

  const containerResponse = await fetch(
    `https://graph.facebook.com/v18.0/${igAccountId}/media`,
    {
      method: 'POST',
      body: params,
    }
  );

  const containerData = await containerResponse.json();

  if (!containerResponse.ok) {
    throw new Error(containerData.error?.message || 'Failed to create carousel container');
  }

  // Publish the carousel
  return await publishMedia(igAccountId, accessToken, containerData.id);
}

/**
 * Publish media container
 */
async function publishMedia(igAccountId, accessToken, creationId) {
  const params = new URLSearchParams({
    access_token: accessToken,
    creation_id: creationId,
  });

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
    {
      method: 'POST',
      body: params,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to publish media');
  }

  return data;
}
