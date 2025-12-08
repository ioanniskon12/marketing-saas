/**
 * Spinner Component
 *
 * Minimal loading with workspace logo.
 */

'use client';

import styled, { keyframes } from 'styled-components';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.95); }
`;

const SpinnerContainer = styled.div`
  display: ${props => props.$fullScreen ? 'flex' : 'inline-flex'};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.md};

  ${props => props.$fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    background: ${props.theme.colors.background.default};
    z-index: 9999;
  `}
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const LogoImage = styled.img`
  width: ${props => props.$size === 'sm' ? '32px' : props.$size === 'lg' ? '48px' : '40px'};
  height: ${props => props.$size === 'sm' ? '32px' : props.$size === 'lg' ? '48px' : '40px'};
  border-radius: 10px;
  object-fit: contain;
`;

const FallbackLogo = styled.div`
  width: ${props => props.$size === 'sm' ? '32px' : props.$size === 'lg' ? '48px' : '40px'};
  height: ${props => props.$size === 'sm' ? '32px' : props.$size === 'lg' ? '48px' : '40px'};
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-size: ${props => props.$size === 'sm' ? '12px' : props.$size === 'lg' ? '18px' : '14px'};
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.5px;
`;

const Label = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

/**
 * Spinner Component
 */
export default function Spinner({
  size = 'md',
  label,
  fullScreen = false,
}) {
  const { currentWorkspace } = useWorkspace();
  const logoUrl = currentWorkspace?.logo_url;

  return (
    <SpinnerContainer $fullScreen={fullScreen}>
      <LogoWrapper>
        {logoUrl ? (
          <LogoImage
            src={logoUrl}
            alt="Loading"
            $size={size}
          />
        ) : (
          <FallbackLogo $size={size} role="status" aria-label={label || 'Loading'}>
            SH
          </FallbackLogo>
        )}
      </LogoWrapper>
      {label && <Label>{label}</Label>}
    </SpinnerContainer>
  );
}

// Convenience component for full-page loading
export function PageSpinner({ label = 'Loading...' }) {
  const { currentWorkspace } = useWorkspace();
  const logoUrl = currentWorkspace?.logo_url;

  return (
    <SpinnerContainer $fullScreen={true}>
      <LogoWrapper>
        {logoUrl ? (
          <LogoImage
            src={logoUrl}
            alt="Loading"
            $size="lg"
          />
        ) : (
          <FallbackLogo $size="lg" role="status" aria-label={label}>
            SH
          </FallbackLogo>
        )}
      </LogoWrapper>
      <Label>{label}</Label>
    </SpinnerContainer>
  );
}
