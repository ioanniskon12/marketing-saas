"use client";

import { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Shield, FileText, Users, Database, Download, Trash2, Clock, Globe, CheckCircle, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import MarketingNavbar from '../components/MarketingNavbar';
import MarketingFooter from '../components/MarketingFooter';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const HeroSection = styled.section`
  padding: 120px 24px 60px;
  background: linear-gradient(180deg, #eef2ff 0%, white 100%);
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
    background: #a5b4fc;
  }

  &.right {
    bottom: 0;
    right: -150px;
    background: #818cf8;
  }
`;

const IconBox = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
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
  background: rgba(255, 140, 66, 0.1);
  color: #ff6b35;
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
    background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(255, 140, 66, 0.3);
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
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
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

const LawfulBasisTable = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  padding: 16px;
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%);
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
  grid-template-columns: 1fr 2fr;
  padding: 16px;
  font-size: 14px;
  color: #64748b;
  border-top: 1px solid #f1f5f9;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 4px;
  }
`;

const BasisName = styled.span`
  font-weight: 500;
  color: #0f172a;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RightCard = styled.div`
  background: white;
  border: 1px solid #c7d2fe;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(255, 140, 66, 0.1);
    border-color: #a5b4fc;
  }
`;

const RightCardIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: #ff8c42;
`;

const RightCardTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
`;

const RightCardText = styled.p`
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
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
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

const InfoBox = styled.div`
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%);
  border: 1px solid #c7d2fe;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
`;

const InfoTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
`;

const InfoLink = styled.a`
  color: #ff8c42;
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
    border-color: #a5b4fc;
    box-shadow: 0 4px 12px rgba(255, 140, 66, 0.1);
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

