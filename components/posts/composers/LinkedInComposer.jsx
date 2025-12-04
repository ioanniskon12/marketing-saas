/**
 * LinkedIn Post Composer
 *
 * Specialized composer for LinkedIn posts with professional features,
 * articles, document uploads, and poll creation
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import {
  Image as ImageIcon,
  Video,
  FileText,
  BarChart2,
  Briefcase,
  Users,
  Hash,
  AtSign,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui';
import BaseComposerLayout, { ContextLeft, ContextLabel, ContextRight, MetaButton } from './BaseComposerLayout';

// ============================================================================
// LINKEDIN-SPECIFIC STYLED COMPONENTS
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const TypeCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.lg};
  border: 2px solid ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.$selected ? `${props.theme.colors.primary.main}10` : 'white'};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }

  svg {
    color: ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  }
`;

const TypeLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  text-align: center;
`;

const TypeDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

const ToneSelector = styled.select`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  background: white;
  color: ${props => props.theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const BestPractices = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => `${props.theme.colors.primary.main}10`};
  border-left: 3px solid ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.md};

  h4 {
    font-size: ${props => props.theme.typography.fontSize.sm};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: ${props => props.theme.spacing.sm};
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      font-size: ${props => props.theme.typography.fontSize.xs};
      color: ${props => props.theme.colors.text.secondary};
      padding-left: ${props => props.theme.spacing.lg};
      position: relative;
      margin-bottom: ${props => props.theme.spacing.xs};

      &:before {
        content: '✓';
        position: absolute;
        left: 0;
        color: ${props => props.theme.colors.success.main};
        font-weight: bold;
      }
    }
  }
`;

const PollSection = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const PollOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
`;

const PollOption = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  input {
    flex: 1;
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    border: 1px solid ${props => props.theme.colors.neutral[300]};
    border-radius: ${props => props.theme.borderRadius.md};
    font-size: ${props => props.theme.typography.fontSize.sm};
    background: white;
    color: ${props => props.theme.colors.text.primary};

    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary.main};
    }

    &::placeholder {
      color: ${props => props.theme.colors.text.secondary};
    }
  }
`;

const HashtagWarning = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.warning.light}20;
  border-left: 3px solid ${props => props.theme.colors.warning.main};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing.md};

  svg {
    color: ${props => props.theme.colors.warning.main};
    flex-shrink: 0;
  }
`;

const ToneRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LinkedInComposer({
  content = '',
  postType = 'post',
  tone = 'professional',
  hashtags = [],
  media = [],
  pollOptions = ['', ''],
  onContentChange,
  onPostTypeChange,
  onToneChange,
  onHashtagsChange,
  onMediaChange,
  onPollOptionsChange,
  onMediaUpload,
  onOpenMediaLibrary,
}) {
  const postTypes = [
    {
      id: 'post',
      label: 'Post',
      description: 'Share an update',
      icon: <Briefcase size={24} />
    },
    {
      id: 'article',
      label: 'Article',
      description: 'Write long-form',
      icon: <FileText size={24} />
    },
    {
      id: 'image',
      label: 'Image',
      description: 'Share a photo',
      icon: <ImageIcon size={24} />
    },
    {
      id: 'video',
      label: 'Video',
      description: 'Upload a video',
      icon: <Video size={24} />
    },
    {
      id: 'document',
      label: 'Document',
      description: 'Share a PDF/PPT',
      icon: <FileText size={24} />
    },
    {
      id: 'poll',
      label: 'Poll',
      description: 'Ask a question',
      icon: <BarChart2 size={24} />
    }
  ];

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    onPollOptionsChange?.(newOptions);
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      onPollOptionsChange?.([...pollOptions, '']);
    }
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      onPollOptionsChange?.(newOptions);
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
        <span style={{ fontSize: '14px', fontWeight: 500 }}>LinkedIn</span>
      </ContextLeft>
      <ContextRight>
        {postTypes.find(t => t.id === postType)?.label || 'Post'}
      </ContextRight>
    </>
  );

  // Meta Toolbar
  const metaToolbar = (
    <>
      <MetaButton>
        <AtSign size={16} />
        Mention
      </MetaButton>
      <MetaButton>
        <Users size={16} />
        Tag Company
      </MetaButton>
    </>
  );

  // Platform-Specific Fields
  const platformSpecificFields = (
    <>
      {/* Post Type Selector */}
      <div>
        <Label>Select Post Type</Label>
        <PostTypeSelector>
          {postTypes.map((type) => (
            <TypeCard
              key={type.id}
              $selected={postType === type.id}
              onClick={() => onPostTypeChange?.(type.id)}
            >
              {type.icon}
              <TypeLabel>{type.label}</TypeLabel>
              <TypeDescription>{type.description}</TypeDescription>
            </TypeCard>
          ))}
        </PostTypeSelector>
      </div>

      {/* Best Practices */}
      <BestPractices>
        <h4>LinkedIn Best Practices</h4>
        <ul>
          <li>Keep posts under 1,300 characters for full visibility</li>
          <li>Use 3-5 hashtags maximum for better reach</li>
          <li>Add value with insights and professional experiences</li>
          <li>Engage with comments within the first hour</li>
        </ul>
      </BestPractices>

      {/* Tone Selector */}
      <ToneRow>
        <Label>Writing Tone:</Label>
        <ToneSelector value={tone} onChange={(e) => onToneChange?.(e.target.value)}>
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="inspirational">Inspirational</option>
          <option value="educational">Educational</option>
        </ToneSelector>
      </ToneRow>

      {/* Poll Options */}
      {postType === 'poll' && (
        <PollSection>
          <Label>
            <BarChart2 size={16} />
            Poll Options
          </Label>
          <PollOptions>
            {pollOptions.map((option, index) => (
              <PollOption key={index}>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updatePollOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={30}
                />
                {pollOptions.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePollOption(index)}
                  >
                    ×
                  </Button>
                )}
              </PollOption>
            ))}
          </PollOptions>
          {pollOptions.length < 4 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={addPollOption}
              style={{ marginTop: '8px' }}
            >
              + Add option
            </Button>
          )}
        </PollSection>
      )}

      {/* Hashtag Warning */}
      {hashtagCount > 5 && (
        <HashtagWarning>
          <AlertCircle size={16} />
          <span>LinkedIn recommends using 3-5 hashtags for optimal reach</span>
        </HashtagWarning>
      )}
    </>
  );

  return (
    <BaseComposerLayout
      platform="linkedin"
      title="LinkedIn Post"
      postContext={postContext}
      metaToolbar={metaToolbar}
      captionValue={content}
      captionPlaceholder={
        postType === 'article'
          ? 'Write your article... Share your expertise and insights with your network.'
          : 'What do you want to talk about?'
      }
      captionMaxLength={3000}
      charHint="Recommended < 1,300 characters · max 3,000"
      onChangeCaption={onContentChange}
      mediaState={{
        selectedMedia: media,
        maxItems: 9,
        allowedTypes: postType === 'video' ? ['video'] : postType === 'document' ? ['document'] : ['image', 'video'],
        recommendation: postType === 'document'
          ? 'Documents: PDF, PPT, PPTX · max 100 MB · up to 9 files'
          : postType === 'video'
          ? 'Video: MP4, MOV · max 5 GB · 3 seconds to 10 minutes'
          : 'Images: JPG, PNG · Recommended: 1200×627 · up to 9 images',
      }}
      onMediaChange={onMediaChange}
      onAddMediaFromLibrary={(items) => onMediaChange?.([...media, ...items])}
      onUploadMedia={onMediaUpload}
      onRemoveMedia={removeMedia}
      onOpenMediaLibrary={onOpenMediaLibrary}
      hashtagsValue={hashtagString}
      onChangeHashtags={handleHashtagChange}
      hashtagsHint={`${hashtagCount} hashtag${hashtagCount !== 1 ? 's' : ''} · Recommended: 3-5`}
      platformSpecificFields={platformSpecificFields}
    />
  );
}
