/**
 * LinkedIn Publishing Module
 *
 * Handles publishing posts to LinkedIn via the LinkedIn API
 */

import { refreshAccessToken } from '@/lib/oauth/config';

/**
 * Publish content to LinkedIn
 */
export async function publishToLinkedIn(account, content, media = []) {
  try {
    // Verify account has valid token
    let accessToken = account.access_token;

    // Check if token needs refresh
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      const tokenData = await refreshAccessToken('linkedin', account.refresh_token);
      accessToken = tokenData.access_token;
    }

    // Get user's LinkedIn ID (URN)
    const personUrn = await getLinkedInPersonUrn(accessToken);

    let shareData;

    if (media.length === 0) {
      // Text-only post
      shareData = createTextPost(personUrn, content);
    } else if (media.length === 1) {
      // Single media post
      const mediaItem = media[0];
      if (mediaItem.type === 'video') {
        shareData = await createVideoPost(personUrn, accessToken, content, mediaItem.url);
      } else {
        shareData = await createImagePost(personUrn, accessToken, content, mediaItem.url);
      }
    } else {
      // Multiple images
      shareData = await createMultiImagePost(personUrn, accessToken, content, media);
    }

    // Publish the post
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(shareData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to publish LinkedIn post');
    }

    return {
      success: true,
      platformPostId: data.id,
      platform: 'linkedin',
      publishedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('LinkedIn publishing error:', error);
    return {
      success: false,
      platform: 'linkedin',
      error: error.message,
    };
  }
}

/**
 * Get LinkedIn Person URN
 */
async function getLinkedInPersonUrn(accessToken) {
  const response = await fetch('https://api.linkedin.com/v2/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error('Failed to get LinkedIn user info');
  }

  return `urn:li:person:${data.id}`;
}

/**
 * Create text-only post
 */
function createTextPost(personUrn, text) {
  return {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: text,
        },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };
}

/**
 * Create image post
 */
async function createImagePost(personUrn, accessToken, text, imageUrl) {
  // Register upload for image
  const uploadData = await registerUpload(accessToken, personUrn);

  // Upload image
  await uploadMedia(uploadData.uploadUrl, imageUrl);

  return {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: text,
        },
        shareMediaCategory: 'IMAGE',
        media: [
          {
            status: 'READY',
            media: uploadData.asset,
          },
        ],
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };
}

/**
 * Create video post
 */
async function createVideoPost(personUrn, accessToken, text, videoUrl) {
  // Register upload for video
  const uploadData = await registerUpload(accessToken, personUrn, 'VIDEO');

  // Upload video
  await uploadMedia(uploadData.uploadUrl, videoUrl);

  return {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: text,
        },
        shareMediaCategory: 'VIDEO',
        media: [
          {
            status: 'READY',
            media: uploadData.asset,
          },
        ],
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };
}

/**
 * Create multi-image post
 */
async function createMultiImagePost(personUrn, accessToken, text, mediaItems) {
  const mediaArray = [];

  for (const mediaItem of mediaItems) {
    if (mediaItem.type === 'image') {
      const uploadData = await registerUpload(accessToken, personUrn);
      await uploadMedia(uploadData.uploadUrl, mediaItem.url);

      mediaArray.push({
        status: 'READY',
        media: uploadData.asset,
      });
    }
  }

  return {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: text,
        },
        shareMediaCategory: 'IMAGE',
        media: mediaArray,
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };
}

/**
 * Register upload
 */
async function registerUpload(accessToken, personUrn, mediaType = 'IMAGE') {
  const registerData = {
    registerUploadRequest: {
      recipes: [`urn:li:digitalmediaRecipe:feedshare-${mediaType.toLowerCase()}`],
      owner: personUrn,
      serviceRelationships: [
        {
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent',
        },
      ],
    },
  };

  const response = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(registerData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error('Failed to register media upload');
  }

  return {
    uploadUrl: data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl,
    asset: data.value.asset,
  };
}

/**
 * Upload media to LinkedIn
 */
async function uploadMedia(uploadUrl, mediaUrl) {
  // Fetch media
  const mediaResponse = await fetch(mediaUrl);
  const mediaBuffer = await mediaResponse.arrayBuffer();

  // Upload to LinkedIn
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    body: mediaBuffer,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload media to LinkedIn');
  }
}
