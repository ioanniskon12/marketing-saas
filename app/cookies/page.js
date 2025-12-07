"use client";

import { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Cookie, Settings, BarChart3, Target, Shield, ToggleRight, Globe, Mail, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import MarketingNavbar from '../components/MarketingNavbar';
import MarketingFooter from '../components/MarketingFooter';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const HeroSection = styled.section`
  padding: 120px 24px 60px;
  background: linear-gradient(180deg, #fffbeb 0%, white 100%);
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
    background: #fcd34d;
  }

  &.right {
    bottom: 0;
    right: -150px;
    background: #fb923c;
  }
`;

const IconBox = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
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
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
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
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
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
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
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

const InfoBox = styled.div`
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const InfoTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 8px;
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #a16207;
`;

const CookieTable = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  padding: 16px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%);
  font-weight: 600;
  font-size: 14px;
  color: #0f172a;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 4px;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  padding: 16px;
  font-size: 14px;
  color: #64748b;
  border-top: 1px solid #f1f5f9;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 4px;
  }
`;

const CookieName = styled.span`
  font-weight: 500;
  color: #0f172a;
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
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
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

const CookieTypeCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 12px;
`;

const CookieTypeInfo = styled.div``;

const CookieTypeName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
`;

const RequiredBadge = styled.span`
  font-size: 11px;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 2px 8px;
  border-radius: 100px;
  font-weight: 500;
`;

const CookieTypeDesc = styled.p`
  font-size: 14px;
  color: #64748b;
`;

const Toggle = styled.div`
  width: 48px;
  height: 24px;
  border-radius: 100px;
  background: ${props => props.$active ? '#f59e0b' : '#cbd5e1'};
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
`;

const ToggleKnob = styled.div`
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  ${props => props.$active ? 'right: 2px;' : 'left: 2px;'}
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
`;

