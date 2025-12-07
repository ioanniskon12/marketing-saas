'use client';

import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 48px;
  background: ${props => props.$scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(20px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: ${props => props.$scrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)'};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 16px 24px;
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
  gap: 12px;
  text-decoration: none;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
`;

const Logo = styled.span`
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
  background-size: 200% 200%;
  animation: ${gradientMove} 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: #64748b;
  font-weight: 500;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    color: #6366f1;
    background: rgba(99, 102, 241, 0.08);
  }
`;

const NavButtons = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const LoginButton = styled(Link)`
  color: #475569;
  font-weight: 500;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 10px;
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    color: #6366f1;
    background: rgba(99, 102, 241, 0.08);
  }
`;

const CTAButton = styled(Link)`
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 24px;
  border-radius: 10px;
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  color: #0f172a;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(99, 102, 241, 0.08);
  }

  @media (max-width: 1024px) {
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
  padding: 24px;
  flex-direction: column;
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;

  @media (max-width: 1024px) {
    display: flex;
  }
`;

const MobileMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;
`;

const MobileMenuLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MobileNavLink = styled(Link)`
  color: #0f172a;
  font-weight: 500;
  font-size: 18px;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    background: rgba(99, 102, 241, 0.08);
    color: #6366f1;
  }
`;

const MobileMenuButtons = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MobileLoginButton = styled(Link)`
  color: #475569;
  font-weight: 600;
  font-size: 16px;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    border-color: #6366f1;
    color: #6366f1;
  }
`;

const MobileCTAButton = styled(Link)`
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-weight: 600;
  font-size: 16px;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  text-decoration: none;
`;

export default function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Nav $scrolled={scrolled}>
        <NavContainer>
          <LogoLink href="/">
            <LogoIcon>S</LogoIcon>
            <Logo>SocialHub</Logo>
          </LogoLink>
          <NavLinks>
            <NavLink href="/features">Features</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
            <NavLink href="/demo">Demo</NavLink>
            <NavLink href="/blog">Blog</NavLink>
          </NavLinks>
          <NavButtons>
            <LoginButton href="/login">Log in</LoginButton>
            <CTAButton href="/register">Start Free Trial</CTAButton>
          </NavButtons>
          <MobileMenuButton onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </MobileMenuButton>
        </NavContainer>
      </Nav>

      <MobileMenu $isOpen={mobileMenuOpen}>
        <MobileMenuHeader>
          <LogoLink href="/" onClick={() => setMobileMenuOpen(false)}>
            <LogoIcon>S</LogoIcon>
            <Logo>SocialHub</Logo>
          </LogoLink>
          <MobileMenuButton onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </MobileMenuButton>
        </MobileMenuHeader>
        <MobileMenuLinks>
          <MobileNavLink href="/features" onClick={() => setMobileMenuOpen(false)}>Features</MobileNavLink>
          <MobileNavLink href="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</MobileNavLink>
          <MobileNavLink href="/demo" onClick={() => setMobileMenuOpen(false)}>Demo</MobileNavLink>
          <MobileNavLink href="/blog" onClick={() => setMobileMenuOpen(false)}>Blog</MobileNavLink>
        </MobileMenuLinks>
        <MobileMenuButtons>
          <MobileLoginButton href="/login" onClick={() => setMobileMenuOpen(false)}>Log in</MobileLoginButton>
          <MobileCTAButton href="/register" onClick={() => setMobileMenuOpen(false)}>Start Free Trial</MobileCTAButton>
        </MobileMenuButtons>
      </MobileMenu>
    </>
  );
}
