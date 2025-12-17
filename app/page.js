'use client';

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  BarChart3,
  MessageCircle,
  Users,
  Zap,
  Shield,
  ChevronDown,
  Star,
  Check,
  Play,
  Sparkles,
  TrendingUp,
  Clock,
  Globe
} from 'lucide-react';
import MarketingNavbar from './components/MarketingNavbar';
import MarketingFooter from './components/MarketingFooter';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;


// Main Container
const LandingPage = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background.default};
  overflow-x: hidden;
`;

// Navigation
const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing['2xl']};
  background: ${props => props.$scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(20px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: ${props => props.$scrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)'};
  transition: all 0.3s ease;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  }
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  border-radius: ${props => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
`;

const Logo = styled.span`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.extrabold};
  background: linear-gradient(135deg, #ff8c42, #ff6b35, #e67a35);
  background-size: 200% 200%;
  animation: ${gradientMove} 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.typography.fontSize.xl};
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  align-items: center;

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  font-size: ${props => props.theme.typography.fontSize.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all 0.2s ease;

  &:hover {
    color: #ff8c42;
    background: rgba(255, 140, 66, 0.08);
  }
`;

const NavButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  align-items: center;

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  width: 44px;
  height: 44px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: transparent;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.primary};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 140, 66, 0.08);
  }

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: flex;
  }
`;

const MobileMenu = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 999;
  padding: ${props => props.theme.spacing.xl};
  flex-direction: column;
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: flex;
  }
`;

const MobileMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing['2xl']};
`;

const MobileMenuLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const MobileNavLink = styled(Link)`
  color: ${props => props.theme.colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  font-size: ${props => props.theme.typography.fontSize.lg};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 140, 66, 0.08);
    color: #ff8c42;
  }
`;

const MobileMenuButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-top: auto;
  padding-top: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const Button = styled(Link)`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.sm};

  ${props => props.$variant === 'primary' && `
    background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
    color: white;
    box-shadow: 0 4px 14px rgba(255, 140, 66, 0.4);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 140, 66, 0.5);
    }
  `}

  ${props => props.$variant === 'outline' && `
    border: 2px solid ${props.theme.colors.border.main};
    color: ${props.theme.colors.text.primary};

    &:hover {
      border-color: #ff8c42;
      color: #ff8c42;
    }
  `}

  ${props => props.$variant === 'ghost' && `
    color: ${props.theme.colors.text.secondary};

    &:hover {
      color: ${props.theme.colors.text.primary};
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
  padding: 160px ${props => props.theme.spacing.xl} 100px;
  background: linear-gradient(135deg, #fff5ee 0%, #faf8f5 50%, #fff9f5 100%);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(255, 140, 66, 0.1) 0%, transparent 70%);
    animation: ${float} 6s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%);
    animation: ${float} 8s ease-in-out infinite reverse;
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 120px ${props => props.theme.spacing.lg} 60px;
  }
`;

const HeroContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing['3xl']};
  align-items: center;
  position: relative;
  z-index: 1;

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const HeroContent = styled.div`
  animation: ${fadeInUp} 0.8s ease-out;
`;

const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%);
  border: 1px solid rgba(255, 140, 66, 0.2);
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: #ff8c42;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: ${props => props.theme.typography.fontWeight.extrabold};
  line-height: 1.1;
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text.primary};

  span {
    background: linear-gradient(135deg, #ff8c42, #ff6b35, #e67a35);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xl};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
  line-height: 1.6;
  max-width: 540px;

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    justify-content: center;
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: center;
  }
`;

const HeroStats = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing['2xl']};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    justify-content: center;
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
  }
`;

const HeroStat = styled.div`
  text-align: left;

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    text-align: center;
  }
`;

const HeroStatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const HeroStatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.tertiary};
`;

const HeroVisual = styled.div`
  position: relative;
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: none;
  }
`;

const HeroMockup = styled.div`
  position: relative;
  background: white;
  border-radius: ${props => props.theme.borderRadius['2xl']};
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  padding: ${props => props.theme.spacing.md};
  animation: ${float} 6s ease-in-out infinite;
`;

const MockupHeader = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const MockupDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color || '#e5e7eb'};
`;

