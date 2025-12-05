/**
 * Media Library Selector Component
 *
 * Modal for selecting images from the media library
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Image as ImageIcon, Video, Search, CheckCircle } from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const SearchBar = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$active ? `${props.theme.colors.primary.main}10` : props.theme.colors.background.paper};
  color: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => `${props.theme.colors.primary.main}10`};
  }
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.md};
  max-height: 500px;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.xs};

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.neutral[100]};
    border-radius: ${props => props.theme.borderRadius.sm};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.neutral[300]};
    border-radius: ${props => props.theme.borderRadius.sm};

    &:hover {
      background: ${props => props.theme.colors.neutral[400]};
    }
  }
`;

const MediaItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  cursor: pointer;
  border: 3px solid ${props => props.$selected ? props.theme.colors.primary.main : 'transparent'};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    transform: scale(1.05);
    box-shadow: ${props => props.theme.shadows.md};
  }

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MediaOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.xs};
`;

const MediaType = styled.div`
  align-self: flex-end;
  width: 24px;
  height: 24px;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: rgba(0,0,0,0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MediaInfo = styled.div`
  color: white;
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const Dimensions = styled.div`
  opacity: 0.9;
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary.main};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.md};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.text.secondary};

  svg {
    margin: 0 auto ${props => props.theme.spacing.md};
    opacity: 0.5;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

const Stats = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
`;

export default function MediaLibrarySelector({ isOpen, onClose, onSelect, multiple = true, filterType = 'all' }) {
  const { currentWorkspace } = useWorkspace();
  const [mediaItems, setMediaItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState(filterType); // 'all', 'image', 'video'
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (isOpen && currentWorkspace) {
      loadMedia();
      // Reset filter when opening with a specific filterType
      setFilter(filterType);
    }
  }, [isOpen, currentWorkspace, filterType]);

  useEffect(() => {
    // Apply filters and search
    let filtered = mediaItems;

    // Type filter
    if (filter === 'image') {
      filtered = filtered.filter(item => item.mime_type?.startsWith('image/'));
    } else if (filter === 'video') {
      filtered = filtered.filter(item => item.mime_type?.startsWith('video/'));
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.file_name?.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  }, [mediaItems, filter, searchQuery]);

  const loadMedia = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        workspaceId: currentWorkspace.id,
      });

      const response = await fetch(`/api/media?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load media');
      }

      setMediaItems(data.media || []);
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading media:', error);
      showToast.error('Failed to load media library');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (item) => {
    if (multiple) {
      if (selectedItems.find(i => i.id === item.id)) {
        setSelectedItems(selectedItems.filter(i => i.id !== item.id));
      } else {
        setSelectedItems([...selectedItems, item]);
      }
    } else {
      setSelectedItems([item]);
    }
  };

  const handleSelect = () => {
    onSelect(selectedItems);
    setSelectedItems([]);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select from Media Library"
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={selectedItems.length === 0}
          >
            Select {selectedItems.length > 0 && `(${selectedItems.length})`}
          </Button>
        </>
      }
    >
      {/* Search */}
      <SearchBar>
        <Input
          placeholder="Search media files..."
          leftIcon={<Search size={20} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchBar>

      {/* Stats */}
      {stats && (
        <Stats>
          <span>Total: {stats.total}</span>
          <span>Images: {stats.images}</span>
          <span>Videos: {stats.videos}</span>
          <span>Size: {formatFileSize(stats.total_size)}</span>
        </Stats>
      )}

      {/* Filters */}
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
          <ImageIcon size={16} style={{ marginRight: '4px', display: 'inline' }} />
          Images
        </FilterButton>
        <FilterButton
          $active={filter === 'video'}
          onClick={() => setFilter('video')}
        >
          <Video size={16} style={{ marginRight: '4px', display: 'inline' }} />
          Videos
        </FilterButton>
      </FilterBar>

      {/* Media Grid */}
      {loading ? (
        <LoadingState>Loading media library...</LoadingState>
      ) : filteredItems.length === 0 ? (
        <EmptyState>
          <ImageIcon size={48} />
          <p>No media files found</p>
          {searchQuery && <p style={{ fontSize: '14px' }}>Try a different search term</p>}
        </EmptyState>
      ) : (
        <MediaGrid>
          {filteredItems.map((item) => {
            const isSelected = selectedItems.find(i => i.id === item.id);
            const isVideo = item.mime_type?.startsWith('video/');

            return (
              <MediaItem
                key={item.id}
                $selected={isSelected}
                onClick={() => toggleSelection(item)}
              >
                {isVideo ? (
                  <video src={item.file_url} />
                ) : (
                  <img src={item.thumbnail_url || item.file_url} alt={item.file_name} />
                )}

                <MediaOverlay>
                  <MediaType>
                    {isVideo ? <Video size={14} /> : <ImageIcon size={14} />}
                  </MediaType>
                  <MediaInfo>
                    {item.width && item.height && (
                      <Dimensions>{item.width}x{item.height}</Dimensions>
                    )}
                    {item.file_size && (
                      <div>{formatFileSize(item.file_size)}</div>
                    )}
                  </MediaInfo>
                </MediaOverlay>

                {isSelected && (
                  <SelectedBadge>
                    <CheckCircle size={18} />
                  </SelectedBadge>
                )}
              </MediaItem>
            );
          })}
        </MediaGrid>
      )}
    </Modal>
  );
}
