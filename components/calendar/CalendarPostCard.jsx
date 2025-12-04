/**
 * Calendar Post Card Component
 *
 * Reusable post card for Day, Week, and Month views with:
 * - Platform icon
 * - Post title (truncated)
 * - Time display
 * - Status indicator
 * - Edit/Reschedule/Delete menu
 * - Drag and drop support
 * - Keyboard accessibility
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled, { css, useTheme, ThemeProvider } from 'styled-components';
import {
  Instagram, Facebook, Linkedin, Twitter,
  MoreVertical, Edit2, Trash2, Clock,
  Calendar, ChevronRight, GripVertical,
  ArrowRight, Image, Video, Film, SquareStack,
  Copy
} from 'lucide-react';

// Platform configurations
const PLATFORM_CONFIG = {
  instagram: { icon: Instagram, color: '#E4405F', bg: 'rgba(228, 64, 95, 0.15)', label: 'IG' },
  facebook: { icon: Facebook, color: '#1877F2', bg: 'rgba(24, 119, 242, 0.15)', label: 'FB' },
  linkedin: { icon: Linkedin, color: '#0A66C2', bg: 'rgba(10, 102, 194, 0.15)', label: 'LI' },
  twitter: { icon: Twitter, color: '#1DA1F2', bg: 'rgba(29, 161, 242, 0.15)', label: 'X' },
  tiktok: { icon: () => <span>TT</span>, color: '#000000', bg: 'rgba(0, 0, 0, 0.15)', label: 'TT' },
};

const STATUS_COLORS = {
  scheduled: '#3B82F6', // blue
  published: '#10B981', // green
  failed: '#EF4444',    // red
  draft: '#6B7280',     // gray
};

// Content type configurations
const CONTENT_TYPE_CONFIG = {
  image: { icon: Image, label: 'Photo' },
  video: { icon: Video, label: 'Video' },
  reel: { icon: Film, label: 'Reel' },
  story: { icon: Film, label: 'Story' },
  carousel: { icon: SquareStack, label: 'Carousel' },
};

// View-specific styles
const viewStyles = {
  day: css`
    padding: 10px 12px;
    min-height: 70px;
    font-size: 14px;
  `,
  week: css`
    padding: 6px 8px;
    min-height: 50px;
    font-size: 12px;
  `,
  month: css`
    padding: 4px 6px;
    min-height: 32px;
    font-size: 11px;
  `,
};

const CardContainer = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: ${props => props.$view === 'month' ? '8px' : '12px'};
  background: ${props => props.$platformBg || 'rgba(255, 255, 255, 0.05)'};
  border-radius: ${props => props.$view === 'month' ? '6px' : '10px'};
  cursor: ${props => props.$isDragging ? 'grabbing' : 'pointer'};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$isDragging
    ? '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(59, 130, 246, 0.3)'
    : '0 1px 3px rgba(0, 0, 0, 0.1)'};
  border-left: 4px solid ${props => props.$platformColor || '#6B7280'};
  opacity: ${props => props.$isDragging ? 0.75 : 1};
  transform: ${props => props.$isDragging ? 'scale(1.05) rotate(2deg)' : 'none'};
  ${props => viewStyles[props.$view || 'day']}

  ${props => props.$isDragging && `
    z-index: 1000;
    filter: brightness(1.1);

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(135deg,
        rgba(59, 130, 246, 0.1),
        rgba(147, 51, 234, 0.1));
      pointer-events: none;
    }
  `}

  &:hover {
    transform: ${props => props.$isDragging ? 'scale(1.05) rotate(2deg)' : 'scale(1.02) translateX(2px)'};
    box-shadow: ${props => props.$isDragging
      ? '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(59, 130, 246, 0.3)'
      : '0 6px 20px rgba(0, 0, 0, 0.2)'};
    background: ${props => props.$platformBg ? props.$platformBg.replace('0.15', '0.25') : 'rgba(255, 255, 255, 0.08)'};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }

  &:active {
    transform: scale(1.01) translateX(1px);
  }
`;

const DragHandle = styled.div`
  position: absolute;
  left: -2px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.secondary};
  opacity: 0;
  cursor: grab;
  transition: opacity 0.2s;

  ${CardContainer}:hover & {
    opacity: 0.6;
  }

  &:hover {
    opacity: 1 !important;
    color: ${props => props.theme.colors.text.primary};
  }

  &:active {
    cursor: grabbing;
  }
`;

const PlatformIcon = styled.div`
  width: ${props => props.$view === 'month' ? '24px' : props.$view === 'week' ? '28px' : '36px'};
  height: ${props => props.$view === 'month' ? '24px' : props.$view === 'week' ? '28px' : '36px'};
  border-radius: 50%;
  background: ${props => props.$color || '#6B7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);

  svg {
    width: ${props => props.$view === 'month' ? '12px' : props.$view === 'week' ? '14px' : '18px'};
    height: ${props => props.$view === 'month' ? '12px' : props.$view === 'week' ? '14px' : '18px'};
  }
`;

const ContentArea = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PostTitle = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
`;

const PostTime = styled.div`
  font-size: ${props => props.$view === 'month' ? '10px' : '12px'};
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const StatusDot = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: ${props => props.$view === 'month' ? '6px' : '8px'};
  height: ${props => props.$view === 'month' ? '6px' : '8px'};
  border-radius: 50%;
  background: ${props => props.$color || '#6B7280'};
  box-shadow: 0 0 0 2px ${props => props.theme.colors.background.paper},
              0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ContentTypeIcon = styled.div`
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: ${props => props.$view === 'month' ? '16px' : '20px'};
  height: ${props => props.$view === 'month' ? '16px' : '20px'};
  border-radius: 4px;
  background: ${props => props.theme.colors.background.paper};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.secondary};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  opacity: 0.9;

  svg {
    width: ${props => props.$view === 'month' ? '10px' : '12px'};
    height: ${props => props.$view === 'month' ? '10px' : '12px'};
  }
`;

const QuickActions = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transform: translateY(-4px);
  transition: all 0.2s ease;
  pointer-events: none;

  ${CardContainer}:hover & {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
`;

const QuickActionButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: ${props => props.$danger
    ? props.theme.colors.error.main
    : props.theme.colors.background.paper};
  border: 1px solid ${props => props.$danger
    ? props.theme.colors.error.dark
    : props.theme.colors.border.default};
  color: ${props => props.$danger ? 'white' : props.theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    background: ${props => props.$danger
      ? props.theme.colors.error.dark
      : props.theme.colors.background.hover};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const MenuButton = styled.button`
  position: absolute;
  top: 4px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;

  ${CardContainer}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${props => props.theme.colors.text.primary};
  }
`;

const DropdownMenu = styled.div`
  position: fixed;
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 9999;
  min-width: 200px;
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

const MenuLabel = styled.div`
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SubMenuItem = styled(MenuItem)`
  padding-left: 24px;
  font-size: 12px;

  svg {
    width: 14px;
    height: 14px;
  }
`;

export default function CalendarPostCard({
  post,
  view = 'day',
  platform = 'instagram',
  onEdit,
  onDelete,
  onDuplicate,
  onReschedule,
  onClick,
  onDragStart,
  onDragEnd,
  draggable = true,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);
  const cardRef = useRef(null);
  const theme = useTheme();

  const platformConfig = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.instagram;
  const PlatformIconComponent = platformConfig.icon;
  const statusColor = STATUS_COLORS[post?.status] || STATUS_COLORS.draft;

  const title = post?.content?.substring(0, 100) || 'Untitled Post';
  const scheduledDate = post?.scheduled_for ? new Date(post.scheduled_for) : null;
  const time = scheduledDate
    ? scheduledDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  // Determine content type based on post_media
  const getContentType = () => {
    const media = post?.post_media;
    if (!media || media.length === 0) return null;

    if (media.length > 1) return 'carousel';

    const firstMedia = media[0];
    if (firstMedia.media_type === 'video') return 'reel';
    if (firstMedia.media_type === 'image') return 'image';

    return 'image';
  };

  const contentType = getContentType();
  const contentTypeConfig = contentType ? CONTENT_TYPE_CONFIG[contentType] : null;
  const ContentTypeIconComponent = contentTypeConfig?.icon;

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          menuButtonRef.current && !menuButtonRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showMenu]);

  const handleClick = (e) => {
    if (showMenu || isDragging) return;
    onClick?.(post);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();

    // Calculate position for fixed dropdown
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      const menuHeight = 300; // Approximate menu height
      const viewportHeight = window.innerHeight;

      // Position above if not enough space below
      let top = rect.bottom + 4;
      if (top + menuHeight > viewportHeight) {
        top = rect.top - menuHeight - 4;
      }

      setMenuPosition({
        top: Math.max(8, top),
        left: Math.max(8, rect.right - 200), // 200px is min-width of dropdown
      });
    }

    setShowMenu(!showMenu);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(post);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (window.confirm(`Delete this post?\n\n"${title}..."`)) {
      onDelete?.(post);
    }
  };

  const handleDuplicate = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDuplicate?.(post);
  };

  // Quick reschedule options
  const handleQuickReschedule = (hours) => {
    setShowMenu(false);
    if (!scheduledDate) return;

    const newDate = new Date();
    newDate.setHours(newDate.getHours() + hours);
    newDate.setMinutes(0, 0, 0);

    onReschedule?.(post, newDate);
  };

  const handleRescheduleToTomorrow = () => {
    setShowMenu(false);
    if (!scheduledDate) return;

    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 1);
    newDate.setHours(scheduledDate.getHours(), scheduledDate.getMinutes(), 0, 0);

    onReschedule?.(post, newDate);
  };

  const handleRescheduleCustom = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    // Open reschedule modal without a preset date
    onReschedule?.(post);
  };

  // Drag and drop handlers
  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      postId: post.id,
      post: post,
    }));

    // Create custom drag image
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(cardRef.current, rect.width / 2, rect.height / 2);
    }

    onDragStart?.(post);
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    onDragEnd?.(post);
  };

  return (
    <CardContainer
      ref={cardRef}
      $view={view}
      $platformBg={platformConfig.bg}
      $platformColor={platformConfig.color}
      $isDragging={isDragging}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${title} scheduled for ${time}`}
      draggable={draggable && view !== 'month'}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Drag handle indicator */}
      {draggable && view !== 'month' && (
        <DragHandle title="Drag to reschedule">
          <GripVertical size={12} />
        </DragHandle>
      )}

      <PlatformIcon $view={view} $color={platformConfig.color}>
        <PlatformIconComponent />
      </PlatformIcon>

      <ContentArea>
        <PostTitle>{title}</PostTitle>
        {view !== 'month' && (
          <PostTime $view={view}>
            <Clock />
            {time}
          </PostTime>
        )}
      </ContentArea>

      <StatusDot $view={view} $color={statusColor} />

      {contentTypeConfig && ContentTypeIconComponent && (
        <ContentTypeIcon $view={view} title={contentTypeConfig.label}>
          <ContentTypeIconComponent />
        </ContentTypeIcon>
      )}

      {/* Quick action buttons on hover */}
      {view !== 'month' && (
        <QuickActions>
          <QuickActionButton
            onClick={handleEdit}
            title="Edit post"
            aria-label="Edit post"
          >
            <Edit2 />
          </QuickActionButton>
          <QuickActionButton
            onClick={handleDuplicate}
            title="Duplicate post"
            aria-label="Duplicate post"
          >
            <Copy />
          </QuickActionButton>
          <QuickActionButton
            $danger
            onClick={handleDelete}
            title="Delete post"
            aria-label="Delete post"
          >
            <Trash2 />
          </QuickActionButton>
        </QuickActions>
      )}

      {view !== 'month' && (
        <>
          <MenuButton
            ref={menuButtonRef}
            onClick={handleMenuClick}
            aria-label="Post options"
            aria-expanded={showMenu}
          >
            <MoreVertical size={16} />
          </MenuButton>

          {showMenu && typeof document !== 'undefined' && createPortal(
            <ThemeProvider theme={theme}>
              <DropdownMenu
                ref={menuRef}
                style={{ top: menuPosition.top, left: menuPosition.left }}
              >
                <MenuItem onClick={handleEdit}>
                  <Edit2 />
                  Edit Post
                </MenuItem>

                <MenuDivider />
                <MenuLabel>Quick Reschedule</MenuLabel>

                <SubMenuItem onClick={() => handleQuickReschedule(1)}>
                  <ArrowRight />
                  In 1 hour
                </SubMenuItem>
                <SubMenuItem onClick={() => handleQuickReschedule(2)}>
                  <ArrowRight />
                  In 2 hours
                </SubMenuItem>
                <SubMenuItem onClick={() => handleQuickReschedule(4)}>
                  <ArrowRight />
                  In 4 hours
                </SubMenuItem>
                <SubMenuItem onClick={handleRescheduleToTomorrow}>
                  <Calendar />
                  Tomorrow (same time)
                </SubMenuItem>
                <SubMenuItem onClick={handleRescheduleCustom}>
                  <Clock />
                  Choose date & time...
                </SubMenuItem>

                <MenuDivider />

                <MenuItem $danger onClick={handleDelete}>
                  <Trash2 />
                  Delete Post
                </MenuItem>
              </DropdownMenu>
            </ThemeProvider>,
            document.body
          )}
        </>
      )}
    </CardContainer>
  );
}
