/**
 * Create/Publish Post Page
 *
 * Comprehensive post creation and publishing interface for all platforms
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Send,
  Calendar,
  Image as ImageIcon,
  Video,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Upload,
  Clock,
} from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useRouter } from 'next/navigation';
import { showToast } from '@/components/ui/Toast';
import { validateMultiplePlatforms } from '@/lib/validation/platform-validation';
import { PLATFORM_CONFIG } from '@/lib/config/platforms';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.base};
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const Card = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const CardTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: inherit;
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background.default};
  resize: vertical;
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.main}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const CharacterCount = styled.div`
  text-align: right;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.$exceeded ? props.theme.colors.error.main : props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing.xs};
  font-weight: ${props => props.$exceeded ? props.theme.typography.fontWeight.semibold : 'normal'};
`;

const PlatformSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const PlatformCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.lg};
  border: 2px solid ${props => props.$selected ? props.$color : props.theme.colors.neutral[200]};
  background: ${props => props.$selected ? `${props.$color}10` : props.theme.colors.background.default};
  border-radius: ${props => props.theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.$color};
    background: ${props => `${props.$color}05`};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PlatformIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const PlatformName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const MediaUploadArea = styled.div`
  border: 2px dashed ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  background: ${props => props.theme.colors.neutral[50]};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.primary.light}10;
  }
`;

const MediaList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

const MediaItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  background: ${props => props.theme.colors.neutral[100]};
  border: 1px solid ${props => props.theme.colors.neutral[200]};

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveMediaBtn = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing.xs};
  right: ${props => props.theme.spacing.xs};
  width: 28px;
  height: 28px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.error.main};
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.error.dark};
    transform: scale(1.1);
  }
`;

const ValidationSection = styled.div`
  background: ${props => props.$hasErrors
    ? props.theme.colors.error.light + '20'
    : props.theme.colors.success.light + '20'
  };
  border: 2px solid ${props => props.$hasErrors
    ? props.theme.colors.error.main
    : props.theme.colors.success.main
  };
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.md};
`;

const ValidationItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} 0;
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const ValidationIcon = styled.div`
  color: ${props => props.$isError ? props.theme.colors.error.main : props.theme.colors.success.main};
  flex-shrink: 0;
`;

const ValidationText = styled.div`
  flex: 1;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
`;

const PublishButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const Button = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.base};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  border: none;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary.main}, ${props => props.theme.colors.primary.dark});
  color: white;
  box-shadow: ${props => props.theme.shadows.md};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(Button)`
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};
  border: 2px solid ${props => props.theme.colors.neutral[300]};

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.primary.main};
    color: ${props => props.theme.colors.primary.main};
  }
`;

const ScheduleInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background.default};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.main}20;
  }
`;

const getPlatformIcon = (platform) => {
  switch (platform.toLowerCase()) {
    case 'instagram': return <Instagram />;
    case 'facebook': return <Facebook />;
    case 'linkedin': return <Linkedin />;
    case 'twitter': return <Twitter />;
    case 'youtube': return <Youtube />;
    case 'tiktok': return <Video />;
    default: return null;
  }
};

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export default function CreatePostPage() {
  const { currentWorkspace } = useWorkspace();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [media, setMedia] = useState([]);
  const [scheduledFor, setScheduledFor] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [validation, setValidation] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      fetchConnectedAccounts();
    }
  }, [currentWorkspace]);

  useEffect(() => {
    if (selectedPlatforms.length > 0 && content) {
      const validationResult = validateMultiplePlatforms(selectedPlatforms, content, media);
      setValidation(validationResult);
    } else {
      setValidation(null);
    }
  }, [content, selectedPlatforms, media]);

  const fetchConnectedAccounts = async () => {
    try {
      const response = await fetch(`/api/social-accounts?workspace_id=${currentWorkspace.id}`);
      if (response.ok) {
        const data = await response.json();
        setConnectedAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMedia(prev => [...prev, {
          url: event.target.result,
          type: file.type.startsWith('video') ? 'video' : 'image',
          file,
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async (scheduled = false) => {
    if (!currentWorkspace) {
      showToast.error('No workspace selected');
      return;
    }

    if (selectedPlatforms.length === 0) {
      showToast.error('Please select at least one platform');
      return;
    }

    if (!content && media.length === 0) {
      showToast.error('Please add content or media');
      return;
    }

    if (validation && !validation.isValid) {
      showToast.error('Please fix validation errors before publishing');
      return;
    }

    setIsPublishing(true);

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
          content,
          platforms: selectedPlatforms,
          media,
          scheduledFor: scheduled ? scheduledFor || null : null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (scheduled) {
          showToast.success('Post scheduled successfully!');
        } else {
          showToast.success(`Published successfully to ${data.summary.successful} platform(s)!`);
        }
        router.push('/dashboard/content');
      } else {
        showToast.error(data.error || 'Failed to publish post');
      }
    } catch (error) {
      console.error('Publish error:', error);
      showToast.error('An error occurred while publishing');
    } finally {
      setIsPublishing(false);
    }
  };

  const availablePlatforms = ['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'youtube'];
  const maxLength = selectedPlatforms.length > 0
    ? Math.min(...selectedPlatforms.map(p => PLATFORM_CONFIG[p]?.maxLength || 5000))
    : 5000;

  return (
    <Container>
      <Header>
        <Title>Create New Post</Title>
        <Subtitle>Compose and publish content to multiple social media platforms</Subtitle>
      </Header>

      <MainContent>
        <LeftColumn>
          {/* Content Card */}
          <Card>
            <CardTitle>
              <Send size={20} />
              Post Content
            </CardTitle>
            <TextArea
              placeholder="What's on your mind? Write your post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={maxLength}
            />
            <CharacterCount $exceeded={content.length > maxLength}>
              {content.length} / {maxLength} characters
              {selectedPlatforms.length > 0 && ` (${selectedPlatforms.join(', ')})`}
            </CharacterCount>
          </Card>

          {/* Media Upload Card */}
          <Card>
            <CardTitle>
              <ImageIcon size={20} />
              Media Upload
            </CardTitle>
            <input
              type="file"
              id="media-upload"
              accept="image/*,video/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleMediaUpload}
            />
            <MediaUploadArea onClick={() => document.getElementById('media-upload').click()}>
              <Upload size={32} style={{ margin: '0 auto 8px' }} />
              <div>Click to upload images or videos</div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                Supports multiple files
              </div>
            </MediaUploadArea>

            {media.length > 0 && (
              <MediaList>
                {media.map((item, index) => (
                  <MediaItem key={index}>
                    {item.type === 'video' ? (
                      <video src={item.url} />
                    ) : (
                      <img src={item.url} alt={`Media ${index + 1}`} />
                    )}
                    <RemoveMediaBtn onClick={() => removeMedia(index)}>
                      <X size={16} />
                    </RemoveMediaBtn>
                  </MediaItem>
                ))}
              </MediaList>
            )}
          </Card>
        </LeftColumn>

        <RightColumn>
          {/* Platform Selection Card */}
          <Card>
            <CardTitle>Select Platforms</CardTitle>
            <PlatformSelector>
              {availablePlatforms.map(platform => {
                const config = PLATFORM_CONFIG[platform];
                const isConnected = connectedAccounts.some(acc => acc.platform === platform && acc.is_active);

                return (
                  <PlatformCard
                    key={platform}
                    $selected={selectedPlatforms.includes(platform)}
                    $color={config.color}
                    onClick={() => togglePlatform(platform)}
                    disabled={!isConnected}
                  >
                    <PlatformIcon $color={config.color}>
                      {platform === 'tiktok' ? <TikTokIcon /> : getPlatformIcon(platform)}
                    </PlatformIcon>
                    <PlatformName>{config.name}</PlatformName>
                    {!isConnected && (
                      <div style={{ fontSize: '10px', color: '#999' }}>Not connected</div>
                    )}
                  </PlatformCard>
                );
              })}
            </PlatformSelector>
          </Card>

          {/* Validation Card */}
          {validation && (
            <Card>
              <CardTitle>
                {validation.isValid ? <CheckCircle size={20} color="#10B981" /> : <AlertCircle size={20} color="#EF4444" />}
                Validation
              </CardTitle>
              <ValidationSection $hasErrors={!validation.isValid}>
                {validation.isValid ? (
                  <ValidationItem>
                    <ValidationIcon><CheckCircle size={18} /></ValidationIcon>
                    <ValidationText>All platforms validated successfully!</ValidationText>
                  </ValidationItem>
                ) : (
                  validation.allErrors.map((error, index) => (
                    <div key={index} style={{ marginBottom: '12px' }}>
                      <strong style={{ textTransform: 'capitalize', display: 'block', marginBottom: '4px' }}>
                        {PLATFORM_CONFIG[error.platform]?.name || error.platform}
                      </strong>
                      {error.errors.map((err, i) => (
                        <ValidationItem key={i}>
                          <ValidationIcon $isError><AlertCircle size={16} /></ValidationIcon>
                          <ValidationText>{err}</ValidationText>
                        </ValidationItem>
                      ))}
                    </div>
                  ))
                )}
              </ValidationSection>
            </Card>
          )}

          {/* Schedule Card */}
          <Card>
            <CardTitle>
              <Clock size={20} />
              Schedule (Optional)
            </CardTitle>
            <ScheduleInput
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </Card>

          {/* Publish Buttons */}
          <Card>
            <PublishButtons>
              <PrimaryButton
                onClick={() => handlePublish(false)}
                disabled={isPublishing || !validation?.isValid || selectedPlatforms.length === 0}
              >
                {isPublishing ? (
                  <>
                    <Loader size={20} className="spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Publish Now
                  </>
                )}
              </PrimaryButton>

              {scheduledFor && (
                <SecondaryButton
                  onClick={() => handlePublish(true)}
                  disabled={isPublishing || !validation?.isValid || selectedPlatforms.length === 0}
                >
                  <Calendar size={20} />
                  Schedule
                </SecondaryButton>
              )}
            </PublishButtons>
          </Card>
        </RightColumn>
      </MainContent>
    </Container>
  );
}
