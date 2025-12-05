/**
 * Dashboard Layout
 *
 * Main layout wrapper for all dashboard pages with sidebar and header.
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import Sidebar from '@/components/dashboard/Sidebar';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme.colors.background.default};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 10% 20%, rgba(0, 245, 255, 0.08) 0%, transparent 40%),
      radial-gradient(circle at 90% 80%, rgba(255, 0, 255, 0.08) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.03) 0%, transparent 60%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${props => props.theme.colors.primary.main}, transparent);
    opacity: 0.3;
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${props => props.$sidebarCollapsed ? '60px' : '220px'};
  width: ${props => props.$sidebarCollapsed ? 'calc(100% - 60px)' : 'calc(100% - 220px)'};
  transition: all ${props => props.theme.transitions.base};
  position: relative;
  z-index: 1;

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
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

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <LayoutContainer>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileOpen={() => setMobileSidebarOpen(true)}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <MainContent $sidebarCollapsed={sidebarCollapsed}>
        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
}
