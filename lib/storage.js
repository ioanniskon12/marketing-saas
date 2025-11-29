/**
 * File Storage Utilities
 *
 * Handles file uploads to Supabase Storage
 */

import { createClient } from '@/lib/supabase/client';

const BUCKET_NAME = 'inbox-attachments';

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(file, workspaceId) {
  const supabase = createClient();

  // Generate unique file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${workspaceId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload file
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return {
    path: data.path,
    url: publicUrl,
    name: file.name,
    size: file.size,
    type: file.type
  };
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(path) {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }

  return true;
}

/**
 * Get file type category
 */
export function getFileCategory(mimeType) {
  if (!mimeType) return 'file';

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';

  return 'file';
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate file
 */
export function validateFile(file, maxSize = 10 * 1024 * 1024) { // 10MB default
  if (!file) {
    throw new Error('No file selected');
  }

  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${formatFileSize(maxSize)}`);
  }

  return true;
}
