'use client';

import { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Instagram, Facebook, Linkedin, Twitter, Music, Youtube, Plus, Check, Users } from 'lucide-react';

// Platform configurations
const PLATFORM_CONFIG = {
  facebook: { icon: Facebook, color: '#1877F2', label: 'Facebook' },
  instagram: { icon: Instagram, color: '#E4405F', label: 'Instagram' },
  linkedin: { icon: Linkedin, color: '#0A66C2', label: 'LinkedIn' },
  twitter: { icon: Twitter, color: '#1DA1F2', label: 'Twitter/X' },
  tiktok: { icon: Music, color: '#000000', label: 'TikTok' },
  youtube: { icon: Youtube, color: '#FF0000', label: 'YouTube' },
};

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 4px;
  overflow-x: auto;
  overflow-y: visible;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const CircleBase = styled.button`
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  background: ${props => props.theme.colors.background.paper};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: visible;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.main}40;
  }

  ${props => props.$selected && `
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
  `}
`;

const AllCircle = styled(CircleBase)`
  background: ${props => props.$selected
    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    : props.theme.colors.background.elevated};
  color: ${props => props.$selected ? 'white' : props.theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 600;

  &:hover {
    background: ${props => props.$selected
      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
      : props.theme.colors.background.hover};
  }
`;

const AccountCircle = styled(CircleBase)`
  overflow: visible;
`;

const AvatarImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 50%;
`;

const AvatarFallback = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.$color || '#6B7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
`;

const PlatformBadge = styled.div`
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.$color || '#6B7280'};
  border: 2px solid ${props => props.theme.colors.background.paper};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  svg {
    width: 14px;
    height: 14px;
  }
`;

const CheckBadge = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #10B981;
  border: 2px solid ${props => props.theme.colors.background.paper};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 10px;
    height: 10px;
    stroke-width: 3;
  }
`;

const AddCircle = styled(CircleBase)`
  background: ${props => props.theme.colors.background.elevated};
  border: 2px dashed ${props => props.theme.colors.border.default};
  color: ${props => props.theme.colors.text.secondary};

  &:hover {
    border-color: ${props => props.$color || props.theme.colors.primary.main};
    background: ${props => `${props.$color}15` || props.theme.colors.background.hover};
    color: ${props => props.$color || props.theme.colors.primary.main};
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s, visibility 0.15s;
  z-index: 100;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: ${props => props.theme.colors.background.elevated};
  }
`;

const CircleWrapper = styled.div`
  position: relative;
  overflow: visible;
  padding: 4px;

  &:hover ${Tooltip} {
    opacity: 1;
    visibility: visible;
  }
`;

export default function AccountSelector({
  accounts = [],
  isAllSelected = true,
  onSelectAll,
  onToggleSelect,
  onConnect,
  showAllOption = true,
  showUnconnected = true,
}) {
  const containerRef = useRef(null);

  // Get connected and unconnected platforms
  const connectedAccounts = accounts.filter(acc => acc.connected || acc.is_active);
  const connectedPlatforms = new Set(connectedAccounts.map(acc => acc.platform));

  // Platforms that are not connected
  const unconnectedPlatforms = showUnconnected
    ? Object.keys(PLATFORM_CONFIG).filter(p => !connectedPlatforms.has(p))
    : [];

  const handleKeyDown = (e, callback) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  return (
    <Container ref={containerRef}>
      {/* All Platforms option */}
      {showAllOption && (
        <CircleWrapper>
          <AllCircle
            $selected={isAllSelected}
            onClick={onSelectAll}
            onKeyDown={(e) => handleKeyDown(e, onSelectAll)}
            tabIndex={0}
            aria-label="Select all platforms"
            aria-pressed={isAllSelected}
          >
            <Users size={18} />
            {isAllSelected && (
              <CheckBadge>
                <Check />
              </CheckBadge>
            )}
          </AllCircle>
          <Tooltip>All Platforms</Tooltip>
        </CircleWrapper>
      )}

      {/* Connected accounts */}
      {connectedAccounts.map((account) => {
        const config = PLATFORM_CONFIG[account.platform] || PLATFORM_CONFIG.facebook;
        const Icon = config.icon;
        const isSelected = account.selected;
        const displayName = account.name || account.platform_username || config.label;
        const initial = displayName.charAt(0).toUpperCase();

        return (
          <CircleWrapper key={account.id}>
            <AccountCircle
              $selected={isSelected && !isAllSelected}
              onClick={() => onToggleSelect?.(account.id, account.platform)}
              onKeyDown={(e) => handleKeyDown(e, () => onToggleSelect?.(account.id, account.platform))}
              tabIndex={0}
              aria-label={`${displayName} - ${config.label}`}
              aria-pressed={isSelected}
            >
              {account.avatarUrl || account.platform_profile_picture ? (
                <AvatarImage
                  src={account.avatarUrl || account.platform_profile_picture}
                  alt={displayName}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <AvatarFallback
                $color={config.color}
                style={{ display: (account.avatarUrl || account.platform_profile_picture) ? 'none' : 'flex' }}
              >
                {initial}
              </AvatarFallback>

              <PlatformBadge $color={config.color}>
                <Icon />
              </PlatformBadge>

              {isSelected && !isAllSelected && (
                <CheckBadge>
                  <Check />
                </CheckBadge>
              )}
            </AccountCircle>
            <Tooltip>{displayName}</Tooltip>
          </CircleWrapper>
        );
      })}

      {/* Unconnected platforms (Add buttons) */}
      {unconnectedPlatforms.map((platform) => {
        const config = PLATFORM_CONFIG[platform];
        const Icon = config.icon;

        return (
          <CircleWrapper key={platform}>
            <AddCircle
              $color={config.color}
              onClick={() => onConnect?.(platform)}
              onKeyDown={(e) => handleKeyDown(e, () => onConnect?.(platform))}
              tabIndex={0}
              aria-label={`Connect ${config.label}`}
            >
              <Plus size={18} />
              <PlatformBadge $color={config.color}>
                <Icon />
              </PlatformBadge>
            </AddCircle>
            <Tooltip>Connect {config.label}</Tooltip>
          </CircleWrapper>
        );
      })}
    </Container>
  );
}