const ContactBox = styled.div`
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
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
    border-color: #fcd34d;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
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

export default function Cookies() {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    {
      id: 'what',
      title: 'What Are Cookies?',
      icon: Cookie,
      content: (
        <>
          <ContentText>
            Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work efficiently and provide information to the website owners.
          </ContentText>
          <ContentText>
            We use cookies and similar tracking technologies to track activity on our platform and store certain information. These technologies help us improve your experience, understand how you use our service, and deliver personalized content.
          </ContentText>
        </>
      )
    },
    {
      id: 'essential',
      title: 'Essential Cookies',
      icon: Shield,
      content: (
        <>
          <InfoBox>
            <InfoTitle>
              <Shield size={18} />
              Required for Operation
            </InfoTitle>
            <InfoText>
              These cookies are necessary for the website to function and cannot be switched off in our systems.
            </InfoText>
          </InfoBox>
          <CookieTable>
            <TableHeader>
              <span>Cookie Name</span>
              <span>Purpose</span>
              <span>Duration</span>
            </TableHeader>
            <TableRow>
              <CookieName>session_id</CookieName>
              <span>Maintains your login session</span>
              <span>Session</span>
            </TableRow>
            <TableRow>
              <CookieName>csrf_token</CookieName>
              <span>Security token to prevent attacks</span>
              <span>Session</span>
            </TableRow>
            <TableRow>
              <CookieName>cookie_consent</CookieName>
              <span>Stores your cookie preferences</span>
              <span>1 year</span>
            </TableRow>
          </CookieTable>
        </>
      )
    },
    {
      id: 'analytics',
      title: 'Analytics Cookies',
      icon: BarChart3,
      content: (
        <>
          <ContentText>
            These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
          </ContentText>
          <CookieTable>
            <TableHeader>
              <span>Cookie Name</span>
              <span>Purpose</span>
              <span>Duration</span>
            </TableHeader>
            <TableRow>
              <CookieName>_ga</CookieName>
              <span>Google Analytics - distinguishes users</span>
              <span>2 years</span>
            </TableRow>
            <TableRow>
              <CookieName>_gid</CookieName>
              <span>Google Analytics - distinguishes users</span>
              <span>24 hours</span>
            </TableRow>
            <TableRow>
              <CookieName>_gat</CookieName>
              <span>Google Analytics - throttles request rate</span>
              <span>1 minute</span>
            </TableRow>
          </CookieTable>
        </>
      )
    },
    {
      id: 'functional',
      title: 'Functional Cookies',
      icon: Settings,
      content: (
        <>
          <ContentText>
            These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
          </ContentText>
          <List>
            {[
              'Remember your language preferences',
              'Store your theme preferences (light/dark mode)',
              'Remember your timezone settings',
              'Keep you logged in across sessions',
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
      id: 'thirdparty',
      title: 'Third-Party Cookies',
      icon: Globe,
      content: (
        <>
          <ContentText>
            We may use third-party services that place cookies on your device. These include:
          </ContentText>
          <List>
            {[
              { title: 'Social Media Platforms', desc: 'When you connect your social accounts, these platforms may set their own cookies' },
              { title: 'Payment Processors', desc: 'Our payment providers may set cookies for fraud prevention' },
              { title: 'Analytics Services', desc: 'We use Google Analytics to understand site usage' },
              { title: 'Customer Support', desc: 'Our support chat may use cookies to improve assistance' },
            ].map((item, i) => (
              <ListItem key={i}>
                <ListIcon><CheckCircle size={12} /></ListIcon>
                <ListText><strong>{item.title}:</strong> {item.desc}</ListText>
              </ListItem>
            ))}
          </List>
        </>
      )
    },
    {
      id: 'manage',
      title: 'Managing Cookies',
      icon: ToggleRight,
      content: (
        <>
          <ContentText>You have several options for managing cookies:</ContentText>
          <div>
            {[
              { type: 'Essential', desc: 'Required for the platform to function', required: true },
              { type: 'Analytics', desc: 'Help us understand how you use our service', required: false },
              { type: 'Functional', desc: 'Remember your settings and choices', required: false },
            ].map((item, i) => (
              <CookieTypeCard key={i}>
                <CookieTypeInfo>
                  <CookieTypeName>
                    {item.type}
                    {item.required && <RequiredBadge>Required</RequiredBadge>}
                  </CookieTypeName>
                  <CookieTypeDesc>{item.desc}</CookieTypeDesc>
                </CookieTypeInfo>
                <Toggle $active={item.required}>
                  <ToggleKnob $active={item.required} />
                </Toggle>
              </CookieTypeCard>
            ))}
          </div>
        </>
      )
    },
    {
      id: 'browser',
      title: 'Browser Settings',
      icon: Target,
      content: (
        <>
          <ContentText>To manage cookies in your browser:</ContentText>
          <List>
            {[
              { browser: 'Chrome', path: 'Settings → Privacy and Security → Cookies' },
              { browser: 'Firefox', path: 'Settings → Privacy & Security → Cookies' },
              { browser: 'Safari', path: 'Preferences → Privacy → Manage Website Data' },
              { browser: 'Edge', path: 'Settings → Cookies and Site Permissions' },
            ].map((item, i) => (
              <ListItem key={i}>
                <ListIcon><CheckCircle size={12} /></ListIcon>
                <ListText><strong>{item.browser}:</strong> {item.path}</ListText>
              </ListItem>
            ))}
          </List>
          <ContentText style={{ marginTop: '24px' }}>
            Please note that blocking certain cookies may impact your experience on our platform and limit the services we can provide.
          </ContentText>
        </>
      )
    },
    {
      id: 'contact',
      title: 'Contact Us',
      icon: Mail,
      content: (
        <>
          <ContentText>If you have questions about our use of cookies, please contact us.</ContentText>
          <ContactBox>
            <ContactTitle>Cookie Inquiries</ContactTitle>
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
          <Cookie size={32} />
        </IconBox>
        <Badge>Legal</Badge>
        <Title>Cookie Policy</Title>
        <Subtitle>Learn how we use cookies and similar technologies to improve your experience.</Subtitle>
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
            <RelatedCard href="/gdpr">
              <RelatedIcon $gradient="linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)">
                <Shield size={24} />
              </RelatedIcon>
              <RelatedInfo>
                <RelatedName>GDPR Compliance</RelatedName>
                <RelatedDesc>Your rights under GDPR</RelatedDesc>
              </RelatedInfo>
            </RelatedCard>
          </RelatedGrid>
        </RelatedContainer>
      </RelatedSection>

      <MarketingFooter />
    </PageContainer>
  );
}
