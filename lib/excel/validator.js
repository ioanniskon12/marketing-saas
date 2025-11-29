/**
 * Excel Data Validation
 *
 * Validate imported post data from Excel files.
 */

import {
  parsePlatforms,
  parseMediaUrls,
  parseDate,
  parseTime,
  combineDateAndTime,
} from './parser';

/**
 * Supported platforms
 */
const VALID_PLATFORMS = ['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok'];

/**
 * Valid post statuses
 */
const VALID_STATUSES = ['draft', 'scheduled', 'published'];

/**
 * Platform character limits
 */
const PLATFORM_LIMITS = {
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  twitter: 280,
  tiktok: 2200,
};

/**
 * Validate a single post row
 */
export function validatePost(post, connectedAccountPlatforms = []) {
  const errors = [];
  const warnings = [];

  // Required: content
  if (!post.content || post.content.trim().length === 0) {
    errors.push('Content is required');
  } else if (post.content.length > 5000) {
    errors.push('Content is too long (max 5000 characters)');
  }

  // Validate platforms
  const platforms = parsePlatforms(post.platforms);

  if (platforms.length === 0) {
    errors.push('At least one platform is required');
  } else {
    // Check for invalid platforms
    const invalidPlatforms = platforms.filter(p => !VALID_PLATFORMS.includes(p));
    if (invalidPlatforms.length > 0) {
      errors.push(`Invalid platforms: ${invalidPlatforms.join(', ')}`);
    }

    // Check for unconnected platforms
    if (connectedAccountPlatforms.length > 0) {
      const unconnectedPlatforms = platforms.filter(
        p => !connectedAccountPlatforms.includes(p)
      );
      if (unconnectedPlatforms.length > 0) {
        warnings.push(
          `No connected accounts for: ${unconnectedPlatforms.join(', ')}`
        );
      }
    }

    // Check character limits for each platform
    platforms.forEach(platform => {
      const limit = PLATFORM_LIMITS[platform];
      if (limit && post.content.length > limit) {
        errors.push(
          `Content exceeds ${platform} limit of ${limit} characters`
        );
      }
    });
  }

  // Validate scheduled date/time
  if (post.scheduled_date) {
    const date = parseDate(post.scheduled_date);

    if (!date || isNaN(date.getTime())) {
      errors.push('Invalid scheduled date format');
    } else {
      // Check if date is in the past
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (date < now) {
        warnings.push('Scheduled date is in the past');
      }
    }

    // Validate time if provided
    if (post.scheduled_time) {
      const time = parseTime(post.scheduled_time);

      if (!time) {
        errors.push('Invalid scheduled time format');
      } else {
        // Check if scheduled datetime is in the past
        const scheduledFor = combineDateAndTime(
          post.scheduled_date,
          post.scheduled_time
        );

        if (scheduledFor && new Date(scheduledFor) < new Date()) {
          warnings.push('Scheduled time is in the past');
        }
      }
    }
  }

  // Validate media URLs
  if (post.media_urls) {
    const urls = parseMediaUrls(post.media_urls);

    urls.forEach((url, index) => {
      try {
        new URL(url);
      } catch (e) {
        errors.push(`Invalid media URL at position ${index + 1}`);
      }
    });

    // Check media count limits per platform
    if (urls.length > 10) {
      warnings.push('More than 10 media files (may exceed platform limits)');
    }
  }

  // Validate status
  if (post.status) {
    const status = post.status.toLowerCase().trim();

    if (!VALID_STATUSES.includes(status)) {
      errors.push(`Invalid status: ${post.status} (must be draft, scheduled, or published)`);
    }

    // Check if status matches scheduling
    if (status === 'scheduled' && !post.scheduled_date) {
      warnings.push('Status is scheduled but no date provided');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate all posts in batch
 */
export function validatePosts(posts, connectedAccountPlatforms = []) {
  const results = posts.map(post => {
    const validation = validatePost(post, connectedAccountPlatforms);

    return {
      rowNumber: post._rowNumber,
      post,
      ...validation,
    };
  });

  const validPosts = results.filter(r => r.isValid);
  const invalidPosts = results.filter(r => !r.isValid);

  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  return {
    results,
    summary: {
      total: posts.length,
      valid: validPosts.length,
      invalid: invalidPosts.length,
      errors: totalErrors,
      warnings: totalWarnings,
    },
    validPosts: validPosts.map(r => r.post),
    invalidPosts: invalidPosts.map(r => ({
      post: r.post,
      rowNumber: r.rowNumber,
      errors: r.errors,
      warnings: r.warnings,
    })),
  };
}

/**
 * Transform validated post to database format
 */
export function transformPostForDb(post, workspaceId, userId, accountIdsByPlatform) {
  const platforms = parsePlatforms(post.platforms);

  // Map platform names to account IDs
  const platformAccountIds = platforms
    .map(platform => accountIdsByPlatform[platform])
    .filter(id => id !== undefined);

  // Parse scheduled date/time
  const scheduledFor = post.scheduled_date
    ? combineDateAndTime(post.scheduled_date, post.scheduled_time)
    : null;

  // Determine status
  let status = 'draft';
  if (post.status && VALID_STATUSES.includes(post.status.toLowerCase().trim())) {
    status = post.status.toLowerCase().trim();
  } else if (scheduledFor) {
    status = 'scheduled';
  }

  // Parse media URLs
  const mediaUrls = parseMediaUrls(post.media_urls);

  return {
    workspace_id: workspaceId,
    created_by: userId,
    content: post.content.trim(),
    platforms: platformAccountIds,
    scheduled_for: scheduledFor,
    status,
    media: mediaUrls.map(url => ({
      file_url: url,
      file_type: getFileTypeFromUrl(url),
      file_size: 0, // Unknown for external URLs
      order_index: mediaUrls.indexOf(url),
    })),
  };
}

/**
 * Get file type from URL extension
 */
function getFileTypeFromUrl(url) {
  const extension = url.split('.').pop().toLowerCase().split('?')[0];

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];

  if (imageExtensions.includes(extension)) {
    return 'image';
  }

  if (videoExtensions.includes(extension)) {
    return 'video';
  }

  return 'unknown';
}

/**
 * Check for duplicate content
 */
export function findDuplicates(posts) {
  const contentMap = new Map();
  const duplicates = [];

  posts.forEach((post, index) => {
    const content = post.content.trim().toLowerCase();

    if (contentMap.has(content)) {
      duplicates.push({
        rowNumber: post._rowNumber,
        duplicateOf: contentMap.get(content),
        content: post.content.substring(0, 100) + '...',
      });
    } else {
      contentMap.set(content, post._rowNumber);
    }
  });

  return duplicates;
}

/**
 * Generate validation summary report
 */
export function generateValidationReport(validationResult) {
  const { summary, invalidPosts } = validationResult;

  const report = {
    summary: {
      total: summary.total,
      valid: summary.valid,
      invalid: summary.invalid,
      errors: summary.errors,
      warnings: summary.warnings,
    },
    canProceed: summary.valid > 0,
    issues: [],
  };

  // Add invalid post details
  if (invalidPosts.length > 0) {
    report.issues = invalidPosts.map(({ rowNumber, post, errors, warnings }) => ({
      row: rowNumber,
      content: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
      errors,
      warnings,
    }));
  }

  return report;
}
