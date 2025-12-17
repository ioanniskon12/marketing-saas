"use client";

import { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Shield, FileText, Users, Lock, CheckCircle, Clock, Database, Mail, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import MarketingNavbar from '../components/MarketingNavbar';
import MarketingFooter from '../components/MarketingFooter';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const HeroSection = styled.section`
  padding: 120px 24px 60px;
  background: linear-gradient(180deg, #eff6ff 0%, white 100%);
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
    background: #93c5fd;
  }

  &.right {
    bottom: 0;
    right: -150px;
    background: #c4b5fd;
  }
`;

const IconBox = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #ff8c42 0%, #ff8c42 100%);
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
  background: rgba(59, 130, 246, 0.1);
  color: #ff8c42;
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
    background: linear-gradient(135deg, #ff8c42 0%, #ff8c42 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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
  background: linear-gradient(135deg, #ff8c42 0%, #ff8c42 100%);
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 16px;
`;

const InfoCardTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
`;

const InfoCardText = styled.p`
  font-size: 14px;
  color: #64748b;
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
  background: linear-gradient(135deg, #ff8c42 0%, #ff8c42 100%);
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

const HighlightBox = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const HighlightTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #166534;
  margin-bottom: 8px;
`;

const HighlightText = styled.p`
  font-size: 14px;
  color: #15803d;
`;

const NumberedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NumberedItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
`;

const NumberBadge = styled.div`
  width: 32px;
  height: 32px;
  background: #eff6ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #ff8c42;
  flex-shrink: 0;
`;

const NumberedContent = styled.div``;

const NumberedTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
`;

const NumberedText = styled.p`
  font-size: 14px;
  color: #64748b;
`;

const SecurityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SecurityCard = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
`;

const SecurityEmoji = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const SecurityTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
`;

const SecurityText = styled.p`
  font-size: 14px;
  color: #64748b;
`;

const RightsCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${props => props.$bg || '#eff6ff'};
  border: 1px solid ${props => props.$border || '#bfdbfe'};
  border-radius: 12px;
`;

const RightsIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.$gradient || 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    color: white;
  }
`;

const RetentionBox = styled.div`
  background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
  border: 1px solid #c7d2fe;
  border-radius: 16px;
  padding: 24px;
`;

const RetentionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  text-align: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RetentionValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.$color || '#ff8c42'};
  margin-bottom: 4px;
`;

const RetentionLabel = styled.p`
  font-size: 14px;
  color: #64748b;
`;

const ContactBox = styled.div`
  background: linear-gradient(135deg, #ff8c42 0%, #ff8c42 100%);
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

export default function Privacy() {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    {
      id: 'collect',
      title: 'Information We Collect',
      icon: FileText,
      content: (
        <>
          <ContentText>We collect information that you provide directly to us, including:</ContentText>
          <Grid>
            {[
              { title: 'Account Information', desc: 'Name, email, password, company details' },
              { title: 'Profile Data', desc: 'Avatar, preferences, settings' },
              { title: 'Social Media Data', desc: 'Connected accounts and posts' },
              { title: 'Payment Info', desc: 'Billing details processed via Stripe' },
              { title: 'Usage Data', desc: 'How you interact with our service' },
              { title: 'Device Info', desc: 'Browser, IP address, device type' },
            ].map((item, i) => (
              <InfoCard key={i}>
                <InfoCardTitle>{item.title}</InfoCardTitle>
                <InfoCardText>{item.desc}</InfoCardText>
              </InfoCard>
            ))}
          </Grid>
        </>
      )
    },
    {
      id: 'use',
      title: 'How We Use Your Data',
      icon: Database,
      content: (
        <>
          <ContentText>We use the information we collect to:</ContentText>
          <List>
            {[
              'Provide, maintain, and improve our services',
              'Process transactions and send related information',
              'Send technical notices and support messages',
              'Respond to your comments and questions',
              'Monitor and analyze trends and usage',
              'Detect, investigate, and prevent fraudulent activity',
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
      id: 'sharing',
      title: 'Information Sharing',
      icon: Users,
      content: (
        <>
          <HighlightBox>
            <HighlightTitle>
              <Shield size={18} />
              We Never Sell Your Data
            </HighlightTitle>
            <HighlightText>Your personal information is never sold to third parties for marketing or any other purposes.</HighlightText>
          </HighlightBox>
          <ContentText>We may share information only with:</ContentText>
          <NumberedList>
            {[
              { title: 'Service Providers', desc: 'Companies that help us operate (hosting, payments)' },
              { title: 'Legal Requirements', desc: 'When required by law or legal process' },
              { title: 'With Your Consent', desc: 'When you explicitly agree to sharing' },
            ].map((item, i) => (
              <NumberedItem key={i}>
                <NumberBadge>{i + 1}</NumberBadge>
                <NumberedContent>
                  <NumberedTitle>{item.title}</NumberedTitle>
                  <NumberedText>{item.desc}</NumberedText>
                </NumberedContent>
              </NumberedItem>
            ))}
          </NumberedList>
        </>
      )
    },
    {
      id: 'security',
      title: 'Data Security',
      icon: Lock,
      content: (
        <>
          <ContentText>We implement industry-standard security measures to protect your information:</ContentText>
          <SecurityGrid>
            {[
              { icon: '🔐', title: 'AES-256 Encryption', desc: 'Data encrypted at rest' },
              { icon: '🔒', title: 'TLS 1.3', desc: 'Secure data in transit' },
              { icon: '☁️', title: 'Cloud Infrastructure', desc: 'Enterprise-grade hosting' },
              { icon: '🛡️', title: 'SOC 2 Compliant', desc: 'Regular security audits' },
            ].map((item, i) => (
              <SecurityCard key={i}>
                <SecurityEmoji>{item.icon}</SecurityEmoji>
                <SecurityTitle>{item.title}</SecurityTitle>
                <SecurityText>{item.desc}</SecurityText>
              </SecurityCard>
            ))}
          </SecurityGrid>
        </>
      )
    },
    {
      id: 'rights',
      title: 'Your Rights',
      icon: CheckCircle,
      content: (
        <>
          <ContentText>You have the following rights regarding your personal information:</ContentText>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: 'Access', desc: 'Request a copy of your personal data', bg: '#eff6ff', border: '#bfdbfe', gradient: 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)' },
              { title: 'Correction', desc: 'Update or correct inaccurate information', bg: '#f0fdf4', border: '#bbf7d0', gradient: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)' },
              { title: 'Deletion', desc: 'Request deletion of your data', bg: '#fef2f2', border: '#fecaca', gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' },
              { title: 'Portability', desc: 'Export your data in a readable format', bg: '#faf5ff', border: '#e9d5ff', gradient: 'linear-gradient(135deg, #ff8c42 0%, #a78bfa 100%)' },
              { title: 'Objection', desc: 'Object to certain types of processing', bg: '#fff7ed', border: '#fed7aa', gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' },
            ].map((item, i) => (
              <RightsCard key={i} $bg={item.bg} $border={item.border}>
                <RightsIcon $gradient={item.gradient}>
                  <CheckCircle size={20} />
                </RightsIcon>
                <div>
                  <InfoCardTitle>{item.title}</InfoCardTitle>
                  <InfoCardText>{item.desc}</InfoCardText>
                </div>
              </RightsCard>
            ))}
          </div>
        </>
      )
    },
    {
      id: 'retention',
      title: 'Data Retention',
      icon: Clock,
      content: (
        <>
          <ContentText>We retain your data only as long as necessary:</ContentText>
          <RetentionBox>
            <RetentionGrid>
              <div>
                <RetentionValue $color="#ff8c42">Active</RetentionValue>
                <RetentionLabel>While your account is active</RetentionLabel>
              </div>
              <div>
                <RetentionValue $color="#ff8c42">30 Days</RetentionValue>
                <RetentionLabel>After account closure</RetentionLabel>
              </div>
              <div>
                <RetentionValue $color="#ec4899">On Request</RetentionValue>
                <RetentionLabel>Immediate deletion available</RetentionLabel>
              </div>
            </RetentionGrid>
          </RetentionBox>
        </>
      )
    },
    {
      id: 'contact',
      title: 'Contact Us',
      icon: Mail,
      content: (
        <>
          <ContentText>Have questions about your privacy? We're here to help.</ContentText>
          <ContactBox>
            <ContactTitle>Get in Touch</ContactTitle>
            <ContactLink href="mailto:privacy@socialhub.com">
              <Mail size={18} />
              privacy@socialhub.com
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
          <Shield size={32} />
        </IconBox>
        <Badge>Legal</Badge>
        <Title>Privacy Policy</Title>
        <Subtitle>Your privacy is important to us. This policy explains how we collect, use, and protect your information.</Subtitle>
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
            <RelatedCard href="/terms">
              <RelatedIcon $gradient="linear-gradient(135deg, #ff8c42 0%, #ec4899 100%)">
                <FileText size={24} />
              </RelatedIcon>
              <RelatedInfo>
                <RelatedName>Terms of Service</RelatedName>
                <RelatedDesc>Read our terms and conditions</RelatedDesc>
              </RelatedInfo>
            </RelatedCard>
            <RelatedCard href="/security">
              <RelatedIcon $gradient="linear-gradient(135deg, #22c55e 0%, #10b981 100%)">
                <Shield size={24} />
              </RelatedIcon>
              <RelatedInfo>
                <RelatedName>Security</RelatedName>
                <RelatedDesc>Learn about our security measures</RelatedDesc>
              </RelatedInfo>
            </RelatedCard>
          </RelatedGrid>
        </RelatedContainer>
      </RelatedSection>

      <MarketingFooter />
    </PageContainer>
  );
}
