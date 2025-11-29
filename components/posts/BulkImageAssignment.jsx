'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Image, Check, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Description = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing.md};
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const MediaItem = styled.div`
  aspect-ratio: 1;
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  cursor: pointer;
  border: 3px solid ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  transition: all ${props => props.theme.transitions.fast};
  position: relative;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    transform: scale(1.05);
  }
`;

const MediaImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SelectionBadge = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.xs};
  right: ${props => props.theme.spacing.xs};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary.main};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  justify-content: flex-end;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

export default function BulkImageAssignment({ selectedPosts, onAssign, onClose }) {
  const [media, setMedia] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const workspaceId = selectedPosts[0]?.workspace_id;

      if (!workspaceId) {
        throw new Error('No workspace ID found');
      }

      const response = await fetch(`/api/media?workspaceId=${workspaceId}&type=image`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load media');
      }

      setMedia(data.media || []);
    } catch (error) {
      console.error('Error loading media:', error);
      showToast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const toggleImageSelection = (mediaItem) => {
    setSelectedImages(prev => {
      const isSelected = prev.some(img => img.id === mediaItem.id);
      if (isSelected) {
        return prev.filter(img => img.id !== mediaItem.id);
      } else {
        return [...prev, mediaItem];
      }
    });
  };

  const handleAssign = async () => {
    if (selectedImages.length === 0) {
      showToast.error('Please select at least one image');
      return;
    }

    setAssigning(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const post of selectedPosts) {
        try {
          // Delete existing media for the post
          const deleteResponse = await fetch(`/api/posts/${post.id}/media`, {
            method: 'DELETE',
          });

          // Add new media to the post
          const mediaToAdd = selectedImages.map((img, index) => ({
            media_type: 'image',
            file_url: img.file_url,
            thumbnail_url: img.thumbnail_url,
            file_size: img.file_size,
            mime_type: img.mime_type,
            width: img.width,
            height: img.height,
            display_order: index,
          }));

          const addResponse = await fetch(`/api/posts/${post.id}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ media: mediaToAdd }),
          });

          if (addResponse.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Error assigning images to post:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        showToast.success(`Assigned images to ${successCount} post${successCount > 1 ? 's' : ''}!`);
        onAssign();
        onClose();
      }

      if (errorCount > 0) {
        showToast.error(`Failed to assign images to ${errorCount} post${errorCount > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Bulk assignment error:', error);
      showToast.error('Failed to assign images');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Assign Images to {selectedPosts.length} Posts</Title>
        <Description>
          Select images to assign to all selected posts. You can select multiple images.
        </Description>
      </Header>

      {loading ? (
        <LoadingState>Loading images...</LoadingState>
      ) : media.length === 0 ? (
        <EmptyState>
          <p>No images found in your media library</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Upload images in the Library page first
          </p>
        </EmptyState>
      ) : (
        <>
          <MediaGrid>
            {media.map((mediaItem) => {
              const isSelected = selectedImages.some(img => img.id === mediaItem.id);
              const selectionIndex = selectedImages.findIndex(img => img.id === mediaItem.id);

              return (
                <MediaItem
                  key={mediaItem.id}
                  $selected={isSelected}
                  onClick={() => toggleImageSelection(mediaItem)}
                >
                  <MediaImage src={mediaItem.file_url} alt="" />
                  {isSelected && (
                    <SelectionBadge>
                      {selectionIndex + 1}
                    </SelectionBadge>
                  )}
                </MediaItem>
              );
            })}
          </MediaGrid>

          <ButtonGroup>
            <Button variant="ghost" onClick={onClose} disabled={assigning}>
              Cancel
            </Button>
            <Button onClick={handleAssign} loading={assigning} disabled={selectedImages.length === 0}>
              <Check size={20} />
              Assign to {selectedPosts.length} Posts
            </Button>
          </ButtonGroup>
        </>
      )}
    </Container>
  );
}
