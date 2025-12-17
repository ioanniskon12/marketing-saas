"use client";

import styled from 'styled-components';
import { Users, Target, Heart, Zap, Award, Globe, Linkedin, Twitter } from 'lucide-react';
import MarketingNavbar from '../components/MarketingNavbar';
import MarketingFooter from '../components/MarketingFooter';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const HeroSection = styled.section`
  padding: 120px 24px 80px;
  background: linear-gradient(180deg, #fff5ee 0%, white 100%);
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
    background: #ff8c42;
  }

  &.right {
    bottom: -100px;
    right: -200px;
    background: #ff6b35;
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
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%);
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
    background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
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

const StorySection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const StoryContent = styled.div``;

const StoryTitle = styled.h3`
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 24px;
`;

const StoryText = styled.p`
  font-size: 17px;
  color: #64748b;
  line-height: 1.8;
  margin-bottom: 20px;
`;

const StoryImage = styled.div`
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  border-radius: 24px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 120px;

  @media (max-width: 968px) {
    height: 300px;
    font-size: 80px;
  }
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ValueCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: transparent;
  }
`;

const ValueIcon = styled.div`
  width: 56px;
  height: 56px;
  background: ${props => props.$bg || '#e0e7ff'};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const ValueTitle = styled.h4`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12px;
`;

const ValueText = styled.p`
  font-size: 15px;
  color: #64748b;
  line-height: 1.7;
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  padding: 60px;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  border-radius: 24px;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
    padding: 40px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatItem = styled.div`
  text-align: center;
  color: white;
`;

const StatValue = styled.div`
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const StatLabel = styled.div`
  font-size: 16px;
  opacity: 0.9;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const TeamCard = styled.div`
  text-align: center;
`;

const TeamAvatar = styled.div`
  width: 160px;
  height: 160px;
  background: ${props => props.$bg || 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)'};
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
  font-weight: 700;
`;

const TeamName = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
`;

const TeamRole = styled.p`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
`;

const TeamSocials = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
`;

const SocialLink = styled.a`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.2s ease;

  &:hover {
    background: #ff8c42;
    color: white;
  }
`;

export default function About() {
  const values = [
    {
      icon: <Users size={28} color="#ff8c42" />,
      bg: '#fff5ee',
      title: 'Customer First',
      text: 'Every decision we make starts with our customers. Their success is our success.'
    },
    {
      icon: <Target size={28} color="#ec4899" />,
      bg: '#fce7f3',
      title: 'Innovation',
      text: 'We constantly push boundaries to deliver cutting-edge solutions that keep you ahead.'
    },
    {
      icon: <Heart size={28} color="#ef4444" />,
      bg: '#fee2e2',
      title: 'Passion',
      text: 'We love what we do, and it shows in every feature we build and every interaction we have.'
    },
    {
      icon: <Zap size={28} color="#f59e0b" />,
      bg: '#fef3c7',
      title: 'Speed',
      text: 'In the fast-paced world of social media, we move quickly without compromising quality.'
    },
    {
      icon: <Award size={28} color="#10b981" />,
      bg: '#d1fae5',
      title: 'Excellence',
      text: 'We hold ourselves to the highest standards in everything we do.'
    },
    {
      icon: <Globe size={28} color="#06b6d4" />,
      bg: '#cffafe',
      title: 'Global Impact',
      text: 'We help businesses worldwide connect with their audiences and grow their presence.'
    }
  ];

  const team = [
    { name: 'Alex Chen', role: 'CEO & Co-Founder', initials: 'AC', bg: 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)' },
    { name: 'Sarah Miller', role: 'CTO & Co-Founder', initials: 'SM', bg: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' },
    { name: 'David Kim', role: 'Head of Product', initials: 'DK', bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
    { name: 'Emily Zhang', role: 'Head of Design', initials: 'EZ', bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
    { name: 'Michael Park', role: 'Head of Engineering', initials: 'MP', bg: 'linear-gradient(135deg, #ff6b35 0%, #ffb380 100%)' },
    { name: 'Jessica Lee', role: 'Head of Marketing', initials: 'JL', bg: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)' },
    { name: 'Ryan Thompson', role: 'Head of Sales', initials: 'RT', bg: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' },
    { name: 'Lisa Wang', role: 'Head of Success', initials: 'LW', bg: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)' }
  ];

  return (
    <PageContainer>
      <MarketingNavbar />

      <HeroSection>
        <FloatingOrb className="left" />
        <FloatingOrb className="right" />
        <HeroContent>
          <Badge>About SocialHub</Badge>
          <Title>
            We're on a mission to <span>simplify social</span>
          </Title>
          <Subtitle>
            Founded in 2020, SocialHub has grown from a small startup to a trusted platform
            used by thousands of businesses worldwide to manage their social media presence.
          </Subtitle>
        </HeroContent>
      </HeroSection>

      <Section>
        <Container>
          <StorySection>
            <StoryContent>
              <StoryTitle>Our Story</StoryTitle>
              <StoryText>
                It all started with a simple frustration: managing multiple social media accounts was
                too complicated. Our founders, tired of juggling between platforms and losing track of
                content, decided to build something better.
              </StoryText>
              <StoryText>
                What began as an internal tool quickly evolved into SocialHub - a comprehensive platform
                that helps businesses save time, increase engagement, and grow their online presence.
                Today, we're proud to serve over 2,500 businesses across 50+ countries.
              </StoryText>
              <StoryText>
                Our team of 50+ passionate individuals works tirelessly to make social media management
                effortless for everyone, from solo entrepreneurs to enterprise marketing teams.
              </StoryText>
            </StoryContent>
            <StoryImage>S</StoryImage>
          </StorySection>
        </Container>
      </Section>

      <Section>
        <Container>
          <StatsSection>
            <StatItem>
              <StatValue>2,500+</StatValue>
              <StatLabel>Active Businesses</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>15M+</StatValue>
              <StatLabel>Posts Scheduled</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>50+</StatValue>
              <StatLabel>Team Members</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>98%</StatValue>
              <StatLabel>Customer Satisfaction</StatLabel>
            </StatItem>
          </StatsSection>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader>
            <SectionTitle>Our Values</SectionTitle>
            <SectionSubtitle>
              The principles that guide everything we do at SocialHub
            </SectionSubtitle>
          </SectionHeader>
          <ValuesGrid>
            {values.map((value, index) => (
              <ValueCard key={index}>
                <ValueIcon $bg={value.bg}>
                  {value.icon}
                </ValueIcon>
                <ValueTitle>{value.title}</ValueTitle>
                <ValueText>{value.text}</ValueText>
              </ValueCard>
            ))}
          </ValuesGrid>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader>
            <SectionTitle>Meet Our Team</SectionTitle>
            <SectionSubtitle>
              The talented people behind SocialHub
            </SectionSubtitle>
          </SectionHeader>
          <TeamGrid>
            {team.map((member, index) => (
              <TeamCard key={index}>
                <TeamAvatar $bg={member.bg}>{member.initials}</TeamAvatar>
                <TeamName>{member.name}</TeamName>
                <TeamRole>{member.role}</TeamRole>
                <TeamSocials>
                  <SocialLink href="#" aria-label="LinkedIn">
                    <Linkedin size={16} />
                  </SocialLink>
                  <SocialLink href="#" aria-label="Twitter">
                    <Twitter size={16} />
                  </SocialLink>
                </TeamSocials>
              </TeamCard>
            ))}
          </TeamGrid>
        </Container>
      </Section>

      <MarketingFooter />
    </PageContainer>
  );
}
