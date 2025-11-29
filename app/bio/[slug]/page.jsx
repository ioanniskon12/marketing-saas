/**
 * Public Link in Bio Page
 *
 * Customizable landing page for social media bio links.
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ExternalLink } from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.$bgColor || '#ffffff'};
  color: ${props => props.$textColor || '#000000'};
`;

const Content = styled.div`
  max-width: 600px;
  width: 100%;
  text-align: center;
`;

const Avatar = styled.div`
  width: 96px;
  height: 96px;
  margin: 0 auto ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$src ? `url(${props.$src})` : '#e5e7eb'};
  background-size: cover;
  background-position: center;
  box-shadow: ${props => props.theme.shadows.lg};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const Description = styled.p`
  font-size: ${props => props.theme.typography.fontSize.base};
  opacity: 0.8;
  margin: 0 0 ${props => props.theme.spacing.xl} 0;
  line-height: 1.6;
`;

const LinksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const LinkButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.$btnColor || '#000000'};
  color: ${props => props.$btnTextColor || '#ffffff'};
  border-radius: ${props => props.theme.borderRadius.full};
  text-decoration: none;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  transition: all ${props => props.theme.transitions.fast};
  box-shadow: ${props => props.theme.shadows.sm};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const Branding = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
  font-size: ${props => props.theme.typography.fontSize.xs};
  opacity: 0.5;

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};

  h2 {
    font-size: ${props => props.theme.typography.fontSize.xl};
    margin-bottom: ${props => props.theme.spacing.md};
  }
`;

export default function BioPage({ params }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPage();
  }, [params.slug]);

  const loadPage = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/bio?slug=${params.slug}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Page not found');
      }

      setPage(data.page);
    } catch (err) {
      console.error('Error loading bio page:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (linkId) => {
    // Track click
    try {
      await fetch(`/api/bio/links/${linkId}/click`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Error tracking click:', err);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>Loading...</LoadingState>
      </Container>
    );
  }

  if (error || !page) {
    return (
      <Container>
        <ErrorState>
          <h2>Page Not Found</h2>
          <p>The link in bio page you're looking for doesn't exist.</p>
        </ErrorState>
      </Container>
    );
  }

  return (
    <Container
      $bgColor={page.background_color}
      $textColor={page.text_color}
    >
      <Content>
        {page.avatar_url && <Avatar $src={page.avatar_url} />}

        <Title>{page.title}</Title>

        {page.description && (
          <Description>{page.description}</Description>
        )}

        <LinksList>
          {page.bio_links?.filter(link => link.is_active).map(link => (
            <LinkButton
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              $btnColor={page.button_color}
              $btnTextColor={page.button_text_color}
              onClick={() => handleLinkClick(link.id)}
            >
              {link.title}
              <ExternalLink size={16} />
            </LinkButton>
          ))}
        </LinksList>

        {page.show_branding && (
          <Branding>
            Created with <a href="https://yoursaas.com" target="_blank" rel="noopener">YourSaaS</a>
          </Branding>
        )}
      </Content>
    </Container>
  );
}
