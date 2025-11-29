/**
 * Platform-Specific Validation Utilities
 *
 * Validates content against platform-specific requirements
 */

import { PLATFORM_CONFIG } from '@/lib/config/platforms';

/**
 * Validate content for a specific platform
 */
export function validateContent(platform, content, media = []) {
  const config = PLATFORM_CONFIG[platform];
  const errors = [];

  if (!config) {
    errors.push(`Unknown platform: ${platform}`);
    return { isValid: false, errors };
  }

  // Character limit validation
  if (content.length > config.maxLength) {
    errors.push(
      `Content exceeds ${config.maxLength} character limit for ${config.name} (current: ${content.length})`
    );
  }

  // Media requirement validation
  if (config.requiresMedia && media.length === 0) {
    errors.push(`${config.name} requires at least one media item`);
  }

  // Media count validation
  if (media.length > config.maxMedia) {
    errors.push(
      `${config.name} allows maximum ${config.maxMedia} media items (current: ${media.length})`
    );
  }

  // Hashtag validation
  const hashtags = extractHashtags(content);
  if (hashtags.length > config.hashtagLimit) {
    errors.push(
      `${config.name} allows maximum ${config.hashtagLimit} hashtags (current: ${hashtags.length})`
    );
  }

  // Platform-specific validations
  switch (platform) {
    case 'twitter':
      validateTwitter(content, media, errors);
      break;
    case 'instagram':
      validateInstagram(content, media, errors);
      break;
    case 'linkedin':
      validateLinkedIn(content, errors);
      break;
    case 'tiktok':
      validateTikTok(media, errors);
      break;
    case 'youtube':
      validateYouTube(media, errors);
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: generateWarnings(platform, content, media),
  };
}

/**
 * Extract hashtags from content
 */
function extractHashtags(content) {
  const hashtagRegex = /#[\w]+/g;
  return content.match(hashtagRegex) || [];
}

/**
 * Twitter-specific validation
 */
function validateTwitter(content, media, errors) {
  // Check for Twitter-specific issues
  if (media.length > 0 && media.some((m) => m.type === 'video') && media.length > 1) {
    errors.push('Twitter allows only one video per tweet');
  }

  // URL shortening consideration
  const urls = content.match(/https?:\/\/[^\s]+/g) || [];
  urls.forEach(() => {
    // Each URL counts as 23 characters on Twitter
  });
}

/**
 * Instagram-specific validation
 */
function validateInstagram(content, media, errors) {
  if (media.length === 0) {
    errors.push('Instagram posts require at least one image or video');
  }

  // Check for carousel limits
  if (media.length > 10) {
    errors.push('Instagram carousels support maximum 10 items');
  }

  // First comment for extra caption
  if (content.length > 2200) {
    errors.push('Instagram caption limit is 2,200 characters');
  }
}

/**
 * LinkedIn-specific validation
 */
function validateLinkedIn(content, errors) {
  // Warn about visibility cutoff
  if (content.length > 1300) {
    // This is a warning, not an error
  }

  // LinkedIn specific formatting
  if (content.includes('</') || content.includes('/>')) {
    errors.push('LinkedIn does not support HTML tags in posts');
  }
}

/**
 * TikTok-specific validation
 */
function validateTikTok(media, errors) {
  if (media.length === 0) {
    errors.push('TikTok requires a video');
  }

  if (media.length > 1) {
    errors.push('TikTok supports only one video per post');
  }

  const video = media[0];
  if (video && video.type !== 'video') {
    errors.push('TikTok only accepts video content');
  }
}

/**
 * YouTube-specific validation
 */
function validateYouTube(media, errors) {
  if (media.length === 0) {
    errors.push('YouTube requires a video');
  }

  if (media.length > 1) {
    errors.push('YouTube supports only one video per upload');
  }

  const video = media[0];
  if (video && video.type !== 'video') {
    errors.push('YouTube only accepts video content');
  }
}

/**
 * Generate warnings for best practices
 */
