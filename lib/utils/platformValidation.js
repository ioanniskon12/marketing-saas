/**
 * Platform Validation Utilities
 *
 * Validates post data for each social media platform
 * Returns { isValid, errors } where errors is a map of field -> message
 */

// Character limits per platform
export const CHAR_LIMITS = {
  facebook: {
    caption: 63206,
    recommended: 2200,
    description: 'Recommended: under 2,200 characters for best results — max 63,206'
  },
  instagram: {
    caption: 2200,
    recommended: 220,
    hashtags: 30,
    description: '2,200 characters max, recommended under 138-220 characters'
  },
  linkedin: {
    caption: 3000,
    description: '3,000 characters max'
  },
  twitter: {
    caption: 280,
    description: '280 characters (hard limit)'
  },
  tiktok: {
    caption: 2200,
    description: '2,200 characters max'
  },
  youtube: {
    title: 100,
    description: 5000,
    titleDesc: '100 characters max',
    descriptionDesc: '5,000 characters max'
  }
};

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  youtubeVideo: 500 * 1024 * 1024, // 500MB for YouTube
};

// Media count limits
export const MEDIA_LIMITS = {
  facebook: { images: 10, videos: 1 },
  instagram: { carousel: 10, reel: 1 },
  linkedin: { images: 9, videos: 1 },
  twitter: { images: 4, videos: 1 },
  tiktok: { videos: 1 },
  youtube: { videos: 1 }
};

// Recommended image dimensions
export const IMAGE_DIMENSIONS = {
  instagram: {
    feedSquare: '1080×1080',
    feedPortrait: '1080×1350',
    feedLandscape: '1080×608',
    reelsStories: '1080×1920 (9:16)'
  },
  facebook: {
    feed: '1200×630 or 1080×1080'
  },
  linkedin: {
    image: '1200×627'
  },
  twitter: {
    image: '1600×900 (min 600×335)'
  },
  tiktok: {
    video: '1080×1920 (9:16)'
  },
  youtube: {
    thumbnail: '1280×720 (16:9)'
  }
};

/**
 * Validate Facebook post data
 */
