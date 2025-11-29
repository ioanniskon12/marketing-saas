/**
 * Metrics Card Component
 *
 * Display individual analytics metrics with trend indicators.
 */

'use client';

import styled from 'styled-components';
import { TrendingUp, TrendingDown } from 'lucide-react';

const Card = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all ${props => props.theme.transitions.normal};

  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$color ? `${props.$color}15` : props.theme.colors.primary.light};
  color: ${props => props.$color || props.theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Value = styled.div`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
  line-height: 1.2;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const Change = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => {
    if (props.$trend === 'up') return props.theme.colors.success.main;
    if (props.$trend === 'down') return props.theme.colors.error.main;
    return props.theme.colors.text.secondary;
  }};
`;

const ChangeText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.normal};
`;

/**
 * Format large numbers with K, M, B suffixes
 */
function formatNumber(num) {
  if (num === null || num === undefined) return '0';

  const absNum = Math.abs(num);

  if (absNum >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (absNum >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (absNum >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }

  return num.toString();
}

/**
 * Format percentage value
 */
function formatPercentage(value) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  const absValue = Math.abs(value);
  return absValue.toFixed(1) + '%';
}

export default function MetricsCard({
  title,
  value,
  change = null,
  icon: Icon,
  color,
  suffix = '',
  format = 'number', // 'number', 'percentage', 'currency'
  changeLabel = 'vs last period',
}) {
  // Determine trend direction
  const trend = change === null || change === 0
    ? 'neutral'
    : change > 0
    ? 'up'
    : 'down';

  // Format the main value based on type
  const formattedValue = format === 'percentage'
    ? formatPercentage(value)
    : format === 'currency'
    ? '$' + formatNumber(value)
    : formatNumber(value) + suffix;

  // Format the change value
  const formattedChange = change !== null
    ? (change > 0 ? '+' : '') + formatPercentage(change)
    : null;

  return (
    <Card>
      <Header>
        <Title>{title}</Title>
        {Icon && (
          <IconContainer $color={color}>
            <Icon size={20} />
          </IconContainer>
        )}
      </Header>

      <Value>{formattedValue}</Value>

      {formattedChange !== null && (
        <Footer>
          <Change $trend={trend}>
            {trend === 'up' && <TrendingUp size={16} />}
            {trend === 'down' && <TrendingDown size={16} />}
            {formattedChange}
          </Change>
          <ChangeText>{changeLabel}</ChangeText>
        </Footer>
      )}
    </Card>
  );
}
