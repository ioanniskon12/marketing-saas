/**
 * Facebook Post Composer
 *
 * Specialized composer for Facebook posts with various post types,
 * feeling/activity, audience selection, and rich media
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Image as ImageIcon,
  Video,
  MapPin,
  Smile,
  Users,
  Globe,
  Lock,
  Tag,
  Calendar,
  BarChart
} from 'lucide-react';
import BaseComposerLayout, {
  HeaderLeft,
  HeaderLabel,
  HeaderRight,
  AudiencePill,
  MetaButton
} from './BaseComposerLayout';

// ============================================================================
// FACEBOOK-SPECIFIC STYLED COMPONENTS
// ============================================================================

const PostTypeBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: ${props => props.theme.spacing.sm};
  padding: 0;
`;

const PostTypeButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.md};
  min-height: 80px;
  border: ${props => props.$selected
    ? '2px solid rgba(139, 92, 246, 1)'
    : '2px solid rgba(255, 255, 255, 0.08)'};
  border-radius: 12px;
  background: ${props => props.$selected
    ? 'rgba(139, 92, 246, 0.15)'
    : 'rgba(255, 255, 255, 0.03)'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), transparent);
    opacity: ${props => props.$selected ? 1 : 0};
    transition: opacity 0.2s ease;
  }

  &:hover {
    background: ${props => props.$selected
      ? 'rgba(139, 92, 246, 0.2)'
      : 'rgba(255, 255, 255, 0.06)'};
    border-color: rgba(139, 92, 246, 0.6);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
  }

  svg {
    color: ${props => props.$selected ? 'rgba(139, 92, 246, 1)' : 'rgba(255, 255, 255, 0.6)'};
    width: 22px;
    height: 22px;
    transition: all 0.2s ease;
    position: relative;
    z-index: 1;
  }

  span {
    font-size: ${props => props.theme.typography.fontSize.xs};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.$selected ? 'rgba(139, 92, 246, 1)' : props.theme.colors.text.primary};
    position: relative;
    z-index: 1;
  }
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
  display: block;
`;

const BackgroundOptions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow-x: auto;
  margin-top: ${props => props.theme.spacing.md};
`;

const BackgroundOption = styled.button`
  min-width: 60px;
  height: 60px;
  border-radius: ${props => props.theme.borderRadius.md};
  border: 3px solid ${props => props.$selected ? props.theme.colors.primary.main : 'transparent'};
  background: ${props => props.$color};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    transform: scale(1.05);
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

const FeelingChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border: ${props => props.$selected
    ? '2px solid rgba(139, 92, 246, 1)'
    : '2px solid rgba(255, 255, 255, 0.08)'};
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$selected
    ? 'rgba(139, 92, 246, 0.15)'
    : 'rgba(255, 255, 255, 0.03)'};
  color: ${props => props.$selected ? 'rgba(139, 92, 246, 1)' : props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.$selected
    ? props.theme.typography.fontWeight.semibold
    : props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(139, 92, 246, 0.1), transparent);
    opacity: ${props => props.$selected ? 1 : 0};
    transition: opacity 0.2s ease;
  }

  &:hover {
    background: ${props => props.$selected
      ? 'rgba(139, 92, 246, 0.2)'
      : 'rgba(255, 255, 255, 0.06)'};
    border-color: rgba(139, 92, 246, 0.6);
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
  }
`;

const FeelingBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FacebookComposer({
  designTheme = 'modern',
  content = '',
  postType = 'text',
  audience = 'public',
  feeling = null,
  location = '',
  media = [],
  taggedPeople = [],
  hashtags = [],
  onContentChange,
  onPostTypeChange,
  onAudienceChange,
  onFeelingChange,
  onLocationChange,
  onMediaChange,
  onMediaUpload,
  onTagPeople,
  onHashtagsChange,
  onOpenMediaLibrary,
}) {
  const [selectedBackground, setSelectedBackground] = useState(null);

  // Local state for hashtag string to preserve spaces during typing
  const [localHashtagString, setLocalHashtagString] = useState(() =>
    Array.isArray(hashtags) ? hashtags.map(h => `#${h}`).join(' ') : hashtags || ''
  );

  const postTypes = [
    { id: 'text', label: 'Text', icon: <Smile size={20} /> },
    { id: 'photo', label: 'Photo', icon: <ImageIcon size={20} /> },
    { id: 'video', label: 'Video', icon: <Video size={20} /> },
    { id: 'reel', label: 'Reel', icon: <Video size={20} /> },
    { id: 'live', label: 'Live Video', icon: <BarChart size={20} /> },
    { id: 'event', label: 'Event', icon: <Calendar size={20} /> },
  ];

  const feelings = [
    '😊 Happy', '😍 Loved', '😎 Cool', '😂 Funny', '😢 Sad',
    '😴 Tired', '🎉 Celebrating', '🍕 Eating', '🎮 Gaming', '✈️ Traveling'
  ];

  const backgroundColors = [
    { id: 'none', color: 'transparent' },
    { id: 'gradient1', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'gradient2', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'gradient3', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'gradient4', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: 'gradient5', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 'solid1', color: '#1877F2' },
    { id: 'solid2', color: '#E4405F' },
  ];

  const getAudienceIcon = () => {
    switch (audience) {
      case 'public': return <Globe size={16} />;
      case 'friends': return <Users size={16} />;
      case 'private': return <Lock size={16} />;
      default: return <Globe size={16} />;
    }
  };

  const getAudienceLabel = () => {
    switch (audience) {
      case 'public': return 'Public';
      case 'friends': return 'Friends';
      case 'private': return 'Only Me';
      default: return 'Public';
    }
  };

  const cycleAudience = () => {
    const audiences = ['public', 'friends', 'private'];
    const currentIndex = audiences.indexOf(audience);
    const nextIndex = (currentIndex + 1) % audiences.length;
    onAudienceChange?.(audiences[nextIndex]);
  };

  const removeMedia = (index) => {
    const newMedia = media.filter((_, i) => i !== index);
    onMediaChange?.(newMedia);
  };

  const handleLocationClick = () => {
    const newLocation = prompt('Add location:', location || '');
    if (newLocation !== null) {
      onLocationChange?.(newLocation);
    }
  };

  // Count hashtags from local string
  const hashtagCount = localHashtagString.split(' ').filter(h => h.trim().startsWith('#')).length;

  const handleHashtagChange = (value) => {
    // Update local state immediately (preserves spaces during typing)
    setLocalHashtagString(value);
  };

  const handleHashtagBlur = () => {
    // Parse and save to parent only on blur
    const tags = localHashtagString
      .split(/[\s]+/)
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);
    onHashtagsChange?.(tags);
  };

  // Post Context (audience + platform)
  const postContext = (
    <>
      <HeaderLeft>
        <HeaderLabel>Post to:</HeaderLabel>
        <AudiencePill $designTheme={designTheme} onClick={cycleAudience}>
          {getAudienceIcon()}
          {getAudienceLabel()}
        </AudiencePill>
      </HeaderLeft>
      <HeaderRight>
        <span>Platform:</span> <strong>Facebook</strong>
      </HeaderRight>
    </>
  );

  // Meta Toolbar
  const metaToolbar = (
    <>
      {feeling && (
        <FeelingChip
          $selected
          onClick={() => onFeelingChange?.(null)}
        >
          {feeling}
        </FeelingChip>
      )}
      <MetaButton onClick={onTagPeople}>
        <Tag size={16} />
        Tag People
        {taggedPeople?.length > 0 && ` (${taggedPeople.length})`}
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
        <Label>Post Type</Label>
        <PostTypeBar>
          {postTypes.map((type) => (
            <PostTypeButton
              key={type.id}
              $selected={postType === type.id}
              onClick={() => onPostTypeChange?.(type.id)}
            >
              {type.icon}
              <span>{type.label}</span>
            </PostTypeButton>
          ))}
        </PostTypeBar>
      </div>

      {/* Feelings */}
      <div>
        <Label>Feeling/Activity (optional)</Label>
        <FeelingBar>
          {feelings.slice(0, 6).map((feel) => (
            <FeelingChip
              key={feel}
              $selected={feeling === feel}
              onClick={() => onFeelingChange?.(feeling === feel ? null : feel)}
            >
              {feel}
            </FeelingChip>
          ))}
        </FeelingBar>
      </div>

      {/* Background Options (for text posts without media) */}
      {postType === 'text' && media.length === 0 && (
        <div>
          <Label>Background (optional)</Label>
          <BackgroundOptions>
            {backgroundColors.map((bg) => (
              <BackgroundOption
                key={bg.id}
                $color={bg.color}
                $selected={selectedBackground === bg.id}
                onClick={() => setSelectedBackground(bg.id)}
                title={bg.id === 'none' ? 'No background' : 'Background'}
              />
            ))}
          </BackgroundOptions>
        </div>
      )}
    </>
  );

  return (
    <BaseComposerLayout
      platform="facebook"
      title="Facebook Post"
      designTheme={designTheme}
      postContext={postContext}
      metaToolbar={metaToolbar}
      captionValue={content}
      captionPlaceholder="What's on your mind?"
      captionMaxLength={63206}
      charHint="Recommended < 2,200 characters · max 63,206"
      onChangeCaption={onContentChange}
      mediaState={{
        selectedMedia: media,
        maxItems: 10,
        allowedTypes: postType === 'video' ? ['video'] : ['image', 'video'],
        recommendation: postType === 'photo'
          ? 'Recommended: 1200×630 (link preview) or 1080×1080 (square)'
          : postType === 'video'
          ? 'Recommended: 1080×1920 (vertical) or 1280×720 (landscape)'
          : 'Images and videos supported',
      }}
      onMediaChange={onMediaChange}
      onAddMediaFromLibrary={(items) => onMediaChange?.([...media, ...items])}
      onUploadMedia={onMediaUpload}
      onRemoveMedia={removeMedia}
      onOpenMediaLibrary={onOpenMediaLibrary}
      hashtagsValue={localHashtagString}
      onChangeHashtags={handleHashtagChange}
      onBlurHashtags={handleHashtagBlur}
      hashtagsHint={`${hashtagCount} hashtag${hashtagCount !== 1 ? 's' : ''}`}
      platformSpecificFields={platformSpecificFields}
    />
  );
}
