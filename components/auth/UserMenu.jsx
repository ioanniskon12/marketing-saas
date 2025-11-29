/**
 * User Menu Component
 *
 * Displays user avatar and dropdown menu with account options.
 * Includes logout functionality.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from './AuthProvider';
import toast from 'react-hot-toast';

const Container = styled.div`
  position: relative;
`;

const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.lg};
  transition: background ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
  }
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$imageUrl
    ? `url(${props.$imageUrl})`
    : `linear-gradient(135deg, ${props.theme.colors.primary.main}, ${props.theme.colors.secondary.main})`};
  background-size: cover;
  background-position: center;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const UserInfo = styled.div`
  text-align: left;
  display: none;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    display: block;
  }
`;

const UserName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.2;
`;

const UserEmail = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.2;
`;

const ChevronIcon = styled(ChevronDown)`
  color: ${props => props.theme.colors.text.secondary};
  transition: transform ${props => props.theme.transitions.fast};
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + ${props => props.theme.spacing.sm});
  right: 0;
  min-width: 220px;
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.xl};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  padding: ${props => props.theme.spacing.sm};
  z-index: ${props => props.theme.zIndex.dropdown};
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all ${props => props.theme.transitions.base};
`;

const DropdownHeader = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const DropdownTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const DropdownSubtitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const MenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.$danger ? props.theme.colors.error.main : props.theme.colors.text.primary};
  transition: all ${props => props.theme.transitions.fast};
  text-align: left;

  &:hover {
    background: ${props => props.$danger
      ? `${props.theme.colors.error.main}10`
      : props.theme.colors.neutral[100]};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const MenuLink = styled(Link)`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, signOut } = useAuth();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = getInitials(displayName);

  return (
    <Container ref={menuRef}>
      <Trigger onClick={() => setIsOpen(!isOpen)}>
        <Avatar $imageUrl={user?.user_metadata?.avatar_url}>
          {!user?.user_metadata?.avatar_url && initials}
        </Avatar>
        <UserInfo>
          <UserName>{displayName}</UserName>
          <UserEmail>{user?.email}</UserEmail>
        </UserInfo>
        <ChevronIcon size={16} $isOpen={isOpen} />
      </Trigger>

      <Dropdown $isOpen={isOpen}>
        <DropdownHeader>
          <DropdownTitle>{displayName}</DropdownTitle>
          <DropdownSubtitle>{user?.email}</DropdownSubtitle>
        </DropdownHeader>

        <MenuLink href="/dashboard/settings" onClick={() => setIsOpen(false)}>
          <User />
          Profile
        </MenuLink>

        <MenuLink href="/dashboard/settings" onClick={() => setIsOpen(false)}>
          <Settings />
          Settings
        </MenuLink>

        <MenuItem $danger onClick={handleSignOut}>
          <LogOut />
          Sign Out
        </MenuItem>
      </Dropdown>
    </Container>
  );
}
