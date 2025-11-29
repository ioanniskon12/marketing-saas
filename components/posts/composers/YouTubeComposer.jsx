/**
 * YouTube Video Composer
 *
 * Specialized composer for YouTube videos with title, description,
 * thumbnail, tags, category, and visibility settings
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Upload, Image as ImageIcon, Tag as TagIcon, Eye, Clock, Globe, Lock } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import BaseComposerLayout, { ContextLeft, ContextLabel, ContextRight, MetaButton } from './BaseComposerLayout';

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

const TagsInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  border: 2px solid ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  min-height: 100px;
  background: white;

  &:focus-within {
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const TagChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => `${props.theme.colors.primary.main}15`};
  color: ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};

  button {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
    display: flex;
    font-size: 18px;
    line-height: 1;

    &:hover {
      opacity: 0.7;
    }
  }
`;

const TagInput = styled.input`
  flex: 1;
  min-width: 200px;
  border: none;
  outline: none;
  font-size: ${props => props.theme.typography.fontSize.sm};
  padding: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text.primary};

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
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
  background: white;
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
}) {
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [tagInput, setTagInput] = useState('');

  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag();
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
        <ThumbnailGrid>
          <CustomThumbnailUpload>
            <input type="file" accept="image/*" />
            <Upload size={24} />
            <span style={{ marginTop: '8px' }}>Upload custom</span>
            <span style={{ fontSize: '10px', opacity: 0.7 }}>1280×720 recommended</span>
          </CustomThumbnailUpload>
        </ThumbnailGrid>
      </ThumbnailSection>

      {/* Tags */}
      <div>
        <Label>
          <TagIcon size={16} />
          Tags (Max 15)
        </Label>
        <TagsInput>
          {Array.isArray(tags) && tags.map((tag, index) => (
            <TagChip key={index}>
              {tag}
              <button onClick={() => removeTag(tag)}>×</button>
            </TagChip>
          ))}
          <TagInput
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInput}
            onBlur={addTag}
            placeholder="Add tags (press Enter)..."
            disabled={Array.isArray(tags) && tags.length >= 15}
          />
        </TagsInput>
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
      onAddMediaFromLibrary={(items) => onMediaChange?.([...media, ...items])}
      onUploadMedia={onMediaUpload}
      onRemoveMedia={removeMedia}
      onOpenMediaLibrary={onOpenMediaLibrary}
      showHashtags={false}
      platformSpecificFields={platformSpecificFields}
    />
  );
}
