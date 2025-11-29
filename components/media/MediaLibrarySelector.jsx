/**
 * Media Library Selector Component
 *
 * Reusable modal for selecting media files from workspace library
 * Supports single and multi-select modes with inline upload
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Search, Image as ImageIcon, Video, Check, Upload, Loader, Grid3x3, List } from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';
import { listMediaFiles, getMediaCategory, formatFileSize } from '@/lib/media-storage';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { showToast } from '@/components/ui/Toast';
import MediaUploader from './MediaUploader';

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 80vh;
  max-height: 800px;
`;

const Header = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const HeaderTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const HeaderSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.neutral[50]};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};
  flex-wrap: wrap;
`;

const SearchWrapper = styled.div`
  flex: 1;
  min-width: 200px;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const FilterButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 2px solid ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[300]};
  background: ${props => props.$active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.$active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    color: ${props => props.$active ? 'white' : props.theme.colors.primary.main};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background.default};
`;

const UploaderSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const UploaderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const UploaderTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const CloseUploadButton = styled.button`
  padding: ${props => props.theme.spacing.xs};
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const MediaGridContainer = styled.div`
  min-height: 200px;
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const MediaCard = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  cursor: pointer;
  border: 3px solid ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  background: ${props => props.theme.colors.neutral[100]};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    transform: scale(1.05);
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => props.$selected ? props.theme.colors.primary.dark : props.theme.colors.primary.light};
  }
`;

const MediaThumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const VideoOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const SelectionCheckbox = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.xs};
  right: ${props => props.theme.spacing.xs};
  width: 28px;
  height: 28px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$checked ? props.theme.colors.primary.main : 'rgba(0, 0, 0, 0.5)'};
  border: 2px solid ${props => props.$checked ? props.theme.colors.primary.main : 'white'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${props => props.theme.transitions.fast};
  box-shadow: ${props => props.theme.shadows.sm};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const MediaInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${props => props.theme.spacing.xs};
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  font-size: ${props => props.theme.typography.fontSize.xs};
  opacity: 0;
  transition: opacity ${props => props.theme.transitions.fast};

  ${MediaCard}:hover & {
    opacity: 1;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['3xl']};
  color: ${props => props.theme.colors.text.secondary};

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
    margin: 0 0 ${props => props.theme.spacing.sm} 0;
  }

  p {
    margin: 0 0 ${props => props.theme.spacing.lg} 0;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing['3xl']};
  color: ${props => props.theme.colors.text.secondary};
  gap: ${props => props.theme.spacing.md};

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.neutral[200]};
  background: ${props => props.theme.colors.background.paper};
`;

const SelectionCount = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};

  strong {
    color: ${props => props.theme.colors.primary.main};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
  }
`;

const FooterActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

export default function MediaLibrarySelector({
  isOpen,
  onClose,
  onSelect,
  multiSelect = true,
  allowedTypes = ['image', 'video'],
  maxSelection = null,
  selectedMedia = [],
}) {
  const { currentWorkspace } = useWorkspace();
  const [mediaFiles, setMediaFiles] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set(selectedMedia.map(m => m.id)));
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load media files
  useEffect(() => {
    if (isOpen && currentWorkspace) {
      loadMedia();
    }
  }, [isOpen, currentWorkspace, searchTerm, filterType]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const files = await listMediaFiles(currentWorkspace.id, {
        limit: 100,
        searchTerm,
      });

      // Filter by type
      let filtered = files;
      if (filterType !== 'all') {
        filtered = files.filter(f => {
          const category = getMediaCategory(f.mimeType);
          return category === filterType;
        });
      }

      // Filter by allowed types
      if (allowedTypes && allowedTypes.length > 0) {
        filtered = filtered.filter(f => {
          const category = getMediaCategory(f.mimeType);
          return allowedTypes.includes(category);
        });
      }

      setMediaFiles(filtered);
    } catch (error) {
      console.error('Error loading media:', error);
      showToast.error('Failed to load media library');
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection
  const toggleSelect = (file) => {
    const newSelected = new Set(selectedIds);

    if (newSelected.has(file.id)) {
      newSelected.delete(file.id);
    } else {
      if (!multiSelect) {
        // Single select mode - clear previous selection
        newSelected.clear();
        newSelected.add(file.id);
      } else {
        // Multi select mode - check max limit
        if (maxSelection && newSelected.size >= maxSelection) {
          showToast.error(`You can select up to ${maxSelection} file${maxSelection > 1 ? 's' : ''}`);
          return;
        }
        newSelected.add(file.id);
      }
    }

    setSelectedIds(newSelected);
  };

  // Confirm selection
  const handleConfirm = () => {
    const selected = mediaFiles.filter(f => selectedIds.has(f.id));
    onSelect(selected);
    onClose();
  };

  // Handle upload complete
  const handleUploadComplete = (results) => {
    setShowUploader(false);
    loadMedia(); // Refresh grid
    showToast.success(`${results.length} file${results.length > 1 ? 's' : ''} uploaded successfully`);
  };

  // Clear selection
  const handleClear = () => {
    setSelectedIds(new Set());
  };

  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={null}
      size="xl"
      showCloseButton={false}
    >
      <ModalContent>
        <Header>
          <HeaderTitle>Media Library</HeaderTitle>
          <HeaderSubtitle>
            {multiSelect
              ? `Select up to ${maxSelection || 'multiple'} media files`
              : 'Select a media file'
            }
          </HeaderSubtitle>
        </Header>

        <FilterBar>
          <SearchWrapper>
            <Input
              placeholder="Search media..."
              leftIcon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchWrapper>

          <FilterButtons>
            <FilterButton
              $active={filterType === 'all'}
              onClick={() => setFilterType('all')}
            >
              <Grid3x3 />
              All
            </FilterButton>
            {allowedTypes.includes('image') && (
              <FilterButton
                $active={filterType === 'image'}
                onClick={() => setFilterType('image')}
              >
                <ImageIcon />
                Images
              </FilterButton>
            )}
            {allowedTypes.includes('video') && (
              <FilterButton
                $active={filterType === 'video'}
                onClick={() => setFilterType('video')}
              >
                <Video />
                Videos
              </FilterButton>
            )}
          </FilterButtons>

          <Button
            variant={showUploader ? 'ghost' : 'primary'}
            onClick={() => setShowUploader(!showUploader)}
          >
            <Upload size={18} />
            Upload New
          </Button>
        </FilterBar>

        <ContentArea>
          {showUploader && (
            <UploaderSection>
              <UploaderHeader>
                <UploaderTitle>Upload Media</UploaderTitle>
                <CloseUploadButton onClick={() => setShowUploader(false)}>
                  <X size={20} />
                </CloseUploadButton>
              </UploaderHeader>
              <MediaUploader
                onUploadComplete={handleUploadComplete}
                allowedTypes={allowedTypes.map(t => `${t}/*`)}
                multiple={true}
                autoUpload={false}
                showPreview={true}
              />
            </UploaderSection>
          )}

          <MediaGridContainer>
            {loading ? (
              <LoadingState>
                <Loader size={24} />
                Loading media...
              </LoadingState>
            ) : mediaFiles.length === 0 ? (
              <EmptyState>
                <ImageIcon />
                <h3>No media files yet</h3>
                <p>Upload your first media file to get started</p>
                <Button onClick={() => setShowUploader(true)}>
                  <Upload size={18} />
                  Upload Media
                </Button>
              </EmptyState>
            ) : (
              <MediaGrid>
                {mediaFiles.map(file => {
                  const isSelected = selectedIds.has(file.id);
                  const category = getMediaCategory(file.mimeType);

                  return (
                    <MediaCard
                      key={file.id}
                      $selected={isSelected}
                      onClick={() => toggleSelect(file)}
                    >
                      <MediaThumbnail
                        src={file.url}
                        alt={file.name}
                        loading="lazy"
                      />

                      {category === 'video' && (
                        <VideoOverlay>
                          <Video />
                        </VideoOverlay>
                      )}

                      <SelectionCheckbox $checked={isSelected}>
                        {isSelected && <Check />}
                      </SelectionCheckbox>

                      <MediaInfo>
                        {formatFileSize(file.size)}
                      </MediaInfo>
                    </MediaCard>
                  );
                })}
              </MediaGrid>
            )}
          </MediaGridContainer>
        </ContentArea>

        <Footer>
          <SelectionCount>
            {hasSelection ? (
              <>
                <strong>{selectedCount}</strong> file{selectedCount > 1 ? 's' : ''} selected
              </>
            ) : (
              'No files selected'
            )}
          </SelectionCount>

          <FooterActions>
            {hasSelection && (
              <Button variant="ghost" onClick={handleClear}>
                Clear Selection
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={!hasSelection}
            >
              {multiSelect ? `Select ${selectedCount} File${selectedCount > 1 ? 's' : ''}` : 'Select'}
            </Button>
          </FooterActions>
        </Footer>
      </ModalContent>
    </Modal>
  );
}
