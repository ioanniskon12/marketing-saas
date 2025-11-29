/**
 * LoadingPage Component
 *
 * Full-page loading screen with different designs for dark and light modes.
 * Features animated logo and modern gradient backgrounds.
 */

'use client';

import styled, { keyframes } from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';

// Animations
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

// Light Mode Styles
const LightModeContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg,
    ${props => props.theme.colors.primary.main} 0%,
    ${props => props.theme.colors.secondary.main} 50%,
    ${props => props.theme.colors.primary.light} 100%
  );
  background-size: 200% 200%;
  animation: ${shimmer} 3s ease-in-out infinite;
  z-index: ${props => props.theme.zIndex.modal};
`;

// Dark Mode Styles
const DarkModeContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background.dark};
  overflow: hidden;
  z-index: ${props => props.theme.zIndex.modal};

  /* Animated background gradient */
  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle at 20% 50%,
      ${props => props.theme.colors.primary.main}20 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 80%,
      ${props => props.theme.colors.secondary.main}20 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 40% 20%,
      ${props => props.theme.colors.primary.dark}15 0%,
      transparent 50%
    );
    animation: ${float} 8s ease-in-out infinite;
  }
`;

// Logo Container
const LogoContainer = styled.div`
  position: relative;
  animation: ${fadeIn} 0.5s ease-in-out;
  z-index: 1;
`;

// Logo Circle (Light Mode)
const LightLogoCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${pulse} 2s ease-in-out infinite;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

// Logo Circle (Dark Mode)
const DarkLogoCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${props => props.theme.colors.primary.main},
    ${props => props.theme.colors.secondary.main}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 60px ${props => props.theme.colors.primary.main}40,
    0 0 100px ${props => props.theme.colors.secondary.main}20;
  animation: ${pulse} 2s ease-in-out infinite;
  margin-bottom: ${props => props.theme.spacing.xl};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      ${props => props.theme.colors.primary.light},
      ${props => props.theme.colors.secondary.light}
    );
    opacity: 0.5;
    filter: blur(20px);
    animation: ${spin} 3s linear infinite;
  }
`;

// Inner Logo Icon
const LogoIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.95)'
    : `linear-gradient(135deg, ${props.theme.colors.primary.main}, ${props.theme.colors.secondary.main})`
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.$isDark
    ? props.theme.colors.primary.main
    : '#ffffff'
  };
  position: relative;
  z-index: 1;
`;

// Loading Text
const LoadingText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.$isDark
    ? props.theme.colors.text.primary
    : '#ffffff'
  };
  margin-bottom: ${props => props.theme.spacing.lg};
  animation: ${fadeIn} 0.5s ease-in-out 0.2s both;
  z-index: 1;
`;

// Spinner Container
const SpinnerContainer = styled.div`
  width: 50px;
  height: 50px;
  position: relative;
  animation: ${fadeIn} 0.5s ease-in-out 0.4s both;
  z-index: 1;
`;

// Spinner Ring
const SpinnerRing = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid ${props => props.$isDark
    ? `${props.theme.colors.primary.main}30`
    : 'rgba(255, 255, 255, 0.3)'
  };
  border-top-color: ${props => props.$isDark
    ? props.theme.colors.primary.main
    : '#ffffff'
  };
  animation: ${spin} 1s linear infinite;
`;

// Secondary Spinner Ring
const SecondaryRing = styled(SpinnerRing)`
  border-top-color: ${props => props.$isDark
    ? props.theme.colors.secondary.main
    : 'rgba(255, 255, 255, 0.5)'
  };
  animation: ${spin} 1.5s linear infinite reverse;
  width: 70%;
  height: 70%;
  top: 15%;
  left: 15%;
`;

// Dots Container (Light Mode)
const DotsContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.lg};
  z-index: 1;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  animation: ${pulse} 1.4s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
`;

/**
 * LoadingPage Component
 */
export default function LoadingPage({ message = 'Loading...' }) {
  const { isDarkMode } = useTheme();

  if (isDarkMode) {
    return (
      <DarkModeContainer>
        <LogoContainer>
          <DarkLogoCircle>
            <LogoIcon $isDark={true}>S</LogoIcon>
          </DarkLogoCircle>
        </LogoContainer>

        <LoadingText $isDark={true}>{message}</LoadingText>

        <SpinnerContainer>
          <SpinnerRing $isDark={true} />
          <SecondaryRing $isDark={true} />
        </SpinnerContainer>
      </DarkModeContainer>
    );
  }

  return (
    <LightModeContainer>
      <LogoContainer>
        <LightLogoCircle>
          <LogoIcon $isDark={false}>S</LogoIcon>
        </LightLogoCircle>
      </LogoContainer>

      <LoadingText $isDark={false}>{message}</LoadingText>

      <SpinnerContainer>
        <SpinnerRing $isDark={false} />
        <SecondaryRing $isDark={false} />
      </SpinnerContainer>

      <DotsContainer>
        <Dot $delay={0} />
        <Dot $delay={0.2} />
        <Dot $delay={0.4} />
      </DotsContainer>
    </LightModeContainer>
  );
}
