/**
 * Calendar Post Pill Component
 *
 * Compact post indicator for Month view with:
 * - Platform icon
 * - Time label or short title
 * - Status color
 * - Hover tooltip
 * - Edit/Delete handlers
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Instagram, Facebook, Linkedin, Twitter } from 'lucide-react';

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
  onClick,
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const platformConfig = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.instagram;
  const PlatformIcon = platformConfig.icon;
  const statusColor = STATUS_COLORS[post?.status] || STATUS_COLORS.draft;

  const time = post?.scheduled_for
    ? new Date(post.scheduled_for).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  const title = post?.content?.substring(0, 20) || 'Untitled';
  const fullTitle = post?.content || 'Untitled Post';

  const handleClick = (e) => {
    e.stopPropagation();
    onClick?.(post);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <PillContainer
      $bg={platformConfig.bg}
      $statusColor={statusColor}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={0}
      role="button"
      aria-label={`${fullTitle} at ${time}`}
    >
      <PlatformDot $color={platformConfig.color}>
        <PlatformIcon />
      </PlatformDot>
      <PillText>{showTime ? time : title}</PillText>

      <Tooltip $visible={showTooltip}>
        {fullTitle.length > 40 ? fullTitle.substring(0, 40) + '...' : fullTitle}
        <br />
        <span style={{ opacity: 0.7 }}>{time}</span>
      </Tooltip>
    </PillContainer>
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
