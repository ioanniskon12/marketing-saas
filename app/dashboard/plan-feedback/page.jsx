'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MessageSquare, CheckCircle, XCircle, Eye, Calendar, ExternalLink, Mail, User, Clock, Play, Image } from 'lucide-react';
import { PageSpinner } from '@/components/ui';
import { PLATFORM_CONFIG } from '@/lib/config/platforms';
import NotificationSettings from '@/components/notifications/NotificationSettings';

export default function PlanFeedbackPage() {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShare, setSelectedShare] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, comments, approvals

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/share/feedback');
      const data = await response.json();

      if (data.success) {
        setShares(data.shares);
        if (data.shares.length > 0 && !selectedShare) {
          setSelectedShare(data.shares[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredActivities = (share) => {
    if (!share) return [];

    const activities = [];

    // Add comments
    share.comments.forEach(comment => {
      activities.push({
        type: 'comment',
        id: comment.id,
        author: comment.author_name,
        email: comment.author_email,
        content: comment.comment,
        postId: comment.post_id,
        post: comment.post,
        createdAt: comment.created_at,
      });
    });

    // Add approvals
    share.approvals.forEach(approval => {
      activities.push({
        type: approval.approved ? 'approval' : 'rejection',
        id: approval.id,
        author: approval.approver_name,
        email: approval.approver_email,
        content: approval.feedback,
        postId: approval.post_id,
        post: approval.post,
        createdAt: approval.created_at,
      });
    });

    // Filter by type
    const filtered = filterType === 'all'
      ? activities
      : filterType === 'comments'
      ? activities.filter(a => a.type === 'comment')
      : activities.filter(a => a.type === 'approval' || a.type === 'rejection');

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'comment':
        return <MessageSquare size={16} />;
      case 'approval':
        return <CheckCircle size={16} />;
      case 'rejection':
        return <XCircle size={16} />;
      default:
        return <MessageSquare size={16} />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'comment':
        return '#ff8c42';
      case 'approval':
        return '#10b981';
      case 'rejection':
        return '#ef4444';
      default:
        return '#ff8c42';
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return <PageSpinner label="Loading..." />;
  }

  if (shares.length === 0) {
    return (
      <PageContainer>
        <Header>
          <Title>📊 Plan Feedback Dashboard</Title>
          <Description>No shared plans yet</Description>
        </Header>
        <EmptyState>
          <EmptyIcon>📭</EmptyIcon>
          <EmptyTitle>No Shared Plans</EmptyTitle>
          <EmptyDescription>
            Share your content calendar with clients to start receiving feedback and approvals.
          </EmptyDescription>
        </EmptyState>
      </PageContainer>
    );
  }

  const activities = getFilteredActivities(selectedShare);

  return (
    <PageContainer>
      <Header>
        <div>
          <Title>📊 Plan Feedback Dashboard</Title>
          <Description>View comments and approvals from shared plans</Description>
        </div>
      </Header>

      <NotificationSettings />

      <ContentLayout>
        {/* Left Sidebar - Shared Plans List */}
        <Sidebar>
          <SidebarHeader>
            <SidebarTitle>Shared Plans ({shares.length})</SidebarTitle>
          </SidebarHeader>

          <SharesList>
            {shares.map((share) => (
              <ShareCard
                key={share.id}
                $active={selectedShare?.id === share.id}
                onClick={() => setSelectedShare(share)}
              >
                <ShareCardHeader>
                  <ShareCardTitle>{share.title || 'Untitled Plan'}</ShareCardTitle>
                  {share.isExpired && <ExpiredBadge>Expired</ExpiredBadge>}
                </ShareCardHeader>

                <ShareCardStats>
                  <Stat>
                    <Eye size={14} />
                    <span>{share.stats.viewCount} views</span>
                  </Stat>
                  <Stat>
                    <MessageSquare size={14} />
                    <span>{share.stats.totalComments}</span>
                  </Stat>
                  <Stat>
                    <CheckCircle size={14} />
                    <span>{share.stats.totalApprovals}</span>
                  </Stat>
                  {share.stats.totalRejections > 0 && (
                    <Stat>
                      <XCircle size={14} />
                      <span>{share.stats.totalRejections}</span>
                    </Stat>
                  )}
                </ShareCardStats>

                <ShareCardMeta>
                  <Clock size={12} />
                  <span>{formatDate(share.created_at)}</span>
                </ShareCardMeta>
              </ShareCard>
            ))}
          </SharesList>
        </Sidebar>

        {/* Main Content - Feedback Details */}
        <MainContent>
          {selectedShare && (
            <>
              <ContentHeader>
                <div>
                  <ContentTitle>{selectedShare.title || 'Untitled Plan'}</ContentTitle>
                  <ShareLink>
                    <a
                      href={`/share/plan/${selectedShare.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View shared page <ExternalLink size={14} />
                    </a>
                  </ShareLink>
                </div>

                <StatsGrid>
                  <StatCard>
                    <StatIcon $color="#ff8c42">
                      <Eye size={20} />
                    </StatIcon>
                    <StatValue>{selectedShare.stats.viewCount}</StatValue>
                    <StatLabel>Views</StatLabel>
                  </StatCard>

                  <StatCard>
                    <StatIcon $color="#ff8c42">
                      <MessageSquare size={20} />
                    </StatIcon>
                    <StatValue>{selectedShare.stats.totalComments}</StatValue>
                    <StatLabel>Comments</StatLabel>
                  </StatCard>

                  <StatCard>
                    <StatIcon $color="#10b981">
                      <CheckCircle size={20} />
                    </StatIcon>
                    <StatValue>{selectedShare.stats.totalApprovals}</StatValue>
                    <StatLabel>Approvals</StatLabel>
                  </StatCard>

                  <StatCard>
                    <StatIcon $color="#ef4444">
                      <XCircle size={20} />
                    </StatIcon>
                    <StatValue>{selectedShare.stats.totalRejections}</StatValue>
                    <StatLabel>Rejections</StatLabel>
                  </StatCard>
                </StatsGrid>
              </ContentHeader>

              <FilterBar>
                <FilterLabel>Filter by:</FilterLabel>
                <FilterButtons>
                  <FilterButton
                    $active={filterType === 'all'}
                    onClick={() => setFilterType('all')}
                  >
                    All Activity
                  </FilterButton>
                  <FilterButton
                    $active={filterType === 'comments'}
                    onClick={() => setFilterType('comments')}
                  >
                    Comments Only
                  </FilterButton>
                  <FilterButton
                    $active={filterType === 'approvals'}
                    onClick={() => setFilterType('approvals')}
                  >
                    Approvals/Rejections
                  </FilterButton>
                </FilterButtons>
              </FilterBar>

              <ActivitiesList>
                {activities.length === 0 ? (
                  <EmptyActivities>
                    <EmptyIcon>📭</EmptyIcon>
                    <EmptyTitle>No {filterType === 'all' ? 'activity' : filterType} yet</EmptyTitle>
                    <EmptyDescription>
                      {filterType === 'all'
                        ? 'Waiting for comments and approvals from clients.'
                        : `No ${filterType} have been received yet.`}
                    </EmptyDescription>
                  </EmptyActivities>
                ) : (
                  activities.map((activity) => {
                    const post = activity.post;
                    const hasMedia = post?.post_media && post.post_media.length > 0;
                    const firstMedia = hasMedia ? post.post_media[0] : null;
                    const isVideo = firstMedia && (firstMedia.mime_type?.startsWith('video/') || firstMedia.media_type === 'video');
                    const platform = post?.platforms?.[0] ? PLATFORM_CONFIG[post.platforms[0]] : null;

                    return (
                      <ActivityCard key={`${activity.type}-${activity.id}`} $color={getActivityColor(activity.type)}>
                        <ActivityLayout>
                          {/* Post Preview */}
                          {post && (
                            <PostPreview>
                              <PostMediaWrapper>
                                {hasMedia ? (
                                  isVideo ? (
                                    <>
                                      <PostMedia
                                        src={firstMedia.thumbnail_url || firstMedia.file_url}
                                        alt="Post media"
                                      />
                                      <VideoIndicator>
                                        <Play size={16} />
                                      </VideoIndicator>
                                    </>
                                  ) : (
                                    <PostMedia src={firstMedia.file_url} alt="Post media" />
                                  )
                                ) : (
                                  <NoMediaPreview>
                                    <Image size={24} />
                                  </NoMediaPreview>
                                )}
                                {platform && (
                                  <PlatformBadge $color={platform.color}>
                                    <platform.icon size={12} />
                                  </PlatformBadge>
                                )}
                              </PostMediaWrapper>
                              <PostCaption>
                                {post.content?.substring(0, 100)}{post.content?.length > 100 ? '...' : ''}
                              </PostCaption>
                              {post.scheduled_for && (
                                <PostSchedule>
                                  <Calendar size={12} />
                                  {new Date(post.scheduled_for).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </PostSchedule>
                              )}
                            </PostPreview>
                          )}

                          {/* Feedback Content */}
                          <FeedbackSection>
                            <ActivityHeader>
                              <UserAvatar
                                $color={getActivityColor(activity.type)}
                                title={`${activity.author} (${activity.email})`}
                              >
                                {getInitials(activity.author)}
                              </UserAvatar>
                              <ActivityIcon $color={getActivityColor(activity.type)}>
                                {getActivityIcon(activity.type)}
                              </ActivityIcon>
                              <ActivityMeta>
                                <ActivityAuthor>
                                  {activity.author}
                                </ActivityAuthor>
                                <ActivityEmail>
                                  {activity.email}
                                </ActivityEmail>
                              </ActivityMeta>
                              <ActivityType $color={getActivityColor(activity.type)}>
                                {activity.type === 'comment' && '💬 Comment'}
                                {activity.type === 'approval' && '✅ Approved'}
                                {activity.type === 'rejection' && '❌ Rejected'}
                              </ActivityType>
                            </ActivityHeader>

                            {activity.content && (
                              <ActivityContent>{activity.content}</ActivityContent>
                            )}

                            <ActivityFooter>
                              <ActivityDate>
                                <Clock size={12} />
                                {formatDate(activity.createdAt)}
                              </ActivityDate>
                            </ActivityFooter>
                          </FeedbackSection>
                        </ActivityLayout>
                      </ActivityCard>
                    );
                  })
                )}
              </ActivitiesList>
            </>
          )}
        </MainContent>
      </ContentLayout>
    </PageContainer>
  );
}

// Styled Components

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background.default};
  padding: 40px 20px;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }

  @media (max-width: 480px) {
    padding: 16px 12px;
  }
`;

const Header = styled.div`
  max-width: 1600px;
  margin: 0 auto 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    margin-bottom: 24px;
  }

  @media (max-width: 480px) {
    margin-bottom: 20px;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const Description = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8125rem;
  }
`;

const ContentLayout = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 1024px) {
    max-height: none;
    overflow-y: visible;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 10px;
  }
`;

const SidebarHeader = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const SidebarTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const SharesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ShareCard = styled.div`
  padding: 16px;
  background: ${props => props.$active
    ? props.theme.colors.background.elevated
    : props.theme.colors.background.paper};
  border: 2px solid ${props => props.$active
    ? props.theme.colors.primary.main
    : props.theme.colors.border.default};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.background.elevated};
  }
`;

const ShareCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ShareCardTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  flex: 1;
`;

const ExpiredBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.tertiary};
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: 8px;
`;

const ShareCardStats = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text.secondary};

  svg {
    opacity: 0.6;
  }
`;

const ShareCardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.625rem;
  color: ${props => props.theme.colors.text.tertiary};
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ContentHeader = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 10px;
  }
`;

const ContentTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 8px 0;

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const ShareLink = styled.div`
  a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem;
    color: ${props => props.theme.colors.primary.main};
    text-decoration: none;
    transition: all 0.2s ease;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: ${props => props.theme.colors.background.elevated};
  border-radius: 8px;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

const FilterBar = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 10px;
  }
`;

const FilterLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: 2px solid ${props => props.$active
    ? props.theme.colors.primary.main
    : props.theme.colors.border.default};
  background: ${props => props.$active
    ? props.theme.colors.primary.main
    : props.theme.colors.background.paper};
  color: ${props => props.$active
    ? '#ffffff'
    : props.theme.colors.text.primary};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    ${props => !props.$active && `
      background: ${props.theme.colors.background.hover};
    `}
  }

  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 0.8125rem;
    flex: 1;
    text-align: center;
  }
`;

const ActivitiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActivityCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.theme.colors.border.default};
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 10px;
  }
