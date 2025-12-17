"use client";

import styled from 'styled-components';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, DollarSign, Heart, Zap, Users, Coffee, Plane, GraduationCap, ArrowRight } from 'lucide-react';
import MarketingNavbar from '../components/MarketingNavbar';
import MarketingFooter from '../components/MarketingFooter';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const HeroSection = styled.section`
  padding: 120px 24px 80px;
  background: linear-gradient(180deg, #faf5ff 0%, white 100%);
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const FloatingOrb = styled.div`
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;

  &.left {
    top: -100px;
    left: -200px;
    background: #c4b5fd;
  }

  &.right {
    bottom: -100px;
    right: -200px;
    background: #f9a8d4;
  }
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 8px 20px;
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
  color: #ff8c42;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 56px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 24px;
  line-height: 1.1;

  span {
    background: linear-gradient(135deg, #ff8c42 0%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media (max-width: 768px) {
    font-size: 40px;
  }
`;

const Subtitle = styled.p`
  font-size: 20px;
  color: #64748b;
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const Section = styled.section`
  padding: 80px 24px;

  &:nth-child(even) {
    background: #f8fafc;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const SectionTitle = styled.h2`
  font-size: 40px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
`;

const PerksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const PerkCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 28px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
    border-color: transparent;
  }
`;

const PerkIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.$bg || '#e0e7ff'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const PerkContent = styled.div``;

const PerkTitle = styled.h4`
  font-size: 17px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 6px;
`;

const PerkText = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
`;

const JobsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const JobCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 28px;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #ff8c42;
    box-shadow: 0 8px 24px rgba(255, 140, 66, 0.1);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const JobInfo = styled.div`
  flex: 1;
`;

const JobDepartment = styled.span`
  display: inline-block;
  padding: 4px 12px;
  background: ${props => props.$bg || '#e0e7ff'};
  color: ${props => props.$color || '#ff8c42'};
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const JobTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12px;
`;

const JobMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const JobMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #64748b;
`;

const ApplyButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #ff8c42 0%, #ec4899 100%);
  color: white;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(255, 140, 66, 0.4);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const CultureSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const CultureContent = styled.div``;

const CultureTitle = styled.h3`
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 20px;
`;

const CultureText = styled.p`
  font-size: 17px;
  color: #64748b;
  line-height: 1.8;
  margin-bottom: 16px;
`;

const CultureImages = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const CultureImage = styled.div`
  background: ${props => props.$bg || 'linear-gradient(135deg, #ff8c42 0%, #ec4899 100%)'};
  border-radius: 16px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;

  &:first-child {
    grid-column: 1 / -1;
    height: 200px;
    font-size: 60px;
  }
`;

const NoJobsMessage = styled.div`
  text-align: center;
  padding: 60px;
  background: #f8fafc;
  border-radius: 16px;
`;

const NoJobsTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12px;
`;

const NoJobsText = styled.p`
  font-size: 16px;
  color: #64748b;
  margin-bottom: 24px;
`;

const ContactLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #ff8c42;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export default function Careers() {
  const perks = [
    { icon: <Heart size={24} color="#ef4444" />, bg: '#fee2e2', title: 'Health & Wellness', text: 'Comprehensive medical, dental, and vision coverage for you and your family.' },
    { icon: <DollarSign size={24} color="#10b981" />, bg: '#d1fae5', title: 'Competitive Salary', text: 'Top-of-market compensation with equity options for all team members.' },
    { icon: <Plane size={24} color="#ff8c42" />, bg: '#e0e7ff', title: 'Unlimited PTO', text: 'Take the time you need. We trust you to manage your own schedule.' },
    { icon: <Coffee size={24} color="#f59e0b" />, bg: '#fef3c7', title: 'Remote First', text: 'Work from anywhere. We have team members across 15+ countries.' },
    { icon: <GraduationCap size={24} color="#ff8c42" />, bg: '#ede9fe', title: 'Learning Budget', text: '$2,000 annual budget for courses, conferences, and books.' },
    { icon: <Users size={24} color="#ec4899" />, bg: '#fce7f3', title: 'Team Retreats', text: 'Annual company retreats to connect and celebrate together.' }
  ];

  const jobs = [
    { department: 'Engineering', deptBg: '#e0e7ff', deptColor: '#ff8c42', title: 'Senior Frontend Engineer', location: 'Remote', type: 'Full-time', salary: '$150K - $200K' },
    { department: 'Engineering', deptBg: '#e0e7ff', deptColor: '#ff8c42', title: 'Backend Engineer', location: 'Remote', type: 'Full-time', salary: '$130K - $180K' },
    { department: 'Product', deptBg: '#fce7f3', deptColor: '#ec4899', title: 'Product Manager', location: 'Remote', type: 'Full-time', salary: '$140K - $180K' },
    { department: 'Design', deptBg: '#ede9fe', deptColor: '#ff8c42', title: 'Senior Product Designer', location: 'Remote', type: 'Full-time', salary: '$130K - $170K' },
    { department: 'Marketing', deptBg: '#d1fae5', deptColor: '#10b981', title: 'Content Marketing Manager', location: 'Remote', type: 'Full-time', salary: '$100K - $140K' },
    { department: 'Sales', deptBg: '#fef3c7', deptColor: '#f59e0b', title: 'Account Executive', location: 'Remote', type: 'Full-time', salary: '$80K - $120K + Commission' }
  ];

  return (
    <PageContainer>
      <MarketingNavbar />

      <HeroSection>
        <FloatingOrb className="left" />
        <FloatingOrb className="right" />
        <HeroContent>
          <Badge>Join Our Team</Badge>
          <Title>
            Help us shape the <span>future of social</span>
          </Title>
          <Subtitle>
            We're building something special at SocialHub. Join our team of passionate
            individuals working to make social media management effortless for everyone.
          </Subtitle>
        </HeroContent>
      </HeroSection>

      <Section>
        <Container>
          <SectionHeader>
            <SectionTitle>Why Join SocialHub?</SectionTitle>
            <SectionSubtitle>
              We offer competitive benefits and a culture that puts people first
            </SectionSubtitle>
          </SectionHeader>
          <PerksGrid>
            {perks.map((perk, index) => (
              <PerkCard key={index}>
                <PerkIcon $bg={perk.bg}>
                  {perk.icon}
                </PerkIcon>
                <PerkContent>
                  <PerkTitle>{perk.title}</PerkTitle>
                  <PerkText>{perk.text}</PerkText>
                </PerkContent>
              </PerkCard>
            ))}
          </PerksGrid>
        </Container>
      </Section>

      <Section>
        <Container>
          <CultureSection>
            <CultureContent>
              <CultureTitle>Our Culture</CultureTitle>
              <CultureText>
                At SocialHub, we believe that great products are built by happy teams. We foster an
                environment of trust, transparency, and continuous growth.
              </CultureText>
              <CultureText>
                We're remote-first, meaning you can work from anywhere in the world. But we also
                value connection, which is why we organize regular virtual events and annual
                in-person retreats.
              </CultureText>
              <CultureText>
                We embrace diversity and believe that different perspectives lead to better outcomes.
                No matter your background, if you're passionate about what you do, you'll fit right in.
              </CultureText>
            </CultureContent>
            <CultureImages>
              <CultureImage $bg="linear-gradient(135deg, #ff8c42 0%, #ff8c42 100%)">
                <Users size={60} color="white" />
              </CultureImage>
              <CultureImage $bg="linear-gradient(135deg, #ec4899 0%, #f472b6 100%)">
                <Zap size={40} color="white" />
              </CultureImage>
              <CultureImage $bg="linear-gradient(135deg, #10b981 0%, #34d399 100%)">
                <Heart size={40} color="white" />
              </CultureImage>
            </CultureImages>
          </CultureSection>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader>
            <SectionTitle>Open Positions</SectionTitle>
            <SectionSubtitle>
              Find your next opportunity at SocialHub
            </SectionSubtitle>
          </SectionHeader>
          <JobsContainer>
            {jobs.map((job, index) => (
              <JobCard key={index}>
                <JobInfo>
                  <JobDepartment $bg={job.deptBg} $color={job.deptColor}>
                    {job.department}
                  </JobDepartment>
                  <JobTitle>{job.title}</JobTitle>
                  <JobMeta>
                    <JobMetaItem>
                      <MapPin size={16} />
                      {job.location}
                    </JobMetaItem>
                    <JobMetaItem>
                      <Clock size={16} />
                      {job.type}
                    </JobMetaItem>
                    <JobMetaItem>
                      <DollarSign size={16} />
                      {job.salary}
                    </JobMetaItem>
                  </JobMeta>
                </JobInfo>
                <ApplyButton href={`/careers/${job.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  Apply Now <ArrowRight size={16} />
                </ApplyButton>
              </JobCard>
            ))}
          </JobsContainer>
        </Container>
      </Section>

      <MarketingFooter />
    </PageContainer>
  );
}
