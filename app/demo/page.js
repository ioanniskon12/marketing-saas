"use client";

import styled from 'styled-components';
import Link from 'next/link';
import { Play, Calendar, BarChart3, MessageCircle, Users, Zap, Clock, ArrowRight, Check } from 'lucide-react';
import MarketingNavbar from '../components/MarketingNavbar';
import MarketingFooter from '../components/MarketingFooter';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const HeroSection = styled.section`
  padding: 120px 24px 80px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const FloatingOrb = styled.div`
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.3;

  &.left {
    top: -150px;
    left: -200px;
    background: #6366f1;
  }

  &.right {
    bottom: -150px;
    right: -200px;
    background: #ec4899;
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
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 56px;
  font-weight: 800;
  color: white;
  margin-bottom: 24px;
  line-height: 1.1;

  span {
    background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media (max-width: 768px) {
    font-size: 40px;
  }
`;

const Subtitle = styled.p`
  font-size: 20px;
  color: #94a3b8;
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const Section = styled.section`
  padding: 80px 24px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const VideoSection = styled.div`
  max-width: 1000px;
  margin: -60px auto 0;
  position: relative;
  z-index: 10;
  padding: 0 24px;
`;

const VideoContainer = styled.div`
  background: #0f172a;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const VideoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const VideoDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color || '#e5e7eb'};
`;

const VideoWrapper = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlayButton = styled.button`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.4);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 25px 50px rgba(99, 102, 241, 0.5);
  }

  svg {
    margin-left: 8px;
  }
`;

const VideoCaption = styled.p`
  text-align: center;
  color: #64748b;
  font-size: 14px;
  margin-top: 20px;
`;

const FeaturesSection = styled.section`
  padding: 100px 24px;
  background: #f8fafc;
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
  line-height: 1.6;
`;

const CTASection = styled.section`
  padding: 100px 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
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
    color: #6366f1;

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

const BookDemoSection = styled.section`
  padding: 80px 24px;
`;

const BookDemoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 48px;
  }
`;

const BookDemoContent = styled.div``;

const BookDemoTitle = styled.h2`
  font-size: 36px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
`;

const BookDemoText = styled.p`
  font-size: 17px;
  color: #64748b;
  line-height: 1.7;
  margin-bottom: 32px;
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const BenefitItem = styled.li`
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

const BookDemoForm = styled.form`
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const FormTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
`;

const FormSubtitle = styled.p`
  font-size: 15px;
  color: #64748b;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px 32px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
  }
`;

export default function Demo() {
  const features = [
    { icon: <Calendar size={28} color="#6366f1" />, bg: '#e0e7ff', title: 'Smart Scheduling', text: 'See how our AI finds the perfect time to post for maximum engagement.' },
    { icon: <BarChart3 size={28} color="#ec4899" />, bg: '#fce7f3', title: 'Advanced Analytics', text: 'Explore our comprehensive dashboards with actionable insights.' },
    { icon: <MessageCircle size={28} color="#10b981" />, bg: '#d1fae5', title: 'Content Calendar', text: 'Plan and visualize your entire content strategy in one beautiful calendar.' },
    { icon: <Users size={28} color="#f59e0b" />, bg: '#fef3c7', title: 'Team Collaboration', text: 'Discover approval workflows and team management features.' },
    { icon: <Zap size={28} color="#8b5cf6" />, bg: '#ede9fe', title: 'AI Content Tools', text: 'Watch our AI generate captions, hashtags, and content ideas.' },
    { icon: <Clock size={28} color="#06b6d4" />, bg: '#cffafe', title: 'Time Savings', text: 'See how users save 10+ hours per week with SocialHub.' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <PageContainer>
      <MarketingNavbar />

      <HeroSection>
        <FloatingOrb className="left" />
        <FloatingOrb className="right" />
        <HeroContent>
          <Badge>
            <Play size={16} fill="currentColor" />
            Product Demo
          </Badge>
          <Title>
            See SocialHub <span>in action</span>
          </Title>
          <Subtitle>
            Watch how SocialHub helps thousands of businesses save time,
            grow their audience, and manage social media effortlessly.
          </Subtitle>
        </HeroContent>
      </HeroSection>

      <VideoSection>
        <VideoContainer>
          <VideoHeader>
            <VideoDot $color="#ef4444" />
            <VideoDot $color="#f59e0b" />
            <VideoDot $color="#22c55e" />
          </VideoHeader>
          <VideoWrapper>
            <PlayButton>
              <Play size={40} color="white" fill="white" />
            </PlayButton>
          </VideoWrapper>
        </VideoContainer>
        <VideoCaption>3-minute product overview</VideoCaption>
      </VideoSection>

      <FeaturesSection>
        <Container>
          <SectionHeader>
            <SectionTitle>What You'll Learn</SectionTitle>
            <SectionSubtitle>
              Our demo covers all the key features that make SocialHub the #1 choice for social media management.
            </SectionSubtitle>
          </SectionHeader>

          <FeaturesGrid>
            {features.map((feature, index) => (
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
      </FeaturesSection>

      <BookDemoSection>
        <Container>
          <BookDemoGrid>
            <BookDemoContent>
              <BookDemoTitle>Book a Personalized Demo</BookDemoTitle>
              <BookDemoText>
                Want a walkthrough tailored to your business? Our team will show you
                exactly how SocialHub can solve your specific challenges.
              </BookDemoText>
              <BenefitsList>
                <BenefitItem>
                  <CheckIcon><Check size={14} color="#10b981" /></CheckIcon>
                  30-minute personalized session
                </BenefitItem>
                <BenefitItem>
                  <CheckIcon><Check size={14} color="#10b981" /></CheckIcon>
                  Custom workflow recommendations
                </BenefitItem>
                <BenefitItem>
                  <CheckIcon><Check size={14} color="#10b981" /></CheckIcon>
                  Q&A with product experts
                </BenefitItem>
                <BenefitItem>
                  <CheckIcon><Check size={14} color="#10b981" /></CheckIcon>
                  No commitment required
                </BenefitItem>
              </BenefitsList>
            </BookDemoContent>

            <BookDemoForm onSubmit={handleSubmit}>
              <FormTitle>Schedule Your Demo</FormTitle>
              <FormSubtitle>Fill out the form and we'll be in touch within 24 hours.</FormSubtitle>

              <FormGroup>
                <FormLabel>Full Name</FormLabel>
                <FormInput type="text" placeholder="John Doe" required />
              </FormGroup>

              <FormGroup>
                <FormLabel>Work Email</FormLabel>
                <FormInput type="email" placeholder="john@company.com" required />
              </FormGroup>

              <FormGroup>
                <FormLabel>Company</FormLabel>
                <FormInput type="text" placeholder="Your company name" required />
              </FormGroup>

              <FormGroup>
                <FormLabel>Team Size</FormLabel>
                <FormSelect required>
                  <option value="">Select team size</option>
                  <option value="1">Just me</option>
                  <option value="2-5">2-5 people</option>
                  <option value="6-20">6-20 people</option>
                  <option value="21-50">21-50 people</option>
                  <option value="50+">50+ people</option>
                </FormSelect>
              </FormGroup>

              <SubmitButton type="submit">
                Book Demo <ArrowRight size={18} />
              </SubmitButton>
            </BookDemoForm>
          </BookDemoGrid>
        </Container>
      </BookDemoSection>

      <CTASection>
        <CTAContent>
          <CTATitle>Ready to get started?</CTATitle>
          <CTAText>
            Join 2,500+ businesses already using SocialHub to transform their social media presence.
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
