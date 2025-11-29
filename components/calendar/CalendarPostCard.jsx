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
  ArrowRight
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
  gap: ${props => props.$view === 'month' ? '6px' : '10px'};
  background: ${props => props.$platformBg || 'rgba(255, 255, 255, 0.05)'};
  border-radius: ${props => props.$view === 'month' ? '6px' : '8px'};
  cursor: ${props => props.$isDragging ? 'grabbing' : 'pointer'};
  transition: all 0.2s ease;
  box-shadow: ${props => props.$isDragging ? '0 8px 24px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'};
  border-left: 3px solid ${props => props.$statusColor || '#6B7280'};
  opacity: ${props => props.$isDragging ? 0.9 : 1};
  transform: ${props => props.$isDragging ? 'scale(1.02)' : 'none'};
  ${props => viewStyles[props.$view || 'day']}

  &:hover {
    transform: ${props => props.$isDragging ? 'scale(1.02)' : 'translateX(2px)'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: ${props => props.$platformBg ? props.$platformBg.replace('0.15', '0.25') : 'rgba(255, 255, 255, 0.08)'};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }

  &:active {
    transform: translateX(1px);
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
  width: ${props => props.$view === 'month' ? '20px' : props.$view === 'week' ? '24px' : '32px'};
  height: ${props => props.$view === 'month' ? '20px' : props.$view === 'week' ? '24px' : '32px'};
  border-radius: 50%;
  background: ${props => props.$color || '#6B7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;

  svg {
    width: ${props => props.$view === 'month' ? '10px' : props.$view === 'week' ? '12px' : '16px'};
    height: ${props => props.$view === 'month' ? '10px' : props.$view === 'week' ? '12px' : '16px'};
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
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

const StatusBar = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 4px;
  background: ${props => props.$color || '#6B7280'};
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

  const title = post?.content?.substring(0, 30) || 'Untitled Post';
  const scheduledDate = post?.scheduled_for ? new Date(post.scheduled_for) : null;
  const time = scheduledDate
    ? scheduledDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '';

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
      $statusColor={statusColor}
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
        <PostTitle>{title}{title.length >= 30 ? '...' : ''}</PostTitle>
        {view !== 'month' && (
          <PostTime $view={view}>
            <Clock />
            {time}
          </PostTime>
        )}
      </ContentArea>

      <StatusBar $color={statusColor} />

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
