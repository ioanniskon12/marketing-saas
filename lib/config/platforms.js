/**
 * Shared Platform Configuration
 *
 * Centralized configuration for social media platforms used across the application
 */

import { Instagram, Facebook, Linkedin, Twitter, Grid3x3, Music, Youtube, Image, Film, Video } from 'lucide-react';

// Content types for each platform
export const CONTENT_TYPES = {
  feed: { id: 'feed', label: 'Feed Post', icon: Image },
  story: { id: 'story', label: 'Story', icon: Film },
  reel: { id: 'reel', label: 'Reel', icon: Video },
  post: { id: 'post', label: 'Post', icon: Image },
  video: { id: 'video', label: 'Video', icon: Video },
  short: { id: 'short', label: 'Short', icon: Film },
};

export const PLATFORM_CONFIG = {
  all: {
    id: 'all',
    label: 'All Platforms',
    icon: Grid3x3,
    color: '#8B5CF6',
    name: 'All Platforms',
    maxLength: 63206, // Facebook's max
    requiresMedia: false,
    maxMedia: 10,
    hashtagLimit: 30,
    contentTypes: ['feed', 'story', 'reel', 'post', 'video', 'short']
  },
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    icon: Instagram,
    color: '#E4405F',
    name: 'Instagram',
    maxLength: 2200,
    requiresMedia: true,
    maxMedia: 10,
    hashtagLimit: 30,
    contentTypes: ['feed', 'story', 'reel'],
    contentTypeConfig: {
      feed: {
        maxMedia: 10,
        aspectRatio: '1:1',
        maxDuration: null,
        description: 'Regular feed posts with images or carousel'
      },
      story: {
        maxMedia: 1,
        aspectRatio: '9:16',
        maxDuration: 60,
        description: 'Vertical stories that disappear after 24 hours'
      },
      reel: {
        maxMedia: 1,
        aspectRatio: '9:16',
        maxDuration: 90,
        description: 'Short-form vertical videos up to 90 seconds'
      }
    },
    bestPractices: [
      'Use 5-10 hashtags for best engagement',
      'Post between 11am-1pm or 7pm-9pm for maximum visibility',
      'Square images (1080x1080) perform best for feed posts'
    ]
  },
  facebook: {
    id: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
    name: 'Facebook',
    maxLength: 63206,
    requiresMedia: false,
    maxMedia: 10,
    hashtagLimit: 30,
    contentTypes: ['post', 'story', 'reel'],
    contentTypeConfig: {
      post: {
        maxMedia: 10,
        aspectRatio: 'any',
        maxDuration: null,
        description: 'Regular feed posts with text, images, or video'
      },
      story: {
        maxMedia: 1,
        aspectRatio: '9:16',
        maxDuration: 20,
        description: 'Vertical stories that disappear after 24 hours'
      },
      reel: {
        maxMedia: 1,
        aspectRatio: '9:16',
        maxDuration: 90,
        description: 'Short-form vertical videos'
      }
    },
    bestPractices: [
      'Posts with images get 2.3x more engagement',
      'Best time to post: 1pm-3pm on weekdays',
      'Video posts get 59% more engagement'
    ]
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    color: '#0A66C2',
    name: 'LinkedIn',
    maxLength: 3000,
    requiresMedia: false,
    maxMedia: 9,
    hashtagLimit: 5,
    contentTypes: ['post', 'video'],
    contentTypeConfig: {
      post: {
        maxMedia: 9,
        aspectRatio: 'any',
        maxDuration: null,
        description: 'Professional posts with text, images, or documents'
      },
      video: {
        maxMedia: 1,
        aspectRatio: 'any',
        maxDuration: 600,
        description: 'Native video content up to 10 minutes'
      }
    },
    bestPractices: [
      'Keep posts under 1,300 characters for full visibility',
      'Use 3-5 hashtags maximum',
      'Best time to post: 7am-9am or 5pm-6pm on weekdays'
    ]
  },
  twitter: {
    id: 'twitter',
    label: 'Twitter/X',
    icon: Twitter,
    color: '#1DA1F2',
    name: 'Twitter/X',
    maxLength: 280,
    requiresMedia: false,
    maxMedia: 4,
    hashtagLimit: 2,
    contentTypes: ['post', 'video'],
    contentTypeConfig: {
      post: {
        maxMedia: 4,
        aspectRatio: 'any',
        maxDuration: null,
        description: 'Tweets with up to 4 images or 1 video'
      },
      video: {
        maxMedia: 1,
        aspectRatio: 'any',
        maxDuration: 140,
        description: 'Video tweets up to 2 minutes 20 seconds'
      }
    },
    bestPractices: [
      'Posts with images get 150% more reposts',
      'Use 1-2 hashtags maximum',
      'Best time to post: 8am-10am or 6pm-9pm'
    ]
  },
  tiktok: {
    id: 'tiktok',
    label: 'TikTok',
    icon: Music,
    color: '#000000',
    name: 'TikTok',
    maxLength: 2200,
    requiresMedia: true,
    maxMedia: 1,
    hashtagLimit: 30,
    contentTypes: ['video', 'story'],
    contentTypeConfig: {
      video: {
        maxMedia: 1,
        aspectRatio: '9:16',
        maxDuration: 180,
        description: 'Vertical videos up to 3 minutes'
      },
      story: {
        maxMedia: 1,
        aspectRatio: '9:16',
        maxDuration: 15,
        description: 'Quick stories up to 15 seconds'
      }
    },
    bestPractices: [
      'Videos between 15-30 seconds perform best',
      'Use trending sounds for better reach',
      'Post between 6pm-10pm for maximum engagement'
    ]
  },
  youtube: {
    id: 'youtube',
    label: 'YouTube',
    icon: Youtube,
    color: '#FF0000',
    name: 'YouTube',
    maxLength: 5000,
    requiresMedia: true,
    maxMedia: 1,
    hashtagLimit: 15,
    contentTypes: ['video', 'short'],
    contentTypeConfig: {
      video: {
        maxMedia: 1,
        aspectRatio: '16:9',
        maxDuration: null,
        description: 'Standard YouTube videos'
      },
      short: {
        maxMedia: 1,
        aspectRatio: '9:16',
        maxDuration: 60,
        description: 'Vertical short-form videos up to 60 seconds'
      }
    },
    bestPractices: [
      'Create compelling thumbnails for higher CTR',
      'First 15 seconds are crucial for retention',
      'Best time to upload: 2pm-4pm on weekdays'
    ]
  }
};

