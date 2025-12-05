'use client';

import { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { ArrowRight, Calendar, BarChart3, MessageCircle, Users, Zap, Shield, ChevronDown, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';

// Main Container
const LandingPage = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background.default};
`;

// Navigation
const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing['2xl']};
  background: ${props => props.theme.colors.background.paper};
  position: sticky;
  top: 0;
  z-index: ${props => props.theme.zIndex.sticky};
  box-shadow: ${props => props.theme.shadows.sm};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.md};
  }
`;

const Logo = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.extrabold};
  color: ${props => props.theme.colors.text.primary};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary.main}, ${props => props.theme.colors.secondary.main});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const NavButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: center;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    gap: ${props => props.theme.spacing.sm};
  }
`;

const Button = styled(Link)`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.full};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  transition: all ${props => props.theme.transitions.base};
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.sm};

  ${props => props.$variant === 'primary' && `
    background: ${props.theme.colors.primary.main};
    color: white;

    &:hover {
      background: ${props.theme.colors.primary.dark};
      transform: translateY(-1px);
    }
  `}

  ${props => props.$variant === 'outline' && `
    border: 2px solid ${props.theme.colors.primary.main};
    color: ${props.theme.colors.primary.main};

    &:hover {
      background: ${props.theme.colors.primary.main};
      color: white;
    }
  `}

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
    font-size: ${props => props.theme.typography.fontSize.xs};
  }
`;

// Hero Section
const HeroSection = styled.section`
  position: relative;
  padding: ${props => props.theme.spacing['4xl']} ${props => props.theme.spacing.xl};
  background: linear-gradient(135deg, #FFF5F5 0%, #FFE5E5 100%);
  overflow: hidden;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing['2xl']} ${props => props.theme.spacing.lg};
  }
`;

const HeroContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing['3xl']};
  align-items: center;

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const HeroContent = styled.div``;

const HeroTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['6xl']};
  font-weight: ${props => props.theme.typography.fontWeight.extrabold};
  line-height: 1.1;
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text.primary};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    font-size: ${props => props.theme.typography.fontSize['4xl']};
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.typography.fontSize['3xl']};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xl};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
  line-height: 1.6;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.typography.fontSize.lg};
  }
`;

const HeroMockup = styled.div`
  position: relative;
  height: 500px;
  background: white;
  border-radius: ${props => props.theme.borderRadius['2xl']};
  box-shadow: ${props => props.theme.shadows['2xl']};
  padding: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    height: 400px;
  }
`;

// Stats Bar
const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  max-width: 1200px;
  margin: ${props => props.theme.spacing['3xl']} auto;
  padding: 0 ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary.main};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

// Feature Sections
const FeatureSection = styled.section`
  padding: ${props => props.theme.spacing['4xl']} ${props => props.theme.spacing.xl};
  background: ${props => props.$bg || 'transparent'};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing['2xl']} ${props => props.theme.spacing.lg};
  }
`;

const FeatureContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: ${props => props.$reverse ? '1fr 1fr' : '1fr 1fr'};
  gap: ${props => props.theme.spacing['3xl']};
  align-items: center;

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const FeatureContent = styled.div`
  order: ${props => props.$reverse ? 2 : 1};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    order: 1;
  }
`;

const FeatureTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.$color || props.theme.colors.text.primary};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.typography.fontSize['2xl']};
  }
`;

const FeatureDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.$color || props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
  line-height: 1.7;
`;

const FeatureMockup = styled.div`
  order: ${props => props.$reverse ? 1 : 2};
  background: white;
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.xl};
  height: 400px;

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    order: 2;
    height: 300px;
  }
`;

// Conversation Tools Section
const ToolsSection = styled.section`
  padding: ${props => props.theme.spacing['4xl']} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.background.default};
`;

const ToolsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing['3xl']};
  color: ${props => props.theme.colors.text.primary};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.typography.fontSize['2xl']};
  }
`;

const ToolsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.xl};
`;

const ToolCard = styled.div`
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.md};
  transition: transform ${props => props.theme.transitions.base};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;

const ToolIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$bg || props.theme.colors.primary.light};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ToolTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.text.primary};
`;

const ToolDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
`;

// Icon Features Section
const IconFeatures = styled.section`
  padding: ${props => props.theme.spacing['4xl']} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.background.default};
`;

const IconGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing['2xl']};
  text-align: center;
`;

const IconFeature = styled.div``;

const FeatureIconCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$bg || props.theme.colors.primary.light};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${props => props.theme.spacing.md};
`;

const IconFeatureTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.text.primary};
`;

const IconFeatureText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

// Building Cards Section
const CardsSection = styled.section`
  padding: ${props => props.theme.spacing['4xl']} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.background.paper};
`;

const CardsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: ${props => props.theme.spacing.xl};
`;

const Card = styled.div`
  background: ${props => props.theme.colors.background.default};
  border-radius: ${props => props.theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.lg};
  transition: transform ${props => props.theme.transitions.base};

  &:hover {
    transform: translateY(-5px);
  }
`;

const CardImage = styled.div`
  height: 200px;
  background: ${props => props.$bg || '#f3f4f6'};
`;

const CardContent = styled.div`
  padding: ${props => props.theme.spacing.xl};
`;

const CardTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.text.primary};
`;

const CardText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
`;

// FAQs Section
const FAQSection = styled.section`
  padding: ${props => props.theme.spacing['4xl']} ${props => props.theme.spacing.xl};
  background: linear-gradient(135deg, #1a4d4d 0%, #0d3333 100%);
`;

const FAQContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FAQItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.md};
  overflow: hidden;
`;

const FAQQuestion = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  border: none;
  color: white;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  cursor: pointer;
  text-align: left;
  transition: all ${props => props.theme.transitions.base};

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const FAQAnswer = styled.div`
  padding: 0 ${props => props.theme.spacing.lg} ${props => props.theme.spacing.lg};
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  display: ${props => props.$isOpen ? 'block' : 'none'};
`;

// Final CTA Section
const CTASection = styled.section`
  padding: ${props => props.theme.spacing['4xl']} ${props => props.theme.spacing.xl};
  background: linear-gradient(135deg, #a3e635 0%, #84cc16 100%);
  text-align: center;
`;

const CTATitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize['5xl']};
  font-weight: ${props => props.theme.typography.fontWeight.extrabold};
  color: #1a2e05;
  margin-bottom: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.typography.fontSize['3xl']};
  }
`;

const CTAText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xl};
  color: #2d5016;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const CTAButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
`;

// Footer
const Footer = styled.footer`
  background: #1f2937;
  color: white;
  padding: ${props => props.theme.spacing['3xl']} ${props => props.theme.spacing.xl};
`;

const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing['2xl']};
`;

const FooterColumn = styled.div``;

const FooterTitle = styled.h5`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin-bottom: ${props => props.theme.spacing.md};
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const FooterLink = styled(Link)`
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
  transition: color ${props => props.theme.transitions.base};

  &:hover {
    color: white;
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: ${props => props.theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
`;

