"use client";

import { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { FileText, Shield, Users, AlertTriangle, CreditCard, XCircle, Scale, Mail, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import MarketingNavbar from '../components/MarketingNavbar';
import MarketingFooter from '../components/MarketingFooter';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const HeroSection = styled.section`
  padding: 120px 24px 60px;
  background: linear-gradient(180deg, #faf5ff 0%, white 100%);
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const FloatingOrb = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;

  &.left {
    top: 0;
    left: -150px;
    background: #c4b5fd;
  }

  &.right {
    bottom: 0;
    right: -150px;
    background: #f9a8d4;
  }
`;

const IconBox = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: white;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 6px 16px;
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto 16px;
`;

const LastUpdated = styled.p`
  font-size: 14px;
  color: #94a3b8;
`;

const ContentSection = styled.section`
  padding: 48px 24px;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 32px;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 280px;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const SidebarSticky = styled.div`
  position: sticky;
  top: 100px;

  @media (max-width: 1024px) {
    position: static;
  }
`;

const SidebarTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 1024px) {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const SidebarButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;

  ${props => props.$active ? `
    background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  ` : `
    background: transparent;
    color: #475569;

    &:hover {
      background: #f1f5f9;
    }
  `}

  svg {
    opacity: ${props => props.$active ? 1 : 0.5};
  }

  @media (max-width: 1024px) {
    width: auto;
    flex: 0 0 auto;
  }
`;

const MainContent = styled.div`
  flex: 1;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  padding: 32px;
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const ContentIconBox = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const ContentTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
`;

const ContentText = styled.p`
  font-size: 16px;
  color: #64748b;
  line-height: 1.7;
  margin-bottom: 24px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ListItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const ListIcon = styled.div`
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;

  svg {
    width: 12px;
    height: 12px;
    color: white;
  }
`;

const ListText = styled.span`
  font-size: 15px;
  color: #64748b;
`;

const WarningBox = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const WarningTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #991b1b;
  margin-bottom: 8px;
`;

const WarningText = styled.p`
  font-size: 14px;
  color: #b91c1c;
`;

const InfoBox = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const InfoTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #166534;
  margin-bottom: 8px;
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #15803d;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const GridCard = styled.div`
  background: ${props => props.$bg || '#faf5ff'};
  border: 1px solid ${props => props.$border || '#e9d5ff'};
  border-radius: 12px;
  padding: 16px;
`;

const GridCardTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
`;

const GridCardText = styled.p`
  font-size: 14px;
  color: #64748b;
`;

const ContactBox = styled.div`
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
`;

const ContactTitle = styled.h4`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const ContactLink = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  margin-bottom: 8px;
  transition: color 0.2s;

  &:hover {
    color: white;
  }
`;

const ContactNote = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`;

const NavButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: ${props => props.disabled ? '#cbd5e1' : '#475569'};
  font-size: 14px;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f1f5f9;
  }
`;

const RelatedSection = styled.section`
  padding: 48px 24px;
  background: #f8fafc;
`;

const RelatedContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const RelatedTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  text-align: center;
  margin-bottom: 32px;
`;

const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RelatedCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    border-color: #c4b5fd;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
  }
`;

const RelatedIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.$gradient};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const RelatedInfo = styled.div``;

const RelatedName = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
`;

const RelatedDesc = styled.p`
  font-size: 14px;
  color: #64748b;
`;

export default function Terms() {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: FileText,
      content: (
        <>
          <ContentText>
            By accessing or using SocialHub's services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </ContentText>
          <InfoBox>
            <InfoTitle>
              <CheckCircle size={18} />
              Important Notice
            </InfoTitle>
            <InfoText>
              If you do not agree with any of these terms, you are prohibited from using or accessing our services.
            </InfoText>
          </InfoBox>
          <ContentText>
            These terms apply to all visitors, users, and others who access or use the Service. We may update these terms from time to time, and your continued use constitutes acceptance of any changes.
          </ContentText>
        </>
      )
    },
    {
      id: 'services',
      title: 'Our Services',
      icon: Shield,
      content: (
        <>
          <ContentText>SocialHub provides a comprehensive social media management platform including:</ContentText>
          <List>
            {[
              'Social media post scheduling and publishing',
              'Analytics and reporting dashboards',
              'Team collaboration tools',
              'AI-powered content suggestions',
              'Multi-platform account management',
              'Engagement and inbox management',
            ].map((item, i) => (
              <ListItem key={i}>
                <ListIcon><CheckCircle size={12} /></ListIcon>
                <ListText>{item}</ListText>
              </ListItem>
            ))}
          </List>
        </>
      )
    },
    {
      id: 'accounts',
      title: 'User Accounts',
      icon: Users,
      content: (
        <>
          <ContentText>When you create an account with us, you must provide accurate and complete information. You are responsible for:</ContentText>
          <Grid>
            {[
              { title: 'Account Security', desc: 'Maintaining the security of your password and account' },
              { title: 'Activity Responsibility', desc: 'All activities that occur under your account' },
              { title: 'Accurate Information', desc: 'Keeping your account information up to date' },
              { title: 'Notification', desc: 'Notifying us immediately of any unauthorized use' },
            ].map((item, i) => (
              <GridCard key={i}>
                <GridCardTitle>{item.title}</GridCardTitle>
                <GridCardText>{item.desc}</GridCardText>
              </GridCard>
            ))}
          </Grid>
        </>
      )
    },
    {
      id: 'prohibited',
      title: 'Prohibited Uses',
      icon: AlertTriangle,
      content: (
        <>
          <WarningBox>
            <WarningTitle>
              <AlertTriangle size={18} />
              Prohibited Activities
            </WarningTitle>
            <WarningText>
              Violation of these terms may result in immediate termination of your account without refund.
            </WarningText>
          </WarningBox>
          <ContentText>You may not use our services to:</ContentText>
          <List>
            {[
              'Violate any applicable laws or regulations',
              'Infringe on intellectual property rights',
              'Transmit malware or harmful code',
              'Engage in spam or unsolicited messaging',
              'Impersonate others or misrepresent affiliations',
              'Attempt to gain unauthorized access to our systems',
            ].map((item, i) => (
              <ListItem key={i}>
                <ListIcon style={{ background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' }}><XCircle size={12} /></ListIcon>
                <ListText>{item}</ListText>
              </ListItem>
            ))}
          </List>
        </>
      )
    },
    {
      id: 'payment',
      title: 'Payment Terms',
      icon: CreditCard,
      content: (
        <>
          <ContentText>For paid subscriptions, the following terms apply:</ContentText>
          <Grid>
            {[
              { title: 'Billing Cycle', desc: 'Subscriptions are billed in advance on a monthly or annual basis' },
              { title: 'Auto-Renewal', desc: 'Subscriptions automatically renew unless cancelled' },
              { title: 'Refunds', desc: 'We offer a 30-day money-back guarantee for new subscribers' },
              { title: 'Price Changes', desc: 'We will notify you 30 days before any price increases' },
            ].map((item, i) => (
              <GridCard key={i} $bg="#eff6ff" $border="#bfdbfe">
                <GridCardTitle>{item.title}</GridCardTitle>
                <GridCardText>{item.desc}</GridCardText>
              </GridCard>
            ))}
          </Grid>
        </>
      )
    },
    {
      id: 'termination',
      title: 'Termination',
      icon: XCircle,
      content: (
        <>
          <ContentText>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including breach of these Terms.
          </ContentText>
          <ContentText>Upon termination:</ContentText>
          <List>
            {[
              'Your right to use the Service will immediately cease',
              'We may delete your data after 30 days',
              'Any unused subscription time is non-refundable (except as required by law)',
              'You may request export of your data before account deletion',
            ].map((item, i) => (
              <ListItem key={i}>
                <ListIcon><CheckCircle size={12} /></ListIcon>
                <ListText>{item}</ListText>
              </ListItem>
            ))}
          </List>
        </>
      )
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      icon: Scale,
      content: (
        <>
          <ContentText>
            To the maximum extent permitted by law, SocialHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
          </ContentText>
          <InfoBox>
            <InfoTitle>
              <Shield size={18} />
              Service Warranty
            </InfoTitle>
            <InfoText>
              The service is provided "as is" without warranties of any kind, either express or implied.
            </InfoText>
          </InfoBox>
        </>
      )
    },
    {
      id: 'contact',
      title: 'Contact Us',
      icon: Mail,
      content: (
        <>
          <ContentText>If you have any questions about these Terms of Service, please contact us.</ContentText>
          <ContactBox>
            <ContactTitle>Legal Inquiries</ContactTitle>
            <ContactLink href="mailto:legal@socialhub.com">
              <Mail size={18} />
              legal@socialhub.com
            </ContactLink>
            <ContactNote>We respond to all inquiries within 48 hours</ContactNote>
          </ContactBox>
        </>
      )
    },
  ];

  return (
    <PageContainer>
      <MarketingNavbar />

      <HeroSection>
        <FloatingOrb className="left" />
        <FloatingOrb className="right" />
        <IconBox>
          <FileText size={32} />
        </IconBox>
        <Badge>Legal</Badge>
        <Title>Terms of Service</Title>
        <Subtitle>Please read these terms carefully before using our services.</Subtitle>
        <LastUpdated>Last updated: December 1, 2025</LastUpdated>
      </HeroSection>

      <ContentSection>
        <ContentContainer>
          <Sidebar>
            <SidebarSticky>
              <SidebarTitle>Sections</SidebarTitle>
              <SidebarNav>
                {sections.map((section, index) => (
                  <SidebarButton
                    key={section.id}
                    $active={activeSection === index}
                    onClick={() => setActiveSection(index)}
                  >
                    <section.icon size={18} />
                    {section.title}
                  </SidebarButton>
                ))}
              </SidebarNav>
            </SidebarSticky>
          </Sidebar>

          <MainContent>
            <ContentCard>
              <ContentHeader>
                <ContentIconBox>
                  {(() => {
                    const Icon = sections[activeSection].icon;
                    return <Icon size={24} />;
                  })()}
                </ContentIconBox>
                <ContentTitle>{sections[activeSection].title}</ContentTitle>
              </ContentHeader>
              {sections[activeSection].content}
            </ContentCard>

            <NavButtons>
              <NavButton
                onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                disabled={activeSection === 0}
              >
                <ChevronLeft size={16} />
                Previous
              </NavButton>
              <NavButton
                onClick={() => setActiveSection(Math.min(sections.length - 1, activeSection + 1))}
                disabled={activeSection === sections.length - 1}
              >
                Next
                <ChevronRight size={16} />
              </NavButton>
            </NavButtons>
          </MainContent>
        </ContentContainer>
      </ContentSection>

      <RelatedSection>
        <RelatedContainer>
          <RelatedTitle>Related Legal Documents</RelatedTitle>
          <RelatedGrid>
            <RelatedCard href="/privacy">
              <RelatedIcon $gradient="linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)">
                <Shield size={24} />
              </RelatedIcon>
              <RelatedInfo>
                <RelatedName>Privacy Policy</RelatedName>
                <RelatedDesc>How we handle your data</RelatedDesc>
              </RelatedInfo>
            </RelatedCard>
            <RelatedCard href="/cookies">
              <RelatedIcon $gradient="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)">
                <FileText size={24} />
              </RelatedIcon>
              <RelatedInfo>
                <RelatedName>Cookie Policy</RelatedName>
                <RelatedDesc>How we use cookies</RelatedDesc>
              </RelatedInfo>
            </RelatedCard>
          </RelatedGrid>
        </RelatedContainer>
      </RelatedSection>

      <MarketingFooter />
    </PageContainer>
  );
}
