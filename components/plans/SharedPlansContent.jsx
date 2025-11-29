'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Share2,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  Calendar,
  Copy,
  ExternalLink,
  Clock,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { showToast } from '@/components/ui/Toast';

export default function SharedPlansContent() {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/share/feedback');
      const data = await response.json();

      if (data.success) {
        setShares(data.shares);
      }
    } catch (error) {
      console.error('Error fetching shares:', error);
      showToast.error('Failed to load shared plans');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = (token) => {
    const link = `${window.location.origin}/share/plan/${token}`;
    navigator.clipboard.writeText(link);
    showToast.success('Link copied to clipboard!');
    setActiveDropdown(null);
  };

  const openShareLink = (token) => {
    const link = `${window.location.origin}/share/plan/${token}`;
    window.open(link, '_blank');
    setActiveDropdown(null);
  };

  const getStatusColor = (share) => {
    if (share.isExpired) return '#9ca3af';

    const totalPosts = share.posts?.length || 0;
    if (totalPosts === 0) return '#9ca3af';

    const approvalRate = (share.stats.totalApprovals / totalPosts) * 100;

    if (approvalRate === 100) return '#10b981'; // All approved
    if (share.stats.totalRejections > 0) return '#ef4444'; // Has rejections
    if (share.stats.totalComments > 0) return '#8B5CF6'; // Has comments
    return '#f59e0b'; // Pending
  };

  const getStatusText = (share) => {
    if (share.isExpired) return 'Expired';

    const totalPosts = share.posts?.length || 0;
    if (totalPosts === 0) return 'No posts';

    const approvalRate = (share.stats.totalApprovals / totalPosts) * 100;

    if (approvalRate === 100) return 'All Approved';
    if (share.stats.totalRejections > 0) return 'Needs Revision';
    if (share.stats.totalComments > 0) return 'Has Comments';
    return 'Awaiting Review';
  };

  const getProgressPercentage = (share) => {
    const totalPosts = share.posts?.length || 0;
    if (totalPosts === 0) return 0;

    const reviewedPosts = share.stats.totalApprovals + share.stats.totalRejections;
    return (reviewedPosts / totalPosts) * 100;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilExpiry = (expiresAt) => {
    if (!expiresAt) return null;
    const days = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading shared plans...</LoadingText>
      </LoadingContainer>
    );
  }

  if (shares.length === 0) {
    return (
      <EmptyState>
        <EmptyIcon>🔗</EmptyIcon>
        <EmptyTitle>No Shared Plans Yet</EmptyTitle>
        <EmptyDescription>
          Create and share your first content calendar with clients to start receiving feedback and approvals.
        </EmptyDescription>
      </EmptyState>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderText>
          <Title>{shares.length} Shared Plans</Title>
          <Subtitle>Manage all your shared content calendars</Subtitle>
        </HeaderText>
      </Header>

      <SharesGrid>
        {shares.map((share) => {
          const statusColor = getStatusColor(share);
          const statusText = getStatusText(share);
          const progress = getProgressPercentage(share);
          const daysLeft = getDaysUntilExpiry(share.expires_at);

          return (
            <ShareCard key={share.id}>
              <CardHeader>
                <ShareTitle>{share.title || 'Untitled Plan'}</ShareTitle>
                <ActionsWrapper>
                  <StatusBadge $color={statusColor}>
                    {statusText}
                  </StatusBadge>
                  <ActionButton
                    onClick={() => setActiveDropdown(activeDropdown === share.id ? null : share.id)}
                  >
                    <MoreVertical size={18} />
                  </ActionButton>
                  {activeDropdown === share.id && (
                    <Dropdown>
                      <DropdownItem onClick={() => openShareLink(share.share_token)}>
                        <ExternalLink size={16} />
                        Open Share Page
                      </DropdownItem>
                      <DropdownItem onClick={() => copyShareLink(share.share_token)}>
                        <Copy size={16} />
                        Copy Link
                      </DropdownItem>
                    </Dropdown>
                  )}
                </ActionsWrapper>
              </CardHeader>

              {share.description && (
                <ShareDescription>{share.description}</ShareDescription>
              )}

              <ProgressSection>
                <ProgressLabel>
                  <span>Review Progress</span>
                  <span>{Math.round(progress)}%</span>
                </ProgressLabel>
                <ProgressBar>
                  <ProgressFill $width={progress} $color={statusColor} />
                </ProgressBar>
              </ProgressSection>

              <StatsGrid>
                <StatItem>
                  <StatIcon $color="#8B5CF6">
                    <Eye size={16} />
                  </StatIcon>
                  <StatValue>{share.stats.viewCount}</StatValue>
                  <StatLabel>Views</StatLabel>
                </StatItem>

                <StatItem>
                  <StatIcon $color="#8B5CF6">
                    <MessageSquare size={16} />
                  </StatIcon>
                  <StatValue>{share.stats.totalComments}</StatValue>
                  <StatLabel>Comments</StatLabel>
                </StatItem>

                <StatItem>
                  <StatIcon $color="#10b981">
                    <CheckCircle size={16} />
                  </StatIcon>
                  <StatValue>{share.stats.totalApprovals}</StatValue>
                  <StatLabel>Approved</StatLabel>
                </StatItem>

                <StatItem>
                  <StatIcon $color="#ef4444">
                    <XCircle size={16} />
                  </StatIcon>
                  <StatValue>{share.stats.totalRejections}</StatValue>
                  <StatLabel>Rejected</StatLabel>
                </StatItem>
              </StatsGrid>

              <CardFooter>
                <FooterInfo>
                  <InfoItem>
                    <Calendar size={14} />
                    <span>Created {formatDate(share.created_at)}</span>
                  </InfoItem>
                  {daysLeft !== null && (
                    <InfoItem $warning={daysLeft < 7}>
                      <Clock size={14} />
                      <span>
                        {daysLeft > 0
                          ? `${daysLeft} days left`
                          : daysLeft === 0
                          ? 'Expires today'
                          : 'Expired'}
                      </span>
                    </InfoItem>
                  )}
                </FooterInfo>
              </CardFooter>
            </ShareCard>
          );
        })}
      </SharesGrid>
    </Container>
  );
}

// Styled Components

const Container = styled.div``;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${props => props.theme.colors.border.default};
  border-top-color: ${props => props.theme.colors.primary.main};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-top: 16px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  max-width: 400px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const HeaderText = styled.div``;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 4px 0;
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const SharesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ShareCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.border.default};
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ShareTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  flex: 1;
`;

const ActionsWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: 4px 12px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background.hover};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: ${props => props.theme.colors.background.elevated};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  min-width: 180px;
  z-index: 10;
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: ${props => props.theme.colors.background.hover};
  }

  svg {
    flex-shrink: 0;
  }
`;

const ShareDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const ProgressSection = styled.div`
  margin-bottom: 20px;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${props => props.theme.colors.background.elevated};
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${props => props.$width}%;
  height: 100%;
  background: ${props => props.$color};
  transition: width 0.3s ease;
  border-radius: 3px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: ${props => props.theme.colors.background.elevated};
  border-radius: 8px;
`;

const StatIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
`;

const StatValue = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 0.625rem;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

const CardFooter = styled.div`
  padding-top: 16px;
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

const FooterInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: ${props => props.$warning
    ? props.theme.colors.error || '#ef4444'
    : props.theme.colors.text.tertiary};

  svg {
    opacity: 0.7;
  }
`;
