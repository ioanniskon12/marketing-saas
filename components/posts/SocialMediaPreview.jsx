/**
 * Social Media Preview Component
 *
 * Shows how a post will look on different social media platforms
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Instagram, Facebook, Linkedin, Twitter, ChevronLeft, ChevronRight } from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const PreviewCard = styled.div`
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  background: ${props => props.theme.colors.background.paper};
`;

const PlatformHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.$bgColor || props.theme.colors.neutral[50]};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const PlatformIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.$platform === 'instagram' ? '50%' : props.theme.borderRadius.md};
  background: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlatformInfo = styled.div`
  flex: 1;
`;

const PlatformName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const AccountName = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

const PostContent = styled.div`
  padding: ${props => props.theme.spacing.md};
`;

const PostText = styled.p`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: 1.5;
  margin-bottom: ${props => props.theme.spacing.sm};
  white-space: pre-wrap;
`;

const PostImage = styled.div`
  width: 100%;
  aspect-ratio: ${props => props.$platform === 'instagram' ? '1' : '16/9'};
  background: ${props => props.theme.colors.neutral[100]};
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.md};
  position: relative;

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CarouselNavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.$direction === 'left' ? 'left: 8px;' : 'right: 8px;'}
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background.paper};
    transform: translateY(-50%) scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const CarouselIndicators = styled.div`
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
`;

const CarouselDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  transition: all 0.2s;
`;

const CarouselCounter = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
`;

const Hashtags = styled.div`
  color: ${props => props.$platform === 'instagram' ? '#0095f6' : props.$platform === 'twitter' ? '#1da1f2' : props.theme.colors.primary.main};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-top: ${props => props.theme.spacing.sm};
`;

const NoImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.neutral[100]};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
`;

const TwitterText = styled(PostText)`
  color: #14171a;
`;

const InstagramText = styled(PostText)`
  color: #262626;
`;

const LinkedInText = styled(PostText)`
  color: rgba(0,0,0,0.9);
`;

const FacebookText = styled(PostText)`
  color: #050505;
`;

export default function SocialMediaPreview({ platforms, content, media, hashtags, accounts }) {
  // Track current image index for each platform's carousel
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  const handlePrevImage = (platformId) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [platformId]: Math.max(0, (prev[platformId] || 0) - 1)
    }));
  };

  const handleNextImage = (platformId) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [platformId]: Math.min(media.length - 1, (prev[platformId] || 0) + 1)
    }));
  };

  const getPlatformConfig = (platform) => {
    switch (platform) {
      case 'instagram':
        return {
          name: 'Instagram',
          color: '#E4405F',
          icon: <Instagram size={20} />,
          TextComponent: InstagramText,
        };
      case 'facebook':
        return {
          name: 'Facebook',
          color: '#1877F2',
          icon: <Facebook size={20} />,
          TextComponent: FacebookText,
        };
      case 'linkedin':
        return {
          name: 'LinkedIn',
          color: '#0A66C2',
          icon: <Linkedin size={20} />,
          TextComponent: LinkedInText,
        };
      case 'twitter':
        return {
          name: 'Twitter / X',
          color: '#1DA1F2',
          icon: <Twitter size={20} />,
          TextComponent: TwitterText,
        };
      default:
        return null;
    }
  };

  const getAccountName = (platform) => {
    const account = accounts?.find(acc => acc.platform === platform);
    return account?.account_name || 'Your Account';
  };

  const formatHashtags = (tags) => {
    if (!tags || tags.length === 0) return '';
    return tags.map(tag => `#${tag}`).join(' ');
  };

  const firstMedia = media && media.length > 0 ? media[0] : null;

  return (
    <Container>
      {platforms.map((platformId) => {
        const account = accounts?.find(acc => acc.id === platformId);
        if (!account) return null;

        const config = getPlatformConfig(account.platform);
        if (!config) return null;

        const { TextComponent } = config;
        const currentIndex = currentImageIndex[platformId] || 0;
        const currentMedia = media && media.length > 0 ? media[currentIndex] : null;
        const hasMultipleImages = media && media.length > 1;

        return (
          <PreviewCard key={platformId}>
            <PlatformHeader $bgColor={account.platform === 'instagram' ? '#fafafa' : 'white'}>
              <PlatformIcon $color={config.color} $platform={account.platform}>
                {config.icon}
              </PlatformIcon>
              <PlatformInfo>
                <PlatformName>{config.name}</PlatformName>
                <AccountName>@{getAccountName(account.platform)}</AccountName>
              </PlatformInfo>
            </PlatformHeader>

            <PostContent>
              {content && (
                <TextComponent>{content}</TextComponent>
              )}

              {currentMedia && (
                <PostImage $platform={account.platform}>
                  {currentMedia.media_type === 'video' ? (
                    <video src={currentMedia.file_url} controls />
                  ) : (
                    <img src={currentMedia.file_url} alt="" />
                  )}

                  {/* Carousel Counter */}
                  {hasMultipleImages && (
                    <CarouselCounter>
                      {currentIndex + 1}/{media.length}
                    </CarouselCounter>
                  )}

                  {/* Carousel Navigation Buttons */}
                  {hasMultipleImages && (
                    <>
                      <CarouselNavButton
                        $direction="left"
                        onClick={() => handlePrevImage(platformId)}
                        disabled={currentIndex === 0}
                      >
                        <ChevronLeft size={20} />
                      </CarouselNavButton>
                      <CarouselNavButton
                        $direction="right"
                        onClick={() => handleNextImage(platformId)}
                        disabled={currentIndex === media.length - 1}
                      >
                        <ChevronRight size={20} />
                      </CarouselNavButton>
                    </>
                  )}

                  {/* Carousel Dots Indicator */}
                  {hasMultipleImages && (
                    <CarouselIndicators>
                      {media.map((_, index) => (
                        <CarouselDot key={index} $active={index === currentIndex} />
                      ))}
                    </CarouselIndicators>
                  )}
                </PostImage>
              )}

              {!currentMedia && (
                <PostImage $platform={account.platform}>
                  <NoImagePlaceholder>
                    No image
                  </NoImagePlaceholder>
                </PostImage>
              )}

              {hashtags && hashtags.length > 0 && (
                <Hashtags $platform={account.platform}>
                  {formatHashtags(hashtags)}
                </Hashtags>
              )}
            </PostContent>
          </PreviewCard>
        );
      })}

      {(!platforms || platforms.length === 0) && (
        <PreviewCard>
          <PostContent style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Select platforms to see preview
          </PostContent>
        </PreviewCard>
      )}
    </Container>
  );
}
