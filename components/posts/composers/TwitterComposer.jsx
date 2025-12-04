/**
 * Twitter/X Post Composer
 *
 * Specialized composer for Twitter posts with character counter,
 * thread support, and circular progress indicator
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Hash, Smile, AtSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import BaseComposerLayout, { ContextLeft, ContextLabel, ContextRight, MetaButton } from './BaseComposerLayout';

// ============================================================================
// TWITTER-SPECIFIC STYLED COMPONENTS
// ============================================================================

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
  display: block;
`;

const TweetBox = styled.div`
  border: 2px solid ${props => props.$error ? props.theme.colors.error.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background.paper};
  transition: all ${props => props.theme.transitions.fast};

  &:focus-within {
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => `${props.theme.colors.primary.main}15`};
  }
`;

const TweetTextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  border: none;
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: inherit;
  resize: vertical;
  outline: none;
  background: transparent;
  color: ${props => props.theme.colors.text.primary};

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }

  &:focus {
    outline: none;
  }
`;

const TweetFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.md};
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const CharacterCounter = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const CircularProgress = styled.svg`
  width: 32px;
  height: 32px;
  transform: rotate(-90deg);
`;

const ProgressCircle = styled.circle`
  fill: none;
  stroke: ${props => {
    if (props.$percentage > 100) return props.theme.colors.error.main;
    if (props.$percentage > 90) return props.theme.colors.warning.main;
    return props.theme.colors.primary.main;
  }};
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
`;

const CharCount = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => {
    if (props.$count > 280) return props.theme.colors.error.main;
    if (props.$count > 252) return props.theme.colors.warning.main;
    return props.theme.colors.text.secondary;
  }};
`;

const ThreadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const ThreadConnector = styled.div`
  width: 2px;
  height: 24px;
  background: ${props => props.theme.colors.neutral[300]};
  margin-left: 20px;
`;

const AddThreadButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  border: 2px dashed ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: transparent;
  color: ${props => props.theme.colors.primary.main};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => `${props.theme.colors.primary.main}10`};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

const TweetCounter = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing.sm};
  text-align: center;
`;

const ThreadInfo = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => `${props.theme.colors.primary.main}10`};
  border-left: 3px solid ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TwitterComposer({
  content = '',
  onContentChange,
  media = [],
  onMediaChange,
  onMediaUpload,
  onOpenMediaLibrary,
  hashtags = [],
  onHashtagsChange,
}) {
  const [additionalTweets, setAdditionalTweets] = useState([]);
  const maxChars = 280;

  const calculatePercentage = (text) => {
    return (text.length / maxChars) * 100;
  };

  const calculateStrokeDashoffset = (percentage) => {
    const circumference = 2 * Math.PI * 14; // radius = 14
    return circumference - (percentage / 100) * circumference;
  };

  const handleAdditionalTweetChange = (index, value) => {
    const newTweets = [...additionalTweets];
    newTweets[index] = value;
    setAdditionalTweets(newTweets);
  };

  const addThread = () => {
    if (additionalTweets.length < 24) { // Max 25 total (1 main + 24 additional)
      setAdditionalTweets([...additionalTweets, '']);
    }
  };

  const removeThread = (index) => {
    const newTweets = additionalTweets.filter((_, i) => i !== index);
    setAdditionalTweets(newTweets);
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

  // Custom character counter with circular progress
  const customCharacterCounter = () => {
    const percentage = calculatePercentage(content);
    return (
      <CharacterCounter>
        <CharCount $count={content.length}>
          {maxChars - content.length}
        </CharCount>
        <CircularProgress>
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          <ProgressCircle
            cx="16"
            cy="16"
            r="14"
            strokeDasharray={`${2 * Math.PI * 14}`}
            strokeDashoffset={calculateStrokeDashoffset(percentage)}
            $percentage={percentage}
          />
        </CircularProgress>
      </CharacterCounter>
    );
  };

  // Post Context
  const postContext = (
    <>
      <ContextLeft>
        <ContextLabel>Posting to:</ContextLabel>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>Twitter / X</span>
      </ContextLeft>
      <ContextRight>
        {additionalTweets.length > 0 ? `Thread (${additionalTweets.length + 1} tweets)` : 'Single Tweet'}
      </ContextRight>
    </>
  );

  // Meta Toolbar
  const metaToolbar = (
    <>
      <MetaButton>
        <Smile size={16} />
        Emoji
      </MetaButton>
      <MetaButton>
        <AtSign size={16} />
        Mention
      </MetaButton>
    </>
  );

  // Platform-Specific Fields (Thread Support)
  const platformSpecificFields = (
    <>
      {/* Thread Info */}
      {additionalTweets.length > 0 && (
        <ThreadInfo>
          Creating a thread with {additionalTweets.length + 1} tweets. First tweet shown above with media.
        </ThreadInfo>
      )}

      {/* Additional Tweets in Thread */}
      {additionalTweets.length > 0 && (
        <ThreadSection>
          <Label>Additional Tweets in Thread</Label>
          {additionalTweets.map((tweet, index) => (
            <div key={index}>
              <ThreadConnector />
              <TweetBox $error={tweet.length > maxChars}>
                <TweetTextArea
                  value={tweet}
                  onChange={(e) => handleAdditionalTweetChange(index, e.target.value)}
                  placeholder={`Tweet ${index + 2}`}
                  maxLength={280}
                />
                <TweetFooter>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeThread(index)}
                  >
                    Remove Tweet
                  </Button>
                  <CharacterCounter>
                    <CharCount $count={tweet.length}>
                      {maxChars - tweet.length}
                    </CharCount>
                    <CircularProgress>
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <ProgressCircle
                        cx="16"
                        cy="16"
                        r="14"
                        strokeDasharray={`${2 * Math.PI * 14}`}
                        strokeDashoffset={calculateStrokeDashoffset(calculatePercentage(tweet))}
                        $percentage={calculatePercentage(tweet)}
                      />
                    </CircularProgress>
                  </CharacterCounter>
                </TweetFooter>
              </TweetBox>
            </div>
          ))}
        </ThreadSection>
      )}

      {/* Add Thread Button */}
      {additionalTweets.length < 24 && (
        <AddThreadButton onClick={addThread}>
          <Plus size={20} />
          Add another tweet to thread
        </AddThreadButton>
      )}

      {additionalTweets.length === 24 && (
        <TweetCounter>
          Maximum thread length reached (25 tweets)
        </TweetCounter>
      )}
    </>
  );

  return (
    <BaseComposerLayout
      platform="twitter"
      title="Twitter / X Post"
      postContext={postContext}
      metaToolbar={metaToolbar}
      captionValue={content}
      captionPlaceholder="What's happening?"
      captionMaxLength={280}
      charHint="280 characters max"
      onChangeCaption={onContentChange}
      customCharacterCounter={customCharacterCounter}
      mediaState={{
        selectedMedia: media,
        maxItems: 4,
        allowedTypes: ['image', 'video'],
        recommendation: 'Images: JPG, PNG, GIF · Videos: MP4, MOV · Max 4 items · Recommended: 1600×900 or 16:9 aspect ratio',
      }}
      onMediaChange={onMediaChange}
      onAddMediaFromLibrary={(items) => onMediaChange?.([...media, ...items])}
      onUploadMedia={onMediaUpload}
      onRemoveMedia={removeMedia}
      onOpenMediaLibrary={onOpenMediaLibrary}
      hashtagsValue={hashtagString}
      onChangeHashtags={handleHashtagChange}
      hashtagsHint={`${hashtagCount} hashtag${hashtagCount !== 1 ? 's' : ''}`}
      platformSpecificFields={platformSpecificFields}
    />
  );
}
