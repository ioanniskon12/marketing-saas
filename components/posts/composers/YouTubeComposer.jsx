/**
 * YouTube Video Composer
 *
 * Specialized composer for YouTube videos with title, description,
 * thumbnail, tags, category, and visibility settings
 */

'use client';

import { useState, useRef } from 'react';
import styled from 'styled-components';
import { Upload, Image as ImageIcon, Tag as TagIcon, Eye, Clock, Globe, Lock, X, Scissors, FolderOpen, Video, Film, Trash2, Loader } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import BaseComposerLayout, { ContextLeft, ContextLabel, ContextRight, MetaButton } from './BaseComposerLayout';
import ImageCropper from '@/components/media/ImageCropper';
import MediaLibrarySelector from '@/components/posts/MediaLibrarySelector';

// ============================================================================
// YOUTUBE-SPECIFIC STYLED COMPONENTS
// ============================================================================

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const TitleInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  transition: border-color ${props => props.theme.transitions.fast};
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background.paper};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const CharCounter = styled.div`
  text-align: right;
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.$over ? props.theme.colors.error.main : props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing.xs};
`;

const ThumbnailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const CustomThumbnailUpload = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16/9;
  border: 2px dashed ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => `${props.theme.colors.primary.main}10`};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  color: ${props => props.theme.colors.primary.main};
  font-size: ${props => props.theme.typography.fontSize.sm};

  &:hover {
    background: ${props => `${props.theme.colors.primary.main}20`};
  }

  &:focus-within {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }

  input {
    display: none;
  }
`;

const ThumbnailPreview = styled.div`
  position: relative;
  aspect-ratio: 16/9;
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  border: 2px solid ${props => props.theme.colors.primary.main};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ThumbnailActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
`;

const ThumbnailActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$danger ? 'rgba(220, 38, 38, 0.9)' : 'rgba(139, 92, 246, 0.9)'};
    transform: scale(1.1);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ThumbnailInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 12px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
  font-size: 11px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ThumbnailOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const ThumbnailOptionCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16/9;
  border: 2px dashed ${props => props.$dragActive ? props.theme.colors.primary.main : props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$dragActive ? `${props.theme.colors.primary.main}20` : props.theme.colors.background.paper};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  color: ${props => props.$dragActive ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  gap: 8px;
  transform: ${props => props.$dragActive ? 'scale(1.02)' : 'scale(1)'};
  box-shadow: ${props => props.$dragActive ? '0 0 20px rgba(139, 92, 246, 0.3)' : 'none'};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => `${props.theme.colors.primary.main}10`};
    color: ${props => props.theme.colors.primary.main};
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const TagInputBox = styled.input`
  width: 100%;
  padding: 14px;
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TagsChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const TagChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: rgba(139, 92, 246, 1);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;

  button {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

// Video Upload Section
const VideoUploadSection = styled.div`
  margin-bottom: 24px;
`;

const VideoUploadArea = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const VideoUploadCard = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  border: 2px dashed ${props => props.$dragActive ? 'rgba(139, 92, 246, 1)' : 'rgba(255, 255, 255, 0.15)'};
  border-radius: 12px;
  background: ${props => props.$dragActive ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)'};
  cursor: pointer;
  transition: all 0.2s;
  color: ${props => props.$dragActive ? 'rgba(139, 92, 246, 1)' : 'rgba(255, 255, 255, 0.6)'};
  text-align: center;
  gap: 12px;
  transform: ${props => props.$dragActive ? 'scale(1.02)' : 'scale(1)'};
  box-shadow: ${props => props.$dragActive ? '0 0 20px rgba(139, 92, 246, 0.3)' : 'none'};

  &:hover {
    border-color: rgba(139, 92, 246, 0.6);
    background: rgba(139, 92, 246, 0.08);
    color: rgba(139, 92, 246, 1);
  }

  svg {
    width: 32px;
    height: 32px;
  }

  input {
    display: none;
  }
`;

const VideoSelectCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  gap: 12px;

  &:hover {
    border-color: rgba(139, 92, 246, 0.6);
    background: rgba(139, 92, 246, 0.08);
    color: rgba(139, 92, 246, 1);
  }

  svg {
    width: 32px;
    height: 32px;
  }
`;

const VideoPreview = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(139, 92, 246, 0.4);

  video {
    width: 100%;
    max-height: 300px;
    display: block;
  }
`;

const VideoInfo = styled.div`
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const VideoDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 13px;

  svg {
    width: 20px;
    height: 20px;
    color: rgba(139, 92, 246, 1);
  }
`;

const VideoFileName = styled.span`
  font-weight: 500;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const VideoSize = styled.span`
  color: rgba(255, 255, 255, 0.6);
`;

const RemoveVideoButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(220, 38, 38, 0.2);
  color: rgba(220, 38, 38, 1);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(220, 38, 38, 0.4);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const UploadHint = styled.span`
  font-size: 12px;
  opacity: 0.7;
`;

const VisibilityOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const VisibilityOption = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.lg};
  border: 2px solid ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.$selected ? `${props.theme.colors.primary.main}10` : 'transparent'};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => `${props.theme.colors.primary.main}10`};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }

  svg {
    color: ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  }
