/**
 * Dashboard Header
 *
 * Top header bar with search, notifications, and user menu.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Bell, Menu, MessageSquare, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import UserMenu from '@/components/auth/UserMenu';

const HeaderContainer = styled.header`
  background: ${props => props.theme.colors.background.paper};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.sm};
  min-height: 40px;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.sm};
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  flex: 1;
`;

const MobileMenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text.secondary};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
    color: ${props => props.theme.colors.text.primary};
  }

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: flex;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const IconButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text.secondary};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.error.main};
  border: 2px solid ${props => props.theme.colors.background.paper};
  font-size: 9px;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${props => props.theme.spacing.sm};
  width: 320px;
  max-height: 400px;
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  overflow: hidden;
  z-index: ${props => props.theme.zIndex.dropdown};
`;

const DropdownHeader = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DropdownTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const DropdownList = styled.div`
  max-height: 320px;
  overflow-y: auto;
`;

const EmptyNotifications = styled.div`
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

export default function Header({ sidebarCollapsed, onMenuClick }) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <HeaderContainer>
      <LeftSection>
        <MobileMenuButton onClick={onMenuClick}>
          <Menu size={16} />
        </MobileMenuButton>
      </LeftSection>

      <RightSection>
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <IconButton onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={14} />
          </IconButton>

          {showNotifications && (
            <NotificationDropdown>
              <DropdownHeader>
                <DropdownTitle>Notifications</DropdownTitle>
              </DropdownHeader>

              <DropdownList>
                <EmptyNotifications>
                  <MessageSquare size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
                  <div>No new notifications</div>
                </EmptyNotifications>
              </DropdownList>
            </NotificationDropdown>
          )}
        </div>

        <UserMenu />
      </RightSection>
    </HeaderContainer>
  );
}
