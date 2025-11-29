/**
 * Followers Chart Component
 *
 * Display analytics metrics over time using Recharts.
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ChartContainer = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const MetricSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const MetricButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.background.paper};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.$active ? props.theme.colors.primary.dark : props.theme.colors.primary.light};
    color: ${props => props.$active ? 'white' : props.theme.colors.primary.main};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl} 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const TooltipContainer = styled.div`
  background: ${props => props.theme.colors.background.paper};
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const TooltipLabel = styled.p`
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const TooltipValue = styled.p`
  margin: 4px 0;
  font-size: 12px;
  color: ${props => props.color};
  font-weight: 500;
`;

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <TooltipContainer>
        <TooltipLabel>{label}</TooltipLabel>
        {payload.map((entry, index) => (
          <TooltipValue key={index} color={entry.color}>
            {entry.name}: {formatValue(entry.value, entry.dataKey)}
          </TooltipValue>
        ))}
      </TooltipContainer>
    );
  }
  return null;
};

// Format values based on metric type
function formatValue(value, metricKey) {
  if (metricKey === 'engagementRate') {
    return value.toFixed(2) + '%';
  }

  const absValue = Math.abs(value);

  if (absValue >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (absValue >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }

  return value.toLocaleString();
}

// Format date for x-axis
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const METRICS_CONFIG = {
  followers: {
    label: 'Followers',
    color: '#6366f1',
    dataKey: 'followers',
  },
  engagement: {
    label: 'Engagement',
    color: '#10b981',
    dataKey: 'engagement',
  },
  reach: {
    label: 'Reach',
    color: '#f59e0b',
    dataKey: 'reach',
  },
  impressions: {
    label: 'Impressions',
    color: '#ec4899',
    dataKey: 'impressions',
  },
  engagementRate: {
    label: 'Engagement Rate',
    color: '#8b5cf6',
    dataKey: 'engagementRate',
  },
};

export default function FollowersChart({
  data = [],
  title = 'Analytics Over Time',
  defaultMetric = 'followers',
  chartType = 'line', // 'line' or 'area'
  showMetricSelector = true,
}) {
  const [selectedMetric, setSelectedMetric] = useState(defaultMetric);

  if (!data || data.length === 0) {
    return (
      <ChartContainer>
        <Header>
          <Title>{title}</Title>
        </Header>
        <EmptyState>
          No data available for the selected period
        </EmptyState>
      </ChartContainer>
    );
  }

  const metricConfig = METRICS_CONFIG[selectedMetric];

  return (
    <ChartContainer>
      <Header>
        <Title>{title}</Title>
        {showMetricSelector && (
          <MetricSelector>
            {Object.entries(METRICS_CONFIG).map(([key, config]) => (
              <MetricButton
                key={key}
                $active={selectedMetric === key}
                onClick={() => setSelectedMetric(key)}
              >
                {config.label}
              </MetricButton>
            ))}
          </MetricSelector>
        )}
      </Header>

      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'area' ? (
          <AreaChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id={`color${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metricConfig.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={metricConfig.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              tickFormatter={(value) => formatValue(value, metricConfig.dataKey)}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={metricConfig.dataKey}
              name={metricConfig.label}
              stroke={metricConfig.color}
              strokeWidth={2}
              fill={`url(#color${selectedMetric})`}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        ) : (
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              tickFormatter={(value) => formatValue(value, metricConfig.dataKey)}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={metricConfig.dataKey}
              name={metricConfig.label}
              stroke={metricConfig.color}
              strokeWidth={2}
              dot={{ fill: metricConfig.color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </ChartContainer>
  );
}
