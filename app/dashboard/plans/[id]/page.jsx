/**
 * Plan Detail Page
 *
 * View and edit content plan details, manage posts, and share with clients
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Edit, Share2, Trash2, Plus, Calendar, Clock,
  CheckCircle, XCircle, Clock as ClockPending, MessageSquare,
  Link as LinkIcon, Mail, Copy, Eye, User, FileText, Send
} from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button, Card, Input, TextArea, Modal } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { PLATFORM_CONFIG } from '@/lib/config/platforms';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.xl};
  gap: ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs} 0;
  margin-bottom: ${props => props.theme.spacing.md};
  transition: color ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.primary.main};
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const Description = styled.p`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const StatusBadge = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  background: ${props => {
    switch (props.$status) {
      case 'approved': return props.theme.colors.success.main + '20';
      case 'pending_review': return props.theme.colors.warning.main + '20';
      case 'rejected': return props.theme.colors.error.main + '20';
      case 'partially_approved': return props.theme.colors.info.main + '20';
      default: return props.theme.colors.neutral[200];
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'approved': return props.theme.colors.success.dark;
      case 'pending_review': return props.theme.colors.warning.dark;
      case 'rejected': return props.theme.colors.error.dark;
      case 'partially_approved': return props.theme.colors.info.dark;
      default: return props.theme.colors.text.secondary;
    }
  }};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const InfoCard = styled(Card)`
  padding: ${props => props.theme.spacing.lg};
`;

const InfoLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const InfoValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const Section = styled(Card)`
  padding: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const PostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const PostCard = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border: 2px solid ${props => {
    switch (props.$status) {
      case 'approved': return props.theme.colors.success.main;
      case 'rejected': return props.theme.colors.error.main;
      case 'changes_requested': return props.theme.colors.warning.main;
      default: return props.theme.colors.neutral[200];
    }
  }};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.paper};
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const PostPlatforms = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  flex-wrap: wrap;
`;

const PlatformBadge = styled.span`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$color + '20'};
  color: ${props => props.$color};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const PostCaption = styled.p`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
  white-space: pre-wrap;
`;

const PostMedia = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const MediaItem = styled.div`
  aspect-ratio: 1;
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  background: ${props => props.theme.colors.neutral[100]};

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PostMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SharesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ShareCard = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.paper};
`;

const ShareHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ShareInfo = styled.div`
  flex: 1;
`;

const ShareName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const ShareEmail = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const ShareActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const ShareLink = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-family: monospace;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  word-break: break-all;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.text.secondary};

  svg {
    width: 48px;
    height: 48px;
    color: ${props => props.theme.colors.neutral[300]};
    margin-bottom: ${props => props.theme.spacing.md};
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  background: ${props => props.$selected ? props.theme.colors.primary.main + '05' : 'transparent'};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
  }

  input {
    cursor: pointer;
  }
`;

const STATUS_LABELS = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  approved: 'Approved',
  partially_approved: 'Partially Approved',
  rejected: 'Rejected',
  archived: 'Archived'
};

const APPROVAL_STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  changes_requested: 'Changes Requested'
};

export default function PlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { currentWorkspace } = useWorkspace();
  const supabase = createClient();

  const [plan, setPlan] = useState(null);
  const [posts, setPosts] = useState([]);
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareForm, setShareForm] = useState({
    clientName: '',
    clientEmail: '',
    accessType: 'can_approve',
    expiresIn: '30'
  });
  const [sharingLoading, setSharingLoading] = useState(false);

  useEffect(() => {
    if (currentWorkspace && params.id) {
      loadPlanData();
    }
  }, [currentWorkspace, params.id]);

  const loadPlanData = async () => {
    try {
      setLoading(true);

      // Load plan details
      const { data: planData, error: planError } = await supabase
        .from('content_plans')
        .select(`
          *,
          profiles:created_by(full_name, email)
        `)
        .eq('id', params.id)
        .eq('workspace_id', currentWorkspace.id)
        .single();

      if (planError) throw planError;
      setPlan(planData);

      // Load plan posts
      const { data: postsData, error: postsError } = await supabase
        .from('plan_posts')
        .select('*')
        .eq('plan_id', params.id)
        .order('position', { ascending: true });

      if (postsError) throw postsError;
      setPosts(postsData || []);

      // Load shares
      const { data: sharesData, error: sharesError } = await supabase
        .from('plan_shares')
        .select('*')
        .eq('plan_id', params.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (sharesError) throw sharesError;
      setShares(sharesData || []);

    } catch (error) {
      console.error('Error loading plan:', error);
      showToast.error('Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!shareForm.clientName.trim() || !shareForm.clientEmail.trim()) {
      showToast.error('Please enter client name and email');
      return;
    }

    try {
      setSharingLoading(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        showToast.error('Please log in to share plans');
        return;
      }

      // Calculate expiration date
      let expiresAt = null;
      if (shareForm.expiresIn !== 'never') {
        const days = parseInt(shareForm.expiresIn);
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
      }

      // Create share
      const { data: shareData, error: shareError } = await supabase
        .from('plan_shares')
        .insert({
          plan_id: params.id,
          workspace_id: currentWorkspace.id,
          client_name: shareForm.clientName,
          client_email: shareForm.clientEmail,
          access_type: shareForm.accessType,
          expires_at: expiresAt,
          created_by: user.id
        })
        .select()
        .single();

      if (shareError) throw shareError;

      showToast.success('Plan shared successfully!');
      setIsShareModalOpen(false);
      setShareForm({
        clientName: '',
        clientEmail: '',
        accessType: 'can_approve',
        expiresIn: '30'
      });
      loadPlanData();

      // TODO: Send email to client with share link
      // await sendShareEmail(shareData);

    } catch (error) {
      console.error('Error sharing plan:', error);
      showToast.error('Failed to share plan');
    } finally {
      setSharingLoading(false);
    }
  };

  const handleCopyShareLink = (shareToken) => {
    const shareUrl = `${window.location.origin}/review/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    showToast.success('Share link copied to clipboard!');
  };

  const handleDeleteShare = async (shareId) => {
    if (!confirm('Are you sure you want to revoke this share link?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('plan_shares')
        .update({ is_active: false })
        .eq('id', shareId);

      if (error) throw error;

      showToast.success('Share link revoked');
      loadPlanData();
    } catch (error) {
      console.error('Error deleting share:', error);
      showToast.error('Failed to revoke share link');
    }
  };

  const handleDeletePlan = async () => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('content_plans')
        .delete()
        .eq('id', params.id);

      if (error) throw error;

      showToast.success('Plan deleted successfully');
      router.push('/dashboard/plans');
    } catch (error) {
      console.error('Error deleting plan:', error);
      showToast.error('Failed to delete plan');
    }
  };

  if (loading) {
    return (
      <Container>
        <EmptyState>
          <p>Loading plan details...</p>
        </EmptyState>
      </Container>
    );
  }

  if (!plan) {
    return (
      <Container>
        <EmptyState>
          <FileText />
          <h3>Plan Not Found</h3>
          <p>The plan you're looking for doesn't exist or you don't have access to it.</p>
          <Button variant="primary" onClick={() => router.push('/dashboard/plans')}>
            Back to Plans
          </Button>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => router.push('/dashboard/plans')}>
            <ArrowLeft size={16} />
            Back to Plans
          </BackButton>
          <Title>{plan.title}</Title>
          {plan.description && <Description>{plan.description}</Description>}
        </HeaderLeft>
        <HeaderActions>
          <StatusBadge $status={plan.status}>
            {STATUS_LABELS[plan.status]}
          </StatusBadge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/plans/${params.id}/edit`)}
          >
            <Edit size={16} />
            Edit
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 size={16} />
            Share
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeletePlan}
          >
            <Trash2 size={16} />
          </Button>
        </HeaderActions>
      </Header>

      <InfoGrid>
        <InfoCard>
          <InfoLabel>Created By</InfoLabel>
          <InfoValue>
            <User size={20} />
            {plan.profiles?.full_name || plan.profiles?.email || 'Unknown'}
          </InfoValue>
        </InfoCard>

        <InfoCard>
          <InfoLabel>Created Date</InfoLabel>
          <InfoValue>
            <Calendar size={20} />
            {new Date(plan.created_at).toLocaleDateString()}
          </InfoValue>
        </InfoCard>

        {plan.target_date && (
          <InfoCard>
            <InfoLabel>Target Date</InfoLabel>
            <InfoValue>
              <Calendar size={20} />
              {new Date(plan.target_date).toLocaleDateString()}
            </InfoValue>
          </InfoCard>
        )}

        <InfoCard>
          <InfoLabel>Total Posts</InfoLabel>
          <InfoValue>
            <FileText size={20} />
            {posts.length}
          </InfoValue>
        </InfoCard>
      </InfoGrid>

      {/* Posts Section */}
      <Section>
        <SectionHeader>
          <SectionTitle>Posts</SectionTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/plans/${params.id}/edit`)}
          >
            <Plus size={16} />
            Add Post
          </Button>
        </SectionHeader>

        {posts.length === 0 ? (
          <EmptyState>
            <FileText />
            <p>No posts in this plan yet.</p>
          </EmptyState>
        ) : (
          <PostsList>
            {posts.map((post, index) => (
              <PostCard key={post.id} $status={post.approval_status}>
                <PostHeader>
                  <div>
                    <PostPlatforms>
                      {post.platforms?.map((platformId) => {
                        const platform = PLATFORM_CONFIG[platformId];
                        if (!platform) return null;
                        const Icon = platform.icon;
                        return (
                          <PlatformBadge key={platformId} $color={platform.color}>
                            <Icon />
                            {platform.label}
                          </PlatformBadge>
                        );
                      })}
                    </PostPlatforms>
                  </div>
                  <StatusBadge $status={post.approval_status}>
                    {APPROVAL_STATUS_LABELS[post.approval_status]}
                  </StatusBadge>
                </PostHeader>

                <PostCaption>{post.caption}</PostCaption>

                {post.media_urls && post.media_urls.length > 0 && (
                  <PostMedia>
                    {post.media_urls.map((url, mediaIndex) => (
                      <MediaItem key={mediaIndex}>
                        {url.includes('.mp4') || url.includes('.mov') ? (
                          <video src={url} />
                        ) : (
                          <img src={url} alt={`Media ${mediaIndex + 1}`} />
                        )}
                      </MediaItem>
                    ))}
                  </PostMedia>
                )}

                <PostMeta>
                  {post.scheduled_date && (
                    <MetaItem>
                      <Calendar />
                      {new Date(post.scheduled_date).toLocaleDateString()}
                    </MetaItem>
                  )}
                  {post.scheduled_time && (
                    <MetaItem>
                      <Clock />
                      {post.scheduled_time}
                    </MetaItem>
                  )}
                  {post.platform_data?.hashtags && (
                    <MetaItem>
                      {post.platform_data.hashtags}
                    </MetaItem>
                  )}
                </PostMeta>
              </PostCard>
            ))}
          </PostsList>
        )}
      </Section>

      {/* Shares Section */}
      <Section>
        <SectionHeader>
          <SectionTitle>Shared Links</SectionTitle>
        </SectionHeader>

        {shares.length === 0 ? (
          <EmptyState>
            <LinkIcon />
            <p>This plan hasn't been shared yet.</p>
            <Button variant="primary" onClick={() => setIsShareModalOpen(true)}>
              <Share2 size={16} />
              Share with Client
            </Button>
          </EmptyState>
        ) : (
          <SharesList>
            {shares.map((share) => (
              <ShareCard key={share.id}>
                <ShareHeader>
                  <ShareInfo>
                    <ShareName>{share.client_name}</ShareName>
                    <ShareEmail>{share.client_email}</ShareEmail>
                  </ShareInfo>
                  <ShareActions>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyShareLink(share.share_token)}
                    >
                      <Copy size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteShare(share.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </ShareActions>
                </ShareHeader>

                <ShareLink>
                  <span>{window.location.origin}/review/{share.share_token}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyShareLink(share.share_token)}
                  >
                    <Copy size={14} />
                  </Button>
                </ShareLink>

                <PostMeta style={{ marginTop: '12px', paddingTop: '12px' }}>
                  <MetaItem>
                    <Eye />
                    {share.view_count || 0} views
                  </MetaItem>
                  {share.expires_at && (
                    <MetaItem>
                      <Clock />
                      Expires {new Date(share.expires_at).toLocaleDateString()}
                    </MetaItem>
                  )}
                  <MetaItem>
                    <LinkIcon />
                    {share.access_type.replace('_', ' ')}
                  </MetaItem>
                </PostMeta>
              </ShareCard>
            ))}
          </SharesList>
        )}
      </Section>

      {/* Share Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Plan with Client"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsShareModalOpen(false)}
              disabled={sharingLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleShare}
              loading={sharingLoading}
            >
              <Send size={16} />
              Share Plan
            </Button>
          </>
        }
      >
        <ModalContent>
          <FormGroup>
            <Label>Client Name *</Label>
            <Input
              type="text"
              placeholder="John Doe"
              value={shareForm.clientName}
              onChange={(e) => setShareForm({ ...shareForm, clientName: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>Client Email *</Label>
            <Input
              type="email"
              placeholder="client@example.com"
              value={shareForm.clientEmail}
              onChange={(e) => setShareForm({ ...shareForm, clientEmail: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>Access Type</Label>
            <RadioGroup>
              <RadioOption $selected={shareForm.accessType === 'view_only'}>
                <input
                  type="radio"
                  name="accessType"
                  value="view_only"
                  checked={shareForm.accessType === 'view_only'}
                  onChange={(e) => setShareForm({ ...shareForm, accessType: e.target.value })}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>View Only</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    Client can only view the plan
                  </div>
                </div>
              </RadioOption>

              <RadioOption $selected={shareForm.accessType === 'can_comment'}>
                <input
                  type="radio"
                  name="accessType"
                  value="can_comment"
                  checked={shareForm.accessType === 'can_comment'}
                  onChange={(e) => setShareForm({ ...shareForm, accessType: e.target.value })}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>Can Comment</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    Client can view and add comments
                  </div>
                </div>
              </RadioOption>

              <RadioOption $selected={shareForm.accessType === 'can_approve'}>
                <input
                  type="radio"
                  name="accessType"
                  value="can_approve"
                  checked={shareForm.accessType === 'can_approve'}
                  onChange={(e) => setShareForm({ ...shareForm, accessType: e.target.value })}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>Can Approve</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    Client can view, comment, and approve/reject posts
                  </div>
                </div>
              </RadioOption>
            </RadioGroup>
          </FormGroup>

          <FormGroup>
            <Label>Link Expiration</Label>
            <RadioGroup style={{ flexDirection: 'row', gap: '8px' }}>
              <RadioOption $selected={shareForm.expiresIn === '7'} style={{ flex: 1 }}>
                <input
                  type="radio"
                  name="expiresIn"
                  value="7"
                  checked={shareForm.expiresIn === '7'}
                  onChange={(e) => setShareForm({ ...shareForm, expiresIn: e.target.value })}
                />
                <span>7 days</span>
              </RadioOption>

              <RadioOption $selected={shareForm.expiresIn === '30'} style={{ flex: 1 }}>
                <input
                  type="radio"
                  name="expiresIn"
                  value="30"
                  checked={shareForm.expiresIn === '30'}
                  onChange={(e) => setShareForm({ ...shareForm, expiresIn: e.target.value })}
                />
                <span>30 days</span>
              </RadioOption>

              <RadioOption $selected={shareForm.expiresIn === 'never'} style={{ flex: 1 }}>
                <input
                  type="radio"
                  name="expiresIn"
                  value="never"
                  checked={shareForm.expiresIn === 'never'}
                  onChange={(e) => setShareForm({ ...shareForm, expiresIn: e.target.value })}
                />
                <span>Never</span>
              </RadioOption>
            </RadioGroup>
          </FormGroup>
        </ModalContent>
      </Modal>
    </Container>
  );
}
