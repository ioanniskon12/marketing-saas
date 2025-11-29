/**
 * Media Library Page
 *
 * Display all uploaded media (images and videos) from posts.
 * Features: Grid view, filtering, media details modal.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Image as ImageIcon, Video, Filter, Loader, FileX, Play, X, Download, Trash2, Upload, Edit2, RefreshCw } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primary.dark};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const Stats = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  transition: all ${props => props.theme.transitions.fast};
  border: 1px solid ${props => props.$active
    ? props.theme.colors.primary.main
    : props.theme.colors.border.default};
  background: ${props => props.$active
    ? props.theme.colors.primary.main
    : props.theme.colors.background.paper};
  color: ${props => props.$active
    ? 'white'
    : props.theme.colors.text.primary};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.$active
      ? props.theme.colors.primary.dark
      : `${props.theme.colors.primary.main}10`};
  }
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const MediaCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    box-shadow: ${props => props.theme.shadows.lg};
    transform: translateY(-2px);
  }
`;

const MediaThumbnail = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  background: ${props => props.theme.colors.neutral[100]};
  overflow: hidden;
`;

const MediaImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VideoOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const MediaInfo = styled.div`
  padding: ${props => props.theme.spacing.md};
`;

const MediaName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const MediaMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing['3xl']};
  color: ${props => props.theme.colors.text.secondary};
  gap: ${props => props.theme.spacing.md};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing['3xl']};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.sm};
  text-align: center;
  gap: ${props => props.theme.spacing.md};

  svg {
    color: ${props => props.theme.colors.text.secondary};
  }

  h3 {
    font-size: ${props => props.theme.typography.fontSize.xl};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
  }

  p {
    color: ${props => props.theme.colors.text.secondary};
    max-width: 400px;
  }
`;

const SpinnerIcon = styled(Loader)`
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.sm};
  }
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  max-width: 800px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows['2xl']};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    flex-direction: column;
    max-height: 90vh;
    max-width: 95%;
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    max-width: 100%;
  }
`;

const ModalMediaSection = styled.div`
  flex: 0 0 500px;
  background: ${props => props.theme.colors.neutral[900]};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 300px;
  max-height: 85vh;

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    flex: 0 0 auto;
    min-height: 250px;
    max-height: 50vh;
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    min-height: 200px;
    max-height: 40vh;
  }
`;

const ModalMediaImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  padding: ${props => props.theme.spacing.md};
`;

const ModalMediaVideo = styled.video`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  padding: ${props => props.theme.spacing.md};
`;

const ModalSidebar = styled.div`
  width: 300px;
  background: ${props => props.theme.colors.background.paper};
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    width: 100%;
    max-height: 40vh;
  }
`;

const ModalHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: ${props => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.secondary};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const ModalBody = styled.div`
  padding: ${props => props.theme.spacing.lg};
  flex: 1;
  overflow-y: auto;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md} 0;
  border-bottom: 1px solid ${props => props.theme.colors.neutral[100]};

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const DetailValue = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-align: right;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const EditIcon = styled.button`
  padding: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.fast};
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
    color: ${props => props.theme.colors.primary.main};
  }
`;

const RenameInput = styled.input`
  flex: 1;
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  transition: border-color ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const RenameActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.sm};
`;

const RenameButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  transition: all ${props => props.theme.transitions.fast};

  ${props => props.$primary ? `
    background: ${props.theme.colors.primary.main};
    color: white;
    &:hover {
      background: ${props.theme.colors.primary.dark};
    }
  ` : `
    background: ${props.theme.colors.neutral[100]};
    color: ${props.theme.colors.text.primary};
    &:hover {
      background: ${props.theme.colors.neutral[200]};
    }
  `}
`;

const PostInfo = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const PostInfoTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const PostInfoText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

const ModalFooter = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.neutral[200]};
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const ActionButton = styled.button`
  flex: 1;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  transition: all ${props => props.theme.transitions.fast};

  ${props => props.$variant === 'danger' ? `
    background: ${props.theme.colors.danger};
    color: white;
    &:hover {
      background: ${props.theme.colors.dangerDark};
    }
  ` : `
    background: ${props.theme.colors.neutral[100]};
    color: ${props.theme.colors.text.primary};
    &:hover {
      background: ${props.theme.colors.neutral[200]};
    }
  `}
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${props => props.theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
`;

const ItemsPerPageSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const ItemsPerPageSelect = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.neutral[300]};
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const PageButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  transition: all ${props => props.theme.transitions.fast};
  border: 1px solid ${props => props.$active
    ? props.theme.colors.primary.main
    : props.theme.colors.neutral[300]};
  background: ${props => props.$active
    ? props.theme.colors.primary.main
    : props.theme.colors.background.paper};
  color: ${props => props.$active
    ? 'white'
    : props.theme.colors.text.primary};

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.$active
      ? props.theme.colors.primary.dark
      : `${props.theme.colors.primary.main}10`};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  padding: 0 ${props => props.theme.spacing.md};
`;

export default function Library() {
  const { currentWorkspace } = useWorkspace();
  const [media, setMedia] = useState([]);
  const [stats, setStats] = useState({ total: 0, images: 0, videos: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'image', 'video'
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);

  useEffect(() => {
    if (currentWorkspace) {
      fetchMedia();
    }
  }, [currentWorkspace, filter]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const filterParam = filter === 'all' ? '' : `&type=${filter}`;
      const response = await fetch(`/api/media?workspaceId=${currentWorkspace.id}${filterParam}`);

      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }

      const data = await response.json();
      setMedia(data.media || []);
      setStats(data.stats || { total: 0, images: 0, videos: 0 });
    } catch (error) {
      console.error('Error fetching media:', error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${kb.toFixed(1)} KB`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleMediaClick = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setNewFileName(mediaItem.file_name || '');
    setEditingName(false);
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
    setEditingName(false);
    setNewFileName('');
  };

  const handleDownload = () => {
    if (selectedMedia) {
      window.open(selectedMedia.file_url, '_blank');
    }
  };

  const handleStartRename = () => {
    setEditingName(true);
  };

  const handleSaveRename = async () => {
    if (!selectedMedia || !newFileName.trim()) {
      return;
    }

    try {
      const response = await fetch('/api/media', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaId: selectedMedia.id,
          fileName: newFileName.trim(),
          workspaceId: currentWorkspace.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rename');
      }

      setEditingName(false);

      // Update local state
      setSelectedMedia({ ...selectedMedia, file_name: newFileName.trim() });

      // Refresh media library
      await fetchMedia();
    } catch (error) {
      console.error('Error renaming media:', error);
    }
  };

  const handleCancelRename = () => {
    setNewFileName(selectedMedia?.file_name || '');
    setEditingName(false);
  };

  const handleDelete = async () => {
    if (!selectedMedia || !confirm('Are you sure you want to delete this media? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/media?mediaId=${selectedMedia.id}&workspaceId=${currentWorkspace.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete');
      }

      handleCloseModal();

      // Refresh media library
      await fetchMedia();
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const handleReplaceClick = () => {
    replaceFileInputRef.current?.click();
  };

  const handleReplaceFile = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!confirm('Are you sure you want to replace this media? The old file will be deleted.')) {
      event.target.value = '';
      return;
    }

    try {
      setUploading(true);

      // Delete old media
      await fetch(`/api/media?mediaId=${selectedMedia.id}&workspaceId=${currentWorkspace.id}`, {
        method: 'DELETE',
      });

      // Upload new file
      const formData = new FormData();
      formData.append('workspaceId', currentWorkspace.id);
      formData.append('files', files[0]);

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload replacement');
      }

      handleCloseModal();

      // Refresh media library
      await fetchMedia();

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Error replacing media:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);

      // Create form data
      const formData = new FormData();
      formData.append('workspaceId', currentWorkspace.id);

      // Add all files
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      // Upload to server
      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload');
      }

      // Refresh media library
      await fetchMedia();

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Calculate pagination
  const totalPages = Math.ceil(media.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMedia = media.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <SpinnerIcon size={48} />
          <p>Loading media library...</p>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <HiddenFileInput
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
      />

      <HiddenFileInput
        ref={replaceFileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleReplaceFile}
      />

      <Header>
        <div>
          <Title>Media Library</Title>
          <Stats>
            <StatItem>
              <strong>{stats.total}</strong> total files
            </StatItem>
            <StatItem>
              <ImageIcon size={16} /> <strong>{stats.images}</strong> images
            </StatItem>
            <StatItem>
              <Video size={16} /> <strong>{stats.videos}</strong> videos
            </StatItem>
            <StatItem>
              {formatFileSize(stats.total_size)} used
            </StatItem>
          </Stats>
        </div>
        <UploadButton onClick={handleUploadClick} disabled={uploading}>
          <Upload size={20} />
          {uploading ? 'Uploading...' : 'Upload Media'}
        </UploadButton>
      </Header>

      <FilterBar>
        <FilterButton
          $active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All Media
        </FilterButton>
        <FilterButton
          $active={filter === 'image'}
          onClick={() => setFilter('image')}
        >
          <ImageIcon size={16} />
          Images
        </FilterButton>
        <FilterButton
          $active={filter === 'video'}
          onClick={() => setFilter('video')}
        >
          <Video size={16} />
          Videos
        </FilterButton>
      </FilterBar>

      {media.length === 0 ? (
        <EmptyState>
          <FileX size={64} />
          <h3>No media found</h3>
          <p>
            Upload images or videos by creating a post. All your media will appear here.
          </p>
        </EmptyState>
      ) : (
        <>
          <MediaGrid>
            {paginatedMedia.map((item) => {
              const isVideo = item.mime_type?.startsWith('video/');
              const thumbnailUrl = item.thumbnail_url || item.file_url;

              return (
                <MediaCard key={item.id} onClick={() => handleMediaClick(item)}>
                  <MediaThumbnail>
                    <MediaImage
                      src={thumbnailUrl}
                      alt={item.file_name}
                      loading="lazy"
                    />
                    {isVideo && (
                      <VideoOverlay>
                        <Play size={24} fill="white" />
                      </VideoOverlay>
                    )}
                  </MediaThumbnail>
                  <MediaInfo>
                    <MediaName title={item.file_name}>
                      {item.file_name}
                    </MediaName>
                    <MediaMeta>
                      <span>{formatFileSize(item.file_size)}</span>
                      <span>{formatDate(item.created_at)}</span>
                    </MediaMeta>
                  </MediaInfo>
                </MediaCard>
              );
            })}
          </MediaGrid>

          {/* Pagination */}
          {totalPages > 1 && (
            <PaginationContainer>
              <ItemsPerPageSelector>
                <span>Show:</span>
                <ItemsPerPageSelect
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={72}>72 (max)</option>
                </ItemsPerPageSelect>
                <span>per page</span>
              </ItemsPerPageSelector>

              <PaginationControls>
                <PageButton
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </PageButton>

                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <PageInfo key={`ellipsis-${index}`}>...</PageInfo>
                  ) : (
                    <PageButton
                      key={page}
                      $active={currentPage === page}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </PageButton>
                  )
                ))}

                <PageButton
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </PageButton>
              </PaginationControls>

              <PageInfo>
                Showing {startIndex + 1}-{Math.min(endIndex, media.length)} of {media.length}
              </PageInfo>
            </PaginationContainer>
          )}
        </>
      )}

      {/* Media Detail Modal */}
      {selectedMedia && (
        <ModalOverlay $show={!!selectedMedia} onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalMediaSection>
              {selectedMedia.mime_type?.startsWith('video/') ? (
                <ModalMediaVideo controls>
                  <source src={selectedMedia.file_url} type={selectedMedia.mime_type} />
                  Your browser does not support the video tag.
                </ModalMediaVideo>
              ) : (
                <ModalMediaImage
                  src={selectedMedia.file_url}
                  alt={selectedMedia.file_name}
                />
              )}
            </ModalMediaSection>

            <ModalSidebar>
              <ModalHeader>
                <ModalTitle>Media Details</ModalTitle>
                <CloseButton onClick={handleCloseModal}>
                  <X size={20} />
                </CloseButton>
              </ModalHeader>

              <ModalBody>
                <DetailRow>
                  <DetailLabel>File Name</DetailLabel>
                  {editingName ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <RenameInput
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        autoFocus
                      />
                      <RenameActions>
                        <RenameButton onClick={handleCancelRename}>
                          Cancel
                        </RenameButton>
                        <RenameButton $primary onClick={handleSaveRename}>
                          Save
                        </RenameButton>
                      </RenameActions>
                    </div>
                  ) : (
                    <DetailValue>
                      <span>{selectedMedia.file_name}</span>
                      <EditIcon onClick={handleStartRename} title="Rename file">
                        <Edit2 size={14} />
                      </EditIcon>
                    </DetailValue>
                  )}
                </DetailRow>
                <DetailRow>
                  <DetailLabel>File Size</DetailLabel>
                  <DetailValue>{formatFileSize(selectedMedia.file_size)}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Type</DetailLabel>
                  <DetailValue>
                    {selectedMedia.mime_type?.startsWith('video/') ? 'Video' : 'Image'}
                  </DetailValue>
                </DetailRow>
                {selectedMedia.width && selectedMedia.height && (
                  <DetailRow>
                    <DetailLabel>Dimensions</DetailLabel>
                    <DetailValue>
                      {selectedMedia.width} × {selectedMedia.height}
                    </DetailValue>
                  </DetailRow>
                )}
                {selectedMedia.duration && (
                  <DetailRow>
                    <DetailLabel>Duration</DetailLabel>
                    <DetailValue>{Math.round(selectedMedia.duration)}s</DetailValue>
                  </DetailRow>
                )}
                <DetailRow>
                  <DetailLabel>Uploaded</DetailLabel>
                  <DetailValue>{formatDate(selectedMedia.created_at)}</DetailValue>
                </DetailRow>

                {selectedMedia.post && (
                  <PostInfo>
                    <PostInfoTitle>Used in Post</PostInfoTitle>
                    <PostInfoText>
                      {selectedMedia.post.content?.substring(0, 150)}
                      {selectedMedia.post.content?.length > 150 ? '...' : ''}
                    </PostInfoText>
                    <PostInfoText style={{ marginTop: '8px', fontSize: '12px' }}>
                      Status: {selectedMedia.post.status} |
                      Scheduled: {selectedMedia.post.scheduled_for
                        ? formatDate(selectedMedia.post.scheduled_for)
                        : 'Not scheduled'}
                    </PostInfoText>
                  </PostInfo>
                )}
              </ModalBody>

              <ModalFooter>
                <ActionButton onClick={handleDownload}>
                  <Download size={18} />
                  Download
                </ActionButton>
                <ActionButton onClick={handleReplaceClick} disabled={uploading}>
                  <RefreshCw size={18} />
                  {uploading ? 'Replacing...' : 'Replace'}
                </ActionButton>
                <ActionButton $variant="danger" onClick={handleDelete}>
                  <Trash2 size={18} />
                  Delete
                </ActionButton>
              </ModalFooter>
            </ModalSidebar>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
