'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { Instagram, Twitter, Facebook, Linkedin, Youtube, Mail, MapPin, Phone, Heart } from 'lucide-react';

const FooterWrapper = styled.footer`
  background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
  color: white;
`;

const FooterCTA = styled.div`
  padding: 60px 24px;
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const FooterCTAContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const FooterCTAContent = styled.div``;

const FooterCTATitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
`;

const FooterCTAText = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`;

const NewsletterForm = styled.form`
  display: flex;
  gap: 12px;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
  }
`;

const NewsletterInput = styled.input`
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 14px;
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

  @media (max-width: 480px) {
    min-width: 100%;
  }
`;

const NewsletterButton = styled.button`
  padding: 14px 28px;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(255, 140, 66, 0.4);
  }
`;

const FooterMain = styled.div`
  padding: 60px 24px;
`;

const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr repeat(4, 1fr);
  gap: 48px;
  margin-bottom: 48px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FooterBrand = styled.div`
  @media (max-width: 1024px) {
    grid-column: 1 / -1;
    margin-bottom: 16px;
  }
`;

const FooterLogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const FooterLogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
`;

const FooterLogo = styled.div`
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff8c42, #ff6b35, #e67a35);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const FooterTagline = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
  max-width: 300px;
  margin-bottom: 24px;
`;

const FooterSocialLinks = styled.div`
  display: flex;
  gap: 12px;
`;

const SocialLink = styled.a`
  width: 36px;
  height: 36px;
  border-radius: 10px;
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

const FooterColumn = styled.div``;

const FooterTitle = styled.h4`
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const FooterLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-bottom: 12px;
  padding: 4px 0;
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    color: #ffb380;
    transform: translateX(4px);
  }
`;

const FooterContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  background: rgba(0, 0, 0, 0.2);
`;

const FooterBottomContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FooterCopyright = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FooterBottomLinks = styled.div`
  display: flex;
  gap: 32px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const FooterBottomLink = styled(Link)`
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  transition: color 0.2s ease;
  text-decoration: none;

  &:hover {
    color: white;
  }
`;

export default function MarketingFooter() {
  return (
    <FooterWrapper>
      <FooterCTA>
        <FooterCTAContainer>
          <FooterCTAContent>
            <FooterCTATitle>Ready to grow your social presence?</FooterCTATitle>
            <FooterCTAText>Join thousands of marketers who trust SocialHub</FooterCTAText>
          </FooterCTAContent>
          <NewsletterForm onSubmit={(e) => e.preventDefault()}>
            <NewsletterInput type="email" placeholder="Enter your email" />
            <NewsletterButton type="submit">Subscribe</NewsletterButton>
          </NewsletterForm>
        </FooterCTAContainer>
      </FooterCTA>

      <FooterMain>
        <FooterContainer>
          <FooterGrid>
            <FooterBrand>
              <FooterLogoContainer>
                <FooterLogoIcon>S</FooterLogoIcon>
                <FooterLogo>SocialHub</FooterLogo>
              </FooterLogoContainer>
              <FooterTagline>
                The all-in-one social media management platform for modern teams. Schedule, analyze, and grow your presence.
              </FooterTagline>
              <FooterSocialLinks>
                <SocialLink href="#" aria-label="Twitter"><Twitter size={18} /></SocialLink>
                <SocialLink href="#" aria-label="Instagram"><Instagram size={18} /></SocialLink>
                <SocialLink href="#" aria-label="Facebook"><Facebook size={18} /></SocialLink>
                <SocialLink href="#" aria-label="LinkedIn"><Linkedin size={18} /></SocialLink>
                <SocialLink href="#" aria-label="YouTube"><Youtube size={18} /></SocialLink>
              </FooterSocialLinks>
            </FooterBrand>
            <FooterColumn>
              <FooterTitle>Product</FooterTitle>
              <FooterLink href="/features">Features</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/demo">Demo</FooterLink>
              <FooterLink href="/register">Start Free Trial</FooterLink>
            </FooterColumn>
            <FooterColumn>
              <FooterTitle>Company</FooterTitle>
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </FooterColumn>
            <FooterColumn>
              <FooterTitle>Legal</FooterTitle>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/cookies">Cookie Policy</FooterLink>
              <FooterLink href="/security">Security</FooterLink>
              <FooterLink href="/gdpr">GDPR</FooterLink>
            </FooterColumn>
            <FooterColumn>
              <FooterTitle>Contact</FooterTitle>
              <FooterContactItem>
                <Mail size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>hello@socialhub.com</span>
              </FooterContactItem>
              <FooterContactItem>
                <Phone size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>+1 (555) 123-4567</span>
              </FooterContactItem>
              <FooterContactItem>
                <MapPin size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>San Francisco, CA<br />United States</span>
              </FooterContactItem>
            </FooterColumn>
          </FooterGrid>
        </FooterContainer>
      </FooterMain>

      <FooterBottom>
        <FooterBottomContainer>
          <FooterCopyright>
            &copy; {new Date().getFullYear()} SocialHub. Made with <Heart size={14} fill="#ef4444" color="#ef4444" /> by SocialHub Team
          </FooterCopyright>
        </FooterBottomContainer>
      </FooterBottom>
    </FooterWrapper>
  );
}
