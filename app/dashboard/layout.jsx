/**
 * Dashboard Layout
 *
 * Main layout wrapper for all dashboard pages with sidebar.
 * Sidebar can be collapsed (72px) or expanded (260px) with hover-to-expand.
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from '@/components/dashboard/Sidebar';
import { Menu } from 'lucide-react';

const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 72;

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme.colors.background.default};
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${props => props.$sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED}px;
  width: calc(100% - ${props => props.$sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED}px);
  transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;

  @media (max-width: 1024px) {
    margin-left: 0;
    width: 100%;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.sm};
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.xs};
  }
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
    display: flex;
  }
`;

export default function DashboardLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true');
    }
    setIsInitialized(true);
  }, []);

  // Callback when sidebar collapse state changes
  const handleCollapseChange = (collapsed) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  };

  return (
    <LayoutContainer>
      <MobileMenuButton onClick={() => setMobileSidebarOpen(true)}>
        <Menu size={24} />
      </MobileMenuButton>

      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onCollapseChange={handleCollapseChange}
      />

      <MainContent $sidebarCollapsed={sidebarCollapsed}>
        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
}
