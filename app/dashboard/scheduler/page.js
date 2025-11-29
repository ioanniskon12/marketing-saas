'use client';

import styled from 'styled-components';
import { Clock } from 'lucide-react';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Card = styled.div`
  background: ${props => props.theme.colors.background.paper};
  padding: ${props => props.theme.spacing['2xl']};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.sm};
  text-align: center;
`;

export default function Scheduler() {
  return (
    <Container>
      <Title>Scheduler</Title>
      <Card>
        <Clock size={48} style={{ margin: '0 auto 1rem' }} />
        <h3>Post Scheduler</h3>
        <p>Schedule your posts across multiple platforms</p>
      </Card>
    </Container>
  );
}
