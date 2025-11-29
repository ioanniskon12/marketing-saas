'use client';

import styled from 'styled-components';
import { ExternalLink, CheckCircle, Mail, Users, Heart, Save, Bell } from 'lucide-react';

export default function FeaturesTestPage() {
  const features = [
    {
      id: 1,
      icon: Mail,
      title: 'Email Preview Admin Page',
      description: 'Preview all 6 system email templates with sample data',
      color: '#8B5CF6',
      testUrl: '/demo/email-templates',
      howToTest: [
        'Click through different email templates in the sidebar',
        'Check the preview rendering in the main area',
        'Verify all 6 templates are available',
      ],
    },
    {
      id: 2,
      icon: Users,
      title: 'Client Avatars in Timeline',
      description: 'Color-coded avatars showing who approved/commented',
      color: '#10b981',
      testUrl: '/dashboard/plan-feedback',
      howToTest: [
        'Look for circular avatars with initials',
        'Hover over avatars to see tooltip',
        'Notice color coding: Purple=Comments, Green=Approvals, Red=Rejections',
        'Check that avatars show first+last name initials',
      ],
    },
    {
      id: 3,
      icon: Heart,
      title: 'Emoji Reactions',
      description: 'Quick 👍👎❤️🔥😍 feedback on posts',
      color: '#f59e0b',
      testUrl: '/share/plan/mock-token-1',
      howToTest: [
        'Click on any emoji button (👍👎❤️🔥😍)',
        'Watch the count increment',
        'Notice active state highlighting',
        'Try clicking multiple emojis on different posts',
      ],
    },
    {
      id: 4,
      icon: Save,
      title: 'Auto-Save Drafts',
      description: 'Never lose work while creating plans',
      color: '#3b82f6',
      testUrl: '/dashboard/plans-hub',
      howToTest: [
        'Go to Plans tab',
        'Select some posts and click "Share Plan"',
        'Start typing in the form fields',
        'Watch for "Saving..." then "Draft saved" indicator',
        'Close and reopen the modal - your data should be restored',
      ],
    },
    {
      id: 5,
      icon: Bell,
      title: 'Real-time Notifications',
      description: 'Browser alerts for new feedback',
      color: '#ef4444',
      testUrl: '/dashboard/plan-feedback',
      howToTest: [
        'Click "Enable Notifications" button',
        'Allow notifications when prompted by browser',
        'Status should show "Enabled"',
        'System will check for new feedback every 30 seconds',
        'To test: Run create-demo-feedback.js again in a new terminal to create new feedback',
      ],
    },
  ];

  return (
    <PageContainer>
      <Header>
        <Title>🎯 Features Test Dashboard</Title>
        <Subtitle>Test all 5 new features implemented</Subtitle>
      </Header>

      <FeaturesGrid>
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <FeatureCard key={feature.id}>
              <CardHeader>
                <IconWrapper $color={feature.color}>
                  <Icon size={24} />
                </IconWrapper>
                <BadgeNumber $color={feature.color}>#{feature.id}</BadgeNumber>
              </CardHeader>

              <CardBody>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>

                <TestSection>
                  <TestLabel>How to test:</TestLabel>
                  <TestSteps>
                    {feature.howToTest.map((step, idx) => (
                      <TestStep key={idx}>
                        <CheckCircle size={14} />
                        {step}
                      </TestStep>
                    ))}
                  </TestSteps>
                </TestSection>
              </CardBody>

              <CardFooter>
                <TestButton
                  href={feature.testUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  $color={feature.color}
                >
                  <ExternalLink size={16} />
                  Open Test Page
                </TestButton>
              </CardFooter>
            </FeatureCard>
          );
        })}
      </FeaturesGrid>

      <QuickLinks>
        <QuickLinksTitle>Quick Access Links</QuickLinksTitle>
        <LinksGrid>
          <LinkCard href="/dashboard/plans-hub" target="_blank">
            <LinkIcon>📋</LinkIcon>
            <LinkText>
              <LinkTitle>Plans Hub</LinkTitle>
              <LinkSubtitle>Unified dashboard with all tabs</LinkSubtitle>
            </LinkText>
          </LinkCard>

          <LinkCard href="/dashboard/plan-feedback" target="_blank">
            <LinkIcon>📊</LinkIcon>
            <LinkText>
              <LinkTitle>Feedback Dashboard</LinkTitle>
              <LinkSubtitle>View all feedback with avatars</LinkSubtitle>
            </LinkText>
          </LinkCard>

          <LinkCard href="/share/plan/mock-token-1" target="_blank">
            <LinkIcon>🔗</LinkIcon>
            <LinkText>
              <LinkTitle>Client Share Page</LinkTitle>
              <LinkSubtitle>Test emoji reactions here</LinkSubtitle>
            </LinkText>
          </LinkCard>

          <LinkCard href="/demo/email-templates" target="_blank">
            <LinkIcon>📧</LinkIcon>
            <LinkText>
              <LinkTitle>Email Templates</LinkTitle>
              <LinkSubtitle>Preview all notification emails</LinkSubtitle>
            </LinkText>
          </LinkCard>
        </LinksGrid>
      </QuickLinks>

      <InfoBox>
        <InfoTitle>💡 Pro Tips</InfoTitle>
        <InfoList>
          <li>Run <code>node create-demo-feedback.js</code> to generate fresh test data</li>
          <li>All features work together - test the complete workflow</li>
          <li>Check browser console for debug logs</li>
          <li>Auto-save uses localStorage - check Application tab in DevTools</li>
          <li>Notifications require HTTPS or localhost to work</li>
        </InfoList>
      </InfoBox>
    </PageContainer>
  );
}

// Styled Components

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
`;

const FeaturesGrid = styled.div`
  max-width: 1400px;
  margin: 0 auto 48px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
`;

const CardHeader = styled.div`
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BadgeNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
`;

const CardBody = styled.div`
  padding: 24px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
`;

const FeatureDescription = styled.p`
  font-size: 0.875rem;
  color: #718096;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const TestSection = styled.div`
  background: #f7fafc;
  border-radius: 8px;
  padding: 16px;
`;

const TestLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`;

const TestSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TestStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.875rem;
  color: #4a5568;
  line-height: 1.5;

  svg {
    color: #10b981;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const CardFooter = styled.div`
  padding: 20px 24px;
  background: #f7fafc;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const TestButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${props => props.$color};
  color: white;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${props => props.$color}60;
  }
`;

const QuickLinks = styled.div`
  max-width: 1400px;
  margin: 0 auto 48px;
`;

const QuickLinksTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 24px 0;
  text-align: center;
`;

const LinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
`;

const LinkCard = styled.a`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const LinkIcon = styled.div`
  font-size: 2rem;
  flex-shrink: 0;
`;

const LinkText = styled.div`
  flex: 1;
`;

const LinkTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
`;

const LinkSubtitle = styled.div`
  font-size: 0.75rem;
  color: #718096;
`;

const InfoBox = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const InfoTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 16px 0;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: start;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 0.875rem;
    color: #4a5568;
    line-height: 1.6;

    &:last-child {
      margin-bottom: 0;
    }

    &:before {
      content: '→';
      color: #8B5CF6;
      font-weight: bold;
      flex-shrink: 0;
    }

    code {
      background: #f7fafc;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.875em;
      color: #8B5CF6;
    }
  }
`;