function generateWarnings(platform, content, media) {
  const config = PLATFORM_CONFIG[platform];
  const warnings = [];

  // General warnings
  if (content.length === 0) {
    warnings.push('Empty content may not perform well');
  }

  // Platform-specific warnings
  switch (platform) {
    case 'twitter':
      if (content.length > 250) {
        warnings.push('Tweets under 250 characters tend to get more engagement');
      }
      if (extractHashtags(content).length > 2) {
        warnings.push('Twitter recommends using 1-2 hashtags maximum');
      }
      break;

    case 'instagram':
      const hashtags = extractHashtags(content);
      if (hashtags.length < 5) {
        warnings.push('Instagram posts with 5-10 hashtags tend to perform better');
      }
      if (media.length === 0) {
        warnings.push('Instagram posts require media');
      }
      break;

    case 'linkedin':
      if (content.length > 1300) {
        warnings.push('Content over 1,300 characters will be truncated in feed');
      }
      if (extractHashtags(content).length > 5) {
        warnings.push('LinkedIn recommends 3-5 hashtags for optimal reach');
      }
      break;

    case 'facebook':
      if (media.length === 0) {
        warnings.push('Posts with images get 2.3x more engagement on Facebook');
      }
      break;

    case 'tiktok':
      if (media.length > 0 && media[0].duration) {
        if (media[0].duration < 15) {
          warnings.push('Videos under 15 seconds may have lower completion rates');
        }
        if (media[0].duration > 60) {
          warnings.push('Videos over 60 seconds typically see lower engagement');
        }
      }
      break;
  }

  return warnings;
}

/**
 * Validate multiple platforms at once
 */
export function validateMultiplePlatforms(platforms, content, media = []) {
  const results = {};

  platforms.forEach((platform) => {
    results[platform] = validateContent(platform, content, media);
  });

  const allValid = Object.values(results).every((r) => r.isValid);
  const allErrors = Object.entries(results)
    .filter(([_, r]) => !r.isValid)
    .map(([platform, r]) => ({
      platform,
      errors: r.errors,
    }));

  return {
    isValid: allValid,
    results,
    allErrors,
  };
}

/**
 * Get optimal content length for platform
 */
export function getOptimalLength(platform) {
  const optimal = {
    twitter: { min: 71, max: 100, ideal: 80 },
    instagram: { min: 138, max: 150, ideal: 140 },
    facebook: { min: 40, max: 80, ideal: 50 },
    linkedin: { min: 1000, max: 1300, ideal: 1200 },
    tiktok: { min: 100, max: 150, ideal: 125 },
    youtube: { min: 200, max: 300, ideal: 250 },
  };

  return optimal[platform] || { min: 0, max: 1000, ideal: 500 };
}

/**
 * Truncate content for platform
 */
export function truncateForPlatform(platform, content) {
  const config = PLATFORM_CONFIG[platform];
  if (content.length <= config.maxLength) {
    return content;
  }

  // Truncate and add ellipsis
  return content.substring(0, config.maxLength - 3) + '...';
}

/**
 * Check if media is valid for platform
 */
export function validateMedia(platform, media) {
  const config = PLATFORM_CONFIG[platform];
  const errors = [];

  media.forEach((item, index) => {
    // Check file type
    if (item.type === 'video') {
      // Video-specific validation
      if (platform === 'instagram' && item.duration && item.duration > 60) {
        errors.push(`Video ${index + 1}: Instagram Reels must be under 60 seconds`);
      }
      if (platform === 'twitter' && item.size && item.size > 512 * 1024 * 1024) {
        errors.push(`Video ${index + 1}: Twitter videos must be under 512MB`);
      }
    } else if (item.type === 'image') {
      // Image-specific validation
      if (item.size && item.size > 20 * 1024 * 1024) {
        errors.push(`Image ${index + 1}: File size should be under 20MB`);
      }
    }

    // Check aspect ratio recommendations
    if (item.width && item.height) {
      const ratio = item.width / item.height;
      if (platform === 'instagram') {
        if (ratio < 0.8 || ratio > 1.91) {
          errors.push(
            `Media ${index + 1}: Instagram recommends aspect ratio between 4:5 and 1.91:1`
          );
        }
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
