/**
 * Loading Demo Page
 *
 * Demo page to showcase the loading screen in both dark and light modes.
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import LoadingPage from '../../components/ui/LoadingPage';
import { useTheme } from '../../contexts/ThemeContext';

const DemoContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background.default};
  padding: ${props => props.theme.spacing['2xl']};
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto ${props => props.theme.spacing['2xl']};
  text-align: center;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Description = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ControlsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto ${props => props.theme.spacing['2xl']};
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => props.$variant === 'primary'
    ? props.theme.colors.primary.main
    : props.theme.colors.neutral[200]
  };
  color: ${props => props.$variant === 'primary'
    ? '#ffffff'
    : props.theme.colors.text.primary
  };
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.base};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

const PreviewGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: ${props => props.theme.spacing.xl};
`;

const PreviewCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.md};
`;

const PreviewTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
  text-align: center;
`;

const PreviewFrame = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  border: 2px solid ${props => props.theme.colors.neutral[300]};
`;

const InfoBox = styled.div`
  max-width: 1200px;
  margin: ${props => props.theme.spacing['2xl']} auto;
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  border-left: 4px solid ${props => props.theme.colors.primary.main};
`;

const InfoTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const InfoText = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const CodeBlock = styled.pre`
  background: ${props => props.theme.colors.neutral[100]};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow-x: auto;
  margin-top: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.typography.fontFamily.mono};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

export default function LoadingDemoPage() {
  const [showLoading, setShowLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const handleShowLoading = (duration = 3000) => {
    setShowLoading(true);
    setTimeout(() => setShowLoading(false), duration);
  };

  return (
    <>
      <DemoContainer>
        <Header>
          <Title>Loading Page Demo</Title>
          <Description>
            Beautiful loading screens with different designs for dark and light modes.
            Toggle the theme to see both versions.
          </Description>
        </Header>

        <ControlsContainer>
          <Button $variant="primary" onClick={() => handleShowLoading(3000)}>
            Show Loading (3s)
          </Button>
          <Button onClick={toggleTheme}>
            Toggle Theme (Current: {isDarkMode ? 'Dark' : 'Light'})
          </Button>
        </ControlsContainer>

        <PreviewGrid>
          <PreviewCard>
            <PreviewTitle>Light Mode Preview</PreviewTitle>
            <PreviewFrame>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #34d399 100%)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.875rem',
                    fontWeight: '700',
                    color: '#ffffff'
                  }}>S</div>
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '1.5rem'
                }}>Loading...</div>
              </div>
            </PreviewFrame>
          </PreviewCard>

          <PreviewCard>
            <PreviewTitle>Dark Mode Preview</PreviewTitle>
            <PreviewFrame>
              <div style={{
                background: '#020617',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  width: '200%',
                  height: '200%',
                  background: `
                    radial-gradient(circle at 20% 50%, #6366f120 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, #8b5cf620 0%, transparent 50%),
                    radial-gradient(circle at 40% 20%, #4f46e515 0%, transparent 50%)
                  `
                }}></div>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 60px #6366f140, 0 0 100px #8b5cf620',
                  marginBottom: '2rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.875rem',
                    fontWeight: '700',
                    color: '#6366f1'
                  }}>S</div>
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#f1f5f9',
                  marginBottom: '1.5rem',
                  position: 'relative',
                  zIndex: 1
                }}>Loading...</div>
              </div>
            </PreviewFrame>
          </PreviewCard>
        </PreviewGrid>

        <InfoBox>
          <InfoTitle>How to Use</InfoTitle>
          <InfoText>
            <strong>1. Automatic Loading States (Next.js):</strong>
          </InfoText>
          <InfoText>
            The loading component is automatically used by Next.js when navigating between pages.
            The `app/loading.js` file is already set up.
          </InfoText>

          <InfoText style={{ marginTop: '1rem' }}>
            <strong>2. Manual Usage:</strong>
          </InfoText>
          <CodeBlock>{`import LoadingPage from '@/components/ui/LoadingPage';

// In your component
const [isLoading, setIsLoading] = useState(false);

{isLoading && <LoadingPage message="Loading..." />}`}</CodeBlock>

          <InfoText style={{ marginTop: '1rem' }}>
            <strong>3. Custom Message:</strong>
          </InfoText>
          <CodeBlock>{`<LoadingPage message="Fetching your data..." />`}</CodeBlock>

          <InfoText style={{ marginTop: '1rem' }}>
            <strong>Features:</strong>
          </InfoText>
          <InfoText>• Automatically adapts to dark/light mode</InfoText>
          <InfoText>• Smooth animations and transitions</InfoText>
          <InfoText>• Gradient backgrounds with different colors per theme</InfoText>
          <InfoText>• Light mode: Green gradient with white logo circle</InfoText>
          <InfoText>• Dark mode: Dark background with glowing indigo/purple logo</InfoText>
        </InfoBox>
      </DemoContainer>

      {showLoading && <LoadingPage />}
    </>
  );
}
