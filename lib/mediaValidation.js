/**
 * Media Validation Utilities
 *
 * Validates media files against platform specifications including
 * dimensions, file size, format, and aspect ratios.
 */

import { PLATFORM_CONFIG, validateDimensions, getSizeWarning, formatFileSize } from '@/config/platformConfig';

/**
 * Validate a media file against platform requirements
 * @param {File} file - The media file to validate
 * @param {string} platform - Platform identifier (e.g., 'instagram', 'facebook')
 * @param {string} postType - Post type (e.g., 'post', 'reel', 'story')
 * @param {Object} customDimensions - Optional custom dimensions {width, height}
 * @returns {Object} Validation result with errors and warnings
 */
export function validateMediaFile(file, platform, postType = 'post', customDimensions = null) {
  const errors = [];
  const warnings = [];
  const info = [];

  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors, warnings, info };
  }

  // Get platform configuration
  const platformConfig = PLATFORM_CONFIG[platform]?.types[postType];
  if (!platformConfig) {
    warnings.push(`No specific requirements found for ${platform} ${postType}`);
    return { isValid: true, errors, warnings, info };
  }

  // Validate file type
  const fileType = file.type.split('/')[0]; // 'image' or 'video'
  const expectedMediaType = platformConfig.mediaType;

  if (expectedMediaType === 'image' && fileType !== 'image') {
    errors.push(`${platformConfig.name} requires an image file`);
  } else if (expectedMediaType === 'video' && fileType !== 'video') {
    errors.push(`${platformConfig.name} requires a video file`);
  } else if (expectedMediaType === 'image_or_video' && fileType !== 'image' && fileType !== 'video') {
    errors.push(`${platformConfig.name} requires an image or video file`);
  }

  // Validate file format
  if (platformConfig.formats) {
    const fileExtension = file.name.split('.').pop().toUpperCase();
    const mimeType = file.type.split('/')[1].toUpperCase();
    const isValidFormat = platformConfig.formats.some(format =>
      format.toUpperCase() === fileExtension || format.toUpperCase() === mimeType
    );

    if (!isValidFormat) {
      errors.push(
        `Invalid file format. ${platformConfig.name} supports: ${platformConfig.formats.join(', ')}`
      );
    }
  }

  // Validate file size
  if (platformConfig.maxFileSize && file.size > platformConfig.maxFileSize) {
    errors.push(
      `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(platformConfig.maxFileSize)})`
    );
  }

  // Validate dimensions (if provided or can be determined)
  if (customDimensions) {
    const { width, height } = customDimensions;

    // Check min/max constraints
    const dimensionsValidation = validateDimensions(width, height);
    if (!dimensionsValidation.isValid) {
      errors.push(...dimensionsValidation.errors);
    }

    // Check aspect ratio warnings
    const sizeWarning = getSizeWarning(platform, postType, width, height);
    if (sizeWarning) {
      warnings.push(sizeWarning);
    }

    info.push(`Media dimensions: ${width} × ${height}px`);
  }

  // Validate duration for videos
  if (fileType === 'video' && platformConfig.duration) {
    const { min, max } = platformConfig.duration;
    if (min) {
      info.push(`Minimum video duration: ${min} seconds`);
    }
    if (max) {
      info.push(`Maximum video duration: ${max} seconds`);
    }
  }

  // Add platform recommendations as info
  if (platformConfig.defaultSize && !customDimensions) {
    const { width, height, aspectRatio } = platformConfig.defaultSize;
    info.push(`Recommended dimensions: ${width} × ${height}px (${aspectRatio})`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info,
  };
}

/**
 * Validate multiple media files for multi-image posts
 * @param {File[]} files - Array of media files
 * @param {string} platform - Platform identifier
 * @param {string} postType - Post type
 * @returns {Object} Validation result
 */
export function validateMultipleMediaFiles(files, platform, postType = 'post') {
  const errors = [];
  const warnings = [];
  const info = [];

  if (!files || files.length === 0) {
    errors.push('No files provided');
    return { isValid: false, errors, warnings, info };
  }

  // Get platform configuration
  const platformConfig = PLATFORM_CONFIG[platform]?.types[postType];
  if (!platformConfig) {
    warnings.push(`No specific requirements found for ${platform} ${postType}`);
    return { isValid: true, errors, warnings, info };
  }

  // Check if platform supports multiple images
  if (platformConfig.mediaType === 'multiple_images' && platformConfig.maxSlides) {
    if (files.length > platformConfig.maxSlides) {
      errors.push(
        `${platformConfig.name} supports a maximum of ${platformConfig.maxSlides} images`
      );
    }
    info.push(`Uploading ${files.length} of ${platformConfig.maxSlides} allowed images`);
  } else if (platformConfig.mediaType !== 'multiple_images' && files.length > 1) {
    warnings.push(`${platformConfig.name} typically supports only 1 image`);
  }

  // Validate each file
  files.forEach((file, index) => {
    const validation = validateMediaFile(file, platform, postType);
    if (!validation.isValid) {
      errors.push(`File ${index + 1} (${file.name}): ${validation.errors.join(', ')}`);
    }
    warnings.push(...validation.warnings.map(w => `File ${index + 1}: ${w}`));
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info,
  };
}

/**
 * Get image dimensions from a file
 * @param {File} file - Image file
 * @returns {Promise<Object>} Dimensions {width, height}
 */
export function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Get video dimensions and duration from a file
 * @param {File} file - Video file
 * @returns {Promise<Object>} Video metadata {width, height, duration}
 */
export function getVideoMetadata(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('video/')) {
      reject(new Error('File is not a video'));
      return;
    }

    const video = document.createElement('video');
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video'));
    };

    video.src = url;
  });
}

/**
 * Validate media with dimensions extracted from the file
 * @param {File} file - Media file
 * @param {string} platform - Platform identifier
 * @param {string} postType - Post type
 * @returns {Promise<Object>} Validation result
 */
export async function validateMediaWithDimensions(file, platform, postType = 'post') {
  try {
    let dimensions = null;

    if (file.type.startsWith('image/')) {
      dimensions = await getImageDimensions(file);
    } else if (file.type.startsWith('video/')) {
      const metadata = await getVideoMetadata(file);
      dimensions = { width: metadata.width, height: metadata.height };

      // Additional video duration validation
      const platformConfig = PLATFORM_CONFIG[platform]?.types[postType];
      if (platformConfig?.duration) {
        const { min, max } = platformConfig.duration;
        const validationResult = validateMediaFile(file, platform, postType, dimensions);

        if (min && metadata.duration < min) {
          validationResult.errors.push(
            `Video duration (${metadata.duration.toFixed(1)}s) is less than minimum required (${min}s)`
          );
          validationResult.isValid = false;
        }

        if (max && metadata.duration > max) {
          validationResult.errors.push(
            `Video duration (${metadata.duration.toFixed(1)}s) exceeds maximum allowed (${max}s)`
          );
          validationResult.isValid = false;
        }

        return validationResult;
      }
    }

    return validateMediaFile(file, platform, postType, dimensions);
  } catch (error) {
    return {
      isValid: false,
      errors: [error.message || 'Failed to validate media'],
      warnings: [],
      info: [],
    };
  }
}
