/**
 * Public Calendar Share Page
 *
 * Public page for viewing shared calendars
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styled from 'styled-components';
import { Download, Calendar, Lock, Eye, MessageSquare, CheckCircle, TrendingUp, Hash, ThumbsUp, ThumbsDown, Send, X } from 'lucide-react';
import { showToast } from '@/components/ui/Toast';

export default function ShareCalendarPage() {
  const params = useParams();
  const token = params.token;

  const [state, setState] = useState('loading'); // loading, password, display, error
  const [shareData, setShareData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState({});
  const [approvals, setApprovals] = useState({});
  const [commentForms, setCommentForms] = useState({});
  const [approveForms, setApproveForms] = useState({});
  const [viewingPost, setViewingPost] = useState(null);

  useEffect(() => {
    fetchShare();
  }, [token]);

  const fetchShare = async (passwordAttempt = null) => {
    try {
      setIsSubmitting(true);
      setPasswordError('');

      const response = await fetch(`/api/calendar/share/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: passwordAttempt || password,
        }),
      });

      const data = await response.json();

      if (response.status === 401 && data.requiresPassword) {
        setState('password');
        if (passwordAttempt) {
          setPasswordError(data.error || 'Incorrect password');
        }
        return;
      }

      if (response.status === 410) {
        setState('error');
        showToast.error('This calendar share has expired');
        return;
      }

      if (response.status === 403) {
        setState('error');
        showToast.error('This calendar share has reached its view limit');
        return;
      }

      if (response.status === 404) {
        setState('error');
        showToast.error('Calendar share not found');
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load calendar');
      }

      setShareData(data.share);
      setPosts(data.posts || []);

      // Group comments and approvals by post ID
      const commentsByPost = {};
      (data.comments || []).forEach(comment => {
        if (!commentsByPost[comment.post_id]) {
          commentsByPost[comment.post_id] = [];
        }
        commentsByPost[comment.post_id].push(comment);
      });
      setComments(commentsByPost);

      const approvalsByPost = {};
      (data.approvals || []).forEach(approval => {
        if (!approvalsByPost[approval.post_id]) {
          approvalsByPost[approval.post_id] = [];
        }
        approvalsByPost[approval.post_id].push(approval);
      });
      setApprovals(approvalsByPost);

      setState('display');

    } catch (error) {
      console.error('Error fetching share:', error);
      setState('error');
      showToast.error(error.message || 'Failed to load calendar share');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError('Please enter a password');
      return;
    }
    fetchShare(password);
  };

  const handleDownload = () => {
    window.open(`/api/calendar/share/${token}/export`, '_blank');
    showToast.success('Downloading calendar...');
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();

    const form = commentForms[postId];
    if (!form || !form.name || !form.email || !form.comment) {
      showToast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`/api/calendar/share/${token}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          authorName: form.name,
          authorEmail: form.email,
          comment: form.comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit comment');
      }

      showToast.success('Comment submitted successfully');

      // Add new comment to list
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data.comment],
      }));

      // Clear form
      setCommentForms(prev => ({
        ...prev,
        [postId]: { name: '', email: '', comment: '' },
      }));

    } catch (error) {
      console.error('Error submitting comment:', error);
      showToast.error(error.message || 'Failed to submit comment');
    }
  };

  const handleApprovalSubmit = async (postId, approved) => {
    const form = approveForms[postId];
    if (!form || !form.name || !form.email) {
      showToast.error('Please enter your name and email');
      return;
    }

    try {
      const response = await fetch(`/api/calendar/share/${token}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          approved,
          approverName: form.name,
          approverEmail: form.email,
          feedback: form.feedback || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit approval');
      }

      showToast.success(data.message);

      // Add new approval to list
      setApprovals(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data.approval],
      }));

      // Clear form
      setApproveForms(prev => ({
        ...prev,
        [postId]: { name: '', email: '', feedback: '' },
      }));

    } catch (error) {
      console.error('Error submitting approval:', error);
      showToast.error(error.message || 'Failed to submit approval');
    }
  };

  const updateCommentForm = (postId, field, value) => {
    setCommentForms(prev => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || {}),
        [field]: value,
      },
    }));
  };

  const updateApproveForm = (postId, field, value) => {
    setApproveForms(prev => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || {}),
        [field]: value,
      },
    }));
  };

  // STATE 1: Password Required
  if (state === 'password') {
    return (
      <PasswordOverlay>
        <PasswordModal>
          <PasswordIcon>
            <Lock size={48} />
          </PasswordIcon>
          <PasswordTitle>Password Required</PasswordTitle>
          <PasswordDescription>
            This calendar is password protected. Please enter the password to continue.
          </PasswordDescription>

          <PasswordForm onSubmit={handlePasswordSubmit}>
            <PasswordInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              disabled={isSubmitting}
            />
            {passwordError && (
              <ErrorMessage>{passwordError}</ErrorMessage>
            )}
            <PasswordButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Access Calendar'}
            </PasswordButton>
          </PasswordForm>
        </PasswordModal>
      </PasswordOverlay>
    );
  }

  // STATE 2: Loading
  if (state === 'loading') {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading calendar...</LoadingText>
      </LoadingContainer>
    );
  }

  // Error State
  if (state === 'error') {
    return (
      <ErrorContainer>
        <ErrorIcon>
          <Calendar size={64} />
        </ErrorIcon>
        <ErrorTitle>Unable to Load Calendar</ErrorTitle>
        <ErrorDescription>
          This calendar may have expired, been deleted, or you don't have permission to access it.
        </ErrorDescription>
      </ErrorContainer>
    );
  }

  // STATE 3: Calendar Display
  if (!shareData) return null;

  const brandColor = shareData.brand_color || '#8B5CF6';

  return (
    <PageContainer $brandColor={brandColor}>
      <Header>
        {shareData.logo_url && (
          <Logo
            src={shareData.logo_url}
            alt={shareData.company_name || 'Logo'}
            $size={shareData.logo_size || 'medium'}
          />
        )}

        <Title $brandColor={brandColor}>{shareData.title}</Title>

        {shareData.description && (
          <Description>{shareData.description}</Description>
        )}

        <HeaderMeta>
          <MetaItem>
            <Calendar size={16} />
            <span>
              {new Date(shareData.start_date).toLocaleDateString()} - {new Date(shareData.end_date).toLocaleDateString()}
            </span>
          </MetaItem>
          <MetaItem>
            <Eye size={16} />
            <span>{posts.length} posts</span>
          </MetaItem>
        </HeaderMeta>

        {shareData.allow_download && (
          <DownloadButton onClick={handleDownload}>
            <Download size={18} />
            Download Excel
          </DownloadButton>
        )}
      </Header>

      <CalendarGrid>
        <CalendarHeader>
          <CalendarTitle>Content Calendar</CalendarTitle>
          <PostCount>{posts.length} Posts</PostCount>
        </CalendarHeader>

        {posts.length === 0 ? (
          <EmptyState>
            <Calendar size={48} />
            <EmptyText>No posts found in this date range</EmptyText>
          </EmptyState>
        ) : (
          <PostsList>
            {posts.map((post) => (
              <PostCard key={post.id}>
                <PostHeader>
                  <PostDate>
                    <Calendar size={16} />
                    <span>
                      {new Date(post.scheduled_for).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <PostTime>
                      {new Date(post.scheduled_for).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </PostTime>
                  </PostDate>

                  <PostMeta>
                    {post.platforms && post.platforms.length > 0 ? (
                      post.platforms.map((platform, idx) => (
                        <PlatformBadge key={idx} $platform={platform}>
                          {platform}
                        </PlatformBadge>
                      ))
                    ) : (
                      <PlatformBadge $platform="default">
                        Social
                      </PlatformBadge>
                    )}

                    <StatusBadge $status={post.status}>
                      {post.status}
                    </StatusBadge>
                  </PostMeta>
                </PostHeader>

                {/* Content Type */}
                {post.post_media && post.post_media.length > 0 && (
                  <ContentType>
                    {post.post_media.some(m => m.mime_type?.startsWith('video/')) && '🎥 Video'}
                    {post.post_media.some(m => m.mime_type?.startsWith('image/')) &&
                      (post.post_media.length > 1 ? '🖼️ Carousel' : '🖼️ Image')}
                  </ContentType>
                )}

                {/* Caption */}
                {post.content && (
                  <PostContent onClick={() => setViewingPost(post)}>
                    {post.content.split('\n').map((line, i) => {
                      if (line.startsWith('#')) {
                        return (
                          <Hashtags key={i}>
                            {line.split(' ').map((word, j) =>
                              word.startsWith('#') ? (
                                <Hashtag key={j}>
                                  <Hash size={12} />
                                  {word.substring(1)}
                                </Hashtag>
                              ) : (
                                <span key={j}>{word} </span>
                              )
                            )}
                          </Hashtags>
                        );
                      }
                      return <p key={i}>{line}</p>;
                    })}
                  </PostContent>
                )}

                {/* Analytics */}
                {shareData.show_analytics && post.analytics && (
                  <Analytics>
                    <AnalyticsTitle>Performance</AnalyticsTitle>
                    <AnalyticsGrid>
                      <AnalyticItem>
                        <AnalyticIcon>❤️</AnalyticIcon>
                        <AnalyticValue>{post.analytics.likes_count?.toLocaleString() || 0}</AnalyticValue>
                        <AnalyticLabel>Likes</AnalyticLabel>
                      </AnalyticItem>

                      <AnalyticItem>
                        <AnalyticIcon>💬</AnalyticIcon>
                        <AnalyticValue>{post.analytics.comments_count?.toLocaleString() || 0}</AnalyticValue>
                        <AnalyticLabel>Comments</AnalyticLabel>
                      </AnalyticItem>

                      <AnalyticItem>
                        <AnalyticIcon>🔄</AnalyticIcon>
                        <AnalyticValue>{post.analytics.shares_count?.toLocaleString() || 0}</AnalyticValue>
                        <AnalyticLabel>Shares</AnalyticLabel>
                      </AnalyticItem>

                      {post.analytics.reach > 0 && (
                        <AnalyticItem>
                          <AnalyticIcon><TrendingUp size={16} /></AnalyticIcon>
                          <AnalyticValue>{post.analytics.reach?.toLocaleString() || 0}</AnalyticValue>
                          <AnalyticLabel>Reach</AnalyticLabel>
                        </AnalyticItem>
                      )}
                    </AnalyticsGrid>
                  </Analytics>
                )}

                {/* Media Preview */}
                {post.post_media && post.post_media.length > 0 && (
                  <MediaGrid $count={post.post_media.length} onClick={() => setViewingPost(post)}>
                    {post.post_media.slice(0, 4).map((media, index) => (
                      <MediaThumbnail
                        key={media.id}
                        src={media.thumbnail_url || media.file_url}
                        alt={`Media ${index + 1}`}
                        $isVideo={media.mime_type?.startsWith('video/')}
                      />
                    ))}
                    {post.post_media.length > 4 && (
                      <MoreMedia>+{post.post_media.length - 4}</MoreMedia>
                    )}
                  </MediaGrid>
                )}

                {/* Approvals Section */}
                {shareData.permission_level === 'approve' && (
                  <ApprovalSection>
                    <SectionTitle>
                      <CheckCircle size={16} />
                      Approval Status
                    </SectionTitle>

                    {/* Display existing approvals */}
                    {approvals[post.id] && approvals[post.id].length > 0 && (
                      <ApprovalsList>
                        {approvals[post.id].map((approval) => (
                          <ApprovalItem key={approval.id} $approved={approval.approved}>
                            <ApprovalHeader>
                              {approval.approved ? (
                                <ThumbsUp size={16} />
                              ) : (
                                <ThumbsDown size={16} />
                              )}
                              <ApprovalAuthor>{approval.approver_name}</ApprovalAuthor>
                              <ApprovalStatus $approved={approval.approved}>
                                {approval.approved ? 'Approved' : 'Rejected'}
                              </ApprovalStatus>
                            </ApprovalHeader>
                            {approval.feedback && (
                              <ApprovalFeedback>{approval.feedback}</ApprovalFeedback>
                            )}
                            <ApprovalDate>
                              {new Date(approval.created_at).toLocaleDateString()}
                            </ApprovalDate>
                          </ApprovalItem>
                        ))}
                      </ApprovalsList>
                    )}

                    {/* Approval form */}
                    <ApprovalForm>
                      <FormRow>
                        <FormInput
                          type="text"
                          placeholder="Your name"
                          value={approveForms[post.id]?.name || ''}
                          onChange={(e) => updateApproveForm(post.id, 'name', e.target.value)}
                        />
                        <FormInput
                          type="email"
                          placeholder="Your email"
                          value={approveForms[post.id]?.email || ''}
                          onChange={(e) => updateApproveForm(post.id, 'email', e.target.value)}
                        />
                      </FormRow>
                      <FormTextarea
                        placeholder="Feedback (optional)"
                        value={approveForms[post.id]?.feedback || ''}
                        onChange={(e) => updateApproveForm(post.id, 'feedback', e.target.value)}
                        rows={2}
                      />
                      <ApprovalButtons>
                        <ApproveButton
                          type="button"
                          onClick={() => handleApprovalSubmit(post.id, true)}
                        >
                          <ThumbsUp size={16} />
                          Approve
                        </ApproveButton>
                        <RejectButton
                          type="button"
                          onClick={() => handleApprovalSubmit(post.id, false)}
                        >
                          <ThumbsDown size={16} />
                          Reject
                        </RejectButton>
                      </ApprovalButtons>
                    </ApprovalForm>
                  </ApprovalSection>
                )}

                {/* Comments Section */}
                {['comment', 'approve'].includes(shareData.permission_level) && (
                  <CommentsSection>
                    <SectionTitle>
                      <MessageSquare size={16} />
                      Comments {comments[post.id] && `(${comments[post.id].length})`}
                    </SectionTitle>

                    {/* Display existing comments */}
                    {comments[post.id] && comments[post.id].length > 0 && (
                      <CommentsList>
                        {comments[post.id].map((comment) => (
                          <CommentItem key={comment.id}>
                            <CommentHeader>
                              <CommentAuthor>{comment.author_name}</CommentAuthor>
                              <CommentDate>
                                {new Date(comment.created_at).toLocaleDateString()}
                              </CommentDate>
                            </CommentHeader>
                            <CommentText>{comment.comment}</CommentText>
                          </CommentItem>
                        ))}
                      </CommentsList>
                    )}

                    {/* Comment form */}
                    <CommentForm onSubmit={(e) => handleCommentSubmit(post.id, e)}>
                      <FormRow>
                        <FormInput
                          type="text"
                          placeholder="Your name"
                          value={commentForms[post.id]?.name || ''}
                          onChange={(e) => updateCommentForm(post.id, 'name', e.target.value)}
                          required
                        />
                        <FormInput
                          type="email"
                          placeholder="Your email"
                          value={commentForms[post.id]?.email || ''}
                          onChange={(e) => updateCommentForm(post.id, 'email', e.target.value)}
                          required
                        />
                      </FormRow>
                      <FormTextarea
                        placeholder="Add a comment..."
                        value={commentForms[post.id]?.comment || ''}
                        onChange={(e) => updateCommentForm(post.id, 'comment', e.target.value)}
                        rows={3}
                        required
                      />
                      <SubmitButton type="submit">
                        <Send size={16} />
                        Submit Comment
                      </SubmitButton>
                    </CommentForm>
                  </CommentsSection>
                )}
              </PostCard>
            ))}
          </PostsList>
        )}
      </CalendarGrid>

      {shareData.company_name && (
        <Footer>
          <FooterText>
            Powered by <strong>{shareData.company_name}</strong>
          </FooterText>
        </Footer>
      )}

      {/* Post Detail Modal */}
      {viewingPost && (
        <ModalOverlay onClick={() => setViewingPost(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {viewingPost.platforms && viewingPost.platforms.length > 0 && (
                  <ModalPlatformBadges>
                    {viewingPost.platforms.map((platform, idx) => (
                      <PlatformBadge key={idx} $platform={platform}>
                        {platform}
                      </PlatformBadge>
                    ))}
                  </ModalPlatformBadges>
                )}
                Post Details
              </ModalTitle>
              <CloseButton onClick={() => setViewingPost(null)}>
                <X />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              {/* Media Gallery */}
              {viewingPost.post_media && viewingPost.post_media.length > 0 && (
                <ModalMediaGallery>
                  {viewingPost.post_media.map((media, index) => (
                    <ModalMediaItem key={media.id || index}>
                      {media.mime_type?.startsWith('video/') ? (
                        <video
                          src={media.file_url}
                          controls
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <img
                          src={media.file_url}
                          alt={`Media ${index + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      )}
                    </ModalMediaItem>
                  ))}
                </ModalMediaGallery>
              )}

              {/* Content */}
              {viewingPost.content && (
                <div>
                  <ModalSectionLabel>Content</ModalSectionLabel>
                  <ModalPostContent>
                    {viewingPost.content.split('\n').map((line, i) => {
                      if (line.startsWith('#')) {
                        return (
                          <Hashtags key={i}>
                            {line.split(' ').map((word, j) =>
                              word.startsWith('#') ? (
                                <Hashtag key={j}>
                                  <Hash size={12} />
                                  {word.substring(1)}
                                </Hashtag>
                              ) : (
                                <span key={j}>{word} </span>
                              )
                            )}
                          </Hashtags>
                        );
                      }
                      return <p key={i}>{line}</p>;
                    })}
                  </ModalPostContent>
                </div>
              )}

              {/* Scheduled Date */}
              <div>
                <ModalSectionLabel>Scheduled For</ModalSectionLabel>
                <ModalInfo>
                  <Calendar size={16} />
                  {new Date(viewingPost.scheduled_for).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </ModalInfo>
              </div>

              {/* Status */}
              <div>
                <ModalSectionLabel>Status</ModalSectionLabel>
                <ModalInfo>
                  <StatusBadge $status={viewingPost.status}>
                    {viewingPost.status}
                  </StatusBadge>
                </ModalInfo>
              </div>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
}

// Styled Components

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.$brandColor}10;
  padding: 40px 20px;
`;

const Header = styled.header`
  max-width: 1200px;
  margin: 0 auto 40px;
  text-align: center;
`;

const Logo = styled.img`
  height: ${props => {
    if (props.$size === 'small') return '40px';
    if (props.$size === 'large') return '80px';
    return '60px'; // medium (default)
  }};
  margin-bottom: 20px;
  object-fit: contain;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.$brandColor};
  margin: 0 0 16px 0;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Description = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0 0 24px 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const HeaderMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.875rem;

  svg {
    color: #9ca3af;
  }
`;

const DownloadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #8B5CF6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #7C3AED;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
`;

const CalendarGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 32px;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
`;

const CalendarTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const PostCount = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const PostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PostCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;

  &:hover {
    border-color: #8B5CF6;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
`;

const PostDate = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;

  svg {
    color: #8B5CF6;
  }
`;

const PostTime = styled.span`
  color: #6b7280;
  font-weight: 400;
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PlatformBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  background-color: ${props => {
    const colors = {
      instagram: '#E1306C',
      facebook: '#1877F2',
      twitter: '#1DA1F2',
      linkedin: '#0A66C2',
      default: '#6b7280',
    };
    return colors[props.$platform] || colors.default;
  }}20;
  color: ${props => {
    const colors = {
      instagram: '#E1306C',
      facebook: '#1877F2',
      twitter: '#1DA1F2',
      linkedin: '#0A66C2',
      default: '#6b7280',
    };
    return colors[props.$platform] || colors.default;
  }};
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  background-color: ${props => props.$status === 'published' ? '#10b98120' : '#f59e0b20'};
  color: ${props => props.$status === 'published' ? '#10b981' : '#f59e0b'};
`;

const ContentType = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 8px;
`;

const PostContent = styled.div`
  color: #374151;
  line-height: 1.6;
  margin-bottom: 12px;
  white-space: pre-wrap;
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 8px;
  border-radius: 4px;

  &:hover {
    background-color: #f9fafb;
  }

  p {
    margin: 0 0 8px 0;
  }
`;

const Hashtags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Hashtag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: #8B5CF610;
  color: #8B5CF6;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const Analytics = styled.div`
  margin-top: 16px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
`;

const AnalyticsTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
`;

const AnalyticItem = styled.div`
  text-align: center;
`;

const AnalyticIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AnalyticValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
`;

const AnalyticLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => Math.min(props.$count, 4)}, 1fr);
  gap: 8px;
  margin-top: 16px;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const MediaThumbnail = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  position: relative;

  ${props => props.$isVideo && `
    &::after {
      content: '▶';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.6);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `}
`;

const MoreMedia = styled.div`
  width: 100%;
  height: 150px;
  background-color: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: #6b7280;
`;

const Footer = styled.footer`
  max-width: 1200px;
  margin: 40px auto 0;
  text-align: center;
`;

const FooterText = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
`;

const EmptyText = styled.p`
  margin-top: 16px;
  font-size: 1rem;
`;

// Password Modal Styles

const PasswordOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const PasswordModal = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const PasswordIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background-color: #8B5CF610;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8B5CF6;
`;

const PasswordTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
`;

const PasswordDescription = styled.p`
  color: #6b7280;
  margin: 0 0 24px 0;
  font-size: 0.875rem;
`;

const PasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PasswordInput = styled.input`
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #8B5CF6;
    box-shadow: 0 0 0 3px #8B5CF620;
  }

  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  text-align: left;
`;

const PasswordButton = styled.button`
  padding: 12px;
  background-color: #8B5CF6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: #7C3AED;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Loading Styles

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #8B5CF6;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  margin-top: 16px;
  color: #6b7280;
  font-size: 1rem;
`;

// Error Styles

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  padding: 20px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  color: #9ca3af;
  margin-bottom: 20px;
`;

const ErrorTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
`;

const ErrorDescription = styled.p`
  color: #6b7280;
  max-width: 400px;
  margin: 0;
`;

// Comments and Approvals Styles

const CommentsSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
`;

const ApprovalSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
`;

const SectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #8B5CF6;
  }
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const CommentItem = styled.div`
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #8B5CF6;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const CommentAuthor = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
`;

const CommentDate = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const CommentText = styled.p`
  font-size: 0.875rem;
  color: #374151;
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ApprovalForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormInput = styled.input`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1f2937;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #8B5CF6;
    box-shadow: 0 0 0 3px #8B5CF620;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const FormTextarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1f2937;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #8B5CF6;
    box-shadow: 0 0 0 3px #8B5CF620;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #8B5CF6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;

  &:hover {
    background-color: #7C3AED;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ApprovalsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const ApprovalItem = styled.div`
  padding: 12px;
  background-color: ${props => props.$approved ? '#10b98110' : '#ef444410'};
  border-radius: 8px;
  border-left: 3px solid ${props => props.$approved ? '#10b981' : '#ef4444'};
`;

const ApprovalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  svg {
    color: ${props => props.color || '#6b7280'};
  }
`;

const ApprovalAuthor = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
`;

const ApprovalStatus = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: ${props => props.$approved ? '#10b98120' : '#ef444420'};
  color: ${props => props.$approved ? '#10b981' : '#ef4444'};
`;

const ApprovalFeedback = styled.p`
  font-size: 0.875rem;
  color: #374151;
  margin: 8px 0 0 0;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const ApprovalDate = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 8px;
`;

const ApprovalButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ApproveButton = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #059669;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const RejectButton = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #dc2626;
  }

  &:active {
    transform: scale(0.98);
  }
`;

// Modal Styles

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  position: sticky;
  top: 0;
  background: ${props => props.theme.colors.background.paper};
  z-index: 1;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ModalPlatformBadges = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background.elevated};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ModalMediaGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const ModalMediaItem = styled.div`
  width: 100%;
  height: 200px;
  background: ${props => props.theme.colors.background.elevated};
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img, video {
    max-width: 100%;
    max-height: 100%;
  }
`;

const ModalSectionLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const ModalPostContent = styled.div`
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.6;
  white-space: pre-wrap;

  p {
    margin: 0 0 8px 0;
  }
`;

const ModalInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 0.875rem;

  svg {
    color: #8B5CF6;
  }
`;
