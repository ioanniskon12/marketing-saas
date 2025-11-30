/**
 * Media Uploader Component
 *
 * Handles image and video uploads for posts.
 */

'use client';

import { useState, useRef } from 'react';
import styled from 'styled-components';
import { Upload, X, Image as ImageIcon, Video, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const Container = styled.div`
  width: 100%;
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
  display: block;
`;

const DropZone = styled.div`
  border: 2px dashed ${props => props.$isDragActive ? props.theme.colors.primary.main : props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  background: ${props => props.$isDragActive ? `${props.theme.colors.primary.main}10` : props.theme.colors.neutral[50]};
  transition: all ${props => props.theme.transitions.fast};
  cursor: pointer;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => `${props.theme.colors.primary.main}10`};
  }
`;

const UploadIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.primary.main};
`;

const UploadText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const UploadHint = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

const MediaItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  background: ${props => props.theme.colors.neutral[100]};
`;

const MediaPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VideoPreview = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const MediaOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity ${props => props.theme.transitions.fast};

  ${MediaItem}:hover & {
    opacity: 1;
  }
`;

const RemoveButton = styled.button`
  background: ${props => props.theme.colors.error.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.full};
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    transform: scale(1.1);
  }
`;

const MediaType = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.xs};
  right: ${props => props.theme.spacing.xs};
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const UploadProgress = styled.div`
  margin-top: ${props => props.theme.spacing.md};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.primary.main};
  width: ${props => props.$progress}%;
  transition: width ${props => props.theme.transitions.base};
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.error.light};
  color: ${props => props.theme.colors.error.main};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-top: ${props => props.theme.spacing.md};
`;

const HiddenInput = styled.input`
  display: none;
`;

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

export default function MediaUploader({ value = [], onChange, maxFiles = 10 }) {
  const { currentWorkspace } = useWorkspace();
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const supabase = createClient();

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleFiles = async (files) => {
    setError(null);

    // Validate file count
    if (value.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate files
    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} is too large. Maximum size is 100MB.`);
        return;
      }

      // Check file type
      const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
      const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);

      if (!isImage && !isVideo) {
        setError(`File ${file.name} is not a supported type. Supported: Images (JPEG, PNG, GIF, WebP) and Videos (MP4, MOV, WebM).`);
        return;
      }
    }

    // Upload files
    try {
      setUploading(true);
      setUploadProgress(0);

      const uploadedMedia = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${currentWorkspace.id}/${fileName}`;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        // Get media dimensions
        let width, height, duration;

        if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          const dimensions = await getImageDimensions(file);
          width = dimensions.width;
          height = dimensions.height;
        } else if (ACCEPTED_VIDEO_TYPES.includes(file.type)) {
          const videoData = await getVideoMetadata(file);
          width = videoData.width;
          height = videoData.height;
          duration = videoData.duration;
        }

        uploadedMedia.push({
          media_type: ACCEPTED_IMAGE_TYPES.includes(file.type) ? 'image' : 'video',
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          width,
          height,
          duration,
        });

        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      // Update parent component
      onChange([...value, ...uploadedMedia]);

      showToast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload files. Please try again.');
      showToast.error('Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const getVideoMetadata = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: Math.round(video.duration),
        });
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const handleRemove = (index) => {
    const newMedia = value.filter((_, i) => i !== index);
    onChange(newMedia);
  };

  return (
    <Container>
      {value.length < maxFiles && (
        <>
          <Label>Media ({value.length}/{maxFiles})</Label>
          <DropZone
            $isDragActive={isDragActive}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon>
              <Upload size={32} />
            </UploadIcon>
            <UploadText>
              {isDragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
            </UploadText>
            <UploadHint>
              Images (JPEG, PNG, GIF, WebP) or Videos (MP4, MOV, WebM) up to 100MB
            </UploadHint>
          </DropZone>

          <HiddenInput
            ref={fileInputRef}
            type="file"
            multiple
            accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(',')}
            onChange={handleFileSelect}
          />
        </>
      )}

      {uploading && (
        <UploadProgress>
          <ProgressBar>
            <ProgressFill $progress={uploadProgress} />
          </ProgressBar>
        </UploadProgress>
      )}

      {error && (
        <ErrorMessage>
          <AlertCircle size={16} />
          {error}
        </ErrorMessage>
      )}

      {value.length > 0 && (
        <MediaGrid>
          {value.map((media, index) => (
            <MediaItem key={index}>
              {media.media_type === 'image' ? (
                <MediaPreview src={media.file_url} alt="" />
              ) : (
                <VideoPreview src={media.file_url} />
              )}

              <MediaType>
                {media.media_type === 'image' ? (
                  <ImageIcon size={12} />
                ) : (
                  <Video size={12} />
                )}
              </MediaType>

              <MediaOverlay>
                <RemoveButton onClick={() => handleRemove(index)}>
                  <X size={16} />
                </RemoveButton>
              </MediaOverlay>
            </MediaItem>
          ))}
        </MediaGrid>
      )}
    </Container>
  );
}
