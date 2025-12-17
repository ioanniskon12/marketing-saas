"use client";

import { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Shield, Lock, Server, Eye, Users, AlertTriangle, CheckCircle, Key, Database, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import MarketingNavbar from '../components/MarketingNavbar';
import MarketingFooter from '../components/MarketingFooter';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const HeroSection = styled.section`
  padding: 120px 24px 60px;
  background: linear-gradient(180deg, #ecfdf5 0%, white 100%);
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
    background: #6ee7b7;
  }

  &.right {
    bottom: 0;
    right: -150px;
    background: #34d399;
  }
`;

const IconBox = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
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
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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

const SecurityCard = styled.div`
  background: white;
  border: 1px solid #d1fae5;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
    border-color: #6ee7b7;
  }
`;

const SecurityCardIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: #10b981;
`;

const SecurityCardTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
`;

const SecurityCardText = styled.p`
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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

const CertBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
`;

const CertBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
  border-radius: 100px;
  font-size: 14px;
  font-weight: 500;
  color: #059669;
`;

const AlertBox = styled.div`
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  padding: 16px;
  margin-top: 24px;
`;

const AlertTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 8px;
`;

const AlertText = styled.p`
  font-size: 14px;
  color: #a16207;
`;

const AlertLink = styled.a`
  color: #d97706;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
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
    border-color: #6ee7b7;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
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

export default function Security() {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    {
      id: 'commitment',
      title: 'Our Commitment',
      icon: Shield,
      content: (
        <>
          <ContentText>
            At SocialHub, we understand that you trust us with your social media accounts and business data. We take this responsibility seriously and have implemented comprehensive security measures to protect your information at every level.
          </ContentText>
          <ContentText>
            Our security practices are designed to meet or exceed industry standards, and we continuously monitor and improve our systems to address emerging threats.
          </ContentText>
        </>
      )
    },
    {
      id: 'encryption',
      title: 'Data Encryption',
      icon: Lock,
      content: (
        <>
          <ContentText>We use industry-leading encryption to protect your data:</ContentText>
          <Grid>
            <SecurityCard>
              <SecurityCardIcon><Lock size={20} /></SecurityCardIcon>
              <SecurityCardTitle>Encryption in Transit</SecurityCardTitle>
              <SecurityCardText>All data transmitted between your browser and our servers is encrypted using TLS 1.3.</SecurityCardText>
            </SecurityCard>
            <SecurityCard>
              <SecurityCardIcon><Database size={20} /></SecurityCardIcon>
              <SecurityCardTitle>Encryption at Rest</SecurityCardTitle>
              <SecurityCardText>Your data is encrypted using AES-256 encryption when stored in our databases.</SecurityCardText>
            </SecurityCard>
            <SecurityCard>
              <SecurityCardIcon><Key size={20} /></SecurityCardIcon>
              <SecurityCardTitle>Token Security</SecurityCardTitle>
              <SecurityCardText>Social media tokens are encrypted with separate keys and regularly rotated.</SecurityCardText>
            </SecurityCard>
            <SecurityCard>
              <SecurityCardIcon><Server size={20} /></SecurityCardIcon>
              <SecurityCardTitle>Secure Infrastructure</SecurityCardTitle>
              <SecurityCardText>Hosted on SOC 2 Type II certified cloud providers with regular audits.</SecurityCardText>
            </SecurityCard>
          </Grid>
        </>
      )
    },
    {
      id: 'access',
      title: 'Access Control',
      icon: Users,
      content: (
        <>
          <ContentText>We implement strict access controls to ensure only authorized personnel can access sensitive systems:</ContentText>
          <List>
            {[
              { title: 'Role-Based Access', desc: 'Employees only have access to systems necessary for their job functions' },
              { title: 'Multi-Factor Authentication', desc: 'All internal systems require MFA for access' },
              { title: 'Regular Access Reviews', desc: 'We conduct quarterly reviews of access permissions' },
              { title: 'Audit Logging', desc: 'All system access is logged and monitored' },
              { title: 'Background Checks', desc: 'All employees undergo security background checks' },
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
      id: 'monitoring',
      title: 'Monitoring & Detection',
      icon: Eye,
      content: (
        <>
          <ContentText>Our security team continuously monitors our systems for potential threats:</ContentText>
          <List>
            {[
              '24/7 security monitoring and alerting',
              'Intrusion detection and prevention systems',
              'Real-time threat analysis and response',
              'Regular vulnerability scanning and penetration testing',
              'Automated security patching and updates',
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
      id: 'compliance',
      title: 'Compliance',
      icon: CheckCircle,
      content: (
        <>
          <ContentText>We maintain compliance with major security and privacy standards:</ContentText>
          <CertBadges>
            <CertBadge><CheckCircle size={16} /> SOC 2 Type II</CertBadge>
            <CertBadge><CheckCircle size={16} /> GDPR Compliant</CertBadge>
            <CertBadge><CheckCircle size={16} /> CCPA Compliant</CertBadge>
            <CertBadge><CheckCircle size={16} /> ISO 27001</CertBadge>
          </CertBadges>
        </>
      )
    },
    {
      id: 'incident',
      title: 'Incident Response',
      icon: AlertTriangle,
      content: (
        <>
          <ContentText>We have a comprehensive incident response plan in place:</ContentText>
          <List>
            {[
              'Dedicated security incident response team',
              'Documented response procedures for various scenarios',
              'Regular incident response drills and training',
              'Commitment to notify affected users within 72 hours',
              'Post-incident analysis and continuous improvement',
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
      id: 'bestpractices',
      title: 'Your Security',
      icon: Key,
      content: (
        <>
          <ContentText>Help us keep your account secure by following these recommendations:</ContentText>
          <List>
            {[
              'Use a strong, unique password for your account',
              'Enable two-factor authentication (2FA)',
              'Regularly review connected applications',
              'Keep your email address up to date',
              'Report any suspicious activity immediately',
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
      id: 'report',
      title: 'Report an Issue',
      icon: Mail,
      content: (
        <>
          <ContentText>
            If you discover a security vulnerability or have concerns about our security, please contact our security team immediately.
          </ContentText>
          <AlertBox>
            <AlertTitle>
              <AlertTriangle size={18} />
              Security Contact
            </AlertTitle>
            <AlertText>
              Email us at <AlertLink href="mailto:security@socialhub.com">security@socialhub.com</AlertLink> for any security-related concerns. We take all reports seriously and will respond within 24 hours.
            </AlertText>
          </AlertBox>
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
        <Badge>Security</Badge>
        <Title>Security</Title>
        <Subtitle>Your data security is our top priority. Learn about the measures we take to protect your information.</Subtitle>
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
              <RelatedIcon $gradient="linear-gradient(135deg, #ff8c42 0%, #ff8c42 100%)">
                <Shield size={24} />
              </RelatedIcon>
              <RelatedInfo>
                <RelatedName>Privacy Policy</RelatedName>
                <RelatedDesc>How we handle your data</RelatedDesc>
              </RelatedInfo>
            </RelatedCard>
            <RelatedCard href="/gdpr">
              <RelatedIcon $gradient="linear-gradient(135deg, #ff8c42 0%, #ff8c42 100%)">
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