const FooterLogo = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: white;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const SocialLink = styled.a`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all ${props => props.theme.transitions.base};

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      question: "What platforms do you support?",
      answer: "We support all major social media platforms including Instagram, Facebook, Twitter, LinkedIn, TikTok, and more."
    },
    {
      question: "Can I try before I buy?",
      answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required."
    },
    {
      question: "How does the scheduling work?",
      answer: "Our AI-powered scheduling system analyzes your audience engagement patterns and suggests optimal posting times for maximum reach."
    },
    {
      question: "Is there a limit on team members?",
      answer: "Team limits depend on your plan. Pro plans support up to 10 team members, while Enterprise plans have unlimited seats."
    }
  ];

  return (
    <LandingPage>
      {/* Navigation */}
      <Nav>
        <Logo>SocialHub</Logo>
        <NavButtons>
          <Button href="/login" $variant="outline">Sign In</Button>
          <Button href="/register" $variant="primary">
            Get Started <ArrowRight size={16} />
          </Button>
        </NavButtons>
      </Nav>

      {/* Hero Section */}
      <HeroSection>
        <HeroContainer>
          <HeroContent>
            <HeroTitle>Build a loyal and engaged audience on social media</HeroTitle>
            <HeroSubtitle>
              Schedule posts, analyze performance, and manage all your social media in one powerful platform
            </HeroSubtitle>
            <Button href="/register" $variant="primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
              Get started <ArrowRight size={20} />
            </Button>
          </HeroContent>
          <HeroMockup />
        </HeroContainer>
      </HeroSection>

      {/* Stats Bar */}
      <StatsBar>
        <StatCard>
          <StatValue>140K+</StatValue>
          <StatLabel>Active Users</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>10M+</StatValue>
          <StatLabel>Posts Scheduled</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>98%</StatValue>
          <StatLabel>Customer Satisfaction</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>24/7</StatValue>
          <StatLabel>Support Available</StatLabel>
        </StatCard>
      </StatsBar>

      {/* Green Section - Desktop Automation */}
      <FeatureSection $bg="linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)">
        <FeatureContainer>
          <FeatureContent>
            <FeatureTitle $color="#1a5c1a">Ready to automate from your desktop</FeatureTitle>
            <FeatureDescription $color="#2d5016">
              Schedule your content weeks in advance with our intuitive calendar view. Drag, drop, and you're done.
            </FeatureDescription>
            <Button href="/register" $variant="primary">
              Start scheduling for free <ArrowRight size={16} />
            </Button>
          </FeatureContent>
          <FeatureMockup />
        </FeatureContainer>
      </FeatureSection>

      {/* Orange Section - Media Library */}
      <FeatureSection $bg="linear-gradient(135deg, #ffd89b 0%, #ffc371 100%)">
        <FeatureContainer>
          <FeatureMockup $reverse />
          <FeatureContent $reverse>
            <FeatureTitle $color="#7c2d12">Organize your media</FeatureTitle>
            <FeatureDescription $color="#9a3412">
              Store, organize, and reuse your images and videos in a powerful media library. Keep your brand assets in one place.
            </FeatureDescription>
            <Button href="/register" $variant="primary">
              Get started <ArrowRight size={16} />
            </Button>
          </FeatureContent>
        </FeatureContainer>
      </FeatureSection>

      {/* Dark Section - Analytics */}
      <FeatureSection $bg="#1f2937">
        <FeatureContainer>
          <FeatureContent>
            <FeatureTitle $color="white">Transform the way you view data</FeatureTitle>
            <FeatureDescription $color="rgba(255, 255, 255, 0.8)">
              Get deep insights into your social media performance with beautiful, actionable analytics dashboards.
            </FeatureDescription>
            <Button href="/register" $variant="primary">
              Explore analytics <ArrowRight size={16} />
            </Button>
          </FeatureContent>
          <FeatureMockup />
        </FeatureContainer>
      </FeatureSection>

      {/* Conversation Tools */}
      <ToolsSection>
        <ToolsContainer>
          <SectionTitle>Prioritize important conversations</SectionTitle>
          <ToolsGrid>
            <ToolCard>
              <ToolIcon $bg="#e0e7ff">
                <MessageCircle size={32} color="#6366f1" />
              </ToolIcon>
              <ToolTitle>Unified Inbox</ToolTitle>
              <ToolDescription>
                Manage all your social conversations in one place. Never miss a message or mention again.
              </ToolDescription>
            </ToolCard>
            <ToolCard>
              <ToolIcon $bg="#fce7f3">
                <Zap size={32} color="#ec4899" />
              </ToolIcon>
              <ToolTitle>Quick Responses</ToolTitle>
              <ToolDescription>
                Save time with pre-written templates and smart suggestions for common questions.
              </ToolDescription>
            </ToolCard>
            <ToolCard>
              <ToolIcon $bg="#dbeafe">
                <Users size={32} color="#3b82f6" />
              </ToolIcon>
              <ToolTitle>Team Collaboration</ToolTitle>
              <ToolDescription>
                Assign conversations to team members and track response times effortlessly.
              </ToolDescription>
            </ToolCard>
            <ToolCard>
              <ToolIcon $bg="#d1fae5">
                <Shield size={32} color="#10b981" />
              </ToolIcon>
              <ToolTitle>Smart Filtering</ToolTitle>
              <ToolDescription>
                Automatically filter spam and prioritize important messages using AI.
              </ToolDescription>
            </ToolCard>
          </ToolsGrid>
        </ToolsContainer>
      </ToolsSection>

      {/* Blue Section - Noise Filtering */}
      <FeatureSection $bg="linear-gradient(135deg, #a8edea 0%, #7dd3fc 100%)">
        <FeatureContainer>
          <FeatureMockup $reverse />
          <FeatureContent $reverse>
            <FeatureTitle $color="#075985">Cut out all the noise</FeatureTitle>
            <FeatureDescription $color="#0c4a6e">
              Focus on what matters. Our AI-powered filters help you identify and respond to your most valuable interactions.
            </FeatureDescription>
            <Button href="/register" $variant="primary">
              Try smart filtering <ArrowRight size={16} />
            </Button>
          </FeatureContent>
        </FeatureContainer>
      </FeatureSection>

      {/* Icon Features */}
      <IconFeatures>
        <IconGrid>
          <IconFeature>
            <FeatureIconCircle $bg="#e0e7ff">
              <Calendar size={36} color="#6366f1" />
            </FeatureIconCircle>
            <IconFeatureTitle>Smart Scheduling</IconFeatureTitle>
            <IconFeatureText>AI-powered posting times for maximum engagement</IconFeatureText>
          </IconFeature>
          <IconFeature>
            <FeatureIconCircle $bg="#fce7f3">
              <BarChart3 size={36} color="#ec4899" />
            </FeatureIconCircle>
            <IconFeatureTitle>Analytics</IconFeatureTitle>
            <IconFeatureText>Deep insights into your social media performance</IconFeatureText>
          </IconFeature>
          <IconFeature>
            <FeatureIconCircle $bg="#dbeafe">
              <Users size={36} color="#3b82f6" />
            </FeatureIconCircle>
            <IconFeatureTitle>Team Collaboration</IconFeatureTitle>
            <IconFeatureText>Work together seamlessly with your team</IconFeatureText>
          </IconFeature>
          <IconFeature>
            <FeatureIconCircle $bg="#d1fae5">
              <Shield size={36} color="#10b981" />
            </FeatureIconCircle>
            <IconFeatureTitle>Secure & Reliable</IconFeatureTitle>
            <IconFeatureText>Enterprise-grade security and 99.9% uptime</IconFeatureText>
          </IconFeature>
        </IconGrid>
      </IconFeatures>

      {/* Building Conversations Cards */}
      <CardsSection>
        <CardsContainer>
          <SectionTitle>Build strong conversations with your audience</SectionTitle>
          <CardsGrid>
            <Card>
              <CardImage $bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
              <CardContent>
                <CardTitle>Engage authentically</CardTitle>
                <CardText>
                  Build genuine connections with your audience through meaningful interactions and timely responses.
                </CardText>
              </CardContent>
            </Card>
            <Card>
              <CardImage $bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" />
              <CardContent>
                <CardTitle>Grow your community</CardTitle>
                <CardText>
                  Turn followers into fans with consistent engagement and valuable content that resonates.
                </CardText>
              </CardContent>
            </Card>
            <Card>
              <CardImage $bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" />
              <CardContent>
                <CardTitle>Track what matters</CardTitle>
                <CardText>
                  Monitor your growth, engagement, and reach with comprehensive analytics and reporting.
                </CardText>
              </CardContent>
            </Card>
          </CardsGrid>
        </CardsContainer>
      </CardsSection>

      {/* FAQs */}
      <FAQSection>
        <FAQContainer>
          <SectionTitle style={{ color: 'white' }}>Frequently Asked Questions</SectionTitle>
          {faqs.map((faq, index) => (
            <FAQItem key={index}>
              <FAQQuestion onClick={() => setOpenFAQ(openFAQ === index ? null : index)}>
                {faq.question}
                <ChevronDown
                  size={24}
                  style={{
                    transform: openFAQ === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                />
              </FAQQuestion>
              <FAQAnswer $isOpen={openFAQ === index}>
                {faq.answer}
              </FAQAnswer>
            </FAQItem>
          ))}
        </FAQContainer>
      </FAQSection>

      {/* Final CTA */}
      <CTASection>
        <CTATitle>Grow your social presence with confidence</CTATitle>
        <CTAText>Join thousands of creators and brands using SocialHub</CTAText>
        <CTAButtons>
          <Button href="/register" $variant="primary" style={{ background: '#1a2e05', fontSize: '1.125rem', padding: '1rem 2rem' }}>
            Get started for free <ArrowRight size={20} />
          </Button>
          <Button href="/register" $variant="outline" style={{ borderColor: '#1a2e05', color: '#1a2e05', fontSize: '1.125rem', padding: '1rem 2rem' }}>
            See pricing
          </Button>
        </CTAButtons>
      </CTASection>

      {/* Footer */}
      <Footer>
        <FooterContainer>
          <FooterGrid>
            <FooterColumn>
              <FooterTitle>Product</FooterTitle>
              <FooterLink href="/features">Features</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/integrations">Integrations</FooterLink>
              <FooterLink href="/changelog">Changelog</FooterLink>
            </FooterColumn>
            <FooterColumn>
              <FooterTitle>Company</FooterTitle>
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/press">Press</FooterLink>
            </FooterColumn>
            <FooterColumn>
              <FooterTitle>Resources</FooterTitle>
              <FooterLink href="/docs">Documentation</FooterLink>
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/community">Community</FooterLink>
              <FooterLink href="/templates">Templates</FooterLink>
            </FooterColumn>
            <FooterColumn>
              <FooterTitle>Legal</FooterTitle>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/security">Security</FooterLink>
              <FooterLink href="/gdpr">GDPR</FooterLink>
            </FooterColumn>
          </FooterGrid>
          <FooterBottom>
            <FooterLogo>SocialHub</FooterLogo>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
              © 2024 SocialHub. All rights reserved.
            </div>
            <SocialLinks>
              <SocialLink href="#"><Twitter size={20} /></SocialLink>
              <SocialLink href="#"><Facebook size={20} /></SocialLink>
              <SocialLink href="#"><Instagram size={20} /></SocialLink>
              <SocialLink href="#"><Linkedin size={20} /></SocialLink>
            </SocialLinks>
          </FooterBottom>
        </FooterContainer>
      </Footer>
    </LandingPage>
  );
}
