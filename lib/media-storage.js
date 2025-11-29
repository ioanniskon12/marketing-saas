/**
 * Media Storage Utilities
 *
 * Handles media file uploads to Supabase Storage (media bucket)
 * Used for social media post images, videos, and other media assets
 */

import { createClient } from '@/lib/supabase/client';

const MEDIA_BUCKET = 'media';

/**
 * Upload a single media file to Supabase Storage
 *
 * @param {File} file - File object to upload
 * @param {string} workspaceId - Workspace ID for organization
 * @param {Object} metadata - Optional metadata for the file
 * @returns {Promise<Object>} Upload result with URL and metadata
 */
export async function uploadMediaFile(file, workspaceId, metadata = {}) {
  const supabase = createClient();

  // Generate unique file name preserving extension
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const fileName = `${workspaceId}/${timestamp}-${randomStr}.${fileExt}`;

  try {
    // Upload file to storage
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(fileName);

    // Extract image/video dimensions if possible
    const dimensions = await getMediaDimensions(file);

    return {
      path: data.path,
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      width: dimensions?.width || null,
      height: dimensions?.height || null,
      duration: dimensions?.duration || null,
      ...metadata,
    };
  } catch (error) {
    console.error('Error uploading media file:', error);
    throw error;
  }
}

/**
 * Upload multiple media files in batch
 *
 * @param {File[]} files - Array of files to upload
 * @param {string} workspaceId - Workspace ID
 * @param {Function} onProgress - Optional progress callback (current, total)
 * @returns {Promise<Array>} Array of upload results
 */
export async function uploadMediaBatch(files, workspaceId, onProgress = null) {
  const results = [];
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadMediaFile(files[i], workspaceId);
      results.push(result);

      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`Failed to upload ${files[i].name}:`, error);
      errors.push({ file: files[i].name, error: error.message });
    }
  }

  return { results, errors };
}

/**
 * Delete a media file from storage
 *
 * @param {string} path - File path in storage bucket
 * @returns {Promise<boolean>}
 */
export async function deleteMediaFile(path) {
  const supabase = createClient();

  try {
    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting media file:', error);
    throw error;
  }
}

/**
 * List all media files in workspace
 *
 * @param {string} workspaceId - Workspace ID
 * @param {Object} options - List options (limit, offset, search)
 * @returns {Promise<Array>} Array of media files
 */
export async function listMediaFiles(workspaceId, options = {}) {
  const supabase = createClient();
  const { limit = 100, offset = 0, searchTerm = '' } = options;

  try {
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .list(workspaceId, {
        limit,
        offset,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('List error:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }

    // Filter by search term if provided
    let files = data || [];
    if (searchTerm) {
      files = files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Get public URLs for all files
    const filesWithUrls = files.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from(MEDIA_BUCKET)
        .getPublicUrl(`${workspaceId}/${file.name}`);

      return {
        id: file.id,
        name: file.name,
        path: `${workspaceId}/${file.name}`,
        url: publicUrl,
        size: file.metadata?.size || 0,
        mimeType: file.metadata?.mimetype || '',
        createdAt: file.created_at,
        updatedAt: file.updated_at,
      };
    });

    return filesWithUrls;
  } catch (error) {
    console.error('Error listing media files:', error);
    throw error;
  }
}

/**
 * Get signed URL for private media access
 *
 * @param {string} path - File path in storage
 * @param {number} expiresIn - Expiry time in seconds (default: 3600)
 * @returns {Promise<string>} Signed URL
 */
export async function getSignedMediaUrl(path, expiresIn = 3600) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }
}

/**
 * Get media file dimensions (for images and videos)
 *
 * @param {File} file - File object
 * @returns {Promise<Object|null>} Dimensions object or null
 */
function getMediaDimensions(file) {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };

      img.src = objectUrl;
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      const objectUrl = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
        });
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };

      video.src = objectUrl;
    } else {
      resolve(null);
    }
  });
}

/**
 * Validate media file
 *
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validateMediaFile(file, options = {}) {
  const {
    maxSize = 100 * 1024 * 1024, // 100MB default
    allowedTypes = ['image/*', 'video/*'],
    maxImageDimensions = { width: 8000, height: 8000 },
    maxVideoDuration = 600, // 10 minutes
  } = options;

  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${formatFileSize(maxSize)}`);
  }

  // Check file type
  const isAllowedType = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.replace('/*', '/'));
    }
    return file.type === type;
  });

  if (!isAllowedType) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get media file category
 *
 * @param {string} mimeType - MIME type of the file
 * @returns {string} Category name
 */
export function getMediaCategory(mimeType) {
  if (!mimeType) return 'file';

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';

  return 'file';
}

/**
 * Format file size for display
 *
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Generate thumbnail URL for video
 *
 * @param {string} videoUrl - Video URL
 * @param {number} timeOffset - Time offset in seconds for thumbnail
 * @returns {Promise<string>} Thumbnail data URL
 */
export async function generateVideoThumbnail(videoUrl, timeOffset = 1) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.currentTime = timeOffset;

    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };

    video.onerror = reject;
    video.src = videoUrl;
  });
}