// Array of platform tabs for UI rendering (includes "all")
export const PLATFORM_TABS = [
  PLATFORM_CONFIG.all,
  PLATFORM_CONFIG.instagram,
  PLATFORM_CONFIG.facebook,
  PLATFORM_CONFIG.linkedin,
  PLATFORM_CONFIG.twitter,
  PLATFORM_CONFIG.tiktok,
  PLATFORM_CONFIG.youtube,
];

// Array of platform tabs WITHOUT "all" (for content/calendar pages)
export const PLATFORM_TABS_NO_ALL = [
  PLATFORM_CONFIG.instagram,
  PLATFORM_CONFIG.facebook,
  PLATFORM_CONFIG.linkedin,
  PLATFORM_CONFIG.twitter,
  PLATFORM_CONFIG.tiktok,
  PLATFORM_CONFIG.youtube,
];

// Get platform config by ID
export const getPlatformConfig = (platformId) => {
  return PLATFORM_CONFIG[platformId] || PLATFORM_CONFIG.all;
};

// Get content types for a platform
export const getContentTypes = (platformId) => {
  const platform = PLATFORM_CONFIG[platformId];
  if (!platform || !platform.contentTypes) return [];

  return platform.contentTypes.map(typeId => ({
    ...CONTENT_TYPES[typeId],
    config: platform.contentTypeConfig?.[typeId] || {}
  }));
};

// Get content type config for a platform
export const getContentTypeConfig = (platformId, contentTypeId) => {
  const platform = PLATFORM_CONFIG[platformId];
  if (!platform || !platform.contentTypeConfig) return null;

  return platform.contentTypeConfig[contentTypeId] || null;
};

// Get default content type for a platform
export const getDefaultContentType = (platformId) => {
  const platform = PLATFORM_CONFIG[platformId];
  if (!platform || !platform.contentTypes || platform.contentTypes.length === 0) {
    return 'post';
  }
  return platform.contentTypes[0];
};

// Check if platform supports a content type
export const platformSupportsContentType = (platformId, contentTypeId) => {
  const platform = PLATFORM_CONFIG[platformId];
  if (!platform || !platform.contentTypes) return false;
  return platform.contentTypes.includes(contentTypeId);
};
