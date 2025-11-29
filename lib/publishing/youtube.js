/**
 * YouTube Publishing Module
 *
 * Handles uploading videos to YouTube via the YouTube Data API v3
 */

import { refreshAccessToken } from '@/lib/oauth/config';

/**
 * Publish content to YouTube
 */
export async function publishToYouTube(account, content, media = [], metadata = {}) {
  try {
    // Verify account has valid token
    let accessToken = account.access_token;

    // Check if token needs refresh
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      const tokenData = await refreshAccessToken('youtube', account.refresh_token);
      accessToken = tokenData.access_token;
    }

    // YouTube requires video
    if (media.length === 0 || media[0].type !== 'video') {
      throw new Error('YouTube requires a video to upload');
    }

    const videoUrl = media[0].url;

    // Prepare video metadata
    const videoMetadata = {
      snippet: {
        title: metadata.title || content.substring(0, 100) || 'Untitled Video',
        description: content || '',
        tags: metadata.tags || [],
        categoryId: metadata.categoryId || '22', // Default to People & Blogs
      },
      status: {
        privacyStatus: metadata.privacyStatus || 'public', // public, private, or unlisted
        selfDeclaredMadeForKids: metadata.madeForKids || false,
      },
    };

    // Upload video
    const uploadResponse = await uploadVideo(accessToken, videoUrl, videoMetadata);

    return {
      success: true,
      platformPostId: uploadResponse.id,
      platform: 'youtube',
      publishedAt: new Date().toISOString(),
      videoUrl: `https://www.youtube.com/watch?v=${uploadResponse.id}`,
    };
  } catch (error) {
    console.error('YouTube publishing error:', error);
    return {
      success: false,
      platform: 'youtube',
      error: error.message,
    };
  }
}

/**
 * Upload video to YouTube
 */
async function uploadVideo(accessToken, videoUrl, metadata) {
  // Fetch video file
  const videoResponse = await fetch(videoUrl);
  const videoBuffer = await videoResponse.arrayBuffer();

  // Step 1: Initialize resumable upload
  const initResponse = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'video/*',
        'X-Upload-Content-Length': videoBuffer.byteLength.toString(),
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!initResponse.ok) {
    const errorData = await initResponse.json();
    throw new Error(errorData.error?.message || 'Failed to initialize YouTube upload');
  }

  // Get upload URL from Location header
  const uploadUrl = initResponse.headers.get('Location');

  if (!uploadUrl) {
    throw new Error('No upload URL received from YouTube');
  }

  // Step 2: Upload video content
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/*',
    },
    body: videoBuffer,
  });

  if (!uploadResponse.ok) {
    const errorData = await uploadResponse.json();
    throw new Error(errorData.error?.message || 'Failed to upload video to YouTube');
  }

  const data = await uploadResponse.json();
  return data;
}

/**
 * Update video metadata
 */
export async function updateYouTubeVideo(account, videoId, updates) {
  try {
    let accessToken = account.access_token;

    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      const tokenData = await refreshAccessToken('youtube', account.refresh_token);
      accessToken = tokenData.access_token;
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,status`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: videoId,
          ...updates,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to update YouTube video');
    }

    return data;
  } catch (error) {
    console.error('YouTube update error:', error);
    throw error;
  }
}

/**
 * Set video thumbnail
 */
export async function setYouTubeThumbnail(account, videoId, thumbnailUrl) {
  try {
    let accessToken = account.access_token;

    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      const tokenData = await refreshAccessToken('youtube', account.refresh_token);
      accessToken = tokenData.access_token;
    }

    // Fetch thumbnail
    const thumbnailResponse = await fetch(thumbnailUrl);
    const thumbnailBuffer = await thumbnailResponse.arrayBuffer();

    const response = await fetch(
      `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'image/jpeg',
        },
        body: thumbnailBuffer,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to set YouTube thumbnail');
    }

    return data;
  } catch (error) {
    console.error('YouTube thumbnail error:', error);
    throw error;
  }
}

/**
 * Get video categories
 */
export async function getYouTubeCategories(account, regionCode = 'US') {
  try {
    let accessToken = account.access_token;

    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      const tokenData = await refreshAccessToken('youtube', account.refresh_token);
      accessToken = tokenData.access_token;
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=${regionCode}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get YouTube categories');
    }

    return data.items;
  } catch (error) {
    console.error('YouTube categories error:', error);
    throw error;
  }
}
