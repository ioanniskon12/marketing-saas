/**
 * Dashboard Sidebar
 *
 * Clean, modern navigation sidebar matching admin panel style.
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
} from 'lucide-react';
import BrandSwitcher from './BrandSwitcher';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/lib/supabase/hooks';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Admin email for showing admin panel link
const ADMIN_EMAIL = 'gianniskon12@gmail.com';

const SidebarWrapper = styled.aside`
  width: 260px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  min-height: 100vh;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  transition: transform 0.3s ease;

  @media (max-width: 1024px) {
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
  padding: 0 12px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
`;

const LogoTitle = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: white;
`;

const LogoSubtitle = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
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
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  padding: 8px;
  color: white;
  cursor: pointer;

  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const BrandSwitcherWrapper = styled.div`
  padding: 0 4px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
`;

const NavSection = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
`;

const NavSectionTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 16px 16px 8px;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  background: ${props => props.$active ? 'rgba(99, 102, 241, 0.2)' : 'transparent'};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.08)'};
    color: white;
  }

  svg {
    color: ${props => props.$active ? '#a5b4fc' : 'rgba(255, 255, 255, 0.5)'};
    flex-shrink: 0;
  }
`;

const SidebarFooter = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
  margin-top: 16px;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserDropdownIcon = styled.div`
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.2s ease;
  transform: ${props => props.$open ? 'rotate(180deg)' : 'rotate(0)'};
`;

const UserDropdown = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 8px;
  background: #1e293b;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px;
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transform: ${props => props.$show ? 'translateY(0)' : 'translateY(10px)'};
  transition: all 0.2s ease;
  z-index: 10;
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  svg {
    color: rgba(255, 255, 255, 0.5);
    flex-shrink: 0;
  }
`;

const FooterControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FooterButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  svg {
    flex-shrink: 0;
  }
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
  background: white;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 98;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
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

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentWorkspace } = useWorkspace();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const notifications = [];
  const notificationCount = notifications.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

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

      <SidebarWrapper $isOpen={mobileOpen}>
        <CloseButton onClick={onMobileClose}>
          <X size={20} />
        </CloseButton>

        <LogoSection>
          {currentWorkspace?.logo_url ? (
            <>
              <LogoIcon>
                <img src={currentWorkspace.logo_url} alt={currentWorkspace.name} />
              </LogoIcon>
              <LogoText>
                <WorkspaceLogo
                  src={currentWorkspace.logo_url}
                  alt={currentWorkspace.name}
                />
              </LogoText>
            </>
          ) : (
            <>
              <LogoIcon>SH</LogoIcon>
              <LogoText>
                <LogoTitle>SocialHub</LogoTitle>
                <LogoSubtitle>Dashboard</LogoSubtitle>
              </LogoText>
            </>
          )}
        </LogoSection>

        <BrandSwitcherWrapper>
          <BrandSwitcher />
        </BrandSwitcherWrapper>

        <NavSection>
          {getNavItems(user?.email).map((section) => (
            <div key={section.section}>
              <NavSectionTitle>{section.section}</NavSectionTitle>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    $active={isActive(item.href, item.exact)}
                    onClick={onMobileClose}
                  >
                    <Icon size={20} />
                    {item.label}
                  </NavItem>
                );
              })}
            </div>
          ))}
        </NavSection>

        <SidebarFooter>
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <UserSection onClick={() => setShowUserMenu(!showUserMenu)}>
              <UserAvatar>{getUserInitials()}</UserAvatar>
              <UserInfo>
                <UserName>{getUserDisplayName()}</UserName>
                <UserEmail>{user?.email || ''}</UserEmail>
              </UserInfo>
              <UserDropdownIcon $open={showUserMenu}>
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

          <FooterControls>
            <FooterButton onClick={toggleTheme} title={isDarkMode ? "Light mode" : "Dark mode"}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              {isDarkMode ? 'Light' : 'Dark'}
            </FooterButton>
            <FooterButton title="Notifications">
              <Bell size={18} />
              Alerts
              {notificationCount > 0 && <NotificationBadge />}
            </FooterButton>
          </FooterControls>
        </SidebarFooter>
      </SidebarWrapper>
    </>
  );
}
