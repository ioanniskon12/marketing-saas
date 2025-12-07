/**
 * TikTok Publishing Module
 *
 * Handles publishing videos to TikTok via the TikTok Content Posting API v2
 * Docs: https://developers.tiktok.com/doc/content-posting-api-get-started
 */

import { createClient } from '@/lib/supabase/server';

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;

/**
 * Publish content to TikTok
 * TikTok only supports video content
 */
export async function publishToTikTok(account, content, media = []) {
  try {
    // Verify account has valid token
    let accessToken = account.access_token;

    // Check if token needs refresh
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      const tokenData = await refreshTikTokToken(account.refresh_token);
      accessToken = tokenData.access_token;

      // Update the token in database
      await updateAccountToken(account.id, tokenData);
    }

    // TikTok requires video
    if (media.length === 0) {
      throw new Error('TikTok requires a video to publish');
    }

    const videoMedia = media.find(m => m.type === 'video');
    if (!videoMedia) {
      throw new Error('TikTok requires a video file. Images are not supported.');
    }

    const videoUrl = videoMedia.url;

    // Use the Direct Post method (video from URL)
    // Step 1: Initialize video post from URL
    const initResponse = await initializeDirectPost(accessToken, videoUrl, content);

    if (!initResponse.success) {
      throw new Error(initResponse.error || 'Failed to initialize TikTok post');
    }

    return {
      success: true,
      platformPostId: initResponse.publish_id,
      platform: 'tiktok',
      publishedAt: new Date().toISOString(),
      status: 'processing', // TikTok processes videos asynchronously
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
 * Initialize a direct post from URL
 * Uses the Content Posting API v2
 */
async function initializeDirectPost(accessToken, videoUrl, caption) {
  // First, we need to get the video file size
  const videoResponse = await fetch(videoUrl, { method: 'HEAD' });
  const contentLength = videoResponse.headers.get('content-length');
  const videoSize = contentLength ? parseInt(contentLength) : 0;

  if (videoSize === 0) {
    // Try to fetch and get size
    const fullResponse = await fetch(videoUrl);
    const buffer = await fullResponse.arrayBuffer();
    return await uploadVideoChunked(accessToken, buffer, caption);
  }

  // Use pull from URL method for smaller videos (< 50MB)
  if (videoSize < 50 * 1024 * 1024) {
    return await postVideoFromUrl(accessToken, videoUrl, caption);
  } else {
    // For larger videos, use chunked upload
    const fullResponse = await fetch(videoUrl);
    const buffer = await fullResponse.arrayBuffer();
    return await uploadVideoChunked(accessToken, buffer, caption);
  }
}

/**
 * Post video using pull from URL method
 */
async function postVideoFromUrl(accessToken, videoUrl, caption) {
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
      video_url: videoUrl,
    },
  };

  const response = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });

  const data = await response.json();

  if (data.error?.code || !response.ok) {
    console.error('TikTok post init error:', data);
    return {
      success: false,
      error: data.error?.message || 'Failed to initialize TikTok post',
    };
  }

  return {
    success: true,
    publish_id: data.data?.publish_id,
  };
}

/**
 * Upload video using chunked upload for larger files
 */
async function uploadVideoChunked(accessToken, videoBuffer, caption) {
  const videoSize = videoBuffer.byteLength;
  const chunkSize = 10 * 1024 * 1024; // 10MB chunks
  const totalChunks = Math.ceil(videoSize / chunkSize);

  // Step 1: Initialize upload
  const initData = {
    post_info: {
      title: caption || '',
      privacy_level: 'PUBLIC_TO_EVERYONE',
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
    },
    source_info: {
      source: 'FILE_UPLOAD',
      video_size: videoSize,
      chunk_size: chunkSize,
      total_chunk_count: totalChunks,
    },
  };

  const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(initData),
  });

  const initResult = await initResponse.json();

  if (initResult.error?.code || !initResponse.ok) {
    console.error('TikTok chunked init error:', initResult);
    return {
      success: false,
      error: initResult.error?.message || 'Failed to initialize chunked upload',
    };
  }

  const { publish_id, upload_url } = initResult.data;

  // Step 2: Upload chunks
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, videoSize);
    const chunk = videoBuffer.slice(start, end);

    const chunkResponse = await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Range': `bytes ${start}-${end - 1}/${videoSize}`,
      },
      body: chunk,
    });

    if (!chunkResponse.ok) {
      console.error('TikTok chunk upload error:', await chunkResponse.text());
      return {
        success: false,
        error: `Failed to upload chunk ${i + 1}/${totalChunks}`,
      };
    }
  }

  return {
    success: true,
    publish_id,
  };
}

/**
 * Refresh TikTok access token
 */
async function refreshTikTokToken(refreshToken) {
  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();

  if (data.error || !response.ok) {
    throw new Error(data.error_description || 'Failed to refresh TikTok token');
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  };
}

/**
 * Update account token in database
 */
async function updateAccountToken(accountId, tokenData) {
  const supabase = await createClient();

  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

  await supabase
    .from('social_accounts')
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: expiresAt.toISOString(),
    })
    .eq('id', accountId);
}

/**
 * Check post status
 * TikTok processes videos asynchronously, so we can check status
 */
export async function checkTikTokPostStatus(account, publishId) {
  try {
    let accessToken = account.access_token;

    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      const tokenData = await refreshTikTokToken(account.refresh_token);
      accessToken = tokenData.access_token;
    }

    const response = await fetch(
      `https://open.tiktokapis.com/v2/post/publish/status/fetch/?publish_id=${publishId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publish_id: publishId }),
      }
    );

    const data = await response.json();

    if (data.error?.code) {
      throw new Error(data.error.message || 'Failed to check post status');
    }

    return {
      status: data.data?.status, // PROCESSING_UPLOAD, PROCESSING_DOWNLOAD, SEND_TO_USER_INBOX, PUBLISH_COMPLETE, FAILED
      publiclyAvailable: data.data?.publicly_available_post_id,
      failReason: data.data?.fail_reason,
    };
  } catch (error) {
    console.error('TikTok status check error:', error);
    throw error;
  }
}

/**
 * Get TikTok video info
 */
export async function getTikTokVideoInfo(account, videoId) {
  try {
    let accessToken = account.access_token;

    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      const tokenData = await refreshTikTokToken(account.refresh_token);
      accessToken = tokenData.access_token;
    }

    const response = await fetch(
      `https://open.tiktokapis.com/v2/video/query/?fields=id,title,video_description,duration,cover_image_url,share_url,view_count,like_count,comment_count,share_count`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {
            video_ids: [videoId],
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error?.code) {
      throw new Error(data.error.message || 'Failed to get video info');
    }

    return data.data?.videos?.[0] || null;
  } catch (error) {
    console.error('TikTok video info error:', error);
    throw error;
  }
}
