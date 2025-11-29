/**
 * Layout Demo Page
 * Showcases the three different layout options for the post composer
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Columns2, Square, Rows2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Container = styled.div`
  padding: ${props => props.theme.spacing.xl};
  max-width: 1800px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: transparent;
  border: 1px solid ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  margin-bottom: ${props => props.theme.spacing.lg};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
    border-color: ${props => props.theme.colors.primary.main};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const LayoutSwitcher = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  width: fit-content;
`;

const LayoutButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.$active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.secondary};
  border: 2px solid ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  min-width: 120px;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[100]};
    border-color: ${props => props.theme.colors.primary.main};
    color: ${props => props.$active ? 'white' : props.theme.colors.text.primary};
  }

  svg {
    width: 32px;
    height: 32px;
  }
`;

const LayoutName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const LayoutDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  opacity: 0.8;
`;

const DemoContainer = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  min-height: 600px;
`;

// Layout demonstrations
const SideBySideDemo = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: ${props => props.theme.spacing.xl};
  height: 100%;
`;

const FullWidthDemo = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: ${props => props.theme.spacing.md};
  height: 100%;
`;

const StackedDemo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
  height: 100%;
`;

const ComposerMock = styled.div`
  background: ${props => props.theme.colors.neutral[50]};
  border: 2px dashed ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  min-height: 400px;
`;

const PreviewMock = styled.div`
  background: ${props => props.theme.colors.neutral[50]};
  border: 2px dashed ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${props => props.$stacked ? '300px' : '400px'};
  color: ${props => props.theme.colors.primary.main};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const MockLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const MockInput = styled.div`
  background: white;
  border: 1px solid ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  min-height: ${props => props.$large ? '120px' : '40px'};
`;

const MockButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: auto;
`;

const MockButton = styled.div`
  background: ${props => props.$primary ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  color: ${props => props.$primary ? 'white' : props.theme.colors.text.primary};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-align: center;
`;

export default function LayoutDemoPage() {
  const router = useRouter();
  const [activeLayout, setActiveLayout] = useState('side-by-side');

  const renderLayout = () => {
    switch (activeLayout) {
      case 'side-by-side':
        return (
          <SideBySideDemo>
            <ComposerMock>
              <MockLabel>Composer Area</MockLabel>
              <MockInput />
              <MockInput $large />
              <MockInput />
              <MockButtons>
                <MockButton>Save Draft</MockButton>
                <MockButton $primary>Publish Now</MockButton>
              </MockButtons>
            </ComposerMock>
            <PreviewMock>Preview (400px wide)</PreviewMock>
          </SideBySideDemo>
        );

      case 'full-width':
        return (
          <FullWidthDemo>
            <ComposerMock>
              <MockLabel>Composer Area (Full Width)</MockLabel>
              <MockInput />
              <MockInput $large />
              <MockInput />
              <MockButtons>
                <MockButton>Save Draft</MockButton>
                <MockButton $primary>Publish Now</MockButton>
              </MockButtons>
            </ComposerMock>
            <PreviewMock>Preview (Collapsible)</PreviewMock>
          </FullWidthDemo>
        );

      case 'stacked':
        return (
          <StackedDemo>
            <ComposerMock>
              <MockLabel>Composer Area</MockLabel>
              <MockInput />
              <MockInput $large />
              <MockInput />
              <MockButtons>
                <MockButton>Save Draft</MockButton>
                <MockButton $primary>Publish Now</MockButton>
              </MockButtons>
            </ComposerMock>
            <PreviewMock $stacked>Preview (Below Composer)</PreviewMock>
          </StackedDemo>
        );

      default:
        return null;
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => router.push('/dashboard/create-post')}>
          <ArrowLeft />
          Back to Create Post
        </BackButton>

        <Title>Layout Demo</Title>
        <Subtitle>
          Choose your preferred layout for the post composer. Click on each option to preview.
        </Subtitle>

        <LayoutSwitcher>
          <LayoutButton
            $active={activeLayout === 'side-by-side'}
            onClick={() => setActiveLayout('side-by-side')}
          >
            <Columns2 />
            <LayoutName>Side by Side</LayoutName>
            <LayoutDescription>Classic two-column</LayoutDescription>
          </LayoutButton>

          <LayoutButton
            $active={activeLayout === 'full-width'}
            onClick={() => setActiveLayout('full-width')}
          >
            <Square />
            <LayoutName>Full Width</LayoutName>
            <LayoutDescription>Collapsible preview</LayoutDescription>
          </LayoutButton>

          <LayoutButton
            $active={activeLayout === 'stacked'}
            onClick={() => setActiveLayout('stacked')}
          >
            <Rows2 />
            <LayoutName>Stacked</LayoutName>
            <LayoutDescription>Vertical layout</LayoutDescription>
          </LayoutButton>
        </LayoutSwitcher>
      </Header>

      <DemoContainer>
        {renderLayout()}
      </DemoContainer>
    </Container>
  );
}
