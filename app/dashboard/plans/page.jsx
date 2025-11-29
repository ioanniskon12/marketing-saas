/**
 * Planning View Page
 *
 * Select accounts, filter by month, choose posts to share
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Calendar,
  Share2,
  Image as ImageIcon,
  Video,
  Clock,
  CheckSquare,
  Square,
  FileText,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Music,
  Youtube,
  X
} from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { showToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import AccountSelector from '@/components/common/AccountSelector';
import SharePlanModal from '@/components/plans/SharePlanModal';
import { PageSpinner } from '@/components/ui';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  animation: ${fadeIn} 0.3s ease-out;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 4px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ShareButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primary.dark};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const CreateButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    color: ${props => props.theme.colors.primary.main};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Account Selector Section
const AccountSection = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  border: 1px solid ${props => props.theme.colors.border.default};
  animation: ${fadeIn} 0.3s ease-out;
  animation-delay: 0.1s;
  animation-fill-mode: both;
`;

const SectionLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

// Month Tabs
const MonthSection = styled.div`
  margin-bottom: 20px;
  animation: ${fadeIn} 0.3s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
`;

const MonthTabsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MonthNavButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    color: ${props => props.theme.colors.primary.main};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const MonthTabsContainer = styled.div`
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 4px 0;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const MonthTab = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background: ${props => props.$active
    ? props.theme.colors.primary.main
    : props.theme.colors.background.paper};
  color: ${props => props.$active
    ? 'white'
    : props.theme.colors.text.secondary};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  ${props => !props.$active && `
    border: 1px solid ${props.theme.colors.border.default};
  `}

  &:hover {
    ${props => !props.$active && `
      background: ${props.theme.colors.background.hover};
      color: ${props.theme.colors.text.primary};
    `}
  }
`;

const YearLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  padding: 0 12px;
  flex-shrink: 0;
`;

// Posts Section
const PostsSection = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border.default};
  animation: ${fadeIn} 0.3s ease-out;
  animation-delay: 0.3s;
  animation-fill-mode: both;
  overflow: hidden;
`;

const PostsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const FilterControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  white-space: nowrap;
`;

const FilterSelect = styled.select`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: ${props => props.theme.colors.background.default};
  color: ${props => props.theme.colors.text.primary};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.main}20;
  }
`;

const PostsTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PostsTitleText = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const PostCount = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  background: ${props => props.theme.colors.background.elevated};
  padding: 4px 10px;
  border-radius: 12px;
`;

const SelectAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: ${props => props.$selected
    ? 'rgba(16, 185, 129, 0.1)'
    : props.theme.colors.background.paper};
  color: ${props => props.$selected
    ? '#10B981'
    : props.theme.colors.text.secondary};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #10B981;
    color: #10B981;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const PostsList = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns || 4}, 1fr);
  gap: 20px;
  max-height: 600px;
  overflow-y: auto;
  padding: 4px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(${props => Math.min(props.$columns || 4, 3)}, 1fr);
  }

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const PostItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 12px;
  background: ${props => props.theme.colors.background.paper};
  transition: all 0.2s ease;
  overflow: hidden;
  position: relative;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  background: ${props => props.theme.colors.background.elevated};
`;

const PostHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const CheckboxButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: ${props => props.$checked
    ? '#10B981'
    : props.theme.colors.text.tertiary};
  transition: color 0.2s ease;
  flex-shrink: 0;

  &:hover {
    color: #10B981;
  }

  svg {
    width: 22px;
    height: 22px;
  }
`;

const PostThumbnail = styled.div`
  width: 100%;
  height: 200px;
  background: ${props => props.theme.colors.background.elevated};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.tertiary};
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    width: 48px;
    height: 48px;
    opacity: 0.3;
  }
`;

const PostContent = styled.div`
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.background.hover};
  }
`;

const PostText = styled.div`
  font-size: 13px;
  line-height: 1.5;
  color: ${props => props.theme.colors.text.primary};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PostDate = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => props.theme.colors.text.tertiary};

  svg {
    width: 12px;
    height: 12px;
  }
`;

const PlatformBadges = styled.div`
  display: flex;
  gap: 4px;
`;

const PlatformBadge = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const StatusBadge = styled.span`
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 12px;
  background: ${props => {
    if (props.$status === 'published') return 'rgba(16, 185, 129, 0.15)';
    if (props.$status === 'scheduled') return 'rgba(59, 130, 246, 0.15)';
    if (props.$status === 'draft') return 'rgba(107, 114, 128, 0.15)';
    return 'rgba(107, 114, 128, 0.15)';
  }};
  color: ${props => {
    if (props.$status === 'published') return '#10B981';
    if (props.$status === 'scheduled') return '#3B82F6';
    if (props.$status === 'draft') return '#6B7280';
    return '#6B7280';
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.text.secondary};

  svg {
    width: 48px;
    height: 48px;
    color: ${props => props.theme.colors.text.tertiary};
    margin-bottom: 16px;
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.theme.colors.text.primary};
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
`;

// Post Detail Modal
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
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  position: sticky;
  top: 0;
  background: ${props => props.theme.colors.background.paper};
  z-index: 1;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.tertiary};
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background.hover};
    color: ${props => props.theme.colors.text.primary};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const MediaGallery = styled.div`
  width: 100%;
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  background: ${props => props.theme.colors.background.elevated};
`;

const MediaItem = styled.div`
  width: 100%;
  max-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: auto;
    object-fit: contain;
  }

  svg {
    width: 64px;
    height: 64px;
    opacity: 0.3;
  }
`;

const PostDetailSection = styled.div`
  margin-bottom: 20px;
`;

const ModalSectionLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const PostFullText = styled.div`
  font-size: 15px;
  line-height: 1.6;
  color: ${props => props.theme.colors.text.primary};
  white-space: pre-wrap;
`;

const HashtagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Hashtag = styled.span`
  font-size: 13px;
  color: ${props => props.theme.colors.primary.main};
  background: ${props => props.theme.colors.primary.main}10;
  padding: 4px 12px;
  border-radius: 12px;
`;

const PLATFORM_CONFIG = {
  facebook: { icon: Facebook, color: '#1877F2', label: 'Facebook' },
  instagram: { icon: Instagram, color: '#E4405F', label: 'Instagram' },
  linkedin: { icon: Linkedin, color: '#0A66C2', label: 'LinkedIn' },
  twitter: { icon: Twitter, color: '#1DA1F2', label: 'Twitter/X' },
  tiktok: { icon: Music, color: '#000000', label: 'TikTok' },
  youtube: { icon: Youtube, color: '#FF0000', label: 'YouTube' },
};

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function PlansPage() {
  const router = useRouter();
  const { currentWorkspace } = useWorkspace();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showShareModal, setShowShareModal] = useState(false);
  const [viewingPost, setViewingPost] = useState(null);

  const columnsPerRow = 4; // Fixed at 4 columns

  useEffect(() => {
    if (currentWorkspace) {
      loadData();
    }
  }, [currentWorkspace]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load accounts
      const accountsResponse = await fetch(`/api/social-accounts?workspace_id=${currentWorkspace.id}`);
      const accountsData = await accountsResponse.json();
      setAccounts(accountsData.accounts || []);

      // Load posts with media
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          post_media (*)
        `)
        .eq('workspace_id', currentWorkspace.id)
        .order('scheduled_for', { ascending: false});

      if (postsError) throw postsError;
      console.log('📊 Loaded posts:', postsData?.length, 'posts');
      console.log('Sample post:', postsData?.[0]);
      setPosts(postsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      showToast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to detect post content type
  const getPostContentType = (post) => {
    // Check post_media array first
    if (post.post_media && post.post_media.length > 0) {
      const firstMedia = post.post_media[0];
      if (firstMedia.media_type === 'video') return 'video';
      if (firstMedia.media_type === 'image') return 'image';
    }

    // Fallback to media_urls
    if (post.media_urls && post.media_urls.length > 0) {
      const firstMedia = post.media_urls[0];
      if (typeof firstMedia === 'string') {
        if (firstMedia.match(/\.(mp4|mov|avi|webm)$/i)) return 'video';
        if (firstMedia.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return 'image';
      }
    }

    // No media - text only
    return 'text';
  };

  // Filter posts by platform, content type, and month
  const filteredPosts = useMemo(() => {
    console.log('🔍 Filtering:', {
      totalPosts: posts.length,
      platformFilter,
      contentTypeFilter,
      selectedYear,
      selectedMonth
    });

    const filtered = posts.filter(post => {
      // Exclude draft posts
      if (post.status === 'draft') {
        return false;
      }

      // Platform filter
      if (platformFilter !== 'all') {
        const postPlatforms = post.platforms || [post.platform];
        if (!postPlatforms.includes(platformFilter)) {
          return false;
        }
      }

      // Content type filter
      if (contentTypeFilter !== 'all') {
        const postType = getPostContentType(post);
        if (postType !== contentTypeFilter) {
          return false;
        }
      }

      // Month filter
      const postDate = new Date(post.scheduled_for || post.created_at);
      if (postDate.getFullYear() !== selectedYear || postDate.getMonth() !== selectedMonth) {
        return false;
      }

      return true;
    });

    console.log('✅ Filtered posts:', filtered.length);
    return filtered;
  }, [posts, platformFilter, contentTypeFilter, selectedYear, selectedMonth]);

  // Get selected post objects
  const selectedPostObjects = useMemo(() => {
    return posts.filter(post => selectedPosts.includes(post.id));
  }, [posts, selectedPosts]);

  const handleTogglePost = (postId) => {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredPosts.map(p => p.id));
    }
  };

  const handleRemoveFromSelection = (postId) => {
    setSelectedPosts(prev => prev.filter(id => id !== postId));
  };

  const handleYearChange = (direction) => {
    setSelectedYear(prev => prev + direction);
  };

  const getPostThumbnail = (post) => {
    // Check post_media array (from database join)
    if (post.post_media && post.post_media.length > 0) {
      const firstMedia = post.post_media[0];
      if (firstMedia.media_type === 'video') {
        // Show thumbnail for video or video icon
        if (firstMedia.thumbnail_url) {
          return <img src={firstMedia.thumbnail_url} alt="Video thumbnail" />;
        }
        return <Video />;
      } else if (firstMedia.media_type === 'image') {
        return <img src={firstMedia.file_url} alt="Post media" />;
      }
    }

    // Fallback to media_urls if exists
    if (post.media_urls && post.media_urls.length > 0) {
      const firstMedia = post.media_urls[0];
      if (typeof firstMedia === 'string' && firstMedia.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return <img src={firstMedia} alt="Post media" />;
      }
      if (typeof firstMedia === 'string' && firstMedia.match(/\.(mp4|mov|avi|webm)$/i)) {
        return <Video />;
      }
    }

    // No media - show placeholder
    return <FileText />;
  };

  if (loading) {
    return <PageSpinner />;
  }

  if (!currentWorkspace) {
    return (
      <Container>
        <EmptyState>
          <FileText />
          <h3>No Workspace Selected</h3>
          <p>Please select a workspace to view plans</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>Planning</Title>
          <Subtitle>Select posts to create and share content plans</Subtitle>
        </HeaderLeft>
        <HeaderActions>
          <CreateButton onClick={() => router.push('/dashboard/create-post')}>
            <Plus />
            New Post
          </CreateButton>
          <ShareButton
            onClick={() => setShowShareModal(true)}
            disabled={selectedPosts.length === 0}
          >
            <Share2 />
            Share Plan ({selectedPosts.length})
          </ShareButton>
        </HeaderActions>
      </Header>

      {/* Account Selector */}
      <AccountSection>
        <SectionLabel>Filter by Account</SectionLabel>
        <AccountSelector
          accounts={accounts.filter(acc => acc.is_active).map(acc => ({
            ...acc,
            connected: true,
            selected: platformFilter === acc.platform,
          }))}
          isAllSelected={platformFilter === 'all'}
          onSelectAll={() => setPlatformFilter('all')}
          onToggleSelect={(accountId, platform) => {
            setPlatformFilter(platformFilter === platform ? 'all' : platform);
          }}
          showAllOption={true}
          showUnconnected={false}
        />
      </AccountSection>

      {/* Month Tabs */}
      <MonthSection>
        <MonthTabsWrapper>
          <MonthNavButton onClick={() => handleYearChange(-1)}>
            <ChevronLeft />
          </MonthNavButton>
          <YearLabel>{selectedYear}</YearLabel>
          <MonthTabsContainer>
            {MONTHS.map((month, index) => (
              <MonthTab
                key={month}
                $active={selectedMonth === index}
                onClick={() => setSelectedMonth(index)}
              >
                {month}
              </MonthTab>
            ))}
          </MonthTabsContainer>
          <MonthNavButton onClick={() => handleYearChange(1)}>
            <ChevronRight />
          </MonthNavButton>
        </MonthTabsWrapper>
      </MonthSection>

      {/* Posts List */}
      <PostsSection>
        <PostsHeader>
          <PostsTitle>
            <PostsTitleText>Posts</PostsTitleText>
            <PostCount>{filteredPosts.length} posts</PostCount>
          </PostsTitle>
          <FilterControls>
            <FilterGroup>
              <FilterLabel>Content:</FilterLabel>
              <FilterSelect
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="text">Text Only</option>
              </FilterSelect>
            </FilterGroup>
            {filteredPosts.length > 0 && (
              <SelectAllButton
                onClick={handleSelectAll}
                $selected={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
              >
                {selectedPosts.length === filteredPosts.length && filteredPosts.length > 0 ? (
                  <>
                    <CheckSquare />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square />
                    Select All
                  </>
                )}
              </SelectAllButton>
            )}
          </FilterControls>
        </PostsHeader>

        <PostsList $columns={columnsPerRow}>
          {filteredPosts.length === 0 ? (
            <EmptyState>
              <Calendar />
              <h3>No posts for {MONTHS[selectedMonth]} {selectedYear}</h3>
              <p>Create content or select a different month</p>
            </EmptyState>
          ) : (
            filteredPosts.map((post) => {
              const isSelected = selectedPosts.includes(post.id);
              const platforms = post.platforms || [post.platform];

              return (
                <PostItem key={post.id}>
                  <PostHeader>
                    <PostHeaderLeft>
                      <CheckboxButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePost(post.id);
                        }}
                        $checked={isSelected}
                      >
                        {isSelected ? <CheckSquare /> : <Square />}
                      </CheckboxButton>
                      <PlatformBadges>
                        {platforms.map((platform) => {
                          const config = PLATFORM_CONFIG[platform];
                          if (!config) return null;
                          const Icon = config.icon;
                          return (
                            <PlatformBadge key={platform} $color={config.color}>
                              <Icon />
                            </PlatformBadge>
                          );
                        })}
                      </PlatformBadges>
                    </PostHeaderLeft>
                    <PostDate>
                      <Clock />
                      {formatDate(post.scheduled_for || post.created_at)}
                    </PostDate>
                  </PostHeader>

                  <PostThumbnail onClick={() => setViewingPost(post)}>
                    {getPostThumbnail(post)}
                  </PostThumbnail>

                  <PostContent onClick={() => setViewingPost(post)}>
                    <PostText>
                      {post.content || 'No content'}
                    </PostText>
                  </PostContent>
                </PostItem>
              );
            })
          )}
        </PostsList>
      </PostsSection>

      {/* Share Plan Modal */}
      <SharePlanModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        selectedPosts={selectedPostObjects}
        onRemovePost={handleRemoveFromSelection}
      />

      {/* Post Detail Modal */}
      {viewingPost && (
        <ModalOverlay onClick={() => setViewingPost(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <PlatformBadges>
                  {(viewingPost.platforms || [viewingPost.platform]).map((platform) => {
                    const config = PLATFORM_CONFIG[platform];
                    if (!config) return null;
                    const Icon = config.icon;
                    return (
                      <PlatformBadge key={platform} $color={config.color}>
                        <Icon />
                      </PlatformBadge>
                    );
                  })}
                </PlatformBadges>
                Post Details
              </ModalTitle>
              <CloseButton onClick={() => setViewingPost(null)}>
                <X />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              {/* Media Gallery */}
              {viewingPost.post_media && viewingPost.post_media.length > 0 && (
                <MediaGallery>
                  {viewingPost.post_media.map((media, index) => (
                    <MediaItem key={index}>
                      {media.media_type === 'image' ? (
                        <img src={media.file_url} alt={`Media ${index + 1}`} />
                      ) : media.media_type === 'video' ? (
                        media.thumbnail_url ? (
                          <img src={media.thumbnail_url} alt="Video thumbnail" />
                        ) : (
                          <Video />
                        )
                      ) : null}
                    </MediaItem>
                  ))}
                </MediaGallery>
              )}

              {/* Content */}
              <PostDetailSection>
                <ModalSectionLabel>Content</ModalSectionLabel>
                <PostFullText>{viewingPost.content || 'No content'}</PostFullText>
              </PostDetailSection>

              {/* Scheduled Date */}
              <PostDetailSection>
                <ModalSectionLabel>Scheduled For</ModalSectionLabel>
                <PostDate>
                  <Clock />
                  {formatDate(viewingPost.scheduled_for || viewingPost.created_at)}
                </PostDate>
              </PostDetailSection>

              {/* Hashtags */}
              {viewingPost.hashtags && viewingPost.hashtags.length > 0 && (
                <PostDetailSection>
                  <ModalSectionLabel>Hashtags</ModalSectionLabel>
                  <HashtagsList>
                    {viewingPost.hashtags.map((tag, index) => (
                      <Hashtag key={index}>#{tag}</Hashtag>
                    ))}
                  </HashtagsList>
                </PostDetailSection>
              )}

              {/* Status */}
              <PostDetailSection>
                <ModalSectionLabel>Status</ModalSectionLabel>
                <StatusBadge $status={viewingPost.status}>
                  {viewingPost.status}
                </StatusBadge>
              </PostDetailSection>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