export function validateFacebook(data) {
  const errors = {};

  // At least caption or media required
  if (!data.caption?.trim() && (!data.media || data.media.length === 0)) {
    errors.general = 'At least caption or media is required';
  }

  // Caption length
  if (data.caption && data.caption.length > CHAR_LIMITS.facebook.caption) {
    errors.caption = `Caption must be under ${CHAR_LIMITS.facebook.caption} characters`;
  }

  // Media validation
  if (data.media && data.media.length > 0) {
    const hasVideo = data.media.some(m => m.mimeType?.startsWith('video'));
    const hasImages = data.media.some(m => m.mimeType?.startsWith('image'));

    if (hasVideo && data.media.length > 1) {
      errors.media = 'Facebook supports only 1 video per post (or multiple images)';
    }

    if (hasImages && data.media.length > MEDIA_LIMITS.facebook.images) {
      errors.media = `Facebook supports up to ${MEDIA_LIMITS.facebook.images} images per post`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate Instagram post data
 */
export function validateInstagram(data) {
  const errors = {};

  // Media is required
  if (!data.media || data.media.length === 0) {
    errors.media = 'At least 1 image or video is required for Instagram';
  }

  // Caption length
  if (data.caption && data.caption.length > CHAR_LIMITS.instagram.caption) {
    errors.caption = `Caption must be under ${CHAR_LIMITS.instagram.caption} characters`;
  }

  // Hashtag limit
  if (data.hashtags) {
    const hashtagCount = data.hashtags.split(/[\s,#]+/).filter(tag => tag.trim()).length;
    if (hashtagCount > CHAR_LIMITS.instagram.hashtags) {
      errors.hashtags = `Maximum ${CHAR_LIMITS.instagram.hashtags} hashtags allowed`;
    }
  }

  // Placement-specific validation
  if (data.placementType === 'feed') {
    if (data.media && data.media.length > MEDIA_LIMITS.instagram.carousel) {
      errors.media = `Instagram feed posts support up to ${MEDIA_LIMITS.instagram.carousel} items`;
    }
  } else if (data.placementType === 'reel') {
    if (!data.media || data.media.length !== 1) {
      errors.media = 'Instagram Reels require exactly 1 video';
    }
    if (data.media && data.media.length === 1 && !data.media[0].mimeType?.startsWith('video')) {
      errors.media = 'Instagram Reels require a video file';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate LinkedIn post data
 */
export function validateLinkedIn(data) {
  const errors = {};

  // At least caption or media required
  if (!data.caption?.trim() && (!data.media || data.media.length === 0)) {
    errors.general = 'At least caption or media is required';
  }

  // Caption length
  if (data.caption && data.caption.length > CHAR_LIMITS.linkedin.caption) {
    errors.caption = `Caption must be under ${CHAR_LIMITS.linkedin.caption} characters`;
  }

  // Media validation
  if (data.media && data.media.length > 0) {
    const hasVideo = data.media.some(m => m.mimeType?.startsWith('video'));

    if (hasVideo && data.media.length > 1) {
      errors.media = 'LinkedIn supports only 1 video per post (or multiple images)';
    }

    if (data.media.length > MEDIA_LIMITS.linkedin.images) {
      errors.media = `LinkedIn supports up to ${MEDIA_LIMITS.linkedin.images} images per post`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate Twitter/X post data
 */
export function validateTwitter(data) {
  const errors = {};

  // Caption required
  if (!data.caption?.trim()) {
    errors.caption = 'Tweet text is required';
  }

  // 280 character limit (hard)
  if (data.caption && data.caption.length > CHAR_LIMITS.twitter.caption) {
    errors.caption = `Tweet must be ${CHAR_LIMITS.twitter.caption} characters or less`;
  }

  // Media rules: 4 images OR 1 video/GIF
  if (data.media && data.media.length > 0) {
    const hasVideo = data.media.some(m => m.mimeType?.startsWith('video'));
    const hasImages = data.media.some(m => m.mimeType?.startsWith('image'));

    if (hasVideo && data.media.length > 1) {
      errors.media = 'Twitter supports only 1 video per tweet (or up to 4 images)';
    }

    if (hasImages && data.media.length > MEDIA_LIMITS.twitter.images) {
      errors.media = `Twitter supports up to ${MEDIA_LIMITS.twitter.images} images per tweet`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate TikTok post data
 */
export function validateTikTok(data) {
  const errors = {};

  // Video is required
  if (!data.video) {
    errors.video = 'Video is required for TikTok';
  }

  // Caption length
  if (data.caption && data.caption.length > CHAR_LIMITS.tiktok.caption) {
    errors.caption = `Caption must be under ${CHAR_LIMITS.tiktok.caption} characters`;
  }

  // Video must be video type
  if (data.video && !data.video.mimeType?.startsWith('video')) {
    errors.video = 'TikTok requires a video file';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate YouTube post data
 */
export function validateYouTube(data) {
  const errors = {};

  // Video is required
  if (!data.video) {
    errors.video = 'Video is required for YouTube';
  }

  // Title is required
  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  }

  // Title length
  if (data.title && data.title.length > CHAR_LIMITS.youtube.title) {
    errors.title = `Title must be ${CHAR_LIMITS.youtube.title} characters or less`;
  }

  // Description length
  if (data.description && data.description.length > CHAR_LIMITS.youtube.description) {
    errors.description = `Description must be under ${CHAR_LIMITS.youtube.description} characters`;
  }

  // Video must be video type
  if (data.video && !data.video.mimeType?.startsWith('video')) {
    errors.video = 'YouTube requires a video file';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate all platforms in platformData
 * Returns map of platform -> validation result
 */
export function validateAllPlatforms(platformData, selectedPlatforms) {
  const results = {};

  selectedPlatforms.forEach(platform => {
    const data = platformData[platform];

    switch (platform) {
      case 'facebook':
        results.facebook = validateFacebook(data);
        break;
      case 'instagram':
        results.instagram = validateInstagram(data);
        break;
      case 'linkedin':
        results.linkedin = validateLinkedIn(data);
        break;
      case 'twitter':
        results.twitter = validateTwitter(data);
        break;
      case 'tiktok':
        results.tiktok = validateTikTok(data);
        break;
      case 'youtube':
        results.youtube = validateYouTube(data);
        break;
      default:
        break;
    }
  });

  return results;
}

/**
 * Check if any platform has validation errors
 */
export function hasAnyErrors(validationResults) {
  return Object.values(validationResults).some(result => !result.isValid);
}

/**
 * Get character count display text
 */
export function getCharCountText(text, limit, recommended) {
  const count = text?.length || 0;

  if (recommended && count > recommended) {
    return `${count}/${limit} (recommended: ${recommended})`;
  }

  return `${count}/${limit}`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