const MockupContent = styled.div`
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: ${props => props.theme.borderRadius.lg};
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.tertiary};
`;

const FloatingCard = styled.div`
  position: absolute;
  background: white;
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.md};
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  animation: ${float} 4s ease-in-out infinite;
  animation-delay: ${props => props.$delay || '0s'};

  ${props => props.$position === 'top-left' && `
    top: -20px;
    left: -40px;
  `}

  ${props => props.$position === 'bottom-right' && `
    bottom: 40px;
    right: -60px;
  `}
`;

const FloatingCardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.$bg || '#e0e7ff'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const FloatingCardText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const FloatingCardValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

// Logos Section - Infinite Scroll
const marquee = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const LogosSection = styled.section`
  padding: 48px 24px;
  background: white;
  border-top: 1px solid #f1f5f9;
  overflow: hidden;
`;

const LogosTitle = styled.p`
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 32px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 500;
  text-align: center;
`;

const LogosTrack = styled.div`
  display: flex;
  animation: ${marquee} 25s linear infinite;
  white-space: nowrap;
  width: fit-content;
`;

const LogoItem = styled.div`
  margin: 0 48px;
  font-size: 24px;
  font-weight: 700;
  color: #d1d5db;
  transition: color 0.2s ease;
  cursor: default;

  &:hover {
    color: #9ca3af;
  }

  @media (max-width: 768px) {
    font-size: 20px;
    margin: 0 32px;
  }
`;

// Stats Section
const StatsSection = styled.section`
  padding: ${props => props.theme.spacing['4xl']} ${props => props.theme.spacing.xl};
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
`;

const StatsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: white;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: rgba(255, 255, 255, 0.8);
`;

// Features Grid Section
const FeaturesSection = styled.section`
  padding: 100px ${props => props.theme.spacing.xl};
  background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto ${props => props.theme.spacing['3xl']};
`;

const SectionBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: ${props => props.$bg || 'rgba(255, 140, 66, 0.1)'};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.$color || '#ff8c42'};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.$color || '#1e293b'};
  margin-bottom: ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.typography.fontSize['2xl']};
  }
`;

const SectionSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.$color || '#64748b'};
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  padding: ${props => props.theme.spacing.xl};
  background: white;
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${props => props.theme.borderRadius.xl};
  background: ${props => props.$bg || '#e0e7ff'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const FeatureTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const FeatureDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
`;

// Showcase Section
const ShowcaseSection = styled.section`
  padding: 100px ${props => props.theme.spacing.xl};
  background: white;
`;

const ShowcaseContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing['3xl']};
  align-items: center;

  ${props => props.$reverse && `
    direction: rtl;
    > * { direction: ltr; }
  `}

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    direction: ltr;
  }
`;

const ShowcaseContent = styled.div``;

const ShowcaseList = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${props => props.theme.spacing.xl} 0;
`;

const ShowcaseItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ShowcaseCheck = styled.div`
  width: 24px;
  height: 24px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: #d1fae5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
`;

const ShowcaseItemText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
`;

const ShowcaseVisual = styled.div`
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: ${props => props.theme.borderRadius['2xl']};
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.tertiary};
`;

// Testimonials Section
const TestimonialsSection = styled.section`
  padding: 100px 0;
  background: linear-gradient(180deg, #fff5ee 0%, #faf8f5 50%, #fff5ee 100%);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 140, 66, 0.2), transparent);
  }
`;

const TestimonialsTrack = styled.div`
  display: flex;
  gap: 24px;
  animation: ${marquee} 40s linear infinite;
  width: fit-content;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
`;

const TestimonialCard = styled.div`
  flex-shrink: 0;
  width: 380px;
  padding: 28px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 140, 66, 0.08);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(255, 140, 66, 0.12);
    border-color: rgba(255, 140, 66, 0.15);
  }
`;

const TestimonialStars = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const TestimonialText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.7;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const TestimonialAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$bg || 'linear-gradient(135deg, #ff8c42, #ff6b35)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const TestimonialInfo = styled.div``;

const TestimonialName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const TestimonialRole = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.tertiary};
`;

// Pricing Section
const PricingSection = styled.section`
  padding: 100px ${props => props.theme.spacing.xl};
  background: white;
  position: relative;
