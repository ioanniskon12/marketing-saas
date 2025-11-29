/**
 * LinkedIn Post Preview
 *
 * Mimics how a post will look on LinkedIn's feed
 */

'use client';

import styled from 'styled-components';
import { MoreHorizontal, ThumbsUp, MessageCircle, Repeat2, Send } from 'lucide-react';

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

const PostCard = styled.div`
  background: white;
`;

const PostHeader = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  gap: 8px;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(135deg, #0A66C2 0%, #004182 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.base};
  flex-shrink: 0;
`;

const PostInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const Name = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  margin-bottom: 2px;
`;

const Headline = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 4px;
`;

const PostMeta = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MoreButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  padding: 4px;
`;

const PostContent = styled.div`
  padding: 0 16px 8px;
`;

const Caption = styled.div`
  font-size: 14px;
  color: rgba(0, 0, 0, 0.9);
  line-height: 1.5;
  margin-bottom: ${props => props.theme.spacing.sm};
  white-space: pre-wrap;
  word-wrap: break-word;

  ${props => props.$truncated && `
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `}
`;

const SeeMore = styled.span`
  color: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
    color: #0A66C2;
  }
`;

const MediaContainer = styled.div`
  margin-top: ${props => props.theme.spacing.sm};
`;

const MediaImage = styled.img`
  width: 100%;
  display: block;
  max-height: 400px;
  object-fit: cover;
`;

const LinkPreview = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.15);
  }
`;

const LinkImage = styled.div`
  width: 100%;
  height: 180px;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.4);
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const LinkInfo = styled.div`
  padding: 12px;
`;

const LinkTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  margin-bottom: 4px;
  line-height: 1.4;
`;

const LinkDomain = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
`;

const PostStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
`;

const PostActions = styled.div`
  display: flex;
  padding: 4px 8px;
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: transparent;
  border: none;
  border-radius: 2px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
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

export default function LinkedInPostPreview({ data }) {
  if (!data) {
    return (
      <PreviewContainer>
        <PreviewHeader>Approximate LinkedIn Feed Preview</PreviewHeader>
        <PlaceholderText>
          Start creating your post to see a preview
        </PlaceholderText>
      </PreviewContainer>
    );
  }

  const hasContent = data.caption || data.media?.length > 0 || data.linkUrl;
  const shouldTruncate = data.caption && data.caption.length > 210;

  return (
    <PreviewContainer>
      <PreviewHeader>Approximate LinkedIn Feed Preview</PreviewHeader>

      <PostCard>
        {/* Post Header */}
        <PostHeader>
          <Avatar>LI</Avatar>
          <PostInfo>
            <Name>Your Name</Name>
            <Headline>Your Professional Headline</Headline>
            <PostMeta>
              <span>Just now</span>
              <span>•</span>
              <span>🌐</span>
            </PostMeta>
          </PostInfo>
          <MoreButton>
            <MoreHorizontal size={20} />
          </MoreButton>
        </PostHeader>

        {/* Post Content */}
        {hasContent ? (
          <>
            <PostContent>
              {/* Caption */}
              {data.caption && (
                <Caption $truncated={shouldTruncate}>
                  {data.caption}
                  {shouldTruncate && (
                    <>
                      {' '}
                      <SeeMore>...see more</SeeMore>
                    </>
                  )}
                </Caption>
              )}

              {/* Media */}
              {data.media && data.media.length > 0 && (
                <MediaContainer>
                  <MediaImage src={data.media[0].url} alt="Post media" />
                </MediaContainer>
              )}

              {/* Link Preview */}
              {data.linkUrl && (
                <LinkPreview>
                  <LinkImage>
                    {data.linkPreview?.image ? (
                      <img
                        src={data.linkPreview.image}
                        alt="Link preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      'Link Preview'
                    )}
                  </LinkImage>
                  <LinkInfo>
                    <LinkTitle>
                      {data.linkPreview?.title || data.linkUrl}
                    </LinkTitle>
                    <LinkDomain>
                      {new URL(data.linkUrl).hostname}
                    </LinkDomain>
                  </LinkInfo>
                </LinkPreview>
              )}
            </PostContent>

            {/* Stats */}
            <PostStats>
              <span>0 reactions</span>
              <span>0 comments</span>
            </PostStats>

            {/* Actions */}
            <PostActions>
              <ActionButton>
                <ThumbsUp />
                Like
              </ActionButton>
              <ActionButton>
                <MessageCircle />
                Comment
              </ActionButton>
              <ActionButton>
                <Repeat2 />
                Repost
              </ActionButton>
              <ActionButton>
                <Send />
                Send
              </ActionButton>
            </PostActions>
          </>
        ) : (
          <PlaceholderText>
            Add caption or media to see preview
          </PlaceholderText>
        )}
      </PostCard>
    </PreviewContainer>
  );
}
