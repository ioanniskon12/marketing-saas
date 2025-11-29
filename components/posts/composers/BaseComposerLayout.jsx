/**
 * Base Composer Layout - Modernized
 *
 * Shared composer shell for all platforms (Facebook, Instagram, LinkedIn, Twitter, TikTok, YouTube)
 * Provides consistent UX for caption, media, hashtags while allowing platform-specific customization
 */

'use client';

import { useState, useRef } from 'react';
import styled from 'styled-components';
import { Upload, X, Image as ImageIcon, Video, GripVertical, Globe, Users, Lock } from 'lucide-react';
import InlineMediaPanel from '@/components/media/InlineMediaPanel';

// ============================================================================
// STYLED COMPONENTS - MODERNIZED
// ============================================================================

const ComposerCard = styled.div`
  background: ${props => {
    if (props.$designTheme === 'modern') return '#14161B';
    if (props.$designTheme === 'compact') return props.theme.colors.background.paper;
    return props.theme.colors.background.paper;
  }};
  border: ${props => {
    if (props.$designTheme === 'compact') return `1px solid ${props.theme.colors.neutral[300]}`;
    if (props.$designTheme === 'modern') return '1px solid rgba(255, 255, 255, 0.04)';
    return `1px solid ${props.theme.colors.neutral[200]}`;
  }};
  border-radius: ${props => {
    if (props.$designTheme === 'compact') return props.theme.borderRadius.md;
    if (props.$designTheme === 'modern') return '20px';
    return props.theme.borderRadius.lg;
  }};
  overflow: hidden;
  box-shadow: ${props => {
    if (props.$designTheme === 'modern') return '0 22px 45px rgba(0, 0, 0, 0.6)';
    if (props.$designTheme === 'compact') return 'none';
    return '0 2px 8px rgba(0, 0, 0, 0.1)';
  }};
`;

// Card Title
const CardTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  padding: ${props => props.$designTheme === 'modern' ? '24px 24px 16px' : '20px 20px 12px'};
`;

// Post Header Row (Post to / Platform)
const HeaderRow = styled.div`
  padding: ${props => props.$designTheme === 'modern' ? '0 24px 20px' : '0 20px 16px'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  border-bottom: ${props => {
    if (props.$designTheme === 'modern') return '1px solid rgba(255, 255, 255, 0.06)';
    return `1px solid ${props.theme.colors.neutral[200]}`;
  }};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const HeaderLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const AudiencePill = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: ${props => props.$designTheme === 'modern'
    ? 'rgba(139, 92, 246, 0.15)'
    : props.theme.colors.neutral[100]};
  border: ${props => props.$designTheme === 'modern'
    ? '1px solid rgba(139, 92, 246, 0.3)'
    : `1px solid ${props.theme.colors.neutral[300]}`};
  border-radius: ${props => props.theme.borderRadius.full};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.$designTheme === 'modern'
      ? 'rgba(139, 92, 246, 0.25)'
      : props.theme.colors.neutral[200]};
    border-color: ${props => props.$designTheme === 'modern'
      ? 'rgba(139, 92, 246, 0.5)'
      : props.theme.colors.neutral[400]};
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${props => props.theme.colors.primary.main};
  }
`;

const HeaderRight = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};

  span {
    opacity: 0.7;
  }

  strong {
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    opacity: 1;
  }
`;

// Legacy exports for backward compatibility
const ContextLeft = HeaderLeft;
const ContextLabel = HeaderLabel;
const ContextPill = AudiencePill;
const ContextRight = HeaderRight;

// Meta Toolbar
const MetaToolbar = styled.div`
  padding: ${props => props.$designTheme === 'modern' ? '16px 24px' : '12px 20px'};
  border-bottom: ${props => {
    if (props.$designTheme === 'modern') return '1px solid rgba(255, 255, 255, 0.06)';
    return `1px solid ${props.theme.colors.neutral[100]}`;
  }};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const MetaButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: ${props => props.$designTheme === 'modern'
    ? 'rgba(255, 255, 255, 0.03)'
    : 'transparent'};
  border: ${props => props.$designTheme === 'modern'
    ? '1px solid rgba(255, 255, 255, 0.08)'
    : `1px solid ${props.theme.colors.neutral[200]}`};
  border-radius: ${props => props.theme.borderRadius.full};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.$designTheme === 'modern'
      ? 'rgba(139, 92, 246, 0.15)'
      : props.theme.colors.neutral[50]};
    border-color: ${props => props.$designTheme === 'modern'
      ? 'rgba(139, 92, 246, 0.4)'
      : props.theme.colors.primary.main};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${props => props.$designTheme === 'modern'
      ? props.theme.colors.primary.main
      : 'currentColor'};
  }
`;