`;

const PricingContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }
`;

const PricingCard = styled.div`
  padding: 32px;
  background: ${props => props.$featured
    ? 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 50%, #ff8c42 100%)'
    : 'white'};
  background-size: 200% 200%;
  border-radius: 20px;
  box-shadow: ${props => props.$featured
    ? '0 25px 50px -12px rgba(255, 140, 66, 0.35)'
    : '0 1px 3px rgba(0, 0, 0, 0.05)'};
  position: relative;
  transition: all 0.3s ease;
  border: ${props => props.$featured
    ? 'none'
    : '1px solid #e2e8f0'};

  ${props => props.$featured && `
    transform: scale(1.05);
    z-index: 10;
    animation: gradientShift 5s ease infinite;

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `}

  &:hover {
    transform: ${props => props.$featured ? 'scale(1.08)' : 'translateY(-4px)'};
    box-shadow: ${props => props.$featured
      ? '0 30px 60px -12px rgba(255, 140, 66, 0.45)'
      : '0 20px 40px -12px rgba(0, 0, 0, 0.12)'};
    border-color: ${props => props.$featured ? 'none' : '#cbd5e1'};
  }
`;

const PricingBadge = styled.div`
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 16px;
  background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  white-space: nowrap;
`;

const PricingName = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$featured ? 'white' : '#0f172a'};
  margin-bottom: 8px;
`;

const PricingDescription = styled.p`
  font-size: 14px;
  color: ${props => props.$featured ? 'rgba(191, 219, 254, 1)' : '#64748b'};
  margin-bottom: 24px;
`;

const PricingPrice = styled.div`
  margin-bottom: 24px;
`;

const PriceAmount = styled.span`
  font-size: 48px;
  font-weight: 700;
  color: ${props => props.$featured ? 'white' : '#0f172a'};
`;

const PricePeriod = styled.span`
  font-size: 16px;
  color: ${props => props.$featured ? 'rgba(191, 219, 254, 1)' : '#64748b'};
`;

const PricingFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
`;

const PricingFeature = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: ${props => props.$featured ? 'rgba(239, 246, 255, 0.95)' : '#475569'};
  margin-bottom: 16px;

  svg {
    flex-shrink: 0;
  }
`;

const PricingButton = styled(Link)`
  display: block;
  text-align: center;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
  font-size: 15px;

  ${props => props.$featured ? `
    background: white;
    color: #ff8c42;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      background: #f8fafc;
    }
  ` : `
    background: #0f172a;
    color: white;

    &:hover {
      transform: translateY(-2px);
      background: #1e293b;
    }
  `}
`;

// FAQ Section
const FAQSection = styled.section`
  padding: 100px ${props => props.theme.spacing.xl};
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 140, 66, 0.2), transparent);
  }

  h2, p {
    color: #1e293b !important;
  }
`;

const FAQContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FAQItem = styled.div`
  background: white;
  border-radius: ${props => props.theme.borderRadius.xl};
  margin-bottom: ${props => props.theme.spacing.md};
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 140, 66, 0.08);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 20px rgba(255, 140, 66, 0.12);
    border-color: rgba(255, 140, 66, 0.15);
  }
`;

const FAQQuestion = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  border: none;
  color: #1e293b;
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;

  svg {
    color: #ff8c42;
  }

  &:hover {
    color: #ff8c42;
  }
`;

const FAQAnswer = styled.div`
  padding: 0 ${props => props.theme.spacing.xl} ${props => props.theme.spacing.lg};
  color: #475569;
  line-height: 1.8;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  border-top: 1px solid rgba(255, 140, 66, 0.08);
  padding-top: ${props => props.$isOpen ? props.theme.spacing.lg : 0};
  font-size: 15px;
`;

// CTA Section
const CTASection = styled.section`
  padding: 100px ${props => props.theme.spacing.xl};
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 50%, #e67a35 100%);
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    animation: ${float} 10s ease-in-out infinite;
  }
`;

const CTAContainer = styled.div`
  max-width: 700px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const CTATitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: white;
  margin-bottom: ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.typography.fontSize['2xl']};
  }
`;

