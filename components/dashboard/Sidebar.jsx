/**
 * Dashboard Sidebar
 *
 * Collapsible navigation sidebar with brand switcher and three collapse modes.
 */

'use client';

import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  FileText,
  Image,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Link as LinkIcon,
  PanelLeftClose,
  PanelLeft,
  MousePointerClick,
  Clipboard,
  Sun,
  Moon,
  User,
  LogOut,
  Bell,
  Menu,
} from 'lucide-react';
import BrandSwitcher from './BrandSwitcher';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/lib/supabase/hooks';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const SidebarContainer = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${props => props.$collapsed ? '60px' : '220px'};
  background: ${props => props.theme.colors.background.paper};
  border-right: 1px solid ${props => props.theme.colors.border.default};
  display: flex;
  flex-direction: column;
  transition: width ${props => props.theme.transitions.base};
  z-index: ${props => props.theme.zIndex.dropdown};
  box-shadow: ${props => props.theme.shadows.lg};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(180deg, ${props => props.theme.colors.primary.main}40 0%, transparent 50%, ${props => props.theme.colors.secondary.main}40 100%);
  }

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    transform: ${props => props.$mobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
    width: 220px;
    box-shadow: ${props => props.$mobileOpen ? props.theme.shadows['2xl'] : 'none'};
    transition: transform ${props => props.theme.transitions.base};
  }
`;

const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
`;

const LogoWrapper = styled(Link)`
  display: ${props => props.$collapsed ? 'none' : 'flex'};
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const Logo = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary.main};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: ${props => props.theme.colors.glow.cyan};
`;

const WorkspaceLogo = styled.img`
  height: ${props => {
    const sizes = { small: '28px', medium: '36px', large: '44px' };
    return sizes[props.$size] || sizes.medium;
  }};
  max-width: 140px;
  object-fit: contain;
`;

const LogoCollapsed = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary.main}, ${props => props.theme.colors.secondary.main});
  display: ${props => props.$collapsed ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MobileCloseButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.text.secondary};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.neutral[300]};
    color: ${props => props.theme.colors.text.primary};
  }

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: flex;
  }
`;

const BrandSwitcherWrapper = styled.div`
  padding: ${props => props.theme.spacing.lg};
  padding-top: ${props => props.theme.spacing.md};
  display: ${props => props.$collapsed ? 'none' : 'block'};
`;

const Nav = styled.nav`
  flex: 1;
  padding: ${props => props.theme.spacing.md};
`;

const NavSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const NavSectionTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.sm};
  display: ${props => props.$collapsed ? 'none' : 'block'};
`;

const NavItemWrapper = styled.div`
  position: relative;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  background: ${props => props.$active
    ? `${props.theme.colors.primary.main}15`
    : 'transparent'};
  font-weight: ${props => props.$active ? props.theme.typography.fontWeight.bold : props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.base};
  transition: all ${props => props.theme.transitions.fast};
  margin-bottom: ${props => props.theme.spacing.sm};
  position: relative;
  justify-content: ${props => props.$collapsed ? 'center' : 'flex-start'};
  box-shadow: ${props => props.$active ? props.theme.shadows.neon : 'none'};
  border: 1px solid ${props => props.$active ? `${props.theme.colors.primary.main}40` : 'transparent'};

  &:hover {
    background: ${props => props.$active
      ? `${props.theme.colors.primary.main}20`
      : `${props.theme.colors.neutral[300]}`};
    color: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.text.primary};
    transform: translateX(2px);
  }

  svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }
`;

const NavItemText = styled.span`
  display: ${props => props.$collapsed ? 'none' : 'block'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Tooltip = styled.div`
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.neutral[900]};
  color: white;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all ${props => props.theme.transitions.fast};
  pointer-events: none;
  z-index: ${props => props.theme.zIndex.tooltip};
  box-shadow: ${props => props.theme.shadows.lg};

  ${NavItemWrapper}:hover & {
    opacity: ${props => props.$show ? 1 : 0};
    visibility: ${props => props.$show ? 'visible' : 'hidden'};
  }

  &::before {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-right-color: ${props => props.theme.colors.neutral[900]};
  }