// Caption Area
const CaptionWrapper = styled.div`
  padding: ${props => {
    if (props.$designTheme === 'compact') return props.theme.spacing.md;
    if (props.$designTheme === 'modern') return '24px';
    return props.theme.spacing.lg;
  }};
  border-bottom: ${props => {
    if (props.$designTheme === 'modern') return '1px solid rgba(255, 255, 255, 0.06)';
    return `1px solid ${props.theme.colors.neutral[100]}`;
  }};
`;

const CaptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const CaptionLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const CharHint = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-align: right;
  line-height: 1.4;
`;

const CaptionTextarea = styled.textarea`
  width: 100%;
  min-height: ${props => {
    if (props.$designTheme === 'compact') return '100px';
    if (props.$designTheme === 'modern') return '140px';
    return '120px';
  }};
  padding: ${props => {
    if (props.$designTheme === 'compact') return props.theme.spacing.sm;
    if (props.$designTheme === 'modern') return '16px';
    return props.theme.spacing.md;
  }};
  background: ${props => {
    if (props.$designTheme === 'modern') return 'rgba(255, 255, 255, 0.03)';
    return props.theme.colors.background.default;
  }};
  border: ${props => {
    if (props.$designTheme === 'modern') return '2px solid rgba(255, 255, 255, 0.08)';
    if (props.$designTheme === 'compact') return `1px solid ${props.theme.colors.neutral[300]}`;
    return `1px solid ${props.theme.colors.neutral[200]}`;
  }};
  border-radius: ${props => {
    if (props.$designTheme === 'modern') return '12px';
    return props.theme.borderRadius.md;
  }};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => {
    if (props.$designTheme === 'compact') return props.theme.typography.fontSize.sm;
    if (props.$designTheme === 'modern') return props.theme.typography.fontSize.base;
    return props.theme.typography.fontSize.base;
  }};
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => {
      if (props.$designTheme === 'modern') return 'rgba(255, 255, 255, 0.05)';
      return props.theme.colors.background.default;
    }};
    box-shadow: ${props => {
      if (props.$designTheme === 'modern') return '0 0 0 3px rgba(139, 92, 246, 0.2)';
      return 'none';
    }};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
    opacity: 0.6;
  }
`;

const CharCounter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => {
    if (props.$isOver) return props.theme.colors.error.main;
    if (props.$isNear) return props.theme.colors.warning.main;
    return props.theme.colors.text.secondary;
  }};
`;

// Platform-Specific Fields Slot
const PlatformFieldsSection = styled.div`
  padding: ${props => {
    if (props.$designTheme === 'compact') return props.theme.spacing.md;
    if (props.$designTheme === 'modern') return '24px';
    return props.theme.spacing.lg;
  }};
  border-bottom: ${props => {
    if (props.$designTheme === 'modern') return '1px solid rgba(255, 255, 255, 0.06)';
    return `1px solid ${props.theme.colors.neutral[100]}`;
  }};
`;

// Media Section
const MediaSection = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[100]};
`;

const MediaSectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SelectedMediaList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const MediaThumb = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  background: ${props => props.theme.colors.neutral[100]};

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MediaThumbOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 40%);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.xs};
`;

const MediaTypeIcon = styled.div`
  background: rgba(0, 0, 0, 0.7);
  padding: 4px;
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

const RemoveButton = styled.button`
  background: rgba(0, 0, 0, 0.7);
  border: none;
  padding: 4px;
  border-radius: ${props => props.theme.borderRadius.full};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.error.main};
  }

  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const DragHandle = styled.div`
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.7);
  padding: 4px;
  border-radius: ${props => props.theme.borderRadius.sm};
  color: white;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    cursor: grabbing;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const Dropzone = styled.div`
  border: 2px dashed ${props => props.$isDragging ? props.theme.colors.primary.main : props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing['3xl']};
  text-align: center;
  background: ${props => props.$isDragging ? `${props.theme.colors.primary.main}10` : props.theme.colors.neutral[50]};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  min-height: ${props => props.$hasMedia ? '140px' : '200px'};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => `${props.theme.colors.primary.main}10`};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

const DropzoneIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.primary.main};

  svg {
    width: 32px;
    height: 32px;
  }
`;

const DropzoneText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const DropzoneHint = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const MediaRecommendation = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const HiddenFileInput = styled.input`
  display: none;
`;

// Hashtags Section
const HashtagSection = styled.div`
  padding: ${props => props.$designTheme === 'modern' ? '24px' : props.theme.spacing.lg};
`;

const HashtagLabel = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const HashtagInput = styled.input`
  width: 100%;
  padding: ${props => props.$designTheme === 'modern' ? '14px' : props.theme.spacing.md};
  background: ${props => {
    if (props.$designTheme === 'modern') return 'rgba(255, 255, 255, 0.03)';
    return props.theme.colors.background.default;
  }};
  border: ${props => {
    if (props.$designTheme === 'modern') return '2px solid rgba(255, 255, 255, 0.08)';
    return `1px solid ${props.theme.colors.neutral[200]}`;
  }};
  border-radius: ${props => {
    if (props.$designTheme === 'modern') return '12px';
    return props.theme.borderRadius.md;
  }};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: inherit;
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => {
      if (props.$designTheme === 'modern') return 'rgba(255, 255, 255, 0.05)';
      return props.theme.colors.background.default;
    }};
    box-shadow: ${props => {
      if (props.$designTheme === 'modern') return '0 0 0 3px rgba(139, 92, 246, 0.2)';
      return 'none';
    }};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
    opacity: 0.6;
  }
`;

const HashtagHint = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const HashtagChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.md};
`;

const HashtagChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.$designTheme === 'modern'
    ? 'rgba(139, 92, 246, 0.15)'
    : props.theme.colors.primary.light};
  border: ${props => props.$designTheme === 'modern'
    ? '1px solid rgba(139, 92, 246, 0.3)'
    : `1px solid ${props.theme.colors.primary.main}`};
  border-radius: ${props => props.theme.borderRadius.full};
  color: ${props => props.$designTheme === 'modern'
    ? 'rgba(139, 92, 246, 1)'
    : props.theme.colors.primary.main};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: currentColor;
    cursor: pointer;
    padding: 0;
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BaseComposerLayout({
  // Meta
  platform,
  title,
  designTheme = 'modern',

  // Post Context
  postContext,

  // Meta Toolbar
  metaToolbar,

  // Caption
  captionValue = '',
  captionPlaceholder = 'Write your caption...',
  captionMaxLength = 2200,
  onChangeCaption,
  charHint = '',

  // Media
  mediaState = {
    selectedMedia: [],
    maxItems: 10,
    allowedTypes: ['image', 'video'],
    recommendation: '',
  },
  onMediaChange,
  onAddMediaFromLibrary,
  onUploadMedia,
  onRemoveMedia,
  onReorderMedia,
  onOpenMediaLibrary,

  // Hashtags
  hashtagsValue = '',
  onChangeHashtags,
  onBlurHashtags,
  hashtagsHint = '',
  showHashtags = true,

  // Platform-specific
  platformSpecificFields,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Local state for hashtag input
  const [hashtagInput, setHashtagInput] = useState('');

  // Parse hashtagsValue into array of chips
  const hashtagChips = hashtagsValue
    ? hashtagsValue.split(' ').map(h => h.replace(/^#/, '')).filter(Boolean)
    : [];

  // Character counter logic
  const currentLength = captionValue?.length || 0;
  const isNear = captionMaxLength && currentLength > captionMaxLength * 0.9;
  const isOver = captionMaxLength && currentLength > captionMaxLength;

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && onUploadMedia) {
      onUploadMedia(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && onUploadMedia) {
      onUploadMedia(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDropzoneClick = () => {
    if (onOpenMediaLibrary) {
      onOpenMediaLibrary();
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDropzoneKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDropzoneClick();
    }
  };

  // Hashtag chip handlers
  const addHashtagChip = (tag) => {
    if (!tag.trim()) return;
    const cleanTag = tag.trim().replace(/^#/, '');
    const newChips = [...hashtagChips, cleanTag];
    const formatted = newChips.map(t => `#${t}`).join(' ');
    onChangeHashtags?.(formatted);
    setHashtagInput('');
  };

  const removeHashtagChip = (index) => {
    const newChips = hashtagChips.filter((_, i) => i !== index);
    const formatted = newChips.map(t => `#${t}`).join(' ');
    onChangeHashtags?.(formatted);
  };

  const handleHashtagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addHashtagChip(hashtagInput);
    } else if (e.key === 'Backspace' && hashtagInput === '' && hashtagChips.length > 0) {
      // Remove last chip when backspace on empty input
      removeHashtagChip(hashtagChips.length - 1);
    }
  };

  return (
    <ComposerCard $designTheme={designTheme}>
      {/* Card Title */}
      {title && <CardTitle $designTheme={designTheme}>{title}</CardTitle>}

      {/* Header Row - Post to / Platform */}
      {postContext && (
        <HeaderRow $designTheme={designTheme}>
          {postContext}
        </HeaderRow>
      )}

      {/* Meta Toolbar */}
      {metaToolbar && (
        <MetaToolbar $designTheme={designTheme}>
          {metaToolbar}
        </MetaToolbar>
      )}

      {/* Caption Area */}
      <CaptionWrapper $designTheme={designTheme}>
        <CaptionHeader>
          <CaptionLabel>Caption</CaptionLabel>
          {charHint && <CharHint>{charHint}</CharHint>}
        </CaptionHeader>
        <CaptionTextarea
          $designTheme={designTheme}
          value={captionValue}
          onChange={(e) => onChangeCaption && onChangeCaption(e.target.value)}
          placeholder={captionPlaceholder}
          maxLength={captionMaxLength}
        />
        {captionMaxLength && (
          <CharCounter $isNear={isNear} $isOver={isOver}>
            {currentLength} / {captionMaxLength}
          </CharCounter>
        )}
      </CaptionWrapper>

      {/* Platform-Specific Fields */}
      {platformSpecificFields && (
        <PlatformFieldsSection $designTheme={designTheme}>
          {platformSpecificFields}
        </PlatformFieldsSection>
      )}

      {/* Media Section - Inline Media Panel */}
      <InlineMediaPanel
        platform={platform || 'facebook'}
        selectedMedia={mediaState.selectedMedia || []}
        onMediaSelect={onMediaChange}
        maxSelection={mediaState.maxItems || 10}
        designTheme={designTheme}
      />

      {/* Hashtags Section */}
      {showHashtags && (
        <HashtagSection $designTheme={designTheme}>
          <HashtagLabel>Hashtags</HashtagLabel>
          <HashtagInput
            $designTheme={designTheme}
            type="text"
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
            onKeyDown={handleHashtagKeyDown}
            onBlur={() => {
              if (hashtagInput.trim()) {
                addHashtagChip(hashtagInput);
              }
              onBlurHashtags?.();
            }}
            placeholder="Type hashtag and press Space or Enter..."
          />
          {hashtagChips.length > 0 && (
            <HashtagChips>
              {hashtagChips.map((tag, index) => (
                <HashtagChip key={index} $designTheme={designTheme}>
                  #{tag}
                  <button
                    onClick={() => removeHashtagChip(index)}
                    aria-label={`Remove ${tag}`}
                  >
                    <X />
                  </button>
                </HashtagChip>
              ))}
            </HashtagChips>
          )}
          {hashtagsHint && (
            <HashtagHint>{hashtagsHint}</HashtagHint>
          )}
        </HashtagSection>
      )}
    </ComposerCard>
  );
}

// ============================================================================
// EXPORT UTILITY COMPONENTS (for platform composers to use)
// ============================================================================

export {
  // New modern components
  HeaderLeft,
  HeaderLabel,
  HeaderRight,
  AudiencePill,
  MetaButton,
  // Legacy exports for backward compatibility
  ContextLeft,
  ContextLabel,
  ContextPill,
  ContextRight,
};