const CTAText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xl};
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const CTAButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
`;

const CTAButton = styled(Link)`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing['2xl']};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.lg};
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  ${props => props.$variant === 'white' && `
    background: white;
    color: #ff8c42;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }
  `}

  ${props => props.$variant === 'outline' && `
    border: 2px solid white;
    color: white;

    &:hover {
      background: white;
      color: #ff8c42;
    }
  `}
`;

// Footer
const Footer = styled.footer`
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 140, 66, 0.5), transparent);
  }
`;

const FooterTop = styled.div`
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%);
  padding: ${props => props.theme.spacing['2xl']} ${props => props.theme.spacing.xl};
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const FooterTopContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${props => props.theme.spacing.xl};
  flex-wrap: wrap;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    text-align: center;
  }
`;

const FooterCTA = styled.div`
  max-width: 400px;
`;

const FooterCTATitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: white;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const FooterCTAText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: rgba(255, 255, 255, 0.7);
`;

const NewsletterForm = styled.form`
  display: flex;
  gap: ${props => props.theme.spacing.sm};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const NewsletterInput = styled.input`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${props => props.theme.borderRadius.lg};
  color: white;
  font-size: ${props => props.theme.typography.fontSize.sm};
  min-width: 280px;
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #ff8c42;
    background: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    min-width: 100%;
  }
`;

const NewsletterButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  color: white;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(255, 140, 66, 0.4);
  }
`;

const FooterMain = styled.div`
  padding: ${props => props.theme.spacing['3xl']} ${props => props.theme.spacing.xl};
`;

const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr repeat(4, 1fr);
  gap: ${props => props.theme.spacing['2xl']};
  margin-bottom: ${props => props.theme.spacing['2xl']};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FooterBrand = styled.div`
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-column: 1 / -1;
    margin-bottom: ${props => props.theme.spacing.lg};
  }
`;

const FooterLogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const FooterLogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  border-radius: ${props => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
`;

const FooterLogo = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  background: linear-gradient(135deg, #ff8c42, #ff6b35, #e67a35);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const FooterTagline = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
  max-width: 300px;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FooterSocialLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const FooterColumn = styled.div``;

const FooterTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin-bottom: ${props => props.theme.spacing.lg};
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const FooterLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: rgba(255, 255, 255, 0.6);
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.xs} 0;
  transition: all 0.2s ease;

  &:hover {
    color: #ffb380;
    transform: translateX(4px);
  }
`;

const FooterContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  color: rgba(255, 255, 255, 0.6);
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  line-height: 1.5;
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.xl};
  background: rgba(0, 0, 0, 0.2);
`;

const FooterBottomContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    text-align: center;
  }
`;

const FooterCopyright = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: ${props => props.theme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const FooterBottomLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const FooterBottomLink = styled(Link)`
  color: rgba(255, 255, 255, 0.5);
  font-size: ${props => props.theme.typography.fontSize.sm};
  transition: color 0.2s ease;

  &:hover {
    color: white;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const SocialLink = styled.a`
  width: 36px;
  height: 36px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
    color: white;
    transform: translateY(-3px);
  }
