/**
 * Facebook Post Preview
 *
 * Mimics how a post will look on Facebook's feed
 */

'use client';

import styled from 'styled-components';
import { Globe, MoreHorizontal, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';

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
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  gap: ${props => props.theme.spacing.sm};
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(135deg, #1877F2 0%, #0d5dbf 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  flex-shrink: 0;
`;

const PostInfo = styled.div`
  flex: 1;
`;

const PageName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: #050505;
  margin-bottom: 2px;
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: #65676B;
`;

const MoreButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #65676B;

  &:hover {
    background: #F2F3F5;
  }
`;

const PostContent = styled.div`
  padding: 0 ${props => props.theme.spacing.md} ${props => props.theme.spacing.md};
`;

const Caption = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: #050505;
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
  color: #65676B;
  cursor: pointer;
  font-weight: ${props => props.theme.typography.fontWeight.medium};

  &:hover {
    text-decoration: underline;
  }
`;

const MediaContainer = styled.div`
  margin-top: ${props => props.theme.spacing.sm};
  background: #000;
  position: relative;
`;

const MediaImage = styled.img`
  width: 100%;
  display: block;
  max-height: 500px;
  object-fit: contain;
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  background: #000;
`;

const GridImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
`;

const MoreMediaOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const LinkPreview = styled.div`
  border: 1px solid ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  margin-top: ${props => props.theme.spacing.sm};
`;

const LinkImage = styled.div`
  width: 100%;
  height: 200px;
  background: ${props => props.theme.colors.neutral[200]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.secondary};
`;

const LinkInfo = styled.div`
  padding: ${props => props.theme.spacing.sm};
  background: #F0F2F5;
`;

const LinkDomain = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: #65676B;
  text-transform: uppercase;
  margin-bottom: 2px;
`;

const LinkTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: #050505;
  margin-bottom: 2px;
`;

const PostActions = styled.div`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-top: 1px solid #E4E6EB;
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: ${props => props.theme.spacing.sm};
  background: transparent;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  color: #65676B;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;

  &:hover {
    background: #F2F3F5;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const PlaceholderText = styled.div`
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

export default function FacebookPostPreview({ data }) {
  if (!data) {
    return (
      <PreviewContainer>
        <PreviewHeader>Approximate Facebook Feed Preview</PreviewHeader>
        <PlaceholderText>
          Start creating your post to see a preview
        </PlaceholderText>
      </PreviewContainer>
    );
  }

  const hasContent = data.caption || data.media?.length > 0 || data.linkUrl;
  const shouldTruncate = data.caption && data.caption.length > 200;

  return (
    <PreviewContainer>
      <PreviewHeader>Approximate Facebook Feed Preview</PreviewHeader>

      <PostCard>
        {/* Post Header */}
        <PostHeader>
          <Avatar>FB</Avatar>
          <PostInfo>
            <PageName>Your Page</PageName>
            <PostMeta>
              <span>Just now</span>
              <span>·</span>
              <Globe size={12} />
            </PostMeta>
          </PostInfo>
          <MoreButton>
            <MoreHorizontal size={20} />
          </MoreButton>
        </PostHeader>

        {/* Post Content */}
        {hasContent ? (
          <PostContent>
            {/* Caption */}
            {data.caption && (
              <Caption $truncated={shouldTruncate}>
                {data.caption}
                {shouldTruncate && (
                  <>
                    {' '}
                    <SeeMore>... See more</SeeMore>
                  </>
                )}
              </Caption>
            )}

            {/* Media */}
            {data.media && data.media.length > 0 && (
              <MediaContainer>
                {data.media.length === 1 ? (
                  <MediaImage src={data.media[0].url} alt="Post media" />
                ) : data.media.length <= 4 ? (
                  <MediaGrid>
                    {data.media.slice(0, 4).map((media, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <GridImage src={media.url} alt={`Media ${index + 1}`} />
                        {index === 3 && data.media.length > 4 && (
                          <MoreMediaOverlay>
                            +{data.media.length - 4}
                          </MoreMediaOverlay>
                        )}
                      </div>
                    ))}
                  </MediaGrid>
                ) : (
                  <MediaGrid>
                    {data.media.slice(0, 3).map((media, index) => (
                      <GridImage key={index} src={media.url} alt={`Media ${index + 1}`} />
                    ))}
                    <div style={{ position: 'relative' }}>
                      <GridImage src={data.media[3].url} alt="Media 4" />
                      <MoreMediaOverlay>
                        +{data.media.length - 4}
                      </MoreMediaOverlay>
                    </div>
                  </MediaGrid>
                )}
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
                  <LinkDomain>
                    {new URL(data.linkUrl).hostname}
                  </LinkDomain>
                  <LinkTitle>
                    {data.linkPreview?.title || data.linkUrl}
                  </LinkTitle>
                </LinkInfo>
              </LinkPreview>
            )}
          </PostContent>
        ) : (
          <PlaceholderText>
            Add caption or media to see preview
          </PlaceholderText>
        )}

        {/* Post Actions */}
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
            <Share2 />
            Share
          </ActionButton>
        </PostActions>
      </PostCard>
    </PreviewContainer>
  );
}
