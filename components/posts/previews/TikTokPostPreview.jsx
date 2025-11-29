/**
 * TikTok Post Preview
 *
 * Mimics how a video will look on TikTok
 */

'use client';

import styled from 'styled-components';
import { Heart, MessageCircle, Share, Bookmark, Music2, Play } from 'lucide-react';

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

const PhoneFrame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  background: #000;
  overflow: hidden;
  max-height: 600px;
`;

const VideoContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #0a0a0a 25%, #1a1a1a 25%, #1a1a1a 50%, #0a0a0a 50%, #0a0a0a 75%, #1a1a1a 75%, #1a1a1a);
  background-size: 20px 20px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlayButton = styled.div`
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;

  svg {
    width: 32px;
    height: 32px;
    margin-left: 4px;
  }
`;

const Sidebar = styled.div`
  position: absolute;
  right: 12px;
  bottom: 100px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 10;
`;

const SidebarButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  cursor: pointer;
`;

const SidebarIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$profile ? 'linear-gradient(135deg, #fe2c55 0%, #ff0050 100%)' : 'rgba(255, 255, 255, 0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  backdrop-filter: blur(10px);
  position: relative;

  svg {
    width: 24px;
    height: 24px;
  }

  ${props => props.$profile && `
    &::after {
      content: '+';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 20px;
      background: #fe2c55;
      border: 2px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
    }
  `}
`;

const SidebarCount = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const MusicIcon = styled(SidebarIcon)`
  animation: spin 3s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const BottomInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 60px;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  z-index: 5;
`;

const Username = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const Caption = styled.div`
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 8px;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const SoundInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);

  svg {
    width: 14px;
    height: 14px;
  }
`;

const PlaceholderText = styled.div`
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

export default function TikTokPostPreview({ data }) {
  if (!data) {
    return (
      <PreviewContainer>
        <PreviewHeader>Approximate TikTok Preview</PreviewHeader>
        <PlaceholderText>
          Start creating your video to see a preview
        </PlaceholderText>
      </PreviewContainer>
    );
  }

  const hasVideo = data.video || (data.media && data.media.length > 0);

  return (
    <PreviewContainer>
      <PreviewHeader>Approximate TikTok Preview</PreviewHeader>

      {hasVideo ? (
        <PhoneFrame>
          <VideoContainer>
            <img
              src={data.coverFrame || data.video?.url || data.media?.[0]?.url}
              alt="TikTok video"
            />
            <PlayButton>
              <Play fill="currentColor" />
            </PlayButton>
          </VideoContainer>

          {/* Sidebar Actions */}
          <Sidebar>
            <SidebarButton>
              <SidebarIcon $profile>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#fe2c55'
                }}>
                  U
                </div>
              </SidebarIcon>
            </SidebarButton>

            <SidebarButton>
              <SidebarIcon>
                <Heart />
              </SidebarIcon>
              <SidebarCount>0</SidebarCount>
            </SidebarButton>

            <SidebarButton>
              <SidebarIcon>
                <MessageCircle />
              </SidebarIcon>
              <SidebarCount>0</SidebarCount>
            </SidebarButton>

            <SidebarButton>
              <SidebarIcon>
                <Bookmark />
              </SidebarIcon>
              <SidebarCount>0</SidebarCount>
            </SidebarButton>

            <SidebarButton>
              <SidebarIcon>
                <Share />
              </SidebarIcon>
              <SidebarCount>0</SidebarCount>
            </SidebarButton>

            {data.sound && (
              <SidebarButton>
                <MusicIcon>
                  <Music2 />
                </MusicIcon>
              </SidebarButton>
            )}
          </Sidebar>

          {/* Bottom Info */}
          <BottomInfo>
            <Username>@your_username</Username>
            {data.caption && (
              <Caption>{data.caption}</Caption>
            )}
            <SoundInfo>
              <Music2 />
              {data.sound || 'Original sound - your_username'}
            </SoundInfo>
          </BottomInfo>
        </PhoneFrame>
      ) : (
        <PlaceholderText>
          Add video to see TikTok preview
        </PlaceholderText>
      )}
    </PreviewContainer>
  );
}