export default function GDPR() {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    {
      id: 'commitment',
      title: 'Our Commitment',
      icon: Shield,
      content: (
        <>
          <ContentText>
            The General Data Protection Regulation (GDPR) is a comprehensive data protection law that applies to organizations processing personal data of individuals in the European Union. At SocialHub, we are fully committed to GDPR compliance and protecting the privacy rights of all our users.
          </ContentText>
          <ContentText>
            We have implemented comprehensive measures to ensure our data processing activities meet GDPR requirements, and we continuously review and update our practices to maintain compliance.
          </ContentText>
        </>
      )
    },
    {
      id: 'lawful',
      title: 'Lawful Basis',
      icon: FileText,
      content: (
        <>
          <ContentText>Under GDPR, we must have a valid lawful basis for processing your personal data:</ContentText>
          <LawfulBasisTable>
            <TableHeader>
              <span>Lawful Basis</span>
              <span>When We Use It</span>
            </TableHeader>
            <TableRow>
              <BasisName>Contract</BasisName>
              <span>To provide our services, including account management and scheduling</span>
            </TableRow>
            <TableRow>
              <BasisName>Consent</BasisName>
              <span>For marketing communications and optional analytics cookies</span>
            </TableRow>
            <TableRow>
              <BasisName>Legitimate Interest</BasisName>
              <span>To improve our services, prevent fraud, and ensure security</span>
            </TableRow>
            <TableRow>
              <BasisName>Legal Obligation</BasisName>
              <span>To comply with legal requirements like tax and accounting laws</span>
            </TableRow>
          </LawfulBasisTable>
        </>
      )
    },
    {
      id: 'rights',
      title: 'Your Rights',
      icon: Users,
      content: (
        <>
          <ContentText>GDPR grants you specific rights regarding your personal data:</ContentText>
          <Grid>
            <RightCard>
              <RightCardIcon><FileText size={20} /></RightCardIcon>
              <RightCardTitle>Right to Access</RightCardTitle>
              <RightCardText>Request a copy of all personal data we hold about you within 30 days.</RightCardText>
            </RightCard>
            <RightCard>
              <RightCardIcon><CheckCircle size={20} /></RightCardIcon>
              <RightCardTitle>Right to Rectification</RightCardTitle>
              <RightCardText>Request correction of any inaccurate or incomplete personal data.</RightCardText>
            </RightCard>
            <RightCard>
              <RightCardIcon><Trash2 size={20} /></RightCardIcon>
              <RightCardTitle>Right to Erasure</RightCardTitle>
              <RightCardText>Request deletion of your personal data ("right to be forgotten").</RightCardText>
            </RightCard>
            <RightCard>
              <RightCardIcon><Download size={20} /></RightCardIcon>
              <RightCardTitle>Right to Portability</RightCardTitle>
              <RightCardText>Request your data in a machine-readable format to transfer elsewhere.</RightCardText>
            </RightCard>
            <RightCard>
              <RightCardIcon><Clock size={20} /></RightCardIcon>
              <RightCardTitle>Right to Restriction</RightCardTitle>
              <RightCardText>Request that we limit processing of your data in certain circumstances.</RightCardText>
            </RightCard>
            <RightCard>
              <RightCardIcon><Shield size={20} /></RightCardIcon>
              <RightCardTitle>Right to Object</RightCardTitle>
              <RightCardText>Object to processing based on legitimate interests or for marketing.</RightCardText>
            </RightCard>
          </Grid>
        </>
      )
    },
    {
      id: 'data',
      title: 'Data We Collect',
      icon: Database,
      content: (
        <>
          <ContentText>We collect and process the following categories of personal data:</ContentText>
          <List>
            {[
              { title: 'Identity Data', desc: 'Name, username, email address' },
              { title: 'Account Data', desc: 'Login credentials, preferences, settings' },
              { title: 'Social Media Data', desc: 'Connected account information, posts, analytics' },
              { title: 'Technical Data', desc: 'IP address, browser type, device information' },
              { title: 'Usage Data', desc: 'How you use our platform, features accessed' },
              { title: 'Payment Data', desc: 'Billing information (processed by secure payment providers)' },
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
      id: 'transfers',
      title: 'International Transfers',
      icon: Globe,
      content: (
        <>
          <ContentText>When we transfer personal data outside the European Economic Area (EEA), we ensure adequate protection through:</ContentText>
          <List>
            {[
              'Standard Contractual Clauses (SCCs) approved by the European Commission',
              'Transfers to countries with adequacy decisions',
              'Binding Corporate Rules where applicable',
              'Additional technical and organizational safeguards',
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
      id: 'retention',
      title: 'Data Retention',
      icon: Clock,
      content: (
        <>
          <ContentText>We retain your personal data only for as long as necessary:</ContentText>
          <List>
            {[
              { title: 'Active Account Data', desc: 'Retained while your account is active' },
              { title: 'Deleted Account Data', desc: 'Permanently deleted within 30 days of account deletion' },
              { title: 'Backup Data', desc: 'Removed from backups within 90 days' },
              { title: 'Legal Records', desc: 'Retained as required by law (typically 7 years for financial records)' },
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
      id: 'dpo',
      title: 'Contact Our DPO',
      icon: Mail,
      content: (
        <>
          <ContentText>
            We have appointed a Data Protection Officer (DPO) to oversee our GDPR compliance. You can contact our DPO for any questions about our data protection practices or to exercise your rights.
          </ContentText>
          <InfoBox>
            <InfoTitle>Data Protection Officer</InfoTitle>
            <InfoText>
              <strong>Email:</strong> <InfoLink href="mailto:dpo@socialhub.com">dpo@socialhub.com</InfoLink>
            </InfoText>
            <InfoText>
              <strong>Response Time:</strong> We aim to respond to all requests within 30 days
            </InfoText>
          </InfoBox>
        </>
      )
    },
    {
      id: 'exercise',
      title: 'Exercise Your Rights',
      icon: CheckCircle,
      content: (
        <>
          <ContentText>To exercise any of your GDPR rights:</ContentText>
          <List>
            {[
              'Email our DPO at dpo@socialhub.com with your request',
              'Use the privacy settings in your account dashboard',
              'Contact our support team through the help center',
            ].map((item, i) => (
              <ListItem key={i}>
                <ListIcon><CheckCircle size={12} /></ListIcon>
                <ListText>{item}</ListText>
              </ListItem>
            ))}
          </List>
          <ContentText style={{ marginTop: '24px' }}>
            We may need to verify your identity before processing your request. We will respond within 30 days, or inform you if we need additional time.
          </ContentText>
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
        <Title>GDPR Compliance</Title>
        <Subtitle>We are committed to protecting your privacy and complying with the General Data Protection Regulation.</Subtitle>
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
            <RelatedCard href="/security">
              <RelatedIcon $gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)">
                <Shield size={24} />
              </RelatedIcon>
              <RelatedInfo>
                <RelatedName>Security</RelatedName>
                <RelatedDesc>Our security measures</RelatedDesc>
              </RelatedInfo>
            </RelatedCard>
          </RelatedGrid>
        </RelatedContainer>
      </RelatedSection>

      <MarketingFooter />
    </PageContainer>
  );
}
