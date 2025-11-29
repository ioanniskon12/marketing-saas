'use client';

import styled from 'styled-components';
import { Users } from 'lucide-react';

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

export default function Team() {
  return (
    <Container>
      <Title>Team</Title>
      <Card>
        <Users size={48} style={{ margin: '0 auto 1rem' }} />
        <h3>Team Management</h3>
        <p>Collaborate with your team members</p>
      </Card>
    </Container>
  );
}
