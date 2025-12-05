/**
 * Inline Media Panel
 *
 * Combined media library grid + drag & drop uploader
 * Shown inline in composers instead of modal
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Image as ImageIcon, Video, Upload, X, Check, Loader, Crop, Scissors } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { showToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import ImageCropper from './ImageCropper';

const PanelContainer = styled.div`
  border: ${props => {
    if (props.$designTheme === 'modern') return '1px solid rgba(255, 255, 255, 0.08)';
    if (props.$designTheme === 'compact') return `1px solid ${props.theme.colors.neutral[300]}`;
    return `1px solid ${props.theme.colors.neutral[200]}`;
  }};
  border-radius: ${props => {
    if (props.$designTheme === 'modern') return '16px';
    if (props.$designTheme === 'compact') return props.theme.borderRadius.md;
    return props.theme.borderRadius.lg;
  }};
  overflow: hidden;
  background: ${props => {
    if (props.$designTheme === 'modern') return 'rgba(255, 255, 255, 0.03)';
    return props.theme.colors.background.paper;
  }};
  margin-bottom: ${props => props.theme.spacing.lg};
  box-shadow: ${props => {
    if (props.$designTheme === 'modern') return '0 4px 12px rgba(0, 0, 0, 0.3)';
    return 'none';
  }};
`;

const PanelHeader = styled.div`
  padding: ${props => props.$designTheme === 'modern' ? '20px' : props.theme.spacing.md};
  border-bottom: ${props => {
    if (props.$designTheme === 'modern') return '1px solid rgba(255, 255, 255, 0.06)';
    return `1px solid ${props.theme.colors.neutral[200]}`;
  }};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PanelTitle = styled.h3`
  font-size: ${props => props.$designTheme === 'modern'
    ? props.theme.typography.fontSize.lg
    : props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const PlatformHint = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.$designTheme === 'modern'
    ? 'rgba(255, 255, 255, 0.5)'
    : props.theme.colors.text.secondary};
`;

const SelectionCount = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.$designTheme === 'modern'
    ? 'rgba(139, 92, 246, 1)'
    : props.theme.colors.primary.main};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.$designTheme === 'modern'
    ? 'rgba(139, 92, 246, 0.15)'
    : `${props.theme.colors.primary.main}10`};
  border-radius: ${props => props.theme.borderRadius.full};
  border: ${props => props.$designTheme === 'modern'
    ? '1px solid rgba(139, 92, 246, 0.3)'
    : 'none'};
`;

const PanelContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: ${props => props.$designTheme === 'modern' ? '20px' : props.theme.spacing.md};
  padding: ${props => props.$designTheme === 'modern' ? '20px' : props.theme.spacing.lg};
  max-height: 400px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    max-height: none;
  }
`;

// Left: Media Library Grid
const LibrarySection = styled.div`
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.$designTheme === 'modern'
      ? 'rgba(255, 255, 255, 0.03)'
      : props.theme.colors.neutral[100]};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.$designTheme === 'modern'
      ? 'rgba(139, 92, 246, 0.4)'
      : props.theme.colors.neutral[300]};
    border-radius: ${props => props.theme.borderRadius.full};

    &:hover {
      background: ${props => props.$designTheme === 'modern'
        ? 'rgba(139, 92, 246, 0.6)'
        : props.theme.colors.neutral[400]};
    }
  }
`;

const LibraryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: ${props => props.theme.spacing.sm};
`;

const MediaItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${props => props.$designTheme === 'modern' ? '10px' : props.theme.borderRadius.md};
  overflow: hidden;
  cursor: pointer;
  border: ${props => {
    if (props.$selected) {
      return props.$designTheme === 'modern'
        ? '3px solid rgba(139, 92, 246, 1)'
        : `2px solid ${props.theme.colors.primary.main}`;
    }
    return props.$designTheme === 'modern'
      ? '2px solid rgba(255, 255, 255, 0.1)'
      : '2px solid transparent';
  }};
  transition: all ${props => props.theme.transitions.fast};
  transform: ${props => props.$selected ? 'scale(0.95)' : 'scale(1)'};

  &:hover {
    border-color: ${props => props.$designTheme === 'modern'
      ? 'rgba(139, 92, 246, 0.6)'
      : props.theme.colors.primary.main};
    box-shadow: ${props => props.$designTheme === 'modern'
      ? '0 4px 16px rgba(139, 92, 246, 0.3)'
      : '0 4px 12px rgba(0, 0, 0, 0.15)'};
    transform: scale(0.98);
  }

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MediaTypeIcon = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: ${props => props.theme.borderRadius.sm};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const SelectionCheck = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.primary.main};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const CropButton = styled.button`
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background: rgba(139, 92, 246, 0.9);
    border-color: rgba(139, 92, 246, 1);
    transform: scale(1.1);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const MediaItemWrapper = styled.div`
  position: relative;

  &:hover ${CropButton} {
    opacity: 1;
  }
`;

const EmptyLibrary = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

// Right: Drag & Drop Uploader
const UploaderSection = styled.div`
  border-left: ${props => {
    if (props.$designTheme === 'modern') return '1px solid rgba(255, 255, 255, 0.08)';
    return `1px solid ${props.theme.colors.neutral[200]}`;
  }};
  padding-left: ${props => props.$designTheme === 'modern' ? '20px' : props.theme.spacing.lg};

  @media (max-width: 768px) {
    border-left: none;
    border-top: ${props => {
      if (props.$designTheme === 'modern') return '1px solid rgba(255, 255, 255, 0.08)';
      return `1px solid ${props.theme.colors.neutral[200]}`;
    }};
    padding-left: 0;
    padding-top: ${props => props.theme.spacing.lg};
  }
`;

const Dropzone = styled.div`
  border: ${props => {
    if (props.$isDragging) {
      return props.$designTheme === 'modern'
        ? '2px dashed rgba(139, 92, 246, 1)'
        : `2px dashed ${props.theme.colors.primary.main}`;
    }
    return props.$designTheme === 'modern'
      ? '2px dashed rgba(255, 255, 255, 0.15)'
      : `2px dashed ${props.theme.colors.neutral[300]}`;
  }};
  border-radius: ${props => props.$designTheme === 'modern' ? '12px' : props.theme.borderRadius.lg};
  padding: ${props => props.$designTheme === 'modern' ? '24px 16px' : props.theme.spacing.xl};
  text-align: center;
  background: ${props => {
    if (props.$isDragging) {
      return props.$designTheme === 'modern'
        ? 'rgba(139, 92, 246, 0.15)'
        : `${props.theme.colors.primary.main}10`;
    }
    return props.$designTheme === 'modern'
      ? 'rgba(255, 255, 255, 0.02)'
      : 'transparent';
  }};
  transition: all ${props => props.theme.transitions.fast};
  cursor: pointer;
  min-height: ${props => props.$designTheme === 'modern' ? '200px' : 'auto'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${props => props.$designTheme === 'modern'
      ? 'rgba(139, 92, 246, 0.6)'
      : props.theme.colors.primary.main};
    background: ${props => props.$designTheme === 'modern'
      ? 'rgba(139, 92, 246, 0.08)'
      : `${props.theme.colors.primary.main}05`};
  }
`;

const DropzoneIcon = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.primary.main};

  svg {
    width: 48px;
    height: 48px;
  }
`;

const DropzoneText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const DropzoneHint = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const UploadProgress = styled.div`
  margin-top: ${props => props.theme.spacing.md};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: ${props => props.$designTheme === 'modern' ? '6px' : '4px'};
  background: ${props => props.$designTheme === 'modern'
    ? 'rgba(255, 255, 255, 0.1)'
    : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.$designTheme === 'modern'
    ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.8), rgba(139, 92, 246, 1))'
    : props.theme.colors.primary.main};
  width: ${props => props.$progress}%;
  transition: width 0.3s;
  box-shadow: ${props => props.$designTheme === 'modern'
    ? '0 0 10px rgba(139, 92, 246, 0.5)'
    : 'none'};
`;

const ProgressText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

// Platform-specific hints
const PLATFORM_HINTS = {
  facebook: {
    text: 'Facebook: 1200×630 or 1080×1080 recommended',
    maxImages: 10,
    maxVideos: 1,
    acceptTypes: 'image/*,video/*'
  },
  instagram: {
    text: 'Instagram: 1080×1080, 1080×1350, or Reels 1080×1920',
    maxImages: 10,
    maxVideos: 1,
    acceptTypes: 'image/*,video/*'
  },
  linkedin: {
    text: 'LinkedIn: 1200×627 recommended',
    maxImages: 9,
    maxVideos: 1,
    acceptTypes: 'image/*,video/*'
  },
  twitter: {
    text: 'Twitter: 1600×900 recommended, max 4 images or 1 video',
    maxImages: 4,
    maxVideos: 1,
    acceptTypes: 'image/*,video/*'
  },
  tiktok: {
    text: 'TikTok: Vertical 1080×1920 video required',
    maxImages: 0,
    maxVideos: 1,
    acceptTypes: 'video/*'
  },
  youtube: {
    text: 'YouTube: Video required, Thumbnail 1280×720 (16:9)',
    maxImages: 1,
    maxVideos: 1,
    acceptTypes: 'video/*,image/*'
  }
};

export default function InlineMediaPanel({
  platform = 'facebook',
  designTheme = 'modern',
  selectedMedia = [],
  onMediaSelect,
  maxSelection = 10
}) {
  const { currentWorkspace } = useWorkspace();
  const supabase = createClient();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  const hint = PLATFORM_HINTS[platform] || PLATFORM_HINTS.facebook;

  // Open image cropper
  const handleOpenCropper = (e, item) => {
    e.stopPropagation();
    if (item.type === 'image') {
      setImageToCrop(item);
      setCropperOpen(true);
    }
  };

  // Handle crop complete
  const handleCropComplete = async (croppedData) => {
    if (!currentWorkspace || !imageToCrop) return;

    try {
      // Upload cropped image
      const fileName = `cropped-${Date.now()}-${imageToCrop.name}`;
      const filePath = `${currentWorkspace.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('media')
        .upload(filePath, croppedData.file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const newMediaItem = {
        id: `cropped-${Date.now()}`,
        name: fileName,
        file_url: urlData.publicUrl,
        url: urlData.publicUrl,
        type: 'image',
        width: croppedData.width,
        height: croppedData.height,
      };

      // Add to selection
      onMediaSelect([...selectedMedia, newMediaItem]);

      // Refresh library
      loadLibrary();

      showToast.success('Image cropped and saved!');
    } catch (error) {
      console.error('Error saving cropped image:', error);
      showToast.error('Failed to save cropped image');
    }

    setCropperOpen(false);
    setImageToCrop(null);
  };

  useEffect(() => {
    loadLibrary();
  }, [currentWorkspace]);

  const loadLibrary = async () => {
    if (!currentWorkspace) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from('media')
        .list(currentWorkspace.id, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      const enhancedMedia = data.map(file => {
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(`${currentWorkspace.id}/${file.name}`);

        const isVideo = file.metadata?.mimetype?.startsWith('video/') ||
                       file.name.match(/\.(mp4|webm|ogg|mov)$/i);

        return {
          id: file.id,
          name: file.name,
          file_url: urlData.publicUrl,
          url: urlData.publicUrl, // Keep for backward compatibility
          type: isVideo ? 'video' : 'image',
          mime_type: file.metadata?.mimetype,
          file_size: file.metadata?.size || 0,
          size: file.metadata?.size || 0
        };
      });

      setLibrary(enhancedMedia);
    } catch (error) {
      console.error('Error loading library:', error);
      showToast.error('Failed to load media library');
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    const isSelected = selectedMedia.some(m => m.id === item.id);

    if (isSelected) {
      // Deselect
      onMediaSelect(selectedMedia.filter(m => m.id !== item.id));
    } else {
      // Select if within max limit
      if (selectedMedia.length < maxSelection) {
        onMediaSelect([...selectedMedia, item]);
      } else {
        showToast.error(`Maximum ${maxSelection} items allowed`);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    if (!currentWorkspace || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${currentWorkspace.id}/${fileName}`;

        const { error } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (error) throw error;

        // Update progress
        setUploadProgress(((index + 1) / files.length) * 100);

        return fileName;
      });

      await Promise.all(uploadPromises);

      showToast.success(`${files.length} file(s) uploaded successfully`);
      loadLibrary();
    } catch (error) {
      console.error('Upload error:', error);
      showToast.error('Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <PanelContainer $designTheme={designTheme}>
      <PanelHeader $designTheme={designTheme}>
        <div>
          <PanelTitle $designTheme={designTheme}>Media Library</PanelTitle>
          <PlatformHint $designTheme={designTheme}>{hint.text}</PlatformHint>
        </div>
        {selectedMedia.length > 0 && (
          <SelectionCount $designTheme={designTheme}>
            {selectedMedia.length} selected
          </SelectionCount>
        )}
      </PanelHeader>

      <PanelContent $designTheme={designTheme}>
        {/* Left: Media Library Grid */}
        <LibrarySection $designTheme={designTheme}>
          {loading ? (
            <EmptyLibrary>
              <Loader className="animate-spin" style={{ margin: '0 auto 8px' }} />
              Loading library...
            </EmptyLibrary>
          ) : library.length === 0 ? (
            <EmptyLibrary>
              No media yet. Upload your first file →
            </EmptyLibrary>
          ) : (
            <LibraryGrid>
              {library.map(item => {
                const isSelected = selectedMedia.some(m => m.id === item.id);
                return (
                  <MediaItemWrapper key={item.id}>
                    <MediaItem
                      $selected={isSelected}
                      $designTheme={designTheme}
                      onClick={() => handleItemClick(item)}
                    >
                      {item.type === 'video' ? (
                        <video src={item.url} />
                      ) : (
                        <img src={item.url} alt={item.name} />
                      )}
                      <MediaTypeIcon>
                        {item.type === 'video' ? <Video /> : <ImageIcon />}
                      </MediaTypeIcon>
                      {isSelected && (
                        <SelectionCheck>
                          <Check />
                        </SelectionCheck>
                      )}
                    </MediaItem>
                    {item.type === 'image' && (
                      <CropButton
                        onClick={(e) => handleOpenCropper(e, item)}
                        title="Crop & Resize"
                      >
                        <Scissors />
                      </CropButton>
                    )}
                  </MediaItemWrapper>
                );
              })}
            </LibraryGrid>
          )}
        </LibrarySection>

        {/* Right: Drag & Drop Uploader */}
        <UploaderSection $designTheme={designTheme}>
          <Dropzone
            $isDragging={isDragging}
            $designTheme={designTheme}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <DropzoneIcon>
              <Upload />
            </DropzoneIcon>
            <DropzoneText>
              Drag & drop files here
            </DropzoneText>
            <DropzoneHint>
              or click to browse
            </DropzoneHint>
            <DropzoneHint style={{ marginTop: '8px' }}>
              JPEG, PNG, MP4, etc.
            </DropzoneHint>
          </Dropzone>

          {uploading && (
            <UploadProgress>
              <ProgressBar $designTheme={designTheme}>
                <ProgressFill $progress={uploadProgress} $designTheme={designTheme} />
              </ProgressBar>
              <ProgressText>
                Uploading... {Math.round(uploadProgress)}%
              </ProgressText>
            </UploadProgress>
          )}

          <HiddenFileInput
            id="file-input"
            type="file"
            multiple
            accept={hint.acceptTypes}
            onChange={handleFileSelect}
          />
        </UploaderSection>
      </PanelContent>

      {/* Image Cropper Modal */}
      {cropperOpen && imageToCrop && (
        <ImageCropper
          imageUrl={imageToCrop.url || imageToCrop.file_url}
          imageName={imageToCrop.name}
          platform={platform}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropperOpen(false);
            setImageToCrop(null);
          }}
          defaultPreset={
            platform === 'youtube' ? 'youtube_thumbnail' :
            platform === 'instagram' ? 'instagram_post' :
            platform === 'tiktok' ? 'tiktok_video' :
            platform === 'facebook' ? 'facebook_post' :
            platform === 'linkedin' ? 'linkedin_post' :
            platform === 'twitter' ? 'twitter_post' :
            'square'
          }
        />
      )}
    </PanelContainer>
  );
}
