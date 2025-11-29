/**
 * Calendar Shares Management Page
 *
 * Manage all calendar shares - view stats, copy links, activate/deactivate, delete
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, Copy, Eye, Trash2, MoreVertical, Share2, Calendar, Download, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button, PageSpinner } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import ShareCalendarModal from '@/components/calendar/ShareCalendarModal';

// Styled Components
const PageContainer = styled.div`
  padding: ${props => props.theme.spacing.xl};
`;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const TitleIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => `${props.theme.colors.primary.main}20`};
  color: ${props => props.theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text.secondary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatCard = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  border-left: 4px solid ${props => props.$color || props.theme.colors.primary.main};
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const FiltersSection = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  flex: 1;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const FilterSelect = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background.paper};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const SharesTable = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 80px 100px 120px 60px;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background.light};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 80px 100px 120px 60px;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  align-items: center;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background.light};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ShareTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const ShareDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DateRange = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.$bg || props.theme.colors.background.light};
  color: ${props => props.$color || props.theme.colors.text.primary};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: capitalize;
`;

const Count = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  text-align: center;
`;

const CreatedDate = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const ActionsButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background.light};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const ActionsDropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.lg};
  min-width: 180px;
  z-index: 100;
  overflow: hidden;
`;

const ActionItem = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: none;
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.$danger ? props.theme.colors.error.main : props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background.light};
  }
`;

const ActionsContainer = styled.div`
  position: relative;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['3xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyStateIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => `${props.theme.colors.primary.main}10`};
  color: ${props => props.theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyStateTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const EmptyStateText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Modal = styled.div`
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
  padding: ${props => props.theme.spacing.lg};
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  max-width: 500px;
  width: 100%;
  box-shadow: ${props => props.theme.shadows['2xl']};
`;

const ModalTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ModalText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
`;

export default function CalendarSharesPage() {
  const { currentWorkspace } = useWorkspace();

  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [permissionFilter, setPermissionFilter] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      loadShares();
    }
  }, [currentWorkspace]);

  const loadShares = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        workspace_id: currentWorkspace.id,
      });

      const response = await fetch(`/api/calendar/share?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load calendar shares');
      }

      setShares(data.shares || []);
    } catch (error) {
      console.error('Error loading calendar shares:', error);
      showToast.error('Failed to load calendar shares');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (share) => {
    const shareUrl = `${window.location.origin}/share/${share.share_token}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast.success('Link copied to clipboard!');
      setActiveDropdown(null);
    } catch (error) {
      showToast.error('Failed to copy link');
    }
  };

  const handleToggleActive = async (share) => {
    try {
      setActionLoading(true);

      const response = await fetch(`/api/calendar/share/${share.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: !share.is_active,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update share');
      }

      showToast.success(`Share ${share.is_active ? 'deactivated' : 'activated'} successfully`);
      await loadShares();
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error toggling share:', error);
      showToast.error(error.message || 'Failed to update share');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (shareId) => {
    try {
      setActionLoading(true);

      const response = await fetch(`/api/calendar/share/${shareId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete share');
      }

      showToast.success('Share deleted successfully');
      await loadShares();
      setDeleteConfirm(null);
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error deleting share:', error);
      showToast.error(error.message || 'Failed to delete share');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShareCreated = () => {
    loadShares();
    setShowShareModal(false);
  };

  // Filter shares
  const filteredShares = shares.filter(share => {
    // Search filter
    if (searchTerm && !share.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter === 'active' && !share.is_active) return false;
    if (statusFilter === 'expired') {
      if (share.is_active) return false;
      if (share.expires_at && new Date(share.expires_at) > new Date()) return false;
    }

    // Permission filter
    if (permissionFilter !== 'all' && share.permission_level !== permissionFilter) {
      return false;
    }

    return true;
  });

  // Calculate stats
  const stats = {
    total: shares.length,
    active: shares.filter(s => s.is_active).length,
    views: shares.reduce((sum, s) => sum + (s.view_count || 0), 0),
    downloads: shares.reduce((sum, s) => sum + (s.download_count || 0), 0),
  };

  const getPermissionColor = (level) => {
    const colors = {
      view: { bg: '#3B82F610', color: '#3B82F6' },
      comment: { bg: '#8B5CF610', color: '#8B5CF6' },
      approve: { bg: '#10B98110', color: '#10B981' },
    };
    return colors[level] || colors.view;
  };

  const isExpired = (share) => {
    if (!share.expires_at) return false;
    return new Date(share.expires_at) < new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateRange = (start, end) => {
    if (!start && !end) return 'All time';
    if (!start) return `Until ${formatDate(end)}`;
    if (!end) return `From ${formatDate(start)}`;
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  if (!currentWorkspace) {
    return (
      <PageContainer>
        <Title>Calendar Shares</Title>
        <EmptyState>No workspace selected</EmptyState>
      </PageContainer>
    );
  }

  if (loading) {
    return <PageSpinner />;
  }

  return (
    <PageContainer>
      <PageHeader>
        <HeaderContent>
          <Title>
            <TitleIcon>
              <Share2 size={24} />
            </TitleIcon>
            Calendar Shares
          </Title>
          <Subtitle>Manage your shared calendars</Subtitle>
        </HeaderContent>

        <Button
          variant="primary"
          onClick={() => setShowShareModal(true)}
        >
          <Plus size={20} />
          New Share
        </Button>
      </PageHeader>

      {/* Stats */}
      <StatsGrid>
        <StatCard $color="#8B5CF6">
          <StatValue>{stats.total}</StatValue>
          <StatLabel>
            <Share2 size={16} />
            Total Shares
          </StatLabel>
        </StatCard>
        <StatCard $color="#10B981">
          <StatValue>{stats.active}</StatValue>
          <StatLabel>
            <CheckCircle size={16} />
            Active Shares
          </StatLabel>
        </StatCard>
        <StatCard $color="#3B82F6">
          <StatValue>{stats.views}</StatValue>
          <StatLabel>
            <Eye size={16} />
            Total Views
          </StatLabel>
        </StatCard>
        <StatCard $color="#F59E0B">
          <StatValue>{stats.downloads}</StatValue>
          <StatLabel>
            <Download size={16} />
            Total Downloads
          </StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Filters */}
      <FiltersSection>
        <SearchInput
          type="text"
          placeholder="Search shares..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </FilterSelect>
        <FilterSelect
          value={permissionFilter}
          onChange={(e) => setPermissionFilter(e.target.value)}
        >
          <option value="all">All Permissions</option>
          <option value="view">View Only</option>
          <option value="comment">Comment</option>
          <option value="approve">Approve</option>
        </FilterSelect>
      </FiltersSection>

      {/* Shares Table */}
      {filteredShares.length === 0 ? (
        <SharesTable>
          <EmptyState>
            <EmptyStateIcon>
              <Share2 size={40} />
            </EmptyStateIcon>
            <EmptyStateTitle>
              {searchTerm || statusFilter !== 'all' || permissionFilter !== 'all'
                ? 'No shares found'
                : 'No calendar shares yet'}
            </EmptyStateTitle>
            <EmptyStateText>
              {searchTerm || statusFilter !== 'all' || permissionFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first calendar share to collaborate with your team'}
            </EmptyStateText>
            {!searchTerm && statusFilter === 'all' && permissionFilter === 'all' && (
              <Button
                variant="primary"
                onClick={() => setShowShareModal(true)}
              >
                <Plus size={20} />
                Create Share
              </Button>
            )}
          </EmptyState>
        </SharesTable>
      ) : (
        <SharesTable>
          <TableHeader>
            <div>Title</div>
            <div>Date Range</div>
            <div>Permission</div>
            <div>Status</div>
            <div>Views</div>
            <div>Downloads</div>
            <div>Created</div>
            <div></div>
          </TableHeader>

          {filteredShares.map((share) => {
            const permColors = getPermissionColor(share.permission_level);
            const expired = isExpired(share);

            return (
              <TableRow key={share.id}>
                <div>
                  <ShareTitle>{share.title}</ShareTitle>
                  {share.description && (
                    <ShareDescription>{share.description}</ShareDescription>
                  )}
                </div>

                <DateRange>
                  {formatDateRange(share.start_date, share.end_date)}
                </DateRange>

                <div>
                  <Badge $bg={permColors.bg} $color={permColors.color}>
                    {share.permission_level}
                  </Badge>
                </div>

                <div>
                  {share.is_active && !expired ? (
                    <Badge $bg="#10B98110" $color="#10B981">
                      <CheckCircle size={12} />
                      Active
                    </Badge>
                  ) : (
                    <Badge $bg="#EF444410" $color="#EF4444">
                      <XCircle size={12} />
                      {expired ? 'Expired' : 'Inactive'}
                    </Badge>
                  )}
                </div>

                <Count>{share.view_count || 0}</Count>
                <Count>{share.download_count || 0}</Count>
                <CreatedDate>{formatDate(share.created_at)}</CreatedDate>

                <ActionsContainer>
                  <ActionsButton
                    onClick={() => setActiveDropdown(activeDropdown === share.id ? null : share.id)}
                  >
                    <MoreVertical size={16} />
                  </ActionsButton>

                  {activeDropdown === share.id && (
                    <ActionsDropdown>
                      <ActionItem onClick={() => handleCopyLink(share)}>
                        <Copy size={16} />
                        Copy Link
                      </ActionItem>
                      <ActionItem onClick={() => handleToggleActive(share)} disabled={actionLoading}>
                        {share.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        {share.is_active ? 'Deactivate' : 'Activate'}
                      </ActionItem>
                      <ActionItem
                        $danger
                        onClick={() => {
                          setDeleteConfirm(share);
                          setActiveDropdown(null);
                        }}
                        disabled={actionLoading}
                      >
                        <Trash2 size={16} />
                        Delete
                      </ActionItem>
                    </ActionsDropdown>
                  )}
                </ActionsContainer>
              </TableRow>
            );
          })}
        </SharesTable>
      )}

      {/* Share Calendar Modal */}
      <ShareCalendarModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onSuccess={handleShareCreated}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal onClick={() => !actionLoading && setDeleteConfirm(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Delete Calendar Share?</ModalTitle>
            <ModalText>
              Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone
              and the share link will no longer work.
            </ModalText>
            <ModalActions>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete Share'}
              </Button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
}
