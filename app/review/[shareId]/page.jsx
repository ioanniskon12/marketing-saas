/**
 * Client Review Page
 *
 * Public page for clients to review, approve/reject, and comment on content plans
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'next/navigation';
import {
  CheckCircle, XCircle, MessageSquare, Calendar, Clock,
  Eye, AlertCircle, Lock, Send, ThumbsUp, ThumbsDown, Edit3
} from 'lucide-react';
import { Button, Card, TextArea, Input } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { PLATFORM_CONFIG } from '@/lib/config/platforms';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing['2xl']};
  padding: ${props => props.theme.spacing['2xl']} ${props => props.theme.spacing.xl};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary.main}, ${props => props.theme.colors.primary.dark});
  border-radius: ${props => props.theme.borderRadius.xl};
  color: white;
`;

const Logo = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  margin: 0;
  opacity: 0.9;
`;

const InfoCard = styled(Card)`
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.neutral[50]};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};

  svg {
    width: 18px;
    height: 18px;
    color: ${props => props.theme.colors.primary.main};
  }

  strong {
    color: ${props => props.theme.colors.text.primary};
  }
`;

const PostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const PostCard = styled(Card)`
  padding: ${props => props.theme.spacing.xl};
  border: 2px solid ${props => {
    switch (props.$status) {
      case 'approved': return props.theme.colors.success.main;
      case 'rejected': return props.theme.colors.error.main;
      case 'changes_requested': return props.theme.colors.warning.main;
      default: return props.theme.colors.neutral[200];
    }
  }};
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
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

const StatusBadge = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  background: ${props => {
    switch (props.$status) {
      case 'approved': return props.theme.colors.success.main + '20';
      case 'rejected': return props.theme.colors.error.main + '20';
      case 'changes_requested': return props.theme.colors.warning.main + '20';
      default: return props.theme.colors.neutral[200];
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'approved': return props.theme.colors.success.dark;
      case 'rejected': return props.theme.colors.error.dark;
      case 'changes_requested': return props.theme.colors.warning.dark;
      default: return props.theme.colors.text.secondary;
    }
  }};
`;

const PostCaption = styled.p`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
  white-space: pre-wrap;
  line-height: 1.6;
`;

const PostMedia = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const MediaItem = styled.div`
  aspect-ratio: 1;
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  background: ${props => props.theme.colors.neutral[100]};
  cursor: pointer;
  transition: transform ${props => props.theme.transitions.fast};

  &:hover {
    transform: scale(1.05);
  }

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
  margin-bottom: ${props => props.theme.spacing.lg};
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

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
`;

const CommentsSection = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
  padding-top: ${props => props.theme.spacing.xl};
  border-top: 2px solid ${props => props.theme.colors.neutral[200]};
`;

const CommentsTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Comment = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.borderRadius.md};
  border-left: 3px solid ${props => props.theme.colors.primary.main};
`;

const CommentAuthor = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const CommentText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const CommentDate = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const CommentForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['3xl']};
  color: ${props => props.theme.colors.text.secondary};

  svg {
    width: 64px;
    height: 64px;
    color: ${props => props.theme.colors.neutral[300]};
    margin-bottom: ${props => props.theme.spacing.lg};
  }

  h2 {
    font-size: ${props => props.theme.typography.fontSize['2xl']};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
    margin: 0 0 ${props => props.theme.spacing.sm} 0;
  }

  p {
    font-size: ${props => props.theme.typography.fontSize.base};
    margin: 0;
  }
`;

const APPROVAL_STATUS_LABELS = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  changes_requested: 'Changes Requested'
};

export default function ClientReviewPage() {
  const params = useParams();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState(null);
  const [plan, setPlan] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [newComment, setNewComment] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (params.shareId) {
      loadShareData();
    }
  }, [params.shareId]);

  const loadShareData = async () => {
    try {
      setLoading(true);

      // Load share details
      const { data: shareData, error: shareError } = await supabase
        .from('plan_shares')
        .select('*')
        .eq('share_token', params.shareId)
        .eq('is_active', true)
        .single();

      if (shareError) throw shareError;

      // Check if expired
      if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
        throw new Error('This share link has expired');
      }

      setShare(shareData);
      setClientName(shareData.client_name || '');
      setClientEmail(shareData.client_email || '');

      // Update view count
      await supabase
        .from('plan_shares')
        .update({
          view_count: (shareData.view_count || 0) + 1,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', shareData.id);

      // Load plan details
      const { data: planData, error: planError } = await supabase
        .from('content_plans')
        .select('*')
        .eq('id', shareData.plan_id)
        .single();

      if (planError) throw planError;
      setPlan(planData);

      // Load posts
      const { data: postsData, error: postsError } = await supabase
        .from('plan_posts')
        .select('*')
        .eq('plan_id', shareData.plan_id)
        .order('position', { ascending: true });

      if (postsError) throw postsError;
      setPosts(postsData || []);

      // Load comments for all posts
      const { data: commentsData, error: commentsError } = await supabase
        .from('plan_comments')
        .select('*')
        .eq('plan_id', shareData.plan_id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Group comments by post
      const commentsByPost = {};
      commentsData?.forEach(comment => {
        if (!commentsByPost[comment.plan_post_id]) {
          commentsByPost[comment.plan_post_id] = [];
        }
        commentsByPost[comment.plan_post_id].push(comment);
      });
      setComments(commentsByPost);

    } catch (error) {
      console.error('Error loading share:', error);
      showToast.error(error.message || 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId) => {
    if (!canApprove()) return;

    try {
      setActionLoading({ ...actionLoading, [postId]: 'approve' });

      const { error } = await supabase
        .from('plan_posts')
        .update({
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: null // Client approval doesn't have a profile_id
        })
        .eq('id', postId);

      if (error) throw error;

      // Log activity
      await supabase
        .from('plan_activity_log')
        .insert({
          plan_id: plan.id,
          plan_post_id: postId,
          action: 'approved',
          actor_name: clientName,
          actor_email: clientEmail,
          metadata: { via: 'client_review' }
        });

      showToast.success('Post approved!');
      loadShareData();

    } catch (error) {
      console.error('Error approving post:', error);
      showToast.error('Failed to approve post');
    } finally {
      setActionLoading({ ...actionLoading, [postId]: null });
    }
  };

  const handleReject = async (postId) => {
    if (!canApprove()) return;

    const reason = prompt('Please provide a reason for rejection (optional):');

    try {
      setActionLoading({ ...actionLoading, [postId]: 'reject' });

      const { error } = await supabase
        .from('plan_posts')
        .update({
          approval_status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', postId);

      if (error) throw error;

      // Log activity
      await supabase
        .from('plan_activity_log')
        .insert({
          plan_id: plan.id,
          plan_post_id: postId,
          action: 'rejected',
          actor_name: clientName,
          actor_email: clientEmail,
          metadata: { via: 'client_review', reason }
        });

      showToast.success('Post rejected');
      loadShareData();

    } catch (error) {
      console.error('Error rejecting post:', error);
      showToast.error('Failed to reject post');
    } finally {
      setActionLoading({ ...actionLoading, [postId]: null });
    }
  };

  const handleRequestChanges = async (postId) => {
    if (!canComment()) return;

    const changes = prompt('Please describe the changes you would like:');
    if (!changes || !changes.trim()) return;

    try {
      setActionLoading({ ...actionLoading, [postId]: 'changes' });

      // Update post status
      const { error: postError } = await supabase
        .from('plan_posts')
        .update({ approval_status: 'changes_requested' })
        .eq('id', postId);

      if (postError) throw postError;

      // Add comment with the requested changes
      const { error: commentError } = await supabase
        .from('plan_comments')
        .insert({
          plan_id: plan.id,
          plan_post_id: postId,
          comment: changes,
          author_name: clientName,
          author_email: clientEmail
        });

      if (commentError) throw commentError;

      // Log activity
      await supabase
        .from('plan_activity_log')
        .insert({
          plan_id: plan.id,
          plan_post_id: postId,
          action: 'changes_requested',
          actor_name: clientName,
          actor_email: clientEmail,
          metadata: { via: 'client_review', changes }
        });

      showToast.success('Changes requested');
      loadShareData();

    } catch (error) {
      console.error('Error requesting changes:', error);
      showToast.error('Failed to request changes');
    } finally {
      setActionLoading({ ...actionLoading, [postId]: null });
    }
  };

  const handleAddComment = async (postId) => {
    if (!canComment()) return;

    const commentText = newComment[postId]?.trim();
    if (!commentText) {
      showToast.error('Please enter a comment');
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [`comment-${postId}`]: true });

      const { error } = await supabase
        .from('plan_comments')
        .insert({
          plan_id: plan.id,
          plan_post_id: postId,
          comment: commentText,
          author_name: clientName,
          author_email: clientEmail
        });

      if (error) throw error;

      // Log activity
      await supabase
        .from('plan_activity_log')
        .insert({
          plan_id: plan.id,
          plan_post_id: postId,
          action: 'commented',
          actor_name: clientName,
          actor_email: clientEmail,
          metadata: { via: 'client_review' }
        });

      showToast.success('Comment added');
      setNewComment({ ...newComment, [postId]: '' });
      loadShareData();

    } catch (error) {
      console.error('Error adding comment:', error);
      showToast.error('Failed to add comment');
    } finally {
      setActionLoading({ ...actionLoading, [`comment-${postId}`]: null });
    }
  };

  const canApprove = () => share?.access_type === 'can_approve';
  const canComment = () => share?.access_type === 'can_comment' || share?.access_type === 'can_approve';

  if (loading) {
    return (
      <Container>
        <EmptyState>
          <Eye />
          <h2>Loading...</h2>
          <p>Please wait while we load the plan</p>
        </EmptyState>
      </Container>
    );
  }

  if (!share || !plan) {
    return (
      <Container>
        <EmptyState>
          <Lock />
          <h2>Plan Not Found</h2>
          <p>This share link is invalid, expired, or has been revoked.</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Logo>Social Media SaaS</Logo>
        <Title>{plan.title}</Title>
        {plan.description && <Subtitle>{plan.description}</Subtitle>}
      </Header>

      <InfoCard>
        <InfoGrid>
          <InfoItem>
            <Eye />
            <span><strong>Access:</strong> {share.access_type.replace('_', ' ')}</span>
          </InfoItem>
          <InfoItem>
            <Calendar />
            <span><strong>Created:</strong> {new Date(plan.created_at).toLocaleDateString()}</span>
          </InfoItem>
          {plan.target_date && (
            <InfoItem>
              <Clock />
              <span><strong>Target Date:</strong> {new Date(plan.target_date).toLocaleDateString()}</span>
            </InfoItem>
          )}
          <InfoItem>
            <MessageSquare />
            <span><strong>Total Posts:</strong> {posts.length}</span>
          </InfoItem>
        </InfoGrid>
      </InfoCard>

      {posts.length === 0 ? (
        <EmptyState>
          <AlertCircle />
          <h2>No Posts Yet</h2>
          <p>This plan doesn't have any posts yet.</p>
        </EmptyState>
      ) : (
        <PostsList>
          {posts.map((post, index) => (
            <PostCard key={post.id} $status={post.approval_status}>
              <PostHeader>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                    Post {index + 1}
                  </h3>
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
                    <MediaItem key={mediaIndex} onClick={() => window.open(url, '_blank')}>
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

              {/* Action Buttons */}
              {post.approval_status === 'pending' && (
                <ActionButtons>
                  {canApprove() && (
                    <>
                      <Button
                        variant="success"
                        onClick={() => handleApprove(post.id)}
                        loading={actionLoading[post.id] === 'approve'}
                        disabled={!!actionLoading[post.id]}
                      >
                        <ThumbsUp size={16} />
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleReject(post.id)}
                        loading={actionLoading[post.id] === 'reject'}
                        disabled={!!actionLoading[post.id]}
                      >
                        <ThumbsDown size={16} />
                        Reject
                      </Button>
                    </>
                  )}
                  {canComment() && (
                    <Button
                      variant="outline"
                      onClick={() => handleRequestChanges(post.id)}
                      loading={actionLoading[post.id] === 'changes'}
                      disabled={!!actionLoading[post.id]}
                    >
                      <Edit3 size={16} />
                      Request Changes
                    </Button>
                  )}
                </ActionButtons>
              )}

              {/* Comments Section */}
              <CommentsSection>
                <CommentsTitle>
                  <MessageSquare size={20} />
                  Comments ({comments[post.id]?.length || 0})
                </CommentsTitle>

                {comments[post.id] && comments[post.id].length > 0 && (
                  <CommentsList>
                    {comments[post.id].map((comment) => (
                      <Comment key={comment.id}>
                        <CommentAuthor>{comment.author_name}</CommentAuthor>
                        <CommentText>{comment.comment}</CommentText>
                        <CommentDate>
                          {new Date(comment.created_at).toLocaleString()}
                        </CommentDate>
                      </Comment>
                    ))}
                  </CommentsList>
                )}

                {canComment() && (
                  <CommentForm>
                    <TextArea
                      placeholder="Add your feedback or comments..."
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                      rows={3}
                    />
                    <Button
                      variant="primary"
                      onClick={() => handleAddComment(post.id)}
                      loading={actionLoading[`comment-${post.id}`]}
                      disabled={!newComment[post.id]?.trim()}
                    >
                      <Send size={16} />
                      Add Comment
                    </Button>
                  </CommentForm>
                )}
              </CommentsSection>
            </PostCard>
          ))}
        </PostsList>
      )}
    </Container>
  );
}
