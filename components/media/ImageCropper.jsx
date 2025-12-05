/**
 * Image Cropper Component
 *
 * A powerful image cropping tool with preset aspect ratios for different
 * social media platforms (YouTube, Instagram, TikTok, Facebook, etc.)
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import styled from 'styled-components';
import {
  X,
  Check,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Crop,
  Image as ImageIcon,
  Youtube,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui';

// ============================================================================
// PLATFORM SIZE PRESETS
// ============================================================================

export const PLATFORM_PRESETS = {
  // YouTube
  youtube_thumbnail: {
    label: 'YouTube Thumbnail',
    width: 1280,
    height: 720,
    aspect: 16 / 9,
    icon: Youtube,
    platform: 'youtube',
    description: '1280×720 (16:9)',
  },
  youtube_banner: {
    label: 'YouTube Banner',
    width: 2560,
    height: 1440,
    aspect: 16 / 9,
    icon: Youtube,
    platform: 'youtube',
    description: '2560×1440 (16:9)',
  },

  // Instagram
  instagram_post: {
    label: 'Instagram Post',
    width: 1080,
    height: 1080,
    aspect: 1 / 1,
    icon: Instagram,
    platform: 'instagram',
    description: '1080×1080 (1:1)',
  },
  instagram_portrait: {
    label: 'Instagram Portrait',
    width: 1080,
    height: 1350,
    aspect: 4 / 5,
    icon: Instagram,
    platform: 'instagram',
    description: '1080×1350 (4:5)',
  },
  instagram_landscape: {
    label: 'Instagram Landscape',
    width: 1080,
    height: 566,
    aspect: 1.91 / 1,
    icon: Instagram,
    platform: 'instagram',
    description: '1080×566 (1.91:1)',
  },
  instagram_story: {
    label: 'Instagram Story/Reel',
    width: 1080,
    height: 1920,
    aspect: 9 / 16,
    icon: Instagram,
    platform: 'instagram',
    description: '1080×1920 (9:16)',
  },

  // TikTok
  tiktok_video: {
    label: 'TikTok Video',
    width: 1080,
    height: 1920,
    aspect: 9 / 16,
    icon: Smartphone,
    platform: 'tiktok',
    description: '1080×1920 (9:16)',
  },

  // Facebook
  facebook_post: {
    label: 'Facebook Post',
    width: 1200,
    height: 630,
    aspect: 1.91 / 1,
    icon: Facebook,
    platform: 'facebook',
    description: '1200×630 (1.91:1)',
  },
  facebook_square: {
    label: 'Facebook Square',
    width: 1080,
    height: 1080,
    aspect: 1 / 1,
    icon: Facebook,
    platform: 'facebook',
    description: '1080×1080 (1:1)',
  },
  facebook_story: {
    label: 'Facebook Story',
    width: 1080,
    height: 1920,
    aspect: 9 / 16,
    icon: Facebook,
    platform: 'facebook',
    description: '1080×1920 (9:16)',
  },
  facebook_cover: {
    label: 'Facebook Cover',
    width: 820,
    height: 312,
    aspect: 820 / 312,
    icon: Facebook,
    platform: 'facebook',
    description: '820×312 (2.63:1)',
  },

  // LinkedIn
  linkedin_post: {
    label: 'LinkedIn Post',
    width: 1200,
    height: 627,
    aspect: 1.91 / 1,
    icon: Linkedin,
    platform: 'linkedin',
    description: '1200×627 (1.91:1)',
  },
  linkedin_square: {
    label: 'LinkedIn Square',
    width: 1080,
    height: 1080,
    aspect: 1 / 1,
    icon: Linkedin,
    platform: 'linkedin',
    description: '1080×1080 (1:1)',
  },
  linkedin_banner: {
    label: 'LinkedIn Banner',
    width: 1584,
    height: 396,
    aspect: 4 / 1,
    icon: Linkedin,
    platform: 'linkedin',
    description: '1584×396 (4:1)',
  },

  // Twitter/X
  twitter_post: {
    label: 'Twitter Post',
    width: 1600,
    height: 900,
    aspect: 16 / 9,
    icon: Twitter,
    platform: 'twitter',
    description: '1600×900 (16:9)',
  },
  twitter_square: {
    label: 'Twitter Square',
    width: 1080,
    height: 1080,
    aspect: 1 / 1,
    icon: Twitter,
    platform: 'twitter',
    description: '1080×1080 (1:1)',
  },
  twitter_header: {
    label: 'Twitter Header',
    width: 1500,
    height: 500,
    aspect: 3 / 1,
    icon: Twitter,
    platform: 'twitter',
    description: '1500×500 (3:1)',
  },

  // Common
  free: {
    label: 'Free Crop',
    width: null,
    height: null,
    aspect: undefined,
    icon: Crop,
    platform: 'all',
    description: 'Custom size',
  },
  square: {
    label: 'Square',
    width: 1080,
    height: 1080,
    aspect: 1 / 1,
    icon: ImageIcon,
    platform: 'all',
    description: '1:1 ratio',
  },
  landscape: {
    label: 'Landscape (16:9)',
    width: 1920,
    height: 1080,
    aspect: 16 / 9,
    icon: ImageIcon,
    platform: 'all',
    description: '16:9 ratio',
  },
  portrait: {
    label: 'Portrait (9:16)',
    width: 1080,
    height: 1920,
    aspect: 9 / 16,
    icon: ImageIcon,
    platform: 'all',
    description: '9:16 ratio',
  },
};

// Get presets by platform
export const getPresetsForPlatform = (platform) => {
  const presets = Object.entries(PLATFORM_PRESETS)
    .filter(([key, preset]) => preset.platform === platform || preset.platform === 'all')
    .map(([key, preset]) => ({ key, ...preset }));

  return presets;
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const CropperOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const CropperHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeaderTitle = styled.h2`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CropperContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const PresetsSidebar = styled.div`
  width: 280px;
  background: rgba(255, 255, 255, 0.03);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
  padding: 16px;
`;

const PresetSection = styled.div`
  margin-bottom: 24px;
`;

const PresetSectionTitle = styled.h3`
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px 0;
  padding: 0 4px;
`;

const PresetGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const PresetButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid ${props => props.$selected ? 'rgba(139, 92, 246, 0.6)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  background: ${props => props.$selected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)'};
  color: white;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$selected ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.08)'};
    border-color: ${props => props.$selected ? 'rgba(139, 92, 246, 0.8)' : 'rgba(255, 255, 255, 0.2)'};
  }

  svg {
    width: 18px;
    height: 18px;
    color: ${props => props.$selected ? 'rgba(139, 92, 246, 1)' : 'rgba(255, 255, 255, 0.6)'};
  }
`;

const PresetInfo = styled.div`
  flex: 1;
`;

const PresetLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
`;

const PresetDescription = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
`;

const CropArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
`;

const CropContainer = styled.div`
  max-width: 100%;
  max-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;

  .ReactCrop {
    max-height: calc(100vh - 200px);
  }

  .ReactCrop__crop-selection {
    border: 2px solid rgba(139, 92, 246, 0.8);
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
  }

  .ReactCrop__drag-handle {
    background-color: rgba(139, 92, 246, 1);
    width: 12px;
    height: 12px;
  }
`;

const ZoomControls = styled.div`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 24px;
  backdrop-filter: blur(10px);
`;

const ZoomLabel = styled.span`
  color: white;
  font-size: 13px;
  min-width: 50px;
  text-align: center;
`;

const CropperFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const FooterInfo = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
`;

const FooterActions = styled.div`
  display: flex;
  gap: 12px;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const ApplyButton = styled.button`
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, rgba(139, 92, 246, 1), rgba(109, 62, 216, 1));
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: linear-gradient(135deg, rgba(149, 102, 256, 1), rgba(119, 72, 226, 1));
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ImageCropper({
  imageUrl,
  imageName = 'image',
  onCropComplete,
  onCancel,
  defaultPreset = 'square',
  platform = null, // If provided, shows only relevant presets
}) {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [selectedPreset, setSelectedPreset] = useState(defaultPreset);
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // Get relevant presets based on platform
  const getGroupedPresets = useCallback(() => {
    if (platform) {
      // Show platform-specific presets first, then common ones
      const platformPresets = getPresetsForPlatform(platform);
      const commonPresets = Object.entries(PLATFORM_PRESETS)
        .filter(([key, preset]) => preset.platform === 'all')
        .map(([key, preset]) => ({ key, ...preset }));

      return {
        [platform.charAt(0).toUpperCase() + platform.slice(1)]: platformPresets.filter(p => p.platform === platform),
        'Common': commonPresets,
      };
    }

    // Group all presets by platform
    return {
      'YouTube': getPresetsForPlatform('youtube').filter(p => p.platform === 'youtube'),
      'Instagram': getPresetsForPlatform('instagram').filter(p => p.platform === 'instagram'),
      'TikTok': getPresetsForPlatform('tiktok').filter(p => p.platform === 'tiktok'),
      'Facebook': getPresetsForPlatform('facebook').filter(p => p.platform === 'facebook'),
      'LinkedIn': getPresetsForPlatform('linkedin').filter(p => p.platform === 'linkedin'),
      'Twitter': getPresetsForPlatform('twitter').filter(p => p.platform === 'twitter'),
      'Common': Object.entries(PLATFORM_PRESETS)
        .filter(([key, preset]) => preset.platform === 'all')
        .map(([key, preset]) => ({ key, ...preset })),
    };
  }, [platform]);

  // Handle image load
  const onImageLoad = useCallback((e) => {
    setImageLoaded(true);
    const { width, height } = e.currentTarget;

    const preset = PLATFORM_PRESETS[selectedPreset];
    if (preset && preset.aspect) {
      const crop = centerAspectCrop(width, height, preset.aspect);
      setCrop(crop);
      setCompletedCrop(crop);
    } else {
      // Free crop - select center 90%
      setCrop({
        unit: '%',
        x: 5,
        y: 5,
        width: 90,
        height: 90,
      });
    }
  }, [selectedPreset]);

  // Handle preset change
  const handlePresetChange = (presetKey) => {
    setSelectedPreset(presetKey);
    const preset = PLATFORM_PRESETS[presetKey];

    if (imgRef.current && preset) {
      const { width, height } = imgRef.current;

      if (preset.aspect) {
        const newCrop = centerAspectCrop(width, height, preset.aspect);
        setCrop(newCrop);
        setCompletedCrop(newCrop);
      } else {
        // Free crop
        setCrop({
          unit: '%',
          x: 5,
          y: 5,
          width: 90,
          height: 90,
        });
      }
    }
  };

  // Reset crop to center
  const handleReset = () => {
    if (imgRef.current) {
      const preset = PLATFORM_PRESETS[selectedPreset];
      const { width, height } = imgRef.current;

      if (preset && preset.aspect) {
        const newCrop = centerAspectCrop(width, height, preset.aspect);
        setCrop(newCrop);
        setCompletedCrop(newCrop);
      }
      setZoom(1);
    }
  };

  // Generate cropped image
  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return null;

    const displayedImage = imgRef.current;

    // Get the actual image dimensions
    const scaleX = displayedImage.naturalWidth / displayedImage.width;
    const scaleY = displayedImage.naturalHeight / displayedImage.height;

    // Calculate crop dimensions in actual pixels
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    // Get target dimensions from preset
    const preset = PLATFORM_PRESETS[selectedPreset];
    let targetWidth = cropWidth;
    let targetHeight = cropHeight;

    if (preset && preset.width && preset.height) {
      targetWidth = preset.width;
      targetHeight = preset.height;
    }

    // Helper function to load image and draw to canvas
    const loadAndCrop = (imgSource) => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Draw the cropped image
        ctx.drawImage(
          imgSource,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(null);
              return;
            }

            const croppedFile = new File(
              [blob],
              `cropped-${imageName}`,
              { type: 'image/jpeg' }
            );

            const croppedUrl = URL.createObjectURL(blob);

            resolve({
              file: croppedFile,
              url: croppedUrl,
              blob,
              width: targetWidth,
              height: targetHeight,
              preset: selectedPreset,
            });
          },
          'image/jpeg',
          0.95
        );
      });
    };

    // Try using fetch to get the image as a blob (works around CORS)
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = async () => {
          const result = await loadAndCrop(img);
          URL.revokeObjectURL(blobUrl);
          resolve(result);
        };
        img.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          resolve(null);
        };
        img.src = blobUrl;
      });
    } catch (error) {
      console.error('Failed to fetch image, trying direct load:', error);

      // Fallback: try loading with crossOrigin
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = async () => {
          const result = await loadAndCrop(img);
          resolve(result);
        };

        img.onerror = () => {
          console.error('Failed to load image for cropping');
          resolve(null);
        };

        img.src = imageUrl;
      });
    }
  }, [completedCrop, selectedPreset, imageName, imageUrl]);

  const [isProcessing, setIsProcessing] = useState(false);

  // Handle apply
  const handleApply = async () => {
    setIsProcessing(true);
    try {
      const result = await generateCroppedImage();
      if (result) {
        onCropComplete(result);
      } else {
        console.error('Failed to generate cropped image');
        alert('Failed to crop image. Please try again.');
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Error cropping image: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get current preset info
  const currentPreset = PLATFORM_PRESETS[selectedPreset];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        handleApply();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, handleApply]);

  const groupedPresets = getGroupedPresets();

  return (
    <CropperOverlay>
      <CropperHeader>
        <HeaderTitle>
          <Crop size={20} />
          Crop & Resize Image
        </HeaderTitle>
        <HeaderActions>
          <IconButton onClick={handleReset} title="Reset crop">
            <RotateCcw size={18} />
          </IconButton>
          <IconButton onClick={onCancel} title="Cancel (Esc)">
            <X size={18} />
          </IconButton>
        </HeaderActions>
      </CropperHeader>

      <CropperContent>
        <PresetsSidebar>
          {Object.entries(groupedPresets).map(([groupName, presets]) => (
            presets.length > 0 && (
              <PresetSection key={groupName}>
                <PresetSectionTitle>{groupName}</PresetSectionTitle>
                <PresetGrid>
                  {presets.map((preset) => {
                    const IconComponent = preset.icon;
                    return (
                      <PresetButton
                        key={preset.key}
                        $selected={selectedPreset === preset.key}
                        onClick={() => handlePresetChange(preset.key)}
                      >
                        <IconComponent />
                        <PresetInfo>
                          <PresetLabel>{preset.label}</PresetLabel>
                          <PresetDescription>{preset.description}</PresetDescription>
                        </PresetInfo>
                      </PresetButton>
                    );
                  })}
                </PresetGrid>
              </PresetSection>
            )
          ))}
        </PresetsSidebar>

        <CropArea>
          <CropContainer>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={currentPreset?.aspect}
              minWidth={50}
              minHeight={50}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                crossOrigin="anonymous"
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{
                  maxHeight: 'calc(100vh - 200px)',
                  maxWidth: '100%',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center',
                }}
              />
            </ReactCrop>
          </CropContainer>

          <ZoomControls>
            <IconButton
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              disabled={zoom <= 0.5}
              style={{ width: 32, height: 32 }}
            >
              <ZoomOut size={16} />
            </IconButton>
            <ZoomLabel>{Math.round(zoom * 100)}%</ZoomLabel>
            <IconButton
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              disabled={zoom >= 3}
              style={{ width: 32, height: 32 }}
            >
              <ZoomIn size={16} />
            </IconButton>
          </ZoomControls>
        </CropArea>
      </CropperContent>

      <CropperFooter>
        <FooterInfo>
          {currentPreset && (
            <>
              Output: {currentPreset.width || 'Original'}×{currentPreset.height || 'Original'}
              {currentPreset.aspect && ` (${currentPreset.description})`}
            </>
          )}
        </FooterInfo>
        <FooterActions>
          <CancelButton onClick={onCancel} disabled={isProcessing}>
            Cancel
          </CancelButton>
          <ApplyButton onClick={handleApply} disabled={!completedCrop || isProcessing}>
            <Check size={18} />
            {isProcessing ? 'Processing...' : 'Apply Crop'}
          </ApplyButton>
        </FooterActions>
      </CropperFooter>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </CropperOverlay>
  );
}
