'use client';

import { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  X,
  Link2,
  Copy,
  Check,
  Calendar,
  Lock,
  Eye,
  Download,
  BarChart3,
  Clock,
  Image as ImageIcon,
  Video,
  Trash2,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Music,
  Youtube,
  CheckCircle,
  Share2
} from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${slideUp} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const HeaderTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    color: ${props => props.theme.colors.primary.main};
  }
`;

const AutoSaveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${props => props.$saved ? '#10b981' : props.theme.colors.text.tertiary};
  font-weight: 500;
  animation: ${fadeIn} 0.3s ease-out;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.secondary};
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background.hover};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const Section = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PostCount = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  background: ${props => props.theme.colors.background.elevated};
  padding: 2px 8px;
  border-radius: 12px;
`;

// Preview Section
const PreviewContainer = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: 12px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
`;

const DateGroup = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DateLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const PostPreviewCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border.default};
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

const PostThumbnail = styled.div`
  width: 100%;
  height: 80px;
  border-radius: 6px;
  background: ${props => props.theme.colors.background.elevated};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.tertiary};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    width: 20px;
    height: 20px;
    opacity: 0.5;
  }
`;

const PostInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const PostTitle = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const PostTime = styled.span`
  font-size: 10px;
  color: ${props => props.theme.colors.text.tertiary};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PlatformBadges = styled.div`
  display: flex;
  gap: 4px;
`;

const PlatformBadge = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 10px;
    height: 10px;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  background: ${props => props.theme.colors.background.paper};
  border: none;
  padding: 4px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.tertiary};
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  ${PostPreviewCard}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

// Form Section
const FormGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const DateRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 13px;
  color: ${props => props.theme.colors.text.primary};

  input {
    width: 16px;
    height: 16px;
    accent-color: ${props => props.theme.colors.primary.main};
  }
`;

const CheckboxDescription = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-left: 26px;
  margin-top: -8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

// Footer
const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.$variant === 'secondary' && `
    background: ${props.theme.colors.background.elevated};
    color: ${props.theme.colors.text.primary};
    border: 1px solid ${props.theme.colors.border.default};

    &:hover {
      background: ${props.theme.colors.background.hover};
    }
  `}

  ${props => props.$variant === 'primary' && `
    background: ${props.theme.colors.primary.main};
    color: white;
    border: none;

    &:hover {
      background: ${props.theme.colors.primary.dark};
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `}
`;

// Success State
const SuccessContent = styled.div`
  text-align: center;
  padding: 40px 24px;
`;

const SuccessIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
`;

const SuccessTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const SuccessText = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 24px;
`;

const ShareLinkBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${props => props.theme.colors.background.elevated};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 24px;
`;

const ShareLinkInput = styled.input`
  flex: 1;
  background: none;
  border: none;
  font-size: 13px;
  color: ${props => props.theme.colors.text.primary};
  outline: none;
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  background: ${props => props.$copied ? '#10B981' : props.theme.colors.primary.main};
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$copied ? '#059669' : props.theme.colors.primary.dark};
  }
