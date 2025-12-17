"use client";

import styled from 'styled-components';
import Link from 'next/link';
import {
  Calendar, BarChart3, Users, Zap, Globe, Shield,
  Sparkles, Clock, TrendingUp, Palette, Share2, Target,
  ArrowRight, Check, Play
} from 'lucide-react';
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
  margin: 0 auto 32px;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const HeroButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.2s ease;

  &.primary {
    background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
    color: white;
    box-shadow: 0 4px 14px rgba(255, 140, 66, 0.4);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 140, 66, 0.5);
    }
  }

  &.secondary {
    background: white;
    color: #0f172a;
    border: 1px solid #e2e8f0;

    &:hover {
      border-color: #ff8c42;
      color: #ff8c42;
    }
  }
`;

const Section = styled.section`
  padding: 100px 24px;

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

const SectionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: ${props => props.$bg || 'rgba(255, 140, 66, 0.1)'};
  color: ${props => props.$color || '#ff8c42'};
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
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

const FeaturesGrid = styled.div`
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

const FeatureCard = styled.div`
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

const FeatureIcon = styled.div`
  width: 56px;
  height: 56px;
  background: ${props => props.$bg || '#e0e7ff'};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12px;
`;

const FeatureText = styled.p`
  font-size: 15px;
  color: #64748b;
  line-height: 1.7;
`;

const FeatureShowcase = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 48px;
  }
`;

const ShowcaseContent = styled.div`
  ${props => props.$reverse && `
    @media (min-width: 969px) {
      order: 2;
    }
  `}
`;

const ShowcaseVisual = styled.div`
  background: ${props => props.$bg || 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)'};
  border-radius: 24px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;

  @media (max-width: 968px) {
    height: 300px;
  }
`;

const ShowcaseIcon = styled.div`
  opacity: 0.9;
`;

const ShowcaseTitle = styled.h3`
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
`;

const ShowcaseText = styled.p`
  font-size: 17px;
  color: #64748b;
  line-height: 1.7;
  margin-bottom: 24px;
`;

const ShowcaseList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
`;

const ShowcaseItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 16px;
  color: #475569;
`;

const CheckIcon = styled.div`
  width: 24px;
  height: 24px;
  background: #d1fae5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
`;

const LearnMoreLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #ff8c42;
  font-weight: 600;
  text-decoration: none;
  transition: gap 0.2s ease;

  &:hover {
    gap: 12px;
  }
`;

const IntegrationsSection = styled.div`
  text-align: center;
`;

const IntegrationsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
`;

const IntegrationCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px 32px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: #0f172a;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff8c42;
    box-shadow: 0 8px 24px rgba(255, 140, 66, 0.1);
  }
`;

const IntegrationIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.$bg || '#e0e7ff'};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CTASection = styled.section`
  padding: 100px 24px;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 50%, #e67a35 100%);
  text-align: center;
`;

const CTAContent = styled.div`
  max-width: 700px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: 40px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const CTAText = styled.p`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32px;
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.2s ease;

  &.primary {
    background: white;
    color: #ff8c42;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
  }

  &.secondary {
    background: transparent;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.5);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: white;
    }
  }
