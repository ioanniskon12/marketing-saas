/**
 * Plans Feature Test Page
 *
 * Displays 3 mock plans with different platform combinations
 * to showcase the Plans UI before full implementation
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { mockPlans } from '@/lib/mockData/plans';
import { PlanWithPosts, Platform } from '@/types/plans';
import {
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ArrowLeft,
  ExternalLink,
  Play
} from 'lucide-react';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.neutral[900]};
  padding: ${props => props.theme.spacing['2xl']};
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing['2xl']};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text.secondary};
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing['2xl']};
`;

const PlanCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(139, 92, 246, 0.4);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
  }
`;

const PlanHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const PlanTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const PlanDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.5;
`;

const PlanMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  padding-bottom: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};

  svg {
    color: rgba(139, 92, 246, 0.8);
  }

  strong {
    color: ${props => props.theme.colors.text.primary};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
  }
`;

const PlatformRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
`;

const PlatformBadge = styled.div<{ $platform: Platform }>`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  background: ${props => {
    const colors = {
      instagram: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      facebook: '#1877F2',
      tiktok: '#000000',
      youtube: '#FF0000',
      linkedin: '#0A66C2',
      twitter: '#1DA1F2',
    };
    return colors[props.$platform] || '#666';
  }};
  color: white;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const StatusBadge = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  background: ${props => {
    switch (props.$status) {
      case 'sent_to_client': return 'rgba(59, 130, 246, 0.15)';
      case 'draft': return 'rgba(156, 163, 175, 0.15)';
      case 'partially_approved': return 'rgba(234, 179, 8, 0.15)';
      case 'fully_approved': return 'rgba(34, 197, 94, 0.15)';
      default: return 'rgba(156, 163, 175, 0.15)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'sent_to_client': return '#3B82F6';
      case 'draft': return '#9CA3AF';
      case 'partially_approved': return '#EAB308';
      case 'fully_approved': return '#22C55E';
      default: return '#9CA3AF';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$status) {
      case 'sent_to_client': return 'rgba(59, 130, 246, 0.3)';
      case 'draft': return 'rgba(156, 163, 175, 0.3)';
      case 'partially_approved': return 'rgba(234, 179, 8, 0.3)';
      case 'fully_approved': return 'rgba(34, 197, 94, 0.3)';
      default: return 'rgba(156, 163, 175, 0.3)';
    }
  }};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ViewButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: linear-gradient(135deg, rgba(139, 92, 246, 1), rgba(124, 58, 237, 1));
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};

  &:hover {
    background: linear-gradient(135deg, rgba(124, 58, 237, 1), rgba(109, 40, 217, 1));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const DetailView = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing['2xl']};
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.xl};
  padding-bottom: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  background: rgba(255, 255, 255, 0.05);
  color: ${props => props.theme.colors.text.primary};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(139, 92, 246, 0.4);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ShareLink = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.xl};

  svg {
    color: rgba(139, 92, 246, 1);
  }

  code {
    flex: 1;
    font-family: monospace;
    font-size: ${props => props.theme.typography.fontSize.sm};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const PostsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const PostCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const PostPlatform = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const PostCaption = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const PostMedia = styled.div`
  width: 100%;
  height: 200px;
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.md};
  background: rgba(0, 0, 0, 0.3);
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MediaOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
`;

const PlayButton = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);

  svg {
    color: white;
    margin-left: 4px;
  }
`;

const PostTypeLabel = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.sm};
  right: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getPlatformIcon = (platform: Platform) => {
  const iconProps = { size: 16 };
  switch (platform) {
    case 'instagram': return <Instagram {...iconProps} />;
    case 'facebook': return <Facebook {...iconProps} />;
    case 'youtube': return <Youtube {...iconProps} />;
    case 'linkedin': return <Linkedin {...iconProps} />;
    case 'twitter': return <Twitter {...iconProps} />;
    case 'tiktok': return <MessageCircle {...iconProps} />;
    default: return <FileText {...iconProps} />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'sent_to_client': return <Clock size={14} />;
    case 'draft': return <FileText size={14} />;
    case 'partially_approved': return <AlertCircle size={14} />;
    case 'fully_approved': return <CheckCircle2 size={14} />;
    default: return <FileText size={14} />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'sent_to_client': return 'Sent to Client';
    case 'draft': return 'Draft';
    case 'partially_approved': return 'Partially Approved';
    case 'fully_approved': return 'Fully Approved';
    default: return status;
  }
};

const getPlatformName = (platform: Platform) => {
  const names: Record<Platform, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    youtube: 'YouTube',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
    tiktok: 'TikTok',
  };
  return names[platform] || platform;
};

const getPostTypeLabel = (caption: string, platform: Platform, mediaType: string) => {
  const lowerCaption = caption.toLowerCase();

  // Detect from caption keywords
  if (lowerCaption.includes('reel')) return 'REEL';
  if (lowerCaption.includes('story')) return 'STORY';

  // Platform-specific defaults
  if (platform === 'youtube') return 'VIDEO';
  if (platform === 'tiktok') return 'TIKTOK';
  if (mediaType === 'video' && platform === 'instagram') return 'REEL';
  if (mediaType === 'video') return 'VIDEO';

  return null;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PlansTestPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanWithPosts | null>(null);

  // Get unique platforms from plan posts
  const getPlanPlatforms = (plan: PlanWithPosts): Platform[] => {
    const platforms = new Set<Platform>();
    plan.posts.forEach(post => platforms.add(post.platform));
    return Array.from(platforms);
  };

  if (selectedPlan) {
    const platforms = getPlanPlatforms(selectedPlan);

    return (
      <PageContainer>
        <DetailView>
          <DetailHeader>
            <div>
              <BackButton onClick={() => setSelectedPlan(null)}>
                <ArrowLeft />
                Back to Plans
              </BackButton>
            </div>
            <StatusBadge $status={selectedPlan.status}>
              {getStatusIcon(selectedPlan.status)}
              {getStatusLabel(selectedPlan.status)}
            </StatusBadge>
          </DetailHeader>

          <PlanHeader>
            <PlanTitle>{selectedPlan.title}</PlanTitle>
            <PlanDescription>{selectedPlan.description}</PlanDescription>
          </PlanHeader>

          <PlanMeta>
            <MetaItem>
              <FileText size={16} />
              <strong>{selectedPlan.posts.length}</strong> posts
            </MetaItem>
            <MetaItem>
              <Calendar size={16} />
              Expires: <strong>{selectedPlan.expires_at?.toLocaleDateString() || 'No expiration'}</strong>
            </MetaItem>
          </PlanMeta>

          <PlatformRow>
            {platforms.map(platform => (
              <PlatformBadge key={platform} $platform={platform}>
                {getPlatformIcon(platform)}
                {getPlatformName(platform)}
              </PlatformBadge>
            ))}
          </PlatformRow>

          <ShareLink>
            <ExternalLink size={16} />
            <code>https://yourapp.com/share/plan/{selectedPlan.share_token}</code>
          </ShareLink>

          <PostsList>
            {selectedPlan.posts.map(post => (
              <PostCard key={post.id}>
                <PostHeader>
                  <PostPlatform>
                    <PlatformBadge $platform={post.platform}>
                      {getPlatformIcon(post.platform)}
                      {getPlatformName(post.platform)}
                    </PlatformBadge>
                    <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                      @{post.account_name}
                    </span>
                  </PostPlatform>
                  <StatusBadge $status={post.review_status}>
                    {post.review_status === 'pending' ? <Clock size={14} /> :
                     post.review_status === 'approved' ? <CheckCircle2 size={14} /> :
                     <AlertCircle size={14} />}
                    {post.review_status}
                  </StatusBadge>
                </PostHeader>

                {post.media.length > 0 && (
                  <PostMedia>
                    <img src={post.media[0].url} alt="Post media" />
                    {post.media[0].type === 'video' && (
                      <MediaOverlay>
                        <PlayButton>
                          <Play size={24} fill="white" />
                        </PlayButton>
                      </MediaOverlay>
                    )}
                    {getPostTypeLabel(post.caption, post.platform, post.media[0].type) && (
                      <PostTypeLabel>
                        {getPostTypeLabel(post.caption, post.platform, post.media[0].type)}
                      </PostTypeLabel>
                    )}
                  </PostMedia>
                )}

                <PostCaption>{post.caption}</PostCaption>

                <PostMeta>
                  <span>
                    <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Proposed: {post.proposed_date?.toLocaleDateString()} at {post.proposed_date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>Type: {post.media[0]?.type || 'text'}</span>
                </PostMeta>
              </PostCard>
            ))}
          </PostsList>
        </DetailView>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>Content Plans</Title>
        <Subtitle>
          Test page showing 3 mock content plans with different platform combinations
        </Subtitle>
      </Header>

      <PlansGrid>
        {mockPlans.map(plan => {
          const platforms = getPlanPlatforms(plan);

          return (
            <PlanCard key={plan.id}>
              <PlanHeader>
                <PlanTitle>{plan.title}</PlanTitle>
                <PlanDescription>{plan.description}</PlanDescription>
              </PlanHeader>

              <PlanMeta>
                <MetaItem>
                  <FileText size={16} />
                  <strong>{plan.posts.length}</strong> posts
                </MetaItem>
                <MetaItem>
                  <Calendar size={16} />
                  <strong>{plan.client_name}</strong>
                </MetaItem>
              </PlanMeta>

              <PlatformRow>
                {platforms.map(platform => (
                  <PlatformBadge key={platform} $platform={platform}>
                    {getPlatformIcon(platform)}
                    {getPlatformName(platform)}
                  </PlatformBadge>
                ))}
                <StatusBadge $status={plan.status}>
                  {getStatusIcon(plan.status)}
                  {getStatusLabel(plan.status)}
                </StatusBadge>
              </PlatformRow>

              <ViewButton onClick={() => setSelectedPlan(plan)}>
                View Plan
                <ExternalLink />
              </ViewButton>
            </PlanCard>
          );
        })}
      </PlansGrid>
    </PageContainer>
  );
}