`;

const PLATFORM_CONFIG = {
  facebook: { icon: Facebook, color: '#1877F2', label: 'Facebook' },
  instagram: { icon: Instagram, color: '#E4405F', label: 'Instagram' },
  linkedin: { icon: Linkedin, color: '#0A66C2', label: 'LinkedIn' },
  twitter: { icon: Twitter, color: '#1DA1F2', label: 'Twitter/X' },
  tiktok: { icon: Music, color: '#000000', label: 'TikTok' },
  youtube: { icon: Youtube, color: '#FF0000', label: 'YouTube' },
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const DRAFT_KEY = 'sharePlanDraft';

export default function SharePlanModal({ isOpen, onClose, selectedPosts = [], onRemovePost }) {
  const [step, setStep] = useState('form'); // 'form' or 'success'
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', or ''
  const saveTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientName: '',
    startDate: '',
    endDate: '',
    permission: 'view',
    allowDownload: false,
    showAnalytics: false,
    password: '',
    expiresIn: '7',
  });

  // Load draft on mount
  useEffect(() => {
    if (isOpen && isInitialMount.current) {
      try {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          setFormData(draft);
          console.log('Loaded draft from localStorage');
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
      isInitialMount.current = false;
    }
  }, [isOpen]);

  // Auto-save formData to localStorage
  useEffect(() => {
    if (!isOpen || isInitialMount.current) return;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');

    // Debounce save by 1 second
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
        setSaveStatus('saved');

        // Clear "saved" status after 2 seconds
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        console.error('Error saving draft:', error);
        setSaveStatus('');
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, isOpen]);

  if (!isOpen) return null;

  // Group posts by date
  const groupedPosts = selectedPosts.reduce((groups, post) => {
    const date = formatDate(post.scheduled_time || post.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(post);
    return groups;
  }, {});

  const handleSubmit = async () => {
    if (selectedPosts.length === 0 || !formData.title.trim()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate share link with mock token format
      const shareToken = 'share-' + Math.random().toString(36).substring(2, 12);
      setShareLink(`${window.location.origin}/share/plan/${shareToken}`);
      setStep('success');

      // Clear the draft from localStorage after successful submission
      localStorage.removeItem(DRAFT_KEY);
      setSaveStatus('');

      // Log plan details for demo purposes
      console.log('Plan Created:', {
        ...formData,
        postCount: selectedPosts.length,
        shareToken,
      });
    } catch (error) {
      console.error('Error creating share link:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      title: '',
      description: '',
      clientName: '',
      startDate: '',
      endDate: '',
      permission: 'view',
      allowDownload: false,
      showAnalytics: false,
      password: '',
      expiresIn: '7',
    });
    setCopied(false);
    setShareLink('');
    onClose();
  };

  const getPostThumbnail = (post) => {
    // Check post_media array first
    if (post.post_media && post.post_media.length > 0) {
      const firstMedia = post.post_media[0];
      if (firstMedia.media_type === 'video' || firstMedia.mime_type?.startsWith('video/')) {
        return firstMedia.thumbnail_url ?
          <img src={firstMedia.thumbnail_url} alt="" /> :
          <Video size={20} />;
      }
      if (firstMedia.file_url) {
        return <img src={firstMedia.file_url} alt="" />;
      }
    }

    // Fallback to media_urls
    if (post.media_urls && post.media_urls.length > 0) {
      const firstMedia = post.media_urls[0];
      if (firstMedia.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return <img src={firstMedia} alt="" />;
      }
      return <Video size={20} />;
    }

    return <ImageIcon size={20} />;
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderTitle>
            <Share2 size={20} />
            Share Plan
          </HeaderTitle>
          {step === 'form' && saveStatus && (
            <AutoSaveIndicator $saved={saveStatus === 'saved'}>
              {saveStatus === 'saving' ? (
                <>
                  <Clock size={14} />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  Draft saved
                </>
              )}
            </AutoSaveIndicator>
          )}
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        {step === 'form' ? (
          <>
            <ModalBody>
              {/* Preview Section */}
              <Section>
                <SectionTitle>
                  <Eye size={16} />
                  Plan Preview
                  <PostCount>{selectedPosts.length} posts</PostCount>
                </SectionTitle>
                <PreviewContainer>
                  {Object.entries(groupedPosts).map(([date, posts]) => (
                    <DateGroup key={date}>
                      <DateLabel>
                        <Calendar size={12} />
                        {date}
                      </DateLabel>
                      <PostsGrid>
                        {posts.map((post) => {
                          const platforms = post.platforms || [post.platform];
                          return (
                            <PostPreviewCard key={post.id}>
                              {onRemovePost && (
                                <RemoveButton onClick={() => onRemovePost(post.id)}>
                                  <Trash2 />
                                </RemoveButton>
                              )}
                              <PostThumbnail>
                                {getPostThumbnail(post)}
                              </PostThumbnail>
                              <PostInfo>
                                <PostTitle>
                                  {post.content?.substring(0, 50) || 'Untitled post'}
                                  {post.content?.length > 50 ? '...' : ''}
                                </PostTitle>
                                <PostMeta>
                                  <PostTime>
                                    <Clock size={10} />
                                    {formatTime(post.scheduled_time || post.created_at)}
                                  </PostTime>
                                  <PlatformBadges>
                                    {platforms.map((platform) => {
                                      const config = PLATFORM_CONFIG[platform];
                                      if (!config) return null;
                                      const Icon = config.icon;
                                      return (
                                        <PlatformBadge key={platform} $color={config.color}>
                                          <Icon />
                                        </PlatformBadge>
                                      );
                                    })}
                                  </PlatformBadges>
                                </PostMeta>
                              </PostInfo>
                            </PostPreviewCard>
                          );
                        })}
                      </PostsGrid>
                    </DateGroup>
                  ))}
                  {selectedPosts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>
                      No posts selected
                    </div>
                  )}
                </PreviewContainer>
              </Section>

              {/* Form Section */}
              <Section>
                <SectionTitle>
                  <Link2 size={16} />
                  Share Settings
                </SectionTitle>
                <FormGrid>
                  <FormGroup>
                    <Label>Plan Title</Label>
                    <Input
                      type="text"
                      placeholder="e.g., Q1 Social Media Plan"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Client Name (optional)</Label>
                    <Input
                      type="text"
                      placeholder="e.g., Acme Corporation"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Description (optional)</Label>
                    <TextArea
                      placeholder="Add a description for your shared plan..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </FormGroup>

                  <DateRow>
                    <FormGroup>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </FormGroup>
                  </DateRow>

                  <FormGroup>
                    <Label>Permission Level</Label>
                    <Select
                      value={formData.permission}
                      onChange={(e) => setFormData({ ...formData, permission: e.target.value })}
                    >
                      <option value="view">View Only</option>
                      <option value="comment">Can Comment</option>
                    </Select>
                  </FormGroup>

                  <CheckboxGroup>
                    <div>
                      <CheckboxLabel>
                        <input
                          type="checkbox"
                          checked={formData.allowDownload}
                          onChange={(e) => setFormData({ ...formData, allowDownload: e.target.checked })}
                        />
                        <Download size={14} />
                        Allow downloads
                      </CheckboxLabel>
                      <CheckboxDescription>Recipients can download media files</CheckboxDescription>
                    </div>
                    <div>
                      <CheckboxLabel>
                        <input
                          type="checkbox"
                          checked={formData.showAnalytics}
                          onChange={(e) => setFormData({ ...formData, showAnalytics: e.target.checked })}
                        />
                        <BarChart3 size={14} />
                        Show analytics
                      </CheckboxLabel>
                      <CheckboxDescription>Include post performance metrics</CheckboxDescription>
                    </div>
                  </CheckboxGroup>

                  <FormGroup>
                    <Label>
                      <Lock size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
                      Password (optional)
                    </Label>
                    <Input
                      type="password"
                      placeholder="Set a password for extra security"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Link Expiration</Label>
                    <Select
                      value={formData.expiresIn}
                      onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })}
                    >
                      <option value="1">1 day</option>
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="never">Never</option>
                    </Select>
                  </FormGroup>
                </FormGrid>
              </Section>
            </ModalBody>

            <ModalFooter>
              <Button $variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                $variant="primary"
                onClick={handleSubmit}
                disabled={loading || selectedPosts.length === 0 || !formData.title.trim()}
              >
                {loading ? 'Creating...' : 'Create Share Link'}
              </Button>
            </ModalFooter>
          </>
        ) : (
          <SuccessContent>
            <SuccessIcon>
              <CheckCircle size={32} />
            </SuccessIcon>
            <SuccessTitle>Plan Shared Successfully!</SuccessTitle>
            <SuccessText>
              Your plan has been shared. Copy the link below to share it with others.
            </SuccessText>
            <ShareLinkBox>
              <ShareLinkInput
                type="text"
                value={shareLink}
                readOnly
              />
              <CopyButton onClick={handleCopy} $copied={copied}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </CopyButton>
            </ShareLinkBox>
            <Button $variant="secondary" onClick={handleClose}>
              Done
            </Button>
          </SuccessContent>
        )}
      </ModalContent>
    </ModalOverlay>
  );
}
