/**
 * TikTok Publishing Module
 *
 * Handles publishing videos to TikTok via the TikTok API
 */

import { refreshAccessToken } from '@/lib/oauth/config';

/**
 * Publish content to TikTok
 */
export async function publishToTikTok(account, content, media = []) {
  try {
    // Verify account has valid token
    let accessToken = account.access_token;

    // Check if token needs refresh
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      const tokenData = await refreshAccessToken('tiktok', account.refresh_token);
      accessToken = tokenData.access_token;
    }

    // TikTok requires video
    if (media.length === 0 || media[0].type !== 'video') {
      throw new Error('TikTok requires a video to publish');
    }

    const videoUrl = media[0].url;

    // Step 1: Initialize video upload
    const initResponse = await initializeUpload(accessToken);

    // Step 2: Upload video
    await uploadVideo(initResponse.upload_url, videoUrl);

    // Step 3: Publish video
    const publishResponse = await publishVideo(
      accessToken,
      initResponse.publish_id,
      content,
      account.platform_user_id
    );

    return {
      success: true,
      platformPostId: publishResponse.share_id,
      platform: 'tiktok',
      publishedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('TikTok publishing error:', error);
    return {
      success: false,
      platform: 'tiktok',
      error: error.message,
    };
  }
}

/**
 * Initialize video upload
 */
async function initializeUpload(accessToken) {
  const response = await fetch('https://open-api.tiktok.com/share/video/upload/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  const data = await response.json();

  if (data.error?.code) {
    throw new Error(data.error.message || 'Failed to initialize TikTok upload');
  }

  return data.data;
}

/**
 * Upload video to TikTok
 */
async function uploadVideo(uploadUrl, videoUrl) {
  // Fetch video
  const videoResponse = await fetch(videoUrl);
  const videoBuffer = await videoResponse.arrayBuffer();

  // Upload to TikTok
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/mp4',
    },
    body: videoBuffer,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload video to TikTok');
  }
}

/**
 * Publish video
 */
async function publishVideo(accessToken, publishId, caption, userId) {
  const postData = {
    post_info: {
      title: caption || '',
      privacy_level: 'PUBLIC_TO_EVERYONE',
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
      video_cover_timestamp_ms: 1000,
    },
    source_info: {
      source: 'PULL_FROM_URL',
      video_url: publishId,
    },
  };

  const response = await fetch('https://open-api.tiktok.com/share/video/publish/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });

  const data = await response.json();

  if (data.error?.code) {
    throw new Error(data.error.message || 'Failed to publish TikTok video');
  }

  return data.data;
}

/**
 * Get video info (for checking status)
 */
export async function getTikTokVideoInfo(account, videoId) {
  try {
    let accessToken = account.access_token;

    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      const tokenData = await refreshAccessToken('tiktok', account.refresh_token);
      accessToken = tokenData.access_token;
    }

    const response = await fetch(`https://open-api.tiktok.com/video/query/?video_id=${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (data.error?.code) {
      throw new Error(data.error.message || 'Failed to get video info');
    }

    return data.data;
  } catch (error) {
    console.error('TikTok video info error:', error);
    throw error;
  }
}
