'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Instagram, GripVertical, Heart, MessageCircle, X } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { showToast } from '@/components/ui/Toast';
import { PageSpinner } from '@/components/ui';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing['2xl']};
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

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
`;

const AccountSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const AccountSelectorLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.secondary};
`;

const AccountButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.background.paper};
  color: ${props => props.$selected ? '#ffffff' : props.theme.colors.text.primary};
  border: 2px solid ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    ${props => !props.$selected && `background: ${props.theme.colors.neutral[50]};`}
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AccountBadge = styled.span`
  padding: 2px 6px;
  background: ${props => `${props.theme.colors.primary.main}20`};
  color: ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const InstagramContainer = styled.div`
  max-width: 935px;
  margin: 0 auto;
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.xl};
  overflow: hidden;
`;

const ProfileHeader = styled.div`
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const ProfilePic = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ProfileStats = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const DragHint = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => `${props.theme.colors.primary.main}10`};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};
  text-align: center;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
`;

const FeedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
`;

const GridItem = styled.div`
  aspect-ratio: 1;
  position: relative;
  overflow: hidden;
  background: ${props => props.theme.colors.neutral[100]};
  cursor: ${props => props.$isSaving ? 'not-allowed' : props.$isDragging ? 'grabbing' : 'grab'};
  transition: transform ${props => props.theme.transitions.fast};
  opacity: ${props => props.$isSaving ? 0.6 : props.$isDragging ? 0.5 : 1};
  transform: ${props => props.$isDragging ? 'scale(1.05)' : 'scale(1)'};

  &:hover > div.overlay {
    opacity: ${props => props.$isSaving ? 0 : 1};
  }

  &:hover > div.drag-handle {
    opacity: ${props => props.$isSaving ? 0 : 1};
  }

  ${props => props.$isDragOver && `
    border: 3px dashed ${props.theme.colors.primary.main};
  `}
`;

const GridImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
`;

const GridPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  background: linear-gradient(135deg, ${props => props.theme.colors.neutral[100]} 0%, ${props => props.theme.colors.neutral[200]} 100%);
`;

const GridOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.lg};
  color: white;
  opacity: 0;
  transition: opacity ${props => props.theme.transitions.fast};
  pointer-events: none;
`;

const OverlayStat = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const DragHandle = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.sm};
  right: ${props => props.theme.spacing.sm};
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity ${props => props.theme.transitions.fast};
  box-shadow: ${props => props.theme.shadows.md};
  cursor: grab;
  z-index: 10;
  pointer-events: none;

  &:active {
    cursor: grabbing;
  }
`;

const PostModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.modal};
  padding: ${props => props.theme.spacing.xl};
`;

const PostModalContent = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
`;

const PostImageSection = styled.div`
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const PostImage = styled.img`
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
`;

const PostImagePlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  color: ${props => props.theme.colors.neutral[600]};
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: transform ${props => props.theme.transitions.fast};

  &:hover {
    transform: scale(1.1);
  }
`;

const PostDetails = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const PostCaption = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: 1.6;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const PostDate = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

