/**
 * Calendar Page
 *
 * Monthly calendar view with drag-and-drop post scheduling.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled, { keyframes, useTheme } from 'styled-components';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button, PageSpinner } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import ContentCalendar from '@/components/calendar/ContentCalendar';
import RescheduleModal from '@/components/calendar/RescheduleModal';
import PostComposer from '@/components/posts/PostComposer';
import AccountSelector from '@/components/common/AccountSelector';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing['2xl']};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
  animation: ${fadeInUp} 0.5s ease-out;
`;

const PageTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const TitleContent = styled.div``;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.md};
`;

const TitleIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${props => props.theme.borderRadius.xl};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary.main} 0%, ${props => props.theme.colors.primary.dark} 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px ${props => `${props.theme.colors.primary.main}40`};
`;

const FilterSection = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
  align-items: center;
`;

const StatusFilters = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  align-items: center;
  flex-wrap: wrap;
`;

const StatusFilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$active ? props.$color : props.theme.colors.background.paper};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.secondary};
  border: 2px solid ${props => props.$active ? props.$color : props.theme.colors.border.default};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.$active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.$color};
    background: ${props => props.$active ? props.$color : `${props.$color}20`};
    color: ${props => props.$active ? 'white' : props.theme.colors.text.primary};
  }
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$color};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

const ViewModeSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.neutral[100]};
  padding: 4px;
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const ViewModeButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.$active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  border: none;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary.dark : props.theme.colors.neutral[200]};
    color: ${props => props.$active ? 'white' : props.theme.colors.text.primary};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeInUp} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ModalTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const ModalDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

const ModalWarning = styled.div`
  background: ${props => props.theme.colors.error.main}15;
  border: 1px solid ${props => props.theme.colors.error.main};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.error.main};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background.default};
  color: ${props => props.theme.colors.text.primary};
  border: 1px solid ${props => props.theme.colors.border.default};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
  }
`;

const DeleteButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.error.main};
  color: white;
  border: none;
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.error.dark};
  }
`;

export default function CalendarPage() {
  const { currentWorkspace } = useWorkspace();
  const router = useRouter();
  const theme = useTheme();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'twoWeeks', 'month' - Default to 7 days
  const [accounts, setAccounts] = useState([]);
  const [showComposer, setShowComposer] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [preSelectedDate, setPreSelectedDate] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [reschedulingPost, setReschedulingPost] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPost, setDeletingPost] = useState(null);

  useEffect(() => {
    if (currentWorkspace) {
      loadPosts();
      loadAccounts();
    }
  }, [currentWorkspace]);

  // Disabled auto-reload on tab switch to prevent disrupting user workflow
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (!document.hidden && currentWorkspace && !showComposer) {
  //       loadAccounts();
  //       loadPosts();
  //     }
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   const handleFocus = () => {
  //     if (currentWorkspace && !showComposer) {
  //       loadAccounts();
  //       loadPosts();
  //     }
  //   };

  //   window.addEventListener('focus', handleFocus);

  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //     window.removeEventListener('focus', handleFocus);
  //   };
  // }, [currentWorkspace, showComposer]);

  const loadPosts = async () => {
    try {
      setLoading(true);

      // Get date range (current month + 1 month before and after)
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);

      const params = new URLSearchParams({
        workspace_id: currentWorkspace.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load posts');
      }

      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      showToast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await fetch(`/api/social-accounts?workspace_id=${currentWorkspace.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load accounts');
      }

      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      // Don't show error toast for accounts as it's not critical
    }
  };

  const handlePostMove = async (post, targetDate) => {
    try {
      // Set time to noon to avoid timezone issues
      const scheduledFor = new Date(targetDate);
      scheduledFor.setHours(12, 0, 0, 0);

      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_for: scheduledFor.toISOString(),
          status: 'scheduled',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to move post');
      }

      showToast.success('Post rescheduled successfully');
      await loadPosts();
    } catch (error) {
      console.error('Error moving post:', error);
      showToast.error(error.message || 'Failed to move post');
    }
  };

  const handlePostEdit = (post) => {
    setEditingPost(post);
    setShowComposer(true);
  };

  const handlePostReschedule = async (post, newDate = null) => {
    // If newDate is provided, do quick reschedule directly
    if (newDate) {
      try {
        const response = await fetch(`/api/posts/${post.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduled_for: newDate.toISOString(),
            status: 'scheduled',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to reschedule post');
        }

        showToast.success(`Post rescheduled to ${newDate.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })}`);
        await loadPosts();
      } catch (error) {
        console.error('Error rescheduling post:', error);
        showToast.error(error.message || 'Failed to reschedule post');
      }
    } else {
      // Open the reschedule modal for custom scheduling
      setReschedulingPost(post);
      setShowRescheduleModal(true);
    }
  };

  const handlePostDelete = (post) => {
    setDeletingPost(post);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingPost) return;

    try {
      const deleteFromFacebook = deletingPost.status === 'published';
      const response = await fetch(
        `/api/posts/${deletingPost.id}${deleteFromFacebook ? '?deleteFromFacebook=true' : ''}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete post');
      }

      showToast.success(deleteFromFacebook ? 'Post deleted from calendar and Facebook' : 'Post deleted successfully');
      setShowDeleteModal(false);
      setDeletingPost(null);
      await loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast.error(error.message || 'Failed to delete post');
      setShowDeleteModal(false);
      setDeletingPost(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingPost(null);
  };

  const handleCreateNewPost = (date) => {
    // Navigate to unified create post page
    router.push('/dashboard/create-post');
  };

  const handleComposerClose = () => {
    setShowComposer(false);
    setEditingPost(null);
    setPreSelectedDate(null);
  };

  const handlePostSaved = async () => {
    setShowComposer(false);
    setEditingPost(null);
    await loadPosts();
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    // Status filter
    if (statusFilter !== 'all' && post.status !== statusFilter) {
      return false;
    }

    // Platform filter
    if (platformFilter !== 'all') {
      const postAccountIds = post.platforms || [];
      // Check if any of the post's accounts match the selected platform
      const hasMatchingPlatform = postAccountIds.some(accountId => {
        const account = accounts.find(acc => acc.id === accountId);
        return account && account.platform === platformFilter;
      });

      if (!hasMatchingPlatform) {
        return false;
      }
    }

    return true;
  });

  // Status filter options with colors
  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled', color: theme.colors.info.main },
    { value: 'published', label: 'Published', color: theme.colors.success.main },
    { value: 'failed', label: 'Failed', color: theme.colors.error.main },
    { value: 'draft', label: 'Draft', color: theme.colors.neutral[600] },
  ];

  if (!currentWorkspace) {
    return (
      <div>
        <Title>Calendar</Title>
        <EmptyState>No workspace selected</EmptyState>
      </div>
    );
  }

  if (loading) {
    return <PageSpinner />;
  }

  // Calculate current month date range for sharing
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startDateStr = currentMonthStart.toISOString().split('T')[0];
  const endDateStr = currentMonthEnd.toISOString().split('T')[0];

  return (
    <Container>
      <PageHeader>
        <PageTitle>
          <TitleIcon>
            <CalendarIcon size={28} />
          </TitleIcon>
          <TitleContent>
            <Title>Content Calendar</Title>
            <Subtitle>
              Schedule and manage your posts across all platforms
              {filteredPosts.length > 0 && ` • ${filteredPosts.length} ${filteredPosts.length === 1 ? 'post' : 'posts'}`}
            </Subtitle>
          </TitleContent>
        </PageTitle>

      </PageHeader>

      {/* Account Selector */}
      <AccountSelector
        accounts={accounts.map(acc => ({
          ...acc,
          connected: acc.is_active,
          selected: platformFilter === acc.platform,
        }))}
        isAllSelected={platformFilter === 'all'}
        onSelectAll={() => setPlatformFilter('all')}
        onToggleSelect={(accountId, platform) => {
          setPlatformFilter(platformFilter === platform ? 'all' : platform);
        }}
        onConnect={(platform) => {
          window.location.href = `/api/auth/connect/${platform}?workspace_id=${currentWorkspace.id}`;
        }}
        showUnconnected={true}
      />

      {/* Status Filters */}
      <FilterSection>
        <StatusFilters>
          {statusOptions.map((option) => (
            <StatusFilterButton
              key={option.value}
              $active={statusFilter === option.value}
              $color={option.color}
              onClick={() => setStatusFilter(statusFilter === option.value ? 'all' : option.value)}
            >
              <StatusIndicator $color={option.color} />
              {option.label}
            </StatusFilterButton>
          ))}
        </StatusFilters>
      </FilterSection>

      {/* Calendar */}
      <ContentCalendar
        posts={filteredPosts}
        onPostMove={handlePostMove}
        onPostEdit={handlePostEdit}
        onPostReschedule={handlePostReschedule}
        onPostDelete={handlePostDelete}
        onDateClick={handleCreateNewPost}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setReschedulingPost(null);
        }}
        post={reschedulingPost}
        onReschedule={loadPosts}
      />

      {/* Post Composer Modal */}
      {showComposer && (
        <PostComposer
          isOpen={showComposer}
          onClose={handleComposerClose}
          onSuccess={handlePostSaved}
          editPost={editingPost}
          preSelectedPlatform={platformFilter}
          preSelectedDate={preSelectedDate}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingPost && (
        <ModalOverlay onClick={cancelDelete}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Delete Post?</ModalTitle>
              <ModalDescription>
                {deletingPost.status === 'published'
                  ? 'This post has been published. Deleting it will remove it from both your calendar and Facebook.'
                  : 'Are you sure you want to delete this post from your calendar?'}
              </ModalDescription>
            </ModalHeader>

            <ModalActions>
              <CancelButton onClick={cancelDelete}>
                Cancel
              </CancelButton>
              <DeleteButton onClick={confirmDelete}>
                {deletingPost.status === 'published' ? 'Delete from Calendar & Facebook' : 'Delete'}
              </DeleteButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
