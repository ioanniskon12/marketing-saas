/**
 * Twitter/X Post Preview
 *
 * Mimics how a tweet will look on Twitter/X
 */

'use client';

import styled from 'styled-components';
import { MoreHorizontal, MessageCircle, Repeat2, Heart, BarChart2, Share } from 'lucide-react';

const PreviewContainer = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
`;

const PreviewHeader = styled.div`
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.neutral[50]};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};
  text-align: center;
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const TweetCard = styled.div`
  background: white;
  padding: 12px 16px;
`;

const TweetHeader = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(135deg, #1DA1F2 0%, #0c85d0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  flex-shrink: 0;
`;

const TweetMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const TweetInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const DisplayName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #0f1419;
`;

const Username = styled.span`
  font-size: 15px;
  color: #536471;
`;

const Timestamp = styled.span`
  font-size: 15px;
  color: #536471;
`;

const MoreButton = styled.button`
  background: transparent;
  border: none;
  color: #536471;
  cursor: pointer;
  padding: 0;
  border-radius: ${props => props.theme.borderRadius.full};
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(29, 155, 240, 0.1);
    color: #1DA1F2;
  }
`;

const TweetText = styled.div`
  font-size: 15px;
  color: #0f1419;
  line-height: 1.5;
  margin-bottom: ${props => props.theme.spacing.sm};
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const CharacterCount = styled.div`
  font-size: 12px;
  color: ${props => props.$over ? '#f91880' : '#536471'};
  font-weight: ${props => props.$over ? 700 : 400};
  margin-bottom: ${props => props.theme.spacing.sm};
  text-align: right;
`;

const MediaContainer = styled.div`
  margin-top: ${props => props.theme.spacing.sm};
  border: 1px solid #cfd9de;
  border-radius: 16px;
  overflow: hidden;
`;

const SingleMedia = styled.img`
  width: 100%;
  display: block;
  max-height: 285px;
  object-fit: cover;
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$count === 2 ? '1fr 1fr' : props.$count === 3 ? '1fr 1fr' : '1fr 1fr'};
  grid-template-rows: ${props => props.$count === 3 ? '1fr 1fr' : 'auto'};
  gap: 2px;
`;

const GridImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 1;

  ${props => props.$span && `
    grid-column: 1 / -1;
  `}
`;

const TweetActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  max-width: 425px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: #536471;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    ${props => {
      switch(props.$type) {
        case 'reply':
          return `color: #1DA1F2;`;
        case 'retweet':
          return `color: #00BA7C;`;
        case 'like':
          return `color: #F91880;`;
        case 'views':
          return `color: #1DA1F2;`;
        case 'share':
          return `color: #1DA1F2;`;
        default:
          return `color: #1DA1F2;`;
      }
    }}
  }
`;

const ActionCount = styled.span`
  font-size: 13px;
`;

const PlaceholderText = styled.div`
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

export default function TwitterPostPreview({ data }) {
  if (!data) {
    return (
      <PreviewContainer>
        <PreviewHeader>Approximate Twitter/X Preview</PreviewHeader>
        <PlaceholderText>
          Start creating your tweet to see a preview
        </PlaceholderText>
      </PreviewContainer>
    );
  }

  const hasContent = data.caption || data.media?.length > 0;
  const charCount = data.caption?.length || 0;
  const isOverLimit = charCount > 280;

  const renderMedia = () => {
    if (!data.media || data.media.length === 0) return null;

    if (data.media.length === 1) {
      return (
        <MediaContainer>
          <SingleMedia src={data.media[0].url} alt="Tweet media" />
        </MediaContainer>
      );
    }

    if (data.media.length === 2) {
      return (
        <MediaContainer>
          <MediaGrid $count={2}>
            <GridImage src={data.media[0].url} alt="Media 1" />
            <GridImage src={data.media[1].url} alt="Media 2" />
          </MediaGrid>
        </MediaContainer>
      );
    }

    if (data.media.length === 3) {
      return (
        <MediaContainer>
          <MediaGrid $count={3}>
            <GridImage $span src={data.media[0].url} alt="Media 1" />
            <GridImage src={data.media[1].url} alt="Media 2" />
            <GridImage src={data.media[2].url} alt="Media 3" />
          </MediaGrid>
        </MediaContainer>
      );
    }

    // 4 images
    return (
      <MediaContainer>
        <MediaGrid $count={4}>
          {data.media.slice(0, 4).map((media, index) => (
            <GridImage key={index} src={media.url} alt={`Media ${index + 1}`} />
          ))}
        </MediaGrid>
      </MediaContainer>
    );
  };

  return (
    <PreviewContainer>
      <PreviewHeader>Approximate Twitter/X Preview</PreviewHeader>

      {hasContent ? (
        <TweetCard>
          <TweetHeader>
            <Avatar>X</Avatar>
            <TweetMain>
              <TweetInfo>
                <UserInfo>
                  <DisplayName>Your Name</DisplayName>
                  <Username>@username</Username>
                  <Timestamp>· now</Timestamp>
                </UserInfo>
                <MoreButton>
                  <MoreHorizontal size={18} />
                </MoreButton>
              </TweetInfo>

              {data.caption && (
                <>
                  <TweetText>{data.caption}</TweetText>
                  <CharacterCount $over={isOverLimit}>
                    {charCount}/280
                  </CharacterCount>
                </>
              )}

              {renderMedia()}

              <TweetActions>
                <ActionButton $type="reply">
                  <MessageCircle />
                  <ActionCount>0</ActionCount>
                </ActionButton>
                <ActionButton $type="retweet">
                  <Repeat2 />
                  <ActionCount>0</ActionCount>
                </ActionButton>
                <ActionButton $type="like">
                  <Heart />
                  <ActionCount>0</ActionCount>
                </ActionButton>
                <ActionButton $type="views">
                  <BarChart2 />
                  <ActionCount>0</ActionCount>
                </ActionButton>
                <ActionButton $type="share">
                  <Share />
                </ActionButton>
              </TweetActions>
            </TweetMain>
          </TweetHeader>
        </TweetCard>
      ) : (
        <PlaceholderText>
          Add text or media to see tweet preview
        </PlaceholderText>
      )}
    </PreviewContainer>
  );
}