`;

const ActivityHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const UserAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.$color}, ${props => props.$color}dd);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 8px ${props => props.$color}40;
  border: 2px solid ${props => props.theme.colors.background.paper};
  cursor: help;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px ${props => props.$color}60;
  }

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 0.75rem;
  }
`;

const ActivityIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const ActivityMeta = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ActivityAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};

  svg {
    opacity: 0.6;
  }
`;

const ActivityEmail = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text.secondary};

  svg {
    opacity: 0.6;
  }
`;

const ActivityType = styled.div`
  padding: 6px 12px;
  border-radius: 6px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;

  @media (max-width: 480px) {
    padding: 4px 8px;
    font-size: 0.7rem;
  }
`;

const ActivityContent = styled.div`
  font-size: 0.875rem;
  line-height: 1.5;
  color: ${props => props.theme.colors.text.primary};
  padding: 12px 16px;
  background: ${props => props.theme.colors.background.elevated};
  border-radius: 8px;
  margin-bottom: 12px;
  white-space: pre-wrap;
`;

const ActivityFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActivityDate = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text.tertiary};

  svg {
    opacity: 0.6;
  }
`;

const EmptyState = styled.div`
  max-width: 600px;
  margin: 60px auto;
  text-align: center;
  padding: 40px;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const EmptyActivities = styled.div`
  padding: 60px 40px;
  text-align: center;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

// Post Preview styled components
const ActivityLayout = styled.div`
  display: flex;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PostPreview = styled.div`
  flex-shrink: 0;
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: row;
    align-items: flex-start;
  }
`;

const PostMediaWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: ${props => props.theme.colors.background.elevated};

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
  }
`;

const PostMedia = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VideoIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const NoMediaPreview = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.tertiary};
`;

const PlatformBadge = styled.div`
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const PostCaption = styled.div`
  font-size: 0.75rem;
  line-height: 1.4;
  color: ${props => props.theme.colors.text.secondary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 768px) {
    flex: 1;
    -webkit-line-clamp: 3;
  }
`;

const PostSchedule = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.625rem;
  color: ${props => props.theme.colors.text.tertiary};

  svg {
    opacity: 0.6;
  }
`;

const FeedbackSection = styled.div`
  flex: 1;
  min-width: 0;
`;
