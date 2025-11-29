/**
 * Instagram Post Preview
 *
 * Supports both Feed posts and Reels previews
 */

'use client';

import styled from 'styled-components';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play } from 'lucide-react';

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

// Feed Post Styles
const FeedPost = styled.div`
  background: white;
  max-width: 100%;
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  border: 2px solid transparent;
  background-clip: padding-box;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.xs};
  flex-shrink: 0;
`;

const Username = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
`;

const MoreButton = styled.button`
  background: transparent;
  border: none;
  color: #262626;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
`;

const MediaContainer = styled.div`
  position: relative;
  width: 100%;
  background: #000;
`;

const MediaImage = styled.img`
  width: 100%;
  display: block;
  aspect-ratio: 1;
  object-fit: cover;
`;

const CarouselIndicator = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 16px;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: #262626;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const BookmarkButton = styled(ActionButton)`
  margin-left: auto;
`;

const Likes = styled.div`
  padding: 0 16px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
`;

const Caption = styled.div`
  padding: 0 16px 8px;
  font-size: 14px;
  color: #262626;
  line-height: 1.4;
`;

const CaptionUsername = styled.span`
  font-weight: 600;
  margin-right: 6px;
`;

const CaptionText = styled.span`
  white-space: pre-wrap;
  word-wrap: break-word;

  ${props => props.$truncated && `
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `}
`;

const SeeMore = styled.span`
  color: #8e8e8e;
  cursor: pointer;
`;

const FirstComment = styled.div`
  padding: 0 16px 8px;
  font-size: 14px;
  color: #262626;
`;

const Timestamp = styled.div`
  padding: 0 16px 12px;
  font-size: 10px;
  color: #8e8e8e;
  text-transform: uppercase;
  letter-spacing: 0.2px;
`;

// Reel Styles
const ReelContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  background: #000;
  overflow: hidden;
  max-height: 600px;
`;

const ReelVideo = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #1a1a1a 25%, #2a2a2a 25%, #2a2a2a 50%, #1a1a1a 50%, #1a1a1a 75%, #2a2a2a 75%, #2a2a2a);
  background-size: 20px 20px;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ReelPlayIcon = styled.div`
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 32px;
    height: 32px;
  }
`;

const ReelSidebar = styled.div`
  position: absolute;
  right: 12px;
  bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ReelAction = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;

  svg {
    width: 24px;
    height: 24px;
    margin-bottom: 4px;
  }
`;

const ReelActionCount = styled.div`
  font-size: 12px;
  font-weight: 600;
`;

const ReelCaption = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
`;

const ReelUsername = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FollowButton = styled.button`
  background: transparent;
  border: 1px solid white;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const ReelCaptionText = styled.div`
  font-size: 13px;
  line-height: 1.4;
  max-height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const PlaceholderText = styled.div`
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

export default function InstagramPostPreview({ data }) {
  if (!data) {
    return (
      <PreviewContainer>
        <PreviewHeader>Approximate Instagram Preview</PreviewHeader>
        <PlaceholderText>
          Start creating your post to see a preview
        </PlaceholderText>
      </PreviewContainer>
    );
  }

  const isReel = data.placementType === 'reel';
  const hasContent = data.caption || data.media?.length > 0;
  const shouldTruncate = data.caption && data.caption.length > 125;

  if (isReel) {
    return (
      <PreviewContainer>
        <PreviewHeader>Approximate Instagram Reel Preview</PreviewHeader>

        {data.media && data.media.length > 0 ? (
          <ReelContainer>
            <ReelVideo>
              <img src={data.coverThumbnail || data.media[0].url} alt="Reel" />
              <ReelPlayIcon>
                <Play fill="white" />
              </ReelPlayIcon>
            </ReelVideo>

            {/* Reel Actions */}
            <ReelSidebar>
              <ReelAction>
                <Heart />
                <ReelActionCount>0</ReelActionCount>
              </ReelAction>
              <ReelAction>
                <MessageCircle />
                <ReelActionCount>0</ReelActionCount>
              </ReelAction>
              <ReelAction>
                <Send />
              </ReelAction>
              <ReelAction>
                <MoreHorizontal />
              </ReelAction>
            </ReelSidebar>

            {/* Reel Caption */}
            <ReelCaption>
              <ReelUsername>
                your_username
                <FollowButton>Follow</FollowButton>
              </ReelUsername>
              {data.caption && (
                <ReelCaptionText>{data.caption}</ReelCaptionText>
              )}
            </ReelCaption>
          </ReelContainer>
        ) : (
          <PlaceholderText>
            Add video to see Reel preview
          </PlaceholderText>
        )}
      </PreviewContainer>
    );
  }

  // Feed Post Preview
  return (
    <PreviewContainer>
      <PreviewHeader>Approximate Instagram Feed Preview</PreviewHeader>

      {hasContent ? (
        <FeedPost>
          {/* Post Header */}
          <PostHeader>
            <Avatar>IG</Avatar>
            <Username>your_username</Username>
            <MoreButton>
              <MoreHorizontal size={20} />
            </MoreButton>
          </PostHeader>

          {/* Media */}
          {data.media && data.media.length > 0 && (
            <MediaContainer>
              <MediaImage src={data.media[0].url} alt="Post" />
              {data.media.length > 1 && (
                <CarouselIndicator>
                  1/{data.media.length}
                </CarouselIndicator>
              )}
            </MediaContainer>
          )}

          {/* Actions */}
          <Actions>
            <ActionButton>
              <Heart />
            </ActionButton>
            <ActionButton>
              <MessageCircle />
            </ActionButton>
            <ActionButton>
              <Send />
            </ActionButton>
            <BookmarkButton>
              <Bookmark />
            </BookmarkButton>
          </Actions>

          {/* Likes */}
          <Likes>0 likes</Likes>

          {/* Caption */}
          {data.caption && (
            <Caption>
              <CaptionUsername>your_username</CaptionUsername>
              <CaptionText $truncated={shouldTruncate}>
                {data.caption}
                {shouldTruncate && (
                  <>
                    {' '}
                    <SeeMore>more</SeeMore>
                  </>
                )}
              </CaptionText>
            </Caption>
          )}

          {/* First Comment */}
          {data.firstComment && (
            <FirstComment>
              <CaptionUsername>your_username</CaptionUsername>
              {data.firstComment}
            </FirstComment>
          )}

          {/* Timestamp */}
          <Timestamp>Just now</Timestamp>
        </FeedPost>
      ) : (
        <PlaceholderText>
          Add media and caption to see preview
        </PlaceholderText>
      )}
    </PreviewContainer>
  );
}
