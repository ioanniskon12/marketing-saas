/**
 * Dashboard Sidebar
 *
 * Clean, modern navigation sidebar with collapse/expand on hover.
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
  X,
  Link as LinkIcon,
  Clipboard,
  Sun,
  Moon,
  LogOut,
  Bell,
  Menu,
  Shield,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  MousePointer2,
  Check,
} from 'lucide-react';
import BrandSwitcher from './BrandSwitcher';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/lib/supabase/hooks';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Admin email for showing admin panel link
const ADMIN_EMAIL = 'gianniskon12@gmail.com';

const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 72;

const SidebarWrapper = styled.aside`
  width: ${props => props.$expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED}px;
  background: ${props => props.theme?.mode === 'light'
    ? 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
    : 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'};
  border-right: 1px solid ${props => props.theme?.mode === 'light'
    ? 'rgba(0, 0, 0, 0.08)'
    : 'rgba(255, 255, 255, 0.1)'};
  min-height: 100vh;
  padding: ${props => props.$expanded ? '24px 16px' : '24px 12px'};
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), padding 0.25s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
  overflow: visible;

  @media (max-width: 1024px) {
    width: ${SIDEBAR_WIDTH_EXPANDED}px;
    padding: 24px 16px;
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
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
  z-index: 99;

  @media (max-width: 1024px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${props => props.$expanded ? '0 12px 24px' : '0 4px 24px'};
  border-bottom: 1px solid ${props => props.theme?.mode === 'light'
    ? 'rgba(0, 0, 0, 0.08)'
    : 'rgba(255, 255, 255, 0.1)'};
  margin-bottom: 16px;
  justify-content: ${props => props.$expanded ? 'flex-start' : 'center'};
  transition: padding 0.25s cubic-bezier(0.4, 0, 0.2, 1), justify-content 0.25s cubic-bezier(0.4, 0, 0.2, 1);
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  opacity: ${props => props.$expanded ? 1 : 0};
  width: ${props => props.$expanded ? 'auto' : '0'};
  overflow: hidden;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
`;

const LogoTitle = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme?.mode === 'light' ? '#0f172a' : 'white'};
`;

const LogoSubtitle = styled.span`
  font-size: 11px;
  color: ${props => props.theme?.mode === 'light' ? '#64748b' : 'rgba(255, 255, 255, 0.5)'};
`;

const WorkspaceLogo = styled.img`
  height: 32px;
  max-width: 140px;
  object-fit: contain;
`;

const CloseButton = styled.button`
  display: none;
  position: absolute;
  top: 16px;
  right: 16px;
  background: ${props => props.theme?.mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  border-radius: 8px;
  padding: 8px;
  color: ${props => props.theme?.mode === 'light' ? '#0f172a' : 'white'};
  cursor: pointer;

  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    background: ${props => props.theme?.mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)'};
  }
`;

const CollapseButton = styled.button`
  position: absolute;
  bottom: 80px;
  right: -14px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  border: 2px solid ${props => props.theme?.mode === 'light' ? '#ffffff' : '#1e293b'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 110;
  box-shadow: 0 2px 8px rgba(255, 140, 66, 0.4);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(255, 140, 66, 0.6);
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

const CollapseDropdown = styled.div`
  position: absolute;
  bottom: 70px;
  right: -160px;
  width: 150px;
  background: ${props => props.theme?.mode === 'light' ? '#ffffff' : '#1e293b'};
  border-radius: 10px;
  border: 1px solid ${props => props.theme?.mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  padding: 8px;
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transform: ${props => props.$show ? 'translateX(0)' : 'translateX(-10px)'};
  transition: all 0.2s ease;
  z-index: 200;
  box-shadow: ${props => props.theme?.mode === 'light'
    ? '0 4px 20px rgba(0, 0, 0, 0.15)'
    : '0 4px 20px rgba(0, 0, 0, 0.3)'};

  @media (max-width: 1024px) {
    display: none;
  }
`;

const CollapseOption = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: ${props => props.$active ? 'rgba(255, 140, 66, 0.2)' : 'transparent'};
  border: none;
  color: ${props => props.$active
    ? (props.theme?.mode === 'light' ? '#0f172a' : 'white')
    : (props.theme?.mode === 'light' ? '#64748b' : 'rgba(255, 255, 255, 0.7)')};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: ${props => props.$active
      ? 'rgba(255, 140, 66, 0.3)'
      : (props.theme?.mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)')};
    color: ${props => props.theme?.mode === 'light' ? '#0f172a' : 'white'};
  }

  svg {
    width: 18px;
    height: 18px;
    color: ${props => props.$active
      ? '#ff8c42'
      : (props.theme?.mode === 'light' ? '#94a3b8' : 'rgba(255, 255, 255, 0.5)')};
  }
`;

const CheckMark = styled.div`
  margin-left: auto;
  color: #ff8c42;
  display: ${props => props.$show ? 'block' : 'none'};
`;

const BrandSwitcherWrapper = styled.div`
  padding: 0 4px 16px;
  border-bottom: 1px solid ${props => props.theme?.mode === 'light'
    ? 'rgba(0, 0, 0, 0.08)'
    : 'rgba(255, 255, 255, 0.1)'};
  margin-bottom: 16px;
  display: ${props => props.$expanded ? 'block' : 'none'};
`;

const NavSection = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme?.mode === 'light' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)'};
    border-radius: 2px;
  }
`;

const NavSectionTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme?.mode === 'light' ? '#94a3b8' : 'rgba(255, 255, 255, 0.4)'};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: ${props => props.$expanded ? '16px 16px 8px' : '16px 8px 8px'};
  opacity: ${props => props.$expanded ? 1 : 0};
  height: ${props => props.$expanded ? 'auto' : '0'};
  overflow: hidden;
  transition: opacity 0.2s ease;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${props => props.$expanded ? '12px 16px' : '12px'};
  border-radius: 10px;
  color: ${props => props.$active
    ? (props.theme?.mode === 'light' ? '#0f172a' : 'white')
    : (props.theme?.mode === 'light' ? '#64748b' : 'rgba(255, 255, 255, 0.6)')};
  background: ${props => props.$active
    ? 'rgba(255, 140, 66, 0.2)'
    : 'transparent'};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1), padding 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  justify-content: ${props => props.$expanded ? 'flex-start' : 'center'};
  position: relative;

  &:hover {
    background: ${props => props.$active
      ? 'rgba(255, 140, 66, 0.25)'
      : (props.theme?.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)')};
    color: ${props => props.theme?.mode === 'light' ? '#0f172a' : 'white'};
  }

  svg {
    color: ${props => props.$active
      ? '#ff8c42'
      : (props.theme?.mode === 'light' ? '#94a3b8' : 'rgba(255, 255, 255, 0.5)')};
    flex-shrink: 0;
    min-width: 20px;
  }
`;

const NavLabel = styled.span`
  display: ${props => props.$expanded ? 'inline' : 'none'};
  white-space: nowrap;
  opacity: ${props => props.$expanded ? 1 : 0};
  transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
`;

const NavTooltip = styled.div`
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 8px;
  padding: 6px 12px;
  background: ${props => props.theme?.mode === 'light' ? '#ffffff' : '#1e293b'};
  border: 1px solid ${props => props.theme?.mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 6px;
  color: ${props => props.theme?.mode === 'light' ? '#0f172a' : 'white'};
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
  z-index: 200;
  box-shadow: ${props => props.theme?.mode === 'light'
    ? '0 4px 12px rgba(0, 0, 0, 0.1)'
    : '0 4px 12px rgba(0, 0, 0, 0.3)'};

  ${NavItem}:hover & {
    opacity: ${props => props.$show ? 1 : 0};
    visibility: ${props => props.$show ? 'visible' : 'hidden'};
  }
`;

const SidebarFooter = styled.div`
  border-top: 1px solid ${props => props.theme?.mode === 'light'
    ? 'rgba(0, 0, 0, 0.08)'
    : 'rgba(255, 255, 255, 0.1)'};
  padding-top: 16px;
  margin-top: 16px;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${props => props.$expanded ? '12px' : '8px'};
  border-radius: 10px;
  background: ${props => props.theme?.mode === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)'};
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  justify-content: ${props => props.$expanded ? 'flex-start' : 'center'};

  &:hover {
    background: ${props => props.theme?.mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)'};
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: ${props => props.$expanded ? 'block' : 'none'};
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme?.mode === 'light' ? '#0f172a' : 'white'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: ${props => props.theme?.mode === 'light' ? '#64748b' : 'rgba(255, 255, 255, 0.5)'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserDropdownIcon = styled.div`
  color: ${props => props.theme?.mode === 'light' ? '#94a3b8' : 'rgba(255, 255, 255, 0.5)'};
  transition: transform 0.2s ease;
  transform: ${props => props.$open ? 'rotate(180deg)' : 'rotate(0)'};
  display: ${props => props.$expanded ? 'block' : 'none'};
`;

const UserDropdown = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 8px;
  background: ${props => props.theme?.mode === 'light' ? '#ffffff' : '#1e293b'};
  border-radius: 10px;
  border: 1px solid ${props => props.theme?.mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  padding: 8px;
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transform: ${props => props.$show ? 'translateY(0)' : 'translateY(10px)'};
  transition: all 0.2s ease;
  z-index: 10;
  min-width: 180px;
  box-shadow: ${props => props.theme?.mode === 'light'
    ? '0 4px 20px rgba(0, 0, 0, 0.15)'
    : '0 4px 20px rgba(0, 0, 0, 0.3)'};
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: ${props => props.theme?.mode === 'light' ? '#64748b' : 'rgba(255, 255, 255, 0.7)'};
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  text-align: left;
  text-decoration: none;

  &:hover {
    background: ${props => props.theme?.mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)'};
    color: ${props => props.theme?.mode === 'light' ? '#0f172a' : 'white'};
  }

  svg {
    color: ${props => props.theme?.mode === 'light' ? '#94a3b8' : 'rgba(255, 255, 255, 0.5)'};
    flex-shrink: 0;
  }
`;

const FooterControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-direction: ${props => props.$expanded ? 'row' : 'column'};
`;

const FooterButton = styled.button`
  flex: ${props => props.$expanded ? 1 : 'none'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: ${props => props.$expanded ? '10px' : '10px'};
  width: ${props => props.$expanded ? 'auto' : '100%'};
  border-radius: 10px;
  background: ${props => props.theme?.mode === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)'};
  border: none;
  color: ${props => props.theme?.mode === 'light' ? '#64748b' : 'rgba(255, 255, 255, 0.6)'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: ${props => props.theme?.mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)'};
    color: ${props => props.theme?.mode === 'light' ? '#0f172a' : 'white'};
  }

  svg {
    flex-shrink: 0;
  }
`;

const FooterLabel = styled.span`
  display: ${props => props.$expanded ? 'inline' : 'none'};
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
`;

const MobileMenuButton = styled.button`
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.theme?.mode === 'light' ? 'white' : '#1e293b'};
  border: 1px solid ${props => props.theme?.mode === 'light' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.theme?.mode === 'light' ? '#0f172a' : 'white'};
  box-shadow: ${props => props.theme?.mode === 'light'
    ? '0 4px 12px rgba(0, 0, 0, 0.1)'
    : '0 4px 12px rgba(0, 0, 0, 0.3)'};
  z-index: 98;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #ff8c42;
    color: white;
    border-color: #ff8c42;
  }

  @media (max-width: 1024px) {
    display: ${props => props.$show ? 'flex' : 'none'};
  }
`;

const getNavItems = (userEmail) => [
  {
    section: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
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
      ...(userEmail?.toLowerCase() === ADMIN_EMAIL ? [{ href: '/dashboard/admin', label: 'Admin Panel', icon: Shield }] : []),
    ],
  },
];

// Sidebar modes: 'open' (always expanded), 'collapsed' (always collapsed), 'auto' (collapsed with hover expand)
const SIDEBAR_MODES = {
  OPEN: 'open',
  AUTO: 'auto',
  COLLAPSED: 'collapsed',
};

export default function Sidebar({ mobileOpen, onMobileClose, onCollapseChange }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentWorkspace } = useWorkspace();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCollapseMenu, setShowCollapseMenu] = useState(false);
  const [sidebarMode, setSidebarMode] = useState(SIDEBAR_MODES.OPEN);
  const [isHovered, setIsHovered] = useState(false);
  const userMenuRef = useRef(null);
  const collapseMenuRef = useRef(null);

  // Calculate if sidebar should be expanded based on mode and hover state
  const isExpanded = sidebarMode === SIDEBAR_MODES.OPEN ||
                     (sidebarMode === SIDEBAR_MODES.AUTO && isHovered);

  // For backwards compatibility with layout
  const isCollapsed = sidebarMode === SIDEBAR_MODES.COLLAPSED ||
                      (sidebarMode === SIDEBAR_MODES.AUTO && !isHovered);

  console.log('Sidebar state:', { sidebarMode, isHovered, isExpanded, isCollapsed });

  const notifications = [];
  const notificationCount = notifications.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (collapseMenuRef.current && !collapseMenuRef.current.contains(event.target)) {
        setShowCollapseMenu(false);
      }
    };

    if (showUserMenu || showCollapseMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showCollapseMenu]);

  // Load sidebar mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('sidebarMode');
    if (savedMode && Object.values(SIDEBAR_MODES).includes(savedMode)) {
      setSidebarMode(savedMode);
      console.log('Loaded sidebar mode from localStorage:', savedMode);
    }
  }, []);

  // Notify parent when collapse state changes
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

  const handleModeChange = (mode) => {
    console.log('Changing sidebar mode to:', mode);
    setSidebarMode(mode);
    localStorage.setItem('sidebarMode', mode);
    setShowCollapseMenu(false);
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

  const isActive = (href, exact) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleMobileOpen = () => {
    // This will be called from parent
  };

  return (
    <>
      <Overlay $isOpen={mobileOpen} onClick={onMobileClose} />

      <MobileMenuButton $show={!mobileOpen} onClick={handleMobileOpen}>
        <Menu size={24} />
      </MobileMenuButton>

      <SidebarWrapper
        $isOpen={mobileOpen}
        $expanded={isExpanded}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Collapse button with dropdown */}
        <div ref={collapseMenuRef}>
          <CollapseButton
            onClick={() => setShowCollapseMenu(!showCollapseMenu)}
            title="Sidebar options"
          >
            {isExpanded ? <ChevronLeft /> : <ChevronRight />}
          </CollapseButton>
          <CollapseDropdown $show={showCollapseMenu}>
            <CollapseOption
              $active={sidebarMode === SIDEBAR_MODES.OPEN}
              onClick={() => handleModeChange(SIDEBAR_MODES.OPEN)}
            >
              <PanelLeft />
              Open
              <CheckMark $show={sidebarMode === SIDEBAR_MODES.OPEN}>
                <Check size={16} />
              </CheckMark>
            </CollapseOption>
            <CollapseOption
              $active={sidebarMode === SIDEBAR_MODES.AUTO}
              onClick={() => handleModeChange(SIDEBAR_MODES.AUTO)}
            >
              <MousePointer2 />
              Auto
              <CheckMark $show={sidebarMode === SIDEBAR_MODES.AUTO}>
                <Check size={16} />
              </CheckMark>
            </CollapseOption>
            <CollapseOption
              $active={sidebarMode === SIDEBAR_MODES.COLLAPSED}
              onClick={() => handleModeChange(SIDEBAR_MODES.COLLAPSED)}
            >
              <PanelLeftClose />
              Mini
              <CheckMark $show={sidebarMode === SIDEBAR_MODES.COLLAPSED}>
                <Check size={16} />
              </CheckMark>
            </CollapseOption>
          </CollapseDropdown>
        </div>

        <CloseButton onClick={onMobileClose}>
          <X size={20} />
        </CloseButton>

        <LogoSection $expanded={isExpanded}>
          {currentWorkspace?.logo_url ? (
            <>
              <LogoIcon>
                <img src={currentWorkspace.logo_url} alt={currentWorkspace.name} />
              </LogoIcon>
              <LogoText $expanded={isExpanded}>
                <LogoTitle>{currentWorkspace.name || 'Workspace'}</LogoTitle>
              </LogoText>
            </>
          ) : (
            <>
              <LogoIcon>SH</LogoIcon>
              <LogoText $expanded={isExpanded}>
                <LogoTitle>SocialHub</LogoTitle>
                <LogoSubtitle>Dashboard</LogoSubtitle>
              </LogoText>
            </>
          )}
        </LogoSection>

        <BrandSwitcherWrapper $expanded={isExpanded}>
          <BrandSwitcher />
        </BrandSwitcherWrapper>

        <NavSection>
          {getNavItems(user?.email).map((section) => (
            <div key={section.section}>
              <NavSectionTitle $expanded={isExpanded}>{section.section}</NavSectionTitle>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    $active={isActive(item.href, item.exact)}
                    $expanded={isExpanded}
                    onClick={onMobileClose}
                  >
                    <Icon size={20} />
                    <NavLabel $expanded={isExpanded}>{item.label}</NavLabel>
                    <NavTooltip $show={!isExpanded}>{item.label}</NavTooltip>
                  </NavItem>
                );
              })}
            </div>
          ))}
        </NavSection>

        <SidebarFooter>
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <UserSection $expanded={isExpanded} onClick={() => setShowUserMenu(!showUserMenu)}>
              <UserAvatar>{getUserInitials()}</UserAvatar>
              <UserInfo $expanded={isExpanded}>
                <UserName>{getUserDisplayName()}</UserName>
                <UserEmail>{user?.email || ''}</UserEmail>
              </UserInfo>
              <UserDropdownIcon $open={showUserMenu} $expanded={isExpanded}>
                <ChevronDown size={16} />
              </UserDropdownIcon>
            </UserSection>

            <UserDropdown $show={showUserMenu}>
              <DropdownItem as={Link} href="/dashboard/settings" onClick={() => setShowUserMenu(false)}>
                <Settings size={18} />
                Account Settings
              </DropdownItem>
              <DropdownItem onClick={handleLogout}>
                <LogOut size={18} />
                Logout
              </DropdownItem>
            </UserDropdown>
          </div>

          <FooterControls $expanded={isExpanded}>
            <FooterButton $expanded={isExpanded} onClick={toggleTheme} title={isDarkMode ? "Light mode" : "Dark mode"}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              <FooterLabel $expanded={isExpanded}>{isDarkMode ? 'Light' : 'Dark'}</FooterLabel>
            </FooterButton>
            <FooterButton $expanded={isExpanded} title="Notifications">
              <Bell size={18} />
              <FooterLabel $expanded={isExpanded}>Alerts</FooterLabel>
              {notificationCount > 0 && <NotificationBadge />}
            </FooterButton>
          </FooterControls>
        </SidebarFooter>
      </SidebarWrapper>
    </>
  );
}
