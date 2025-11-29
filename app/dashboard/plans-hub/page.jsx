'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Calendar, Share2, MessageSquare } from 'lucide-react';
import PlansContent from '@/app/dashboard/plans/page';
import FeedbackContent from '@/app/dashboard/plan-feedback/page';
import SharedPlansContent from '@/components/plans/SharedPlansContent';

export default function PlansHubPage() {
  const [activeTab, setActiveTab] = useState('plans');

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <Title>📋 Plans Hub</Title>
          <Description>Create, share, and manage your content plans</Description>
        </HeaderContent>
      </Header>

      <TabsContainer>
        <TabsList>
          <Tab
            $active={activeTab === 'plans'}
            onClick={() => setActiveTab('plans')}
          >
            <Calendar size={18} />
            <span>Plans</span>
          </Tab>

          <Tab
            $active={activeTab === 'shared'}
            onClick={() => setActiveTab('shared')}
          >
            <Share2 size={18} />
            <span>Shared Plans</span>
          </Tab>

          <Tab
            $active={activeTab === 'feedback'}
            onClick={() => setActiveTab('feedback')}
          >
            <MessageSquare size={18} />
            <span>Feedback</span>
          </Tab>
        </TabsList>
      </TabsContainer>

      <TabContent>
        {activeTab === 'plans' && <PlansContent />}
        {activeTab === 'shared' && <SharedPlansContent />}
        {activeTab === 'feedback' && <FeedbackContent />}
      </TabContent>
    </PageContainer>
  );
}

// Styled Components

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background.default};
`;

const Header = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  padding: 32px 40px 24px;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const Description = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const TabsContainer = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  padding: 0 40px;
`;

const TabsList = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 8px;
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid ${props => props.$active
    ? props.theme.colors.primary.main
    : 'transparent'};
  color: ${props => props.$active
    ? props.theme.colors.primary.main
    : props.theme.colors.text.secondary};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.background.hover};
  }

  svg {
    opacity: ${props => props.$active ? 1 : 0.7};
  }
`;

const TabContent = styled.div`
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;