`;

const OptionLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const OptionHint = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

const CategorySelect = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.base};
  cursor: pointer;
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function YouTubeComposer({
  title = '',
  content = '',
  onTitleChange,
  onContentChange,
  media = [],
  onMediaChange,
  onMediaUpload,
  onOpenMediaLibrary,
  tags = [],
  onTagsChange,
  category = '',
  onCategoryChange,
  visibility = 'public',
  onVisibilityChange,
  thumbnail = null,
  onThumbnailChange,
}) {
  const { currentWorkspace } = useWorkspace();
  const [tagInput, setTagInput] = useState('');
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [showThumbnailLibrary, setShowThumbnailLibrary] = useState(false);
  const [showVideoLibrary, setShowVideoLibrary] = useState(false);
  const [videoDragActive, setVideoDragActive] = useState(false);
  const [thumbnailDragActive, setThumbnailDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const thumbnailInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Upload video to cloud storage
  const uploadVideoToStorage = async (file) => {
    if (!currentWorkspace?.id) {
      showToast.error('No workspace selected');
      return null;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('workspaceId', currentWorkspace.id);

      setUploadProgress(30);

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(80);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadProgress(100);

      if (result.uploaded && result.uploaded.length > 0) {
        const uploadedMedia = result.uploaded[0];
        return {
          id: uploadedMedia.id,
          url: uploadedMedia.file_url,
          file_url: uploadedMedia.file_url,
          name: uploadedMedia.file_name || file.name,
          size: uploadedMedia.file_size || file.size,
          type: 'video',
          mime_type: uploadedMedia.mime_type || file.type,
          from_library: true,
          media_id: uploadedMedia.id,
        };
      }

      throw new Error('No media returned from upload');
    } catch (error) {
      console.error('Video upload error:', error);
      showToast.error(`Upload failed: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle thumbnail file selection
  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setImageToCrop({ url: imageUrl, file, name: file.name });
      setCropperOpen(true);
    }
    e.target.value = '';
  };

  // Handle crop complete
  const handleCropComplete = (croppedData) => {
    if (!croppedData || !croppedData.url) {
      alert('Error: No cropped image data received');
      return;
    }

    const thumbnailData = {
      file: croppedData.file,
      url: croppedData.url,
      width: croppedData.width,
      height: croppedData.height,
    };

    if (onThumbnailChange) {
      onThumbnailChange(thumbnailData);
    } else {
      alert('Error: onThumbnailChange is not defined');
    }

    setCropperOpen(false);
    setImageToCrop(null);
  };

  // Re-crop existing thumbnail
  const handleReCrop = () => {
    if (thumbnail?.url) {
      setImageToCrop({ url: thumbnail.url, name: 'thumbnail' });
      setCropperOpen(true);
    }
  };

  // Remove thumbnail
  const handleRemoveThumbnail = () => {
    onThumbnailChange?.(null);
  };

  // Handle selecting thumbnail from media library
  const handleThumbnailFromLibrary = (selectedMedia) => {
    if (selectedMedia && selectedMedia.length > 0) {
      const item = selectedMedia[0];
      // Open cropper with the selected image
      setImageToCrop({
        url: item.file_url || item.url,
        name: item.file_name || item.name || 'thumbnail',
      });
      setCropperOpen(true);
    }
    setShowThumbnailLibrary(false);
  };

  // Handle video file selection
  const handleVideoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      // Upload to cloud storage
      const uploadedMedia = await uploadVideoToStorage(file);
      if (uploadedMedia) {
        onMediaChange?.([uploadedMedia]);
        showToast.success('Video uploaded successfully');
      }
    }
    e.target.value = '';
  };

  // Handle video from library
  const handleVideoFromLibrary = (selectedMedia) => {
    if (selectedMedia && selectedMedia.length > 0) {
      const item = selectedMedia[0];
      onMediaChange?.([{
        id: item.id,
        url: item.file_url || item.url,
        file_url: item.file_url || item.url,
        name: item.file_name || item.name,
        size: item.file_size,
        type: 'video',
        mime_type: item.mime_type,
        from_library: true,
        media_id: item.id,
      }]);
    }
    setShowVideoLibrary(false);
  };

  // Remove video
  const handleRemoveVideo = () => {
    onMediaChange?.([]);
  };

  // Video drag and drop handlers
  const handleVideoDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoDragActive(true);
  };

  const handleVideoDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoDragActive(false);
  };

  const handleVideoDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleVideoDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      // Upload to cloud storage
      const uploadedMedia = await uploadVideoToStorage(file);
      if (uploadedMedia) {
        onMediaChange?.([uploadedMedia]);
        showToast.success('Video uploaded successfully');
      }
    }
  };

  // Thumbnail drag and drop handlers
  const handleThumbnailDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setThumbnailDragActive(true);
  };

  const handleThumbnailDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setThumbnailDragActive(false);
  };

  const handleThumbnailDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleThumbnailDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setThumbnailDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setImageToCrop({ url: imageUrl, file, name: file.name });
      setCropperOpen(true);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && tagInput === '' && Array.isArray(tags) && tags.length > 0) {
      // Remove last tag when backspace on empty input
      removeTag(tags[tags.length - 1]);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    const tagsArray = Array.isArray(tags) ? tags : [];
    if (tag && !tagsArray.includes(tag) && tagsArray.length < 15) {
      onTagsChange?.([...tagsArray, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    const tagsArray = Array.isArray(tags) ? tags : [];
    onTagsChange?.(tagsArray.filter(t => t !== tagToRemove));
  };

  const removeMedia = (index) => {
    const newMedia = media.filter((_, i) => i !== index);
    onMediaChange?.(newMedia);
  };

  // Get visibility icon
  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'public': return <Globe size={16} />;
      case 'unlisted': return <Eye size={16} />;
      case 'private': return <Lock size={16} />;
      case 'scheduled': return <Clock size={16} />;
      default: return <Globe size={16} />;
    }
  };

  // Build hashtag string from array (if any)
  const hashtagString = Array.isArray(tags) ? tags.map(h => `#${h}`).join(' ') : '';
  const tagCount = Array.isArray(tags) ? tags.length : 0;

  // Post Context
  const postContext = (
    <>
      <ContextLeft>
        <ContextLabel>Uploading to:</ContextLabel>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>YouTube</span>
      </ContextLeft>
      <ContextRight>
        {getVisibilityIcon()} {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
      </ContextRight>
    </>
  );

  // Meta Toolbar
  const metaToolbar = (
    <>
      <MetaButton>
        <ImageIcon size={16} />
        Thumbnail
      </MetaButton>
      <MetaButton>
        <TagIcon size={16} />
        Tags ({tagCount}/15)
      </MetaButton>
    </>
  );

  // Platform-Specific Fields
  const platformSpecificFields = (
    <>
      {/* Video Upload */}
      <VideoUploadSection>
        <Label>
          <Video size={16} />
          Video *
        </Label>
        {uploading ? (
          <VideoUploadArea>
            <VideoUploadCard $dragActive={false}>
              <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Uploading video...</span>
              <UploadHint>{uploadProgress}%</UploadHint>
            </VideoUploadCard>
          </VideoUploadArea>
        ) : media && media.length > 0 && media[0] ? (
          <VideoPreview>
            <video
              src={media[0].url || media[0].file_url}
              controls
              preload="metadata"
            />
            <VideoInfo>
              <VideoDetails>
                <Film />
                <VideoFileName>{media[0].name || media[0].file_name || 'Video'}</VideoFileName>
                {media[0].size && (
                  <VideoSize>{formatFileSize(media[0].size)}</VideoSize>
                )}
              </VideoDetails>
              <RemoveVideoButton onClick={handleRemoveVideo} type="button" title="Remove video">
                <Trash2 />
              </RemoveVideoButton>
            </VideoInfo>
          </VideoPreview>
        ) : (
          <VideoUploadArea>
            <VideoUploadCard
              $dragActive={videoDragActive}
              onDragEnter={handleVideoDragEnter}
              onDragLeave={handleVideoDragLeave}
              onDragOver={handleVideoDragOver}
              onDrop={handleVideoDrop}
            >
              <Upload />
              <span>{videoDragActive ? 'Drop video here' : 'Upload or drag video'}</span>
              <UploadHint>MP4, MOV, WebM</UploadHint>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/mov"
                onChange={handleVideoSelect}
              />
            </VideoUploadCard>
            <VideoSelectCard type="button" onClick={() => setShowVideoLibrary(true)}>
              <FolderOpen />
              <span>Select from library</span>
              <UploadHint>Choose existing video</UploadHint>
            </VideoSelectCard>
          </VideoUploadArea>
        )}
      </VideoUploadSection>

      {/* Video Title */}
      <div>
        <Label>Video Title *</Label>
        <TitleInput
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Add a title that describes your video"
          maxLength={100}
        />
        <CharCounter $over={title.length > 100}>
          {title.length} / 100
        </CharCounter>
      </div>

      {/* Thumbnail */}
      <ThumbnailSection>
        <Label>
          <ImageIcon size={16} />
          Thumbnail
        </Label>
        {thumbnail && thumbnail.url ? (
          <ThumbnailGrid>
            <ThumbnailPreview>
              <img src={thumbnail.url} alt="Video thumbnail" />
              <ThumbnailActions>
                <ThumbnailActionButton onClick={handleReCrop} title="Re-crop">
                  <Scissors />
                </ThumbnailActionButton>
                <ThumbnailActionButton $danger onClick={handleRemoveThumbnail} title="Remove">
                  <X />
                </ThumbnailActionButton>
              </ThumbnailActions>
              {thumbnail.width && thumbnail.height && (
                <ThumbnailInfo>
                  {thumbnail.width}×{thumbnail.height}
                </ThumbnailInfo>
              )}
            </ThumbnailPreview>
          </ThumbnailGrid>
        ) : (
          <ThumbnailOptions>
            <ThumbnailOptionCard
              type="button"
              $dragActive={thumbnailDragActive}
              onClick={() => thumbnailInputRef.current?.click()}
              onDragEnter={handleThumbnailDragEnter}
              onDragLeave={handleThumbnailDragLeave}
              onDragOver={handleThumbnailDragOver}
              onDrop={handleThumbnailDrop}
            >
              <Upload />
              <span>{thumbnailDragActive ? 'Drop image here' : 'Upload or drag image'}</span>
              <span style={{ fontSize: '10px', opacity: 0.7 }}>1280×720 recommended</span>
            </ThumbnailOptionCard>
            <ThumbnailOptionCard
              type="button"
              onClick={() => setShowThumbnailLibrary(true)}
            >
              <FolderOpen />
              <span>Select from library</span>
              <span style={{ fontSize: '10px', opacity: 0.7 }}>Choose existing image</span>
            </ThumbnailOptionCard>
          </ThumbnailOptions>
        )}
        <HiddenInput
          ref={thumbnailInputRef}
          type="file"
          accept="image/*"
          onChange={handleThumbnailSelect}
        />
      </ThumbnailSection>

      {/* Tags */}
      <div>
        <Label>
          <TagIcon size={16} />
          Tags
          <span style={{
            marginLeft: 'auto',
            fontSize: '12px',
            fontWeight: 'normal',
            opacity: 0.7
          }}>
            {Array.isArray(tags) ? tags.length : 0}/15
          </span>
        </Label>
        <TagInputBox
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagInput}
          onBlur={addTag}
          placeholder={Array.isArray(tags) && tags.length >= 15 ? "Maximum 15 tags reached" : "Type a tag and press Enter or Space..."}
          disabled={Array.isArray(tags) && tags.length >= 15}
        />
        {Array.isArray(tags) && tags.length > 0 && (
          <TagsChipsContainer>
            {tags.map((tag, index) => (
              <TagChip key={index}>
                {tag}
                <button onClick={() => removeTag(tag)} type="button">
                  <X size={14} />
                </button>
              </TagChip>
            ))}
          </TagsChipsContainer>
        )}
      </div>

      {/* Category */}
      <div>
        <Label>Category</Label>
        <CategorySelect
          value={category}
          onChange={(e) => onCategoryChange?.(e.target.value)}
        >
          <option value="">Select a category</option>
          <option value="film-animation">Film & Animation</option>
          <option value="autos-vehicles">Autos & Vehicles</option>
          <option value="music">Music</option>
          <option value="pets-animals">Pets & Animals</option>
          <option value="sports">Sports</option>
          <option value="travel-events">Travel & Events</option>
          <option value="gaming">Gaming</option>
          <option value="people-blogs">People & Blogs</option>
          <option value="comedy">Comedy</option>
          <option value="entertainment">Entertainment</option>
          <option value="news-politics">News & Politics</option>
          <option value="howto-style">Howto & Style</option>
          <option value="education">Education</option>
          <option value="science-technology">Science & Technology</option>
          <option value="nonprofits-activism">Nonprofits & Activism</option>
        </CategorySelect>
      </div>

      {/* Visibility */}
      <div>
        <Label>
          <Eye size={16} />
          Visibility
        </Label>
        <VisibilityOptions>
          <VisibilityOption
            $selected={visibility === 'public'}
            onClick={() => onVisibilityChange?.('public')}
          >
            <Globe size={24} />
            <OptionLabel>Public</OptionLabel>
            <OptionHint>Everyone can watch</OptionHint>
          </VisibilityOption>

          <VisibilityOption
            $selected={visibility === 'unlisted'}
            onClick={() => onVisibilityChange?.('unlisted')}
          >
            <Eye size={24} />
            <OptionLabel>Unlisted</OptionLabel>
            <OptionHint>Anyone with link</OptionHint>
          </VisibilityOption>

          <VisibilityOption
            $selected={visibility === 'private'}
            onClick={() => onVisibilityChange?.('private')}
          >
            <Lock size={24} />
            <OptionLabel>Private</OptionLabel>
            <OptionHint>Only you</OptionHint>
          </VisibilityOption>

          <VisibilityOption
            $selected={visibility === 'scheduled'}
            onClick={() => onVisibilityChange?.('scheduled')}
          >
            <Clock size={24} />
            <OptionLabel>Scheduled</OptionLabel>
            <OptionHint>Publish later</OptionHint>
          </VisibilityOption>
        </VisibilityOptions>
      </div>
    </>
  );

  return (
    <>
      <BaseComposerLayout
        platform="youtube"
        title="YouTube Video"
        postContext={postContext}
        metaToolbar={metaToolbar}
        captionValue={content}
        captionPlaceholder="Tell viewers about your video..."
        captionMaxLength={5000}
        charHint="5,000 characters max"
        onChangeCaption={onContentChange}
        mediaState={{
          selectedMedia: media,
          maxItems: 1,
          allowedTypes: ['video'],
          recommendation: 'Video: MP4, MOV, WebM · 16:9 aspect ratio recommended · Up to 256 GB · Max 12 hours',
        }}
        onMediaChange={onMediaChange}
        onAddMediaFromLibrary={(items) => onMediaChange?.([...media, ...items])}
        onUploadMedia={onMediaUpload}
        onRemoveMedia={removeMedia}
        onOpenMediaLibrary={onOpenMediaLibrary}
        showHashtags={false}
        showMediaLibrary={false}
        platformSpecificFields={platformSpecificFields}
      />

      {/* Image Cropper Modal for Thumbnail */}
      {cropperOpen && imageToCrop && (
        <ImageCropper
          imageUrl={imageToCrop.url}
          imageName={imageToCrop.name || 'thumbnail'}
          platform="youtube"
          defaultPreset="youtube_thumbnail"
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropperOpen(false);
            setImageToCrop(null);
          }}
        />
      )}

      {/* Media Library Selector for Thumbnail */}
      <MediaLibrarySelector
        isOpen={showThumbnailLibrary}
        onClose={() => setShowThumbnailLibrary(false)}
        onSelect={handleThumbnailFromLibrary}
        multiple={false}
        filterType="image"
      />

      {/* Media Library Selector for Video */}
      <MediaLibrarySelector
        isOpen={showVideoLibrary}
        onClose={() => setShowVideoLibrary(false)}
        onSelect={handleVideoFromLibrary}
        multiple={false}
        filterType="video"
      />
    </>
  );
}
