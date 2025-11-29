/**
 * Public Share Link - Client Review Page
 *
 * Allows clients to review plan posts and provide feedback
 * without authentication
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { mockPlans } from '@/lib/mockData/plans';
import { PlanWithPosts, Post } from '@/types/plans';
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
  Play,
  ThumbsUp,
  ThumbsDown,
  Send,
  X,
  Check
} from 'lucide-react';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageContainer = styled.div<{ $darkMode: boolean }>`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: ${props => props.theme.spacing.xl};
`;

const ShareCard = styled.div<{ $darkMode: boolean }>`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const Header = styled.div`
  background: linear-gradient(135deg, rgba(139, 92, 246, 1), rgba(124, 58, 237, 1));
  color: white;
  padding: ${props => props.theme.spacing['2xl']};
  text-align: center;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Description = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  opacity: 0.9;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ExpiryNotice = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing['2xl']};
`;

const Instructions = styled.div<{ $darkMode: boolean }>`
  background: ${props => props.$darkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.05)'};
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing['2xl']};
  transition: all 0.3s ease;
`;

const InstructionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: rgba(139, 92, 246, 1);
  margin-bottom: ${props => props.theme.spacing.md};
`;

const InstructionList = styled.ul<{ $darkMode: boolean }>`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: start;
    gap: ${props => props.theme.spacing.sm};
    margin-bottom: ${props => props.theme.spacing.sm};
    color: ${props => props.$darkMode ? 'rgba(226, 232, 240, 0.8)' : props.theme.colors.text.secondary};
    transition: color 0.3s ease;

    &:before {
      content: '✓';
      color: rgba(139, 92, 246, 1);
      font-weight: bold;
      flex-shrink: 0;
    }
  }
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing.xl};
`;

const PostCard = styled.div<{ $status?: string; $darkMode: boolean }>`
  background: ${props => props.$darkMode ? '#0f172a' : 'white'};
  border: 2px solid ${props => {
    if (props.$status === 'approved') return 'rgba(34, 197, 94, 0.5)';
    if (props.$status === 'changes_requested') return 'rgba(239, 68, 68, 0.5)';
    return props.$darkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(229, 231, 235, 1)';
  }};
  border-radius: ${props => props.theme.borderRadius.xl};
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px);
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

const PostDateBadge = styled.div<{ $darkMode: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  background: ${props => props.$darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'};
  color: rgba(139, 92, 246, 1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  transition: all 0.3s ease;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const PostMedia = styled.div`
  width: 100%;
  height: 250px;
  background: rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;

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

const PostContent = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const PlatformBadge = styled.div<{ $platform: string }>`
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
    return colors[props.$platform as keyof typeof colors] || '#666';
  }};
  color: white;
  margin-bottom: ${props => props.theme.spacing.md};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const PostCaption = styled.p<{ $darkMode: boolean }>`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.$darkMode ? 'rgba(226, 232, 240, 0.8)' : props.theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing.md};
  transition: color 0.3s ease;
`;

const ReviewSection = styled.div`
  margin-top: ${props => props.theme.spacing.md};
`;

const EmojiReactions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm};
  background: rgba(249, 250, 251, 1);
  border-radius: ${props => props.theme.borderRadius.lg};
  flex-wrap: wrap;
`;

const EmojiButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: 2px solid ${props => props.$active ? 'rgba(139, 92, 246, 0.5)' : 'rgba(229, 231, 235, 1)'};
  background: ${props => props.$active ? 'rgba(139, 92, 246, 0.1)' : 'white'};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    border-color: rgba(139, 92, 246, 0.5);
    background: rgba(139, 92, 246, 0.1);
  }

  &:active {
    transform: scale(0.95);
  }

  .emoji {
    font-size: 1.125rem;
    line-height: 1;
  }

  .count {
    font-size: ${props => props.theme.typography.fontSize.xs};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.$active ? 'rgba(139, 92, 246, 1)' : props.theme.colors.text.secondary};
    min-width: 12px;
    text-align: center;
  }
`;

const QuickReactLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.tertiary};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  display: flex;
  align-items: center;
`;

const ReviewActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ActionButton = styled.button<{ $variant: 'approve' | 'reject' | 'comment' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => {
    if (props.$variant === 'approve') return '#22C55E';
    if (props.$variant === 'reject') return '#EF4444';
    return 'rgba(139, 92, 246, 1)';
  }};
  background: ${props => {
    if (props.$variant === 'approve') return 'rgba(34, 197, 94, 0.1)';
    if (props.$variant === 'reject') return 'rgba(239, 68, 68, 0.1)';
    return 'rgba(139, 92, 246, 0.1)';
  }};
  color: ${props => {
    if (props.$variant === 'approve') return '#22C55E';
    if (props.$variant === 'reject') return '#EF4444';
    return 'rgba(139, 92, 246, 1)';
  }};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => {
      if (props.$variant === 'approve') return 'rgba(34, 197, 94, 0.2)';
      if (props.$variant === 'reject') return 'rgba(239, 68, 68, 0.2)';
      return 'rgba(139, 92, 246, 0.2)';
    }};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => {
      if (props.$variant === 'approve') return 'rgba(34, 197, 94, 0.3)';
      if (props.$variant === 'reject') return 'rgba(239, 68, 68, 0.3)';
      return 'rgba(139, 92, 246, 0.3)';
    }};
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const CommentBox = styled.div<{ $show: boolean }>`
  display: ${props => props.$show ? 'block' : 'none'};
  margin-top: ${props => props.theme.spacing.md};
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: ${props => props.theme.spacing.md};
  border: 2px solid rgba(229, 231, 235, 1);
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(139, 92, 246, 0.5);
  }

  &::placeholder {
    color: rgba(156, 163, 175, 1);
  }
`;

const CommentActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
`;

const CommentButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border: none;
  background: ${props => props.$variant === 'primary'
    ? 'linear-gradient(135deg, rgba(139, 92, 246, 1), rgba(124, 58, 237, 1))'
    : 'rgba(229, 231, 235, 1)'};
  color: ${props => props.$variant === 'primary' ? 'white' : props.theme.colors.text.secondary};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$variant === 'primary'
      ? 'linear-gradient(135deg, rgba(124, 58, 237, 1), rgba(109, 40, 217, 1))'
      : 'rgba(209, 213, 219, 1)'};
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const StatusBadge = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  background: ${props => {
    if (props.$status === 'approved') return 'rgba(34, 197, 94, 0.15)';
    if (props.$status === 'changes_requested') return 'rgba(239, 68, 68, 0.15)';
    return 'rgba(234, 179, 8, 0.15)';
  }};
  color: ${props => {
    if (props.$status === 'approved') return '#22C55E';
    if (props.$status === 'changes_requested') return '#EF4444';
    return '#EAB308';
  }};
  border: 2px solid ${props => {
    if (props.$status === 'approved') return 'rgba(34, 197, 94, 0.3)';
    if (props.$status === 'changes_requested') return 'rgba(239, 68, 68, 0.3)';
    return 'rgba(234, 179, 8, 0.3)';
  }};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ReviewComment = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: rgba(249, 250, 251, 1);
  border-radius: ${props => props.theme.borderRadius.lg};
  border-left: 4px solid rgba(139, 92, 246, 1);
`;

const CommentLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: rgba(139, 92, 246, 1);
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const CommentText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.5;
  margin: 0;
`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getPlatformIcon = (platform: string) => {
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

const getPlatformName = (platform: string) => {
  const names: Record<string, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    youtube: 'YouTube',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
    tiktok: 'TikTok',
  };
  return names[platform] || platform;
};

const getPostTypeLabel = (caption: string, platform: string, mediaType: string) => {
  const lowerCaption = caption.toLowerCase();
  if (lowerCaption.includes('reel')) return 'REEL';
  if (lowerCaption.includes('story')) return 'STORY';
  if (platform === 'youtube') return 'VIDEO';
  if (platform === 'tiktok') return 'TIKTOK';
  if (mediaType === 'video' && platform === 'instagram') return 'REEL';
  if (mediaType === 'video') return 'VIDEO';
  return null;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type EmojiType = '👍' | '👎' | '❤️' | '🔥' | '😍';

export default function SharePlanPage({ params }: { params: { token: string } }) {
  const [plan, setPlan] = useState<PlanWithPosts | null>(null);
  const [postReviews, setPostReviews] = useState<Record<string, { status: string; comment: string }>>({});
  const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [emojiReactions, setEmojiReactions] = useState<Record<string, Record<EmojiType, number>>>({});

  useEffect(() => {
    // Find plan by token
    const foundPlan = mockPlans.find(p => p.share_token === params.token);
    if (foundPlan) {
      setPlan(foundPlan);

      // Initialize reviews from existing post data
      const initialReviews: Record<string, { status: string; comment: string }> = {};
      foundPlan.posts.forEach(post => {
        initialReviews[post.id] = {
          status: post.review_status,
          comment: post.review_comment || '',
        };
      });
      setPostReviews(initialReviews);
    }
  }, [params.token]);

  const handleApprove = (postId: string) => {
    setPostReviews(prev => ({
      ...prev,
      [postId]: { status: 'approved', comment: '' }
    }));
    setActiveCommentBox(null);
    setCommentDrafts(prev => ({ ...prev, [postId]: '' }));
  };

  const handleReject = (postId: string) => {
    setActiveCommentBox(postId);
  };

  const handleComment = (postId: string) => {
    setActiveCommentBox(postId);
  };

  const handleSubmitComment = (postId: string) => {
    const comment = commentDrafts[postId] || '';
    if (comment.trim()) {
      setPostReviews(prev => ({
        ...prev,
        [postId]: { status: 'changes_requested', comment }
      }));
      setActiveCommentBox(null);
    }
  };

  const handleCancelComment = (postId: string) => {
    setActiveCommentBox(null);
    setCommentDrafts(prev => ({ ...prev, [postId]: '' }));
  };

  const handleCommentChange = (postId: string, value: string) => {
    setCommentDrafts(prev => ({ ...prev, [postId]: value }));
  };

  const handleEmojiReaction = (postId: string, emoji: EmojiType) => {
    setEmojiReactions(prev => {
      const postReactions = prev[postId] || { '👍': 0, '👎': 0, '❤️': 0, '🔥': 0, '😍': 0 };
      const currentCount = postReactions[emoji] || 0;

      return {
        ...prev,
        [postId]: {
          ...postReactions,
          [emoji]: currentCount + 1
        }
      };
    });
  };

  if (!plan) {
    return (
      <PageContainer $darkMode={false}>
        <ShareCard $darkMode={false}>
          <Content>
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <AlertCircle size={48} style={{ color: '#EF4444', margin: '0 auto 16px' }} />
              <h2>Plan Not Found</h2>
              <p style={{ color: '#6B7280' }}>This link may have expired or the plan doesn't exist.</p>
            </div>
          </Content>
        </ShareCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer $darkMode={false}>
      <ShareCard $darkMode={false}>
        <Header>
          <Title>{plan.title}</Title>
          <Description>{plan.description}</Description>
          {plan.expires_at && (
            <ExpiryNotice>
              <Clock />
              Expires: {new Date(plan.expires_at).toLocaleDateString()}
            </ExpiryNotice>
          )}
        </Header>

        <Content>
          <Instructions $darkMode={false}>
            <InstructionTitle>How to Review</InstructionTitle>
            <InstructionList $darkMode={false}>
              <li>Review each post carefully, including the caption, image/video, and scheduled date</li>
              <li>Click "Approve" if the post looks good to publish</li>
              <li>Click "Request Changes" to provide feedback on what needs to be modified</li>
              <li>Add detailed comments to help us understand your requested changes</li>
              <li>You can change your review at any time before the plan expires</li>
            </InstructionList>
          </Instructions>

          <PostsGrid>
            {plan.posts.map(post => {
              const review = postReviews[post.id];
              const showCommentBox = activeCommentBox === post.id;

              return (
                <PostCard key={post.id} $status={review?.status} $darkMode={false}>
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

                  <PostContent>
                    <PostHeader>
                      <PlatformBadge $platform={post.platform}>
                        {getPlatformIcon(post.platform)}
                        {getPlatformName(post.platform)}
                      </PlatformBadge>

                      <PostDateBadge $darkMode={false}>
                        <Calendar size={12} />
                        {post.proposed_date?.toLocaleDateString()} at{' '}
                        {post.proposed_date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </PostDateBadge>
                    </PostHeader>

                    <PostCaption $darkMode={false}>{post.caption}</PostCaption>

                    <ReviewSection>
                      {/* Emoji Quick Reactions */}
                      <EmojiReactions>
                        <QuickReactLabel>Quick React:</QuickReactLabel>
                        {(['👍', '👎', '❤️', '🔥', '😍'] as EmojiType[]).map(emoji => {
                          const reactions = emojiReactions[post.id] || {};
                          const count = reactions[emoji] || 0;
                          return (
                            <EmojiButton
                              key={emoji}
                              onClick={() => handleEmojiReaction(post.id, emoji)}
                              $active={count > 0}
                            >
                              <span className="emoji">{emoji}</span>
                              {count > 0 && <span className="count">{count}</span>}
                            </EmojiButton>
                          );
                        })}
                      </EmojiReactions>

                      {review?.status === 'pending' ? (
                        <>
                          <ReviewActions>
                            <ActionButton $variant="approve" onClick={() => handleApprove(post.id)}>
                              <ThumbsUp />
                              Approve
                            </ActionButton>
                            <ActionButton $variant="comment" onClick={() => handleComment(post.id)}>
                              <MessageCircle />
                              Add Comment
                            </ActionButton>
                          </ReviewActions>

                          <CommentBox $show={showCommentBox}>
                            <CommentTextarea
                              placeholder="What changes would you like to see? (e.g., different image, updated caption, change posting time...)"
                              value={commentDrafts[post.id] || ''}
                              onChange={(e) => handleCommentChange(post.id, e.target.value)}
                            />
                            <CommentActions>
                              <CommentButton
                                $variant="primary"
                                onClick={() => handleSubmitComment(post.id)}
                              >
                                <Send />
                                Submit Feedback
                              </CommentButton>
                              <CommentButton
                                $variant="secondary"
                                onClick={() => handleCancelComment(post.id)}
                              >
                                <X />
                                Cancel
                              </CommentButton>
                            </CommentActions>
                          </CommentBox>
                        </>
                      ) : (
                        <>
                          <StatusBadge $status={review?.status}>
                            {review?.status === 'approved' ? (
                              <>
                                <CheckCircle2 />
                                Approved
                              </>
                            ) : (
                              <>
                                <AlertCircle />
                                Changes Requested
                              </>
                            )}
                          </StatusBadge>

                          {review?.comment && (
                            <ReviewComment>
                              <CommentLabel>Your Feedback:</CommentLabel>
                              <CommentText>{review.comment}</CommentText>
                            </ReviewComment>
                          )}

                          <ReviewActions style={{ marginTop: '12px' }}>
                            <ActionButton
                              $variant="approve"
                              onClick={() => handleApprove(post.id)}
                            >
                              <ThumbsUp />
                              Approve
                            </ActionButton>
                            <ActionButton
                              $variant="comment"
                              onClick={() => handleComment(post.id)}
                            >
                              <MessageCircle />
                              Edit Comment
                            </ActionButton>
                          </ReviewActions>
                        </>
                      )}
                    </ReviewSection>
                  </PostContent>
                </PostCard>
              );
            })}
          </PostsGrid>
        </Content>
      </ShareCard>
    </PageContainer>
  );
}
