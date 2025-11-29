/**
 * YouTube Post Preview
 *
 * Mimics how a video will look on YouTube
 */

'use client';

import styled from 'styled-components';
import { Play, ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Bell } from 'lucide-react';

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

const VideoCard = styled.div`
  background: white;
`;

const ThumbnailContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  overflow: hidden;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ThumbnailPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #1a1a1a 25%, #2a2a2a 25%, #2a2a2a 50%, #1a1a1a 50%, #1a1a1a 75%, #2a2a2a 75%, #2a2a2a);
  background-size: 20px 20px;
  color: rgba(255, 255, 255, 0.3);
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const PlayOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }
`;

const PlayButton = styled.div`
  width: 68px;
  height: 48px;
  background: rgba(255, 0, 0, 0.9);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: background 0.2s;

  &:hover {
    background: rgb(255, 0, 0);
  }

  svg {
    width: 24px;
    height: 24px;
    margin-left: 2px;
  }
`;

const VideoInfo = styled.div`
  padding: 12px 16px;
`;

const VideoHeader = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const ChannelAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(135deg, #FF0000 0%, #cc0000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  flex-shrink: 0;
`;

const VideoDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const VideoTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: #0f0f0f;
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TitleCharCount = styled.div`
  font-size: 11px;
  color: ${props => props.$over ? '#cc0000' : '#606060'};
  margin-bottom: 8px;
`;

const VideoMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606060;
  margin-bottom: 8px;
`;

const ChannelInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChannelName = styled.span`
  font-size: 12px;
  color: #606060;
  font-weight: 500;
`;

const SubscribeButton = styled.button`
  background: #cc0000;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;

  &:hover {
    background: #b00000;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const VisibilityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background: ${props => {
    switch(props.$type) {
      case 'public': return '#065fd4';
      case 'unlisted': return '#606060';
      case 'private': return '#cc0000';
      default: return '#606060';
    }
  }};
  color: white;
  font-size: 11px;
  font-weight: 500;
  border-radius: 2px;
  margin-left: 8px;
`;

const Description = styled.div`
  font-size: 12px;
  color: #0f0f0f;
  line-height: 1.6;
  margin-top: 8px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 8px;
  max-height: 80px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
`;

const DescCharCount = styled.div`
  font-size: 11px;
  color: ${props => props.$over ? '#cc0000' : '#606060'};
  text-align: right;
  margin-top: 4px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-top: 1px solid #e5e5e5;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 18px;
  color: #0f0f0f;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f2f2f2;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const PlaceholderText = styled.div`
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

export default function YouTubePostPreview({ data }) {
  if (!data) {
    return (
      <PreviewContainer>
        <PreviewHeader>Approximate YouTube Preview</PreviewHeader>
        <PlaceholderText>
          Start creating your video to see a preview
        </PlaceholderText>
      </PreviewContainer>
    );
  }

  const hasVideo = data.video || (data.media && data.media.length > 0);
  const titleLength = data.title?.length || 0;
  const descLength = data.description?.length || 0;
  const titleOver = titleLength > 100;
  const descOver = descLength > 5000;

  return (
    <PreviewContainer>
      <PreviewHeader>Approximate YouTube Preview</PreviewHeader>

      {hasVideo || data.title ? (
        <VideoCard>
          {/* Thumbnail */}
          <ThumbnailContainer>
            {data.thumbnail || data.video ? (
              <>
                <Thumbnail
                  src={data.thumbnail?.url || data.video?.url}
                  alt="Video thumbnail"
                />
                <PlayOverlay>
                  <PlayButton>
                    <Play fill="white" />
                  </PlayButton>
                </PlayOverlay>
              </>
            ) : (
              <ThumbnailPlaceholder>
                No thumbnail
              </ThumbnailPlaceholder>
            )}
          </ThumbnailContainer>

          {/* Video Info */}
          <VideoInfo>
            <VideoHeader>
              <ChannelAvatar>YT</ChannelAvatar>
              <VideoDetails>
                {data.title ? (
                  <>
                    <VideoTitle>{data.title}</VideoTitle>
                    <TitleCharCount $over={titleOver}>
                      {titleLength}/100 characters
                    </TitleCharCount>
                  </>
                ) : (
                  <VideoTitle style={{ color: '#999' }}>
                    Add a title for your video
                  </VideoTitle>
                )}

                <VideoMeta>
                  <span>0 views</span>
                  <span>•</span>
                  <span>Just now</span>
                  {data.visibility && (
                    <VisibilityBadge $type={data.visibility}>
                      {data.visibility.toUpperCase()}
                    </VisibilityBadge>
                  )}
                </VideoMeta>

                <ChannelInfo>
                  <ChannelName>Your Channel</ChannelName>
                  <SubscribeButton>
                    <Bell />
                    Subscribe
                  </SubscribeButton>
                </ChannelInfo>
              </VideoDetails>
            </VideoHeader>

            {data.description && (
              <>
                <Description>{data.description}</Description>
                <DescCharCount $over={descOver}>
                  {descLength}/5000 characters
                </DescCharCount>
              </>
            )}
          </VideoInfo>

          {/* Actions */}
          <Actions>
            <ActionButton>
              <ThumbsUp />
              0
            </ActionButton>
            <ActionButton>
              <ThumbsDown />
            </ActionButton>
            <ActionButton>
              <Share2 />
              Share
            </ActionButton>
            <ActionButton>
              <MoreHorizontal />
            </ActionButton>
          </Actions>
        </VideoCard>
      ) : (
        <PlaceholderText>
          Add video and title to see YouTube preview
        </PlaceholderText>
      )}
    </PreviewContainer>
  );
}
