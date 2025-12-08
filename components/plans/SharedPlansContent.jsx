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
  MoreVertical,
  Trash2,
  Link2,
  Users,
  Edit3,
  Lock,
  Unlock
} from 'lucide-react';
import { showToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export default function SharedPlansContent() {
  const supabase = createClient();
  const { currentWorkspace } = useWorkspace();

  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingShare, setEditingShare] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    client_name: '',
    password: '',
    expires_at: '',
    removePassword: false
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      fetchShares();
    }
  }, [currentWorkspace]);

  const fetchShares = async () => {
    try {
      setLoading(true);

      // Fetch from post_plan_shares table
      const { data: planShares, error } = await supabase
        .from('post_plan_shares')
        .select(`
          *,
          post_plan_share_items(id, post_id),
          post_plan_share_feedback(id, feedback_type, approved)
        `)
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching shares:', error);
        showToast.error('Failed to load shared plans');
        return;
      }

      // Transform data to include stats
      const transformedShares = (planShares || []).map(share => {
        const feedback = share.post_plan_share_feedback || [];
        const items = share.post_plan_share_items || [];

        return {
          ...share,
          postCount: items.length,
          stats: {
            viewCount: share.view_count || 0,
            totalComments: feedback.filter(f => f.feedback_type === 'comment').length,
            totalApprovals: feedback.filter(f => f.feedback_type === 'approval' && f.approved === true).length,
            totalRejections: feedback.filter(f => f.feedback_type === 'approval' && f.approved === false).length,
          },
          isExpired: share.expires_at ? new Date(share.expires_at) < new Date() : false,
        };
      });

      setShares(transformedShares);
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

  const handleToggleActive = async (share) => {
    try {
      setActionLoading(true);

      const { error } = await supabase
        .from('post_plan_shares')
        .update({ is_active: !share.is_active, updated_at: new Date().toISOString() })
        .eq('id', share.id);

      if (error) throw error;

      showToast.success(`Share ${share.is_active ? 'deactivated' : 'activated'} successfully`);
      await fetchShares();
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error toggling share:', error);
      showToast.error('Failed to update share');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (share) => {
    try {
      setActionLoading(true);

      const { error } = await supabase
        .from('post_plan_shares')
        .delete()
        .eq('id', share.id);

      if (error) throw error;

      showToast.success('Share deleted successfully');
      await fetchShares();
      setDeleteConfirm(null);
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error deleting share:', error);
      showToast.error('Failed to delete share');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (share) => {
    setEditForm({
      title: share.title || '',
      description: share.description || '',
      client_name: share.client_name || '',
      password: '',
      expires_at: share.expires_at ? share.expires_at.split('T')[0] : '',
      removePassword: false
    });
    setEditingShare(share);
    setActiveDropdown(null);
  };

  const handleEditSave = async () => {
    try {
      setActionLoading(true);

      const updateData = {
        title: editForm.title,
        description: editForm.description,
        client_name: editForm.client_name,
        expires_at: editForm.expires_at ? new Date(editForm.expires_at).toISOString() : null,
        updated_at: new Date().toISOString()
      };

      // Handle password changes
      if (editForm.removePassword) {
        updateData.password_hash = null;
      } else if (editForm.password) {
        // Store the new password (plain text for now, like the original implementation)
        updateData.password_hash = editForm.password;
      }

      const { error } = await supabase
        .from('post_plan_shares')
        .update(updateData)
        .eq('id', editingShare.id);

      if (error) throw error;

      showToast.success('Share updated successfully');
      await fetchShares();
      setEditingShare(null);
    } catch (error) {
      console.error('Error updating share:', error);
      showToast.error('Failed to update share');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (share) => {
    if (!share.is_active) return '#9ca3af';
    if (share.isExpired) return '#9ca3af';

    const totalPosts = share.postCount || 0;
    if (totalPosts === 0) return '#9ca3af';

    const approvalRate = totalPosts > 0 ? (share.stats.totalApprovals / totalPosts) * 100 : 0;

    if (approvalRate === 100) return '#10b981'; // All approved
    if (share.stats.totalRejections > 0) return '#ef4444'; // Has rejections
    if (share.stats.totalComments > 0) return '#8B5CF6'; // Has comments
    return '#f59e0b'; // Pending
  };

  const getStatusText = (share) => {
    if (!share.is_active) return 'Inactive';
    if (share.isExpired) return 'Expired';

    const totalPosts = share.postCount || 0;
    if (totalPosts === 0) return 'No posts';

    const approvalRate = totalPosts > 0 ? (share.stats.totalApprovals / totalPosts) * 100 : 0;

    if (approvalRate === 100) return 'All Approved';
    if (share.stats.totalRejections > 0) return 'Needs Revision';
    if (share.stats.totalComments > 0) return 'Has Comments';
    return 'Awaiting Review';
  };

  const getProgressPercentage = (share) => {
    const totalPosts = share.postCount || 0;
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
        <EmptyIcon>
          <Link2 size={48} />
        </EmptyIcon>
        <EmptyTitle>No Shared Plans Yet</EmptyTitle>
        <EmptyDescription>
          Create and share your first content calendar with clients to start receiving feedback and approvals.
        </EmptyDescription>
        <EmptyHint>
          Go to the Plans tab, select posts, and click "Share Plan" to create a shareable link.
        </EmptyHint>
      </EmptyState>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderText>
          <Title>{shares.length} Shared Plan{shares.length !== 1 ? 's' : ''}</Title>
          <Subtitle>Manage all your shared content calendars and track client feedback</Subtitle>
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
                <ShareInfo>
                  <ShareTitle>{share.title || 'Untitled Plan'}</ShareTitle>
                  {share.client_name && (
                    <ClientName>
                      <Users size={14} />
                      {share.client_name}
                    </ClientName>
                  )}
                </ShareInfo>
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
                      <DropdownItem onClick={() => copyShareLink(share.share_token)}>
                        <Copy size={16} />
                        Copy Link
                      </DropdownItem>
                      <DropdownItem onClick={() => openShareLink(share.share_token)}>
                        <ExternalLink size={16} />
                        Open Share Page
                      </DropdownItem>
                      <DropdownItem onClick={() => openEditModal(share)}>
                        <Edit3 size={16} />
                        Edit Settings
                      </DropdownItem>
                      <DropdownDivider />
                      <DropdownItem onClick={() => handleToggleActive(share)} disabled={actionLoading}>
                        {share.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        {share.is_active ? 'Deactivate' : 'Activate'}
                      </DropdownItem>
                      <DropdownDivider />
                      <DropdownItem
                        $danger
                        onClick={() => {
                          setDeleteConfirm(share);
                          setActiveDropdown(null);
                        }}
                        disabled={actionLoading}
                      >
                        <Trash2 size={16} />
                        Delete
                      </DropdownItem>
                    </Dropdown>
                  )}
                </ActionsWrapper>
              </CardHeader>

              {share.description && (
                <ShareDescription>{share.description}</ShareDescription>
              )}

              <ShareLinkBox>
                <Link2 size={14} />
                <ShareLinkText
                  onClick={() => openShareLink(share.share_token)}
                  title="Click to open"
                >
                  {window.location.origin}/share/plan/{share.share_token}
                </ShareLinkText>
                <CopyButton
                  onClick={(e) => {
                    e.stopPropagation();
                    copyShareLink(share.share_token);
                  }}
                  title="Copy link"
                >
                  <Copy size={14} />
                </CopyButton>
              </ShareLinkBox>

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
                  <StatIcon $color="#3B82F6">
                    <Calendar size={16} />
                  </StatIcon>
                  <StatValue>{share.postCount}</StatValue>
                  <StatLabel>Posts</StatLabel>
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
                    <InfoItem $warning={daysLeft < 7 && daysLeft > 0}>
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
                  {share.password_hash && (
                    <InfoItem>
                      <AlertCircle size={14} />
                      <span>Password protected</span>
                    </InfoItem>
                  )}
                </FooterInfo>
              </CardFooter>
            </ShareCard>
          );
        })}
      </SharesGrid>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <ModalOverlay onClick={() => !actionLoading && setDeleteConfirm(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Delete Shared Plan?</ModalTitle>
            <ModalText>
              Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone
              and the share link will no longer work.
            </ModalText>
            <ModalActions>
              <ModalButton
                onClick={() => setDeleteConfirm(null)}
                disabled={actionLoading}
              >
                Cancel
              </ModalButton>
              <ModalButton
                $danger
                onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Edit Share Modal */}
      {editingShare && (
        <ModalOverlay onClick={() => !actionLoading && setEditingShare(null)}>
          <EditModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Edit Share Settings</ModalTitle>
              <CloseButton onClick={() => setEditingShare(null)}>
                <XCircle size={20} />
              </CloseButton>
            </ModalHeader>

            <FormGroup>
              <FormLabel>Title</FormLabel>
              <FormInput
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Content Plan Title"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Description</FormLabel>
              <FormTextarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Brief description of this content plan..."
                rows={3}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Client Name</FormLabel>
              <FormInput
                type="text"
                value={editForm.client_name}
                onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
                placeholder="Client or company name"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Expiration Date</FormLabel>
              <FormInput
                type="date"
                value={editForm.expires_at}
                onChange={(e) => setEditForm({ ...editForm, expires_at: e.target.value })}
              />
              <FormHint>Leave empty for no expiration</FormHint>
            </FormGroup>

            <FormDivider />

            <FormGroup>
              <FormLabel>
                <Lock size={16} />
                Password Protection
              </FormLabel>
              {editingShare.password_hash && !editForm.removePassword ? (
                <PasswordStatus>
                  <PasswordBadge>
                    <Lock size={14} />
                    Password Protected
                  </PasswordBadge>
                  <RemovePasswordBtn
                    type="button"
                    onClick={() => setEditForm({ ...editForm, removePassword: true, password: '' })}
                  >
                    <Unlock size={14} />
                    Remove Password
                  </RemovePasswordBtn>
                </PasswordStatus>
              ) : (
                <>
                  <FormInput
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value, removePassword: false })}
                    placeholder={editForm.removePassword ? 'Enter new password (optional)' : 'Set a new password (optional)'}
                  />
                  {editForm.removePassword && (
                    <FormHint $warning>Password will be removed when you save</FormHint>
                  )}
                </>
              )}
            </FormGroup>

            <EditModalActions>
              <ModalButton
                onClick={() => setEditingShare(null)}
                disabled={actionLoading}
              >
                Cancel
              </ModalButton>
              <ModalButton
                $primary
                onClick={handleEditSave}
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </ModalButton>
            </EditModalActions>
          </EditModalContent>
        </ModalOverlay>
      )}
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
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary.main}15;
  color: ${props => props.theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
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
  margin: 0 0 12px 0;
  max-width: 400px;
`;

const EmptyHint = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.tertiary};
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

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }

  @media (max-width: 480px) {
    font-size: 1.125rem;
  }
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;

  @media (max-width: 480px) {
    font-size: 0.8125rem;
  }
`;

const SharesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
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

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 10px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ShareInfo = styled.div`
  flex: 1;
`;

const ShareTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 4px 0;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const ClientName = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.813rem;
  color: ${props => props.theme.colors.text.secondary};
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
  color: ${props => props.$danger ? '#ef4444' : props.theme.colors.text.primary};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: ${props => props.$danger ? '#ef444410' : props.theme.colors.background.hover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    flex-shrink: 0;
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border.default};
  margin: 4px 0;
`;

const ShareDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const ShareLinkBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: ${props => props.theme.colors.background.elevated};
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid ${props => props.theme.colors.border.default};

  > svg {
    color: ${props => props.theme.colors.text.tertiary};
    flex-shrink: 0;
  }
`;

const ShareLinkText = styled.span`
  flex: 1;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.primary.main};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primary.dark};
    text-decoration: underline;
  }
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border.default};
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${props => props.theme.colors.primary.main};
    border-color: ${props => props.theme.colors.primary.main};
    color: white;
  }

  svg {
    width: 14px;
    height: 14px;
  }
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

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: ${props => props.theme.colors.background.elevated};
  border-radius: 8px;

  @media (max-width: 480px) {
    padding: 10px 6px;
  }
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

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const StatValue = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 2px;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
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
    ? '#f59e0b'
    : props.theme.colors.text.tertiary};

  svg {
    opacity: 0.7;
  }
`;

// Modal styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const ModalText = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 8px;
  }
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.$danger ? '#ef4444' : props.$primary ? props.theme.colors.primary.main : props.theme.colors.border.default};
  background: ${props => props.$danger ? '#ef4444' : props.$primary ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.$danger || props.$primary ? 'white' : props.theme.colors.text.primary};

  &:hover {
    background: ${props => props.$danger ? '#dc2626' : props.$primary ? props.theme.colors.primary.dark : props.theme.colors.background.hover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

// Edit Modal Styles
const EditModalContent = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  padding: 0;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  position: sticky;
  top: 0;
  background: ${props => props.theme.colors.background.paper};
  z-index: 1;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
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

const FormGroup = styled.div`
  padding: 0 24px;
  margin-bottom: 20px;

  &:first-of-type {
    margin-top: 20px;
  }
`;

const FormLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;

  svg {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 8px;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background.paper};
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.main}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 8px;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background.paper};
  transition: all 0.2s ease;
  box-sizing: border-box;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.main}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const FormHint = styled.div`
  font-size: 0.75rem;
  color: ${props => props.$warning ? '#f59e0b' : props.theme.colors.text.tertiary};
  margin-top: 6px;
`;

const FormDivider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border.default};
  margin: 24px 0;
`;

const PasswordStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const PasswordBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #10b98120;
  color: #10b981;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
`;

const RemovePasswordBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid #ef4444;
  border-radius: 8px;
  color: #ef4444;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #ef444410;
  }
`;

const EditModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid ${props => props.theme.colors.border.default};
  margin-top: 4px;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 8px;
    padding: 16px;
  }
`;
