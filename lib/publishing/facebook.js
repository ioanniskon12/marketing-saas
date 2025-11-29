/**
 * Facebook Publishing Module
 *
 * Handles publishing posts to Facebook via the Facebook Graph API
 */

import { refreshAccessToken } from '@/lib/oauth/config';

/**
 * Publish content to Facebook
 */
export async function publishToFacebook(account, content, media = []) {
  try {
    // Verify account has valid token
    let accessToken = account.access_token;

    // Check if token needs refresh
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      const tokenData = await refreshAccessToken('facebook', account.refresh_token);
      accessToken = tokenData.access_token;
    }

    // Get Facebook Page ID (stored in platform_user_id)
    const pageId = account.platform_user_id;

    let response;

    if (media.length === 0) {
      // Text-only post
      response = await publishTextPost(pageId, accessToken, content);
    } else if (media.length === 1) {
      // Single media post
      const mediaItem = media[0];
      if (mediaItem.type === 'video') {
        response = await publishVideoPost(pageId, accessToken, content, mediaItem.url);
      } else {
        response = await publishPhotoPost(pageId, accessToken, content, mediaItem.url);
      }
    } else {
      // Multiple photos (album)
      response = await publishPhotoAlbum(pageId, accessToken, content, media);
    }

    return {
      success: true,
      platformPostId: response.id || response.post_id,
      platform: 'facebook',
      publishedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Facebook publishing error:', error);
    return {
      success: false,
      platform: 'facebook',
      error: error.message,
    };
  }
}

/**
 * Publish text-only post
 */
async function publishTextPost(pageId, accessToken, message) {
  const params = new URLSearchParams({
    access_token: accessToken,
    message: message,
  });

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}/feed`,
    {
      method: 'POST',
      body: params,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to publish text post');
  }

  return data;
}

/**
 * Publish photo post
 */
async function publishPhotoPost(pageId, accessToken, message, photoUrl) {
  const params = new URLSearchParams({
    access_token: accessToken,
    message: message || '',
    url: photoUrl,
  });

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}/photos`,
    {
      method: 'POST',
      body: params,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to publish photo');
  }

  return data;
}

/**
 * Publish video post
 */
async function publishVideoPost(pageId, accessToken, description, videoUrl) {
  const params = new URLSearchParams({
    access_token: accessToken,
    description: description || '',
    file_url: videoUrl,
  });

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}/videos`,
    {
      method: 'POST',
      body: params,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to publish video');
  }

  return data;
}

/**
 * Publish photo album (multiple photos)
 */
async function publishPhotoAlbum(pageId, accessToken, message, media) {
  // First, upload all photos
  const photoIds = [];

  for (const mediaItem of media) {
    if (mediaItem.type === 'image') {
      const params = new URLSearchParams({
        access_token: accessToken,
        url: mediaItem.url,
        published: 'false', // Don't publish individually
      });

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/photos`,
        {
          method: 'POST',
          body: params,
        }
      );

      const data = await response.json();

      if (response.ok && data.id) {
        photoIds.push({ media_fbid: data.id });
      }
    }
  }

  // Now create the album post with all photos
  const attachedMedia = photoIds.map(photo => photo.media_fbid).join(',');

  const params = new URLSearchParams({
    access_token: accessToken,
    message: message || '',
    attached_media: JSON.stringify(photoIds),
  });

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}/feed`,
    {
      method: 'POST',
      body: params,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to publish album');
  }

  return data;
}