`;

export default function Features() {
  const coreFeatures = [
    { icon: <Calendar size={28} color="#ff8c42" />, bg: '#fff5ee', title: 'Smart Scheduling', text: 'Plan and schedule your content across all platforms. Our AI recommends the best times to post for maximum engagement.' },
    { icon: <BarChart3 size={28} color="#ec4899" />, bg: '#fce7f3', title: 'Advanced Analytics', text: 'Track performance, measure growth, and get actionable insights with comprehensive analytics dashboards.' },
    { icon: <Users size={28} color="#f59e0b" />, bg: '#fef3c7', title: 'Team Collaboration', text: 'Work together seamlessly with role-based permissions, approval workflows, and team activity tracking.' },
    { icon: <Sparkles size={28} color="#ff6b35" />, bg: '#fff9f5', title: 'AI Content Tools', text: 'Generate captions, hashtags, and content ideas with our powerful AI assistant.' },
    { icon: <Globe size={28} color="#06b6d4" />, bg: '#cffafe', title: 'Multi-Platform', text: 'Connect Instagram, Facebook, Twitter, LinkedIn, TikTok, and more from one dashboard.' },
    { icon: <Shield size={28} color="#10b981" />, bg: '#d1fae5', title: 'Enterprise Security', text: 'Bank-grade encryption, SSO support, and compliance with industry standards.' }
  ];

  const integrations = [
    { name: 'Instagram', bg: '#fce7f3', color: '#ec4899' },
    { name: 'Facebook', bg: '#dbeafe', color: '#2563eb' },
    { name: 'Twitter/X', bg: '#f1f5f9', color: '#0f172a' },
    { name: 'LinkedIn', bg: '#dbeafe', color: '#2563eb' },
    { name: 'TikTok', bg: '#f1f5f9', color: '#0f172a' },
    { name: 'Pinterest', bg: '#fee2e2', color: '#ef4444' },
    { name: 'YouTube', bg: '#fee2e2', color: '#dc2626' }
  ];

  return (
    <PageContainer>
      <MarketingNavbar />

      <HeroSection>
        <FloatingOrb className="left" />
        <FloatingOrb className="right" />
        <HeroContent>
          <Badge>
            <Zap size={16} />
            Powerful Features
          </Badge>
          <Title>
            Everything you need to <span>dominate social</span>
          </Title>
          <Subtitle>
            From scheduling to analytics, SocialHub gives you all the tools
            to grow your audience, save time, and boost engagement.
          </Subtitle>
          <HeroButtons>
            <HeroButton href="/register" className="primary">
              Start Free Trial <ArrowRight size={18} />
            </HeroButton>
            <HeroButton href="/demo" className="secondary">
              <Play size={18} /> Watch Demo
            </HeroButton>
          </HeroButtons>
        </HeroContent>
      </HeroSection>

      <Section>
        <Container>
          <SectionHeader>
            <SectionTitle>Core Features</SectionTitle>
            <SectionSubtitle>
              Everything you need to manage your social media presence effectively
            </SectionSubtitle>
          </SectionHeader>

          <FeaturesGrid>
            {coreFeatures.map((feature, index) => (
              <FeatureCard key={index}>
                <FeatureIcon $bg={feature.bg}>
                  {feature.icon}
                </FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureText>{feature.text}</FeatureText>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </Container>
      </Section>

      <Section>
        <Container>
          <FeatureShowcase>
            <ShowcaseContent>
              <SectionBadge $bg="#d1fae5" $color="#10b981">
                <Calendar size={14} />
                Content Calendar
              </SectionBadge>
              <ShowcaseTitle>Visual Content Planning</ShowcaseTitle>
              <ShowcaseText>
                Plan your entire content strategy with our intuitive drag-and-drop calendar.
                See your posts across all platforms at a glance.
              </ShowcaseText>
              <ShowcaseList>
                <ShowcaseItem>
                  <CheckIcon><Check size={14} color="#10b981" /></CheckIcon>
                  Drag and drop scheduling
                </ShowcaseItem>
                <ShowcaseItem>
                  <CheckIcon><Check size={14} color="#10b981" /></CheckIcon>
                  Multi-platform view
                </ShowcaseItem>
                <ShowcaseItem>
                  <CheckIcon><Check size={14} color="#10b981" /></CheckIcon>
                  Content templates and drafts
                </ShowcaseItem>
                <ShowcaseItem>
                  <CheckIcon><Check size={14} color="#10b981" /></CheckIcon>
                  Bulk upload and scheduling
                </ShowcaseItem>
              </ShowcaseList>
              <LearnMoreLink href="/demo">
                See it in action <ArrowRight size={16} />
              </LearnMoreLink>
            </ShowcaseContent>
            <ShowcaseVisual $bg="linear-gradient(135deg, #10b981 0%, #34d399 100%)">
              <ShowcaseIcon>
                <Calendar size={120} strokeWidth={1} />
              </ShowcaseIcon>
            </ShowcaseVisual>
          </FeatureShowcase>
        </Container>
      </Section>

      <Section>
        <Container>
          <FeatureShowcase>
            <ShowcaseContent $reverse>
              <SectionBadge $bg="#fce7f3" $color="#ec4899">
                <BarChart3 size={14} />
                Analytics
              </SectionBadge>
              <ShowcaseTitle>Data-Driven Decisions</ShowcaseTitle>
              <ShowcaseText>
                Get deep insights into your social media performance. Track what's working,
                identify trends, and optimize your strategy with real-time analytics.
              </ShowcaseText>
              <ShowcaseList>
                <ShowcaseItem>
                  <CheckIcon><Check size={14} color="#10b981" /></CheckIcon>
                  Real-time performance tracking
                </ShowcaseItem>
                <ShowcaseItem>
                  <CheckIcon><Check size={14} color="#10b981" /></CheckIcon>
                  Audience demographics and growth
                </ShowcaseItem>
                <ShowcaseItem>
                  <CheckIcon><Check size={14} color="#10b981" /></CheckIcon>
                  Competitor analysis
                </ShowcaseItem>
                <ShowcaseItem>
                  <CheckIcon><Check size={14} color="#10b981" /></CheckIcon>
                  Custom report generation
                </ShowcaseItem>
              </ShowcaseList>
              <LearnMoreLink href="/demo">
                See it in action <ArrowRight size={16} />
              </LearnMoreLink>
            </ShowcaseContent>
            <ShowcaseVisual $bg="linear-gradient(135deg, #ec4899 0%, #f472b6 100%)">
              <ShowcaseIcon>
                <BarChart3 size={120} strokeWidth={1} />
              </ShowcaseIcon>
            </ShowcaseVisual>
          </FeatureShowcase>
        </Container>
      </Section>

      <Section>
        <Container>
          <FeatureShowcase>
            <ShowcaseContent>
              <SectionBadge $bg="#fff5ee" $color="#ff8c42">
                <Sparkles size={14} />
                AI Assistant
              </SectionBadge>
              <ShowcaseTitle>AI-Powered Content Creation</ShowcaseTitle>
              <ShowcaseText>
                Let our AI help you create engaging content faster. Generate captions,
                find trending hashtags, and get content ideas tailored to your brand.
              </ShowcaseText>
              <ShowcaseList>
                <ShowcaseItem>
                  <CheckIcon><Check size={14} color="#10b981" /></CheckIcon>
                  AI caption generator
                </ShowcaseItem>
                <ShowcaseItem>
                  <CheckIcon><Check size={14} color="#10b981" /></CheckIcon>
                  Smart hashtag suggestions
                </ShowcaseItem>
                <ShowcaseItem>
                  <CheckIcon><Check size={14} color="#10b981" /></CheckIcon>
                  Content idea recommendations
                </ShowcaseItem>
                <ShowcaseItem>
                  <CheckIcon><Check size={14} color="#10b981" /></CheckIcon>
                  Optimal posting time predictions
                </ShowcaseItem>
              </ShowcaseList>
              <LearnMoreLink href="/demo">
                See it in action <ArrowRight size={16} />
              </LearnMoreLink>
            </ShowcaseContent>
            <ShowcaseVisual $bg="linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)">
              <ShowcaseIcon>
                <Sparkles size={120} strokeWidth={1} />
              </ShowcaseIcon>
            </ShowcaseVisual>
          </FeatureShowcase>
        </Container>
      </Section>

      <Section>
        <Container>
          <IntegrationsSection>
            <SectionBadge>
              <Share2 size={14} />
              Integrations
            </SectionBadge>
            <SectionTitle>Connect All Your Platforms</SectionTitle>
            <SectionSubtitle>
              SocialHub integrates with all major social media platforms so you can manage everything from one place.
            </SectionSubtitle>
            <IntegrationsGrid>
              {integrations.map((integration, index) => (
                <IntegrationCard key={index}>
                  <IntegrationIcon $bg={integration.bg}>
                    <Globe size={20} color={integration.color} />
                  </IntegrationIcon>
                  {integration.name}
                </IntegrationCard>
              ))}
            </IntegrationsGrid>
          </IntegrationsSection>
        </Container>
      </Section>

      <CTASection>
        <CTAContent>
          <CTATitle>Ready to supercharge your social media?</CTATitle>
          <CTAText>
            Join 2,500+ businesses already using SocialHub to grow their online presence.
          </CTAText>
          <CTAButtons>
            <CTAButton href="/register" className="primary">
              Start Free Trial <ArrowRight size={18} />
            </CTAButton>
            <CTAButton href="/pricing" className="secondary">
              View Pricing
            </CTAButton>
          </CTAButtons>
        </CTAContent>
      </CTASection>

      <MarketingFooter />
    </PageContainer>
  );
}