`;

// Component
export default function Home() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const testimonials = [
    {
      text: "SocialHub has completely transformed how we manage our social media. The scheduling features alone save us 10+ hours per week!",
      name: "Sarah Chen",
      role: "Marketing Director, TechStart",
      initials: "SC",
      bg: "linear-gradient(135deg, #ff8c42, #ff6b35)"
    },
    {
      text: "The analytics dashboard gives us insights we never had before. We've increased our engagement by 300% in just 3 months.",
      name: "Michael Roberts",
      role: "Social Media Manager, GrowthCo",
      initials: "MR",
      bg: "linear-gradient(135deg, #ec4899, #f472b6)"
    },
    {
      text: "Finally, a tool that understands what content creators need. The unified inbox is a game changer for managing DMs.",
      name: "Jessica Park",
      role: "Content Creator, 500K followers",
      initials: "JP",
      bg: "linear-gradient(135deg, #10b981, #34d399)"
    },
    {
      text: "We switched from 3 different tools to just SocialHub. Better features, better price, better support. What more could you ask for?",
      name: "David Kim",
      role: "CEO, Digital Agency",
      initials: "DK",
      bg: "linear-gradient(135deg, #f59e0b, #fbbf24)"
    },
    {
      text: "The AI-powered scheduling is incredibly accurate. Our posts now reach 2x more people than before.",
      name: "Emily Thompson",
      role: "Brand Manager, Fashion Co",
      initials: "ET",
      bg: "linear-gradient(135deg, #ff6b35, #ff8c42)"
    },
    {
      text: "Best investment we've made this year. ROI was positive within the first month of using SocialHub.",
      name: "Alex Rivera",
      role: "Founder, E-commerce Brand",
      initials: "AR",
      bg: "linear-gradient(135deg, #06b6d4, #22d3ee)"
    }
  ];

  const faqs = [
    {
      question: "What platforms do you support?",
      answer: "We support all major social media platforms including Instagram, Facebook, Twitter/X, LinkedIn, TikTok, YouTube, and Pinterest. We're constantly adding new platforms based on user demand."
    },
    {
      question: "Can I try before I buy?",
      answer: "Absolutely! We offer a 14-day free trial with full access to all features. No credit card required. You can upgrade, downgrade, or cancel at any time."
    },
    {
      question: "How does the AI scheduling work?",
      answer: "Our AI analyzes your historical engagement data, audience activity patterns, and industry benchmarks to recommend the optimal posting times for each platform. The more you use it, the smarter it gets!"
    },
    {
      question: "Is there a limit on team members?",
      answer: "It depends on your plan. Starter includes 1 user, Pro includes up to 5 users, and Enterprise has unlimited team members. All plans include role-based permissions and collaboration features."
    },
    {
      question: "What kind of support do you offer?",
      answer: "All plans include email support with responses within 24 hours. Pro plans include priority chat support, and Enterprise plans get a dedicated account manager and phone support."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period. We don't believe in lock-in contracts."
    }
  ];

  const features = [
    {
      icon: <Calendar size={28} color="#ff8c42" />,
      bg: "#fff5ee",
      title: "Smart Scheduling",
      description: "AI-powered scheduling that finds the perfect time to post for maximum engagement."
    },
    {
      icon: <BarChart3 size={28} color="#ec4899" />,
      bg: "#fce7f3",
      title: "Advanced Analytics",
      description: "Deep insights into your performance with actionable recommendations."
    },
    {
      icon: <MessageCircle size={28} color="#10b981" />,
      bg: "#d1fae5",
      title: "Unified Inbox",
      description: "Manage all your messages, comments, and mentions from one dashboard."
    },
    {
      icon: <Users size={28} color="#f59e0b" />,
      bg: "#fef3c7",
      title: "Team Collaboration",
      description: "Work together seamlessly with approval workflows and task assignments."
    },
    {
      icon: <Zap size={28} color="#ff6b35" />,
      bg: "#fff0e6",
      title: "Content Library",
      description: "Store, organize, and reuse your best performing content and templates."
    },
    {
      icon: <Globe size={28} color="#06b6d4" />,
      bg: "#cffafe",
      title: "Multi-Platform",
      description: "Connect all your social accounts and manage them from one place."
    }
  ];

  return (
    <LandingPage>
      {/* Navigation */}
      <MarketingNavbar />

      {/* Hero Section */}
      <HeroSection>
        <HeroContainer>
          <HeroContent>
            <HeroBadge>
              <Sparkles size={16} />
              #1 Social Media Management Platform
            </HeroBadge>
            <HeroTitle>
              Grow your audience with <span>smart social media</span> management
            </HeroTitle>
            <HeroSubtitle>
              Schedule posts, analyze performance, manage conversations, and collaborate with your team — all in one powerful platform.
            </HeroSubtitle>
            <HeroButtons>
              <Button href="/register" $variant="primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                Start Free Trial <ArrowRight size={20} />
              </Button>
              <Button href="/demo" $variant="outline" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                <Play size={20} /> Watch Demo
              </Button>
            </HeroButtons>
            <HeroStats>
              <HeroStat>
                <HeroStatValue>2,500+</HeroStatValue>
                <HeroStatLabel>Active Businesses</HeroStatLabel>
              </HeroStat>
              <HeroStat>
                <HeroStatValue>15M+</HeroStatValue>
                <HeroStatLabel>Posts Scheduled</HeroStatLabel>
              </HeroStat>
              <HeroStat>
                <HeroStatValue>98%</HeroStatValue>
                <HeroStatLabel>Satisfaction Rate</HeroStatLabel>
              </HeroStat>
            </HeroStats>
          </HeroContent>
          <HeroVisual>
            <HeroMockup>
              <MockupHeader>
                <MockupDot $color="#ef4444" />
                <MockupDot $color="#f59e0b" />
                <MockupDot $color="#22c55e" />
              </MockupHeader>
              <MockupContent>
                <Calendar size={64} strokeWidth={1} />
              </MockupContent>
            </HeroMockup>
            <FloatingCard $position="top-left" $delay="0s">
              <FloatingCardIcon $bg="#d1fae5">
                <TrendingUp size={20} color="#10b981" />
              </FloatingCardIcon>
              <FloatingCardText>Engagement</FloatingCardText>
              <FloatingCardValue>+127%</FloatingCardValue>
            </FloatingCard>
            <FloatingCard $position="bottom-right" $delay="1s">
              <FloatingCardIcon $bg="#fff5ee">
                <Clock size={20} color="#ff8c42" />
              </FloatingCardIcon>
              <FloatingCardText>Time Saved</FloatingCardText>
              <FloatingCardValue>12h/week</FloatingCardValue>
            </FloatingCard>
          </HeroVisual>
        </HeroContainer>
      </HeroSection>

      {/* Logos Section - Infinite Scroll */}
      <LogosSection>
        <LogosTitle>Trusted by leading brands</LogosTitle>
        <LogosTrack>
          {['Shopify', 'Stripe', 'Notion', 'Figma', 'Webflow', 'Vercel', 'Slack', 'Discord', 'Shopify', 'Stripe', 'Notion', 'Figma', 'Webflow', 'Vercel', 'Slack', 'Discord'].map((brand, i) => (
            <LogoItem key={i}>{brand}</LogoItem>
          ))}
        </LogosTrack>
      </LogosSection>

      {/* Stats Section */}
      <StatsSection>
        <StatsContainer>
          <StatCard>
            <StatValue>2,500+</StatValue>
            <StatLabel>Active Businesses</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>15M+</StatValue>
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
        </StatsContainer>
      </StatsSection>

      {/* Features Section */}
      <FeaturesSection id="features">
        <FeaturesContainer>
          <SectionHeader>
            <SectionBadge>
              <Zap size={16} />
              Powerful Features
            </SectionBadge>
            <SectionTitle>Everything you need to succeed on social media</SectionTitle>
            <SectionSubtitle>
              From scheduling to analytics, we've got all the tools you need to grow your audience and engage your community.
            </SectionSubtitle>
          </SectionHeader>
          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard key={index}>
                <FeatureIcon $bg={feature.bg}>
                  {feature.icon}
                </FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </FeaturesContainer>
      </FeaturesSection>

      {/* Showcase Section 1 */}
      <ShowcaseSection>
        <ShowcaseContainer>
          <ShowcaseContent>
            <SectionBadge $bg="#d1fae5" $color="#10b981">
              <Calendar size={16} />
              Smart Scheduling
            </SectionBadge>
            <SectionTitle>Schedule weeks of content in minutes</SectionTitle>
            <SectionSubtitle>
              Our intuitive calendar makes planning your content a breeze. Drag, drop, and watch your social presence grow.
            </SectionSubtitle>
            <ShowcaseList>
              <ShowcaseItem>
                <ShowcaseCheck><Check size={14} color="#10b981" /></ShowcaseCheck>
                <ShowcaseItemText>AI-powered best time to post recommendations</ShowcaseItemText>
              </ShowcaseItem>
              <ShowcaseItem>
                <ShowcaseCheck><Check size={14} color="#10b981" /></ShowcaseCheck>
                <ShowcaseItemText>Bulk upload and schedule hundreds of posts at once</ShowcaseItemText>
              </ShowcaseItem>
              <ShowcaseItem>
                <ShowcaseCheck><Check size={14} color="#10b981" /></ShowcaseCheck>
                <ShowcaseItemText>Auto-publish to all platforms simultaneously</ShowcaseItemText>
              </ShowcaseItem>
            </ShowcaseList>
            <Button href="/register" $variant="primary">
              Try Smart Scheduling <ArrowRight size={16} />
            </Button>
          </ShowcaseContent>
          <ShowcaseVisual>
            <Calendar size={64} strokeWidth={1} />
          </ShowcaseVisual>
        </ShowcaseContainer>
      </ShowcaseSection>

      {/* Showcase Section 2 */}
      <ShowcaseSection style={{ background: '#f9fafb' }}>
        <ShowcaseContainer $reverse>
          <ShowcaseContent>
            <SectionBadge $bg="#fce7f3" $color="#ec4899">
              <BarChart3 size={16} />
              Analytics
            </SectionBadge>
            <SectionTitle>Understand what's working and why</SectionTitle>
            <SectionSubtitle>
              Get deep insights into your social media performance with beautiful, actionable analytics dashboards.
            </SectionSubtitle>
            <ShowcaseList>
              <ShowcaseItem>
                <ShowcaseCheck><Check size={14} color="#10b981" /></ShowcaseCheck>
                <ShowcaseItemText>Track engagement, reach, and follower growth</ShowcaseItemText>
              </ShowcaseItem>
              <ShowcaseItem>
                <ShowcaseCheck><Check size={14} color="#10b981" /></ShowcaseCheck>
                <ShowcaseItemText>Compare performance across all your accounts</ShowcaseItemText>
              </ShowcaseItem>
              <ShowcaseItem>
                <ShowcaseCheck><Check size={14} color="#10b981" /></ShowcaseCheck>
                <ShowcaseItemText>Export beautiful reports for your team or clients</ShowcaseItemText>
              </ShowcaseItem>
            </ShowcaseList>
            <Button href="/register" $variant="primary">
              Explore Analytics <ArrowRight size={16} />
            </Button>
          </ShowcaseContent>
          <ShowcaseVisual>
            <BarChart3 size={64} strokeWidth={1} />
          </ShowcaseVisual>
        </ShowcaseContainer>
      </ShowcaseSection>

      {/* Testimonials Section */}
      <TestimonialsSection id="testimonials">
        <SectionHeader style={{ padding: '0 1.5rem' }}>
          <SectionBadge>
            <Star size={16} />
            Testimonials
          </SectionBadge>
          <SectionTitle>Loved by thousands of businesses</SectionTitle>
          <SectionSubtitle>
            See what our customers have to say about their experience with SocialHub.
          </SectionSubtitle>
        </SectionHeader>
        <TestimonialsTrack>
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <TestimonialCard key={index}>
              <TestimonialStars>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#fbbf24" color="#fbbf24" />
                ))}
              </TestimonialStars>
              <TestimonialText>"{testimonial.text}"</TestimonialText>
              <TestimonialAuthor>
                <TestimonialAvatar $bg={testimonial.bg}>
                  {testimonial.initials}
                </TestimonialAvatar>
                <TestimonialInfo>
                  <TestimonialName>{testimonial.name}</TestimonialName>
                  <TestimonialRole>{testimonial.role}</TestimonialRole>
                </TestimonialInfo>
              </TestimonialAuthor>
            </TestimonialCard>
          ))}
        </TestimonialsTrack>
      </TestimonialsSection>

      {/* Pricing Section */}
      <PricingSection id="pricing">
        <PricingContainer>
          <SectionHeader>
            <SectionBadge>
              <Sparkles size={16} />
              Pricing
            </SectionBadge>
            <SectionTitle>Simple, transparent pricing</SectionTitle>
            <SectionSubtitle>
              Choose the plan that's right for you. All plans include a 14-day free trial.
            </SectionSubtitle>
          </SectionHeader>
          <PricingGrid>
            <PricingCard>
              <PricingName>Starter</PricingName>
              <PricingDescription>Perfect for individuals and small creators</PricingDescription>
              <PricingPrice>
                <PriceAmount>$29</PriceAmount>
                <PricePeriod>/month</PricePeriod>
              </PricingPrice>
              <PricingFeatures>
                <PricingFeature><Check size={18} color="#10b981" /> 5 social accounts</PricingFeature>
                <PricingFeature><Check size={18} color="#10b981" /> 100 scheduled posts/month</PricingFeature>
                <PricingFeature><Check size={18} color="#10b981" /> Basic analytics</PricingFeature>
                <PricingFeature><Check size={18} color="#10b981" /> 1 user</PricingFeature>
                <PricingFeature><Check size={18} color="#10b981" /> Email support</PricingFeature>
              </PricingFeatures>
              <PricingButton href="/register">Get Started</PricingButton>
            </PricingCard>
            <PricingCard $featured>
              <PricingBadge>Most Popular</PricingBadge>
              <PricingName $featured>Pro</PricingName>
              <PricingDescription $featured>For growing businesses and teams</PricingDescription>
              <PricingPrice>
                <PriceAmount $featured>$79</PriceAmount>
                <PricePeriod $featured>/month</PricePeriod>
              </PricingPrice>
              <PricingFeatures>
                <PricingFeature $featured><Check size={18} color="#86efac" /> 15 social accounts</PricingFeature>
                <PricingFeature $featured><Check size={18} color="#86efac" /> Unlimited scheduled posts</PricingFeature>
                <PricingFeature $featured><Check size={18} color="#86efac" /> Advanced analytics</PricingFeature>
                <PricingFeature $featured><Check size={18} color="#86efac" /> Up to 5 users</PricingFeature>
                <PricingFeature $featured><Check size={18} color="#86efac" /> Priority chat support</PricingFeature>
                <PricingFeature $featured><Check size={18} color="#86efac" /> AI content suggestions</PricingFeature>
              </PricingFeatures>
              <PricingButton href="/register" $featured>Get Started</PricingButton>
            </PricingCard>
            <PricingCard>
              <PricingName>Enterprise</PricingName>
              <PricingDescription>For large teams and agencies</PricingDescription>
              <PricingPrice>
                <PriceAmount>Custom</PriceAmount>
              </PricingPrice>
              <PricingFeatures>
                <PricingFeature><Check size={18} color="#10b981" /> Unlimited social accounts</PricingFeature>
                <PricingFeature><Check size={18} color="#10b981" /> Unlimited scheduled posts</PricingFeature>
                <PricingFeature><Check size={18} color="#10b981" /> Custom analytics & reports</PricingFeature>
                <PricingFeature><Check size={18} color="#10b981" /> Unlimited users</PricingFeature>
                <PricingFeature><Check size={18} color="#10b981" /> Dedicated account manager</PricingFeature>
                <PricingFeature><Check size={18} color="#10b981" /> Custom integrations</PricingFeature>
              </PricingFeatures>
              <PricingButton href="/contact">Contact Sales</PricingButton>
            </PricingCard>
          </PricingGrid>
        </PricingContainer>
      </PricingSection>

      {/* FAQ Section */}
      <FAQSection id="faq">
        <FAQContainer>
          <SectionHeader>
            <SectionBadge>
              <MessageCircle size={16} />
              FAQ
            </SectionBadge>
            <SectionTitle>Frequently asked questions</SectionTitle>
            <SectionSubtitle>
              Got questions? We've got answers. If you can't find what you're looking for, reach out to our support team.
            </SectionSubtitle>
          </SectionHeader>
          {faqs.map((faq, index) => (
            <FAQItem key={index}>
              <FAQQuestion onClick={() => setOpenFAQ(openFAQ === index ? null : index)}>
                {faq.question}
                <ChevronDown
                  size={20}
                  style={{
                    transform: openFAQ === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
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

      {/* CTA Section */}
      <CTASection>
        <CTAContainer>
          <CTATitle>Ready to grow your social presence?</CTATitle>
          <CTAText>
            Join 2,500+ businesses already using SocialHub to save time and grow their audience.
          </CTAText>
          <CTAButtons>
            <CTAButton href="/register" $variant="white">
              Start Free Trial <ArrowRight size={20} />
            </CTAButton>
            <CTAButton href="/demo" $variant="outline">
              Book a Demo
            </CTAButton>
          </CTAButtons>
        </CTAContainer>
      </CTASection>

      {/* Footer */}
      <MarketingFooter />
    </LandingPage>
  );
}
