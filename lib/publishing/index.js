/**
 * Publishing Module Index
 *
 * Exports all platform-specific publishing functions
 */

import { publishToInstagram } from './instagram';
import { publishToFacebook } from './facebook';
import { publishToTwitter, publishTwitterThread } from './twitter';
import { publishToLinkedIn } from './linkedin';
import { publishToTikTok } from './tiktok';
import { publishToYouTube } from './youtube';

export const publishers = {
  instagram: publishToInstagram,
  facebook: publishToFacebook,
  twitter: publishToTwitter,
  linkedin: publishToLinkedIn,
  tiktok: publishToTikTok,
  youtube: publishToYouTube,
};

/**
 * Publish to a single platform
 */
export async function publishToPlatform(platform, account, content, media = [], metadata = {}) {
  const publisher = publishers[platform.toLowerCase()];

  if (!publisher) {
    return {
      success: false,
      platform,
      error: `Unsupported platform: ${platform}`,
    };
  }

  try {
    return await publisher(account, content, media, metadata);
  } catch (error) {
    console.error(`Publishing to ${platform} failed:`, error);
    return {
      success: false,
      platform,
      error: error.message,
    };
  }
}

/**
 * Publish to multiple platforms simultaneously
 */
export async function publishToMultiplePlatforms(platforms, accounts, content, media = [], metadata = {}) {
  const results = await Promise.allSettled(
    platforms.map(async (platform) => {
      const account = accounts.find(acc => acc.platform.toLowerCase() === platform.toLowerCase());

      if (!account) {
        return {
          success: false,
          platform,
          error: 'No connected account found for this platform',
        };
      }

      return await publishToPlatform(platform, account, content, media, metadata);
    })
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        success: false,
        platform: platforms[index],
        error: result.reason?.message || 'Unknown error',
      };
    }
  });
}

export {
  publishToInstagram,
  publishToFacebook,
  publishToTwitter,
  publishTwitterThread,
  publishToLinkedIn,
  publishToTikTok,
  publishToYouTube,
};
