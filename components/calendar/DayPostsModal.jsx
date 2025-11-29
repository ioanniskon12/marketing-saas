/**
 * Day Posts Modal Component
 *
 * Modal that displays all posts for a specific day when clicking "+N more" in Month view.
 * Features:
 * - Media preview cards with thumbnails
 * - 3-dots menu with Edit, Delete, View in Calendar actions
 * - Scrollable list of all posts for the selected date
 * - Add new post button in footer
 * - ESC key and overlay click to close
 * - Focus trap for accessibility
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled, { useTheme, ThemeProvider } from 'styled-components';
import {
  X, Plus, Trash2, Edit2, Calendar, Eye, Copy,
  Instagram, Facebook, Linkedin, Twitter, Clock,
  MoreVertical, Play, Layers, Image as ImageIcon
} from 'lucide-react';

// Platform configurations
const PLATFORM_CONFIG = {
  instagram: { icon: Instagram, color: '#E4405F', bg: 'rgba(228, 64, 95, 0.15)' },
  facebook: { icon: Facebook, color: '#1877F2', bg: 'rgba(24, 119, 242, 0.15)' },
  linkedin: { icon: Linkedin, color: '#0A66C2', bg: 'rgba(10, 102, 194, 0.15)' },
  twitter: { icon: Twitter, color: '#1DA1F2', bg: 'rgba(29, 161, 242, 0.15)' },
  tiktok: { icon: () => <span style={{ fontSize: '12px', fontWeight: 'bold' }}>TT</span>, color: '#000000', bg: 'rgba(0, 0, 0, 0.15)' },
};

const STATUS_CONFIG = {
  scheduled: { color: '#3B82F6', label: 'Scheduled', bg: 'rgba(59, 130, 246, 0.15)' },
  published: { color: '#10B981', label: 'Published', bg: 'rgba(16, 185, 129, 0.15)' },
  failed: { color: '#EF4444', label: 'Failed', bg: 'rgba(239, 68, 68, 0.15)' },
  draft: { color: '#6B7280', label: 'Draft', bg: 'rgba(107, 114, 128, 0.15)' },
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${props => props.theme.spacing.xl};
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.2s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background.hover};
    color: ${props => props.theme.colors.text.primary};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

const PostsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.md};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background.default};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border.default};
    border-radius: 3px;
  }
`;

// New Media Card Styles
const PostMediaCard = styled.div`
  display: flex;
  align-items: stretch;
  gap: 14px;
  padding: 12px;
  background: ${props => props.theme.colors.background.elevated};
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.theme.colors.border.default};
  position: relative;

  &:hover {
    border-color: ${props => props.theme.colors.border.hover};
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const Thumbnail = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 8px;
  background: ${props => props.$bgColor || props.theme.colors.background.default};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlayOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
`;

const CarouselBadge = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const PlaceholderIcon = styled.div`
  color: white;
  opacity: 0.9;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const InfoBlock = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
`;

const PostTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const PostTime = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const PlatformBadge = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 10px;
    height: 10px;
  }
`;

const StatusChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => props.$bg || 'rgba(107, 114, 128, 0.1)'};
  color: ${props => props.$color || '#6B7280'};
`;

// 3-dots menu
const KebabButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  flex-shrink: 0;
  align-self: center;

  &:hover {
    background: ${props => props.theme.colors.background.hover};
    color: ${props => props.theme.colors.text.primary};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

const ContextMenu = styled.div`
  position: fixed;
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 9999;
  min-width: 180px;
  overflow: hidden;
  padding: 6px 0;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: ${props => props.$danger ? props.theme.colors.error.main : props.theme.colors.text.primary};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.$danger ? 'rgba(239, 68, 68, 0.1)' : props.theme.colors.background.hover};
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border.default};
  margin: 6px 0;
`;

const ModalFooter = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

const AddPostButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.success.main};
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.success.dark};
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.success.light};
    outline-offset: 2px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

// Helper to detect media type from URL
const getMediaType = (post) => {
  if (!post.media_urls || post.media_urls.length === 0) {
    return 'none';
  }

  if (post.media_urls.length > 1) {
    return 'carousel';
  }

  const url = post.media_urls[0];
  if (url.match(/\.(mp4|mov|webm|avi)$/i)) {
    return 'video';
  }

  return 'image';
};

const getMediaUrl = (post) => {
  if (post.media_urls && post.media_urls.length > 0) {
    return post.media_urls[0];
  }
  return null;
};

export default function DayPostsModal({
  date,
  posts = [],
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onCreate,
  onViewInCalendar,
  onDuplicate,
}) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const triggerRef = useRef(null);
  const theme = useTheme();

  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const menuButtonRefs = useRef({});

  // Format date for title
  const formattedDate = date?.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Handle ESC key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      if (activeMenu) {
        setActiveMenu(null);
      } else {
        onClose();
      }
    }
  }, [onClose, activeMenu]);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        triggerRef.current?.focus();
      };
    }
  }, [isOpen, handleKeyDown]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!activeMenu) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        const buttonEl = menuButtonRefs.current[activeMenu];
        if (buttonEl && !buttonEl.contains(e.target)) {
          setActiveMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu]);

  // Handle post click (opens details)
  const handlePostClick = (post, e) => {
    if (e.target.closest('[data-menu-button]') || e.target.closest('[data-context-menu]')) return;
    onEdit?.(post.id);
    onClose();
  };

  // Handle kebab menu click
  const handleMenuClick = (postId, e) => {
    e.stopPropagation();

    const buttonEl = menuButtonRefs.current[postId];
    if (buttonEl) {
      const rect = buttonEl.getBoundingClientRect();
      const menuHeight = 200;
      const viewportHeight = window.innerHeight;

      let top = rect.bottom + 4;
      if (top + menuHeight > viewportHeight) {
        top = rect.top - menuHeight - 4;
      }

      setMenuPosition({
        top: Math.max(8, top),
        left: Math.max(8, rect.right - 180),
      });
    }

    setActiveMenu(activeMenu === postId ? null : postId);
  };

  // Menu actions
  const handleEdit = (post) => {
    setActiveMenu(null);
    onEdit?.(post.id);
    onClose();
  };

  const handleDelete = (post) => {
    setActiveMenu(null);
    if (window.confirm(`Delete this post?\n\n"${post.content?.substring(0, 50) || 'Untitled'}..."`)) {
      onDelete?.(post.id);
    }
  };

  const handleViewInCalendar = (post) => {
    setActiveMenu(null);
    onViewInCalendar?.(post.id);
    onClose();
  };

  const handleDuplicate = (post) => {
    setActiveMenu(null);
    onDuplicate?.(post);
  };

  const handleAddPost = () => {
    onCreate?.(date);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Sort posts by time
  const sortedPosts = [...posts].sort((a, b) => {
    const timeA = new Date(a.scheduled_for).getTime();
    const timeB = new Date(b.scheduled_for).getTime();
    return timeA - timeB;
  });

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContainer ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <ModalHeader>
          <ModalTitle id="modal-title">All posts for {formattedDate}</ModalTitle>
          <CloseButton
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <PostsList>
          {sortedPosts.length === 0 ? (
            <EmptyState>No posts scheduled for this day</EmptyState>
          ) : (
            sortedPosts.map((post) => {
              const platform = post.platform || 'instagram';
              const platformConfig = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.instagram;
              const PlatformIconComponent = platformConfig.icon;
              const status = post.status || 'draft';
              const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
              const mediaType = getMediaType(post);
              const mediaUrl = getMediaUrl(post);

              const time = post.scheduled_for
                ? new Date(post.scheduled_for).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })
                : '';

              const title = post.content?.substring(0, 50) || 'Untitled Post';

              return (
                <PostMediaCard
                  key={post.id}
                  onClick={(e) => handlePostClick(post, e)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View post: ${title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePostClick(post, e);
                    }
                  }}
                >
                  {/* Thumbnail */}
                  <Thumbnail $bgColor={mediaType === 'none' ? platformConfig.color : undefined}>
                    {mediaType === 'none' ? (
                      <PlaceholderIcon>
                        <PlatformIconComponent />
                      </PlaceholderIcon>
                    ) : (
                      <>
                        <img
                          src={mediaUrl}
                          alt=""
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        {mediaType === 'video' && (
                          <PlayOverlay>
                            <Play size={20} fill="white" />
                          </PlayOverlay>
                        )}
                        {mediaType === 'carousel' && (
                          <CarouselBadge>
                            <Layers />
                          </CarouselBadge>
                        )}
                      </>
                    )}
                  </Thumbnail>

                  {/* Info Block */}
                  <InfoBlock>
                    <PostTitle>{title}{title.length >= 50 ? '...' : ''}</PostTitle>
                    <PostMeta>
                      <PostTime>
                        <Clock />
                        {time}
                      </PostTime>
                      <PlatformBadge $color={platformConfig.color}>
                        <PlatformIconComponent />
                      </PlatformBadge>
                    </PostMeta>
                    <StatusChip $color={statusConfig.color} $bg={statusConfig.bg}>
                      {statusConfig.label}
                    </StatusChip>
                  </InfoBlock>

                  {/* 3-dots menu button */}
                  <KebabButton
                    data-menu-button
                    ref={(el) => { menuButtonRefs.current[post.id] = el; }}
                    onClick={(e) => handleMenuClick(post.id, e)}
                    aria-label="Post options"
                    aria-expanded={activeMenu === post.id}
                  >
                    <MoreVertical size={18} />
                  </KebabButton>
                </PostMediaCard>
              );
            })
          )}
        </PostsList>

        {onCreate && (
          <ModalFooter>
            <AddPostButton onClick={handleAddPost}>
              <Plus size={18} />
              Add post for this day
            </AddPostButton>
          </ModalFooter>
        )}
      </ModalContainer>

      {/* Context Menu Portal */}
      {activeMenu && typeof document !== 'undefined' && createPortal(
        <ThemeProvider theme={theme}>
          <ContextMenu
            ref={menuRef}
            data-context-menu
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <MenuItem onClick={() => handleEdit(posts.find(p => p.id === activeMenu))}>
              <Edit2 />
              Edit Post
            </MenuItem>
            {onViewInCalendar && (
              <MenuItem onClick={() => handleViewInCalendar(posts.find(p => p.id === activeMenu))}>
                <Eye />
                View in Calendar
              </MenuItem>
            )}
            {onDuplicate && (
              <MenuItem onClick={() => handleDuplicate(posts.find(p => p.id === activeMenu))}>
                <Copy />
                Duplicate Post
              </MenuItem>
            )}
            <MenuDivider />
            <MenuItem $danger onClick={() => handleDelete(posts.find(p => p.id === activeMenu))}>
              <Trash2 />
              Delete Post
            </MenuItem>
          </ContextMenu>
        </ThemeProvider>,
        document.body
      )}
    </Overlay>
  );
}