`;

const SidebarFooter = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border.default};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: ${props => props.theme.spacing.md};
  position: relative;
`;

const IconButtonWrapper = styled.div`
  position: relative;
`;

const IconButtonStyled = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.text.secondary};
  background: transparent;
  transition: all ${props => props.theme.transitions.fast};
  border: none;
  cursor: pointer;
  position: relative;

  &:hover {
    background: ${props => props.theme.colors.neutral[300]};
    color: ${props => props.theme.colors.primary.main};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const UserAvatarButton = styled(IconButtonStyled)`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary.main}, ${props => props.theme.colors.secondary.main});
  color: white;
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.bold};

  &:hover {
    opacity: 0.8;
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.theme.colors.error || '#EF4444'};
  color: white;
  font-size: 10px;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${props => props.theme.colors.background.paper};
`;

const Dropdown = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  padding: ${props => props.theme.spacing.sm};
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transform: ${props => props.$show ? 'translateY(0)' : 'translateY(10px)'};
  transition: all ${props => props.theme.transitions.fast};
  z-index: ${props => props.theme.zIndex.dropdown};
  border: 1px solid ${props => props.theme.colors.border.default};
  min-width: 200px;
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text.primary};
  background: transparent;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  transition: all ${props => props.theme.transitions.fast};
  border: none;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${props => props.theme.colors.neutral[200]};
  }

  svg {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }
`;

const NotificationDropdown = styled(Dropdown)`
  width: 300px;
`;

const NotificationItem = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.fast};
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.neutral[200]};
  }
`;

const NotificationTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const NotificationText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const NotificationTime = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.tertiary};
  margin-top: 4px;
`;

const EmptyNotifications = styled.div`
  padding: ${props => props.theme.spacing.lg};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const FooterControls = styled.div`
  display: flex;
  flex-direction: ${props => props.$collapsed ? 'column' : 'row'};
  align-items: center;
  justify-content: ${props => props.$collapsed ? 'center' : 'flex-end'};
  gap: ${props => props.theme.spacing.sm};
`;

const CollapseButtonWrapper = styled.div`
  position: relative;
`;

const CollapseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.text.secondary};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.neutral[300]};
    color: ${props => props.theme.colors.primary.main};
  }

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: none;
  }
`;

const CollapseMenu = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  padding: ${props => props.theme.spacing.sm};
  min-width: 200px;
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transform: ${props => props.$show ? 'translateY(0)' : 'translateY(10px)'};
  transition: all ${props => props.theme.transitions.fast};
  z-index: ${props => props.theme.zIndex.dropdown};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const CollapseMenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.text.primary};
  background: ${props => props.$active ? `${props.theme.colors.primary.main}15` : 'transparent'};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.$active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.$active ? `${props.theme.colors.primary.main}20` : props.theme.colors.neutral[200]};
  }

  svg {
    flex-shrink: 0;
  }
`;

const ThemeToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.text.secondary};
  background: transparent;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.neutral[300]};
    color: ${props => props.theme.colors.primary.main};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: ${props => props.theme.zIndex.overlay};
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transition: all ${props => props.theme.transitions.base};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: block;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  position: fixed;
  top: ${props => props.theme.spacing.lg};
  left: ${props => props.theme.spacing.lg};
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.xl};
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.border.default};
  color: ${props => props.theme.colors.text.primary};
  box-shadow: ${props => props.theme.shadows.xl};
  z-index: ${props => props.theme.zIndex.sticky};
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  backdrop-filter: blur(8px);

  &:hover {
    background: ${props => props.theme.colors.primary.main};
    color: white;
    transform: scale(1.05);
    box-shadow: ${props => props.theme.shadows['2xl']};
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: ${props => props.$show ? 'flex' : 'none'};
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const MobileFloatingControls = styled.div`
  display: none;
  position: fixed;
  bottom: ${props => props.theme.spacing.xl};
  right: ${props => props.theme.spacing.xl};
  gap: ${props => props.theme.spacing.md};
  z-index: ${props => props.theme.zIndex.sticky};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: ${props => props.$show ? 'flex' : 'none'};
    flex-direction: column;
  }
`;

const FloatingControlButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.xl};
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.border.default};
  color: ${props => props.theme.colors.text.primary};
  box-shadow: ${props => props.theme.shadows.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  position: relative;
  backdrop-filter: blur(8px);

  &:hover {
    background: ${props => props.theme.colors.neutral[300]};
    color: ${props => props.theme.colors.primary.main};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const FloatingUserButton = styled(FloatingControlButton)`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary.main}, ${props => props.theme.colors.secondary.main});
  color: white;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  border: none;

  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }
`;

const MobileDropdown = styled.div`
  position: fixed;
  bottom: ${props => props.theme.spacing.xl};
  right: calc(${props => props.theme.spacing.xl} + 60px);
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows['2xl']};
  padding: ${props => props.theme.spacing.sm};
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transform: ${props => props.$show ? 'scale(1)' : 'scale(0.95)'};
  transition: all ${props => props.theme.transitions.fast};
  z-index: ${props => props.theme.zIndex.dropdown};
  border: 1px solid ${props => props.theme.colors.border.default};
  min-width: 200px;
  max-width: 280px;
  backdrop-filter: blur(12px);
`;

const MobileNotificationDropdown = styled(MobileDropdown)`
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
`;

const navItems = [
  {
    section: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/accounts', label: 'Accounts', icon: LinkIcon },
      { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
      { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    section: 'Content',
    items: [
      { href: '/dashboard/content', label: 'Posts', icon: FileText },
      { href: '/dashboard/plans-hub', label: 'Plans', icon: Clipboard },
      { href: '/dashboard/library', label: 'Media Library', icon: Image },
    ],
  },
  {
    section: 'Manage',
    items: [
      { href: '/dashboard/team', label: 'Team', icon: Users },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const COLLAPSE_MODES = {
  EXPANDED: 'expanded',
  COLLAPSED: 'collapsed',
  HOVER: 'hover',
};

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileOpen, onMobileClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentWorkspace } = useWorkspace();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useUser();
  const [showCollapseMenu, setShowCollapseMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const [collapseMode, setCollapseMode] = useState(COLLAPSE_MODES.EXPANDED);
  const [isHovering, setIsHovering] = useState(false);
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const mobileUserMenuRef = useRef(null);
  const mobileNotificationsRef = useRef(null);

  // Mock notifications - replace with real data later
  const notifications = [];
  const notificationCount = notifications.length;

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowCollapseMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (mobileUserMenuRef.current && !mobileUserMenuRef.current.contains(event.target)) {
        setShowMobileUserMenu(false);
      }
      if (mobileNotificationsRef.current && !mobileNotificationsRef.current.contains(event.target)) {
        setShowMobileNotifications(false);
      }
    };

    if (showCollapseMenu || showUserMenu || showNotifications || showMobileUserMenu || showMobileNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCollapseMenu, showUserMenu, showNotifications, showMobileUserMenu, showMobileNotifications]);

  // Determine if sidebar should be visually collapsed
  const isVisuallyCollapsed = collapseMode === COLLAPSE_MODES.COLLAPSED ||
    (collapseMode === COLLAPSE_MODES.HOVER && !isHovering);

  const handleCollapseMode = (mode) => {
    setCollapseMode(mode);
    setShowCollapseMenu(false);

    // Update parent collapsed state for layout
    if (mode === COLLAPSE_MODES.EXPANDED) {
      onToggle(false);
    } else {
      onToggle(true);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.user_metadata?.full_name) {
      const names = user.user_metadata.full_name.split(' ');
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return user.email ? user.email[0].toUpperCase() : 'U';
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  const handleMobileOpen = () => {
    if (typeof onMobileOpen === 'function') {
      onMobileOpen();
    }
  };

  return (
    <>
      <Overlay $show={mobileOpen} onClick={onMobileClose} />

      {/* Mobile Hamburger Menu Button - Shows when sidebar is closed on mobile */}
      <MobileMenuButton $show={!mobileOpen} onClick={handleMobileOpen}>
        <Menu />
      </MobileMenuButton>

      {/* Mobile Floating Controls - Shows when sidebar is closed on mobile */}
      <MobileFloatingControls $show={!mobileOpen}>
        {/* User Menu */}
        <div ref={mobileUserMenuRef}>
          <FloatingUserButton
            onClick={() => setShowMobileUserMenu(!showMobileUserMenu)}
            title={`${getUserDisplayName()} - ${user?.email || ''}`}
          >
            {getUserInitials()}
          </FloatingUserButton>
          <MobileDropdown $show={showMobileUserMenu}>
            <DropdownItem
              as={Link}
              href="/dashboard/settings"
              onClick={() => {
                setShowMobileUserMenu(false);
                onMobileClose?.();
              }}
            >
              <Settings size={16} />
              Account Settings
            </DropdownItem>
            <DropdownItem onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </DropdownItem>
          </MobileDropdown>
        </div>

        {/* Notifications */}
        <div ref={mobileNotificationsRef}>
          <FloatingControlButton
            onClick={() => setShowMobileNotifications(!showMobileNotifications)}
            title="Notifications"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <NotificationBadge>{notificationCount}</NotificationBadge>
            )}
          </FloatingControlButton>
          <MobileNotificationDropdown $show={showMobileNotifications}>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <NotificationItem key={index}>
                  <NotificationTitle>{notification.title}</NotificationTitle>
                  <NotificationText>{notification.text}</NotificationText>
                  <NotificationTime>{notification.time}</NotificationTime>
                </NotificationItem>
              ))
            ) : (
              <EmptyNotifications>No new notifications</EmptyNotifications>
            )}
          </MobileNotificationDropdown>
        </div>

        {/* Theme Toggle */}
        <FloatingControlButton
          onClick={toggleTheme}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </FloatingControlButton>
      </MobileFloatingControls>

      <SidebarContainer
        $collapsed={isVisuallyCollapsed}
        $mobileOpen={mobileOpen}
        onMouseEnter={() => collapseMode === COLLAPSE_MODES.HOVER && setIsHovering(true)}
        onMouseLeave={() => collapseMode === COLLAPSE_MODES.HOVER && setIsHovering(false)}
      >
        <SidebarHeader>
          {currentWorkspace?.logo_url ? (
            <>
              <LogoWrapper href="/dashboard" $collapsed={isVisuallyCollapsed}>
                <WorkspaceLogo
                  src={currentWorkspace.logo_url}
                  alt={currentWorkspace.name}
                  $size={currentWorkspace.logo_size || 'medium'}
                />
              </LogoWrapper>
              <LogoCollapsed $collapsed={isVisuallyCollapsed}>
                <img src={currentWorkspace.logo_url} alt={currentWorkspace.name} />
              </LogoCollapsed>
            </>
          ) : (
            <>
              <LogoWrapper href="/dashboard" $collapsed={isVisuallyCollapsed}>
                <Logo>SocialHub</Logo>
              </LogoWrapper>
              <LogoCollapsed $collapsed={isVisuallyCollapsed}>SH</LogoCollapsed>
            </>
          )}

          <MobileCloseButton onClick={onMobileClose}>
            <X size={20} />
          </MobileCloseButton>
        </SidebarHeader>

        <BrandSwitcherWrapper $collapsed={isVisuallyCollapsed}>
          <BrandSwitcher />
        </BrandSwitcherWrapper>

        <Nav>
          {navItems.map((section) => (
            <NavSection key={section.section}>
              <NavSectionTitle $collapsed={isVisuallyCollapsed}>
                {section.section}
              </NavSectionTitle>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <NavItemWrapper key={item.href}>
                    <NavItem
                      href={item.href}
                      $active={isActive}
                      $collapsed={isVisuallyCollapsed}
                      onClick={onMobileClose}
                    >
                      <Icon size={18} />
                      <NavItemText $collapsed={isVisuallyCollapsed}>
                        {item.label}
                      </NavItemText>
                    </NavItem>
                    <Tooltip $show={isVisuallyCollapsed}>
                      {item.label}
                    </Tooltip>
                  </NavItemWrapper>
                );
              })}
            </NavSection>
          ))}
        </Nav>

        <SidebarFooter $collapsed={isVisuallyCollapsed}>
          <FooterControls $collapsed={isVisuallyCollapsed}>
            {/* User Menu */}
            <IconButtonWrapper ref={userMenuRef}>
              <UserAvatarButton
                onClick={() => setShowUserMenu(!showUserMenu)}
                title={`${getUserDisplayName()} - ${user?.email || ''}`}
              >
                {getUserInitials()}
              </UserAvatarButton>
              <Dropdown $show={showUserMenu}>
                <DropdownItem as={Link} href="/dashboard/settings" onClick={() => setShowUserMenu(false)}>
                  <Settings size={16} />
                  Account Settings
                </DropdownItem>
                <DropdownItem onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </DropdownItem>
              </Dropdown>
            </IconButtonWrapper>

            {/* Notifications */}
            <IconButtonWrapper ref={notificationsRef}>
              <IconButtonStyled
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
              >
                <Bell size={16} />
                {notificationCount > 0 && (
                  <NotificationBadge>{notificationCount}</NotificationBadge>
                )}
              </IconButtonStyled>
              <NotificationDropdown $show={showNotifications}>
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <NotificationItem key={index}>
                      <NotificationTitle>{notification.title}</NotificationTitle>
                      <NotificationText>{notification.text}</NotificationText>
                      <NotificationTime>{notification.time}</NotificationTime>
                    </NotificationItem>
                  ))
                ) : (
                  <EmptyNotifications>No new notifications</EmptyNotifications>
                )}
              </NotificationDropdown>
            </IconButtonWrapper>

            {/* Theme Toggle */}
            <ThemeToggleButton onClick={toggleTheme} title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </ThemeToggleButton>

            {/* Collapse Button */}
            <CollapseButtonWrapper ref={menuRef}>
              <CollapseButton onClick={() => setShowCollapseMenu(!showCollapseMenu)}>
                {isVisuallyCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
              </CollapseButton>
              <CollapseMenu $show={showCollapseMenu}>
                <CollapseMenuItem
                  $active={collapseMode === COLLAPSE_MODES.EXPANDED}
                  onClick={() => handleCollapseMode(COLLAPSE_MODES.EXPANDED)}
                >
                  <PanelLeft size={16} />
                  Keep Expanded
                </CollapseMenuItem>
                <CollapseMenuItem
                  $active={collapseMode === COLLAPSE_MODES.COLLAPSED}
                  onClick={() => handleCollapseMode(COLLAPSE_MODES.COLLAPSED)}
                >
                  <PanelLeftClose size={16} />
                  Keep Collapsed
                </CollapseMenuItem>
                <CollapseMenuItem
                  $active={collapseMode === COLLAPSE_MODES.HOVER}
                  onClick={() => handleCollapseMode(COLLAPSE_MODES.HOVER)}
                >
                  <MousePointerClick size={16} />
                  Expand on Hover
                </CollapseMenuItem>
              </CollapseMenu>
            </CollapseButtonWrapper>
          </FooterControls>
        </SidebarFooter>
      </SidebarContainer>
    </>
  );
}
