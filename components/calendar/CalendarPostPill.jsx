/**
 * Calendar Post Pill Component
 *
 * Compact post indicator for Month view with:
 * - Platform icon
 * - Time label or short title
 * - Status color
 * - Hover tooltip
 * - Edit/Delete handlers
 * - Action popup menu
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled, { useTheme, ThemeProvider } from 'styled-components';
import { Instagram, Facebook, Linkedin, Twitter, Edit2, Trash2, Clock, Calendar, ArrowRight, Copy } from 'lucide-react';

// Platform configurations
const PLATFORM_CONFIG = {
  instagram: { icon: Instagram, color: '#E4405F', bg: 'rgba(228, 64, 95, 0.2)' },
  facebook: { icon: Facebook, color: '#1877F2', bg: 'rgba(24, 119, 242, 0.2)' },
  linkedin: { icon: Linkedin, color: '#0A66C2', bg: 'rgba(10, 102, 194, 0.2)' },
  twitter: { icon: Twitter, color: '#1DA1F2', bg: 'rgba(29, 161, 242, 0.2)' },
  tiktok: { icon: () => <span style={{ fontSize: '8px', fontWeight: 'bold' }}>TT</span>, color: '#000000', bg: 'rgba(0, 0, 0, 0.2)' },
};

const STATUS_COLORS = {
  scheduled: '#3B82F6',
  published: '#10B981',
  failed: '#EF4444',
  draft: '#6B7280',
};

const PillContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  background: ${props => props.$bg || 'rgba(255, 255, 255, 0.1)'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  border-left: 2px solid ${props => props.$statusColor || '#6B7280'};
  max-width: 100%;
  overflow: hidden;

  &:hover {
    background: ${props => props.$bg ? props.$bg.replace('0.2', '0.35') : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 1px;
  }
`;

const PlatformDot = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${props => props.$color || '#6B7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;

  svg {
    width: 8px;
    height: 8px;
  }
`;

const PillText = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.colors.background.elevated || '#1a1a2e'};
  color: ${props => props.theme.colors.text.primary};
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;
  pointer-events: none;
  opacity: ${props => props.$visible ? 1 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transition: opacity 0.2s, visibility 0.2s;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: ${props => props.theme.colors.background.elevated || '#1a1a2e'};
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

const MoreIndicator = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: ${props => props.theme.colors.text.primary};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 1px;
  }
`;

export default function CalendarPostPill({
  post,
  platform = 'instagram',
  showTime = true,
  onEdit,
  onDelete,
  onReschedule,
  onDuplicate,
  onClick,
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const pillRef = useRef(null);
  const menuRef = useRef(null);
  const theme = useTheme();

  const platformConfig = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.instagram;
  const PlatformIcon = platformConfig.icon;
  const statusColor = STATUS_COLORS[post?.status] || STATUS_COLORS.draft;

  const scheduledDate = post?.scheduled_for ? new Date(post.scheduled_for) : null;
  const time = scheduledDate
    ? scheduledDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  const title = post?.content?.substring(0, 20) || 'Untitled';
  const fullTitle = post?.content || 'Untitled Post';

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          pillRef.current && !pillRef.current.contains(e.target)) {
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
    e.stopPropagation();

    // Calculate position for dropdown menu
    if (pillRef.current) {
      const rect = pillRef.current.getBoundingClientRect();
      const menuHeight = 280;
      const menuWidth = 200;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Position below if space, otherwise above
      let top = rect.bottom + 4;
      if (top + menuHeight > viewportHeight) {
        top = rect.top - menuHeight - 4;
      }

      // Position to the right, but keep in viewport
      let left = rect.left;
      if (left + menuWidth > viewportWidth) {
        left = viewportWidth - menuWidth - 8;
      }

      setMenuPosition({
        top: Math.max(8, top),
        left: Math.max(8, left),
      });
    }

    setShowMenu(true);
    setShowTooltip(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(post);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (window.confirm(`Delete this post?\n\n"${fullTitle.substring(0, 50)}..."`)) {
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
    onReschedule?.(post);
  };

  return (
    <>
      <PillContainer
        ref={pillRef}
        $bg={platformConfig.bg}
        $statusColor={statusColor}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => !showMenu && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => !showMenu && setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        tabIndex={0}
        role="button"
        aria-label={`${fullTitle} at ${time}`}
      >
        <PlatformDot $color={platformConfig.color}>
          <PlatformIcon />
        </PlatformDot>
        <PillText>{showTime ? time : title}</PillText>

        <Tooltip $visible={showTooltip && !showMenu}>
          {fullTitle.length > 40 ? fullTitle.substring(0, 40) + '...' : fullTitle}
          <br />
          <span style={{ opacity: 0.7 }}>{time}</span>
        </Tooltip>
      </PillContainer>

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

            {onDuplicate && (
              <MenuItem onClick={handleDuplicate}>
                <Copy />
                Duplicate Post
              </MenuItem>
            )}

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
  );
}

// Export the "More" indicator component
export function MorePostsIndicator({ count, onClick, onOpenDay, date }) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else if (onOpenDay) {
      onOpenDay(date);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <MoreIndicator
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`View ${count} more posts`}
    >
      +{count} more
    </MoreIndicator>
  );
}
