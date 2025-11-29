/**
 * Spinner Component
 *
 * Modern loading spinner with gradient colors and animations.
 */

'use client';

import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const SpinnerContainer = styled.div`
  display: ${props => props.$fullScreen ? 'flex' : 'inline-flex'};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.lg};

  ${props => props.$fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    background: ${props.theme.colors.background.default};
    background-image: linear-gradient(135deg,
      ${props.theme.colors.background.default} 0%,
      ${props.theme.colors.primary.main}08 50%,
      ${props.theme.colors.background.default} 100%
    );
    backdrop-filter: blur(10px);
    z-index: 9999;
  `}
`;

const SpinnerWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const StyledSpinner = styled.div`
  position: relative;
  display: inline-block;
  border-radius: 50%;
  animation: ${spin} 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;

  /* Size variants */
  ${props => props.$size === 'xs' && `
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
  `}

  ${props => props.$size === 'sm' && `
    width: 24px;
    height: 24px;
    border: 2px solid transparent;
  `}

  ${props => props.$size === 'md' && `
    width: 32px;
    height: 32px;
    border: 3px solid transparent;
  `}

  ${props => props.$size === 'lg' && `
    width: 64px;
    height: 64px;
    border: 4px solid transparent;
  `}

  ${props => props.$size === 'xl' && `
    width: 80px;
    height: 80px;
    border: 5px solid transparent;
  `}

  /* Gradient border */
  background: linear-gradient(${props => props.theme.colors.background.paper}, ${props => props.theme.colors.background.paper}) padding-box,
              linear-gradient(135deg,
                ${props => props.theme.colors.primary.main},
                ${props => props.theme.colors.primary.light},
                #9333EA,
                #F59E0B
              ) border-box;
  box-shadow: 0 0 20px ${props => props.theme.colors.primary.main}40;
`;

const InnerCircle = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  border-radius: 50%;
  background: linear-gradient(135deg,
    ${props => props.theme.colors.primary.main}40,
    ${props => props.theme.colors.primary.light}40
  );
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const Dots = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  animation: ${float} 2s ease-in-out infinite;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg,
    ${props => props.theme.colors.primary.main},
    ${props => props.theme.colors.primary.light}
  );
  animation: ${pulse} 1.5s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
`;

const Label = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  background: linear-gradient(135deg,
    ${props => props.theme.colors.primary.main},
    ${props => props.theme.colors.primary.light},
    #9333EA
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const SubLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-top: ${props => props.theme.spacing.xs};
`;

/**
 * Spinner Component
 */
export default function Spinner({
  size = 'md',
  variant = 'primary',
  label,
  fullScreen = false,
}) {
  return (
    <SpinnerContainer $fullScreen={fullScreen}>
      <SpinnerWrapper>
        <StyledSpinner
          $size={size}
          $variant={variant}
          role="status"
          aria-label={label || 'Loading'}
        >
          <InnerCircle />
        </StyledSpinner>
      </SpinnerWrapper>
      {label && (
        <div style={{ textAlign: 'center' }}>
          <Label>{label}</Label>
          <Dots>
            <Dot $delay={0} />
            <Dot $delay={0.2} />
            <Dot $delay={0.4} />
          </Dots>
        </div>
      )}
    </SpinnerContainer>
  );
}

// Convenience component for full-page loading
export function PageSpinner({ label = 'Loading your workspace', subLabel }) {
  return (
    <SpinnerContainer $fullScreen={true}>
      <SpinnerWrapper>
        <StyledSpinner $size="xl" role="status" aria-label={label}>
          <InnerCircle />
        </StyledSpinner>
      </SpinnerWrapper>
      <div style={{ textAlign: 'center' }}>
        <Label>{label}</Label>
        {subLabel && <SubLabel>{subLabel}</SubLabel>}
        <Dots>
          <Dot $delay={0} />
          <Dot $delay={0.2} />
          <Dot $delay={0.4} />
        </Dots>
      </div>
    </SpinnerContainer>
  );
}