export default function InstagramPreview() {
  const { currentWorkspace } = useWorkspace();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [instagramAccounts, setInstagramAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      loadInstagramAccounts();
    }
  }, [currentWorkspace]);

  useEffect(() => {
    if (selectedAccount) {
      loadPosts();
    }
  }, [selectedAccount]);

  const loadInstagramAccounts = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .eq('platform', 'instagram')
        .eq('is_active', true);

      if (error) throw error;

      // Create demo account if no real accounts exist
      const accounts = data && data.length > 0 ? data : [
        {
          id: 'demo-instagram',
          platform: 'instagram',
          username: currentWorkspace.name,
          display_name: currentWorkspace.name,
          is_demo: true,
        }
      ];

      setInstagramAccounts(accounts);
      if (accounts.length > 0) {
        setSelectedAccount(accounts[0]);
      }
    } catch (error) {
      console.error('Error loading Instagram accounts:', error);
      // Use demo account as fallback
      const demoAccount = {
        id: 'demo-instagram',
        platform: 'instagram',
        username: currentWorkspace.name,
        display_name: currentWorkspace.name,
        is_demo: true,
      };
      setInstagramAccounts([demoAccount]);
      setSelectedAccount(demoAccount);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        workspace_id: currentWorkspace.id,
      });

      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load posts');
      }

      // Filter posts that have images and match the selected account
      const postsWithImages = (data.posts || []).filter(post => {
        const hasImages = post.post_media && post.post_media.length > 0;
        // Check if post is for this Instagram account
        const isForAccount = post.platforms && post.platforms.includes(selectedAccount.id);
        return hasImages && isForAccount;
      });

      // Sort by feed_position if available, otherwise by created_at
      const sortedPosts = postsWithImages.sort((a, b) => {
        // Use general feed_position for now
        if (a.feed_position !== undefined && b.feed_position !== undefined) {
          return a.feed_position - b.feed_position;
        }

        // Fallback to created_at date
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      showToast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const saveFeedOrder = async (updatedPosts) => {
    try {
      setSaving(true);

      console.log('Saving feed order for account:', selectedAccount.id);
      console.log('Posts to save:', updatedPosts.map((post, index) => ({
        id: post.id,
        feed_position: index,
        content: post.content?.substring(0, 50)
      })));

      // Save feed positions to database
      const response = await fetch('/api/posts/feed-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: selectedAccount.id,
          posts: updatedPosts.map((post, index) => ({
            id: post.id,
            feed_position: index,
          })),
        }),
      });

      const data = await response.json();
      console.log('Save response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save feed order');
      }

      showToast.success('Feed order saved!');

      // Reload posts to confirm the changes were saved
      console.log('Reloading posts...');
      await loadPosts();
    } catch (error) {
      console.error('Error saving feed order:', error);
      showToast.error('Failed to save feed order');
      // Reload posts to restore the correct order from database
      await loadPosts();
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newPosts = [...posts];
    const [draggedPost] = newPosts.splice(draggedIndex, 1);
    newPosts.splice(dropIndex, 0, draggedPost);

    // Update feed_position for all posts
    const updatedPosts = newPosts.map((post, index) => ({
      ...post,
      feed_position: index,
    }));

    setPosts(updatedPosts);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Save to database
    await saveFeedOrder(updatedPosts);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const formatCaption = (post) => {
    let caption = post.content || '';

    if (post.hashtags && post.hashtags.length > 0) {
      caption += '\n\n' + post.hashtags.map(tag => `#${tag}`).join(' ');
    }

    return caption;
  };

  if (loading) {
    return <PageSpinner />;
  }

  return (
    <Container>
      <Header>
        <Title>
          <Instagram size={36} />
          Instagram Feed Preview
        </Title>
        <Subtitle>
          Drag and drop posts to reorder your Instagram feed
        </Subtitle>
      </Header>

      {/* Account Selector */}
      {instagramAccounts.length > 1 && (
        <AccountSelector>
          <AccountSelectorLabel>Instagram Account:</AccountSelectorLabel>
          {instagramAccounts.map((account) => (
            <AccountButton
              key={account.id}
              $selected={selectedAccount?.id === account.id}
              onClick={() => setSelectedAccount(account)}
              disabled={loading || saving}
            >
              {account.username || account.display_name}
              {account.is_demo && <AccountBadge>DEMO</AccountBadge>}
            </AccountButton>
          ))}
        </AccountSelector>
      )}

      <InstagramContainer>
        <ProfileHeader>
          <ProfilePic>
            {(selectedAccount?.username || selectedAccount?.display_name || currentWorkspace.name)?.charAt(0).toUpperCase()}
          </ProfilePic>
          <ProfileInfo>
            <ProfileName>{selectedAccount?.username || selectedAccount?.display_name || currentWorkspace.name}</ProfileName>
            <ProfileStats>
              <span><strong>{posts.length}</strong> posts</span>
              <span><strong>1.2K</strong> followers</span>
              <span><strong>345</strong> following</span>
            </ProfileStats>
          </ProfileInfo>
        </ProfileHeader>

        {posts.length > 0 && (
          <DragHint>
            <GripVertical size={16} />
            {saving ? 'Saving feed order...' : 'Drag and drop posts to reorder your feed'}
          </DragHint>
        )}

        {posts.length === 0 ? (
          <EmptyState>
            <p>No posts with images yet</p>
            <p>Add images to your posts to see them in the Instagram preview</p>
          </EmptyState>
        ) : (
          <FeedGrid>
            {posts.map((post, index) => {
              const firstMedia = post.post_media[0];

              return (
                <GridItem
                  key={post.id}
                  draggable={!saving}
                  $isDragging={draggedIndex === index}
                  $isDragOver={dragOverIndex === index}
                  $isSaving={saving}
                  onDragStart={(e) => !saving && handleDragStart(e, index)}
                  onDragOver={(e) => !saving && handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => !saving && handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => !saving && setSelectedPost(post)}
                >
                  {firstMedia ? (
                    <GridImage src={firstMedia.file_url} alt="" />
                  ) : (
                    <GridPlaceholder>📷</GridPlaceholder>
                  )}
                  <GridOverlay className="overlay">
                    <OverlayStat>
                      <Heart size={20} fill="white" />
                      <span>0</span>
                    </OverlayStat>
                    <OverlayStat>
                      <MessageCircle size={20} fill="white" />
                      <span>0</span>
                    </OverlayStat>
                  </GridOverlay>
                  <DragHandle className="drag-handle">
                    <GripVertical size={16} color="#666" />
                  </DragHandle>
                </GridItem>
              );
            })}
          </FeedGrid>
        )}
      </InstagramContainer>

      {/* Post Detail Modal */}
      <PostModal $isOpen={!!selectedPost} onClick={() => setSelectedPost(null)}>
        <PostModalContent onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={() => setSelectedPost(null)}>
            <X size={18} />
          </CloseButton>

          <PostImageSection>
            {selectedPost?.post_media?.[0] ? (
              <PostImage src={selectedPost.post_media[0].file_url} alt="" />
            ) : (
              <PostImagePlaceholder>📷</PostImagePlaceholder>
            )}
          </PostImageSection>

          <PostDetails>
            <PostCaption>
              {formatCaption(selectedPost || {})}
            </PostCaption>
            <PostDate>
              {selectedPost?.scheduled_for
                ? new Date(selectedPost.scheduled_for).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : 'Draft'}
            </PostDate>
          </PostDetails>
        </PostModalContent>
      </PostModal>
    </Container>
  );
}
