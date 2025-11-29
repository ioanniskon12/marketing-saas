/**
 * Twitter/X Publishing Module
 *
 * Handles publishing tweets to Twitter/X via the Twitter API v2
 */

import { refreshAccessToken } from '@/lib/oauth/config';

/**
 * Publish content to Twitter/X
 */
export async function publishToTwitter(account, content, media = []) {
  try {
    // Verify account has valid token
    let accessToken = account.access_token;

    // Check if token needs refresh
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      const tokenData = await refreshAccessToken('twitter', account.refresh_token);
      accessToken = tokenData.access_token;
    }

    let mediaIds = [];

    // Upload media if present
    if (media.length > 0) {
      for (const mediaItem of media) {
        const mediaId = await uploadMedia(accessToken, mediaItem.url, mediaItem.type);
        mediaIds.push(mediaId);
      }
    }

    // Create tweet
    const tweetData = {
      text: content,
    };

    if (mediaIds.length > 0) {
      tweetData.media = {
        media_ids: mediaIds,
      };
    }

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || data.detail || 'Failed to publish tweet');
    }

    return {
      success: true,
      platformPostId: data.data.id,
      platform: 'twitter',
      publishedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Twitter publishing error:', error);
    return {
      success: false,
      platform: 'twitter',
      error: error.message,
    };
  }
}

/**
 * Upload media to Twitter
 */
async function uploadMedia(accessToken, mediaUrl, mediaType) {
  // Note: Twitter media upload requires a multi-step process
  // This is a simplified version - in production, you'd need to:
  // 1. INIT - Initialize upload
  // 2. APPEND - Upload media chunks
  // 3. FINALIZE - Complete upload

  // For now, we'll use a simplified approach assuming media is already accessible
  // In production, you'd implement the full chunked upload process

  try {
    // Fetch media file
    const mediaResponse = await fetch(mediaUrl);
    const mediaBuffer = await mediaResponse.arrayBuffer();
    const mediaBase64 = Buffer.from(mediaBuffer).toString('base64');

    // Upload to Twitter (v1.1 API for media upload)
    const formData = new URLSearchParams({
      media_data: mediaBase64,
    });

    const response = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || 'Failed to upload media');
    }

    return data.media_id_string;
  } catch (error) {
    console.error('Twitter media upload error:', error);
    throw error;
  }
}

/**
 * Create a thread (multiple tweets)
 */
export async function publishTwitterThread(account, tweets) {
  try {
    let accessToken = account.access_token;

    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      const tokenData = await refreshAccessToken('twitter', account.refresh_token);
      accessToken = tokenData.access_token;
    }

    const tweetIds = [];
    let previousTweetId = null;

    for (const tweet of tweets) {
      const tweetData = {
        text: tweet.content,
      };

      // Reply to previous tweet to create thread
      if (previousTweetId) {
        tweetData.reply = {
          in_reply_to_tweet_id: previousTweetId,
        };
      }

      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tweetData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || 'Failed to publish tweet in thread');
      }

      tweetIds.push(data.data.id);
      previousTweetId = data.data.id;
    }

    return {
      success: true,
      platformPostId: tweetIds[0], // Return first tweet ID
      threadIds: tweetIds,
      platform: 'twitter',
      publishedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Twitter thread publishing error:', error);
    return {
      success: false,
      platform: 'twitter',
      error: error.message,
    };
  }
}
