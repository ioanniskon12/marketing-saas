/**
 * Media Manager Page
 *
 * Features:
 * - Grid view of all media with thumbnails
 * - Batch uploader
 * - Search and filter by type
 * - Delete confirmation
 * - Copy URL to clipboard
 * - Stats display
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Upload, Image as ImageIcon, Video, Trash2, Copy, Check, Search,
  Filter, Loader, AlertCircle, X, Grid3x3, File
} from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { showToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';
import MediaUploader from '@/components/media/MediaUploader';
import { createClient } from '@/lib/supabase/client';

// Styled Components
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.xl};
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.base};
`;

const Stats = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.md};
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

// Uploader Section
const UploaderSection = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const UploaderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const CollapseButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
    color: ${props => props.theme.colors.text.primary};
  }
`;

// Filters Section
const FiltersSection = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  margin-bottom: ${props => props.theme.spacing.xl};
  display: flex;
  gap: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: ${props => props.theme.colors.text.secondary};
  }

  input {
    width: 100%;
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    padding-left: 40px;
    border: 1px solid ${props => props.theme.colors.neutral[300]};
    border-radius: ${props => props.theme.borderRadius.lg};
    font-size: ${props => props.theme.typography.fontSize.sm};
    color: ${props => props.theme.colors.text.primary};
    background: ${props => props.theme.colors.background.default};
    transition: all ${props => props.theme.transitions.fast};

    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary.main};
      box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.main}20;
    }

    &::placeholder {
      color: ${props => props.theme.colors.text.secondary};
    }
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.$active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.primary};
  border: 1px solid ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.$active ? props.theme.colors.primary.main : `${props.theme.colors.primary.main}10`};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Media Grid
const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const MediaCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  transition: all ${props => props.theme.transitions.fast};
  cursor: pointer;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const MediaThumbnail = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: ${props => props.theme.colors.neutral[100]};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MediaTypeIndicator = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  color: white;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const MediaInfo = styled.div`
  padding: ${props => props.theme.spacing.sm};
`;

const MediaName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MediaMeta = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const MediaActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs};
  background: ${props => props.$variant === 'danger' ? props.theme.colors.error.main : props.theme.colors.neutral[100]};
  color: ${props => props.$variant === 'danger' ? 'white' : props.theme.colors.text.primary};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.$variant === 'danger' ? props.theme.colors.error.dark : props.theme.colors.neutral[200]};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

// Empty State
const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['3xl']};
  color: ${props => props.theme.colors.text.secondary};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  border: 1px solid ${props => props.theme.colors.neutral[200]};

  svg {
    width: 64px;
    height: 64px;
    margin-bottom: ${props => props.theme.spacing.lg};
    color: ${props => props.theme.colors.neutral[300]};
  }

  h3 {
    font-size: ${props => props.theme.typography.fontSize.lg};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: ${props => props.theme.spacing.sm};
  }

  p {
    margin-bottom: ${props => props.theme.spacing.lg};
  }
`;

// Loading State
const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing['3xl']};
  color: ${props => props.theme.colors.text.secondary};

  svg {
    width: 32px;
    height: 32px;
    margin-right: ${props => props.theme.spacing.md};
  }
`;

// Delete Modal
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${props => props.theme.spacing.lg};
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};

  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.theme.colors.error.main};
  }
`;

const ModalTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const ModalBody = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
`;

// Format file size helper
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Main Component
export default function MediaManagerPage() {
  const supabase = createClient();
  const { currentWorkspace } = useWorkspace();

  // State
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploaderExpanded, setUploaderExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Load media on mount
  useEffect(() => {
    if (currentWorkspace) {
      loadMedia();
    }
  }, [currentWorkspace]);

  const loadMedia = async () => {
    try {
      setLoading(true);

      // Fetch media from storage
      const { data, error } = await supabase.storage
        .from('media')
        .list(currentWorkspace.id, {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      // Enhance with public URLs
      const enhancedMedia = data.map(file => {
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(`${currentWorkspace.id}/${file.name}`);

        const isVideo = file.metadata?.mimetype?.startsWith('video/') ||
                       file.name.match(/\.(mp4|webm|ogg|mov)$/i);

        return {
          id: file.id,
          name: file.name,
          url: urlData.publicUrl,
          type: isVideo ? 'video' : 'image',
          size: file.metadata?.size || 0,
          created_at: file.created_at,
          metadata: file.metadata
        };
      });

      setMedia(enhancedMedia);
    } catch (error) {
      console.error('Error loading media:', error);
      showToast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    loadMedia();
    setUploaderExpanded(false);
    showToast.success('Media uploaded successfully');
  };

  const handleCopyUrl = (mediaItem) => {
    navigator.clipboard.writeText(mediaItem.url);
    setCopiedId(mediaItem.id);
    showToast.success('URL copied to clipboard');

    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteClick = (mediaItem) => {
    setDeleteModal(mediaItem);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;

    setDeleting(true);

    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([`${currentWorkspace.id}/${deleteModal.name}`]);

      if (error) throw error;

      showToast.success('Media deleted successfully');
      loadMedia();
      setDeleteModal(null);
    } catch (error) {
      console.error('Error deleting media:', error);
      showToast.error('Failed to delete media');
    } finally {
      setDeleting(false);
    }
  };

  // Filter media
  const filteredMedia = media.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate stats
  const totalSize = media.reduce((sum, item) => sum + item.size, 0);
  const imageCount = media.filter(item => item.type === 'image').length;
  const videoCount = media.filter(item => item.type === 'video').length;

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>Media Manager</Title>
          <Subtitle>Manage your media library for all posts</Subtitle>
          <Stats>
            <Stat>
              <StatLabel>Total Files</StatLabel>
              <StatValue>{media.length}</StatValue>
            </Stat>
            <Stat>
              <StatLabel>Images</StatLabel>
              <StatValue>{imageCount}</StatValue>
            </Stat>
            <Stat>
              <StatLabel>Videos</StatLabel>
              <StatValue>{videoCount}</StatValue>
            </Stat>
            <Stat>
              <StatLabel>Total Size</StatLabel>
              <StatValue>{formatFileSize(totalSize)}</StatValue>
            </Stat>
          </Stats>
        </HeaderLeft>
      </Header>

      {/* Uploader Section */}
      <UploaderSection>
        <UploaderHeader>
          <SectionTitle>
            <Upload />
            Upload Media
          </SectionTitle>
          <CollapseButton onClick={() => setUploaderExpanded(!uploaderExpanded)}>
            {uploaderExpanded ? 'Hide' : 'Show'}
          </CollapseButton>
        </UploaderHeader>

        {uploaderExpanded && (
          <MediaUploader onUploadComplete={handleUploadComplete} />
        )}
      </UploaderSection>

      {/* Filters */}
      <FiltersSection>
        <SearchInput>
          <Search />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchInput>

        <FilterButtons>
          <FilterButton
            $active={filterType === 'all'}
            onClick={() => setFilterType('all')}
          >
            <Grid3x3 />
            All
          </FilterButton>
          <FilterButton
            $active={filterType === 'image'}
            onClick={() => setFilterType('image')}
          >
            <ImageIcon />
            Images
          </FilterButton>
          <FilterButton
            $active={filterType === 'video'}
            onClick={() => setFilterType('video')}
          >
            <Video />
            Videos
          </FilterButton>
        </FilterButtons>
      </FiltersSection>

      {/* Media Grid */}
      {loading ? (
        <LoadingState>
          <Loader className="animate-spin" />
          Loading media...
        </LoadingState>
      ) : filteredMedia.length === 0 ? (
        <EmptyState>
          {searchQuery || filterType !== 'all' ? (
            <>
              <File />
              <h3>No media found</h3>
              <p>Try adjusting your search or filter</p>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
              >
                Clear Filters
              </Button>
            </>
          ) : (
            <>
              <ImageIcon />
              <h3>No media yet</h3>
              <p>Upload your first media file to get started</p>
              <Button
                variant="primary"
                onClick={() => setUploaderExpanded(true)}
              >
                <Upload size={18} />
                Upload Media
              </Button>
            </>
          )}
        </EmptyState>
      ) : (
        <MediaGrid>
          {filteredMedia.map(item => (
            <MediaCard key={item.id}>
              <MediaThumbnail>
                {item.type === 'video' ? (
                  <video src={item.url} />
                ) : (
                  <img src={item.url} alt={item.name} />
                )}
                <MediaTypeIndicator>
                  {item.type === 'video' ? <Video /> : <ImageIcon />}
                  {item.type === 'video' ? 'Video' : 'Image'}
                </MediaTypeIndicator>
              </MediaThumbnail>

              <MediaInfo>
                <MediaName title={item.name}>{item.name}</MediaName>
                <MediaMeta>{formatFileSize(item.size)}</MediaMeta>
                <MediaActions>
                  <ActionButton onClick={() => handleCopyUrl(item)}>
                    {copiedId === item.id ? <Check /> : <Copy />}
                    {copiedId === item.id ? 'Copied' : 'Copy URL'}
                  </ActionButton>
                  <ActionButton
                    $variant="danger"
                    onClick={() => handleDeleteClick(item)}
                  >
                    <Trash2 />
                    Delete
                  </ActionButton>
                </MediaActions>
              </MediaInfo>
            </MediaCard>
          ))}
        </MediaGrid>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <ModalOverlay onClick={() => !deleting && setDeleteModal(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <AlertCircle />
              <ModalTitle>Delete Media</ModalTitle>
            </ModalHeader>
            <ModalBody>
              Are you sure you want to delete "{deleteModal.name}"? This action cannot be undone.
            </ModalBody>
            <ModalActions>
              <Button
                variant="ghost"
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
