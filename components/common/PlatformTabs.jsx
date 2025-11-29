/**
 * Platform Tabs Component
 *
 * Reusable component showing platform tabs with connection status
 * (one account per platform)
 */

'use client';

import { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { Check, AlertCircle } from 'lucide-react';
import { PLATFORM_TABS_NO_ALL, getPlatformConfig } from '@/lib/config/platforms';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SectionLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const PlatformTabsContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
`;

const AllTab = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.$active
    ? props.theme.colors.primary.main
    : props.theme.colors.background.paper};
  border: 2px solid ${props => props.$active
    ? props.theme.colors.primary.main
    : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.xl};
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
  box-shadow: ${props => props.$active ? props.theme.shadows.md : props.theme.shadows.sm};
  animation: ${fadeIn} 0.3s ease-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const AllTabLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.primary};
`;

const AllTabCount = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.$active ? 'rgba(255,255,255,0.8)' : props.theme.colors.text.secondary};
`;

const PlatformTab = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.$active
    ? `linear-gradient(135deg, ${props.$color}15 0%, ${props.$color}08 100%)`
    : props.theme.colors.background.paper};
  border: 2px solid ${props => props.$active ? props.$color : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.xl};
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
  position: relative;
  box-shadow: ${props => props.$active
    ? `${props.theme.shadows.md}, 0 4px 12px ${props.$color}20`
    : props.theme.shadows.sm};
  animation: ${fadeIn} 0.3s ease-out;
  animation-delay: ${props => props.$delay || '0s'};
  animation-fill-mode: both;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md}, 0 6px 16px ${props => `${props.$color}25`};
    border-color: ${props => props.$color};
  }
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: linear-gradient(135deg, ${props => props.$color} 0%, ${props => props.$color}dd 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px ${props => `${props.$color}40`};
  transition: all 0.2s ease;

  ${PlatformTab}:hover & {
    transform: scale(1.1);
  }
`;

const PlatformName = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const StatusIndicator = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.$connected
    ? props.theme.colors.success.main
    : props.theme.colors.neutral[400]};
`;

const StatusText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.$connected
    ? props.theme.colors.success.main
    : props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const PostCount = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: ${props => props.$count > 0 ? props.$color : props.theme.colors.neutral[300]};
  color: white;
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

export default function PlatformTabs({
  posts = [],
  activeFilter = 'all',
  onFilterChange,
  accounts = [],
  showAllTab = true,
}) {
  // Count posts per platform
  const platformCounts = useMemo(() => {
    const counts = {};
    PLATFORM_TABS_NO_ALL.forEach(platform => {
      counts[platform.id] = posts.filter(post => {
        const postAccountIds = post.platforms || [];
        // Check if any of the post's accounts match this platform
        return postAccountIds.some(accountId => {
          const account = accounts.find(acc => acc.id === accountId);
          return account && account.platform === platform.id;
        });
      }).length;
    });
    counts.all = posts.length;
    return counts;
  }, [posts, accounts]);

  // Get connected platforms (one account per platform now)
  const connectedPlatforms = useMemo(() => {
    return new Set(accounts.filter(acc => acc.is_active).map(acc => acc.platform));
  }, [accounts]);

  return (
    <Container>
      <SectionLabel>Filter by Platform</SectionLabel>
      <PlatformTabsContainer>
        {showAllTab && (
          <AllTab
            $active={activeFilter === 'all'}
            onClick={() => onFilterChange?.('all')}
          >
            <AllTabLabel $active={activeFilter === 'all'}>All Platforms</AllTabLabel>
            <AllTabCount $active={activeFilter === 'all'}>
              {platformCounts.all} {platformCounts.all === 1 ? 'post' : 'posts'}
            </AllTabCount>
          </AllTab>
        )}

        {PLATFORM_TABS_NO_ALL.map((platformConfig, index) => {
          const platform = platformConfig.id;
          const Icon = platformConfig.icon;
          const postCount = platformCounts[platform] || 0;
          const isConnected = connectedPlatforms.has(platform);

          return (
            <PlatformTab
              key={platform}
              $active={activeFilter === platform}
              $color={platformConfig?.color}
              $delay={`${index * 0.05}s`}
              onClick={() => onFilterChange?.(platform)}
            >
              <IconWrapper $color={platformConfig?.color}>
                {Icon && <Icon size={18} />}
              </IconWrapper>
              <PlatformName>{platformConfig?.name}</PlatformName>
              <StatusRow>
                <StatusIndicator $connected={isConnected} />
                <StatusText $connected={isConnected}>
                  {isConnected ? 'Connected' : 'Not connected'}
                </StatusText>
              </StatusRow>
              {postCount > 0 && (
                <PostCount $count={postCount} $color={platformConfig?.color}>
                  {postCount}
                </PostCount>
              )}
            </PlatformTab>
          );
        })}
      </PlatformTabsContainer>
    </Container>
  );
}
