/**
 * Instagram Post Composer
 *
 * Specialized composer for Instagram posts with Feed, Story, and Reel support
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import {
  MapPin,
  Tag,
  User,
  AlertCircle,
  Film,
  Upload,
  X,
  Type
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import BaseComposerLayout, { ContextLeft, ContextLabel, ContextRight, MetaButton } from './BaseComposerLayout';

// ============================================================================
// INSTAGRAM-SPECIFIC STYLED COMPONENTS
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

const PostTypeSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background.default};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const PostTypeOption = styled.button`
  flex: 1;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.$selected ? props.theme.colors.primary.main : 'transparent'};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$selected ? props.theme.colors.background.paper : 'transparent'};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.background.paper};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

// Reel-specific components
const ReelSection = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => `${props.theme.colors.primary.main}08`};
  border: 2px dashed ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.xl};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const ReelBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  width: fit-content;
`;

const ValidationWarning = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.$type === 'error' ? props.theme.colors.error.light : props.theme.colors.warning.light};
  border-left: 4px solid ${props => props.$type === 'error' ? props.theme.colors.error.main : props.theme.colors.warning.main};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.$type === 'error' ? props.theme.colors.error.dark : props.theme.colors.warning.dark};
  font-size: ${props => props.theme.typography.fontSize.sm};

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const CoverFrameSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const CoverTabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  border-bottom: 2px solid ${props => props.theme.colors.neutral[200]};
`;

const CoverTab = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: none;
  background: transparent;
  color: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  font-weight: ${props => props.$active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.primary.main : 'transparent'};
  margin-bottom: -2px;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.primary.main};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

const CoverUploadArea = styled.div`
  border: 2px dashed ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => `${props.theme.colors.primary.main}05`};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

const CoverPreview = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  margin: 0 auto;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing.xs};
  right: ${props => props.theme.spacing.xs};
  width: 24px;
  height: 24px;
  border-radius: ${props => props.theme.borderRadius.full};
  border: none;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.colors.error.main};
  }

  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
  }
`;

const TagUsersSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const TaggedUsersList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
`;

const TaggedUserChip = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: ${props => `${props.theme.colors.primary.main}15`};
  border: 1px solid ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.full};
  color: ${props => props.theme.colors.primary.main};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};

  button {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;

    &:focus {
      outline: 2px solid ${props => props.theme.colors.primary.main};
      outline-offset: 2px;
      border-radius: ${props => props.theme.borderRadius.full};
    }
  }
`;

const FirstCommentArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.default};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: inherit;
  resize: vertical;

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

const AltTextSection = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const AltTextInput = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-family: inherit;
  resize: vertical;
  margin-top: ${props => props.theme.spacing.sm};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InstagramComposer({
  media = [],
  content = '',
  placementType = 'feed',
  hashtags = [],
  location = '',
  altText = '',
  // Reel-specific props
  coverFrame = null,
  firstComment = '',
  taggedUsers = [],
  onContentChange,
  onPlacementTypeChange,
  onMediaChange,
  onHashtagsChange,
  onLocationChange,
  onAltTextChange,
  onMediaUpload,
  onCoverFrameChange,
  onCoverFrameUpload,
  onFirstCommentChange,
  onTaggedUsersChange,
  onTagPeople,
  onOpenMediaLibrary,
}) {
  const [coverTabMode, setCoverTabMode] = useState('upload');
  const [newTagUser, setNewTagUser] = useState('');

  // Video validation for Reels
  const getVideoValidation = () => {
    if (placementType !== 'reel' || media.length === 0) return null;

    const videoFile = media.find(m => m.mime_type?.startsWith('video/') || m.type === 'video');
    if (!videoFile) return [{ type: 'error', message: 'Reels require a video file' }];

    const warnings = [];

    // Check duration (max 90 seconds)
    if (videoFile.duration && videoFile.duration > 90) {
      warnings.push({
        type: 'error',
        message: `Video is ${Math.round(videoFile.duration)}s long. Reels must be max 90 seconds.`
      });
    }

    // Check aspect ratio (should be 9:16 for Reels)
    if (videoFile.width && videoFile.height) {
      const aspectRatio = videoFile.width / videoFile.height;
      const targetRatio = 9 / 16;
      const diff = Math.abs(aspectRatio - targetRatio);

      if (diff > 0.1) {
        warnings.push({
          type: 'warning',
          message: `Video aspect ratio is ${videoFile.width}×${videoFile.height}. Recommended: 1080×1920 (9:16)`
        });
      }
    }

    return warnings.length > 0 ? warnings : null;
  };

  const addTaggedUser = () => {
    if (newTagUser.trim() && !taggedUsers.includes(newTagUser.trim())) {
      onTaggedUsersChange?.([...taggedUsers, newTagUser.trim()]);
      setNewTagUser('');
    }
  };

  const removeTaggedUser = (user) => {
    onTaggedUsersChange?.(taggedUsers.filter(u => u !== user));
  };

  const handleTagUserKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTaggedUser();
    }
  };

  const handleLocationClick = () => {
    const newLocation = prompt('Add location:', location || '');
    if (newLocation !== null) {
      onLocationChange?.(newLocation);
    }
  };

  const removeMedia = (index) => {
    const newMedia = media.filter((_, i) => i !== index);
    onMediaChange?.(newMedia);
  };

  // Build hashtag string from array
  const hashtagString = Array.isArray(hashtags) ? hashtags.map(h => `#${h}`).join(' ') : '';
  const hashtagCount = Array.isArray(hashtags) ? hashtags.length : 0;

  const handleHashtagChange = (value) => {
    // Parse hashtags from input (space or comma separated)
    const tags = value
      .split(/[\s,]+/)
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);
    onHashtagsChange?.(tags);
  };

  // Post Context
  const postContext = (
    <>
      <ContextLeft>
        <ContextLabel>Publishing to:</ContextLabel>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>Instagram</span>
      </ContextLeft>
      <ContextRight>
        {placementType === 'feed' && 'Feed Post'}
        {placementType === 'story' && 'Story'}
        {placementType === 'reel' && 'Reel'}
      </ContextRight>
    </>
  );

  // Meta Toolbar
  const metaToolbar = (
    <>
      <MetaButton onClick={onTagPeople || addTaggedUser}>
        <Tag size={16} />
        Tag People
        {taggedUsers?.length > 0 && ` (${taggedUsers.length})`}
      </MetaButton>
      <MetaButton onClick={handleLocationClick}>
        <MapPin size={16} />
        {location || 'Add Location'}
      </MetaButton>
    </>
  );

  // Platform-Specific Fields
  const platformSpecificFields = (
    <>
      {/* Post Type Selector */}
      <div>
        <Label>Placement Type</Label>
        <PostTypeSelector>
          <PostTypeOption
            $selected={placementType === 'feed'}
            onClick={() => onPlacementTypeChange?.('feed')}
          >
            Feed Post
          </PostTypeOption>
          <PostTypeOption
            $selected={placementType === 'story'}
            onClick={() => onPlacementTypeChange?.('story')}
          >
            Story
          </PostTypeOption>
          <PostTypeOption
            $selected={placementType === 'reel'}
            onClick={() => onPlacementTypeChange?.('reel')}
          >
            Reel
          </PostTypeOption>
        </PostTypeSelector>
      </div>

      {/* Reel-Specific Features */}
      {placementType === 'reel' && (
        <ReelSection>
          <ReelBadge>
            <Film size={16} />
            Instagram Reel Settings
          </ReelBadge>

          {/* Video Validation Warnings */}
          {getVideoValidation()?.map((warning, index) => (
            <ValidationWarning key={index} $type={warning.type}>
              <AlertCircle size={18} />
              <span>{warning.message}</span>
            </ValidationWarning>
          ))}

          {/* Cover Frame Selector */}
          <CoverFrameSection>
            <Label>
              <Film size={16} />
              Cover Frame / Thumbnail
            </Label>

            <CoverTabs>
              <CoverTab
                $active={coverTabMode === 'upload'}
                onClick={() => setCoverTabMode('upload')}
              >
                <Upload size={16} />
                Upload Custom Cover
              </CoverTab>
              <CoverTab
                $active={coverTabMode === 'select'}
                onClick={() => setCoverTabMode('select')}
              >
                <Film size={16} />
                Select from Video
              </CoverTab>
            </CoverTabs>

            {coverTabMode === 'upload' ? (
              <div>
                {coverFrame ? (
                  <CoverPreview>
                    <img src={coverFrame} alt="Cover frame" />
                    <RemoveButton onClick={() => onCoverFrameChange?.(null)}>
                      <X size={16} />
                    </RemoveButton>
                  </CoverPreview>
                ) : (
                  <CoverUploadArea
                    onClick={onCoverFrameUpload}
                    tabIndex={0}
                    role="button"
                    aria-label="Upload cover image"
                  >
                    <Upload size={32} style={{ color: '#666' }} />
                    <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                      Click to upload cover image<br />
                      <span style={{ fontSize: '12px' }}>Recommended: 1080×1920 (9:16)</span>
                    </p>
                  </CoverUploadArea>
                )}
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '14px', color: '#666', padding: '16px', textAlign: 'center' }}>
                  Select a frame from your video as the cover (Feature coming soon)
                </p>
              </div>
            )}
          </CoverFrameSection>

          {/* First Comment */}
          <div>
            <Label>First Comment (Optional)</Label>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
              This comment will be posted immediately after your Reel is published
            </p>
            <FirstCommentArea
              value={firstComment}
              onChange={(e) => onFirstCommentChange?.(e.target.value)}
              placeholder="Add a first comment..."
              maxLength={2200}
            />
            <CharCounter $over={firstComment.length > 2200}>
              {firstComment.length} / 2,200
            </CharCounter>
          </div>

          {/* Tag Users */}
          <TagUsersSection>
            <Label>
              <User size={16} />
              Tag Users
            </Label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                value={newTagUser}
                onChange={(e) => setNewTagUser(e.target.value)}
                onKeyPress={handleTagUserKeyPress}
                placeholder="Enter username (e.g., @username)"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={addTaggedUser}
                disabled={!newTagUser.trim()}
              >
                Add
              </Button>
            </div>
            {taggedUsers.length > 0 && (
              <TaggedUsersList>
                {taggedUsers.map((user, index) => (
                  <TaggedUserChip key={index}>
                    <User size={14} />
                    {user}
                    <button onClick={() => removeTaggedUser(user)} aria-label={`Remove ${user}`}>
                      <X size={14} />
                    </button>
                  </TaggedUserChip>
                ))}
              </TaggedUsersList>
            )}
          </TagUsersSection>
        </ReelSection>
      )}

      {/* Alt Text */}
      <AltTextSection>
        <Label>
          <Type size={16} />
          Alt Text (Accessibility)
        </Label>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          Write alt text to describe your photos for people with visual impairments
        </p>
        <AltTextInput
          value={altText}
          onChange={(e) => onAltTextChange?.(e.target.value)}
          placeholder="Write alt text..."
          maxLength={500}
        />
      </AltTextSection>
    </>
  );

  return (
    <BaseComposerLayout
      platform="instagram"
      title="Instagram Post"
      postContext={postContext}
      metaToolbar={metaToolbar}
      captionValue={content}
      captionPlaceholder="Write a caption..."
      captionMaxLength={2200}
      charHint="Max 2,200 characters · Recommended under 138-220"
      onChangeCaption={onContentChange}
      mediaState={{
        selectedMedia: media,
        maxItems: placementType === 'feed' ? 10 : 1,
        allowedTypes: placementType === 'reel' ? ['video'] : ['image', 'video'],
        recommendation: placementType === 'feed'
          ? 'Feed: 1080×1080 (square) or 1080×1350 (portrait) · up to 10 items'
          : placementType === 'reel'
          ? 'Reels: vertical 1080×1920 (9:16) · 1 video · max 90 seconds'
          : 'Stories: vertical 1080×1920 (9:16) · 1 image or video',
      }}
      onMediaChange={onMediaChange}
      onAddMediaFromLibrary={(items) => onMediaChange?.([...media, ...items])}
      onUploadMedia={onMediaUpload}
      onRemoveMedia={removeMedia}
      onOpenMediaLibrary={onOpenMediaLibrary}
      hashtagsValue={hashtagString}
      onChangeHashtags={handleHashtagChange}
      hashtagsHint={`${hashtagCount} / 30 hashtags`}
      platformSpecificFields={platformSpecificFields}
    />
  );
}
