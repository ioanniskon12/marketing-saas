/**
 * TikTok Video Composer
 *
 * Specialized composer for TikTok videos with caption, hashtags,
 * cover selection, and privacy settings
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Upload, Music, Users, Lock, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import BaseComposerLayout, { ContextLeft, ContextLabel, ContextRight, MetaButton } from './BaseComposerLayout';

// ============================================================================
// TIKTOK-SPECIFIC STYLED COMPONENTS
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

const HashtagSuggestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
`;

const SuggestionChip = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$selected ? `${props.theme.colors.primary.main}15` : 'transparent'};
  color: ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
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
`;

const SoundSection = styled.div`
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.neutral[50]};
`;

const SoundIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => `${props.theme.colors.primary.main}15`};
  color: ${props => props.theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SoundInfo = styled.div`
  flex: 1;

  .sound-name {
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: ${props => props.theme.spacing.xs};
  }

  .sound-artist {
    font-size: ${props => props.theme.typography.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const CoverSelection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: ${props => props.theme.spacing.sm};
`;

const CoverOption = styled.div`
  aspect-ratio: 9/16;
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  border: 3px solid ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
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

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PrivacyOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const PrivacyOption = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.$selected ? `${props.theme.colors.primary.main}10` : 'transparent'};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  text-align: left;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => `${props.theme.colors.primary.main}10`};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

const PrivacyIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  color: ${props => props.$selected ? 'white' : props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PrivacyInfo = styled.div`
  flex: 1;

  .privacy-title {
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: ${props => props.theme.spacing.xs};
  }

  .privacy-desc {
    font-size: ${props => props.theme.typography.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const EffectsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

const EffectChip = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$selected ? `${props.theme.colors.primary.main}15` : 'transparent'};
  color: ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
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
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TikTokComposer({
  content = '',
  onContentChange,
  media = [],
  onMediaChange,
  onMediaUpload,
  onOpenMediaLibrary,
  hashtags = [],
  onHashtagsChange,
  privacy = 'public',
  onPrivacyChange,
  sound = null,
  onSoundChange,
}) {
  const [selectedCover, setSelectedCover] = useState(0);
  const [selectedEffects, setSelectedEffects] = useState([]);

  const trendingHashtags = [
    'fyp', 'foryou', 'viral', 'trending', 'tiktok',
    'duet', 'challenge', 'dance', 'comedy', 'tutorial'
  ];

  const suggestedEffects = [
    'Green Screen', 'Beauty', 'Time Warp', 'Zoom',
    'Reverse', 'Slow Mo', 'Fast', 'Transition'
  ];

  const toggleHashtag = (hashtag) => {
    const hashtagsArray = Array.isArray(hashtags) ? hashtags : [];
    if (hashtagsArray.includes(hashtag)) {
      onHashtagsChange?.(hashtagsArray.filter(h => h !== hashtag));
    } else {
      onHashtagsChange?.([...hashtagsArray, hashtag]);
    }
  };

  const toggleEffect = (effect) => {
    if (selectedEffects.includes(effect)) {
      setSelectedEffects(selectedEffects.filter(e => e !== effect));
    } else {
      setSelectedEffects([...selectedEffects, effect]);
    }
  };

  const removeMedia = (index) => {
    const newMedia = media.filter((_, i) => i !== index);
    onMediaChange?.(newMedia);
  };

  // Get privacy icon
  const getPrivacyIcon = () => {
    switch (privacy) {
      case 'public': return <Globe size={16} />;
      case 'friends': return <Users size={16} />;
      case 'private': return <Lock size={16} />;
      default: return <Globe size={16} />;
    }
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
        <span style={{ fontSize: '14px', fontWeight: 500 }}>TikTok</span>
      </ContextLeft>
      <ContextRight>
        {getPrivacyIcon()} {privacy.charAt(0).toUpperCase() + privacy.slice(1)}
      </ContextRight>
    </>
  );

  // Meta Toolbar
  const metaToolbar = (
    <>
      <MetaButton onClick={onSoundChange}>
        <Music size={16} />
        {sound ? 'Change Sound' : 'Add Sound'}
      </MetaButton>
      <MetaButton>
        <Sparkles size={16} />
        Effects ({selectedEffects.length})
      </MetaButton>
    </>
  );

  // Platform-Specific Fields
  const platformSpecificFields = (
    <>
      {/* Trending Hashtags */}
      <div>
        <Label>
          <Sparkles size={16} />
          Trending Hashtags
        </Label>
        <HashtagSuggestions>
          {trendingHashtags.map((tag) => (
            <SuggestionChip
              key={tag}
              $selected={Array.isArray(hashtags) && hashtags.includes(tag)}
              onClick={() => toggleHashtag(tag)}
            >
              #{tag}
            </SuggestionChip>
          ))}
        </HashtagSuggestions>
      </div>

      {/* Sound */}
      {sound && (
        <div>
          <Label>
            <Music size={16} />
            Sound
          </Label>
          <SoundSection>
            <SoundIcon>
              <Music size={24} />
            </SoundIcon>
            <SoundInfo>
              <div className="sound-name">{sound.name}</div>
              <div className="sound-artist">{sound.artist}</div>
            </SoundInfo>
            <Button variant="ghost" size="sm" onClick={onSoundChange}>
              Change
            </Button>
          </SoundSection>
        </div>
      )}

      {/* Cover Selection */}
      {media.length > 0 && media[0].type === 'video' && (
        <div>
          <Label>Video Cover</Label>
          <CoverSelection>
            {[0, 1, 2, 3, 4].map((index) => (
              <CoverOption
                key={index}
                $selected={selectedCover === index}
                onClick={() => setSelectedCover(index)}
              >
                <img src={`/placeholder-cover-${index + 1}.jpg`} alt={`Cover ${index + 1}`} />
              </CoverOption>
            ))}
          </CoverSelection>
        </div>
      )}

      {/* Effects */}
      <div>
        <Label>
          <Sparkles size={16} />
          Effects
        </Label>
        <EffectsSection>
          {suggestedEffects.map((effect) => (
            <EffectChip
              key={effect}
              $selected={selectedEffects.includes(effect)}
              onClick={() => toggleEffect(effect)}
            >
              {effect}
            </EffectChip>
          ))}
        </EffectsSection>
      </div>

      {/* Privacy Settings */}
      <div>
        <Label>Who can view this video</Label>
        <PrivacyOptions>
          <PrivacyOption
            $selected={privacy === 'public'}
            onClick={() => onPrivacyChange?.('public')}
          >
            <PrivacyIcon $selected={privacy === 'public'}>
              <Globe size={20} />
            </PrivacyIcon>
            <PrivacyInfo>
              <div className="privacy-title">Public</div>
              <div className="privacy-desc">Everyone can watch your video</div>
            </PrivacyInfo>
          </PrivacyOption>

          <PrivacyOption
            $selected={privacy === 'friends'}
            onClick={() => onPrivacyChange?.('friends')}
          >
            <PrivacyIcon $selected={privacy === 'friends'}>
              <Users size={20} />
            </PrivacyIcon>
            <PrivacyInfo>
              <div className="privacy-title">Friends</div>
              <div className="privacy-desc">Only your friends can watch</div>
            </PrivacyInfo>
          </PrivacyOption>

          <PrivacyOption
            $selected={privacy === 'private'}
            onClick={() => onPrivacyChange?.('private')}
          >
            <PrivacyIcon $selected={privacy === 'private'}>
              <Lock size={20} />
            </PrivacyIcon>
            <PrivacyInfo>
              <div className="privacy-title">Private</div>
              <div className="privacy-desc">Only you can watch</div>
            </PrivacyInfo>
          </PrivacyOption>
        </PrivacyOptions>
      </div>
    </>
  );

  return (
    <BaseComposerLayout
      platform="tiktok"
      title="TikTok Video"
      postContext={postContext}
      metaToolbar={metaToolbar}
      captionValue={content}
      captionPlaceholder="Describe your video... #FYP #Trending"
      captionMaxLength={2200}
      charHint="2,200 characters max"
      onChangeCaption={onContentChange}
      mediaState={{
        selectedMedia: media,
        maxItems: 1,
        allowedTypes: ['video'],
        recommendation: 'Video: MP4, WebM · Vertical 1080×1920 (9:16) · Up to 10 minutes · Max 4 GB',
      }}
      onAddMediaFromLibrary={(items) => onMediaChange?.([...media, ...items])}
      onUploadMedia={onMediaUpload}
      onRemoveMedia={removeMedia}
      onOpenMediaLibrary={onOpenMediaLibrary}
      hashtagsValue={hashtagString}
      onChangeHashtags={handleHashtagChange}
      hashtagsHint={`${hashtagCount} hashtag${hashtagCount !== 1 ? 's' : ''} · Use trending hashtags for better reach`}
      platformSpecificFields={platformSpecificFields}
    />
  );
}
